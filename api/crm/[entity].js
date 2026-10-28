/**
 * /api/crm/:entity — leituras paginadas e escritas autorizadas do painel.
 *
 * Não usa a chave secreta: tudo roda com o JWT do usuário, e as políticas
 * RLS do banco limitam o que cada papel vê e altera. As checagens daqui
 * devolvem mensagens claras antes de o banco recusar.
 */
import { z } from 'zod';

import { entitySchemas } from '../../server/schema.js';
import { authorize, configured, withSession } from '../../server/supabase.js';
import { failure, json, readBody, sameOrigin } from '../../server/http.js';

const READABLE = ['contacts', 'activities', 'companies', 'profiles', 'interactions'];
const DELETABLE = ['contacts', 'companies', 'activities'];
const isUuid = (v) => z.string().uuid().safeParse(v).success;
const entityOf = (request) => decodeURIComponent(new URL(request.url).pathname.split('/').filter(Boolean).pop() || '');

export const GET = withSession(async ({ request, db }) => {
  try {
    if (!configured()) return failure('Configure o Supabase para acessar o CRM.', 503);
    const auth = await authorize(db);
    if (!auth) return failure('Acesso não autorizado', 401);
    const entity = entityOf(request);
    if (!READABLE.includes(entity)) return failure('Módulo inválido', 404);

    const p = new URL(request.url).searchParams;
    let query = db.from(entity).select('*', { count: 'exact' });
    if (isUuid(p.get('id'))) query = query.eq('id', p.get('id'));
    if (isUuid(p.get('contact_id')) && ['activities', 'interactions'].includes(entity)) query = query.eq('contact_id', p.get('contact_id'));
    if (isUuid(p.get('owner')) && ['contacts', 'activities'].includes(entity)) query = query.eq('owner_id', p.get('owner'));

    if (entity === 'contacts') {
      // Busca por nome, e-mail ou nome da empresa. Só letras, números e @ ._-
      // para não injetar sintaxe no filtro `or` do PostgREST.
      const q = (p.get('q') || '').replace(/[^\p{L}\p{N}@ ._-]/gu, '').trim().slice(0, 120);
      if (q) {
        const { data: companies, error } = await db.from('companies').select('id').ilike('name', `%${q}%`).limit(100);
        if (error) throw error;
        const inCompanies = companies?.length ? `,company_id.in.(${companies.map((c) => c.id).join(',')})` : '';
        query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%${inCompanies}`);
      }
    }

    const page = Math.max(0, Math.min(100000, Number(p.get('page')) || 0));
    const size = Math.max(1, Math.min(1000, Number(p.get('size')) || 25));
    const sort = ['name', 'created_at', 'due_at'].includes(p.get('sort')) ? p.get('sort') : 'created_at';
    const { data, error, count } = await query
      .order(sort, { ascending: p.get('asc') === 'true' })
      .range(page * size, page * size + size - 1);
    if (error) throw error;
    return json({ data, count, role: auth.profile.role, userId: auth.user.id });
  } catch (error) {
    console.error('crm_read_failed', { code: error?.code });
    return failure('Não foi possível carregar os registros.', 500);
  }
});

const write = (method) =>
  withSession(async ({ request, db }) => {
    try {
      if (!sameOrigin(request)) return failure('Origem não permitida', 403);
      const auth = await authorize(db);
      if (!auth) return failure('Acesso não autorizado', 401);
      const { role } = auth.profile;
      const entity = entityOf(request);
      const schema = entitySchemas[entity];
      if (!schema) return failure('Módulo inválido', 404);

      const payload = await readBody(request);
      const { id } = payload;
      delete payload.id;

      if ((entity === 'profiles' || method === 'DELETE') && role !== 'admin') return failure('Apenas administradores', 403);
      if (entity === 'companies' && role === 'comercial') return failure('Apenas gestores podem alterar empresas', 403);

      if (method === 'DELETE') {
        if (!DELETABLE.includes(entity) || !isUuid(id)) return failure('Exclusão inválida');
        const { data, error } = await db.from(entity).delete().eq('id', id).select('id');
        if (error) throw error;
        return data?.length ? json({ ok: true }) : failure('Registro não encontrado ou exclusão não permitida pelo banco.', 404);
      }

      // Leads só nascem pelo formulário; perfis, pela aprovação de acesso.
      if (method === 'POST' && ['contacts', 'profiles'].includes(entity)) return failure('Operação não permitida', 403);
      if (method === 'PATCH' && !isUuid(id)) return failure('Identificador inválido');

      const parsed = (method === 'PATCH' ? schema.partial() : schema).safeParse(payload);
      if (!parsed.success) {
        return failure('Dados inválidos: ' + parsed.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`).join('; '));
      }
      const data = parsed.data;
      if (role === 'comercial' && 'owner_id' in data && data.owner_id !== auth.user.id) return failure('Atribuição exige gestor', 403);
      if (entity === 'profiles' && id === auth.user.id && (data.active === false || (data.role && data.role !== 'admin'))) {
        return failure('Não remova seu próprio acesso administrativo.');
      }

      const query = method === 'POST' ? db.from(entity).insert(data) : db.from(entity).update(data).eq('id', id);
      const result = await query.select().single();
      if (result.error) {
        if (result.error.code === '23505') return failure('Já existe um registro com esse e-mail ou nome.', 409);
        if (result.error.code === '23514') return failure('Confira os campos obrigatórios.');
        throw result.error;
      }
      return json({ data: result.data });
    } catch (error) {
      console.error('crm_write_failed', { code: error?.code });
      return failure('A operação não foi confirmada. Confira suas permissões e tente novamente.', 400);
    }
  });

export const POST = write('POST');
export const PATCH = write('PATCH');
export const DELETE = write('DELETE');
