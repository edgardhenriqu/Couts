/** Rótulo de seção: filete + texto em mono maiúsculo ("01 — Contexto"). */
export default function Eyebrow({ children, glow = false }) {
  return (
    <p className={glow ? 'eyebrow eyebrow--glow' : 'eyebrow'}>
      <span className="eyebrow__rule" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
