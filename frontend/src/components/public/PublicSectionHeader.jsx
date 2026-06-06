import React from "react";

export function PublicSectionHeader({ eyebrow, title, description }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">{eyebrow}</p> : null}
      {title ? <h2 className="mt-5 font-['Fraunces'] text-4xl font-semibold text-slate-900 md:text-5xl">{title}</h2> : null}
      {description ? <p className="mt-6 text-base leading-8 text-slate-600">{description}</p> : null}
    </div>
  );
}

