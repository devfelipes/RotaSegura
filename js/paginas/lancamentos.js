verificarLogin();
criarMenuInferior('perfil');

const perfil = dadosDoEntregador();
document.getElementById('avatar').innerHTML = fotoDoEntregador(perfil, 'ring');
document.getElementById('email').textContent = perfil.email;
document.getElementById('tipo').textContent = perfil.tipo;

const ICONE_DO_GASTO = { 'Combustível': 'fuel', 'Manutenção': 'wrench', 'Alimentação': 'utensils', 'Taxa': 'receipt', 'Outros': 'receipt' };
let plataformaEscolhida = 'Todas';

const caixaDePlataformas = document.getElementById('plats');
const plataformasDoFiltro = ['Todas', 'iFood', 'Rappi', 'Uber Eats', '99Food'];
let botoesDePlataforma = '';
for (const p of plataformasDoFiltro) {
  botoesDePlataforma += opcaoHTML(p, p, p === plataformaEscolhida, 'chip-sm solid');
}
caixaDePlataformas.innerHTML = botoesDePlataforma;
ativarEscolhaUnica(caixaDePlataformas, function (valor) {
  plataformaEscolhida = valor;
  atualizarTela();
});

function periodoDoFiltro() {
  const escolha = document.getElementById('periodo').value;
  const agora = Date.now();
  if (escolha === 'hoje') return periodoDoDia(agora);
  if (escolha === '7') return { inicio: inicioDoDia(somarDias(agora, -6)), fim: fimDoDia(agora) };
  if (escolha === 'semana') return periodoDaSemana(agora);
  if (escolha === 'mes') return periodoDoMes(agora);
  return { inicio: 0, fim: fimDoDia(agora) };
}

function tituloDoDia(dia) {
  if (ehHoje(dia)) return 'Hoje, ' + formatarDiaDeMes(dia);
  if (ehOntem(dia)) return 'Ontem, ' + formatarDiaDeMes(dia);
  return formatarDiaDeMes(dia);
}

function linhaDoLancamento(l) {
  const ganho = l.ehGanho();
  const nomeDoIcone = ganho ? 'package' : (ICONE_DO_GASTO[l.categoria] || 'receipt');
  return `
    <button class="tx" data-id="${l.id}">
      <span class="sq ${ganho ? 'in' : 'out'}">${icone(nomeDoIcone, 22)}</span>
      <div class="grow"><div class="n">${escaparHTML(l.descricao)}</div><div class="c">${l.detalhe()}</div></div>
      <div class="amt">
        <strong class="${ganho ? 'in' : 'out'}">${ganho ? '+ ' : '− '}${formatarDinheiro(l.valor)}</strong>
        <span>${formatarData(l.dataHora)} · ${formatarHora(l.dataHora)}</span>
      </div>
    </button>`;
}

function perguntarSeQuerExcluir(l) {
  confirmar({
    icone: l.ehGanho() ? 'package' : 'receipt',
    titulo: l.descricao,
    texto: l.detalhe() + ' · ' + formatarDinheiro(l.valor) + ' · ' + formatarDataHora(l.dataHora) + '. Deseja excluir este lançamento?',
    textoCancelar: 'Manter',
    textoConfirmar: 'Excluir',
    classeConfirmar: 'btn-red'
  }, function () {
    removerLancamento(l.id);
    atualizarTela();
    mostrarAviso('Lançamento excluído');
  });
}

function atualizarTela() {
  const periodo = periodoDoFiltro();
  const lista = lancamentosDoPeriodo(periodo.inicio, periodo.fim, plataformaEscolhida);
  const totais = calcularTotais(lista);

  document.getElementById('qtd').textContent = lista.length + (lista.length === 1 ? ' lançamento' : ' lançamentos');
  document.getElementById('saldo').textContent = (totais.saldo < 0 ? '− ' : '') + formatarDinheiro(Math.abs(totais.saldo));
  document.getElementById('g').textContent = 'Ganhos ' + formatarDinheiro(totais.ganhos);
  document.getElementById('c').textContent = 'Gastos ' + formatarDinheiro(totais.gastos);
  document.getElementById('entregas').textContent = totais.entregas + ' entregas registradas neste período';

  const caixa = document.getElementById('grupos');
  if (lista.length === 0) {
    caixa.innerHTML = '<div class="card empty">Nenhum lançamento neste período.</div>';
    return;
  }

  const porDia = {};
  for (const l of lista) {
    const dia = inicioDoDia(l.dataHora);
    if (!porDia[dia]) {
      porDia[dia] = [];
    }
    porDia[dia].push(l);
  }

  let html = '';
  let primeiro = true;
  for (const dia in porDia) {
    html += `<div class="section-hd"><h2 style="font-size:20px">${tituloDoDia(Number(dia))}</h2>${primeiro ? '<span>Mais recentes</span>' : ''}</div>`;
    html += '<section class="card" style="padding:4px 20px">';
    for (const l of porDia[dia]) {
      html += linhaDoLancamento(l);
    }
    html += '</section>';
    primeiro = false;
  }
  caixa.innerHTML = html;

  for (const botao of caixa.querySelectorAll('.tx')) {
    botao.addEventListener('click', function () {
      const lancamento = lista.find(function (l) { return l.id === botao.dataset.id; });
      perguntarSeQuerExcluir(lancamento);
    });
  }
}

document.getElementById('periodo').addEventListener('change', atualizarTela);
document.getElementById('add').addEventListener('click', function () {
  abrirModal({
    icone: 'plus',
    titulo: 'Novo lançamento',
    texto: 'O que você quer registrar?',
    botoes: [
      { texto: 'Gasto', classe: 'btn-outline', aoClicar: function () { abrirFormularioDeLancamento('gasto', atualizarTela); } },
      { texto: 'Ganho', classe: 'btn-primary', aoClicar: function () { abrirFormularioDeLancamento('ganho', atualizarTela); } }
    ]
  });
});

atualizarTela();
