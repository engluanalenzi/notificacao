(() => {
  'use strict';

  const item = document.querySelector('#link-notificacao');
  const titulo = document.querySelector('#titulo-conteudo');
  const migalha = document.querySelector('#migalha-conteudo');
  const descricao = document.querySelector('#descricao-alertas');
  const alertas = document.querySelector('#lista-alertas');
  const aplicacao = document.querySelector('#aplicacao-notificacao');

  item.addEventListener('click', (evento) => {
    evento.preventDefault();
    alertas.hidden = true;
    descricao.hidden = true;
    aplicacao.hidden = false;
    titulo.textContent = 'NOTIFICAÇÃO COMPULSÓRIA';
    migalha.textContent = 'Home > Vigilância em Saúde do Trabalhador > Notificação Compulsória';
    item.setAttribute('aria-current', 'page');

    if (!aplicacao.getAttribute('src')) aplicacao.src = aplicacao.dataset.src;
    aplicacao.focus();
  });

  aplicacao.addEventListener('load', () => {
    const documento = aplicacao.contentDocument;
    if (documento) aplicacao.style.height = `${documento.documentElement.scrollHeight}px`;
  });

  window.addEventListener('resize', () => {
    if (!aplicacao.hidden && aplicacao.contentDocument) {
      aplicacao.style.height = `${aplicacao.contentDocument.documentElement.scrollHeight}px`;
    }
  });
})();
