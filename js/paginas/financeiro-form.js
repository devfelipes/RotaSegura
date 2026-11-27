function dataDeHojeParaCampo() {
  const hoje = new Date();
  return hoje.getFullYear() + '-' + doisDigitos(hoje.getMonth() + 1) + '-' + doisDigitos(hoje.getDate());
}

function abrirFormularioDeLancamento(tipo, aoSalvar) {
  const ehGanho = tipo === 'ganho';
  const opcoes = ehGanho ? PLATAFORMAS : CATEGORIAS_GASTO;
  const hoje = dataDeHojeParaCampo();

  let opcaoEscolhida = opcoes[0];
  if (ehGanho && dadosDoEntregador().plataformas.length > 0) {
    opcaoEscolhida = dadosDoEntregador().plataformas[0];
  }

  let botoesDeOpcao = '';
  for (const opcao of opcoes) {
    botoesDeOpcao += opcaoHTML(opcao, opcao, opcao === opcaoEscolhida, 'chip-sm');
  }

  let campoExtra = '';
  if (ehGanho) {
    campoExtra = '<div class="field"><label class="field-label" for="fe">Número de entregas</label><input class="input" id="fe" name="entregas" type="number" min="0" inputmode="numeric" placeholder="0"></div>';
  } else {
    let plataformas = '<option value="">Gasto geral</option>';
    for (const p of PLATAFORMAS) {
      plataformas += `<option>${p}</option>`;
    }
    campoExtra = `<div class="field"><label class="field-label" for="fp">Plataforma (opcional)</label><select class="select" id="fp" name="plataforma">${plataformas}</select></div>`;
  }

  const painel = abrirPainel(ehGanho ? 'Adicionar ganho' : 'Adicionar gasto', `
    <form class="form-stack" id="ff" novalidate>
      <div class="field">
        <label class="field-label" for="fv">Valor (R$)</label>
        <input class="input" id="fv" name="valor" inputmode="decimal" placeholder="0,00" autocomplete="off" style="font-size:22px;font-weight:700">
      </div>
      <div class="field">
        <span class="field-label">${ehGanho ? 'Plataforma' : 'Categoria'}</span>
        <div class="chips" id="fo" data-campo="${ehGanho ? 'plataforma' : 'categoria'}">${botoesDeOpcao}</div>
      </div>
      ${campoExtra}
      <div class="field">
        <label class="field-label" for="fd">Descrição (opcional)</label>
        <input class="input" id="fd" name="descricao" maxlength="60" placeholder="${ehGanho ? 'Ex.: Entregas do almoço' : 'Ex.: Abastecimento'}">
      </div>
      <div class="field">
        <label class="field-label" for="fdt">Data</label>
        <input class="input" type="date" id="fdt" name="data" max="${hoje}" value="${hoje}">
      </div>
      <button class="btn btn-primary" type="submit">${ehGanho ? 'Salvar ganho' : 'Salvar gasto'}</button>
    </form>`);

  const formulario = painel.elemento.querySelector('#ff');
  ativarEscolhaUnica(painel.elemento.querySelector('#fo'), function (valor) {
    opcaoEscolhida = valor;
  });

  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    let dataHora = Date.now();
    if (formulario.data.value !== hoje) {
      dataHora = new Date(formulario.data.value + 'T12:00').getTime();
    }

    const entregas = ehGanho ? formulario.entregas.value : 0;
    const plataforma = ehGanho ? null : formulario.plataforma.value;
    const erros = adicionarLancamento(tipo, formulario.valor.value, opcaoEscolhida, plataforma, entregas, formulario.descricao.value, dataHora);

    if (temErros(erros)) {
      mostrarErros(formulario, erros);
      return;
    }
    painel.fechar();
    mostrarAviso(ehGanho ? 'Ganho adicionado' : 'Gasto adicionado');
    aoSalvar();
  });
}
