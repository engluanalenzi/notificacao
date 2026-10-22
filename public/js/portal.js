(() => {
  'use strict';

  const aplicacao = document.querySelector('#aplicacao-notificacao');
  let observadorConteudo;

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

  aplicacao.addEventListener('load', () => {
    const documento = aplicacao.contentDocument;
    if (!documento) return;

    ajustarAlturaAplicacao();
    if (window.ResizeObserver) {
      observadorConteudo?.disconnect();
      observadorConteudo = new window.ResizeObserver(ajustarAlturaAplicacao);
      const conteudo = documento.querySelector('#principal');
      if (conteudo) observadorConteudo.observe(conteudo);
      const rodape = documento.querySelector('.rodape');
      if (rodape) observadorConteudo.observe(rodape);
    }
  });
  window.addEventListener('resize', ajustarAlturaAplicacao);
  ajustarAlturaAplicacao();
})();
