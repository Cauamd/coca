-- Execute uma vez nos bancos já existentes para guardar a explicação da IA.
ALTER TABLE apontamentos
  ADD COLUMN explicacao_classificacao_ia JSON NULL
  AFTER origem_classificacao;
