/** Validação (Zod) do que entra pela API. Espelha as restrições do banco. */
import { z } from 'zod';

const text = (max) => z.string().trim().max(max);
const email = z.string().trim().email().max(180).transform((s) => s.toLowerCase());
const uuid = z.string().uuid();

export const attribution = z
  .object({
    utm_source: text(200),
    utm_medium: text(200),
    utm_campaign: text(200),
    utm_content: text(200),
    utm_term: text(200),
    landing_page: text(500),
    referrer: text(500),
  })
  .partial()
  .strict();

/** Envio do formulário do site (`src/components/Contact.jsx`). */
export const captureSchema = z
  .object({
    request_id: uuid,
    name: text(120).min(2),
    company: text(160).default(''),
    email,
    phone: text(40).default(''),
    interest: text(160).default(''),
    message: text(1500).default(''),
    website: text(200).default(''),
    first: attribution.default({}),
    last: attribution.default({}),
  })
  .strict();

export const ACTIVITY_KINDS = ['Tarefa', 'Ligação', 'E-mail', 'Reunião', 'Nota'];
export const ROLES = ['admin', 'gestor', 'comercial'];

/** Escritas do painel, por entidade. PATCH aceita qualquer subconjunto. */
export const entitySchemas = {
  contacts: z
    .object({
      name: text(120).min(2),
      email,
      phone: text(40),
      owner_id: uuid.nullable(),
      company_id: uuid.nullable(),
      notes: text(5000),
    })
    .partial()
    .strict(),
  activities: z
    .object({
      contact_id: uuid,
      owner_id: uuid.nullable(),
      title: text(300).min(2),
      kind: z.enum(ACTIVITY_KINDS),
      due_at: z.string().datetime({ offset: true }).nullable(),
      completed_at: z.string().datetime({ offset: true }).nullable(),
      notes: text(5000),
    })
    .strict(),
  companies: z.object({ name: text(160).min(2), domain: text(200), notes: text(5000) }).strict(),
  profiles: z.object({ name: text(120).min(2), role: z.enum(ROLES), active: z.boolean() }).strict(),
};
