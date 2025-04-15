# Text Sanitization Module

This module provides text sanitization utilities for the AI Flashcards application.

## Usage

```typescript
import { sanitize, sanitizeGenerationInput } from './lib/sanitization/text';

// Using predefined sanitization for generation input
const sanitizedText = sanitizeGenerationInput(userInput);

// Using custom sanitization options
const customSanitized = sanitize(userInput, {
  removeHtml: true,
  removeControlChars: true,
  normalizeWhitespace: false,
  trim: true,
});
```

## Available Options

- `removeHtml` - Escapes HTML entities to prevent XSS
- `removeControlChars` - Removes control characters
- `normalizeWhitespace` - Converts multiple whitespace characters to single space
- `trim` - Removes leading and trailing whitespace

## Available Functions

- `sanitize(text, options)` - Sanitizes text with configurable options
- `sanitizeGenerationInput(text)` - Applies all sanitization rules, suitable for generation API input
