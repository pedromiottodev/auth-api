# Auth API – Password Recovery

API de autenticação desenvolvida para **estudo de boas práticas de segurança**, indo além de CRUD simples.

O foco do projeto é entender **por que** cada decisão existe em um fluxo real de autenticação.

---

## ✨ Funcionalidades

* Cadastro de usuário com senha criptografada
* Login com geração de JWT
* Middleware de autenticação
* Rota protegida para obter dados do usuário logado
* Recuperação de senha com código temporário
* Código de recuperação:

  * possui tempo de expiração
  * é de uso único
  * invalida códigos antigos ao redefinir a senha
* Proteção contra enumeração de e-mails

---

## 🔐 Fluxo de autenticação

### Cadastro

* Validação de dados com Zod
* Senha armazenada usando hash (bcrypt)

### Login

* Validação de credenciais
* Geração de JWT
* Token enviado ao cliente

### Autorização

* JWT enviado via header `Authorization: Bearer <token>`
* Middleware valida token antes de acessar rotas protegidas

### Recuperação de senha

1. Usuário solicita recuperação informando o e-mail
2. Sistema gera um código temporário
3. Código possui expiração e uso único
4. Código não é retornado na resposta da API
5. Senha é redefinida com novo hash

---

## 🛠️ Tecnologias utilizadas

* Node.js
* Express
* TypeScript
* Prisma ORM
* PostgreSQL
* Zod
* bcrypt
* JSON Web Token (JWT)

---

## 📦 Instalação e execução

```bash
# instalar dependências
yarn install

# configurar variáveis de ambiente
cp .env.example .env

# rodar migrations
yarn prisma migrate dev

# iniciar servidor em desenvolvimento
yarn dev
```

---

## 🔑 Variáveis de ambiente

```env
DATABASE_URL=
JWT_SECRET=
PORT=3000
```

---

## 📚 Conceitos aplicados

* Hash de senhas
* Autenticação baseada em token
* Middlewares
* Validação de entrada
* Segurança contra ataques comuns
* Controle de estado e tempo em fluxos sensíveis

---

## 🎯 Objetivo do projeto

Projeto desenvolvido com foco em **aprendizado prático**, simulando comportamentos reais de sistemas de autenticação utilizados em aplicações profissionais.

---

## 📄 Licença

MIT
