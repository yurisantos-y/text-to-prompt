# Guia de Contribuição

Obrigado por considerar contribuir com o Text to Prompt! Este documento fornece diretrizes e informações para tornar sua contribuição o mais eficiente possível.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Fluxo de Trabalho](#fluxo-de-trabalho)
- [Padrões de Código](#padrões-de-código)
- [Commits](#commits)
- [Pull Requests](#pull-requests)
- [Testes](#testes)
- [Documentação](#documentação)

## Código de Conduta

Este projeto adota um código de conduta que esperamos que todos os participantes sigam. Por favor, seja respeitoso, inclusivo e profissional em todas as interações.

### Nossas Promessas

- Usar linguagem acolhedora e inclusiva
- Respeitar diferentes pontos de vista e experiências
- Aceitar críticas construtivas graciosamente
- Focar no que é melhor para a comunidade
- Mostrar empatia com outros membros da comunidade

## Como Contribuir

Existem várias maneiras de contribuir:

### 🐛 Reportar Bugs

1. Verifique se o bug já não foi reportado nas [Issues](https://github.com/yurisantos-y/text-to-prompt/issues)
2. Se não encontrar, crie uma nova issue com:
   - Título descritivo e claro
   - Passos detalhados para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Ambiente (navegador, versão da extensão, SO)

### 💡 Sugerir Melhorias

1. Verifique se a feature já não foi sugerida
2. Crie uma issue com a label `enhancement` incluindo:
   - Descrição clara da funcionalidade
   - Justificativa e casos de uso
   - Possíveis implementações
   - Impactos em funcionalidades existentes

### 🔧 Contribuir com Código

1. Procure issues com labels `good first issue` ou `help wanted`
2. Comente na issue que deseja trabalhar nela
3. Aguarde aprovação antes de começar
4. Siga o [Fluxo de Trabalho](#fluxo-de-trabalho) descrito abaixo

### 📝 Melhorar Documentação

Documentação clara é crucial! Contribuições incluem:
- Corrigir erros de digitação ou gramática
- Adicionar exemplos
- Melhorar explicações
- Traduzir documentação

## Configuração do Ambiente

### Pré-requisitos

- Node.js 18.x ou superior
- npm ou pnpm
- Git
- Editor de código (recomendamos VS Code)

### Setup Inicial

```bash
# 1. Fork o repositório no GitHub

# 2. Clone seu fork
git clone https://github.com/seu-usuario/text-to-prompt.git
cd text-to-prompt

# 3. Adicione o repositório original como upstream
git remote add upstream https://github.com/yurisantos-y/text-to-prompt.git

# 4. Instale as dependências
npm install

# 5. Crie uma branch para sua feature
git checkout -b feature/minha-feature
```

### Executar em Desenvolvimento

```bash
# Chrome
npm run dev

# Firefox
npm run dev:firefox
```

### Carregar a Extensão no Navegador

**Chrome/Edge:**
1. Acesse `chrome://extensions/`
2. Ative "Modo do desenvolvedor"
3. Clique em "Carregar sem compactação"
4. Selecione a pasta `.output/chrome-mv3`

**Firefox:**
1. Acesse `about:debugging#/runtime/this-firefox`
2. Clique em "Carregar extensão temporária"
3. Selecione o arquivo `.output/firefox-mv2/manifest.json`

## Fluxo de Trabalho

### 1. Sincronizar com Upstream

Antes de começar, sincronize seu fork:

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

### 2. Criar Branch

Use nomes descritivos seguindo o padrão:

```bash
# Features
git checkout -b feature/nome-da-feature

# Correções
git checkout -b fix/nome-do-bug

# Documentação
git checkout -b docs/descricao

# Refatoração
git checkout -b refactor/descricao
```

### 3. Fazer Mudanças

- Faça commits pequenos e atômicos
- Teste suas mudanças
- Siga os padrões de código

### 4. Commit

Siga o padrão [Conventional Commits](#commits):

```bash
git add .
git commit -m "feat: adiciona nova funcionalidade X"
```

### 5. Push e Pull Request

```bash
git push origin feature/minha-feature
```

Depois, abra um Pull Request no GitHub.

## Padrões de Código

### Estrutura de Arquivos

```
src/
├── components/
│   ├── ui/              # Componentes reutilizáveis (shadcn/ui)
│   └── *.tsx            # Componentes específicos
├── entrypoints/
│   ├── popup/           # Interface do popup
│   └── content/         # Content scripts
├── utils/               # Utilitários e helpers
├── types/               # Definições TypeScript
└── styles/              # Estilos globais
```

### Convenções de Nomenclatura

- **Componentes**: PascalCase (`ModalOptions.tsx`)
- **Utilitários**: camelCase (`api.ts`, `security.ts`)
- **Tipos**: PascalCase para exports (`AIProvider`, `Settings`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_INPUT_LENGTH`)
- **Funções**: camelCase (`sanitizeText`, `validateApiKey`)

### TypeScript

- Use tipos explícitos sempre que possível
- Evite `any` (use `unknown` se necessário)
- Documente interfaces e tipos complexos
- Use enums ou union types para valores fixos

```typescript
// ✅ Bom
export interface ConversionRequest {
  text: string;
  option: PromptOption;
  provider: AIProvider;
  apiKey: string;
}

// ❌ Evitar
function process(data: any) { }
```

### React

- Use componentes funcionais com hooks
- Evite inline styles (use Tailwind classes)
- Ordem de imports:
  1. React
  2. Bibliotecas externas
  3. Componentes internos
  4. Utils
  5. Tipos
  6. Estilos

```typescript
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { sanitizeText } from '@/utils/security';
import { AIProvider } from '@/types';
```

### Segurança

**CRÍTICO**: Todas as mudanças que envolvem segurança requerem atenção especial:

- ✅ Sempre sanitize entrada de usuário
- ✅ Valide dados de APIs externas
- ✅ Use `secureStorage` para dados sensíveis
- ✅ Verifique rate limits
- ❌ Nunca armazene API keys em plain text
- ❌ Nunca exponha stack traces ao usuário

```typescript
// ✅ Correto
const cleanInput = sanitizeText(userInput);
const escaped = escapePromptInjection(cleanInput);

// ❌ Incorreto
const result = await processAPI(userInput); // sem sanitização
```

## Commits

Usamos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

### Formato

```
<tipo>(<escopo>): <descrição curta>

<corpo opcional>

<rodapé opcional>
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção

### Exemplos

```bash
feat(api): adiciona suporte para GPT-4
fix(security): corrige validação de API key
docs(readme): atualiza instruções de instalação
refactor(storage): migra para chrome.storage
```

## Pull Requests

### Checklist

Antes de abrir um PR, verifique:

- [ ] Código segue os padrões do projeto
- [ ] Testes adicionados/atualizados (se aplicável)
- [ ] Documentação atualizada
- [ ] Build passa sem erros (`npm run build`)
- [ ] Commits seguem o padrão Conventional Commits
- [ ] Branch está atualizada com `main`

### Template de PR

```markdown
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Passo 1
2. Passo 2
3. ...

## Screenshots (se aplicável)

## Checklist
- [ ] Código testado
- [ ] Documentação atualizada
- [ ] Segue os padrões do projeto
```

### Revisão

- Seja paciente durante a revisão
- Responda aos comentários construtivamente
- Faça as mudanças solicitadas
- Use `git commit --amend` para pequenas correções

## Testes

### Executar Testes

```bash
# Build
npm run build

# Testar em diferentes navegadores
npm run build:firefox
```

### Testes Manuais

1. **Funcionalidade básica**:
   - Detecta campos de texto
   - Ícone aparece corretamente
   - Modal abre e fecha

2. **Conversão**:
   - Testa todos os 3 modos
   - Verifica formatação de resposta
   - Testa com diferentes tamanhos de texto

3. **Segurança**:
   - Tenta injeção de XSS
   - Testa prompt injection
   - Verifica rate limiting

4. **Navegadores**:
   - Chrome
   - Firefox
   - Edge (opcional)

## Documentação

### O que Documentar

- Funções públicas e exportadas
- Componentes complexos
- Decisões arquiteturais
- Padrões de segurança
- APIs e integrações

### Formato de Documentação

Use JSDoc para código:

```typescript
/**
 * Sanitiza texto para prevenir XSS
 * Remove scripts, event handlers e protocolos perigosos
 * 
 * @param input - Texto não sanitizado do usuário
 * @returns Texto sanitizado e seguro
 * @example
 * ```ts
 * const clean = sanitizeText("<script>alert('xss')</script>");
 * // Retorna: ""
 * ```
 */
export function sanitizeText(input: string): string {
  // ...
}
```

## Perguntas?

- Abra uma [Discussion](https://github.com/yurisantos-y/text-to-prompt/discussions)
- Entre em contato através das Issues
- Consulte a [documentação](README.md)

## Agradecimentos

Obrigado por dedicar seu tempo para contribuir com o Text to Prompt! Cada contribuição, por menor que seja, faz uma grande diferença.

---

**Boas contribuições! 🚀**
