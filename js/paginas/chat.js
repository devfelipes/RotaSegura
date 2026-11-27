verificarLogin();
criarMenuInferior('rota', 'Rota/Rede');
vigiarPausa();

const eu = dadosDoEntregador();
document.getElementById('avatar').outerHTML = fotoDoEntregador(eu);
document.getElementById('nome').textContent = eu.nome;
document.getElementById('email').textContent = eu.email;
document.getElementById('tipo').textContent = eu.tipo;

const AVISOS_RAPIDOS = {
  blitz: { rotulo: 'Blitz', icone: 'siren', classe: '', texto: 'Blitz na região. Documentos em dia e atenção.' },
  buraco: { rotulo: 'Buraco na via', icone: 'alert', classe: '', texto: 'Buraco na via. Reduza a velocidade.' },
  assalto: { rotulo: 'Risco de assalto', icone: 'shield-alert', classe: 'red', texto: 'Relato de risco de assalto por aqui. Evitem parar no local.' },
  apoio: { rotulo: 'Ponto de apoio', icone: 'coffee', classe: 'blue', texto: 'Ponto de apoio aberto aqui perto. Água e descanso.' }
};

const seletorDeRegiao = document.getElementById('regiao');
for (const regiao in REGIOES) {
  seletorDeRegiao.add(new Option(regiao, regiao));
}
seletorDeRegiao.value = regiaoDoChat();
seletorDeRegiao.addEventListener('change', function () {
  mudarRegiaoDoChat(seletorDeRegiao.value);
  atualizarTela();
});

function fotoDoAutor(mensagem) {
  if (mensagem.minha) {
    return fotoDoEntregador(eu);
  }
  if (mensagem.avatar) {
    return `<img class="avatar" src="${mensagem.avatar}" alt="">`;
  }
  return `<span class="avatar">${pegarIniciais(mensagem.autor)}</span>`;
}

function balaoDaMensagem(mensagem) {
  let etiqueta = '';
  const aviso = AVISOS_RAPIDOS[mensagem.tag];
  if (aviso) {
    etiqueta = `<div class="tag ${aviso.classe}">${icone(aviso.icone, 15)}${aviso.rotulo}</div>`;
  }

  let enviada = '';
  if (mensagem.minha) {
    enviada = `<div class="sent">Enviada ${icone('check-check', 13)}</div>`;
  }

  return `
    <div class="msg ${mensagem.minha ? 'mine' : ''}">
      ${fotoDoAutor(mensagem)}
      <div class="bubble">
        <div class="hd"><strong>${escaparHTML(mensagem.autor)}</strong><time>${formatarHora(mensagem.dataHora)}</time></div>
        ${etiqueta}
        <p>${escaparHTML(mensagem.texto)}</p>
        ${enviada}
      </div>
    </div>`;
}

function atualizarTela() {
  const chatLigado = dadosDePrivacidade().chatLocal;
  const regiao = regiaoDoChat();
  const caixa = document.getElementById('mensagens');

  document.getElementById('online').textContent = pessoasOnline(regiao) + ' online';
  document.getElementById('off').hidden = chatLigado;
  document.getElementById('envio').hidden = !chatLigado;

  if (!chatLigado) {
    caixa.innerHTML = '';
    return;
  }

  const mensagens = mensagensDaRegiao(regiao);
  if (mensagens.length === 0) {
    caixa.innerHTML = `<p class="empty">Nenhuma mensagem em ${regiao} ainda. Seja o primeiro a avisar a rede.</p>`;
    return;
  }

  let html = '';
  let ultimoDia = null;
  for (const mensagem of mensagens) {
    const dia = inicioDoDia(mensagem.dataHora);
    if (dia !== ultimoDia) {
      ultimoDia = dia;
      let prefixo = '';
      if (ehHoje(dia)) prefixo = 'HOJE, ';
      if (ehOntem(dia)) prefixo = 'ONTEM, ';
      html += `<div class="day-sep">${prefixo}${formatarData(dia)}</div>`;
    }
    html += balaoDaMensagem(mensagem);
  }
  caixa.innerHTML = html;
}

function simularResposta() {
  const respostas = ['Valeu pelo aviso! 🙏', 'Boa, vou desviar por lá.', 'Obrigado, galera. Bora com cuidado!', 'Anotado aqui. Boa rota!'];
  const autores = ['Rafael Costa', 'Juliana Lima', 'André Santos', 'Marcos Paulo'];
  const sorteio = Math.floor(Math.random() * respostas.length);
  receberMensagem(autores[sorteio], respostas[sorteio]);
  atualizarTela();
}

function mandarMensagem(texto, tag) {
  const erro = enviarMensagem(texto, tag);
  if (erro) {
    mostrarAviso(erro, true);
    return;
  }
  atualizarTela();
  document.getElementById('mensagens').lastElementChild.scrollIntoView({ behavior: 'smooth' });
  setTimeout(simularResposta, 3500);
}

document.getElementById('form').addEventListener('submit', function (evento) {
  evento.preventDefault();
  const campo = evento.target.texto;
  if (campo.value.trim() === '') {
    return;
  }
  mandarMensagem(campo.value);
  campo.value = '';
});

for (const botao of document.querySelectorAll('[data-tag]')) {
  botao.addEventListener('click', function () {
    const aviso = AVISOS_RAPIDOS[botao.dataset.tag];
    confirmar({
      icone: aviso.icone,
      cor: aviso.classe === 'red' ? 'red' : 'blue',
      titulo: 'Avisar a rede?',
      texto: '"' + aviso.texto + '" será enviado aos entregadores de ' + regiaoDoChat() + '.',
      textoConfirmar: 'Avisar'
    }, function () {
      mandarMensagem(aviso.texto, botao.dataset.tag);
    });
  });
}

atualizarTela();
