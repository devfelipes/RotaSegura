verificarLogin();
criarMenuInferior('perfil', null, true);

document.getElementById('sw-master').outerHTML = interruptorHTML('ativo', dadosDoCompartilhamento().ativo, 'Compartilhamento de trajeto');
const interruptorPrincipal = document.querySelector('input[name="ativo"]');

function atualizarTela() {
  const compartilhamento = dadosDoCompartilhamento();
  const ativo = compartilhamento.ativo;

  document.getElementById('estado').textContent = ativo ? 'Ativo' : 'Desativado';
  document.getElementById('estado').style.color = ativo ? '' : 'var(--gray-500)';
  document.getElementById('agora').style.opacity = ativo ? '1' : '0.5';

  let textoExpira = 'O link expira automaticamente ao encerrar a jornada.';
  if (jornadaAtiva() !== null && compartilhamento.codigo !== null) {
    textoExpira = 'Link ativo desde ' + formatarHora(compartilhamento.criadoEm) + '. Expira automaticamente ao encerrar a jornada.';
  }
  document.getElementById('expira').textContent = textoExpira;

  const contatos = listarContatos();
  const autorizados = contatos.filter(function (c) { return c.recebeTrajeto; }).length;
  document.getElementById('qtd').textContent = autorizados + (autorizados === 1 ? ' contato autorizado' : ' contatos autorizados') + ' durante as jornadas';

  if (contatos.length === 0) {
    document.getElementById('lista').innerHTML = '<p class="muted small" style="padding:10px 0">Nenhum contato cadastrado. <a class="blue" style="font-weight:600" href="contatos.html">Adicionar contato</a></p>';
    return;
  }

  let html = '';
  for (const c of contatos) {
    const situacao = c.recebeTrajeto ? 'Pode acompanhar a jornada' : 'Sem acesso à localização';
    html += `
      <div class="row" data-id="${c.id}">
        <div class="grow">
          <div class="row-title">${escaparHTML(c.nome)} - ${c.parentesco}</div>
          <div class="row-sub" style="${c.recebeTrajeto ? 'color:var(--blue)' : ''}">${situacao}</div>
        </div>
        ${interruptorHTML('trajeto', c.recebeTrajeto, 'Permitir que ' + c.nome + ' acompanhe')}
      </div>`;
  }
  document.getElementById('lista').innerHTML = html;

  for (const linha of document.querySelectorAll('#lista .row')) {
    linha.querySelector('input').addEventListener('change', function (evento) {
      alterarOpcaoDoContato(linha.dataset.id, 'recebeTrajeto', evento.target.checked);
      atualizarTela();
    });
  }
}

interruptorPrincipal.addEventListener('change', function () {
  ativarCompartilhamento(interruptorPrincipal.checked);
  if (interruptorPrincipal.checked) {
    mostrarAviso('Compartilhamento de trajeto ativado');
  } else {
    mostrarAviso('Compartilhamento desativado. Links anteriores deixaram de funcionar.');
  }
  atualizarTela();
});

function pegarLink() {
  const resultado = gerarLinkDaRota();
  if (resultado.erro) {
    let botoes = [{ texto: 'OK', classe: 'btn-primary' }];
    if (jornadaAtiva() === null) {
      botoes = [
        { texto: 'Agora não', classe: 'btn-soft' },
        { texto: 'Iniciar jornada', classe: 'btn-primary', aoClicar: function () { iniciarJornada(); atualizarTela(); mostrarAviso('Jornada iniciada'); } }
      ];
    }
    abrirModal({ icone: 'info', titulo: 'Link indisponível', texto: resultado.erro, botoes: botoes });
    return null;
  }
  atualizarTela();
  return resultado.url;
}

document.getElementById('enviar').addEventListener('click', function () {
  const link = pegarLink();
  if (link === null) {
    return;
  }
  const nome = primeiroNome(dadosDoEntregador().nome);
  const mensagem = 'Oi! Estou na rua fazendo entregas. Acompanhe meu trajeto em tempo real pelo RotaSegura: ' + link + ' (o link expira quando eu encerrar a jornada). — ' + nome;
  window.open('https://wa.me/?text=' + encodeURIComponent(mensagem), '_blank');
});

document.getElementById('copiar').addEventListener('click', function () {
  const link = pegarLink();
  if (link === null) {
    return;
  }
  navigator.clipboard.writeText(link)
    .then(function () { mostrarAviso('Link copiado'); })
    .catch(function () { mostrarAviso('Não foi possível copiar: ' + link, true); });
});

atualizarTela();
