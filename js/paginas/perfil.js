verificarLogin();
criarMenuInferior('perfil');
vigiarPausa();

function atualizarTela() {
  const entregador = dadosDoEntregador();
  document.getElementById('avatar').innerHTML = fotoDoEntregador(entregador, 'ring');
  document.getElementById('nome').textContent = entregador.nome;
  document.getElementById('email').textContent = entregador.email;
  document.getElementById('tipo').textContent = entregador.tipo;
  document.getElementById('tag-contatos').textContent = listarContatos().length + '/' + MAX_CONTATOS;
  document.getElementById('tag-2fa').textContent = entregador.doisFatores ? 'Ativada' : 'Desativada';

  let textoDoAlerta = entregador.tempoAlertaPausa + ' min';
  for (const opcao of OPCOES_ALERTA_PAUSA) {
    if (opcao.minutos === entregador.tempoAlertaPausa) {
      textoDoAlerta = opcao.texto;
    }
  }
  document.getElementById('tag-pausa').textContent = 'a cada ' + textoDoAlerta;
}

document.getElementById('sair').addEventListener('click', function () {
  abrirModal({
    icone: 'logout',
    cor: 'red',
    titulo: 'Deseja sair?',
    texto: 'Ao sair, você precisará entrar novamente com seu e-mail e senha para acessar o app.',
    botoes: [
      { texto: 'Cancelar', classe: 'btn-soft' },
      { texto: 'Sair agora', classe: 'btn-red', aoClicar: function () { sair(); location.replace('login.html'); } }
    ]
  });
});

function abrirAlertaDePausa(evento) {
  evento.preventDefault();
  let escolha = dadosDoEntregador().tempoAlertaPausa;

  let opcoes = '';
  for (const opcao of OPCOES_ALERTA_PAUSA) {
    opcoes += opcaoHTML(opcao.minutos, opcao.texto, opcao.minutos === escolha, 'square');
  }

  const painel = abrirPainel('Alertas de pausa e jornada', `
    <p class="muted" style="font-size:14px;line-height:1.5;margin-bottom:18px">Depois de quanto tempo de trabalho contínuo devemos sugerir uma pausa de ${MINUTOS_DE_PAUSA} minutos?</p>
    <div class="chips grid-2" id="ops">${opcoes}</div>
    <button class="btn btn-primary" id="ok" style="margin-top:22px">Salvar</button>`);

  ativarEscolhaUnica(painel.elemento.querySelector('#ops'), function (valor) {
    escolha = Number(valor);
  });
  painel.elemento.querySelector('#ok').addEventListener('click', function () {
    definirTempoAlertaPausa(escolha);
    painel.fechar();
    atualizarTela();
    mostrarAviso('Alerta de pausa atualizado');
  });
}

for (const link of document.querySelectorAll('[data-alerta-pausa]')) {
  link.addEventListener('click', abrirAlertaDePausa);
}

document.getElementById('alterar-senha').addEventListener('click', function (evento) {
  evento.preventDefault();
  const painel = abrirPainel('Alterar senha', `
    <form class="form-stack" id="fs" novalidate>
      <div class="field"><label class="field-label" for="a">Senha atual</label><input class="input" type="password" id="a" name="atual"></div>
      <div class="field"><label class="field-label" for="n">Nova senha</label><input class="input" type="password" id="n" name="nova"></div>
      <div class="field"><label class="field-label" for="c">Digite novamente</label><input class="input" type="password" id="c" name="conf"></div>
      <button class="btn btn-primary" type="submit">Salvar nova senha</button>
    </form>`);

  const formulario = painel.elemento.querySelector('#fs');
  formulario.addEventListener('submit', function (e) {
    e.preventDefault();
    const erros = alterarSenha(formulario.atual.value, formulario.nova.value, formulario.conf.value);
    if (temErros(erros)) {
      mostrarErros(formulario, erros);
      return;
    }
    painel.fechar();
    mostrarAviso('Senha alterada');
  });
});

document.getElementById('dois-fatores').addEventListener('click', function (evento) {
  evento.preventDefault();
  const entregador = dadosDoEntregador();
  const painel = abrirPainel('Verificação em duas etapas', `
    <div class="row" style="padding:0">
      <div class="grow">
        <div class="row-title">Pedir código ao entrar</div>
        <div class="row-sub">Enviaremos um código por SMS para ${entregador.telefone || 'seu telefone'}.</div>
      </div>
      ${interruptorHTML('f2', entregador.doisFatores, 'Verificação em duas etapas')}
    </div>`);

  painel.elemento.querySelector('input').addEventListener('change', function (e) {
    entregador.doisFatores = e.target.checked;
    salvarDados();
    atualizarTela();
    mostrarAviso(entregador.doisFatores ? 'Verificação em duas etapas ativada' : 'Verificação em duas etapas desativada');
  });
});

atualizarTela();
