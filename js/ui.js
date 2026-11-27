function escaparHTML(texto) {
  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function verificarLogin() {
  if (!estaLogado()) {
    location.replace('login.html');
    throw new Error('Usuário não está logado');
  }
}

function criarMenuInferior(paginaAtual, nomeDaRota) {
  const itens = [
    { id: 'inicio', link: 'index.html', icone: 'home', nome: 'Início' },
    { id: 'rota', link: 'jornada.html', icone: 'map', nome: nomeDaRota || 'Rota' },
    { id: 'historico', link: 'historico.html', icone: 'history', nome: 'Histórico' },
    { id: 'alertas', link: 'alertas.html', icone: 'bell', nome: 'Alertas' },
    { id: 'perfil', link: 'perfil.html', icone: 'user', nome: 'Perfil' }
  ];

  let html = '';
  for (const item of itens) {
    const classe = item.id === paginaAtual ? 'is-on' : '';
    html += `<a href="${item.link}" class="${classe}"><span class="nav-ic">${icone(item.icone, 24)}</span>${item.nome}</a>`;
  }

  const menu = document.createElement('nav');
  menu.className = 'bottom-nav';
  menu.innerHTML = html;

  const app = document.querySelector('.app');
  app.appendChild(menu);
  app.classList.add('has-nav');
}

function mostrarAviso(texto, ehErro) {
  const antigo = document.querySelector('.toast');
  if (antigo) {
    antigo.remove();
  }

  const aviso = document.createElement('div');
  aviso.className = ehErro ? 'toast error' : 'toast';
  aviso.innerHTML = `<span class="t-ic">${icone(ehErro ? 'x' : 'check', 16)}</span><span>${escaparHTML(texto)}</span>`;
  document.body.appendChild(aviso);

  setTimeout(function () {
    aviso.remove();
  }, 2800);
}

function abrirJanela(html, podeFechar, embaixo) {
  const fundo = document.createElement('div');
  fundo.className = embaixo ? 'overlay bottom' : 'overlay';
  fundo.innerHTML = html;
  document.body.appendChild(fundo);
  trocarIcones(fundo);

  function fechar() {
    fundo.remove();
  }

  if (podeFechar !== false) {
    fundo.addEventListener('click', function (evento) {
      if (evento.target === fundo) {
        fechar();
      }
    });
  }

  const botoesFechar = fundo.querySelectorAll('[data-close]');
  for (const botao of botoesFechar) {
    botao.addEventListener('click', fechar);
  }

  return { elemento: fundo, fechar: fechar };
}

function abrirModal(opcoes) {
  let html = '<div class="modal" role="dialog">';
  if (opcoes.icone) {
    html += `<div class="modal-ic ${opcoes.cor || 'blue'}">${icone(opcoes.icone, 28)}</div>`;
  }
  html += `<h3>${escaparHTML(opcoes.titulo)}</h3>`;
  if (opcoes.html) {
    html += opcoes.html;
  } else if (opcoes.texto) {
    html += `<p>${escaparHTML(opcoes.texto)}</p>`;
  }

  const botoes = opcoes.botoes || [];
  if (botoes.length > 0) {
    html += '<div class="btn-row">';
    for (let i = 0; i < botoes.length; i++) {
      html += `<button class="btn ${botoes[i].classe || 'btn-soft'}" data-botao="${i}">${escaparHTML(botoes[i].texto)}</button>`;
    }
    html += '</div>';
  }
  html += '</div>';

  const janela = abrirJanela(html, opcoes.podeFechar);

  for (let i = 0; i < botoes.length; i++) {
    const botao = janela.elemento.querySelector(`[data-botao="${i}"]`);
    botao.addEventListener('click', function () {
      janela.fechar();
      if (botoes[i].aoClicar) {
        botoes[i].aoClicar();
      }
    });
  }
  return janela;
}

function confirmar(opcoes, aoConfirmar) {
  abrirModal({
    icone: opcoes.icone,
    cor: opcoes.cor,
    titulo: opcoes.titulo,
    texto: opcoes.texto,
    botoes: [
      { texto: opcoes.textoCancelar || 'Cancelar', classe: 'btn-soft' },
      { texto: opcoes.textoConfirmar || 'Confirmar', classe: opcoes.classeConfirmar || 'btn-primary', aoClicar: aoConfirmar }
    ]
  });
}

function abrirPainel(titulo, conteudo, podeFechar) {
  let cabecalho = '<div class="handle"></div>';
  if (titulo) {
    cabecalho = `<div class="sheet-head"><h3>${escaparHTML(titulo)}</h3><button class="close-btn" data-close aria-label="Fechar">${icone('x', 20)}</button></div>`;
  }
  return abrirJanela(`<div class="sheet" role="dialog">${cabecalho}${conteudo}</div>`, podeFechar, true);
}

function limparErros(formulario) {
  const mensagens = formulario.querySelectorAll('.field-error');
  for (const m of mensagens) {
    m.remove();
  }
  const campos = formulario.querySelectorAll('.invalid');
  for (const c of campos) {
    c.classList.remove('invalid');
  }
}

function mostrarErros(formulario, erros) {
  limparErros(formulario);
  for (const nomeDoCampo in erros) {
    const mensagem = document.createElement('div');
    mensagem.className = 'field-error';
    mensagem.textContent = erros[nomeDoCampo];

    const campo = formulario.querySelector(`[name="${nomeDoCampo}"], [data-campo="${nomeDoCampo}"]`);
    if (campo) {
      campo.classList.add('invalid');
      const lugar = campo.closest('.field') || campo.parentElement;
      lugar.appendChild(mensagem);
    } else {
      formulario.prepend(mensagem);
    }
  }
}

function lerFoto(arquivo, tamanhoMaximo, aoTerminar) {
  if (!arquivo || !arquivo.type.startsWith('image/')) {
    mostrarAviso('Escolha um arquivo de imagem.', true);
    return;
  }

  const leitor = new FileReader();
  leitor.onload = function () {
    const imagem = new Image();
    imagem.onload = function () {
      let escala = tamanhoMaximo / Math.max(imagem.width, imagem.height);
      if (escala > 1) {
        escala = 1;
      }
      const tela = document.createElement('canvas');
      tela.width = imagem.width * escala;
      tela.height = imagem.height * escala;
      tela.getContext('2d').drawImage(imagem, 0, 0, tela.width, tela.height);
      aoTerminar(tela.toDataURL('image/jpeg', 0.8));
    };
    imagem.src = leitor.result;
  };
  leitor.readAsDataURL(arquivo);
}

function tamanhoDoArquivo(bytes) {
  if (bytes > 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1).replace('.', ',') + ' MB';
  }
  return Math.round(bytes / 1024) + ' KB';
}

