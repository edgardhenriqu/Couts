/**
 * Testa a migration do CRM em um PostgreSQL embutido (PGlite), sem tocar no
 * Supabase real. `auth.users`, `auth.uid()` e os papéis do Supabase são
 * simulados; o resto é o SQL de supabase/migrations tal como será aplicado.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const ids = {
  admin: '00000000-0000-4000-8000-000000000001',
  ana: '00000000-0000-4000-8000-000000000002',
  bruno: '00000000-0000-4000-8000-000000000003',
  novo: '00000000-0000-4000-8000-000000000004',
};

async function setup() {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as
      $$select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid$$;
    grant usage on schema auth to authenticated;
    grant execute on function auth.uid() to authenticated;
  `);
  const sql = await readFile(new URL('../supabase/migrations/202610270001_crm.sql', import.meta.url), 'utf8');
  // pgcrypto não existe no PGlite; gen_random_uuid() já é nativo.
  await db.exec(sql.replace('create extension if not exists pgcrypto;', ''));
  for (const [name, id] of Object.entries(ids)) {
    if (name === 'novo') continue;
    await db.query('insert into auth.users(id) values($1)', [id]);
    await db.query('insert into profiles(id, name, role) values($1, $2, $3)', [id, name, name === 'admin' ? 'admin' : 'comercial']);
  }
  return db;
}

const as = (db, id) => db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${id}', false);`);
const asService = (db) => db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`);
const count = async (db, table) => (await db.query(`select count(*)::int n from ${table}`)).rows[0].n;

const lead = (over = {}) => ({
  request_id: crypto.randomUUID(),
  name: 'Maria Teste',
  company: 'Oficina Teste',
  email: 'maria@example.test',
  phone: '11999990000',
  interest: 'ADAS',
  message: 'Quero saber das turmas',
  first: { utm_source: 'google', utm_medium: 'cpc' },
  last: { utm_campaign: 'outubro' },
  ...over,
});

const capture = async (db, payload) =>
  (await db.query('select capture_lead($1::jsonb) id', [JSON.stringify(payload)])).rows[0].id;

test('captação idempotente, deduplicação e distribuição', async () => {
  const db = await setup();
  const first = lead();
  const cid = await capture(db, first);
  assert.equal(await capture(db, first), cid, 'reenvio com o mesmo request_id não duplica');
  assert.equal(await count(db, 'interactions'), 1);

  await capture(db, lead({ message: 'Segunda mensagem', last: { utm_campaign: 'novembro' } }));
  assert.equal(await count(db, 'contacts'), 1, 'mesmo e-mail continua um só lead');
  assert.equal(await count(db, 'interactions'), 2);
  assert.equal(await count(db, 'activities'), 1, 'só o primeiro envio cria a tarefa inicial');

  const contact = (await db.query('select * from contacts where id = $1', [cid])).rows[0];
  assert.equal(contact.source, 'Google Ads');
  assert.equal(contact.last_attribution.utm_campaign, 'novembro');
  assert.ok([ids.ana, ids.bruno].includes(contact.owner_id), 'lead vai para um comercial');

  // Empresa é opcional no formulário da COUTS.
  const semEmpresa = await capture(db, lead({ email: 'joao@example.test', company: '' }));
  const row = (await db.query('select company_id, owner_id from contacts where id = $1', [semEmpresa])).rows[0];
  assert.equal(row.company_id, null);
  assert.notEqual(row.owner_id, contact.owner_id, 'distribuição equilibra a carteira');
  await db.close();
});

test('RLS: comercial só vê e altera a própria carteira', async () => {
  const db = await setup();
  const cid = await capture(db, lead());
  const owner = (await db.query('select owner_id from contacts where id = $1', [cid])).rows[0].owner_id;
  const other = owner === ids.ana ? ids.bruno : ids.ana;

  await as(db, other);
  assert.equal(await count(db, 'contacts'), 0);
  assert.equal(await count(db, 'activities'), 0);
  assert.equal(await count(db, 'interactions'), 0);
  const blocked = await db.query(`update contacts set notes = 'x' where id = $1 returning id`, [cid]);
  assert.equal(blocked.rows.length, 0);
  await assert.rejects(db.query('select capture_lead($1::jsonb)', [JSON.stringify(lead())]), 'captação é só do service role');

  await as(db, owner);
  assert.equal(await count(db, 'contacts'), 1);
  await assert.rejects(
    db.query('update contacts set owner_id = $1 where id = $2', [other, cid]),
    'comercial não passa o lead para outra pessoa',
  );
  await assert.rejects(db.query(`update contacts set source = 'x' where id = $1`, [cid]), 'origem é imutável');
  await assert.rejects(db.query('delete from contacts where id = $1 returning id', [cid]).then((r) => {
    if (!r.rows.length) throw new Error('bloqueado');
  }), 'só admin exclui');

  // Concluir uma ligação marca o lead como contatado.
  await db.query(
    `insert into activities(contact_id, owner_id, title, kind, completed_at) values($1, $2, 'Ligação feita', 'Ligação', now())`,
    [cid, owner],
  );
  await asService(db);
  assert.ok((await db.query('select first_contact_at from contacts where id = $1', [cid])).rows[0].first_contact_at);
  await db.close();
});

test('admin reatribui, atividade pendente acompanha e exclusão em cascata', async () => {
  const db = await setup();
  const cid = await capture(db, lead());
  const owner = (await db.query('select owner_id from contacts where id = $1', [cid])).rows[0].owner_id;
  const other = owner === ids.ana ? ids.bruno : ids.ana;

  await as(db, ids.admin);
  await db.query(
    `insert into activities(contact_id, owner_id, title, kind, completed_at) values($1, $2, 'E-mail enviado', 'E-mail', now())`,
    [cid, owner],
  );
  await db.query('update contacts set owner_id = $1 where id = $2', [other, cid]);
  const acts = (await db.query('select owner_id, completed_at from activities where contact_id = $1', [cid])).rows;
  assert.equal(acts.find((a) => !a.completed_at).owner_id, other, 'pendente segue o novo responsável');
  assert.equal(acts.find((a) => a.completed_at).owner_id, owner, 'realizada mantém quem atendeu');

  // Editar uma atividade realizada não pode falhar por causa da troca de carteira.
  await db.query(`update activities set notes = 'ok' where contact_id = $1 and completed_at is not null`, [cid]);

  const deleted = await db.query('delete from contacts where id = $1 returning id', [cid]);
  assert.equal(deleted.rows.length, 1);
  await asService(db);
  assert.equal(await count(db, 'activities'), 0);
  assert.equal(await count(db, 'interactions'), 0);
  await db.close();
});

test('cadastro só vira acesso após aprovação do admin', async () => {
  const db = await setup();
  await db.query(
    `insert into auth.users(id, email, raw_user_meta_data) values($1, 'novo@example.test', '{"request_crm_access":"true","name":"Novo"}')`,
    [ids.novo],
  );
  assert.equal(await count(db, 'access_requests'), 1);
  assert.equal((await db.query('select count(*)::int n from profiles where id = $1', [ids.novo])).rows[0].n, 0);

  await as(db, ids.ana);
  await assert.rejects(db.query(`select review_crm_access($1, 'approved')`, [ids.novo]));

  await as(db, ids.admin);
  await db.query(`select review_crm_access($1, 'approved')`, [ids.novo]);
  await asService(db);
  const profile = (await db.query('select role, active from profiles where id = $1', [ids.novo])).rows[0];
  assert.deepEqual(profile, { role: 'comercial', active: true });
  await db.close();
});

test('limite de 10 tentativas por chave', async () => {
  const db = await setup();
  const results = [];
  for (let i = 0; i < 11; i++) results.push((await db.query(`select consume_limit('k') ok`)).rows[0].ok);
  assert.deepEqual(results, [...Array(10).fill(true), false]);
  await db.close();
});
