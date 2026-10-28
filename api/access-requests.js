/** /api/access-requests — o admin lista e aprova/recusa cadastros pendentes. */
import { z } from 'zod';

import { authorize, withSession } from '../server/supabase.js';
import { failure, json, readBody, sameOrigin } from '../server/http.js';

export const GET = withSession(async ({ db }) => {
  try {
    const auth = await authorize(db);
    if (!auth || auth.profile.role !== 'admin') return failure('Apenas administradores.', 403);
    const { data, error } = await db
      .from('access_requests')
      .select('id,name,email,status,created_at,reviewed_at')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) return failure('Não foi possível carregar as solicitações.', 503);
    return json({ data });
  } catch {
    return failure('Não foi possível carregar as solicitações.', 503);
  }
});

export const POST = withSession(async ({ request, db }) => {
  try {
    if (!sameOrigin(request)) return failure('Origem inválida.', 403);
    const auth = await authorize(db);
    if (!auth || auth.profile.role !== 'admin') return failure('Apenas administradores.', 403);
    const parsed = z
      .object({ id: z.string().uuid(), decision: z.enum(['approved', 'rejected']) })
      .strict()
      .safeParse(await readBody(request));
    if (!parsed.success) return failure('Solicitação inválida.');
    const { error } = await db.rpc('review_crm_access', { request_id: parsed.data.id, decision: parsed.data.decision });
    if (error) return failure('Não foi possível revisar. Atualize a lista: a solicitação pode já ter sido analisada.', 409);
    return json({ ok: true });
  } catch {
    return failure('Não foi possível revisar a solicitação.', 503);
  }
});
