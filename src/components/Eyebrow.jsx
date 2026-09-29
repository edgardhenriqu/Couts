/** Rótulo de seção: filete + texto em mono maiúsculo ("01 — Contexto"). Pode ir dentro de `<Reveal>`. */
export default function Eyebrow({ children, glow = false, ...rest }) {
  return (
    <p className={glow ? 'eyebrow eyebrow--glow' : 'eyebrow'} {...rest}>
      <span className="eyebrow__rule" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
