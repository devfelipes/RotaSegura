verificarLogin();

const configDoSOS = configuracaoSOS();

function linhasDeOpcoes(idDaCaixa, opcoes) {
  let html = '';
  for (const opcao of opcoes) {
    const subtitulo = opcao.subtitulo ? `<div class="row-sub">${opcao.subtitulo}</div>` : '';
    html += `
      <div class="row">
        <div class="grow"><div class="row-title">${opcao.titulo}</div>${subtitulo}</div>
        ${interruptorHTML(opcao.campo, configDoSOS[opcao.campo], opcao.titulo)}
      </div>`;
  }
  document.getElementById(idDaCaixa).innerHTML = html;
}

linhasDeOpcoes('ativacao', [
  { campo: 'botaoTela', titulo: 'Botão SOS na tela' },
  { campo: 'atalhoEnergia', titulo: 'Atalho: apertar o botão de energia 3 vezes', subtitulo: 'Disponível no app instalado no celular.' }
]);

linhasDeOpcoes('acoes', [
  { campo: 'localizacaoTempoReal', titulo: 'Enviar localização em tempo real' },
  { campo: 'avisarContatos', titulo: 'Avisar contatos de confiança' },
  { campo: 'gravarAudio', titulo: 'Gravar áudio ambiente' },
  { campo: 'ligar190', titulo: 'Ligar para o 190' },
  { campo: 'ligar192', titulo: 'Ligar para o SAMU 192' }
]);

function desligar(campo) {
  mudarConfiguracaoSOS(campo, false);
  document.querySelector(`input[name="${campo}"]`).checked = false;
}

for (const interruptor of document.querySelectorAll('.rows input')) {
  interruptor.addEventListener('change', function () {
    const campo = interruptor.name;
    const ligado = interruptor.checked;

    if (campo === 'ligar190' && ligado) {
      desligar('ligar192');
    }
    if (campo === 'ligar192' && ligado) {
      desligar('ligar190');
    }
    if (campo === 'botaoTela' && !ligado) {
      mostrarAviso('O botão SOS vai sumir das telas. Você pode reativar aqui.', true);
    }
    if (campo === 'gravarAudio' && ligado && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true }).catch(function () {
        mostrarAviso('Permita o microfone no navegador para gravar áudio.', true);
      });
    }
    mudarConfiguracaoSOS(campo, ligado);
  });
}

let opcoesDeContagem = '';
for (const segundos of [3, 5, 10]) {
  opcoesDeContagem += opcaoHTML(segundos, segundos + 's', configDoSOS.contagem === segundos);
}
document.getElementById('contagem').innerHTML = opcoesDeContagem;
ativarEscolhaUnica(document.getElementById('contagem'), function (valor) {
  mudarConfiguracaoSOS('contagem', Number(valor));
  mostrarAviso('Contagem de ' + valor + ' segundos');
});

document.getElementById('testar').addEventListener('click', function () {
  abrirModal({
    icone: 'info',
    titulo: 'Modo de teste',
    texto: 'Segure o botão vermelho para ver como funciona. Ao final, o alerta será registrado e seus contatos marcados para o SOS serão avisados.',
    botoes: [
      { texto: 'Cancelar', classe: 'btn-soft' },
      { texto: 'Continuar', classe: 'btn-red', aoClicar: abrirSOS }
    ]
  });
});
