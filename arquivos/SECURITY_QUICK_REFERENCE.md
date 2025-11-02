# Guia Rápido de Segurança

Referência rápida de funções e práticas de segurança do Text to Prompt.

## 🛡️ Funções de Segurança

### Sanitização

```typescript
import { sanitizeText, sanitizeHTML } from '@/utils/security';

// Remover scripts e handlers
const clean = sanitizeText(userInput);

// Permitir apenas HTML básico
const safeHtml = sanitizeHTML('<p onclick="bad">Text</p>');
// Resultado: '<p>Text</p>'
```

### Escape de Prompt Injection

```typescript
import { escapePromptInjection } from '@/utils/security';

const escaped = escapePromptInjection(userInput);
// Remove caracteres de controle
// Limita tamanho a 10.000 chars
// Detecta padrões de injeção
```

### Validação de API Keys

```typescript
import { validateApiKeyFormat } from '@/utils/security';

// OpenAI
if (validateApiKeyFormat('openai', key)) {
  // Key válida: sk-* com 20+ chars
}

// Gemini
if (validateApiKeyFormat('gemini', key)) {
  // Key válida: alfanumérico, 20+ chars
}
```

### Validação de URLs

```typescript
import { isValidAPIUrl } from '@/utils/security';

if (isValidAPIUrl(url)) {
  // URL válida:
  // - HTTPS obrigatório
  // - Domínio whitelisted
  // - api.openai.com OU
  // - generativelanguage.googleapis.com
}
```

### Rate Limiting

```typescript
import { RateLimiter } from '@/utils/security';

const limiter = new RateLimiter(10, 60); // 10 req/min

if (limiter.canMakeRequest()) {
  // Processar requisição
} else {
  const resetTime = limiter.getResetTime();
  // Mostrar erro com tempo restante
}
```

### Sanitização de Erros

```typescript
import { sanitizeErrorMessage } from '@/utils/security';

try {
  // Código que pode falhar
} catch (error) {
  const safeError = sanitizeErrorMessage(error);
  // Erro sem informações sensíveis
  showError(safeError);
}
```

### JSON Seguro

```typescript
import { safeJSONParse } from '@/utils/security';

const result = safeJSONParse<MyType>(jsonString);
if (result.success) {
  // Use result.data
} else {
  // Use result.error
}
```

### Random Seguro

```typescript
import { generateSecureRandom } from '@/utils/security';

const nonce = generateSecureRandom(32);
// 32 bytes de dados aleatórios seguros
```

---

## 📦 Armazenamento Seguro

### Salvar Settings

```typescript
import { secureStorage } from '@/utils/secureStorage';

await secureStorage.saveSettings(
  'openai',           // provider
  'sk-xxxxx',         // apiKey (será ofuscada)
  true                // isConfigured
);
```

### Ler Settings

```typescript
const settings = await secureStorage.getSettings();

if (settings) {
  console.log(settings.provider);   // 'openai' | 'gemini'
  console.log(settings.apiKey);     // Já deofuscada
  console.log(settings.isConfigured); // boolean
}
```

### Limpar Settings

```typescript
await secureStorage.clearSettings();
```

### Migrar de localStorage

```typescript
// Verifica se há dados antigos
if (secureStorage.hasLegacyStorage()) {
  // Migra automaticamente
  await secureStorage.migrateFromLocalStorage();
}
```

---

## ✅ Checklist de Segurança

### Para Novas Features

- [ ] Toda entrada de usuário é sanitizada via `sanitizeText()`
- [ ] Entrada para API usa `escapePromptInjection()`
- [ ] Validação de formato com `validateApiKeyFormat()`
- [ ] URLs validadas com `isValidAPIUrl()`
- [ ] Rate limiting implementado para ações custosas
- [ ] Erros sanitizados com `sanitizeErrorMessage()`
- [ ] Nenhum uso de `eval()` ou `Function()`
- [ ] Nenhum `innerHTML` com dados não confiáveis
- [ ] Nenhum inline script ou event handler
- [ ] API keys via `secureStorage`, nunca plain text

### Para Code Review

- [ ] Imports de segurança presentes?
- [ ] Validações antes de processar dados?
- [ ] Try-catch com sanitização de erros?
- [ ] Nenhum log de informações sensíveis?
- [ ] Tipos TypeScript para prevenir erros?
- [ ] Testes de casos extremos (empty, null, malicious)?

---

## 🚨 Red Flags

### ❌ Nunca Faça Isso

```typescript
// ❌ innerHTML com dados do usuário
element.innerHTML = userInput;

// ❌ eval() ou Function()
eval(userCode);

// ❌ API key hardcoded
const apiKey = 'sk-1234567890';

// ❌ localStorage para dados sensíveis
localStorage.setItem('apiKey', key);

// ❌ Requisições HTTP (não HTTPS)
fetch('http://api.example.com');

// ❌ Confiar em entrada sem validação
processData(userInput);

// ❌ Expor stack traces ao usuário
alert(error.stack);
```

### ✅ Faça Isso Sempre

