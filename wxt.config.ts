import { defineConfig } from 'wxt';
import { copyFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  srcDir: 'src',
  publicDir: 'public',
  hooks: {
    'build:done': (wxt) => {
      // Copiar ícones após o build
      const icons = ['icon-48.png', 'icon-96.png'];
      const browser = wxt.config.browser;
      const mv = wxt.config.manifestVersion === 3 ? 'mv3' : 'mv2';
      const outDir = resolve('.output', `${browser}-${mv}`);
      
      icons.forEach(icon => {
        try {
          const src = resolve('public', icon);
          const dest = resolve(outDir, icon);
          copyFileSync(src, dest);
          console.log(`✓ Ícone copiado: ${icon}`);
        } catch (err: any) {
          console.error(`✗ Erro ao copiar ${icon}:`, err?.message);
        }
      });
    },
  },
  manifest: {
    name: 'Text to Prompt',
    description: 'Convert text from input fields into prompts optimized for AI',
    version: '0.0.3',
  permissions: ['storage'],
    // Restrict host permissions to specific API domains only
    host_permissions: [
      'https://api.openai.com/*',
      'https://generativelanguage.googleapis.com/*'
    ],
    action: {
      default_title: 'Text to Prompt',
    },
    // Make logo accessible to content scripts
    web_accessible_resources: [{
      resources: ['Logo.png', 'Logo.svg'],
      matches: ['<all_urls>']
    }],
    // Informações adicionais para publicação
    homepage_url: 'https://github.com/yurisantos-y/text-to-prompt',
    icons: {
      48: 'icon-48.png',
      96: 'icon-96.png',
    },
  },
  // Remover permissões de desenvolvimento em produção
  runner: {
    disabled: process.env.NODE_ENV === 'production',
  },
});
