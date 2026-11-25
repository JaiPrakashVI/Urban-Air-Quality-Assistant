/**
 * Security & Input Sanitization Layer
 * Protects against XSS, script injection, and prompt injection attacks.
 */

// Basic HTML entity escaping
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

// Prompt Injection and Malicious Intent Detection
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /system\s+prompt/i,
  /you\s+are\s+now\s+a/i,
  /bypass\s+(safety|filter)/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /javascript:/i,
  /eval\(/i,
];

export interface ValidationResult {
  isValid: boolean;
  sanitizedText: string;
  warning?: string;
}

export function validateUserQuery(rawQuery: string, maxLength: number = 500): ValidationResult {
  if (!rawQuery || rawQuery.trim().length === 0) {
    return {
      isValid: false,
      sanitizedText: '',
      warning: 'Input cannot be empty.',
    };
  }

  if (rawQuery.length > maxLength) {
    return {
      isValid: false,
      sanitizedText: sanitizeInput(rawQuery.substring(0, maxLength)),
      warning: `Input exceeded maximum length of ${maxLength} characters. Truncated.`,
    };
  }

  // Check for adversarial prompt injection attempts
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(rawQuery)) {
      return {
        isValid: false,
        sanitizedText: sanitizeInput(rawQuery),
        warning: 'Input contains potentially unsafe instructions or formatting.',
      };
    }
  }

  return {
    isValid: true,
    sanitizedText: sanitizeInput(rawQuery),
  };
}
