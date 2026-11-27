verificarLogin();
criarMenuInferior('rota');

const jornadaDaPausa = jornadaAtiva();

const dicas = [
  'Beba água e aproveite para alongar o corpo com calma.',
  'Gire os ombros devagar e alongue o pescoço para os dois lados.',
  'Tire o capacete por alguns minutos e deixe a cabeça respirar.',
  'Coma algo leve. Seu corpo precisa de energia para a próxima rota.'
];
const numeroDaDica = new Date().getMinutes() % dicas.length;
document.getElementById('dica').textContent = dicas[numeroDaDica];

let pausaTerminou = false;

function voltarParaJornada() {
  retomarJornada();
  location.href = 'jornada.html';
}

function atualizarTela() {
  const restante = tempoRestanteDaPausa();
  document.getElementById('restante').textContent = formatarMinutosSegundos(restante);

  if (restante <= 0 && !pausaTerminou) {
    pausaTerminou = true;
    document.getElementById('sub').textContent = 'Pausa de 15 minutos concluída';
    document.getElementById('encerrar').textContent = 'Voltar à jornada';
    notificar('Pausa concluída', 'Seus 15 minutos de descanso terminaram. Boa rota!');
    abrirModal({
      icone: 'check-circle',
      cor: 'green',
      titulo: 'Pausa concluída!',
      texto: 'Seus 15 minutos de descanso terminaram. Volte com calma e boa rota.',
      botoes: [{ texto: 'Voltar à jornada', classe: 'btn-primary', aoClicar: voltarParaJornada }]
    });
  }
}

if (jornadaDaPausa === null || !jornadaDaPausa.estaEmPausa()) {
  location.replace('jornada.html');
} else {
  document.getElementById('encerrar').addEventListener('click', voltarParaJornada);
  atualizarTela();
  setInterval(atualizarTela, 1000);
}
