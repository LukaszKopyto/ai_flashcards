import validator from 'validator';

export interface SanitizationOptions {
  removeHtml?: boolean;
  removeControlChars?: boolean;
  normalizeWhitespace?: boolean;
  trim?: boolean;
}

const DEFAULT_OPTIONS: SanitizationOptions = {
  removeHtml: true,
  removeControlChars: true,
  normalizeWhitespace: true,
  trim: true,
};

/**
 * Sanitizes text input using configurable options
 * @param text - Input text to sanitize
 * @param options - Sanitization options
 * @returns Sanitized text
 */
export function sanitize(text: string, options: SanitizationOptions = DEFAULT_OPTIONS): string {
  let sanitized = text;

  if (options.removeHtml) {
    sanitized = validator.escape(sanitized);
  }

  if (options.removeControlChars) {
    sanitized = validator.stripLow(sanitized);
  }

  if (options.normalizeWhitespace) {
    sanitized = sanitized.replace(/\s+/g, ' ');
  }

  if (options.trim) {
    sanitized = sanitized.trim();
  }

  // Ensure valid UTF-8 encoding for PostgreSQL
  sanitized = Buffer.from(sanitized).toString('utf-8');

  return sanitized;
}

/**
 * Predefined sanitization for generation input
 * @param text - Input text to sanitize
 * @returns Sanitized text
 */
export function sanitizeGenerationInput(text: string): string {
  return sanitize(text, {
    removeHtml: true,
    removeControlChars: true,
    normalizeWhitespace: true,
    trim: true,
  });
}
