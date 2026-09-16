import { useState } from 'react';

import Eyebrow from './Eyebrow.jsx';
import { TRAINING_OPTIONS } from '../data.js';

const EMPTY = { nome: '', email: '', telefone: '', treinamento: TRAINING_OPTIONS[0] };

export default function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [sent, setSent] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();

    // Sem back-end: reproduz o estado "enviado" do design.
    // Troque por um POST ao endpoint real quando ele existir — `values` já
    // carrega o payload completo.
    setSent(true);
  };

  return (
    <section className="section" id="contato">
      <div className="wrap wrap--narrow contact">
        <div>
          <Eyebrow>06 — Contato</Eyebrow>
          <h2 className="h2 h2--tight">
            Quer fazer parte da próxima geração da engenharia automotiva?
          </h2>
          <p className="contact__note">
            Preencha os dados e conte qual tecnologia você quer dominar. Retornamos com as próximas
            turmas e conteúdos.
          </p>
        </div>

        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span className="field__label">Nome</span>
            <input
              className="field__input"
              type="text"
              name="nome"
              autoComplete="name"
              required
              value={values.nome}
              onChange={onChange}
            />
          </label>

          <label className="field">
            <span className="field__label">E-mail</span>
            <input
              className="field__input"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={onChange}
            />
          </label>

          <label className="field">
            <span className="field__label">Telefone / WhatsApp</span>
            <input
              className="field__input"
              type="tel"
              name="telefone"
              autoComplete="tel"
              value={values.telefone}
              onChange={onChange}
            />
          </label>

          <label className="field">
            <span className="field__label">Qual treinamento você tem interesse?</span>
            <select
              className="field__input"
              name="treinamento"
              value={values.treinamento}
              onChange={onChange}
            >
              {TRAINING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button className="form__submit" type="submit" disabled={sent}>
            {sent ? 'Inscrição registrada' : 'Quero fazer parte'}
          </button>

          <p className="form__hint" aria-live="polite">
            {sent
              ? 'Recebemos seus dados. Em breve entraremos em contato.'
              : 'Seus dados são usados apenas para contato sobre os treinamentos.'}
          </p>
        </form>
      </div>
    </section>
  );
}
