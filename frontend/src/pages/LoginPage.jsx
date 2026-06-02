import { useEffect, useState } from "react";
import { LockKeyhole, LogIn } from "lucide-react";
import { apiRequest } from "../lib/api";
import { getAuthToken, setAuthToken } from "../lib/auth";
import { navigateTo } from "../lib/navigation";

export function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getAuthToken()) {
      navigateTo("/admin");
    }
  }, []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: {
          email: form.email,
          password: form.password
        }
      });

      setAuthToken(response.data.token);
      navigateTo("/admin");
    } catch (submitError) {
      setError(submitError.message || "Nao foi possivel entrar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(43,210,255,0.16),transparent_28%),linear-gradient(160deg,#07111f_0%,#0c1c33_50%,#102542_100%)] px-4 py-10 text-white md:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_460px] lg:items-center">
        <section className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">Area administrativa</p>
          <h1 className="max-w-3xl font-['Fraunces'] text-5xl font-semibold leading-tight text-white md:text-6xl">
            Acesso seguro para a operacao da clinica.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-slate-200">
            Entre com seu e-mail e senha para acessar o painel, trabalhar com pacientes e agendamentos ou administrar o restante do sistema conforme seu perfil.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">JWT com expiracao</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">A sessao usa token com validade e validacao no backend antes de liberar a area interna.</p>
            </article>
            <article className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">Acesso por papel</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">Administradores e funcionarios enxergam somente as areas permitidas para cada role.</p>
            </article>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,27,52,0.92),rgba(12,18,34,0.96))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)] md:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/12 text-cyan-200">
            <LockKeyhole size={24} />
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Login</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Entrar no painel</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">Use suas credenciais para carregar o painel administrativo protegido.</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">E-mail</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:bg-white/10"
                placeholder="admin@clinica.com"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Senha</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                className="w-full rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:bg-white/10"
                placeholder="Sua senha"
                required
              />
            </label>

            {error ? (
              <div className="rounded-[20px] border border-rose-400/20 bg-rose-500/12 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-cyan-500 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn size={18} />
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
