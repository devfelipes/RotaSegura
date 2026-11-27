verificarLogin();

const moto = dadosDoVeiculo();
const formularioMoto = document.getElementById('form');
let tipoDeBau = moto.bau;
let documentoCrlv = moto.crlv;

formularioMoto.modelo.value = moto.modelo;
formularioMoto.placa.value = moto.placa;
formularioMoto.ano.value = moto.ano;
formularioMoto.cor.value = moto.cor;
formularioMoto.cilindrada.value = moto.cilindrada;

formularioMoto.ano.addEventListener('input', function () {
  formularioMoto.ano.value = somenteNumeros(formularioMoto.ano.value);
});

const TIPOS_DE_BAU = [
  { valor: 'sem', texto: 'Sem baú' },
  { valor: 'bau', texto: 'Baú' },
  { valor: 'bag', texto: 'Bag' }
];
let opcoesDeBau = '';
for (const bau of TIPOS_DE_BAU) {
  opcoesDeBau += opcaoHTML(bau.valor, bau.texto, bau.valor === tipoDeBau);
}
document.getElementById('bau').innerHTML = opcoesDeBau;
ativarEscolhaUnica(document.getElementById('bau'), function (valor) {
  tipoDeBau = valor;
});

const EQUIPAMENTOS = [
  { id: 'capacete', nome: 'Capacete com viseira' },
  { id: 'jaqueta', nome: 'Jaqueta refletiva' },
  { id: 'luvas', nome: 'Luvas' },
  { id: 'colete', nome: 'Colete' }
];
let linhasDeEquipamento = '';
for (const item of EQUIPAMENTOS) {
  linhasDeEquipamento += `
    <div class="row">
      <div class="grow"><div class="row-title">${item.nome}</div></div>
      ${interruptorHTML(item.id, moto.equipamentos[item.id], item.nome)}
    </div>`;
}
document.getElementById('equip').innerHTML = linhasDeEquipamento;

function documentoDeExemplo() {
  return `
    <div class="crlv-doc">
      <div class="hd">
        <span class="blue">${icone('file-check', 24)}</span>
        <div><strong>CRLV • DOCUMENTO ILUSTRATIVO</strong><span>Certificado de registro e licenciamento de veículo</span></div>
      </div>
      <div class="bd">
        <div style="flex:1">
          <p>MARCA / MODELO: MOTO DE EXEMPLO<br><span class="muted">PLACA: XXX0X00 &nbsp;&nbsp; ANO: 2024</span></p>
          <div class="crlv-lines"><i style="width:80%"></i><i style="width:60%"></i></div>
        </div>
        <div class="qr"><i></i><i class="l"></i><i></i><i class="l"></i><i></i><i class="l"></i><i></i><i class="l"></i><i></i></div>
      </div>
      <div class="ft">EXEMPLO • SEM VALIDADE</div>
    </div>`;
}

function mostrarDocumento() {
  const caixa = document.getElementById('crlv');
  if (documentoCrlv === null) {
    caixa.innerHTML = '<div class="crlv-wrap empty" style="padding:18px">Nenhum documento enviado ainda.</div>';
    return;
  }

  let imagem = documentoDeExemplo();
  if (documentoCrlv.foto) {
    imagem = `<img class="crlv-img" src="${documentoCrlv.foto}" alt="Foto do CRLV">`;
  }

  caixa.innerHTML = `
    <div class="crlv-wrap">
      ${imagem}
      <div class="file-line">
        ${icone('paperclip', 18)}
        <span class="grow">${escaparHTML(documentoCrlv.nome)} • ${documentoCrlv.tamanho}</span>
        <label for="crlv-gal" style="color:var(--blue);font-weight:600;cursor:pointer">Substituir</label>
      </div>
    </div>`;
}

function receberFotoDoDocumento(evento) {
  const arquivo = evento.target.files[0];
  if (!arquivo) {
    return;
  }
  lerFoto(arquivo, 1100, function (foto) {
    documentoCrlv = { nome: arquivo.name, tamanho: tamanhoDoArquivo(arquivo.size), foto: foto };
    mostrarDocumento();
    mostrarAviso('Documento anexado. Toque em Salvar alterações.');
  });
}

document.getElementById('crlv-cam').addEventListener('change', receberFotoDoDocumento);
document.getElementById('crlv-gal').addEventListener('change', receberFotoDoDocumento);

formularioMoto.addEventListener('submit', function (evento) {
  evento.preventDefault();

  const equipamentos = {};
  for (const item of EQUIPAMENTOS) {
    equipamentos[item.id] = formularioMoto.querySelector(`input[name="${item.id}"]`).checked;
  }

  const erros = salvarVeiculo({
    modelo: formularioMoto.modelo.value,
    placa: formularioMoto.placa.value,
    ano: formularioMoto.ano.value,
    cor: formularioMoto.cor.value,
    cilindrada: formularioMoto.cilindrada.value,
    bau: tipoDeBau,
    equipamentos: equipamentos,
    crlv: documentoCrlv
  });

  if (temErros(erros)) {
    mostrarErros(formularioMoto, erros);
    return;
  }
  limparErros(formularioMoto);
  formularioMoto.placa.value = dadosDoVeiculo().placa;
  mostrarAviso('Informações da moto atualizadas');
});

mostrarDocumento();