function fotoDoEntregador(entregador, classe, tamanho) {
  classe = classe || '';
  const estilo = tamanho ? `style="width:${tamanho}px;height:${tamanho}px"` : '';
  if (entregador.foto) {
    return `<img class="avatar ${classe}" src="${entregador.foto}" alt="Foto de ${escaparHTML(entregador.nome)}" ${estilo}>`;
  }
  return `<span class="avatar ${classe}" ${estilo}>${pegarIniciais(entregador.nome)}</span>`;
}

function opcaoHTML(valor, texto, marcada, classeExtra) {
  const classe = 'chip ' + (classeExtra || '') + (marcada ? ' is-on' : '');
  return `<button type="button" class="${classe}" data-valor="${valor}">${icone('check', 16, 'ic-check')}${texto}</button>`;
}

function ativarEscolhaUnica(caixa, aoEscolher) {
  const opcoes = caixa.querySelectorAll('.chip');
  for (const opcao of opcoes) {
    opcao.addEventListener('click', function () {
      for (const outra of opcoes) {
        outra.classList.remove('is-on');
      }
      opcao.classList.add('is-on');
      if (aoEscolher) {
        aoEscolher(opcao.dataset.valor);
      }
    });
  }
}

function ativarEscolhaMultipla(caixa) {
  const opcoes = caixa.querySelectorAll('.chip');
  for (const opcao of opcoes) {
    opcao.addEventListener('click', function () {
      opcao.classList.toggle('is-on');
    });
  }
}

function valoresMarcados(caixa) {
  const valores = [];
  for (const opcao of caixa.querySelectorAll('.chip.is-on')) {
    valores.push(opcao.dataset.valor);
  }
  return valores;
}

function interruptorHTML(nome, ligado, rotulo) {
  return `<label class="switch"><input type="checkbox" name="${nome}" ${ligado ? 'checked' : ''} aria-label="${escaparHTML(rotulo)}"><span class="track"></span></label>`;
}

