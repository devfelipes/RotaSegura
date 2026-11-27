verificarLogin();
criarMenuInferior('alertas');
vigiarPausa();

function atualizarTela() {
  let html = '';
  for (const alerta of listarAlertas()) {
    html += `
      <article class="alert-card" style="--bar:${alerta.cor}">
        <h2 class="t"><span class="ic">${icone(alerta.icone, 24)}</span>${alerta.titulo}</h2>
        <p>${alerta.texto}</p>
        <time>${tempoAtras(alerta.hora)}</time>
      </article>`;
  }
  document.getElementById('lista').innerHTML = html;
}

atualizarTela();
setInterval(atualizarTela, 60000);
