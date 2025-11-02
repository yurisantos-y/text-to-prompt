# Guia de Instalação

Este guia fornece instruções detalhadas para instalar e configurar o Text to Prompt em diferentes ambientes.

## 📋 Índice

- [Instalação para Usuários](#instalação-para-usuários)
- [Instalação para Desenvolvedores](#instalação-para-desenvolvedores)
- [Configuração Inicial](#configuração-inicial)
- [Solução de Problemas](#solução-de-problemas)

---

## Instalação para Usuários

### Chrome / Edge

#### Método 1: Chrome Web Store (Recomendado)
*Em breve disponível*

Quando publicada na Chrome Web Store:
1. Acesse a página da extensão
2. Clique em "Adicionar ao Chrome/Edge"
3. Confirme as permissões
4. A extensão será instalada automaticamente

#### Método 2: Instalação Manual (Desenvolvimento)

1. **Baixe a extensão**:
   - Acesse a [página de Releases](https://github.com/yurisantos-y/text-to-prompt/releases)
   - Baixe o arquivo `text-to-prompt-chrome.zip` da versão mais recente
   - Extraia o arquivo ZIP em uma pasta local

2. **Carregue no Chrome/Edge**:
   - Abra `chrome://extensions/` no navegador
   - Ative o **"Modo do desenvolvedor"** no canto superior direito
   - Clique em **"Carregar sem compactação"**
   - Selecione a pasta extraída do arquivo ZIP
   - A extensão aparecerá na lista

3. **Verifique a instalação**:
   - O ícone do Text to Prompt deve aparecer na barra de ferramentas
   - Clique no ícone para abrir o popup de configuração

### Firefox

#### Método 1: Firefox Add-ons (AMO) (Recomendado)
*Em breve disponível*

Quando publicada no AMO:
1. Acesse a página do add-on
2. Clique em "Adicionar ao Firefox"
3. Confirme as permissões
4. A extensão será instalada automaticamente

#### Método 2: Instalação Temporária (Desenvolvimento)

1. **Baixe a extensão**:
   - Acesse a [página de Releases](https://github.com/yurisantos-y/text-to-prompt/releases)
   - Baixe o arquivo `text-to-prompt-firefox.zip`
   - Extraia o arquivo ZIP

2. **Carregue no Firefox**:
   - Abra `about:debugging#/runtime/this-firefox`
   - Clique em **"Carregar extensão temporária"**
   - Navegue até a pasta extraída
   - Selecione o arquivo `manifest.json`
   - A extensão será carregada

   ⚠️ **Nota**: Extensões temporárias no Firefox são removidas ao fechar o navegador.

---

## Instalação para Desenvolvedores

### Pré-requisitos

Certifique-se de ter instalado:

- **Node.js**: versão 18.x ou superior
  - Verifique: `node --version`
  - Download: [nodejs.org](https://nodejs.org/)

- **npm**: geralmente incluído com Node.js
  - Verifique: `npm --version`
  - Ou use **pnpm**: `npm install -g pnpm`

- **Git**: para clonar o repositório
  - Verifique: `git --version`
  - Download: [git-scm.com](https://git-scm.com/)

### Setup do Projeto

#### 1. Clone o Repositório

```bash
# Via HTTPS
git clone https://github.com/yurisantos-y/text-to-prompt.git

# Via SSH
git clone git@github.com:yurisantos-y/text-to-prompt.git

# Entre na pasta do projeto
cd text-to-prompt
```

#### 2. Instale as Dependências

```bash
# Usando npm
npm install

# Ou usando pnpm (mais rápido)
pnpm install
```

Isso instalará todas as dependências listadas no `package.json`, incluindo:
- React 18.3
- TypeScript 5.3
- WXT Framework
- TailwindCSS
- Shadcn/ui components
- Lucide React (ícones)

#### 3. Desenvolvimento

Execute o servidor de desenvolvimento com hot-reload:

```bash
# Para Chrome
npm run dev

# Para Firefox
npm run dev:firefox
```

O WXT irá:
- Compilar o código TypeScript
- Processar os estilos TailwindCSS
- Gerar os arquivos da extensão
- Observar mudanças e recompilar automaticamente

**Saída**: `.output/chrome-mv3/` ou `.output/firefox-mv2/`

#### 4. Carregue a Extensão

**Chrome/Edge**:
1. Abra `chrome://extensions/`
2. Ative "Modo do desenvolvedor"
3. Clique em "Carregar sem compactação"
4. Selecione `.output/chrome-mv3`

**Firefox**:
1. Abra `about:debugging#/runtime/this-firefox`
2. Clique em "Carregar extensão temporária"
3. Selecione `.output/firefox-mv2/manifest.json`

#### 5. Desenvolvimento Ativo

Com o servidor dev rodando:
- **Mudanças em componentes**: Auto-reload
- **Mudanças em content scripts**: Recarregue a extensão manualmente
- **Mudanças no manifest**: Recarregue a extensão

### Build de Produção

Para criar uma versão otimizada para distribuição:

```bash
# Chrome
npm run build

# Firefox
npm run build:firefox

# Criar arquivo ZIP para publicação
npm run zip          # Chrome
npm run zip:firefox  # Firefox
```

Os arquivos gerados estarão em:
- Build: `.output/chrome-mv3/` ou `.output/firefox-mv2/`
- ZIP: `.output/text-to-prompt-X.X.X-chrome.zip`

### Estrutura do Projeto

```
text-to-prompt/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/              # Componentes shadcn/ui
│   │   └── ModalOptions.tsx # Modal principal
│   ├── entrypoints/         # Pontos de entrada
│   │   ├── content/         # Content script
│   │   └── popup/           # Interface do popup
│   ├── utils/               # Utilitários
│   │   ├── api.ts           # Integração com APIs
│   │   ├── security.ts      # Funções de segurança
│   │   └── secureStorage.ts # Armazenamento seguro
│   ├── types/               # Tipos TypeScript
│   └── styles/              # Estilos globais
├── public/                  # Assets estáticos
├── steering/                # Documentação técnica
├── wxt.config.ts            # Configuração do WXT
├── tailwind.config.js       # Configuração Tailwind
└── tsconfig.json            # Configuração TypeScript
```

---

## Configuração Inicial

Após instalar a extensão, é necessário configurar uma API key.

### 1. Obter API Key

Escolha um provedor de IA:

#### OpenAI (GPT-5 Nano)

1. Acesse [platform.openai.com](https://platform.openai.com/)
2. Crie uma conta ou faça login
3. Vá para [API Keys](https://platform.openai.com/api-keys)
4. Clique em "Create new secret key"
5. Copie a chave (começa com `sk-`)

**Nota**: OpenAI cobra por uso. Verifique os preços em [openai.com/pricing](https://openai.com/pricing).

#### Google Gemini (Gemini 2.5 Flash)

1. Acesse [makersuite.google.com](https://makersuite.google.com/)
2. Faça login com sua conta Google
3. Clique em "Get API Key"
4. Crie um novo projeto (se necessário)
5. Copie a API key

**Nota**: Gemini tem um tier gratuito generoso. Verifique limites em [ai.google.dev/pricing](https://ai.google.dev/pricing).

### 2. Configure a Extensão

1. **Abra o popup**:
   - Clique no ícone do Text to Prompt na barra de ferramentas

2. **Selecione o provedor**:
   - Escolha entre OpenAI ou Gemini

3. **Insira a API Key**:
   - Cole a chave copiada
   - A extensão validará automaticamente

4. **Salve**:
   - Clique em "Save Settings"
   - Aguarde a confirmação

### 3. Teste a Configuração

1. Navegue para qualquer site com campos de texto
2. Clique em um campo de entrada
3. Você deve ver um ícone de lâmpada no canto inferior direito do campo
4. Clique no ícone para testar a conversão

---

## Solução de Problemas

### A extensão não aparece

**Chrome/Edge**:
- Verifique se o "Modo do desenvolvedor" está ativo
- Recarregue a página de extensões (`Ctrl+R`)
- Verifique se não há erros na lista de extensões

**Firefox**:
- Extensões temporárias são removidas ao fechar o navegador
- Recarregue a extensão em `about:debugging`

### Ícone não aparece nos campos

1. **Recarregue a página**: `F5` ou `Ctrl+R`
2. **Verifique permissões**: A extensão precisa de acesso à aba
3. **Console do navegador**: Verifique erros (`F12` > Console)
4. **Campos suportados**: Funciona com `<input>`, `<textarea>` e `[contenteditable]`

### Erro "Invalid API Key"

1. **Formato correto**:
   - OpenAI: Deve começar com `sk-`
   - Gemini: Alfanumérico, mínimo 20 caracteres
2. **Chave válida**: Verifique se não expirou
3. **Provedor correto**: OpenAI key não funciona com Gemini e vice-versa
4. **Espaços**: Remova espaços no início/fim da chave

### Rate Limit Exceeded

A extensão limita a 10 requisições por minuto para evitar abuso.

**Solução**:
- Aguarde 60 segundos
- Reduza a frequência de uso
- Verifique se não há múltiplas instâncias fazendo requisições

### Build Falha

```bash
# Limpe dependências e cache
rm -rf node_modules .wxt .output
npm install

# Tente novamente
npm run build
```

### Hot-reload não funciona

1. **Reinicie o servidor dev**: `Ctrl+C` e `npm run dev`
2. **Recarregue a extensão manualmente**
3. **Verifique portas**: WXT usa porta 5173 por padrão

### Problemas no Firefox

- **Manifest V2 vs V3**: Firefox usa V2, Chrome usa V3
- **Build separado**: Use `npm run dev:firefox`
- **APIs diferentes**: Algumas features podem ter comportamento diferente

### Network Errors

1. **Firewall/Proxy**: Verifique se não está bloqueando
2. **CORS**: A extensão faz requisições diretas às APIs
3. **Internet**: Verifique sua conexão
4. **Status das APIs**:
   - OpenAI: [status.openai.com](https://status.openai.com)
   - Google: [status.cloud.google.com](https://status.cloud.google.com)

### Erros de Permissão

Se aparecer erro de permissão ao salvar configurações:

1. **Verifique manifest**: Permissão `storage` deve estar presente
2. **Recarregue extensão**: Remove e reinstale
3. **Navegador atualizado**: Use versão recente

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Chrome dev server
npm run dev:firefox      # Firefox dev server

# Build
npm run build            # Build Chrome
npm run build:firefox    # Build Firefox

# Distribuição
npm run zip              # ZIP Chrome
npm run zip:firefox      # ZIP Firefox

# Preview
npm run preview          # Preview build local

# Manutenção
npm install              # Instalar dependências
npm update               # Atualizar dependências
npm audit                # Verificar vulnerabilidades
npm audit fix            # Corrigir vulnerabilidades
```

---

## Próximos Passos

- 📖 Leia a [Documentação Completa](README.md)
- 🔒 Entenda a [Política de Segurança](SECURITY.md)
- 🤝 Veja o [Guia de Contribuição](CONTRIBUTING.md)
- 🏗️ Explore a [Visão Geral do Projeto](PROJECT_OVERVIEW.md)

---

## Suporte

Precisa de ajuda?

- 🐛 [Reportar Bug](https://github.com/yurisantos-y/text-to-prompt/issues/new?labels=bug)
- 💡 [Solicitar Feature](https://github.com/yurisantos-y/text-to-prompt/issues/new?labels=enhancement)
- 💬 [Discussões](https://github.com/yurisantos-y/text-to-prompt/discussions)
- 📧 Entre em contato através das Issues

---

**Instalação concluída! Aproveite o Text to Prompt! 🚀**