```typescript
// ✅ textContent ou innerText
element.textContent = sanitizeText(userInput);

// ✅ Secure storage
await secureStorage.saveSettings(provider, key, true);

// ✅ HTTPS obrigatório
if (url.startsWith('https://')) { ... }

// ✅ Validar antes de processar
const clean = sanitizeText(userInput);
const escaped = escapePromptInjection(clean);

// ✅ Sanitizar erros
const safeError = sanitizeErrorMessage(error);
showToast(safeError);
```

---

## 🔍 Padrões Comuns

### Processar Entrada de Usuário

```typescript
// 1. Sanitizar
const clean = sanitizeText(userInput);

// 2. Validar tamanho
if (clean.length > MAX_LENGTH) {
  return { error: 'Input too long' };
}

// 3. Escape para API
const escaped = escapePromptInjection(clean);

// 4. Processar
const result = await processAPI(escaped);

// 5. Sanitizar saída
const safeResult = sanitizeText(result);

return safeResult;
```

### Fazer Requisição de API

```typescript
// 1. Validar key
if (!validateApiKeyFormat(provider, apiKey)) {
  return { error: 'Invalid API key format' };
}

// 2. Validar URL
if (!isValidAPIUrl(apiUrl)) {
  return { error: 'Invalid API endpoint' };
}

// 3. Check rate limit
if (!rateLimiter.canMakeRequest()) {
  return { error: 'Rate limit exceeded' };
}

// 4. Fazer requisição
try {
  const response = await fetch(apiUrl, { ... });
  // ...
} catch (error) {
  return { 
    error: sanitizeErrorMessage(error) 
  };
}
```

### Salvar Configurações

```typescript
// 1. Validar formato
if (!validateApiKeyFormat(provider, apiKey)) {
  showError('Invalid API key format');
  return;
}

// 2. Testar key (opcional)
const validation = await validateApiKey(provider, apiKey);
if (!validation.valid) {
  showError(validation.error);
  return;
}

// 3. Salvar com segurança
await secureStorage.saveSettings(provider, apiKey, true);

showSuccess('Settings saved!');
```

---

## 📊 Métricas de Segurança

### Avaliar Risco

| Ação | Risco | Mitigação Necessária |
|------|-------|---------------------|
| Exibir texto do usuário | Médio | `sanitizeText()` |
| Enviar para API | Alto | `escapePromptInjection()` |
| Salvar API key | Alto | `secureStorage` |
| Processar resposta da API | Médio | `sanitizeText()` |
| Fazer requisição HTTP | Alto | `isValidAPIUrl()` + HTTPS |
| Múltiplas requisições | Médio | `RateLimiter` |
| Mostrar erro ao usuário | Baixo | `sanitizeErrorMessage()` |

---

## 🧪 Testes Rápidos

### Testar Sanitização

```typescript
// Console do navegador
import { sanitizeText } from '@/utils/security';

// Teste XSS
console.log(sanitizeText('<script>alert(1)</script>'));
// Esperado: ''

console.log(sanitizeText('<img src=x onerror=alert(1)>'));
// Esperado: '<img src=x >'
```

### Testar Rate Limiter

```typescript
const limiter = new RateLimiter(3, 10); // 3 req/10s

console.log(limiter.canMakeRequest()); // true
console.log(limiter.canMakeRequest()); // true
console.log(limiter.canMakeRequest()); // true
console.log(limiter.canMakeRequest()); // false

console.log(limiter.getRemainingRequests()); // 0
console.log(limiter.getResetTime()); // ~10000ms
```

### Testar Validação

```typescript
import { 
  validateApiKeyFormat, 
  isValidAPIUrl 
} from '@/utils/security';

// OpenAI
console.log(validateApiKeyFormat('openai', 'sk-1234567890123456789012345'));
// true

console.log(validateApiKeyFormat('openai', 'invalid'));
// false

// URLs
console.log(isValidAPIUrl('https://api.openai.com/v1/chat'));
// true

console.log(isValidAPIUrl('http://evil.com'));
// false (não HTTPS)
```

---

## 📚 Recursos

### Documentação Completa

- [Política de Segurança](SECURITY.md) - Reportar vulnerabilidades
- [Melhorias de Segurança](SECURITY_ENHANCEMENTS.md) - Implementações detalhadas
- [Código Fonte](src/utils/security.ts) - Implementação

### Referências Externas

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Chrome Extension Security](https://developer.chrome.com/docs/extensions/mv3/security/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

## 💡 Dicas Rápidas

1. **Sempre sanitize**: Se vier do usuário, sanitize
2. **Defense in depth**: Múltiplas camadas > uma forte
3. **Fail secure**: Se falhar, falhe com segurança
4. **Least privilege**: Apenas permissões necessárias
5. **Keep updated**: Dependências sempre atualizadas
6. **Log security events**: Monitore tentativas suspeitas
7. **Review code**: Segurança requer atenção humana

---

**Consulte a [documentação completa](SECURITY.md) para mais detalhes sobre segurança.**
