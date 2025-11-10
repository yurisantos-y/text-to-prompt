import {
  AIProvider,
  PromptOption,
  OpenAIResponse,
  GeminiResponse,
  ConversionRequest,
} from '@/types';
import {
  sanitizeText,
  sanitizeErrorMessage,
  escapePromptInjection,
  validateApiKeyFormat,
  RateLimiter,
  isValidAPIUrl,
  safeJSONParse,
} from './security';

// Rate limiter for API calls (10 requests per minute)
const apiRateLimiter = new RateLimiter(10, 60);

/**
 * Remove common AI preambles and acknowledgments from response
 */
function cleanAIResponse(text: string, option: PromptOption): string {
  // Sanitize the response to prevent XSS
  text = sanitizeText(text);
  // For English text responses, remove common preambles
  if (option === 'text-to-english-prompt') {
    const preamblePatterns = [
      /^(Okay,?\s*)/i,
      /^(Sure,?\s*)/i,
      /^(Here'?s?\s*)/i,
      /^(Let me\s+)/i,
      /^(I'?ll\s+)/i,
      /^(Alright,?\s*)/i,
      /^(Certainly,?\s*)/i,
      /^(Of course,?\s*)/i,
    ];

    let cleaned = text.trim();
    
    // Remove preambles from the start
    for (const pattern of preamblePatterns) {
      cleaned = cleaned.replace(pattern, '');
    }
    
    // Remove sentences that are purely meta-commentary at the start
    const metaPatterns = [
      /^[^.!?\n]*?(?:let'?s|we can|I'?ll|I will|I can)\s+(?:break|outline|describe|explain|discuss|analyze|examine|explore)[^.!?\n]*?[.!?]\s*/i,
      /^[^.!?\n]*?(?:building|creating|developing|making)\s+(?:a complete|a full|an entire)[^.!?\n]*?[.!?]\s*/i,
    ];
    
    for (const pattern of metaPatterns) {
      cleaned = cleaned.replace(pattern, '');
    }
    
    return cleaned.trim();
  }
  
  if (option === 'text-to-toon') {
    let cleaned = text.trim();

    // Remove markdown code fences if present
    const fencedMatch = cleaned.match(/```(?:toon)?\s*\n([\s\S]*?)```/i);
    if (fencedMatch) {
      cleaned = fencedMatch[1].trim();
    }

    // Remove any stray fences at start or end
    cleaned = cleaned.replace(/^```(?:toon)?[\s\n]*/gi, '');
    cleaned = cleaned.replace(/[\s\n]*```$/g, '');
    
    // Normalize line endings
    cleaned = cleaned.replace(/\r\n/g, '\n');
    
    // Remove trailing spaces from lines (TOON spec requirement)
    cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n');
    
    // Remove excessive blank lines but keep structure
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    return cleaned.trim();
  }
  
  // For JSON responses, ensure we only have valid JSON
  if (option.includes('json')) {
    // Find the first { and last } to extract only the JSON
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return text.substring(firstBrace, lastBrace + 1).trim();
    }
  }
  
  return text.trim();
}

/**
 * Get system message based on the selected option
 */
function getSystemMessage(option: PromptOption): string {
  switch (option) {
    case 'text-to-english-prompt':
      return 'You are a helpful AI assistant. Follow instructions precisely and provide direct, substantive responses ALWAYS IN ENGLISH, regardless of the input language. Never start with acknowledgments like "Okay", "Sure", "Here\'s", "Let me", etc. Start immediately with the actual content requested. Output exactly what is asked without preambles or meta-commentary.';
    case 'text-to-json-english-prompt':
    case 'text-to-json-prompt':
      return 'You are a helpful AI assistant specialized in JSON generation. Follow instructions precisely and output ONLY valid JSON without any text before or after. Never include explanations, markdown code blocks, or any other text - just pure JSON.';
    case 'text-to-toon':
      return 'You are a TOON format specialist. Output ONLY valid TOON (spec v1.5) with NO markdown, explanations, or commentary.\n\nKEY RULES:\n1. 2-space indentation\n2. Objects: key: value (nest with indentation)\n3. Primitive arrays: ALWAYS inline - tags[3]: a,b,c\n4. Uniform object arrays: Tabular - users[2]{id,name}: with rows\n5. Mixed arrays: Dash-list with "- "\n6. Quote strings with: comma, colon, spaces at edges, or looking like numbers/booleans\n7. Arrays with complex strings: quote each element - modules[2]: "Item A (x, y)","Item B"\n8. [N] must match exact count\n9. NO trailing spaces\n10. NO dash-lists for primitive arrays';
    default:
      return 'You are a helpful AI assistant. Follow instructions precisely and provide direct, substantive responses. Never start with acknowledgments. Start immediately with the actual content requested. Output exactly what is asked without preambles or meta-commentary.';
  }
}

/**
 * Get the prompt template based on the selected option
 */
function getPromptTemplate(option: PromptOption): string {
  switch (option) {
    case 'text-to-english-prompt':
      return `You are a helpful AI assistant. Provide a direct, comprehensive response IN ENGLISH to the following request.

CRITICAL RULES:
- Your ENTIRE response MUST be in English, regardless of the input language
- Start immediately with the actual content - NO introductory phrases like "Okay, let's...", "Sure, I'll...", "Here's...", etc.
- Do NOT explain what you're about to do or acknowledge the request
- Do NOT include meta-commentary about the task
- Provide ONLY the substantive content requested
- Use clear, professional English language
- Format appropriately (paragraphs, lists, code blocks as needed)
- Jump straight into the content
- IMPORTANT: Even if the request is in Portuguese, Spanish, or any other language, respond ENTIRELY in English

User request:
`;
    case 'text-to-json-english-prompt':
      return `You are a helpful AI assistant. Based on the following request, generate a single, valid, well-formatted JSON object with English keys and values. IMPORTANTLY, enhance and improve the content quality.

Instructions:
- Analyze the user's request and extract all relevant information
- ENHANCE AND IMPROVE the content: fix grammar, expand ideas, make it clearer, more professional, and more complete
- Transform the improved content into a comprehensive JSON structure with appropriate English keys
- Use descriptive, semantic key names (e.g., "title", "description", "content", "items", "metadata", "details", etc.)
- Ensure the JSON is valid and properly formatted with 2-space indentation
- Include all relevant data from the request with improvements
- Use appropriate data types (strings, numbers, booleans, arrays, objects)
- Add nested structures where appropriate to organize the enhanced content
- Handle missing data with null values
- Escape special characters correctly
- If the input is a simple request or note, expand it with relevant details and structure
- Return ONLY the JSON object, no explanations or additional text

User request:
`;
    case 'text-to-json-prompt':
      return `You are a helpful AI assistant. Based on the following request, generate a single, valid, well-formatted JSON object with English keys while preserving and ENHANCING the original language in the values.

Instructions:
- Analyze the user's request and extract all relevant information
- ENHANCE AND IMPROVE the content: fix grammar, expand ideas, make it clearer, more professional, and more complete in the ORIGINAL LANGUAGE
- Transform the improved content into a comprehensive JSON structure with English keys
- Preserve the original language and cultural context in all JSON values (only keys should be in English)
- Use descriptive, semantic English key names (e.g., "title", "description", "content", "details", "requirements", "items", etc.)
- Ensure the JSON is valid and properly formatted with 2-space indentation
- Include all relevant data from the request with improvements
- Use appropriate data types (strings, numbers, booleans, arrays, objects)
- Add nested structures where appropriate to organize the enhanced content
- Handle missing data with null values
- Properly encode and escape special characters for the original language
- If the input is a simple request or note, expand it with relevant details and structure while maintaining the original language
- Return ONLY the JSON object, no explanations or additional text before or after

User request:
`;
    case 'text-to-toon':
      return `You are a TOON format expert. Convert the user's request into valid Token-Oriented Object Notation (TOON) following spec v1.5.

CRITICAL RULES:
1. Output ONLY raw TOON - NO markdown fences (\`\`\`), NO explanations, NO commentary
2. Use 2-space indentation for nested structures
3. NO trailing spaces on any line

OBJECTS:
  key: value
  nested:
    subkey: value

ARRAYS - THREE FORMATS:

A) PRIMITIVE ARRAYS (strings, numbers, booleans) - ALWAYS INLINE:
   ✓ CORRECT: tags[3]: reading,gaming,coding
   ✓ CORRECT: skills[2]: Flutter,Dart
   ✓ CORRECT: modules[3]: "User Management","Payment Processing","GPS Tracking"
   ✗ WRONG: Never use dash-list (- ) for primitive arrays

B) UNIFORM OBJECT ARRAYS (same fields, primitives only) - TABULAR:
   users[2]{id,name,role}:
     1,Alice,admin
     2,Bob,user
   
   Rules:
   - All objects must have identical fields
   - Only primitive values (string, number, boolean, null)
   - [N] must match row count exactly

C) NON-UNIFORM/MIXED ARRAYS - DASH-LIST:
   items[3]:
     - 42
     - name: Test
     - tags[2]: a,b
   
   Use ONLY when array has different types or non-uniform objects

QUOTING RULES:
Quote strings when they contain:
  - Comma: "hello, world"
  - Colon: "key: value"
  - Leading/trailing spaces: " text "
  - Look like number/boolean/null: "123", "true", "null"
  - Start with "- ": "- item"
  - Empty: ""
  - Quotes or backslash (escape them): "say \\"hi\\""

DON'T quote:
  - Plain strings: hello, world_123, user-name
  - Numbers: 42, 3.14, -10
  - Booleans: true, false
  - Null: null

CRITICAL: If a primitive array contains strings with commas/colons/spaces, quote each element:
  modules[3]: "User Management (Auth, Profile)","Payment System","GPS Tracking"

[N] length markers MUST be exact. Count carefully!

User request:
`;
    default:
      return '';
  }
}

/**
 * Validate API key by making a test call
 */
export async function validateApiKey(
  provider: AIProvider,
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Validate API key format first
    if (!validateApiKeyFormat(provider, apiKey)) {
      return { valid: false, error: 'Invalid API key format' };
    }

    // Check rate limit
    if (!apiRateLimiter.canMakeRequest()) {
      const resetTime = Math.ceil(apiRateLimiter.getResetTime() / 1000);
      return {
        valid: false,
        error: `Rate limit exceeded. Try again in ${resetTime} seconds.`,
      };
    }

    const testPrompt = 'Respond with OK';
    
    if (provider === 'openai') {
      const apiUrl = 'https://api.openai.com/v1/chat/completions';
      
      // Validate API URL
      if (!isValidAPIUrl(apiUrl)) {
        return { valid: false, error: 'Invalid API endpoint' };
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-5 nano',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 10,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = sanitizeErrorMessage(new Error(errorData.error?.message || 'Invalid API key'));
        return { valid: false, error: errorMsg };
      }

      const jsonText = await response.text();
      const parseResult = safeJSONParse<OpenAIResponse>(jsonText);
      
      if (!parseResult.success || !parseResult.data) {
        return { valid: false, error: 'Invalid API response' };
      }
      
      return { valid: parseResult.data.choices && parseResult.data.choices.length > 0 };
    } else {
      // Gemini validation
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
      
      // Validate API URL (without key)
      if (!isValidAPIUrl('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent')) {
        return { valid: false, error: 'Invalid API endpoint' };
      }

      const response = await fetch(apiUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: testPrompt }] }],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = sanitizeErrorMessage(new Error(errorData.error?.message || 'Invalid API key'));
        return { valid: false, error: errorMsg };
      }

      const jsonText = await response.text();
      const parseResult = safeJSONParse<GeminiResponse>(jsonText);
      
      if (!parseResult.success || !parseResult.data) {
        return { valid: false, error: 'Invalid API response' };
      }
      
      return { valid: parseResult.data.candidates && parseResult.data.candidates.length > 0 };
    }
  } catch (error) {
    return {
      valid: false,
      error: sanitizeErrorMessage(error),
    };
  }
}

