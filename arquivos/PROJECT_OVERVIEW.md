# Visão Geral do Projeto

Este documento fornece uma visão técnica detalhada do projeto Text to Prompt, sua arquitetura, decisões de design e implementações.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Stack Tecnológica](#stack-tecnológica)
- [Componentes Principais](#componentes-principais)
- [Fluxo de Dados](#fluxo-de-dados)
- [Segurança](#segurança)
- [Decisões de Design](#decisões-de-design)
- [Performance](#performance)

---

## Visão Geral

**Text to Prompt** é uma extensão de navegador que captura texto de campos de entrada em páginas web e o converte em prompts otimizados usando modelos de IA (OpenAI GPT-5 ou Google Gemini).

### Problema que Resolve

Usuários frequentemente precisam:
- Melhorar textos com IA
- Converter notas em formatos estruturados
- Processar informações de forma consistente
- Ter acesso rápido a IA sem sair da página

### Solução

Uma extensão que:
1. Detecta campos de texto automaticamente
2. Injeta um ícone discreto (🔦 lightbulb)
3. Oferece conversão com múltiplos modelos
4. Retorna resultados editáveis
5. Permite inserção direta no campo

---

## Arquitetura

### Visão de Alto Nível

```
┌─────────────────────────────────────────────────────┐
│                   Web Page (DOM)                     │
│  ┌──────────────┐  ┌──────────────┐                │
│  │ Input Field  │  │ Text Area    │  ...           │
│  └──────┬───────┘  └──────┬───────┘                │
│         │                  │                         │
│         └──────────┬───────┘                         │
│                    │                                 │
└────────────────────┼─────────────────────────────────┘
                     │
            ┌────────▼────────┐
            │  Content Script  │
            │  (Monitoring)    │
            └────────┬────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼────┐ ┌───▼────┐ ┌───▼────────┐
    │ Icon    │ │ Modal  │ │  Storage   │
    │Injection│ │ UI     │ │  Access    │
    └─────────┘ └───┬────┘ └───┬────────┘
                    │          │
                ┌───▼──────────▼───┐
                │   Secure Storage  │
                │  (chrome.storage) │
                └───────┬───────────┘
                        │
                ┌───────▼───────┐
                │   API Layer    │
                │  (api.ts)      │
                └───────┬────────┘
                        │
            ┌───────────┼───────────┐
            │           │           │
       ┌────▼─────┐ ┌──▼──────┐   │
       │ OpenAI   │ │ Gemini  │   │
       │   API    │ │   API   │   │
       └──────────┘ └─────────┘   │
```

### Componentes da Extensão

#### 1. Content Script
- **Arquivo**: `src/entrypoints/content/index.tsx`
- **Função**: Monitora e interage com páginas web
- **Responsabilidades**:
  - Detectar campos de texto
  - Injetar ícone de conversão
  - Renderizar modal React
  - Inserir texto convertido

#### 2. Popup
- **Arquivo**: `src/entrypoints/popup/App.tsx`
- **Função**: Interface de configuração
- **Responsabilidades**:
  - Configurar provedor de IA
  - Gerenciar API keys
  - Validar credenciais

#### 3. API Layer
- **Arquivo**: `src/utils/api.ts`
- **Função**: Integração com APIs de IA
- **Responsabilidades**:
  - Fazer requisições HTTP
  - Processar respostas
  - Gerenciar rate limiting
  - Tratar erros

#### 4. Security Layer
- **Arquivo**: `src/utils/security.ts`
- **Função**: Segurança e validação
- **Responsabilidades**:
  - Sanitizar entradas
  - Prevenir XSS e injection
  - Validar formatos
  - Rate limiting

#### 5. Storage Layer
- **Arquivo**: `src/utils/secureStorage.ts`
- **Função**: Armazenamento seguro
- **Responsabilidades**:
  - Salvar/ler configurações
  - Obfuscar API keys
  - Migrar dados legados

---

## Stack Tecnológica

### Core Framework
- **WXT** (v0.19.16): Framework moderno para extensões
  - Build system baseado em Vite
  - Hot Module Replacement (HMR)
  - Suporte multi-browser
  - Type-safe APIs

### Frontend
- **React** (v18.3.1): Biblioteca UI
- **TypeScript** (v5.3.3): Tipagem estática
- **TailwindCSS** (v3.4.1): Utility-first CSS
- **Shadcn/ui**: Componentes acessíveis
- **Lucide React** (v0.344): Ícones SVG

### Build & Dev Tools
- **Vite**: Bundler e dev server
- **PostCSS**: Processamento CSS
- **Autoprefixer**: Prefixos CSS automáticos

### APIs Externas
- **OpenAI API**: GPT-5 Nano
- **Google Gemini API**: Gemini 2.5 Flash

---

## Componentes Principais

### 1. ModalOptions Component

**Localização**: `src/components/ModalOptions.tsx`

Modal principal que gerencia a conversão de texto.

**Props**:
```typescript
interface ModalOptionsProps {
  open: boolean;           // Estado do modal
  onClose: () => void;     // Callback de fechamento
  text: string;            // Texto original
  onInsert: (text: string) => void; // Callback de inserção
}
```

**Estados**:
```typescript
const [selectedOption, setSelectedOption] = useState<PromptOption | null>(null);
const [convertedText, setConvertedText] = useState<string>('');
const [editableText, setEditableText] = useState<string>('');
const [isConverting, setIsConverting] = useState(false);
const [error, setError] = useState<string>('');
const [copied, setCopied] = useState(false);
```

**Modos de Conversão**:
1. **Text to English Prompt**: Resposta completa em inglês
2. **Text to JSON English Prompt**: JSON com chaves e valores em inglês
3. **Text to JSON Prompt**: JSON com chaves em inglês, valores na língua original

**Fluxo**:
1. Usuário seleciona um modo
2. `handleConvert()` é chamado
3. Texto é enviado para API via `convertText()`
4. Resposta é sanitizada e exibida
5. Usuário pode editar, copiar ou inserir

### 2. Secure Storage

**Localização**: `src/utils/secureStorage.ts`

Sistema de armazenamento seguro usando `chrome.storage.local`.

**Interface**:
```typescript
interface SecureSettings {
  provider: AIProvider;     // 'openai' | 'gemini'
  apiKey: string;           // Obfuscada em Base64
  isConfigured: boolean;    // Status de configuração
  lastUpdated?: number;     // Timestamp de atualização
}
```

**Métodos**:
- `getSettings()`: Recupera e desobfusca settings
- `saveSettings()`: Obfusca e salva settings
- `clearSettings()`: Remove todas as settings
- `migrateFromLocalStorage()`: Migra dados antigos

**Segurança**:
- Chrome criptografa `chrome.storage` nativamente
- Base64 adiciona camada de ofuscação
- Não usa `localStorage` (menos seguro)

### 3. API Integration

**Localização**: `src/utils/api.ts`

Camada de integração com APIs de IA.

**Função Principal**: `convertText()`

```typescript
export async function convertText(
  request: ConversionRequest
): Promise<{ result?: string; error?: string }>
```

**Processo**:
1. Valida formato da API key
2. Verifica rate limit (10 req/min)
3. Sanitiza entrada com `escapePromptInjection()`
4. Monta prompt com template apropriado
5. Faz requisição HTTP à API
6. Valida e sanitiza resposta
7. Limpa preambles e formatação
8. Retorna resultado ou erro

**Rate Limiting**:
```typescript
const apiRateLimiter = new RateLimiter(10, 60);
```

**Prompt Templates**:
- Sistema de templates para cada modo
- Instruções claras sobre formato esperado
- Regras para evitar preambles
- Configurações de temperatura e tokens

### 4. Security Utilities

**Localização**: `src/utils/security.ts`

Conjunto de funções de segurança.

**Principais Funções**:

#### sanitizeText()
Remove scripts, event handlers e protocolos perigosos.

```typescript
export function sanitizeText(input: string): string {
  // Remove <script> tags
  // Remove on* handlers
  // Remove javascript: protocol
  // Remove data: URIs
}
```

#### escapePromptInjection()
Previne ataques de prompt injection.

```typescript
export function escapePromptInjection(userInput: string): string {
  // Remove caracteres de controle
  // Limita tamanho (10.000 chars)
  // Detecta padrões de injeção
  // Loga tentativas suspeitas
}
```

#### RateLimiter Class
Implementa rate limiting com janela deslizante.

```typescript
class RateLimiter {
  constructor(maxRequests: number, timeWindowSeconds: number)
  canMakeRequest(): boolean
  getRemainingRequests(): number
  getResetTime(): number
}
```

#### isValidAPIUrl()
Whitelist de URLs de API permitidas.

```typescript
const allowedDomains = [
  'api.openai.com',
  'generativelanguage.googleapis.com'
];
```

---

## Fluxo de Dados

### 1. Configuração Inicial

```
User clicks extension icon
         ↓
Opens Popup UI (App.tsx)
         ↓
User selects Provider (OpenAI/Gemini)
         ↓
User enters API Key
         ↓
validateApiKey() makes test request
         ↓
If valid: secureStorage.saveSettings()
         ↓
Settings stored in chrome.storage.local
```

### 2. Detecção de Campos

```
Page loads
         ↓
Content Script executes
         ↓
MutationObserver watches DOM
         ↓
Detects input/textarea/contenteditable
         ↓
User focuses field
         ↓
Lightbulb icon injected (absolute positioning)
         ↓
Icon tracks field scroll/resize
```

### 3. Conversão de Texto

```
User clicks lightbulb icon
         ↓
ModalOptions renders (React Portal)
         ↓
Displays 3 conversion options
         ↓
User selects option
         ↓
handleConvert() called
         ↓
secureStorage.getSettings() - retrieve API key
         ↓
convertText() - API layer
    ↓
    validateApiKeyFormat() ✓
    ↓
    apiRateLimiter.canMakeRequest() ✓
    ↓
    escapePromptInjection() - sanitize input ✓
    ↓
    fetch() to OpenAI/Gemini API
    ↓
    safeJSONParse() - parse response ✓
    ↓
    cleanAIResponse() - remove preambles ✓
    ↓
    sanitizeText() - prevent XSS ✓
         ↓
Result displayed in editable textarea
         ↓
User can Edit / Copy / Insert
         ↓
If Insert: text inserted into original field
         ↓
Synthetic events dispatched for React compatibility
```

---

## Segurança

### Camadas de Proteção

#### 1. Input Validation
- Sanitização de entrada: `sanitizeText()`
- Escape de injeção: `escapePromptInjection()`
- Limite de tamanho: 10.000 caracteres
- Remoção de caracteres de controle

#### 2. XSS Prevention
- Remoção de `<script>` tags
- Bloqueio de event handlers (`onclick`, etc)
- Filtragem de `javascript:` protocol
- Bloqueio de `data:` URIs perigosas

#### 3. Prompt Injection Defense
- Detecção de padrões suspeitos
- Logging de tentativas
- Validação de sistema de mensagens
- Templates de prompt seguros

#### 4. API Security
- Validação de formato de keys
- Whitelist de URLs permitidas
- HTTPS obrigatório
- Sanitização de erros

#### 5. Rate Limiting
- 10 requisições por 60 segundos
- Janela deslizante
- Proteção contra abuso
- Mensagens de erro claras

#### 6. Secure Storage
- `chrome.storage.local` (criptografado pelo browser)
- Ofuscação Base64 adicional
- Sem plain text em localStorage
- Migração automática de dados antigos

#### 7. CSP (Content Security Policy)
- Definido no manifest
- Bloqueio de inline scripts
- Whitelist de recursos
- Proteção contra eval()

### Threat Model

**Ameaças Mitigadas**:
- ✅ XSS (Cross-Site Scripting)
- ✅ Prompt Injection
- ✅ SSRF (Server-Side Request Forgery)
- ✅ API Key Leakage
- ✅ Rate Limit Abuse
- ✅ Token Exhaustion Attacks

**Não Mitigado**:
- ⚠️ User instala extensão maliciosa (confiança no Chrome Web Store)
- ⚠️ Comprometimento do navegador
- ⚠️ API keys compartilhadas pelo usuário

---

## Decisões de Design

### 1. Por que WXT?

**Alternativas consideradas**: Plasmo, raw Webpack

**Escolhido**: WXT

**Razões**:
- ✅ Hot Module Replacement out-of-the-box
- ✅ Type-safe APIs
- ✅ Multi-browser support nativo
- ✅ Build otimizado com Vite
- ✅ Estrutura clara de entrypoints
- ✅ Ótima DX (Developer Experience)

### 2. Por que React?

**Alternativas**: Vue, Svelte, Vanilla JS

**Escolhido**: React

**Razões**:
- ✅ Ecossistema maduro
- ✅ Shadcn/ui disponível
- ✅ Hooks para gerenciamento de estado
- ✅ React Portals para injection
- ✅ Grande comunidade

### 3. Por que chrome.storage?

**Alternativa**: localStorage

**Escolhido**: chrome.storage.local

**Razões**:
- ✅ Criptografia nativa do browser
- ✅ Sincronização entre contextos
- ✅ Não afetado por clear cookies
- ✅ Recomendado para extensões
- ❌ API assíncrona (mais complexa)

### 4. Por que não Background Script?

**Alternativa**: Service Worker em Manifest V3

**Escolhido**: Sem background script

**Razões**:
- ✅ Arquitetura mais leve
- ✅ Menos overhead de memória
- ✅ Content script suficiente para uso
- ✅ Reduz complexidade
- ❌ Sem processamento contínuo (não necessário)

### 5. Detecção de Campos

**Implementação**: MutationObserver + Event Listeners

**Alternativa**: Polling periódico

**Razões**:
- ✅ Mais eficiente (event-driven)
- ✅ Detecta conteúdo dinâmico
- ✅ Menor uso de CPU
- ✅ Resposta imediata

### 6. WeakMap para Tracking

**Implementação**: WeakMap<HTMLElement, HTMLElement>

**Alternativa**: Map ou Array

**Razões**:
- ✅ Garbage collection automático
- ✅ Previne memory leaks
- ✅ Não impede remoção de elementos do DOM
- ✅ Performance superior

---

## Performance

### Otimizações Implementadas

#### 1. Build Size
- **Tree shaking**: Vite remove código não usado
- **Code splitting**: WXT gera chunks otimizados
- **CSS purging**: Tailwind remove classes não usadas
- **Minificação**: Código minificado em produção

**Resultado**: ~500KB total (descompactado)

#### 2. Runtime Performance
- **WeakMap**: Evita memory leaks
- **Event delegation**: Menos listeners
- **Debouncing**: Em resize/scroll
- **Lazy rendering**: Modal só renderiza quando aberto

#### 3. Network
- **Rate limiting**: Previne requisições excessivas
- **Caching**: Settings cacheadas localmente
- **Timeout**: Requisições com timeout
- **Error recovery**: Retry logic para falhas temporárias

#### 4. Memory
- **Cleanup**: Listeners removidos ao unmount
- **WeakMap**: Referências fracas
- **Portal cleanup**: DOM limpo ao fechar modal
- **State reset**: Estados limpos entre usos

---

## Limitações Conhecidas

### Técnicas
1. **SPA Detection**: Frameworks JS podem interferir
2. **Shadow DOM**: Campos em shadow DOM não detectados
3. **iframes**: Não funciona dentro de iframes
4. **Estilos conflitantes**: CSS da página pode afetar ícone

### APIs
1. **Rate Limits**: APIs têm seus próprios limites
2. **Latência**: Depende de velocidade da internet
3. **Custos**: OpenAI cobra por uso
4. **Token limits**: Respostas limitadas a 2000 tokens

### Browser
1. **Firefox temporário**: Extensão precisa ser recarregada
2. **Manifest V2 vs V3**: Diferenças entre browsers
3. **Permissões**: Requer aprovação do usuário

---

## Roadmap Futuro

### Features Planejadas
- [ ] Suporte para mais provedores (Anthropic, Cohere)
- [ ] Templates customizados pelo usuário
- [ ] Histórico de conversões
- [ ] Atalhos de teclado
- [ ] Dark mode automático
- [ ] Sincronização entre dispositivos

### Melhorias Técnicas
- [ ] Testes unitários e E2E
- [ ] CI/CD pipeline
- [ ] Monitoramento de erros (Sentry)
- [ ] Analytics (privacy-friendly)
- [ ] Web Workers para processamento

---

## Recursos Adicionais

- [README Principal](README.md)
- [Guia de Instalação](INSTALLATION.md)
- [Política de Segurança](SECURITY.md)
- [Guia de Contribuição](CONTRIBUTING.md)
- [Documentação Técnica (steering/)](steering/)

---

**Mantido pela comunidade Text to Prompt**
