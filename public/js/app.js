(() => {
  'use strict';

  // Perfis definidos pelo usuário. Não alterar sem nova validação.
  const PERFIS = [
    { id: 'municipal', rotulo: 'Profissional de saúde da rede municipal de Florianópolis' },
    { id: 'nao_municipal', rotulo: 'Profissional de saúde externo à rede municipal' },
    { id: 'nao_profissional', rotulo: 'Pessoa sem vínculo profissional com a área da saúde' }
  ];

  const TOTAL_PREVISTO = 60;

  const estado = {
    agravos: [],
    direcionamentos: {},
    agravoId: null,
    perfilId: null,
    termo: ''
  };

  const $ = (seletor) => document.querySelector(seletor);

  const normalizar = (texto) =>
    String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  function numeroDoAgravo(texto) {
    const valor = String(texto || '').match(/(\d+)/);
    return valor ? Number(valor[1]) : Number.MAX_SAFE_INTEGER;
  }

  // Lista vazia => placeholders explícitos, nunca nomes inventados.
  function montarAgravos(dados) {
    if (Array.isArray(dados) && dados.length > 0) {
      const itens = [];

      dados.forEach((item) => {
        if (!item || !item.id) return;

        const subitens = Array.isArray(item.subitens)
          ? item.subitens.filter((sub) => sub && sub.id && sub.nome)
          : [];

        if (subitens.length > 0) {
          const grupo = {
            id: String(item.id),
            nome: String(item.nome || item.id),
            tipo: 'grupo',
            selecionavel: false,
            subitens: subitens.map((sub) => ({
              id: String(sub.id),
              nome: String(sub.nome),
              tipo: 'subitem',
              selecionavel: true,
              grupoId: String(item.id),
              grupoNome: String(item.nome || item.id)
            }))
          };
          itens.push(grupo, ...grupo.subitens);
          return;
        }

        if (item.nome) {
          itens.push({
            id: String(item.id),
            nome: String(item.nome),
            tipo: 'item',
            selecionavel: true,
            placeholder: false
          });
        }
      });

      if (itens.length > 0) {
        return itens.sort((a, b) => {
          const numeroA = numeroDoAgravo(a.nome);
          const numeroB = numeroDoAgravo(b.nome);
          if (numeroA !== numeroB) return numeroA - numeroB;
          return String(a.nome).localeCompare(String(b.nome), 'pt-BR');
        });
      }
    }

    return Array.from({ length: TOTAL_PREVISTO }, (_, i) => {
      const n = String(i + 1).padStart(2, '0');
      return {
        id: `PLACEHOLDER-${n}`,
        nome: `PLACEHOLDER — agravo ${n} — nome oficial pendente`,
        tipo: 'item',
        selecionavel: true,
        placeholder: true
      };
    });
  }

  async function carregarJSON(caminho) {
    const resposta = await fetch(caminho, { cache: 'no-store', credentials: 'omit' });
    if (!resposta.ok) throw new Error(`Falha ao carregar ${caminho}`);
    return resposta.json();
  }

  function renderizarListaAgravos() {
    const termo = normalizar(estado.termo);
    const lista = $('#lista-agravos');
    lista.textContent = '';

    const grupos = estado.agravos.filter((a) => a.tipo === 'grupo')
      .sort((a, b) => numeroDoAgravo(a.nome) - numeroDoAgravo(b.nome));
    const itensSimples = estado.agravos.filter((a) => a.tipo === 'item' && (!termo || normalizar(a.nome).includes(termo)))
      .sort((a, b) => numeroDoAgravo(a.nome) - numeroDoAgravo(b.nome));

    const gruposVisiveis = grupos
      .map((grupo) => ({
        ...grupo,
        subitens: (grupo.subitens || [])
          .filter((sub) => !termo || normalizar(sub.nome).includes(termo))
          .sort((a, b) => numeroDoAgravo(a.nome) - numeroDoAgravo(b.nome))
      }))
      .filter((grupo) => grupo.subitens.length > 0);

    const totalExibidos = itensSimples.length + gruposVisiveis.reduce((total, grupo) => total + grupo.subitens.length, 0);

    if (totalExibidos === 0) {
      const li = document.createElement('li');
      li.className = 'vazio';
      li.textContent = 'Nenhum agravo encontrado para esta busca. Revise o termo digitado.';
      lista.appendChild(li);
      $('#busca-status').textContent = '';
      return;
    }

    const blocos = [];

    itensSimples.forEach((agravo) => {
      blocos.push({ tipo: 'item', agravo });
    });

    gruposVisiveis.forEach((grupo) => {
      blocos.push({ tipo: 'grupo', grupo });
    });

    blocos.sort((a, b) => {
      const numeroA = numeroDoAgravo(a.tipo === 'item' ? a.agravo.nome : a.grupo.nome);
      const numeroB = numeroDoAgravo(b.tipo === 'item' ? b.agravo.nome : b.grupo.nome);
      if (numeroA !== numeroB) return numeroA - numeroB;
      return String(a.tipo === 'item' ? a.agravo.nome : a.grupo.nome).localeCompare(
        String(b.tipo === 'item' ? b.agravo.nome : b.grupo.nome),
        'pt-BR'
      );
    });

    blocos.forEach((bloco) => {
      if (bloco.tipo === 'item') {
        const li = document.createElement('li');
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'item-agravo';
        botao.dataset.id = bloco.agravo.id;
        botao.textContent = bloco.agravo.nome;
        botao.setAttribute('aria-pressed', String(bloco.agravo.id === estado.agravoId));
        li.appendChild(botao);
        lista.appendChild(li);
        return;
      }

      const liGrupo = document.createElement('li');
      liGrupo.className = 'grupo-agravo';

      const titulo = document.createElement('div');
      titulo.className = 'grupo-agravo-titulo';
      titulo.textContent = bloco.grupo.nome;
      liGrupo.appendChild(titulo);

      const subLista = document.createElement('ul');
      subLista.className = 'sublista-agravos';

      bloco.grupo.subitens.forEach((subitem) => {
        const itemLi = document.createElement('li');
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'item-agravo item-subitem';
        botao.dataset.id = subitem.id;
        botao.textContent = subitem.nome;
        botao.setAttribute('aria-pressed', String(subitem.id === estado.agravoId));
        itemLi.appendChild(botao);
        subLista.appendChild(itemLi);
      });

      liGrupo.appendChild(subLista);
      lista.appendChild(liGrupo);
    });

    const totalSelecionavel = estado.agravos.filter((a) => a.selecionavel !== false).length;
    $('#busca-status').textContent = `${totalExibidos} agravo(s) exibido(s) de ${totalSelecionavel}.`;
  }

  function renderizarPerfis() {
    const container = $('#perfis');
    PERFIS.forEach((perfil) => {
      const rotulo = document.createElement('label');
      rotulo.className = 'opcao';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'perfil';
      radio.value = perfil.id;
      radio.id = `perfil-${perfil.id}`;
      const texto = document.createElement('span');
      texto.textContent = perfil.rotulo;
      rotulo.setAttribute('for', radio.id);
      rotulo.appendChild(radio);
      rotulo.appendChild(texto);
      container.appendChild(rotulo);
    });
  }

  function criarLinha(tag, texto, classe) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    el.textContent = texto;
    return el;
  }

  function renderizarResultado() {
    const caixa = $('#resultado');
    caixa.textContent = '';

    const agravo = estado.agravos.find((a) => a.id === estado.agravoId);
    const perfil = PERFIS.find((p) => p.id === estado.perfilId);

    if (!agravo && !perfil) {
      caixa.appendChild(criarLinha('p', 'Selecione um agravo e um perfil para ver o direcionamento.', 'estado'));
      return;
    }
    if (!agravo) {
      caixa.appendChild(criarLinha('p', 'Falta selecionar o agravo.', 'estado'));
      return;
    }
    if (!perfil) {
      caixa.appendChild(criarLinha('p', 'Falta selecionar o perfil.', 'estado'));
      return;
    }

    caixa.appendChild(criarLinha('p', `Agravo: ${agravo.nome}`, 'estado'));
    caixa.appendChild(criarLinha('p', `Perfil: ${perfil.rotulo}`, 'estado'));

    const dados = estado.direcionamentos[agravo.id] && estado.direcionamentos[agravo.id][perfil.id];
    const valido = dados && typeof dados.texto === 'string' && dados.texto.trim() !== '';

    if (!valido) {
      caixa.appendChild(criarLinha('p', 'Não há direcionamento oficial confirmado para esta combinação.', 'estado'));
      return;
    }

    caixa.appendChild(criarLinha('h3', dados.titulo || 'Direcionamento'));
    caixa.appendChild(criarLinha('p', dados.texto));
    if (dados.orgao) caixa.appendChild(criarLinha('p', `Órgão: ${dados.orgao}`, 'orgao'));
    // Somente links https são aceitos.
    if (typeof dados.link === 'string' && /^https:\/\//.test(dados.link)) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = dados.link;
      a.rel = 'noopener noreferrer';
      a.textContent = 'Acessar a referência oficial';
      p.appendChild(a);
      caixa.appendChild(p);
    }
  }

  function configurarEventos() {
    $('#busca').addEventListener('input', (evento) => {
      estado.termo = evento.target.value;
      renderizarListaAgravos();
    });

    $('#lista-agravos').addEventListener('click', (evento) => {
      const botao = evento.target.closest('button[data-id]');
      if (!botao) return;
      estado.agravoId = botao.dataset.id;
      renderizarListaAgravos();
      renderizarResultado();
    });

    $('#perfis').addEventListener('change', (evento) => {
      if (evento.target.name === 'perfil') {
        estado.perfilId = evento.target.value;
        renderizarResultado();
      }
    });
  }

  async function iniciar() {
    renderizarPerfis();
    configurarEventos();
    try {
      const [agravos, direcionamentos] = await Promise.all([
        carregarJSON('data/agravos.json'),
        carregarJSON('data/direcionamentos.json')
      ]);
      estado.agravos = montarAgravos(agravos);
      estado.direcionamentos = direcionamentos && typeof direcionamentos === 'object' ? direcionamentos : {};
      renderizarListaAgravos();
      renderizarResultado();
      if (estado.agravos.length !== TOTAL_PREVISTO) {
        $('#busca-status').textContent += ` Atenção: a lista tem ${estado.agravos.length} itens; o previsto são ${TOTAL_PREVISTO}.`;
      }
    } catch (erro) {
      $('#busca-status').textContent = 'Não foi possível carregar os dados. Tente novamente mais tarde.';
    }
  }

  iniciar();
})();
