/**
 * /api/auth — sessão da equipe.
 *
 * GET devolve o perfil logado (o painel usa para saber nome e papel).
 * POST trata login, logout, cadastro com aprovação, recuperação e troca de
 * senha. O cadastro só abre uma solicitação: o acesso depende do admin.
 */
import { z } from 'zod';

import { adminDatabase, authorize, configured, withSession } from '../../server/supabase.js';
import { appOrigin, failure, json, readBody, sameOrigin } from '../../server/http.js';

export const GET = withSession(async ({ db }) => {
  if (!configured()) return json({ error: 'Supabase ainda não configurado.', code: 'not_configured' }, 503);
  try {
    const auth = await authorize(db);
    if (!auth) return failure('Sessão expirada ou acesso não liberado.', 401);
    return json({ userId: auth.user.id, name: auth.profile.name, role: auth.profile.role });
  } catch {
    return failure('Serviço de autenticação indisponível.', 503);
  }
});

const password = z.string().min(12).max(128);

export const POST = withSession(async ({ request, db }) => {
  try {
    if (!sameOrigin(request)) return failure('Origem inválida', 403);
    if (!configured()) return failure('Supabase ainda não configurado.', 503);
    const p = await readBody(request);

    switch (p.action) {
      case 'logout': {
        await db.auth.signOut();
        return json({ ok: true });
      }

      case 'register': {
        const parsed = z
          .object({
            name: z.string().trim().min(2).max(120),
            email: z.string().trim().email().max(180).transform((v) => v.toLowerCase()),
            password,
          })
          .safeParse(p);
        if (!parsed.success) return failure('Informe seu nome, um e-mail válido e uma senha de 12 a 128 caracteres.');
        // Falha fechada se a migration ainda não foi aplicada.
        const { error: setupError } = await adminDatabase().from('access_requests').select('id').limit(0);
        if (setupError) return failure('Cadastro ainda não habilitado. Fale com o administrador.', 503);
        const { name, email } = parsed.data;
        const { error } = await db.auth.signUp({
          email,
          password: parsed.data.password,
          options: { data: { name, request_crm_access: true }, emailRedirectTo: `${appOrigin(request)}/auth/callback` },
        });
        await db.auth.signOut();
        if (error) {
          return error.status === 429
            ? failure('Muitas tentativas. Aguarde antes de tentar novamente.', 429)
            : failure('Não foi possível solicitar acesso. Se já tem uma conta, tente entrar ou recuperar sua senha.');
        }
        return json({ ok: true });
      }

      case 'update': {
        if (!password.safeParse(p.password).success) return failure('Use uma senha com pelo menos 12 caracteres.');
        const { data: { user } } = await db.auth.getUser();
        if (!user) return failure('Link expirado ou sessão inválida. Solicite uma nova recuperação.', 401);
        const { error } = await db.auth.updateUser({ password: p.password });
        if (error) return failure('Não foi possível alterar a senha. Verifique os requisitos e tente novamente.');
        await db.auth.signOut();
        return json({ ok: true });
      }

      case 'recover': {
        if (!z.string().email().max(180).safeParse(p.email).success) return failure('Informe um e-mail válido.');
        const { error } = await db.auth.resetPasswordForEmail(p.email, { redirectTo: `${appOrigin(request)}/auth/callback?next=reset` });
        if (error) {
          console.error('password_recovery_failed', { code: error.code || 'unknown', status: error.status });
          if (error.status === 429) return failure('Muitas tentativas de recuperação. Aguarde antes de pedir outro link.', 429);
          return failure('Não foi possível enviar o link. Verifique o e-mail do Supabase ou tente mais tarde.', 503);
        }
        return json({ ok: true });
      }

      case 'login': {
        if (!z.string().email().max(180).safeParse(p.email).success) return failure('Informe um e-mail válido.');
        if (!z.string().min(1).max(128).safeParse(p.password).success) return failure('Informe sua senha.');
        const { error } = await db.auth.signInWithPassword({ email: p.email, password: p.password });
        if (error) return failure('Credenciais inválidas ou acesso indisponível.', 401);
        const { data: { user } } = await db.auth.getUser();
        const { data: profile } = user
          ? await db.from('profiles').select('id').eq('id', user.id).eq('active', true).maybeSingle()
          : { data: null };
        if (!profile) {
          await db.auth.signOut();
          return failure('Seu acesso ainda não foi liberado ou está desativado. Aguarde a aprovação do administrador.', 403);
        }
        return json({ ok: true });
      }

      default:
        return failure('Operação inválida.');
    }
  } catch {
    return failure('Serviço de autenticação indisponível.', 503);
  }
});
