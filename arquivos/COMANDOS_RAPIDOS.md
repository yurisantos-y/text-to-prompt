# Comandos Rápidos

Referência rápida de comandos para desenvolvimento do Text to Prompt.

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Ou com pnpm (mais rápido)
pnpm install
```

## 🚀 Desenvolvimento

```bash
# Iniciar servidor dev para Chrome
npm run dev

# Iniciar servidor dev para Firefox
npm run dev:firefox
```

O servidor ficará observando mudanças e recompilará automaticamente.

## 🏗️ Build

```bash
# Build de produção para Chrome
npm run build

# Build de produção para Firefox
npm run build:firefox
```

Saída: `.output/chrome-mv3/` ou `.output/firefox-mv2/`

## 📦 Empacotamento

```bash
# Criar arquivo ZIP para Chrome
npm run zip

# Criar arquivo ZIP para Firefox
npm run zip:firefox
```

Saída: `.output/text-to-prompt-X.X.X-chrome.zip`

## 👀 Preview

```bash
# Visualizar build de produção localmente
npm run preview
```

## 🧹 Limpeza

```bash
# Limpar node_modules
rm -rf node_modules

# Limpar builds e cache
rm -rf .output .wxt

# Reinstalar tudo
npm install
```

## 🔍 Manutenção

```bash
# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades automaticamente
npm audit fix

# Atualizar dependências
npm update

# Verificar dependências desatualizadas
npm outdated
```

## 🐛 Debug

```bash
# Executar build com logs verbosos
npm run build -- --mode development

# Ver estrutura de bundle (análise de tamanho)
npm run build
# Então abra .output/stats.html no navegador
```

## 🧪 Testes Manuais

### Chrome
1. Navegue para `chrome://extensions/`
2. Ative "Modo do desenvolvedor"
3. Clique em "Carregar sem compactação"
4. Selecione `.output/chrome-mv3`

### Firefox
1. Navegue para `about:debugging#/runtime/this-firefox`
2. Clique em "Carregar extensão temporária"
3. Selecione `.output/firefox-mv2/manifest.json`

## 🔄 Git Workflow

```bash
# Criar nova branch
git checkout -b feature/minha-feature

# Ver status
git status

# Adicionar mudanças
git add .

# Commit com mensagem convencional
git commit -m "feat: adiciona nova funcionalidade"

# Push
git push origin feature/minha-feature

# Atualizar com main
git fetch upstream
git rebase upstream/main
```

## 📝 Tipos de Commit

```bash
# Nova funcionalidade
git commit -m "feat: descrição"

# Correção de bug
git commit -m "fix: descrição"

# Documentação
git commit -m "docs: descrição"

# Refatoração
git commit -m "refactor: descrição"

# Estilo/formatação
git commit -m "style: descrição"

# Testes
git commit -m "test: descrição"

# Manutenção
git commit -m "chore: descrição"
```

## 🔐 Segurança

```bash
# Verificar vulnerabilidades conhecidas
npm audit

# Verificar dependências desatualizadas
npm outdated

# Atualizar pacote específico
npm update <package-name>
```

## 📊 Úteis

```bash
# Ver tamanho do build
du -sh .output/chrome-mv3

# Contar linhas de código
find src -name '*.ts' -o -name '*.tsx' | xargs wc -l

# Listar dependências de produção
npm list --prod --depth=0

# Listar dependências de dev
npm list --dev --depth=0
```

## 🌐 URLs Úteis

### Desenvolvimento Local
- WXT Dev Server: `http://localhost:5173`
- Extension Reload: Automático com hot-reload

### Chrome
- Extensões: `chrome://extensions/`
- Console de Erros: F12 > Console
- Storage: F12 > Application > Storage

### Firefox
- Debug: `about:debugging#/runtime/this-firefox`
- Console: F12 > Console
- Storage: F12 > Storage

## ⚡ Atalhos do Editor (VS Code)

```bash
# Abrir Command Palette
Ctrl+Shift+P

# Quick Open (arquivos)
Ctrl+P

# Buscar no projeto
Ctrl+Shift+F

# Ir para definição
F12

# Renomear símbolo
F2

# Format document
Shift+Alt+F
```

## 🎯 Dicas de Produtividade

### Hot Reload
```bash
# Dev server já tem hot reload
npm run dev

# Se não funcionar, recarregue a extensão:
# Chrome: Clique no botão "Atualizar" em chrome://extensions
# Firefox: Recarregue em about:debugging
```

### Watch Mode Customizado
```bash
# WXT já vem com watch configurado
# Edite wxt.config.ts para customizar
```

### Build Otimizado
```bash
# Build com análise de bundle
npm run build

# Build sem minificação (para debug)
npm run build -- --mode development
```

---

**Consulte a [documentação completa](README.md) para mais informações.**
