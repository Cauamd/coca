const app = require("./app");
const retrainScheduler = require("./jobs/retrainScheduler");
require("dotenv").config();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  retrainScheduler.start();
});