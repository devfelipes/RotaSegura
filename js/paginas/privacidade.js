verificarLogin();
criarMenuInferior('perfil');

const privacidade = dadosDePrivacidade();
const entregadorAtual = dadosDoEntregador();

document.getElementById('avatar').outerHTML = fotoDoEntregador(entregadorAtual);
document.getElementById('nome').textContent = entregadorAtual.nome;
document.getElementById('email').textContent = entregadorAtual.email;
document.getElementById('tipo').textContent = entregadorAtual.tipo;

const DESCRICAO_DA_VISIBILIDADE = {
  todos: 'Seu nome e sua foto ficam visíveis para todos os entregadores da rede.',
  contatos: 'Seu nome e sua foto ficam visíveis só para contatos.',
  anonimo: 'Você aparece como "Entregador anônimo" no mapa e no chat.'
};

const botoesDeVisibilidade = document.querySelectorAll('#visibilidade button');

function mostrarVisibilidade() {
  for (const botao of botoesDeVisibilidade) {
    botao.classList.toggle('is-on', botao.dataset.v === privacidade.visibilidade);
  }
  document.getElementById('vis-desc').textContent = DESCRICAO_DA_VISIBILIDADE[privacidade.visibilidade];
}

for (const botao of botoesDeVisibilidade) {
  botao.addEventListener('click', function () {
    mudarPrivacidade('visibilidade', botao.dataset.v);
    mostrarVisibilidade();
  });
}

function linhaHTML(nomeDoIcone, titulo, subtitulo, ladoDireito) {
  return `
    <div class="row">
      <span class="row-ic">${icone(nomeDoIcone, 22)}</span>
      <div class="grow"><div class="row-title">${titulo}</div><div class="row-sub">${subtitulo}</div></div>
      ${ladoDireito}
    </div>`;
}

document.getElementById('priv').innerHTML =
  linhaHTML('pin', 'Aparecer no mapa', 'Outros entregadores podem encontrar você.', interruptorHTML('aparecerNoMapa', privacidade.aparecerNoMapa, 'Aparecer no mapa')) +
  linhaHTML('messages', 'Permitir mensagens no chat local', 'Receba mensagens da sua região.', interruptorHTML('chatLocal', privacidade.chatLocal, 'Chat local')) +
  linhaHTML('navigation', 'Compartilhar localização na jornada', 'Apenas enquanto sua jornada estiver ativa.', interruptorHTML('compartilharLocalizacao', privacidade.compartilharLocalizacao, 'Compartilhar localização'));

for (const interruptor of document.querySelectorAll('#priv input')) {
  interruptor.addEventListener('change', function () {
    mudarPrivacidade(interruptor.name, interruptor.checked);
    mostrarAviso('Preferência salva');
  });
}

const PERMISSOES = [
  { id: 'localizacao', icone: 'locate', titulo: 'Localização', subtitulo: 'Para o mapa e os pontos de apoio.' },
  { id: 'microfone', icone: 'mic', titulo: 'Microfone', subtitulo: 'Para enviar mensagens de áudio.' },
  { id: 'camera', icone: 'camera', titulo: 'Câmera', subtitulo: 'Para fotos e documentos da moto.' }
];

function textoDaPermissao(situacao) {
  if (situacao === 'Permitido') {
    return '<span class="perm-state ok">Permitido</span>';
  }
  if (situacao === 'Negado') {
    return '<span class="perm-state no">Negado</span>';
  }
  return '<span class="perm-state" style="color:var(--gray-500)">Perguntar</span>';
}

function mostrarPermissoes() {
  let html = '';
  for (const permissao of PERMISSOES) {
    const situacao = privacidade.permissoes[permissao.id];
    html += `
      <button class="row" data-permissao="${permissao.id}" style="width:100%;text-align:left">
        <span class="row-ic">${icone(permissao.icone, 22)}</span>
        <div class="grow"><div class="row-title">${permissao.titulo}</div><div class="row-sub">${permissao.subtitulo}</div></div>
        ${textoDaPermissao(situacao)}
        <span class="muted">${icone('chevron-right', 20)}</span>
      </button>`;
  }
  document.getElementById('perms').innerHTML = html;

  for (const botao of document.querySelectorAll('[data-permissao]')) {
    botao.addEventListener('click', function () {
      pedirPermissao(botao.dataset.permissao);
    });
  }
}

function guardarPermissao(id, situacao) {
  privacidade.permissoes[id] = situacao;
  salvarDados();
  mostrarPermissoes();
}

function pedirPermissao(id) {
  if (id === 'localizacao') {
    navigator.geolocation.getCurrentPosition(
      function () { guardarPermissao(id, 'Permitido'); },
      function () { guardarPermissao(id, 'Negado'); }
    );
    return;
  }

  if (!navigator.mediaDevices) {
    mostrarAviso('Seu navegador não permite pedir esse acesso aqui.', true);
    return;
  }

  const pedido = id === 'camera' ? { video: true } : { audio: true };
  navigator.mediaDevices.getUserMedia(pedido)
    .then(function (transmissao) {
      for (const faixa of transmissao.getTracks()) {
        faixa.stop();
      }
      guardarPermissao(id, 'Permitido');
    })
    .catch(function () {
      guardarPermissao(id, 'Negado');
    });
}

document.getElementById('notif').innerHTML = linhaHTML('bell', 'Receber notificações', 'Avisos da rede, metas e lembretes.', interruptorHTML('notificacoes', privacidade.notificacoes, 'Receber notificações'));
document.querySelector('#notif input').addEventListener('change', function (evento) {
  const ligado = evento.target.checked;
  mudarPrivacidade('notificacoes', ligado);
  if (ligado && 'Notification' in window) {
    Notification.requestPermission();
  }
  mostrarAviso(ligado ? 'Notificações ativadas' : 'Notificações desativadas');
});

document.getElementById('baixar').addEventListener('click', function () {
  const nomeDoArquivo = 'rotasegura-meus-dados-' + formatarData(Date.now()).replaceAll('/', '-') + '.json';
  baixarArquivo(nomeDoArquivo, JSON.stringify(exportarDados(), null, 2));
  mostrarAviso('Arquivo com seus dados baixado');
});

document.getElementById('excluir').addEventListener('click', function () {
  abrirModal({
    icone: 'trash',
    cor: 'red',
    titulo: 'Excluir sua conta?',
    texto: 'Todos os seus dados (jornadas, contatos, finanças e ocorrências) serão apagados deste aparelho. Essa ação não pode ser desfeita.',
    botoes: [
      { texto: 'Cancelar', classe: 'btn-soft' },
      { texto: 'Excluir', classe: 'btn-red', aoClicar: function () { excluirConta(); location.replace('login.html'); } }
    ]
  });
});

mostrarVisibilidade();
mostrarPermissoes();
