verificarLogin();

const listaDeContatos = document.getElementById('lista');
let menuAberto = null;

function fecharMenu() {
  if (menuAberto !== null) {
    menuAberto.remove();
    menuAberto = null;
  }
}
document.addEventListener('click', fecharMenu);

function mostrarListaVazia() {
  listaDeContatos.innerHTML = `
    <div class="empty-illu" aria-hidden="true">
      <div class="bgc"></div>
      <svg class="dash" viewBox="0 0 240 180">
        <path d="M40 70 C 60 20, 180 20, 200 70" fill="none" stroke="#2462eb" stroke-width="2.5" stroke-dasharray="5 6"/>
        <path d="M40 100 C 50 150, 80 160, 100 160 M140 160 C 160 160, 190 150, 200 100" fill="none" stroke="#2462eb" stroke-width="2.5" stroke-dasharray="5 6"/>
      </svg>
      <span class="p" style="left:6px;top:28px">${icone('user', 26)}</span>
      <span class="p" style="right:6px;top:28px">${icone('user', 26)}</span>
      <span class="s">${icone('shield-check', 30)}</span>
    </div>
    <h2 class="center" style="font-size:20px">Sua rede de apoio começa aqui</h2>
    <p class="center muted" style="font-size:14px;line-height:1.55;margin-top:10px">Adicione seu primeiro contato de confiança para ter alguém por perto, mesmo à distância.</p>`;
}

function cartaoDoContato(contato) {
  return `
    <article class="card contact-card" data-id="${contato.id}">
      <div class="contact-top">
        <span class="avatar">${contato.iniciais()}</span>
        <div class="grow">
          <div class="n">${escaparHTML(contato.nome)}</div>
          <div class="p">${contato.parentesco}</div>
          <div class="t">${escaparHTML(contato.telefone)}</div>
        </div>
        <button class="kebab" data-menu aria-label="Opções">${icone('more', 20)}</button>
      </div>
      <div class="row"><div class="grow row-title">Receber alerta de SOS</div>${interruptorHTML('recebeSOS', contato.recebeSOS, 'Receber alerta de SOS')}</div>
      <div class="row"><div class="grow row-title">Receber meu trajeto</div>${interruptorHTML('recebeTrajeto', contato.recebeTrajeto, 'Receber meu trajeto')}</div>
    </article>`;
}

function abrirMenuDoContato(cartao, id) {
  fecharMenu();
  menuAberto = document.createElement('div');
  menuAberto.className = 'menu';
  menuAberto.style.right = '20px';
  menuAberto.style.top = '72px';
  menuAberto.innerHTML = `
    <button data-a="editar">${icone('pencil', 20)}Editar</button>
    <button data-a="remover">${icone('trash', 20)}Remover</button>`;
  cartao.appendChild(menuAberto);

  menuAberto.querySelector('[data-a="editar"]').addEventListener('click', function () {
    abrirFormulario(buscarContato(id));
  });
  menuAberto.querySelector('[data-a="remover"]').addEventListener('click', function () {
    perguntarSeQuerRemover(buscarContato(id));
  });
}

