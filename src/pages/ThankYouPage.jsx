import Eyebrow from '../components/Eyebrow.jsx';

export default function ThankYouPage() {
  return (
    <section className="section thank-you" aria-labelledby="thank-you-title">
      <div className="wrap wrap--narrow">
        <div className="thank-you__card">
          <svg className="form__success-icon" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="23" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="m14.5 24.5 6.5 6.5 13-14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Eyebrow>Contato enviado</Eyebrow>
          <h1 className="h2" id="thank-you-title">Obrigado pelo seu interesse na COUTS!</h1>
          <p className="thank-you__lede">Sua mensagem foi enviada. Nossa equipe vai responder pelo e-mail informado no formulário.</p>
          <div className="thank-you__next">
            <h2>O que acontece agora?</h2>
            <p>Vamos analisar seu interesse e retornar com informações sobre os treinamentos ou a capacitação da sua equipe.</p>
            <p>Acompanhe sua caixa de entrada e confira também a pasta de spam.</p>
          </div>
          <div className="thank-you__actions">
            <a className="btn btn--primary" href="/">Voltar ao início →</a>
            <a className="btn btn--ghost" href="/#treinamentos">Explorar treinamentos</a>
          </div>
        </div>
      </div>
    </section>
  );
}