function baixarArquivo(nomeDoArquivo, conteudo) {
  const arquivo = new Blob([conteudo], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(arquivo);
  link.download = nomeDoArquivo;
  link.click();
}

function notificar(titulo, texto) {
  const querNotificacoes = dadosDePrivacidade().notificacoes;
  if (querNotificacoes && 'Notification' in window && Notification.permission === 'granted' && document.hidden) {
    new Notification(titulo, { body: texto, icon: 'assets/img/logo.png' });
  }
}

function criarBotaoSOS(lugar, classeExtra) {
  if (!configuracaoSOS().botaoTela) {
    return null;
  }
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'sos-fab ' + (classeExtra || '');
  botao.textContent = 'SOS';
  botao.setAttribute('aria-label', 'Acionar emergência SOS');
  botao.addEventListener('click', abrirSOS);
  (lugar || document.querySelector('.app')).appendChild(botao);
  return botao;
}

function avisarSemContatos() {
  abrirModal({
    icone: 'alert',
    cor: 'red',
    titulo: 'Nenhum contato para avisar',
    html: `<p>Cadastre um contato de confiança para receber seu SOS. Se houver risco imediato, ligue para um serviço de emergência.</p>
      <div class="btn-row" style="margin-top:20px">
        <a class="btn btn-red" href="tel:190">${icone('phone', 18)} 190</a>
        <a class="btn btn-red" href="tel:192">${icone('phone', 18)} SAMU 192</a>
      </div>`,
    botoes: [
      { texto: 'Agora não', classe: 'btn-soft' },
      { texto: 'Cadastrar contato', classe: 'btn-primary', aoClicar: function () { location.href = 'contatos.html'; } }
    ]
  });
}

function abrirSOS() {
  const config = configuracaoSOS();
  if (config.avisarContatos && contatosQueRecebemSOS().length === 0) {
    avisarSemContatos();
    return;
  }

  const segundos = config.contagem;
  const janela = abrirJanela(`
    <div class="modal sos-confirm" role="alertdialog">
      <div class="modal-ic">${icone('alert', 32)}</div>
      <h3>Emergência</h3>
      <p>Pressione e segure o botão por ${segundos} segundos para enviar sua localização aos contatos de confiança</p>
      <button class="hold-btn" type="button"><i class="fill"></i><span>Segure para acionar</span></button>
      <button class="btn-link" data-close style="margin-top:18px">Cancelar / Foi um engano</button>
    </div>`);

  const botao = janela.elemento.querySelector('.hold-btn');
  const barra = botao.querySelector('.fill');
  const texto = botao.querySelector('span');
  let tempoSegurando = 0;
  let cronometro = null;
  let enviado = false;

  function comecar(evento) {
    evento.preventDefault();
    if (enviado || cronometro !== null) {
      return;
    }
    tempoSegurando = 0;
    cronometro = setInterval(function () {
      tempoSegurando = tempoSegurando + 100;
      const progresso = tempoSegurando / (segundos * 1000);
      barra.style.width = (progresso * 100) + '%';
      const faltam = Math.max(1, Math.ceil(segundos - tempoSegurando / 1000));
      texto.textContent = 'Enviando em ' + faltam + 's… solte para cancelar';
      if (progresso >= 1) {
        enviar();
      }
    }, 100);
  }

  function soltar() {
    if (enviado) {
      return;
    }
    clearInterval(cronometro);
    cronometro = null;
    barra.style.width = '0';
    texto.textContent = 'Segure para acionar';
  }

  function enviar() {
    enviado = true;
    clearInterval(cronometro);
    texto.textContent = 'Obtendo sua localização…';
    acionarSOS(function () {
      location.href = 'sos.html';
    });
  }

  botao.addEventListener('pointerdown', comecar);
  botao.addEventListener('pointerup', soltar);
  botao.addEventListener('pointerleave', soltar);
  botao.addEventListener('keydown', function (evento) {
    if (evento.key === 'Enter' || evento.key === ' ') comecar(evento);
  });
  botao.addEventListener('keyup', soltar);
  botao.addEventListener('contextmenu', function (evento) {
    evento.preventDefault();
  });
}

let painelDePausaAberto = false;

function verificarPausa() {
  if (painelDePausaAberto || !estaLogado()) {
    return;
  }
  recarregarDados();
  if (!precisaAlertarPausa()) {
    return;
  }

  const tempo = formatarDuracao(jornadaAtiva().tempoSemPausa());
  notificar('Hora de recarregar as energias!', 'Sugerimos uma pausa de 15 minutos para o seu bem-estar e segurança.');

  painelDePausaAberto = true;
  const painel = abrirPainel(null, `
    <div class="energy">
      <div class="round-ic lg">${icone('coffee', 30)}</div>
      <h3>Hora de recarregar as energias!</h3>
      <p>Você já está rodando há ${tempo}. Sugerimos uma pausa de 15 minutos para o seu bem-estar e segurança.</p>
      <button class="btn btn-primary" data-pausar>Pausar agora (15 min)</button>
      <button class="btn-link" data-depois style="margin-top:14px;font-size:16px">Lembrar depois</button>
    </div>`, false);

  painel.elemento.querySelector('[data-pausar]').addEventListener('click', function () {
    pausarJornada();
    location.href = 'pausa.html';
  });
  painel.elemento.querySelector('[data-depois]').addEventListener('click', function () {
    lembrarPausaDepois();
    painel.fechar();
    painelDePausaAberto = false;
    mostrarAviso('Vamos lembrar você em 15 minutos.');
  });
}

function vigiarPausa() {
  verificarPausa();
  setInterval(verificarPausa, 5000);
}

trocarIcones();
