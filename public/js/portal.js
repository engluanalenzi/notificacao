(() => {
  'use strict';

  const aplicacao = document.querySelector('#aplicacao-notificacao');

  function ajustarAlturaAplicacao() {
    const documento = aplicacao.contentDocument;
    if (!documento || !documento.body) return;

    const altura = Math.max(
      documento.documentElement.scrollHeight,
      documento.body.scrollHeight,
      documento.body.offsetHeight
    );
    if (Math.abs(aplicacao.getBoundingClientRect().height - altura) > 1) {
      aplicacao.style.height = `${altura}px`;
    }
  }

  aplicacao.addEventListener('load', ajustarAlturaAplicacao);
  window.addEventListener('resize', ajustarAlturaAplicacao);
  ajustarAlturaAplicacao();
})();
