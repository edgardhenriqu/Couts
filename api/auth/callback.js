/**
 * GET /auth/callback (reescrito para cá em vercel.json) — destino dos links
 * de confirmação de cadastro e de recuperação de senha do Supabase.
 * Aceita o `code` do fluxo PKCE e o `token_hash` do modelo de e-mail.
 */
import { withSession } from '../../server/supabase.js';
import { appOrigin } from '../../server/http.js';

const redirect = (location) => new Response(null, { status: 302, headers: { Location: location, 'Cache-Control': 'no-store' } });

export const GET = withSession(async ({ request, db }) => {
  const url = new URL(request.url);
  const origin = appOrigin(request);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');

  if (db && (code || tokenHash)) {
    const { error } = code
      ? await db.auth.exchangeCodeForSession(code)
      : await db.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
    if (!error) {
      const reset = url.searchParams.get('next') === 'reset' || tokenHash;
      return redirect(`${origin}${reset ? '/login?reset=1' : '/admin/crm'}`);
    }
    console.error('auth_callback_failed', { code: error.code || 'unknown', status: error.status });
  }
  return redirect(`${origin}/login?error=callback`);
});
