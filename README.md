# Text to Prompt

<div align="center">

**Extensão de navegador que converte texto de campos de input em prompts otimizados para IA**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![WXT](https://img.shields.io/badge/WXT-0.19-purple)](https://wxt.dev/)

[Instalação](#instalação) • [Uso](#uso) • [Recursos](#recursos) • [Contribuir](#contribuindo) • [Licença](#licença)

</div>

---

## 📋 Sobre

Text to Prompt é uma extensão de navegador desenvolvida com tecnologias modernas que permite capturar, processar e otimizar texto de campos de entrada em páginas web para uso com modelos de IA. A extensão detecta automaticamente campos de texto e oferece múltiplos modelos de formatação.

### ✨ Recursos

- 🎯 **Detecção Automática** - Identifica campos de texto em qualquer página web
- 🔄 **Múltiplos Modelos** - Vários templates de prompt pré-configurados
- 🧾 **Token-Oriented Object Notation (TOON)** - Converta texto em TOON seguindo a especificação oficial (spec v1.5) para prompts eficientes em LLMs
- ⚙️ **Personalização** - Configure prompts customizados para suas necessidades
- 🚀 **Performance** - Execução rápida e eficiente
- 🌐 **Multi-browser** - Suporte para Chrome e Firefox
- 🎨 **Interface Moderna** - UI clean e intuitiva com TailwindCSS

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou pnpm

### Desenvolvimento

```bash
# Clone o repositório
git clone https://github.com/yurisantos-y/text-to-prompt.git
cd text-to-prompt

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

# Para Firefox
npm run dev:firefox
```

### Build de Produção

```bash
# Build para Chrome
npm run build

# Build para Firefox
npm run build:firefox

# Criar arquivo ZIP para distribuição
npm run zip
```

### Instalação da Extensão

#### Chrome/Edge
1. Abra `chrome://extensions/`
2. Ative o "Modo do desenvolvedor"
3. Clique em "Carregar sem compactação"
4. Selecione a pasta `.output/chrome-mv3`

#### Firefox
1. Abra `about:debugging#/runtime/this-firefox`
2. Clique em "Carregar extensão temporária"
3. Selecione o arquivo `.output/firefox-mv2/manifest.json`

## 💡 Uso

1. **Ative a extensão** clicando no ícone na barra de ferramentas
2. **Navegue** até uma página com campos de texto
3. **Selecione** o campo desejado
4. **Escolha** um modelo de prompt
5. **Copie** o resultado otimizado

## 🏗️ Arquitetura

```
text-to-prompt/
├── src/
│   ├── components/     # Componentes React
│   │   └── ui/         # Componentes shadcn/ui
│   ├── entrypoints/    # Pontos de entrada da extensão
│   │   ├── content/    # Content scripts
│   │   └── popup/      # UI do popup
│   ├── lib/            # Utilitários
│   └── styles/         # Estilos globais
├── public/             # Assets estáticos
└── steering/           # Documentação técnica
```

### Stack Tecnológica

- **Framework**: React 18.3
- **Build Tool**: WXT (Web Extension Tool)
- **Linguagem**: TypeScript 5.3
- **Estilização**: TailwindCSS + shadcn/ui
- **Ícones**: Lucide React

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Este é um projeto open source e adoraríamos sua ajuda para torná-lo ainda melhor.

### Como Contribuir

1. **Fork** o repositório
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/text-to-prompt.git`
3. **Crie** uma branch: `git checkout -b feature/nova-funcionalidade`
4. **Commit** suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
5. **Push** para a branch: `git push origin feature/nova-funcionalidade`
6. **Abra** um Pull Request

### Diretrizes

- Siga o código de conduta do projeto
- Escreva mensagens de commit claras e descritivas
- Adicione testes quando aplicável
- Atualize a documentação conforme necessário
- Mantenha o código consistente com o estilo do projeto

Leia nosso [Guia de Contribuição](arquivos/CONTRIBUTING.md) para mais detalhes.

## 📝 Documentação

- [Guia de Instalação](arquivos/INSTALLATION.md)
- [Visão Geral do Projeto](arquivos/PROJECT_OVERVIEW.md)
- [Guia de Testes](arquivos/GUIA_TESTE_COMPLETO.md)
- [Comandos Rápidos](arquivos/COMANDOS_RAPIDOS.md)
- [Detecção de Campos](arquivos/DETECCAO_CAMPOS.md)

## 🛡️ Segurança

Esta extensão implementa múltiplas camadas de segurança:

- ✅ **Proteção contra XSS** - Sanitização de entrada e saída
- ✅ **Prevenção de Prompt Injection** - Validação e escape de entrada
- ✅ **Armazenamento Seguro** - API keys criptografadas com chrome.storage
- ✅ **Rate Limiting** - Proteção contra abuso de API
- ✅ **Content Security Policy** - Política de segurança de conteúdo rigorosa
- ✅ **Permissões Mínimas** - Apenas APIs necessárias whitelistadas

Para detalhes completos, consulte:
- [Documentação de Segurança](arquivos/SECURITY_ENHANCEMENTS.md)
- [Guia Rápido](arquivos/SECURITY_QUICK_REFERENCE.md)

Encontrou uma vulnerabilidade de segurança? Por favor, leia nossa [Política de Segurança](arquivos/SECURITY.md) para saber como reportar.

## 📄 Licença

Este projeto está licenciado sob a Apache License 2.0 - veja o arquivo [LICENSE](LICENSE) para detalhes.

```
Copyright 2024 Text to Prompt Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
```

## 🙏 Agradecimentos

- [WXT Framework](https://wxt.dev/) - Framework incrível para extensões
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI de alta qualidade
- Todos os [contribuidores](https://github.com/your-username/text-to-prompt/graphs/contributors) que ajudam a melhorar este projeto

## 📬 Contato & Suporte

- 🐛 [Reportar Bug](https://github.com/your-username/text-to-prompt/issues/new?labels=bug)
- 💡 [Solicitar Feature](https://github.com/your-username/text-to-prompt/issues/new?labels=enhancement)
- 💬 [Discussões](https://github.com/your-username/text-to-prompt/discussions)

---

<div align="center">

**[⬆ Voltar ao topo](#text-to-prompt)**

Feito com ❤️ pela comunidade open source

</div>