/**
 * Convert text using the specified AI provider
 */
export async function convertText(
  request: ConversionRequest
): Promise<{ result?: string; error?: string }> {
  try {
    // Validate API key format
    if (!validateApiKeyFormat(request.provider, request.apiKey)) {
      return { error: 'Invalid API key format' };
    }

    // Check rate limit
    if (!apiRateLimiter.canMakeRequest()) {
      const resetTime = Math.ceil(apiRateLimiter.getResetTime() / 1000);
      return {
        error: `Rate limit exceeded. Try again in ${resetTime} seconds.`,
      };
    }

    // Sanitize and escape user input to prevent prompt injection
    const sanitizedText = escapePromptInjection(request.text);
    
    if (!sanitizedText) {
      return { error: 'Invalid input text' };
    }

    const promptTemplate = getPromptTemplate(request.option);
    const fullPrompt = promptTemplate + sanitizedText;

    if (request.provider === 'openai') {
      const apiUrl = 'https://api.openai.com/v1/chat/completions';
      
      // Validate API URL
      if (!isValidAPIUrl(apiUrl)) {
        return { error: 'Invalid API endpoint' };
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${request.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-5 nano',
          messages: [
            {
              role: 'system',
              content: getSystemMessage(request.option)
            },
            {
              role: 'user',
              content: fullPrompt
            }
          ],
          temperature: 0.3, // Lower temperature for more consistent, focused outputs
          top_p: 0.9,
          max_tokens: 2000,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = sanitizeErrorMessage(new Error(errorData.error?.message || 'API request failed'));
        return { error: errorMsg };
      }

      const jsonText = await response.text();
      const parseResult = safeJSONParse<OpenAIResponse>(jsonText);
      
      if (!parseResult.success || !parseResult.data) {
        return { error: 'Invalid API response format' };
      }
      
      const rawResult = parseResult.data.choices[0]?.message?.content || '';
      const result = cleanAIResponse(rawResult, request.option);
      return { result };
    } else {
      // Gemini
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(request.apiKey)}`;
      
      // Validate API URL (without key)
      if (!isValidAPIUrl('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent')) {
        return { error: 'Invalid API endpoint' };
      }

      const response = await fetch(apiUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ 
              parts: [{ text: fullPrompt }] 
            }],
            generationConfig: {
              temperature: 0.3, // Lower temperature for more consistent outputs
              topK: 40,
              topP: 0.9,
              maxOutputTokens: 2000,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE'
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE'
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE'
              }
            ]
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = sanitizeErrorMessage(new Error(errorData.error?.message || 'API request failed'));
        return { error: errorMsg };
      }

      const jsonText = await response.text();
      const parseResult = safeJSONParse<GeminiResponse>(jsonText);
      
      if (!parseResult.success || !parseResult.data) {
        return { error: 'Invalid API response format' };
      }
      
      const rawResult = parseResult.data.candidates[0]?.content?.parts[0]?.text || '';
      const result = cleanAIResponse(rawResult, request.option);
      return { result };
    }
  } catch (error) {
    return {
      error: sanitizeErrorMessage(error),
    };
  }
}

// Note: Storage utilities have been moved to @/utils/secureStorage
// to use chrome.storage.local instead of localStorage for better security
