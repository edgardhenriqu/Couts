-- CRM da COUTS: leads do formulário do site, empresas, atividades de
-- atendimento, equipe com papéis e solicitações de acesso.
--
-- Mesmo modelo do CRM da Mundi Data, sem oportunidades, serviços, funil,
-- fila de e-mails e configurações (que a interface de lá já não usava).
-- Aplique uma única vez no SQL Editor do Supabase, em um projeto novo.
begin;

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------ tabelas
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  role text not null check (role in ('admin', 'gestor', 'comercial')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 160),
  domain text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique check (email = lower(trim(email))),
  phone text not null default '',
  company_id uuid references public.companies on delete set null,
  owner_id uuid references public.profiles on delete set null,
  interest text not null default '',
  source text not null default 'Direto',
  first_attribution jsonb not null default '{}',
  last_attribution jsonb not null default '{}',
  notes text not null default '',
  consent_at timestamptz not null,
  privacy_version text not null default '2026-10',
  first_contact_at timestamptz,
  last_interaction_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts on delete cascade,
  owner_id uuid references public.profiles on delete set null,
  title text not null,
  kind text not null default 'Tarefa' check (kind in ('Tarefa', 'Ligação', 'E-mail', 'Reunião', 'Nota')),
  due_at timestamptz,
  completed_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- Cada envio do formulário. `request_id` torna o reenvio idempotente.
create table public.interactions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts on delete cascade,
  request_id uuid not null unique,
  message text not null,
  interest text not null default '',
  attribution jsonb not null,
  duplicate boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  contact_id uuid references public.contacts on delete cascade,
  actor_id uuid,
  entity text not null,
  entity_id uuid not null,
  operation text not null,
  changes jsonb not null,
  created_at timestamptz not null default now()
);

create table public.rate_limits (
  key text primary key,
  count integer not null,
  expires_at timestamptz not null
);

create table public.access_requests (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null
);

create index contacts_owner_created on public.contacts (owner_id, created_at desc);
create index contacts_company on public.contacts (company_id);
create index activities_due on public.activities (due_at) where completed_at is null;
create index activities_contact on public.activities (contact_id);
create index interactions_contact on public.interactions (contact_id, created_at);
create index audit_contact on public.audit_log (contact_id, created_at);

-- ------------------------------------------------------- papéis e escopo
create function public.crm_role() returns text
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid() and active
$$;

-- Admin e gestor veem todos os leads; comercial, só a própria carteira.
create function public.can_contact(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from contacts
    where id = cid
      and (public.crm_role() in ('admin', 'gestor')
           or (public.crm_role() = 'comercial' and owner_id = auth.uid()))
  )
$$;

