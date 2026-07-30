import React from "react";
import logo from "../../../images/logo.png";

export function PublicHeader({ onNavToAdmin = () => {}, children, brandSubtitle }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
        <a href="#hero" className="flex items-center gap-3">
          <img src={logo} alt="Cliion" className="h-12 w-auto object-contain" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Cliion</p>
            <p className="text-sm text-slate-600">{brandSubtitle || "Saúde com confiança e tecnologia"}</p>
          </div>
        </a>

        {children}

        <div className="hidden md:flex">
          <button
            type="button"
            onClick={onNavToAdmin}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Área administrativa
          </button>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200/70 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 md:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <img src={logo} alt="Cliion" className="h-12 w-auto object-contain" />
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
            Cuidado humanizado com organização, tecnologia e credibilidade — do primeiro atendimento ao seu
            acompanhamento.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Links rápidos</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a className="text-slate-600 transition hover:text-slate-900" href="#services">
                Serviços
              </a>
            </li>
            <li>
              <a className="text-slate-600 transition hover:text-slate-900" href="#professionals">
                Profissionais
              </a>
            </li>
            <li>
              <a className="text-slate-600 transition hover:text-slate-900" href="#benefits">
                Benefícios
              </a>
            </li>
            <li>
              <a className="text-slate-600 transition hover:text-slate-900" href="#testimonials">
                Depoimentos
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Contatos</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
              (11) 98765-4321
            </p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
              contato@cliion.com.br
            </p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
              Av. Paulista, 1000 — Bela Vista, São Paulo/SP
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Redes sociais</p>
          <div className="mt-4 flex items-center gap-3">
            {[
              { label: "Instagram", href: "#" },
              { label: "LinkedIn", href: "#" },
              { label: "YouTube", href: "#" }
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {s.label}
              </a>
            ))}
          </div>

          <div className="mt-6 text-xs text-slate-500">
            © {new Date().getFullYear()} Cliion. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PublicContainer({ children, className = "" }) {
  return <div className={`mx-auto max-w-7xl ${className}`}>{children}</div>;
}

