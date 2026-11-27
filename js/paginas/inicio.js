verificarLogin();
criarMenuInferior('inicio');
criarBotaoSOS();
vigiarPausa();

const nomeDoEntregador = dadosDoEntregador().nome;
if (nomeDoEntregador) {
  document.getElementById('saudacao').textContent = 'Boas-vindas, ' + primeiroNome(nomeDoEntregador);
}

function atualizarTela() {
  const resumo = resumoDeHoje();
  document.getElementById('horas').textContent = formatarDuracao(resumo.trabalhado);
  document.getElementById('sessoes').textContent = resumo.sessoes;
  document.getElementById('pausas').textContent = resumo.pausas;

  const jornada = jornadaAtiva();
  const textoPronto = document.getElementById('pronto');
  const botao = document.getElementById('acao');

  if (jornada === null) {
    textoPronto.textContent = 'Pronto para começar?';
    botao.innerHTML = icone('play', 22) + '<span>Iniciar jornada</span>';
  } else if (jornada.estaEmPausa()) {
    textoPronto.textContent = 'Você está em pausa.';
    botao.innerHTML = icone('pause', 22) + '<span>Ver pausa</span>';
  } else {
    textoPronto.textContent = 'Jornada em andamento.';
    botao.innerHTML = icone('map', 22) + '<span>Ver jornada em andamento</span>';
  }
}

document.getElementById('acao').addEventListener('click', function () {
  const jornada = jornadaAtiva();
  if (jornada === null) {
    iniciarJornada();
    location.href = 'jornada.html';
  } else if (jornada.estaEmPausa()) {
    location.href = 'pausa.html';
  } else {
    location.href = 'jornada.html';
  }
});

atualizarTela();
setInterval(atualizarTela, 30000);
