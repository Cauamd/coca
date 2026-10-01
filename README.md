# coca

## Login de administrador

Acrescente ao `.env` `ADMIN_USERNAME`, `ADMIN_PASSWORD` e `AUTH_SECRET` com valores próprios antes de iniciar o backend. `.env.example` mostra o formato; preserve as configurações de banco que já existem no `.env`. `AUTH_SECRET` deve ser aleatório e ter pelo menos 32 caracteres. O login cria uma sessão assinada por oito horas e limita as consultas ao centro escolhido. Sem essas três configurações, o backend recusa o login.
