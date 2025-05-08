import { getSecret } from 'astro:env/server';
import type { ModelConfig, APIResponse, ParsedResponse } from '@/types';
import { z } from 'zod';

interface OpenRouterServiceConfig {
  modelConfig: ModelConfig;
  systemMessage: string;
  retryOptions?: {
    maxRetries?: number;
    backoffBaseMs?: number;
  };
  timeoutMs?: number;
}

export class OpenRouterService {
  public currentModelConfig: ModelConfig;
  public lastAPIResponse?: APIResponse;

  private apiKey: string;
  private systemMessage: string;
  private apiClient: typeof fetch;
  private internalConfig: Record<string, unknown>;
  private retryOptions: { maxRetries: number; backoffBaseMs: number };
  private timeoutMs: number;

  constructor(config: OpenRouterServiceConfig) {
    this.apiKey = getSecret('OPENROUTER_API_KEY') || '';
    if (!this.apiKey) {
      throw new Error('Missing OPENROUTER_API_KEY environment variable');
    }
    this.currentModelConfig = config.modelConfig || {
      modelName: 'openai/gpt-4o-mini',
      parameters: {
        max_tokens: 1000,
        temperature: 0.7,
      },
    };
    this.systemMessage = config.systemMessage;
    this.apiClient = fetch;
    this.internalConfig = {};
    this.retryOptions = {
      maxRetries: config.retryOptions?.maxRetries ?? 3,
      backoffBaseMs: config.retryOptions?.backoffBaseMs ?? 100,
    };
    this.timeoutMs = config.timeoutMs ?? 5000;
  }

  async sendChatMessage(userMessage: string): Promise<APIResponse> {
    const payload = this.preparePayload(userMessage);
    const maxRetries = this.retryOptions.maxRetries;
    let lastError: Error | null = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await this.apiClient('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const rawResponse = await response.json();

      const parsedFlashcards = this.parseResponse(rawResponse);
      const apiResponse: APIResponse = { type: 'json_schema', data: parsedFlashcards };
      this.lastAPIResponse = apiResponse;
      return apiResponse;
    } catch (error: unknown) {
      lastError = error as Error;
      this.logError(error);
      throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
    }
  }

  setModelConfig(config: ModelConfig): void {
    this.currentModelConfig = config;
  }

  getLastResponse(): APIResponse | undefined {
    return this.lastAPIResponse;
  }

  private preparePayload(userMessage: string): Record<string, unknown> {
    const payload = {
      model: this.currentModelConfig.modelName,
      messages: [
        { role: 'system', content: this.systemMessage },
        { role: 'user', content: userMessage },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'flashcards',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              flashcards: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: {
                      type: 'string',
                      description: 'Title of the flashcard',
                    },
                    front: {
                      type: 'string',
                      description: 'Front side of the flashcard',
                    },
                    back: {
                      type: 'string',
                      description: 'Back side of the flashcard',
                    },
                    tags: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'List of tags for the flashcard',
                    },
                    relevance: {
                      type: 'number',
                      description: 'Relevance score of the flashcard',
                    },
                  },
                  required: ['title', 'front', 'back', 'tags', 'relevance'],
                  additionalProperties: false,
                },
              },
            },
            required: ['flashcards'],
            additionalProperties: false,
          },
        },
      },
      ...this.currentModelConfig.parameters,
    };
    return payload;
  }

  private parseResponse(rawResponse: Record<string, unknown>): ParsedResponse[] {
    const flashcardSchema = z.object({
      flashcards: z.array(
        z.object({
          title: z.string(),
          front: z.string(),
          back: z.string(),
          tags: z.array(z.string()),
          relevance: z.number(),
        })
      ),
    });

    try {
      const choices = rawResponse.choices as { message: { content: string } }[] | undefined;
      if (!choices?.[0]?.message?.content) {
        throw new Error('Invalid API response structure');
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(choices[0].message.content);
      } catch (_e) {
        throw new Error('Invalid JSON in API response content');
      }

      const validated = flashcardSchema.parse(parsedContent);
      return validated.flashcards;
    } catch (error) {
      this.logError(error);
      throw new Error('Invalid API response format');
    }
  }

  private logError(error: unknown): void {
    const errorMsg = (error as Error)?.message || 'Unknown error';
    if ((error as { name?: string })?.name === 'AbortError') {
      console.error(`[${new Date().toISOString()}] Request timed out: ${errorMsg}`);
    } else {
      console.error(`[${new Date().toISOString()}] OpenRouterService Error: ${errorMsg}`);
    }
  }
}
