/** Respostas JSON e proteções comuns às funções de `api/`. */

const MAX_BODY = 20000;

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export const failure = (message, status = 400) => json({ error: message }, status);

/**
 * Escritas só aceitam o próprio site como origem. `APP_URL` fixa a origem
 * pública; sem ela vale o host da própria requisição (prévias da Vercel e
 * `vite dev` funcionam sem configuração).
 */
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const allowed = new Set([new URL(request.url).origin]);
  if (process.env.APP_URL) allowed.add(new URL(process.env.APP_URL).origin);
  return allowed.has(origin);
}

/** Corpo JSON com limite de tamanho. */
export async function readBody(request) {
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY) throw new Error('Payload excede o limite');
  const text = await request.text();
  if (text.length > MAX_BODY) throw new Error('Payload excede o limite');
  return JSON.parse(text || '{}');
}

/** Origem pública para links de e-mail (confirmação e recuperação de senha). */
export const appOrigin = (request) => (process.env.APP_URL || new URL(request.url).origin).replace(/\/+$/, '');
