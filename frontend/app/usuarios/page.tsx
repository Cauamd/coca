"use client";

import { FormEvent, useState } from "react";
import { createUser } from "../../lib/api";

export default function UsuariosPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState<"admin" | "gerente">("gerente");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(""); setMessage("");
    try {
      await createUser(email, senha, cargo);
      setMessage(`Usuário ${email} cadastrado como ${cargo === "gerente" ? "gerente" : "administrador"}.`);
      setEmail(""); setSenha(""); setCargo("gerente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao cadastrar usuário.");
    } finally { setSaving(false); }
  }

  return (
    <main className="page-shell">
      <section className="page-heading"><p className="eyebrow">Acesso ao sistema</p><h1>Cadastro de usuários</h1><p>Crie uma conta e defina o nível de acesso.</p></section>
      <section className="panel" style={{ maxWidth: 620, padding: 28 }}>
        <form onSubmit={submit} className="space-y-5">
          <label className="field">E-mail<input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@empresa.com" /></label>
          <label className="field">Senha<input type="password" required minLength={8} autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo de 8 caracteres" /></label>
          <label className="field">Cargo<select value={cargo} onChange={(e) => setCargo(e.target.value as "admin" | "gerente")}><option value="gerente">Gerente — visualiza todas as páginas</option><option value="admin">Administrador — pode alterar e cadastrar</option></select></label>
          <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Cadastrando…" : "Cadastrar usuário"}</button>
          {message && <p role="status" className="text-green-700">{message}</p>}
          {error && <p role="alert" className="text-red-700">{error}</p>}
        </form>
      </section>
    </main>
  );
}
