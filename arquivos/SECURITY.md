# Política de Segurança

## Reportando Vulnerabilidades de Segurança

A segurança dos usuários da extensão Text to Prompt é nossa prioridade máxima. Valorizamos imensamente o trabalho da comunidade de segurança e encorajamos a divulgação responsável de quaisquer problemas de segurança encontrados.

### Como Reportar

Se você descobriu uma vulnerabilidade de segurança, por favor, **NÃO** abra uma issue pública. Em vez disso:

1. **Envie um e-mail para**: [yuri01.sp@gmail.com] ou crie uma **Security Advisory** privada no GitHub
2. **Inclua detalhes**:
   - Descrição da vulnerabilidade
   - Passos para reproduzir
   - Versões afetadas
   - Possível impacto
   - Sugestões de correção (se houver)

### O que Esperar

- **Confirmação inicial**: Dentro de 48 horas
- **Avaliação da vulnerabilidade**: Dentro de 7 dias
- **Correção e release**: Dependendo da severidade
  - Crítica: 1-7 dias
  - Alta: 7-14 dias
  - Média/Baixa: 14-30 dias

### Programa de Reconhecimento

Atualmente não oferecemos recompensas monetárias, mas todos os pesquisadores que reportarem vulnerabilidades válidas serão:
- Creditados no arquivo CHANGELOG (se desejarem)
- Listados em nossa página de agradecimentos
- Notificados quando a correção for publicada

## Implementações de Segurança

A extensão Text to Prompt implementa múltiplas camadas de segurança para proteger os usuários:

### 1. Proteção contra XSS (Cross-Site Scripting)

**Localização**: `src/utils/security.ts`

- **Sanitização de entrada**: Todas as entradas de usuário são sanitizadas através da função `sanitizeText()`
- **Remoção de scripts**: Tags `<script>`, event handlers (`onclick`, etc.) e protocolos perigosos (`javascript:`) são removidos
- **Sanitização HTML**: Apenas tags básicas de formatação são permitidas via `sanitizeHTML()`

```typescript
// Exemplo de uso
const cleanInput = sanitizeText(userInput);
```

### 2. Prevenção de Prompt Injection

**Localização**: `src/utils/security.ts`

- **Escape de entrada**: Função `escapePromptInjection()` neutraliza tentativas de injeção
- **Detecção de padrões**: Identifica comandos comuns de injeção
- **Limite de tamanho**: Máximo de 10.000 caracteres para prevenir ataques de exaustão de tokens
- **Remoção de caracteres de controle**: Caracteres especiais são filtrados

```typescript
// Padrões detectados
- "ignore previous instructions"
- "disregard all"
- "system:"
- "[SYSTEM]"
```

### 3. Armazenamento Seguro

**Localização**: `src/utils/secureStorage.ts`

- **Chrome Storage API**: Usa `chrome.storage.local` em vez de `localStorage`
- **Criptografia nativa**: Chrome criptografa dados em repouso automaticamente
- **Ofuscação adicional**: API keys são codificadas em Base64
- **Rotação de chaves**: Timestamp de última atualização rastreado

```typescript
// Uso seguro
await secureStorage.saveSettings(provider, apiKey, true);
const settings = await secureStorage.getSettings();
```

### 4. Rate Limiting

**Localização**: `src/utils/security.ts`

- **Limite de requisições**: Máximo de 10 requisições por 60 segundos
- **Proteção contra abuso**: Previne uso excessivo da API
- **Janela deslizante**: Sistema de janela de tempo deslizante

```typescript
const limiter = new RateLimiter(10, 60);
if (limiter.canMakeRequest()) {
  // Processar requisição
}
```

### 5. Content Security Policy (CSP)

**Localização**: `wxt.config.ts` e manifestos

- **Política rigorosa**: Apenas recursos de origens confiáveis
- **Bloqueio de inline scripts**: Scripts inline são bloqueados
- **HTTPS obrigatório**: Apenas conexões HTTPS permitidas

### 6. Validação de API

**Localização**: `src/utils/api.ts` e `src/utils/security.ts`

- **Formato de chaves**: Validação via `validateApiKeyFormat()`
  - OpenAI: Deve começar com `sk-` e ter no mínimo 20 caracteres
  - Gemini: Mínimo 20 caracteres alfanuméricos
- **Whitelist de URLs**: Apenas domínios permitidos via `isValidAPIUrl()`
  - `api.openai.com`
  - `generativelanguage.googleapis.com`
- **HTTPS obrigatório**: Protocolo HTTP bloqueado
- **Proteção SSRF**: Server-Side Request Forgery prevenida

```typescript
// Validação de URL
const allowedDomains = [
  'api.openai.com',
  'generativelanguage.googleapis.com'
];
```

### 7. Sanitização de Erros

**Localização**: `src/utils/security.ts`

- **Remoção de informações sensíveis**: API keys e credenciais filtradas de erros
- **Mensagens genéricas**: Erros específicos são generalizados
- **Prevenção de vazamento de informações**: Stack traces não expostos ao usuário

```typescript
// API keys são mascaradas em erros
message.replace(/sk-[A-Za-z0-9]{20,}/g, 'sk-***');
```

### 8. Permissões Mínimas

**Localização**: Manifest files

A extensão solicita apenas as permissões absolutamente necessárias:
- `storage`: Para salvar configurações
- `activeTab`: Para acessar o campo de texto ativo
- Sem permissões de `tabs` desnecessárias
- Sem permissões de `webRequest`

## Práticas de Segurança Recomendadas

### Para Usuários

1. **API Keys**:
   - Nunca compartilhe suas API keys
   - Use keys com escopo limitado quando possível
   - Revogue keys antigas periodicamente
   - Monitore uso através do dashboard do provedor

2. **Instalação**:
   - Instale apenas de fontes confiáveis (Chrome Web Store, AMO)
   - Verifique as permissões solicitadas antes de instalar
   - Mantenha a extensão sempre atualizada

3. **Uso**:
   - Não insira informações extremamente sensíveis (senhas, números de cartão)
   - Revise o conteúdo antes de enviar para APIs externas
   - Use em ambientes confiáveis

### Para Desenvolvedores

1. **Code Review**:
   - Todo código relacionado à segurança requer revisão
   - Mudanças em `security.ts` e `secureStorage.ts` requerem atenção especial

2. **Testes**:
   - Teste todas as funções de sanitização
   - Verifique rate limiting
   - Valide tratamento de erros

3. **Atualizações**:
   - Mantenha dependências atualizadas
   - Monitore avisos de segurança do npm
   - Use `npm audit` regularmente

## Versões Suportadas

| Versão | Suportada          |
| ------ | ------------------ |
| 1.0.x  | :white_check_mark: |
| < 1.0  | :x:                |

## Histórico de Segurança

Nenhuma vulnerabilidade reportada até o momento.

## Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Chrome Extension Security](https://developer.chrome.com/docs/extensions/mv3/security/)
- [Documentação de Segurança Detalhada](SECURITY_ENHANCEMENTS.md)
- [Guia Rápido de Segurança](SECURITY_QUICK_REFERENCE.md)

## Contato

Para questões gerais de segurança (não vulnerabilidades críticas):
- Abra uma discussão no GitHub
- Entre em contato através das issues

---

**Última atualização**: Novembro 2024

Obrigado por ajudar a manter o Text to Prompt seguro para todos!
