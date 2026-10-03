# Projeto Coca Coola

Aplicação de análise de apontamentos de falha, com interface Next.js e API Express/MySQL.

## Deploy da interface no Vercel

1. Importe este repositório no Vercel e configure **Root Directory** como `frontend`.
2. Use os scripts padrão do projeto: `npm run build` para build e `npm run start` para iniciar localmente.
3. Em **Settings → Environment Variables**, defina `BACKEND_URL` com a URL pública HTTPS da API Express, sem barra no final. O arquivo `frontend/.env.example` mostra o formato.
4. Faça o deploy. As chamadas sob `/api` passam pelo proxy do Next para a API, mantendo o cookie de sessão no mesmo domínio da interface.

Para desenvolver localmente, rode a API na porta `8000` e o front-end na porta `3000`. O proxy usa `http://localhost:8000` como padrão quando `BACKEND_URL` não está definida.

## Deploy da API

A API deve ser hospedada como um serviço Node.js persistente separado, com acesso ao MySQL. Configure nela `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` e `AUTH_SECRET` (mínimo de 32 caracteres aleatórios). Inicie com `node backend/server.js` a partir da raiz do repositório. `PORT` é opcional; o serviço usa a porta fornecida pelo provedor ou `8000`.

O agendador de reclassificação é iniciado junto com o servidor Express. Por isso, mantenha uma única instância da API ou coordene o agendador se escalar para várias instâncias.

## Banco de dados

Prepare o MySQL e aplique `backend/sql/schema.sql` antes do primeiro uso. Os dados de conexão e as credenciais administrativas devem ser configurados como variáveis de ambiente no provedor da API. Não envie arquivos `.env` ao Git.
