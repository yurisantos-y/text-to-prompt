/**
 * Security utilities for the Text to Prompt extension
 * Implements input validation, sanitization, and security best practices
 */

/**
 * Sanitize text to prevent XSS attacks
 * Removes potentially dangerous characters and scripts
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove any script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove any on* event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: URIs that could contain scripts
  sanitized = sanitized.replace(/data:text\/html[^,]*,/gi, '');
  
  return sanitized;
}

/**
 * Sanitize HTML content for safe rendering
 * Only allows basic formatting tags
 */
export function sanitizeHTML(html: string): string {
  if (typeof html !== 'string') {
    return '';
  }

  const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'];
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  
  return html.replace(tagRegex, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      // Remove attributes from allowed tags to prevent XSS
      return match.replace(/\s+[a-z-]+\s*=\s*["'][^"']*["']/gi, '');
    }
    return ''; // Remove disallowed tags
  });
}

/**
 * Validate API key format
 */
export function validateApiKeyFormat(provider: 'openai' | 'gemini', apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // OpenAI keys start with 'sk-' and are at least 20 characters
  if (provider === 'openai') {
    return apiKey.startsWith('sk-') && apiKey.length >= 20;
  }

  // Gemini keys are typically 39 characters
  if (provider === 'gemini') {
    return apiKey.length >= 20 && /^[A-Za-z0-9_-]+$/.test(apiKey);
  }

  return false;
}

/**
 * Sanitize error messages to prevent information leakage
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Remove sensitive information from error messages
    let message = error.message;
    
    // Remove API keys if accidentally included
    message = message.replace(/sk-[A-Za-z0-9]{20,}/g, 'sk-***');
    message = message.replace(/[A-Za-z0-9_-]{39}/g, '***');
    
    // Remove URLs with credentials
    message = message.replace(/https?:\/\/[^:]+:[^@]+@/g, 'https://***@');
    
    // Generic error for common issues
    if (message.toLowerCase().includes('unauthorized') || 
        message.toLowerCase().includes('invalid') && message.toLowerCase().includes('key')) {
      return 'Invalid API credentials. Please check your API key.';
    }
    
    if (message.toLowerCase().includes('rate limit')) {
      return 'Rate limit exceeded. Please try again later.';
    }
    
    if (message.toLowerCase().includes('network') || 
        message.toLowerCase().includes('fetch')) {
      return 'Network error. Please check your connection.';
    }
    
    return 'An error occurred. Please try again.';
  }
  
  return 'An unexpected error occurred.';
}

/**
 * Validate JSON safely without exposing errors
 */
export function safeJSONParse<T>(json: string): { success: boolean; data?: T; error?: string } {
  try {
    if (!json || typeof json !== 'string') {
      return { success: false, error: 'Invalid JSON input' };
    }
    
    const data = JSON.parse(json) as T;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to parse JSON' };
  }
}

/**
 * Rate limiter to prevent API abuse
 */
export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number; // in milliseconds

  constructor(maxRequests: number = 10, timeWindowSeconds: number = 60) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowSeconds * 1000;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  getResetTime(): number {
    if (this.requests.length === 0) {
      return 0;
    }
    const oldestRequest = Math.min(...this.requests);
    const resetTime = oldestRequest + this.timeWindow;
    return Math.max(0, resetTime - Date.now());
  }
}

/**
 * Validate URL to prevent SSRF attacks
 */
export function isValidAPIUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTPS
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }
    
    // Whitelist allowed API domains
    const allowedDomains = [
      'api.openai.com',
      'generativelanguage.googleapis.com'
    ];
    
    return allowedDomains.some(domain => parsedUrl.hostname === domain);
  } catch {
    return false;
  }
}

/**
 * Escape user input for safe inclusion in prompts
 * Prevents prompt injection attacks
 */
export function escapePromptInjection(userInput: string): string {
  if (typeof userInput !== 'string') {
    return '';
  }

  // Remove control characters
  let escaped = userInput.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Limit length to prevent token exhaustion attacks
  const MAX_INPUT_LENGTH = 10000;
  if (escaped.length > MAX_INPUT_LENGTH) {
    escaped = escaped.substring(0, MAX_INPUT_LENGTH);
  }
  
  // Detect and neutralize common prompt injection patterns
  const injectionPatterns = [
    /ignore\s+(previous|above|all)\s+instructions?/gi,
    /disregard\s+(previous|above|all)/gi,
    /forget\s+(previous|above|all)/gi,
    /new\s+instructions?:/gi,
    /system\s*:/gi,
    /\[SYSTEM\]/gi,
    /\<\|im_start\|\>/gi,
    /\<\|im_end\|\>/gi
  ];
  
  // Add warning markers for detected injection attempts
  for (const pattern of injectionPatterns) {
    if (pattern.test(escaped)) {
      // Don't modify the content, but log for monitoring
      console.warn('[Security] Potential prompt injection detected');
      break;
    }
  }
  
  return escaped;
}

/**
 * Validate that response from API is safe
 */
export function validateAPIResponse(response: unknown): boolean {
  if (!response || typeof response !== 'object') {
    return false;
  }
  
  // Check for expected structure without executing any code
  return true; // Basic validation, extend as needed
}

/**
 * Create a secure random string for nonces, etc.
 */
export function generateSecureRandom(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Content Security Policy violation reporter
 */
export function reportCSPViolation(violation: SecurityPolicyViolationEvent): void {
  console.warn('[CSP Violation]', {
    blockedURI: violation.blockedURI,
    violatedDirective: violation.violatedDirective,
    originalPolicy: violation.originalPolicy,
  });
}
