"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ToggleTheme } from "./ui/toggle-theme";
import { fetchCentros, loginAdmin } from "../lib/api";
import MorphSelect from "./ui/select-morph";

export default function CocaColaLoginWave() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [centro, setCentro] = useState("");
  const [centros, setCentros] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [centrosLoading, setCentrosLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dark = mounted && resolvedTheme === "dark";

  useEffect(() => setMounted(true), []);
  const waveRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchCentros().then((items) => {
      setCentros(items);
      if (!items.length) setError("Nenhum centro foi encontrado. Verifique se há dados na tabela apontamentos.");
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os centros.");
    }).finally(() => setCentrosLoading(false));
  }, []);

  useEffect(() => {
    const canvas = waveRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let time = 0;
    let width = 0;
    let height = 0;
    const resize = () => {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      width = innerWidth;
      height = innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = () => {
      context.clearRect(0, 0, width, height);
      const colors = dark
        ? ["rgba(11,11,11,.84)", "rgba(244,0,9,.53)", "rgba(58,0,3,.72)", "rgba(199,0,7,.48)"]
        : ["rgba(244,0,9,.55)", "rgba(255,255,255,.76)", "rgba(184,0,7,.48)", "rgba(255,106,111,.52)"];
      colors.forEach((color, layer) => {
        const baseline = height * (0.27 + layer * 0.16);
        const amplitude = height * (0.09 + layer * 0.008);
        context.beginPath();
        context.moveTo(0, height);
        for (let x = 0; x <= width; x += 8) {
          const y = baseline + Math.sin(x / (width * 0.12 + 1) + time + layer) * amplitude
            + Math.sin(x / (width * 0.055 + 1) - time * 0.7 + layer) * amplitude * 0.28;
          context.lineTo(x, y);
        }
        context.lineTo(width, height);
        context.closePath();
        context.fillStyle = color;
        context.fill();
      });
      if (!reducedMotion) {
        time += 0.008;
        frame = requestAnimationFrame(draw);
      }
    };
    resize();
    draw();
    addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
    };
  }, [dark]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginAdmin(usuario, senha, centro);
      sessionStorage.setItem("coca-cola-entry-transition", "1");
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
      setLoading(false);
    }
  }

  return (
    <main className={`login-page${dark ? " dark" : ""}`}>
      <canvas ref={waveRef} className="wave" aria-hidden="true" />
      <div className="login-theme-toggle"><ToggleTheme /></div>
      <section className="login-card" aria-labelledby="login-title">
        <div className="brand" aria-label="Coca-Cola FEMSA"><img src="https://coca-cola-femsa.com.br/wp-content/uploads/2023/01/logo-femsa.png" alt="" /></div>
        <h1 id="login-title">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="centro">Centro</label>
            <MorphSelect
              id="centro"
              value={centro}
              ariaLabel="Centro"
              placeholder={centrosLoading ? "Carregando centros..." : centros.length ? "Selecione seu centro" : "Centros indisponíveis"}
              disabled={centrosLoading || !centros.length || loading}
              onValueChange={setCentro}
              options={centros.map((item) => ({ value: item, label: item }))}
              className="login-center-select"
            />
          </div>
          <div className="field">
            <label htmlFor="usuario">E-mail ou usuário</label>
            <input id="usuario" type="text" autoComplete="username" placeholder="Digite seu usuário" value={usuario} onChange={(e) => setUsuario(e.target.value)} required disabled={loading} />
          </div>
          <div className="field">
            <label htmlFor="senha">Senha</label>
            <div className="password-wrap">
              <input id="senha" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Digite sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} required disabled={loading} />
              <button className="reveal" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} aria-pressed={showPassword}>◉</button>
            </div>
          </div>
          <button className="submit" type="submit" disabled={loading || !centro}>{loading ? "Entrando…" : "Entrar"}</button>
          <p className="status" role="status" aria-live="polite">{error}</p>
        </form>
      </section>
      <style jsx>{`
        .login-page{--card:rgba(255, 255, 255, 0.51);--card-border:rgba(255, 255, 255, 0.36);--ink:#161616;--muted:rgba(22,22,22,.68);--field:#fff;--field-border:rgba(0,0,0,.16);--link:#c20007;min-height:100vh;display:grid;place-items:center;padding:32px 20px;color:var(--ink);font-family:'Inter',Arial,sans-serif;background:radial-gradient(62% 55% at 50% 44%,rgba(255,255,255,.38),transparent 72%),linear-gradient(160deg,#ff2b31,#f40009 55%,#9e0005);position:relative;overflow:hidden}
        .login-page:before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 20% 80%,rgba(255,255,255,.14),transparent 38%),radial-gradient(ellipse at 80% 20%,rgba(90,0,0,.16),transparent 42%)}
        .login-page.dark{--card:rgba(20, 20, 20, 0.37);--card-border:rgba(255, 255, 255, 0.27);--ink:#fff;--muted:rgba(255,255,255,.72);--field:rgba(255,255,255,.07);--field-border:rgba(255,255,255,.22);--link:#ff6f74;background:radial-gradient(62% 55% at 50% 44%,rgba(244,0,9,.35),transparent 72%),linear-gradient(160deg,#2b0004,#0e0e0e 55%,#000)}
        .wave{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
        .login-card{position:relative;z-index:1;width:min(100%,420px);padding:34px 36px 28px;border-radius:26px;background:var(--card);border:1px solid var(--card-border);box-shadow:0 34px 80px -24px rgba(70,0,3,.6);backdrop-filter:blur(20px) saturate(140%)}
        .brand{height:104px;margin:0 auto 18px;display:flex;align-items:center;justify-content:center}.brand img{display:block;width:250px;height:82px;object-fit:contain}
        h1{font-family:'Inter',Arial,sans-serif;font-size:2.35rem;font-weight:600;line-height:1.1;margin:0 0 22px}
        .field{margin-bottom:15px}label{display:block;font-size:.95rem;font-weight:500;margin-bottom:7px}input,select{width:100%;height:48px;padding:0 14px;border-radius:12px;border:1px solid var(--field-border);background:var(--field);color:var(--ink);font:inherit;font-size:1rem;outline:none}input::placeholder{color:var(--muted);opacity:.7}input:focus,select:focus{border-color:#f40009;box-shadow:0 0 0 3px rgba(244,0,9,.2)}.password-wrap{position:relative}.password-wrap input{padding-right:48px}.reveal{position:absolute;right:4px;top:4px;width:40px;height:40px;border:0;border-radius:9px;background:none;color:var(--muted);cursor:pointer;font-size:18px}
        .forgot{display:inline-block;color:var(--link);font-size:.92rem;font-weight:500;text-underline-offset:3px;margin:0 0 20px}
        .submit{width:100%;height:50px;border:0;border-radius:12px;background:#d9000a;color:#fff;font:inherit;font-size:1.1rem;font-weight:700;cursor:pointer;box-shadow:0 14px 28px -14px rgba(244,0,9,.9);transition:background .2s,transform .12s}.submit:hover{background:#a80006}.submit:active{transform:scale(.985)}.submit:disabled{opacity:.7;cursor:wait}.status{min-height:1.3em;margin:12px 0 0;font-size:.9rem;text-align:center;color:var(--link)}
        .or{display:flex;align-items:center;gap:12px;margin:14px 0 16px;font-size:.92rem;color:var(--muted)}.or:before,.or:after{content:"";height:1px;flex:1;background:var(--field-border)}.social{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.social button{height:46px;border-radius:12px;border:1px solid var(--field-border);background:var(--field);color:var(--ink);cursor:pointer;display:grid;place-items:center}.social button:hover{border-color:#f40009;transform:translateY(-2px)}.google{font:bold 20px Arial;color:#4285f4}.microsoft{width:18px;height:18px;display:grid;grid-template-columns:1fr 1fr;gap:2px}.microsoft i:nth-child(1){background:#f25022}.microsoft i:nth-child(2){background:#7fba00}.microsoft i:nth-child(3){background:#00a4ef}.microsoft i:nth-child(4){background:#ffb900}.apple{font-size:24px;color:var(--ink)}.signup{margin-top:22px;text-align:center;font-size:.92rem;color:var(--muted)}.signup a{color:var(--link);font-weight:600}
        :focus-visible{outline:2px solid #f40009;outline-offset:2px}
        @media(max-width:420px){.login-card{padding:28px 22px 24px}}
      `}</style>
    </main>
  );
}
