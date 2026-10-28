/**
 * Clientes Supabase das funções de `api/`.
 *
 * - `withSession` cria, por requisição, um cliente com a sessão do usuário
 *   (cookies httpOnly). As consultas rodam com o JWT dele, então as políticas
 *   RLS do banco valem como segunda barreira além das checagens da API.
 * - `adminDatabase` usa a chave secreta e só serve à captação pública do
 *   formulário (`capture_lead`, `consume_limit`).
 *
 * Variáveis (só no servidor, nunca com prefixo VITE_): SUPABASE_URL,
 * SUPABASE_PUBLISHABLE_KEY (ou SUPABASE_ANON_KEY) e SUPABASE_SECRET_KEY (ou
 * SUPABASE_SERVICE_ROLE_KEY).
 */
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const env = (...names) => names.map((n) => process.env[n]).find(Boolean) || '';
const url = () => env('SUPABASE_URL');
const publicKey = () => env('SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_ANON_KEY');
const secretKey = () => env('SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY');

export const configured = () => Boolean(url() && publicKey());

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

/**
 * Envolve um handler `(ctx) => Response`. `ctx.db` é o cliente da sessão;
 * cookies renovados pelo Supabase durante o handler saem na resposta.
 */
export function withSession(handler) {
  return async (request) => {
    const pending = [];
    const db = configured()
      ? createServerClient(url(), publicKey(), {
          cookieOptions: COOKIE_OPTIONS,
          cookies: {
            getAll: () => parseCookieHeader(request.headers.get('cookie') || ''),
            setAll: (items) => pending.push(...items),
          },
        })
      : null;
    const response = await handler({ request, db });
    for (const { name, value, options } of pending) {
      response.headers.append('Set-Cookie', serializeCookieHeader(name, value, { ...COOKIE_OPTIONS, ...options }));
    }
    return response;
  };
}

export function adminDatabase() {
  if (!url() || !secretKey()) throw new Error('Banco não configurado');
  return createClient(url(), secretKey(), { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Usuário logado com perfil ativo, ou `null`. */
export async function authorize(db) {
  if (!db) return null;
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;
  const { data: profile } = await db.from('profiles').select('*').eq('id', user.id).eq('active', true).maybeSingle();
  return profile ? { user, profile } : null;
}
