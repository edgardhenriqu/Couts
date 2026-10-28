/**
 * POST /api/leads — captação pública do formulário de contato.
 *
 * Origem do próprio site, Zod, campo-isca e limite de 10 tentativas por hora
 * por e-mail e por IP (chaves com hash e salt). A gravação é uma única
 * transação no banco (`capture_lead`), idempotente pelo `request_id`.
 */
import { createHash } from 'node:crypto';
import { isIP } from 'node:net';

import { captureSchema } from '../server/schema.js';
import { adminDatabase } from '../server/supabase.js';
import { failure, json, readBody, sameOrigin } from '../server/http.js';

const salt = () => process.env.RATE_LIMIT_SALT || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const limitKey = (kind, value) => createHash('sha256').update(`${salt()}:${kind}:${value}`).digest('hex');

export async function POST(request) {
  const ref = crypto.randomUUID();
  try {
    if (!sameOrigin(request)) return failure('Origem não permitida', 403);
    if (!process.env.SUPABASE_URL || !salt()) {
      return json({ error: 'CRM não configurado.', code: 'not_configured' }, 503);
    }

    const parsed = captureSchema.safeParse(await readBody(request));
    if (!parsed.success) return failure('Confira os campos do formulário.');
    const p = parsed.data;
    if (p.website) return failure('Solicitação recusada');

    const db = adminDatabase();
    const emailLimit = await db.rpc('consume_limit', { p_key: limitKey('email', p.email) });
    if (emailLimit.error) throw emailLimit.error;
    if (!emailLimit.data) return failure('Limite de tentativas atingido. Tente novamente mais tarde.', 429);

    // Endereço entregue pelo proxy da Vercel (último item do x-forwarded-for).
    const ip = request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim();
    if (ip && isIP(ip)) {
      const networkLimit = await db.rpc('consume_limit', { p_key: limitKey('network', ip) });
      if (networkLimit.error) throw networkLimit.error;
      if (!networkLimit.data) return failure('Limite de tentativas atingido nesta rede. Tente novamente mais tarde.', 429);
    }

    const { website, ...lead } = p;
    const { error } = await db.rpc('capture_lead', { p: lead });
    if (error) throw error;
    return json({ ok: true, receipt: p.request_id });
  } catch (error) {
    // Sem payload pessoal no log.
    console.error('capture_failed', { ref, code: error?.code || 'internal' });
    return failure(`Não foi possível confirmar o recebimento. Referência: ${ref}`, 503);
  }
}
