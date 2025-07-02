# Gestor Financeiro Pessoal - Frontend

Este é o frontend da aplicação Gestor Financeiro Pessoal, desenvolvido em React com TypeScript e Tailwind CSS.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca para construção de interfaces
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **React Router DOM** - Roteamento da aplicação
- **React Hook Form** - Gerenciamento de formulários
- **Axios** - Cliente HTTP para requisições à API
- **Lucide React** - Ícones modernos
- **React Hot Toast** - Notificações toast
- **Date-fns** - Manipulação de datas

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Backend da aplicação rodando na porta 3001

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd WebApp-Front-Finance
```

2. Instale as dependências:
```bash
npm install
```

3. Configure a URL da API:
O frontend está configurado para se conectar com o backend na URL `http://localhost:3001/api`. Se necessário, altere a URL no arquivo `src/services/api.ts`.

## 🚀 Executando a Aplicação

1. Certifique-se de que o backend está rodando na porta 3001

2. Inicie o servidor de desenvolvimento:
```bash
npm start
```

3. A aplicação estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   └── Layout.tsx      # Layout principal com navegação
├── pages/              # Páginas da aplicação
│   ├── Dashboard.tsx   # Página inicial com estatísticas
│   ├── Accounts.tsx    # Listagem de contas
│   ├── AccountForm.tsx # Formulário de criação/edição de contas
│   ├── Transactions.tsx # Listagem de transações
│   ├── TransactionForm.tsx # Formulário de criação/edição de transações
│   └── TransferForm.tsx # Formulário de transferências
├── services/           # Serviços de API
│   └── api.ts         # Configuração e métodos da API
├── types/              # Definições de tipos TypeScript
│   └── index.ts       # Interfaces e tipos
├── App.tsx            # Componente principal
├── index.tsx          # Ponto de entrada
└── index.css          # Estilos globais
```

## 🎯 Funcionalidades

### Dashboard
- Visão geral das finanças
- Estatísticas de contas e transações
- Lista das contas mais recentes
- Lista das transações mais recentes

### Gerenciamento de Contas
- ✅ Criar novas contas
- ✅ Listar todas as contas
- ✅ Editar contas existentes
- ✅ Excluir contas (apenas se não possuir transações)
- ✅ Filtrar contas por tipo
- ✅ Buscar contas por nome

### Gerenciamento de Transações
- ✅ Criar novas transações (Débito/Crédito)
- ✅ Listar todas as transações
- ✅ Editar transações existentes
- ✅ Excluir transações
- ✅ Filtrar por conta, tipo e período
- ✅ Buscar transações por descrição

### Transferências
- ✅ Realizar transferências entre contas
- ✅ Validação de saldo suficiente
- ✅ Resumo da transferência antes da confirmação
- ✅ Atualização automática dos saldos

## 🎨 Interface do Usuário

A aplicação possui uma interface moderna e responsiva com:

- **Design System Consistente**: Cores, tipografia e espaçamentos padronizados
- **Layout Responsivo**: Funciona em desktop, tablet e mobile
- **Navegação Intuitiva**: Menu lateral com navegação clara
- **Feedback Visual**: Loading states, notificações e validações
- **Acessibilidade**: Contraste adequado e navegação por teclado

## 🔧 Configurações

### Tailwind CSS
O projeto utiliza Tailwind CSS com configurações customizadas:
- Cores personalizadas para primary, success, danger e warning
- Componentes utilitários para botões, inputs e cards
- Responsividade mobile-first

### TypeScript
Configuração rigorosa do TypeScript para garantir qualidade do código:
- Strict mode habilitado
- Tipagem completa de todas as interfaces
- Validação de tipos em tempo de compilação

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout adaptado com navegação otimizada
- **Mobile**: Layout mobile-first com navegação simplificada

## 🔒 Validações

### Formulários
- Validação em tempo real com React Hook Form
- Mensagens de erro claras e específicas
- Validação de campos obrigatórios
- Validação de formatos (email, números, etc.)

### API
- Tratamento de erros da API
- Feedback visual para o usuário
- Retry automático em caso de falha de rede

## 🚀 Build de Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `build/`.

## 🧪 Testes

Para executar os testes:

```bash
npm test
```

## 📝 Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm test` - Executa os testes
- `npm run eject` - Ejecta a configuração do Create React App

## 🔗 Integração com Backend

O frontend se integra com o backend através da API REST:

- **Base URL**: `http://localhost:3001/api`
- **Autenticação**: Não requerida (pode ser implementada posteriormente)
- **Formato**: JSON
- **Métodos**: GET, POST, PUT, DELETE

### Endpoints Utilizados

- `GET /accounts` - Listar contas
- `POST /accounts` - Criar conta
- `PUT /accounts/:id` - Atualizar conta
- `DELETE /accounts/:id` - Excluir conta
- `GET /transactions` - Listar transações
- `POST /transactions` - Criar transação
- `POST /transactions/transfer` - Realizar transferência
- `GET /accounts/statistics` - Estatísticas das contas
- `GET /transactions/statistics` - Estatísticas das transações

## 🐛 Solução de Problemas

### Erro de CORS
Se encontrar erros de CORS, certifique-se de que o backend está configurado para aceitar requisições do frontend.

### Erro de Conexão com API
Verifique se o backend está rodando na porta 3001 e se a URL está correta no arquivo `src/services/api.ts`.

### Problemas de Build
Se houver problemas com o build, tente:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📄 Licença

Este projeto foi desenvolvido como parte de um teste técnico.

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ usando React, TypeScript e Tailwind CSS. 