import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'Text to Prompt',
    description: 'Convert text from input fields into prompts optimized for AI',
    version: '1.0.0',
    permissions: ['storage', 'activeTab'],
    // Restrict host permissions to specific API domains only
    host_permissions: [
      'https://api.openai.com/*',
      'https://generativelanguage.googleapis.com/*'
    ],
    action: {
      default_title: 'Text to Prompt',
    },
    // Content Security Policy to prevent XSS and injection attacks
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline';"
    },
    // Make logo accessible to content scripts
    web_accessible_resources: [{
      resources: ['Logo.png', 'Logo.svg'],
      matches: ['<all_urls>']
    }],
  },
});
