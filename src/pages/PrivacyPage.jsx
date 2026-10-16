import { CONTACT } from '../site.js';

export default function PrivacyPage() {
  const email = CONTACT.email || 'coutstech@gmail.com';
  return (
    <article className="section privacy wrap wrap--narrow">
      <h1 className="h2">Política de Privacidade</h1>
      <p>Atualizada em 16 de outubro de 2026.</p>
      <h2>Quem recebe seus dados</h2>
      <p>A COUTS é responsável pelo atendimento das solicitações feitas neste site. Para assuntos de privacidade, entre em contato pelo e-mail <a href={`mailto:${email}`}>{email}</a>.</p>
      <h2>Dados e finalidade do contato</h2>
      <p>O formulário solicita nome, e-mail e treinamento de interesse. Empresa, telefone e mensagem são opcionais. Usamos essas informações para responder à sua solicitação, informar sobre treinamentos e preparar propostas solicitadas. Não inclua dados sensíveis na mensagem.</p>
      <h2>Serviços envolvidos</h2>
      <p>O envio do formulário utiliza o FormSubmit para encaminhar as informações à caixa de e-mail da COUTS. Esses prestadores e a infraestrutura de hospedagem podem processar dados técnicos, como endereço IP e registros de acesso, para operar e proteger os serviços. O processamento pode ocorrer fora do Brasil.</p>
      <h2>Métricas e cookies opcionais</h2>
      <p>Quando configurado e autorizado por você, o Google Analytics mede visitas, cliques em cursos e solicitações concluídas. Nome, e-mail, telefone, empresa e texto da mensagem não são enviados pelos eventos de métricas implementados neste site. O Google pode processar identificadores de cookies e dados técnicos de acesso.</p>
      <p>Você pode aceitar ou recusar as métricas opcionais. A escolha fica salva no navegador para ser respeitada em novas visitas. Para alterar sua escolha, use o botão abaixo. O formulário funciona mesmo sem aceitar métricas.</p>
      <button className="btn btn--ghost" type="button" onClick={() => window.dispatchEvent(new Event('couts:privacy-settings'))}>Alterar preferências de métricas</button>
      <h2>Conservação e seus direitos</h2>
      <p>Os dados de contato são conservados pelo período necessário ao atendimento e a eventuais obrigações aplicáveis. Você pode solicitar informações sobre o tratamento, acesso, correção e eliminação de dados, quando aplicável, pelo e-mail indicado nesta página. A revogação das métricas interrompe novos envios neste navegador; ela não apaga automaticamente dados já recebidos pelo Google.</p>
      <h2>Links externos e atualizações</h2>
      <p>Ao acessar WhatsApp, redes sociais ou outros sites externos, consulte também as políticas desses serviços. Esta página será atualizada quando houver mudanças relevantes no tratamento de dados.</p>
      <a className="btn btn--ghost" href="/">Voltar para a página inicial</a>
    </article>
  );
}