function atualizarTela() {
  fecharMenu();
  const contatos = listarContatos();
  const total = contatos.length;

  document.getElementById('contagem').textContent = total + ' de ' + MAX_CONTATOS + ' contatos';
  document.getElementById('limite').textContent = 'Até ' + MAX_CONTATOS + ' pessoas';

  const botao = document.getElementById('adicionar');
  botao.disabled = total >= MAX_CONTATOS;
  if (total >= MAX_CONTATOS) {
    botao.innerHTML = 'Limite de ' + MAX_CONTATOS + ' contatos atingido';
  } else if (total === 0) {
    botao.innerHTML = icone('plus', 22) + 'Adicionar primeiro contato';
  } else {
    botao.innerHTML = icone('plus', 22) + 'Adicionar contato';
  }

  if (total === 0) {
    document.getElementById('nota').textContent = '';
    mostrarListaVazia();
    return;
  }

  document.getElementById('nota').textContent = 'Seus contatos recebem o alerta por mensagem. Mantenha os telefones atualizados.';

  let html = '';
  for (const contato of contatos) {
    html += cartaoDoContato(contato);
  }
  listaDeContatos.innerHTML = html;

  for (const cartao of listaDeContatos.querySelectorAll('.contact-card')) {
    const id = cartao.dataset.id;

    for (const interruptor of cartao.querySelectorAll('input[type=checkbox]')) {
      interruptor.addEventListener('change', function () {
        alterarOpcaoDoContato(id, interruptor.name, interruptor.checked);
        if (contatosQueRecebemSOS().length === 0) {
          mostrarAviso('Atenção: nenhum contato vai receber seu SOS.', true);
        }
      });
    }

    cartao.querySelector('[data-menu]').addEventListener('click', function (evento) {
      evento.stopPropagation();
      abrirMenuDoContato(cartao, id);
    });
  }
}

function perguntarSeQuerRemover(contato) {
  abrirModal({
    icone: 'user-minus',
    titulo: 'Remover contato?',
    texto: contato.nome + ' não receberá mais seu alerta SOS nem poderá acompanhar sua rota.',
    botoes: [
      { texto: 'Cancelar', classe: 'btn-outline' },
      {
        texto: 'Remover',
        classe: 'btn-primary',
        aoClicar: function () {
          removerContato(contato.id);
          atualizarTela();
          mostrarAviso('Contato removido');
        }
      }
    ]
  });
}

function abrirFormulario(contato) {
  const editando = contato !== null;
  const nome = editando ? contato.nome : '';
  const telefone = editando ? contato.telefone : '';

  let opcoes = editando ? '' : '<option value="" selected disabled>Selecione</option>';
  for (const parentesco of PARENTESCOS) {
    const marcado = editando && contato.parentesco === parentesco ? 'selected' : '';
    opcoes += `<option ${marcado}>${parentesco}</option>`;
  }

  const painel = abrirPainel(editando ? 'Editar contato' : 'Adicionar contato', `
    <p class="muted" style="font-size:16px;line-height:1.55;margin:18px 0 16px">Escolha alguém em quem você confia para fazer parte da sua rede de apoio.</p>
    <form class="form-stack" id="fc" novalidate>
      <div class="field"><label class="field-label" for="cn">Nome</label><input class="input" id="cn" name="nome" autocomplete="off" placeholder="Carla Exemplo" value="${escaparHTML(nome)}"></div>
      <div class="field"><label class="field-label" for="cp">Parentesco</label><select class="select" id="cp" name="parentesco">${opcoes}</select></div>
      <div class="field"><label class="field-label" for="ct">Telefone</label><input class="input" id="ct" name="telefone" inputmode="tel" placeholder="(71) 98765-4321" value="${escaparHTML(telefone)}"></div>
      <p class="muted small">Use um número com DDD ao cadastrar.</p>
      <button class="btn btn-primary" type="submit" style="margin-top:6px">${editando ? 'Salvar contato' : 'Adicionar contato'}</button>
      <button class="btn-link blue" type="button" data-close style="align-self:center;font-size:16px">Cancelar</button>
    </form>`);

  const formulario = painel.elemento.querySelector('#fc');
  formulario.telefone.addEventListener('input', function () {
    formulario.telefone.value = mascaraTelefone(formulario.telefone.value);
  });

  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();
    const id = editando ? contato.id : null;
    const erros = salvarContato(id, formulario.nome.value, formulario.parentesco.value, formulario.telefone.value);
    if (temErros(erros)) {
      mostrarErros(formulario, erros);
      return;
    }
    painel.fechar();
    atualizarTela();
    mostrarAviso(editando ? 'Contato atualizado' : 'Contato adicionado');
  });
}

document.getElementById('adicionar').addEventListener('click', function () {
  abrirFormulario(null);
});

atualizarTela();
