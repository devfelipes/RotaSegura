verificarLogin();
criarMenuInferior('rota');
criarBotaoSOS(document.getElementById('mapa'), 'abs');
vigiarPausa();

let situacaoMostrada = '';

function mostrarBotoesJornadaAtiva() {
  document.getElementById('status').innerHTML = '<span class="badge green">Online</span>Jornada ativa';
  document.getElementById('pronto').hidden = true;
  document.getElementById('botoes').innerHTML = `
    <button class="btn btn-danger" id="encerrar">Encerrar jornada</button>
    <button class="btn btn-primary" id="pausar">Pausar</button>
    <a class="btn btn-light" href="ocorrencia.html">Registrar Ocorrência</a>`;

  document.getElementById('encerrar').addEventListener('click', perguntarSeQuerEncerrar);
  document.getElementById('pausar').addEventListener('click', function () {
    pausarJornada();
    location.href = 'pausa.html';
  });
}

function mostrarBotoesSemJornada() {
  document.getElementById('status').innerHTML = '<span class="badge gray">Aguardando</span>Jornada não iniciada';
  document.getElementById('pronto').hidden = false;
  document.getElementById('botoes').innerHTML = `
    <button class="btn btn-primary" id="iniciar">${icone('play', 22)}Iniciar jornada</button>
    <a class="btn btn-light" href="ocorrencia.html">Registrar Ocorrência</a>`;

  document.getElementById('iniciar').addEventListener('click', function () {
    iniciarJornada();
    mostrarAviso('Jornada iniciada. Bom trabalho e boa rota!');
    atualizarTela();
  });
}

function atualizarTela() {
  const jornada = jornadaAtiva();

  if (jornada !== null && jornada.estaEmPausa()) {
    location.replace('pausa.html');
    return;
  }

  if (jornada === null) {
    document.getElementById('relogio').textContent = formatarRelogio(0);
    if (situacaoMostrada !== 'parada') {
      situacaoMostrada = 'parada';
      mostrarBotoesSemJornada();
    }
  } else {
    document.getElementById('relogio').textContent = formatarRelogio(jornada.tempoTrabalhado());
    if (situacaoMostrada !== 'ativa') {
      situacaoMostrada = 'ativa';
      mostrarBotoesJornadaAtiva();
    }
  }
}

function perguntarSeQuerEncerrar() {
  confirmar({
    icone: 'square',
    cor: 'red',
    titulo: 'Encerrar jornada?',
    texto: 'O tempo será salvo no seu histórico e o link de trajeto compartilhado deixará de funcionar.',
    textoConfirmar: 'Encerrar',
    classeConfirmar: 'btn-red'
  }, function () {
    const jornada = encerrarJornada();
    atualizarTela();
    mostrarResumo(jornada);
  });
}

function mostrarResumo(jornada) {
  abrirModal({
    icone: 'check-circle',
    cor: 'green',
    titulo: 'Jornada encerrada',
    html: `<p>Resumo do dia</p>
      <div class="stat-grid" style="margin-top:16px;text-align:left">
        <div class="stat"><span class="lbl">Tempo<br>trabalhado</span><strong class="val">${formatarDuracao(jornada.tempoTrabalhado())}</strong></div>
        <div class="stat"><span class="lbl">Duração<br>total</span><strong class="val">${formatarDuracao(jornada.tempoTotal())}</strong></div>
        <div class="stat"><span class="lbl">Pausas</span><strong class="val">${jornada.pausas.length}</strong></div>
      </div>`,
    botoes: [
      { texto: 'Fechar', classe: 'btn-soft' },
      { texto: 'Ver histórico', classe: 'btn-primary', aoClicar: function () { location.href = 'historico.html'; } }
    ]
  });
}

atualizarTela();
setInterval(atualizarTela, 1000);
