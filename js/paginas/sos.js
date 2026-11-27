verificarLogin();

const alerta = ultimoSOS();

function montarTela() {
  document.getElementById('local').innerHTML =
    escaparHTML(alerta.local.endereco) + ' · ' + formatarHora(alerta.dataHora) +
    ` · <a class="red" style="font-weight:600" target="_blank" href="${linkDoMapa(alerta.local)}">ver no mapa</a>`;

  if (alerta.contatos.length > 0) {
    document.getElementById('contatos').textContent = 'Alerta enviado para ' + alerta.contatos.join(', ') + '.';
  } else {
    document.getElementById('contatos').textContent = 'Nenhum contato foi avisado (desativado nas configurações).';
  }

  document.getElementById('ligar').innerHTML = `
    <a class="btn btn-sm btn-red" href="tel:190">${icone('phone', 16)} Polícia 190</a>
    <a class="btn btn-sm btn-outline" style="color:var(--red-600)" href="tel:192">${icone('phone', 16)} SAMU 192</a>`;

  if (jornadaAtiva() === null) {
    const botaoVoltar = document.getElementById('voltar');
    botaoVoltar.textContent = 'Voltar ao início';
    botaoVoltar.href = 'index.html';
  }

  const acabouDeEnviar = Date.now() - alerta.dataHora < 15000;
  if (acabouDeEnviar && configuracaoSOS().ligar190) {
    location.href = 'tel:190';
  } else if (acabouDeEnviar && configuracaoSOS().ligar192) {
    location.href = 'tel:192';
  }
}

if (alerta === null) {
  location.replace('index.html');
} else {
  montarTela();
}
