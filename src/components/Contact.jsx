import { useEffect, useId, useRef, useState } from 'react';

import Eyebrow from './Eyebrow.jsx';
import { TRAINING_OPTIONS } from '../data.js';
import { CONTACT, whatsappHref } from '../site.js';
import { track } from '../analytics.js';

const EMPTY = { nome: '', empresa: '', email: '', telefone: '', interesse: '', mensagem: '' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values) {
  const errors = {};
  if (values.nome.trim().length < 2) errors.nome = 'Informe o seu nome.';
  if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Informe um e-mail válido.';
  if (values.telefone && values.telefone.replace(/\D/g, '').length < 10)
    errors.telefone = 'Informe o telefone com DDD.';
  return errors;
}

/** Texto usado quando o envio cai para e-mail ou WhatsApp. */
function summary(values) {
  return [
    `Nome: ${values.nome}`,
    values.empresa && `Empresa: ${values.empresa}`,
    `E-mail: ${values.email}`,
    values.telefone && `Telefone: ${values.telefone}`,
    `Interesse: ${values.interesse}`,
    values.mensagem && `Mensagem: ${values.mensagem}`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Formulário de contato.
 *
 * Envio, na ordem: `CONTACT.formEndpoint` (POST JSON) → e-mail (`mailto:`) →
 * WhatsApp. Sem nenhum canal configurado em `src/site.js`, o formulário avisa
 * que o envio está indisponível em vez de simular sucesso.
 *
 * Antispam: campo-isca invisível (`website`) e tempo mínimo de preenchimento.
 */
export default function Contact({
  eyebrow = '07 — Contato',
  title = 'Quer fazer parte da próxima geração da engenharia automotiva?',
  defaultInterest = TRAINING_OPTIONS[0],
}) {
  const [values, setValues] = useState({ ...EMPTY, interesse: defaultInterest });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | handoff | error | unavailable
  const startedAt = useRef(0);
  const successRef = useRef(null);
  const id = useId();

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Envio concluído: o painel de sucesso entra no lugar do formulário, a tela
  // rola até ele e o foco vai para ele (leitores de tela anunciam o título).
  useEffect(() => {
    if (status !== 'sent' || !successRef.current) return;
    successRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    successRef.current.focus({ preventScroll: true });
  }, [status]);

  const reset = () => {
    setValues({ ...EMPTY, interesse: defaultInterest });
    setErrors({});
    setStatus('idle');
    startedAt.current = Date.now();
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    const found = validate(values);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      form.elements[firstInvalid]?.focus();
      track('form_error', { field: firstInvalid });
      return;
    }

    // Robôs preenchem o campo-isca ou enviam em menos de 2 s: finge sucesso.
    if (form.elements.website?.value || Date.now() - startedAt.current < 2000) {
      setStatus('sent');
      return;
    }

    const payload = {
      ...values,
      pagina: window.location.href,
      // Campos de controle do FormSubmit (outros serviços os tratam como
      // campos comuns): assunto do e-mail, layout em tabela e resposta
      // direta para quem preencheu.
      _subject: `Contato pelo site COUTS — ${values.interesse}`,
      _template: 'table',
      _replyto: values.email,
    };

    if (CONTACT.formEndpoint) {
      setStatus('sending');
      try {
        const res = await fetch(CONTACT.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // O FormSubmit responde 200 com { success: "false" } quando o
        // formulário ainda não foi ativado ou o envio foi recusado.
        const data = await res.json().catch(() => ({}));
        if (String(data.success) === 'false') throw new Error(data.message || 'Envio recusado');
        setStatus('sent');
        setValues({ ...EMPTY, interesse: defaultInterest });
        track('form_submit', { interest: values.interesse, method: 'endpoint' });
      } catch {
        setStatus('error');
        track('form_error', { field: 'network' });
      }
      return;
    }

    if (CONTACT.email) {
      const subject = `Contato pelo site — ${values.interesse}`;
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary(values))}`;
      setStatus('handoff');
      track('form_submit', { interest: values.interesse, method: 'email' });
      return;
    }

    const wa = whatsappHref();
    if (wa) {
      const url = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(`${CONTACT.whatsappMessage}\n\n${summary(values)}`)}`;
      window.open(url, '_blank', 'noopener');
      setStatus('handoff');
      track('form_submit', { interest: values.interesse, method: 'whatsapp' });
      return;
    }

    if (import.meta.env.DEV) {
      console.warn('[Contato] Nenhum canal configurado: defina VITE_CONTACT_ENDPOINT, VITE_CONTACT_EMAIL ou VITE_WHATSAPP_NUMBER.');
    }
    setStatus('unavailable');
  };

  const fieldProps = (name) => ({
    id: `${id}-${name}`,
    name,
    className: 'field__input',
    value: values[name],
    onChange,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${id}-${name}-error` : undefined,
  });

  const fieldError = (name) =>
    errors[name] ? (
      <span className="field__error" id={`${id}-${name}-error`}>
        {errors[name]}
      </span>
    ) : null;

  const messages = {
    idle: 'Seus dados são usados apenas para retornar o seu contato sobre os treinamentos.',
    sending: 'Enviando…',
    sent: 'Recebemos sua mensagem. Em breve a equipe da COUTS entra em contato.',
    handoff: 'Abrimos o seu aplicativo para concluir o envio. Se nada aconteceu, tente novamente.',
    error: 'Não foi possível enviar agora. Verifique sua conexão e tente de novo.',
    unavailable: 'O envio pelo site está temporariamente indisponível. Tente novamente mais tarde.',
  };

  const wa = whatsappHref();

  return (
    <section className="section" id="contato" aria-labelledby={`${id}-title`}>
      <div className="wrap wrap--narrow contact">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="h2 h2--tight" id={`${id}-title`}>
            {title}
          </h2>
          <p className="contact__note">
            Preencha os dados e conte qual tecnologia você quer dominar. Retornamos com as próximas
            turmas e conteúdos.
          </p>
          <p className="contact__note contact__note--b2b">
            Para capacitar uma equipe, informe a empresa e escolha “Capacitação para empresa ou
            equipe”.
          </p>
          {wa && (
            <a
              className="btn btn--ghost contact__whatsapp"
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              data-track="whatsapp_click"
              aria-label="Conversar com a COUTS pelo WhatsApp (abre em nova aba)"
            >
              Conversar pelo WhatsApp
            </a>
          )}
        </div>

        {status === 'sent' ? (
          <div
            className="form form--success"
            ref={successRef}
            tabIndex={-1}
            role="status"
            aria-live="polite"
            aria-labelledby={`${id}-success-title`}
          >
            <svg className="form__success-icon" viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="23" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="m14.5 24.5 6.5 6.5 13-14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="form__success-title" id={`${id}-success-title`}>
              Mensagem enviada com sucesso!
            </h3>
            <p className="form__success-text">
              Obrigado pelo contato. Recebemos seus dados e a equipe da COUTS vai responder no
              e-mail informado em breve.
            </p>
            <button className="btn btn--ghost form__success-again" type="button" onClick={reset}>
              Enviar outra mensagem
            </button>
          </div>
        ) : (
          <form className="form" onSubmit={onSubmit} noValidate>
            <div className="field">
              <label className="field__label" htmlFor={`${id}-nome`}>
                Nome
              </label>
              <input {...fieldProps('nome')} type="text" autoComplete="name" required />
              {fieldError('nome')}
            </div>

            <div className="field">
              <label className="field__label" htmlFor={`${id}-empresa`}>
                Empresa <span className="field__optional">(opcional)</span>
              </label>
              <input {...fieldProps('empresa')} type="text" autoComplete="organization" />
            </div>

            <div className="field">
              <label className="field__label" htmlFor={`${id}-email`}>
                E-mail
              </label>
              <input {...fieldProps('email')} type="email" autoComplete="email" inputMode="email" required />
              {fieldError('email')}
            </div>

            <div className="field">
              <label className="field__label" htmlFor={`${id}-telefone`}>
                Telefone / WhatsApp <span className="field__optional">(opcional)</span>
              </label>
              <input {...fieldProps('telefone')} type="tel" autoComplete="tel" inputMode="tel" />
              {fieldError('telefone')}
            </div>

            <div className="field">
              <label className="field__label" htmlFor={`${id}-interesse`}>
                Qual treinamento você tem interesse?
              </label>
              <select {...fieldProps('interesse')}>
                {TRAINING_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor={`${id}-mensagem`}>
                Como podemos ajudar? <span className="field__optional">(opcional)</span>
              </label>
              <textarea {...fieldProps('mensagem')} rows={3} maxLength={1500} />
            </div>

            {/* Campo-isca: invisível para pessoas, preenchido por robôs. */}
            <div className="form__trap" aria-hidden="true">
              <label htmlFor={`${id}-website`}>Não preencha este campo</label>
              <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <button className="form__submit" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Enviando…' : 'Solicitar contato'}
            </button>

            <p
              className={status === 'error' || status === 'unavailable' ? 'form__hint form__hint--error' : 'form__hint'}
              role="status"
              aria-live="polite"
            >
              {messages[status]}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
