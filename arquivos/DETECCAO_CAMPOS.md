# Detecção de Campos

Documentação técnica sobre como o Text to Prompt detecta e interage com campos de texto em páginas web.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tipos de Campos Suportados](#tipos-de-campos-suportados)
- [Mecanismo de Detecção](#mecanismo-de-detecção)
- [Injeção de Ícone](#injeção-de-ícone)
- [Posicionamento](#posicionamento)
- [Performance](#performance)
- [Limitações](#limitações)

---

## Visão Geral

O Text to Prompt utiliza um **content script** que executa em todas as páginas web para detectar campos de texto editáveis e injetar um ícone de conversão.

**Localização**: `src/entrypoints/content/index.tsx`

### Fluxo de Trabalho

```
Page loads
    ↓
Content Script executes
    ↓
Event Listeners + MutationObserver setup
    ↓
User focuses field
    ↓
isTextField() validation ✓
    ↓
Icon injected with fade-in
    ↓
User clicks icon
    ↓
Modal opens with conversion options
```

---

## Tipos de Campos Suportados

### 1. Input Elements

```html
<!-- Text inputs (default) -->
<input type="text">

<!-- Specialized text inputs -->
<input type="email">
<input type="search">
<input type="tel">
<input type="url">
<input type="password">
<input type="number">
<input type="date">
```

**Validação**:
```typescript
if (element instanceof HTMLInputElement) {
  const type = element.type.toLowerCase();
  const excludedTypes = [
    'checkbox', 'radio', 'file', 'submit', 
    'button', 'image', 'hidden', 'range', 
    'reset', 'color'
  ];
  return !excludedTypes.includes(type);
}
```

**Exclusões**:
- Campos `disabled` ou `readOnly`
- Tipos não-textuais (checkbox, radio, file, etc.)

### 2. Textarea Elements

```html
<textarea></textarea>
<textarea rows="5" cols="50"></textarea>
```

**Validação**:
```typescript
if (element instanceof HTMLTextAreaElement) {
  return true;
}
```

Sempre aceito, exceto se `disabled` ou `readOnly`.

### 3. ContentEditable Elements

```html
<!-- Atributo boolean -->
<div contenteditable></div>
<div contenteditable="true"></div>

<!-- Modo plaintext -->
<div contenteditable="plaintext-only"></div>

<!-- Property -->
<div id="editor"></div>
<script>
  document.getElementById('editor').contentEditable = true;
</script>
```

**Validação**:
```typescript
// Via property
if (element.isContentEditable) {
  return true;
}

// Via attribute
if (element.hasAttribute('contenteditable')) {
  const value = element.getAttribute('contenteditable');
  return value === 'true' || value === '' || value === 'plaintext-only';
}
```

### 4. ARIA Textbox Role

```html
<div role="textbox"></div>
<div role="searchbox"></div>
```

**Validação**:
```typescript
const role = element.getAttribute('role');
if (role === 'textbox' || role === 'searchbox') {
  return true;
}
```

Elementos com role ARIA de textbox são reconhecidos.

### 5. Design Mode

```html
<iframe></iframe>
<script>
  iframe.contentDocument.designMode = 'on';
</script>
```

**Validação**:
```typescript
if (element.ownerDocument && 
    element.ownerDocument.designMode === 'on') {
  return true;
}
```

Documentos em modo de design (editores WYSIWYG).

---

## Mecanismo de Detecção

### Event Listeners

O content script usa **event delegation** para eficiência:

```typescript
// Detecta quando campo recebe foco
document.addEventListener('focusin', handleFocus, true);

// Detecta quando campo perde foco
document.addEventListener('focusout', handleBlur, true);
```

**Captura (`true`)**: Eventos capturados na fase de captura para funcionar mesmo em campos dentro de Shadow DOM parcial.

### Focus Handler

```typescript
function handleFocus(event: FocusEvent): void {
  const target = event.target as HTMLElement;
  
  // Valida se é campo de texto
  if (isTextField(target)) {
    focusedField = target;
    const icon = createIcon(target);
    
    // Fade-in com delay
    setTimeout(() => {
      if (!isModalOpen) {
        icon.style.opacity = '1';
      }
    }, 100);
  }
}
```

**Por que o delay?**
- Evita flash visual
- Permite que modal aberto não mostre ícone
- Melhora percepção de suavidade

### Blur Handler

```typescript
function handleBlur(event: FocusEvent): void {
  const target = event.target as HTMLElement;
  
  setTimeout(() => {
    if (activeIcons.has(target) && target !== focusedField) {
      const icon = activeIcons.get(target)!;
      icon.style.opacity = '0';
      
      // Cleanup após fade-out
      setTimeout(() => {
        if (icon.style.opacity === '0' && icon.parentElement) {
          icon.remove();
          activeIcons.delete(target);
        }
      }, 200);
    }
  }, 100);
}
```

**Delays**:
- 100ms inicial: Previne remoção prematura durante clique
- 200ms cleanup: Permite animação de fade-out completar

### MutationObserver

Para detectar campos adicionados dinamicamente (SPAs):

```typescript
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node instanceof HTMLElement) {
        // Verifica o nó
        if (isTextField(node)) {
          // Ícone criado no focus
        }
        
        // Verifica descendentes
        const textFields = node.querySelectorAll(
          'input, textarea, [contenteditable], ' +
          '[role="textbox"], [role="searchbox"]'
        );
        textFields.forEach((field) => {
          if (isTextField(field as HTMLElement)) {
            // Ícone criado no focus
          }
        });
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,  // Nós adicionados/removidos
  subtree: true,    // Toda a árvore
});
```

**Performance**:
- Não executa código pesado no observer
- Apenas marca campos para detecção
- Ícone criado apenas no focus

---

## Injeção de Ícone

### Criação do Ícone

```typescript
function createIcon(field: HTMLElement): HTMLDivElement {
  // Previne duplicatas
  if (activeIcons.has(field)) {
    const existingIcon = activeIcons.get(field)!;
    updateIconPosition(existingIcon, field);
    return existingIcon;
  }

  const icon = document.createElement('div');
  icon.className = 'text-to-prompt-icon';
  
  // Estilos inline para isolamento
  icon.style.cssText = `
    position: fixed;
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483647;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    pointer-events: auto;
    border: 1px solid rgba(0, 0, 0, 0.06);
  `;

  // SVG inline do lightbulb
  const lightbulbSvg = createLightbulbSVG();
  icon.appendChild(lightbulbSvg);

  // Posiciona
  updateIconPosition(icon, field);

  // Event handlers
  icon.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    currentField = field;
    const text = getTextFromField(field);
    openModal(text);
  });

  // Efeito hover
  icon.addEventListener('mouseenter', () => {
    icon.style.transform = 'scale(1.1)';
  });
  icon.addEventListener('mouseleave', () => {
    icon.style.transform = 'scale(1)';
  });

  // Injeta no body (não no campo)
  document.body.appendChild(icon);
  activeIcons.set(field, icon);

  return icon;
}
```

### Lightbulb SVG

```typescript
function createLightbulbSVG(): SVGElement {
  const svg = document.createElementNS(
    'http://www.w3.org/2000/svg', 'svg'
  );
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', '#FF6200');
  svg.setAttribute('stroke-width', '2');
  
  // Bulb
  const bulb = document.createElementNS(
    'http://www.w3.org/2000/svg', 'path'
  );
  bulb.setAttribute(
    'd', 
    'M15 14c.5-1 .5-2 .5-3a4.5 4.5 0 1 0-9 0c0 1 0 2 .5 3'
  );
  bulb.setAttribute('fill', '#FFE5CC');
  bulb.setAttribute('fill-opacity', '0.4');
  
  // Linhas da base...
  svg.appendChild(bulb);
  // ...outros elementos
  
  return svg;
}
```

**Por que inline SVG?**
- Não requer assets externos
- Funciona em qualquer página
- Customizável via código
- Não depende de CSP da página

---

## Posicionamento

### Posição Fixa

```typescript
function updateIconPosition(
  icon: HTMLDivElement, 
  field: HTMLElement
): void {
  const rect = field.getBoundingClientRect();
  
  // Bottom-right do campo
  icon.style.top = `${rect.bottom - 32}px`;
  icon.style.left = `${rect.right - 32}px`;
}
```

**`position: fixed`**:
- Relativo ao viewport
- Não afetado por scroll do parent
- Permanece visível durante scroll

**Cálculo**:
- `rect.bottom - 32`: 32px do fundo (28px ícone + 4px padding)
- `rect.right - 32`: 32px da direita

### Atualização de Posição

Ícone atualiza em:

1. **Scroll**:
```typescript
window.addEventListener('scroll', updatePositions, true);
```

2. **Resize**:
```typescript
window.addEventListener('resize', updatePositions);
```

3. **Debouncing**:
```typescript
let scrollTimeout: number;
const updatePositions = () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = window.setTimeout(() => {
    activeIcons.forEach((icon, field) => {
      if (icon.style.opacity === '1') {
        updateIconPosition(icon, field);
      }
    });
  }, 10);
};
```

**Por que debounce?**
- Evita cálculos excessivos durante scroll rápido
- Melhora performance
- 10ms é imperceptível ao usuário

---

## Performance

### Map para Tracking

```typescript
const activeIcons = new Map<HTMLElement, HTMLDivElement>();
```

**Por que não WeakMap?**
- WeakMap ideal, mas keys são removidas antes do cleanup
- Map regular com cleanup manual é mais confiável
- Pequeno risco de memory leak mitigado por cleanup no blur

### Prevenção de Duplicatas

```typescript
if (activeIcons.has(field)) {
  const existingIcon = activeIcons.get(field)!;
  updateIconPosition(existingIcon, field);
  return existingIcon;
}
```

Apenas um ícone por campo.

### Event Delegation

Usa 2 listeners globais em vez de N listeners por campo:
```typescript
document.addEventListener('focusin', handleFocus, true);
document.addEventListener('focusout', handleBlur, true);
```

### Lazy Icon Creation

Ícones criados apenas quando campo recebe foco, não na detecção.

### Selective Updates

```typescript
if (icon.style.opacity === '1') {
  updateIconPosition(icon, field);
}
```

Atualiza posição apenas de ícones visíveis.

---

## Limitações

### 1. Shadow DOM

**Problema**: Shadow DOM fechado não é acessível via query selectors.

**Workaround**: Event listeners globais capturam alguns eventos que "vazam" do Shadow DOM.

**Limitação**: Campos em Shadow DOM fechado podem não ser detectados.

### 2. iframes

**Problema**: Content scripts não executam automaticamente em iframes de origens diferentes.

**Solução**: Precisa permissões explícitas ou iframe same-origin.

**Limitação**: Campos dentro de iframes cross-origin não são detectados.

### 3. SPAs Complexos

**Problema**: Frameworks rápidos (React, Vue) podem re-renderizar antes do observer detectar.

**Workaround**: Focus handlers capturam na segunda tentativa.

**Limitação**: Flash visual ocasional.

### 4. Campos Customizados

**Problema**: Elementos que "parecem" inputs mas usam div + JavaScript.

**Exemplo**:
```html
<div class="custom-input" onclick="showKeyboard()">
  <span>User input here</span>
</div>
```

**Limitação**: Sem role ARIA ou contenteditable, não são detectados.

### 5. Z-index Conflicts

**Problema**: Páginas com `z-index` extremamente alto podem sobrepor ícone.

**Solução**: Usamos `z-index: 2147483647` (máximo seguro).

**Limitação**: Valores mais altos (via !important) podem sobrepor.

### 6. Overlay Modals

**Problema**: Modals/overlays da página podem cobrir ícone.

**Workaround**: Ícone some no blur e reaparece no focus.

**Limitação**: Em modals que mantêm focus no campo original, ícone pode ficar oculto.

---

## Extração de Texto

### Input e Textarea

```typescript
if (field instanceof HTMLInputElement || 
    field instanceof HTMLTextAreaElement) {
  return field.value;
}
```

Propriedade `.value` padrão.

### ContentEditable

```typescript
return field.innerText || field.textContent || '';
```

- `innerText`: Preserva quebras de linha visíveis
- `textContent`: Fallback sem formatação
- Preferimos `innerText` para melhor UX

---

## Inserção de Texto

### Input e Textarea

```typescript
field.value = text;
field.dispatchEvent(new Event('input', { bubbles: true }));
field.dispatchEvent(new Event('change', { bubbles: true }));
```

**Eventos sintéticos**:
- `input`: Para frameworks como React
- `change`: Para formulários nativos

### ContentEditable

```typescript
field.innerText = text;
field.dispatchEvent(new Event('input', { bubbles: true }));
```

Dispara evento para notificar frameworks.

---

## Debugging

### Console Logs

```typescript
console.log('[Text to Prompt] Content script initialized');
```

Verifica se script foi injetado.

### Inspecionar Map

No console do navegador:
```javascript
// Não funciona diretamente, mas pode adicionar:
window.__textToPromptDebug = {
  getActiveIcons: () => activeIcons,
  getModalState: () => isModalOpen,
  getCurrentField: () => currentField
};
```

### DevTools

1. Abra DevTools (F12)
2. Tab "Elements"
3. Procure por `.text-to-prompt-icon`
4. Inspecione estilos e posição

---

## Melhorias Futuras

### Sugestões

1. **Shadow DOM melhorado**: Detectar Shadow DOM aberto recursivamente
2. **iframe messaging**: Comunicação cross-origin via postMessage
3. **Custom elements registry**: Detectar web components registrados
4. **Mutation resumption**: Pausar observer durante operações pesadas
5. **Intersection Observer**: Detectar visibilidade antes de mostrar ícone

---

**Para mais informações, consulte:**
- [Código Fonte](src/entrypoints/content/index.tsx)
- [Visão Geral do Projeto](PROJECT_OVERVIEW.md)
- [Guia de Instalação](INSTALLATION.md)
