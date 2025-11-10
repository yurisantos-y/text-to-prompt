// API Provider types
export type AIProvider = 'openai' | 'gemini';

// Prompt option types
export type PromptOption = 
  | 'text-to-english-prompt'
  | 'text-to-json-english-prompt'
  | 'text-to-json-prompt'
  | 'text-to-toon';

// Settings stored in localStorage
export interface Settings {
  provider: AIProvider;
  apiKey: string;
  isConfigured: boolean;
}

// API Response types
export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

// Conversion request
export interface ConversionRequest {
  text: string;
  option: PromptOption;
  provider: AIProvider;
  apiKey: string;
}