-- ------------------------------------------------------------------- RLS
do $$
declare t text;
begin
  foreach t in array array['profiles', 'companies', 'contacts', 'activities', 'interactions', 'audit_log', 'rate_limits', 'access_requests'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

create policy profiles_read on public.profiles for select to authenticated
  using (public.crm_role() is not null);
create policy profiles_admin on public.profiles for all to authenticated
  using (public.crm_role() = 'admin') with check (public.crm_role() = 'admin');

create policy companies_read on public.companies for select to authenticated
  using (public.crm_role() in ('admin', 'gestor')
         or exists (select 1 from contacts where company_id = companies.id and owner_id = auth.uid() and public.crm_role() = 'comercial'));
create policy companies_insert on public.companies for insert to authenticated
  with check (public.crm_role() in ('admin', 'gestor'));
create policy companies_update on public.companies for update to authenticated
  using (public.crm_role() in ('admin', 'gestor')) with check (public.crm_role() in ('admin', 'gestor'));
create policy companies_delete on public.companies for delete to authenticated
  using (public.crm_role() = 'admin');

-- Leads só entram pelo formulário (capture_lead); não há política de insert.
create policy contacts_read on public.contacts for select to authenticated
  using (public.can_contact(id));
create policy contacts_update on public.contacts for update to authenticated
  using (public.can_contact(id))
  with check (public.can_contact(id) and (public.crm_role() in ('admin', 'gestor') or owner_id = auth.uid()));
create policy contacts_delete on public.contacts for delete to authenticated
  using (public.crm_role() = 'admin');

create policy activities_read on public.activities for select to authenticated
  using (public.can_contact(contact_id));
create policy activities_insert on public.activities for insert to authenticated
  with check (public.can_contact(contact_id) and (public.crm_role() in ('admin', 'gestor') or owner_id = auth.uid()));
create policy activities_update on public.activities for update to authenticated
  using (public.can_contact(contact_id))
  with check (public.can_contact(contact_id) and (public.crm_role() in ('admin', 'gestor') or owner_id = auth.uid()));
create policy activities_delete on public.activities for delete to authenticated
  using (public.crm_role() = 'admin');

create policy interactions_read on public.interactions for select to authenticated
  using (public.can_contact(contact_id));
create policy audit_read on public.audit_log for select to authenticated
  using (public.crm_role() in ('admin', 'gestor') or public.can_contact(contact_id));
create policy access_requests_admin_read on public.access_requests for select to authenticated
  using (public.crm_role() = 'admin');

-- --------------------------------------------------------------- gatilhos
create function public.audit_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare cid uuid; oldj jsonb; newj jsonb;
begin
  oldj = case when TG_OP = 'INSERT' then '{}'::jsonb else to_jsonb(OLD) end;
  newj = case when TG_OP = 'DELETE' then '{}'::jsonb else to_jsonb(NEW) end;
  cid = case
    when TG_TABLE_NAME = 'contacts' then coalesce(newj->>'id', oldj->>'id')::uuid
    when TG_TABLE_NAME = 'activities' then coalesce(newj->>'contact_id', oldj->>'contact_id')::uuid
  end;
  -- Exclusões não guardam vínculo nem conteúdo pessoal.
  if TG_OP = 'DELETE' then cid = null; end if;
  insert into audit_log (contact_id, actor_id, entity, entity_id, operation, changes)
  values (cid, auth.uid(), TG_TABLE_NAME, coalesce(newj->>'id', oldj->>'id')::uuid, TG_OP,
          case when TG_OP = 'DELETE' then '{"deleted":true}'::jsonb else jsonb_build_object('before', oldj, 'after', newj) end);
  return coalesce(NEW, OLD);
end $$;

do $$
declare t text;
begin
  foreach t in array array['contacts', 'activities', 'companies', 'profiles'] loop
    execute format('create trigger audit after insert or update or delete on public.%I for each row execute function public.audit_change()', t);
  end loop;
end $$;

-- Concluir ligação, e-mail ou reunião marca o lead como contatado.
create function public.activity_completed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if NEW.completed_at is not null and NEW.kind in ('Ligação', 'E-mail', 'Reunião') then
    update contacts
    set first_contact_at = coalesce(first_contact_at, NEW.completed_at),
        last_interaction_at = greatest(last_interaction_at, NEW.completed_at)
    where id = NEW.contact_id;
  end if;
  return NEW;
end $$;
create trigger activity_done after insert or update on public.activities
  for each row execute function public.activity_completed();

-- Trocar o responsável do lead leva junto as atividades pendentes.
create function public.contact_updated() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  NEW.updated_at = now();
  if public.crm_role() = 'comercial' and NEW.company_id is distinct from OLD.company_id then
    raise exception 'Company reassignment requires manager';
  end if;
  if NEW.owner_id is not null and not exists (select 1 from profiles where id = NEW.owner_id and active) then
    raise exception 'Inactive owner';
  end if;
  if NEW.owner_id is distinct from OLD.owner_id then
    update activities set owner_id = NEW.owner_id where contact_id = NEW.id and completed_at is null;
  end if;
  return NEW;
end $$;
create trigger contact_updated before update on public.contacts
  for each row execute function public.contact_updated();

-- A atividade nova (ou reatribuída) segue o responsável do lead. Atividades
-- concluídas mantêm quem fez o atendimento, mesmo após troca de carteira.
create function public.validate_activity() returns trigger
language plpgsql set search_path = public as $$
declare c contacts;
begin
  select * into c from contacts where id = NEW.contact_id;
  if c.id is null then raise exception 'Contact not accessible'; end if;
  if pg_trigger_depth() = 1
     and (TG_OP = 'INSERT' or NEW.owner_id is distinct from OLD.owner_id or NEW.contact_id is distinct from OLD.contact_id)
     and NEW.owner_id is distinct from c.owner_id then
    raise exception 'Owner must match contact owner';
  end if;
  return NEW;
end $$;
create trigger validate_activity before insert or update on public.activities
  for each row execute function public.validate_activity();

-- ------------------------------------------------- captação (service role)
create function public.consume_limit(p_key text) returns boolean
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  insert into rate_limits (key, count, expires_at) values (p_key, 1, now() + interval '1 hour')
  on conflict (key) do update set
    count = case when rate_limits.expires_at < now() then 1 else rate_limits.count + 1 end,
    expires_at = case when rate_limits.expires_at < now() then now() + interval '1 hour' else rate_limits.expires_at end
  returning count into n;
  return n <= 10;
end $$;

create function public.capture_lead(p jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare cid uuid; coid uuid; oid uuid; dup boolean = false; src text; company text;
begin
  -- Serializa reenvios e envios simultâneos do mesmo e-mail.
  perform pg_advisory_xact_lock(hashtextextended(p->>'request_id', 0));
  select contact_id into cid from interactions where request_id = (p->>'request_id')::uuid;
  if cid is not null then return cid; end if;

  perform pg_advisory_xact_lock(hashtextextended(p->>'email', 1));
  select id into cid from contacts where email = p->>'email';
  dup = cid is not null;

  if cid is null then
    -- Distribui para o comercial ativo com menos leads.
    perform pg_advisory_xact_lock(918271);
    select pr.id into oid
    from profiles pr left join contacts c on c.owner_id = pr.id
    where pr.active and pr.role = 'comercial'
    group by pr.id, pr.created_at
    order by count(c.id), pr.created_at
    limit 1;

    company = nullif(trim(coalesce(p->>'company', '')), '');
    if company is not null then
      select id into coid from companies where lower(name) = lower(company) order by created_at limit 1;
      if coid is null then insert into companies (name) values (company) returning id into coid; end if;
    end if;

    src = case
      when lower(p->'first'->>'utm_source') like '%google%' then
        case when lower(p->'first'->>'utm_medium') in ('cpc', 'ppc', 'paid') then 'Google Ads' else 'Google Orgânico' end
      when lower(p->'first'->>'utm_source') like '%instagram%' then 'Instagram'
      when lower(p->'first'->>'utm_source') like '%linkedin%' then
        case when lower(p->'first'->>'utm_medium') in ('cpc', 'paid', 'paid_social') then 'LinkedIn Ads' else 'LinkedIn Orgânico' end
      when lower(p->'first'->>'utm_medium') = 'email' then 'E-mail'
      when lower(p->'first'->>'utm_source') = 'whatsapp' then 'WhatsApp'
      when coalesce(p->'first'->>'referrer', '') like '%google.%' then 'Google Orgânico'
      when coalesce(p->'first'->>'referrer', '') like '%instagram.%' then 'Instagram'
      when coalesce(p->'first'->>'referrer', '') like '%linkedin.%' then 'LinkedIn Orgânico'
      when coalesce(p->'first'->>'referrer', '') <> '' then 'Referência'
      else 'Direto'
    end;

    insert into contacts (name, email, phone, company_id, owner_id, interest, source, first_attribution, last_attribution, consent_at, last_interaction_at)
    values (p->>'name', p->>'email', coalesce(p->>'phone', ''), coid, oid, coalesce(p->>'interest', ''), src, p->'first', p->'last', now(), now())
    returning id into cid;

    insert into activities (contact_id, owner_id, title, due_at)
    values (cid, oid, 'Realizar primeiro contato', now() + interval '1 day');
  else
    update contacts
    set last_attribution = p->'last', last_interaction_at = now(),
        phone = case when phone = '' then coalesce(p->>'phone', '') else phone end
    where id = cid;
  end if;

  insert into interactions (contact_id, request_id, message, interest, attribution, duplicate)
  values (cid, (p->>'request_id')::uuid, coalesce(p->>'message', ''), coalesce(p->>'interest', ''), p->'last', dup);
  return cid;
end $$;

-- ------------------------------------------------- cadastro com aprovação
-- Os metadados do cadastro só abrem uma solicitação; nunca dão papel ou acesso.
create function public.request_crm_access() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if NEW.raw_user_meta_data->>'request_crm_access' = 'true' then
    insert into public.access_requests (id, name, email)
    values (NEW.id, left(coalesce(nullif(trim(NEW.raw_user_meta_data->>'name'), ''), 'Novo usuário'), 120), NEW.email);
  end if;
  return NEW;
end $$;
create trigger crm_access_requested after insert on auth.users
  for each row execute function public.request_crm_access();

create function public.review_crm_access(request_id uuid, decision text) returns void
language plpgsql security definer set search_path = public as $$
declare request_row public.access_requests;
begin
  if public.crm_role() is distinct from 'admin' then raise exception 'Apenas administradores' using errcode = '42501'; end if;
  if decision is null or decision not in ('approved', 'rejected') then raise exception 'Decisão inválida'; end if;
  select * into request_row from public.access_requests where id = request_id for update;
  if not found or request_row.status <> 'pending' then raise exception 'Solicitação já revisada ou inexistente'; end if;
  if decision = 'approved' then
    insert into public.profiles (id, name, role, active) values (request_row.id, request_row.name, 'comercial', true);
  end if;
  update public.access_requests set status = decision, reviewed_at = now(), reviewed_by = auth.uid() where id = request_id;
end $$;

-- ---------------------------------------------------------------- grants
revoke execute on function public.capture_lead(jsonb), public.consume_limit(text), public.request_crm_access() from public, anon, authenticated;
grant execute on function public.capture_lead(jsonb), public.consume_limit(text) to service_role;
revoke execute on function public.review_crm_access(uuid, text) from public, anon;
grant execute on function public.review_crm_access(uuid, text) to authenticated;

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated, service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

-- Campos da captação não podem ser reescritos pela API REST.
revoke update on public.contacts, public.activities from authenticated;
grant update (name, email, phone, owner_id, company_id, notes) on public.contacts to authenticated;
grant update (contact_id, owner_id, title, kind, due_at, completed_at, notes) on public.activities to authenticated;
revoke insert, update, delete on public.access_requests from authenticated;

commit;
