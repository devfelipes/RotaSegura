verificarLogin();
criarMenuInferior('rota', null, true);

const formularioOcorrencia = document.getElementById('form');
const campoLocal = document.getElementById('local');
const campoFoto = document.getElementById('foto');
const momentoDaOcorrencia = Date.now();

let tipoEscolhido = 'Acidente';
let fotoDaOcorrencia = null;
let localizacaoAtual = LOCAL_PADRAO;

let opcoesDeTipo = '';
for (const tipo of TIPOS_OCORRENCIA) {
  opcoesDeTipo += opcaoHTML(tipo, tipo, tipo === tipoEscolhido, 'square');
}
const caixaDeTipos = document.getElementById('tipos');
caixaDeTipos.innerHTML = opcoesDeTipo;
ativarEscolhaUnica(caixaDeTipos, function (tipo) {
  tipoEscolhido = tipo;
});

document.getElementById('datahora').value = formatarDataHora(momentoDaOcorrencia);

obterLocalizacao(function (local) {
  localizacaoAtual = local;
  if (campoLocal.readOnly) {
    campoLocal.value = local.endereco;
  }
});

function liberarEdicaoDoLocal() {
  campoLocal.readOnly = false;
  campoLocal.focus();
  campoLocal.select();
}
document.getElementById('editar-local').addEventListener('click', liberarEdicaoDoLocal);
document.getElementById('lapis').addEventListener('click', liberarEdicaoDoLocal);

function mostrarFoto() {
  const area = document.getElementById('foto-area');
  if (fotoDaOcorrencia === null) {
    area.innerHTML = `<label class="upload-box" for="foto">${icone('camera', 24)}+ Adicionar foto do veículo ou do local</label>`;
    return;
  }
  area.innerHTML = `<div class="photo-prev"><img src="${fotoDaOcorrencia}" alt="Foto anexada"><button type="button" aria-label="Remover foto">${icone('x', 18)}</button></div>`;
  area.querySelector('button').addEventListener('click', function () {
    fotoDaOcorrencia = null;
    campoFoto.value = '';
    mostrarFoto();
  });
}

campoFoto.addEventListener('change', function () {
  lerFoto(campoFoto.files[0], 900, function (foto) {
    fotoDaOcorrencia = foto;
    mostrarFoto();
  });
});

function mostrarOcorrenciasRegistradas() {
  const ocorrencias = listarOcorrencias();
  document.getElementById('registradas-card').hidden = ocorrencias.length === 0;
  document.getElementById('qtd').textContent = ocorrencias.length + (ocorrencias.length === 1 ? ' registro' : ' registros');

  let html = '';
  for (const o of ocorrencias) {
    html += `
      <div class="occ-item">
        <span class="sq">${icone('alert', 18)}</span>
        <div style="flex:1;min-width:0">
          <strong>${o.tipo}</strong>
          <p>${formatarDataHora(o.dataHora)} · ${escaparHTML(o.local.endereco)}</p>
          ${o.descricao ? '<p>' + escaparHTML(o.descricao) + '</p>' : ''}
          ${o.foto ? '<img src="' + o.foto + '" alt="Foto da ocorrência" style="margin-top:8px;border-radius:8px;max-height:120px">' : ''}
        </div>
        <button class="kebab" data-excluir="${o.id}" aria-label="Excluir ocorrência">${icone('trash', 18)}</button>
      </div>`;
  }
  document.getElementById('registradas').innerHTML = html;

  for (const botao of document.querySelectorAll('[data-excluir]')) {
    botao.addEventListener('click', function () {
      confirmar({
        icone: 'trash',
        cor: 'red',
        titulo: 'Excluir ocorrência?',
        texto: 'O registro sairá da lista e do seu histórico.',
        textoConfirmar: 'Excluir',
        classeConfirmar: 'btn-red'
      }, function () {
        removerOcorrencia(botao.dataset.excluir);
        mostrarOcorrenciasRegistradas();
        mostrarAviso('Ocorrência excluída');
      });
    });
  }
}

formularioOcorrencia.addEventListener('submit', function (evento) {
  evento.preventDefault();

  let endereco = campoLocal.value;
  if (endereco === 'Obtendo localização…') {
    endereco = '';
  }

  const erros = registrarOcorrencia(tipoEscolhido, endereco, localizacaoAtual, formularioOcorrencia.descricao.value, fotoDaOcorrencia, momentoDaOcorrencia);
  if (temErros(erros)) {
    mostrarErros(formularioOcorrencia, erros);
    return;
  }

  limparErros(formularioOcorrencia);
  mostrarOcorrenciasRegistradas();
  abrirModal({
    icone: 'check-circle',
    cor: 'green',
    titulo: 'Ocorrência registrada',
    texto: tipoEscolhido + ' registrado em ' + formatarDataHora(momentoDaOcorrencia) + '. Ele também aparece no histórico do dia.',
    botoes: [
      { texto: 'Novo registro', classe: 'btn-soft', aoClicar: function () { location.reload(); } },
      { texto: 'Voltar', classe: 'btn-primary', aoClicar: function () { location.href = jornadaAtiva() ? 'jornada.html' : 'index.html'; } }
    ]
  });
});

mostrarOcorrenciasRegistradas();
