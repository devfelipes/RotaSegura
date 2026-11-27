verificarLogin();
criarMenuInferior('historico');
vigiarPausa();

const ICONE_DO_EVENTO = { inicio: 'play', pausa: 'pause', sos: 'siren', ocorrencia: 'alert', fim: 'square' };
const eventosVisiveis = { inicio: true, pausa: true, sos: true, ocorrencia: true, fim: true };
const diasAbertos = {};

let visao = 'semana';
let abrirPrimeiroDia = true;

const seletorDePeriodo = document.getElementById('periodo');

function montarOpcoesDePeriodo() {
  seletorDePeriodo.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    if (visao === 'semana') {
      const semana = periodoDaSemana(somarDias(Date.now(), -7 * i));
      seletorDePeriodo.add(new Option(formatarIntervaloCurto(semana.inicio, semana.fim), semana.inicio));
    } else {
      const data = new Date();
      data.setDate(1);
      data.setMonth(data.getMonth() - i);
      seletorDePeriodo.add(new Option(formatarMesEAno(data), data.getTime()));
    }
  }
}

function periodoEscolhido() {
  const momento = Number(seletorDePeriodo.value);
  if (visao === 'semana') {
    return periodoDaSemana(momento);
  }
  return periodoDoMes(momento);
}

function passaNosFiltros(dia) {
  const tipo = document.getElementById('tipo').value;
  const busca = document.getElementById('busca').value.trim().toLowerCase();

  if (tipo === 'incidentes' && dia.incidentes === 0) return false;
  if (tipo === 'sem' && dia.incidentes > 0) return false;
  if (busca === '') return true;

  let textoDoDia = formatarDiaEMes(dia.dia) + ' ' + nomeDoDia(dia.dia) + ' ' + formatarData(dia.dia);
  for (const evento of dia.eventos) {
    textoDoDia = textoDoDia + ' ' + evento.texto;
  }
  return textoDoDia.toLowerCase().includes(busca);
}

function cartaoDoDia(dia) {
  const aberto = diasAbertos[dia.dia] === true;

  let subtitulo = nomeDoDia(dia.dia);
  if (!aberto) {
    if (dia.incidentes === 0) subtitulo += ' · Sem incidentes';
    else if (dia.incidentes === 1) subtitulo += ' · 1 incidente';
    else subtitulo += ' · ' + dia.incidentes + ' incidentes';
  }

  let linhaDoTempo = '';
  for (const evento of dia.eventos) {
    if (!eventosVisiveis[evento.tipo]) continue;
    linhaDoTempo += `
      <div class="tl-item tl-${evento.tipo}">
        <span class="dot">${icone(ICONE_DO_EVENTO[evento.tipo], 14)}</span>
        <div class="box ${evento.andamento ? 'ongoing' : ''}">${escaparHTML(evento.texto)}</div>
      </div>`;
  }
  if (linhaDoTempo === '') {
    linhaDoTempo = '<p class="muted small">Nenhum evento com os filtros selecionados.</p>';
  }

  return `
    <article class="card day-card ${aberto ? 'open' : ''}">
      <button class="day-head" data-dia="${dia.dia}">
        <div class="grow"><div class="d">${formatarDiaEMes(dia.dia)}</div><div class="s">${subtitulo}</div></div>
        <div class="dur">${formatarDuracao(dia.duracao)}<small>Duração total</small></div>
        <span class="chev">${icone('chevron-down', 22)}</span>
      </button>
      <div class="timeline">${linhaDoTempo}</div>
    </article>`;
}

function atualizarTela() {
  const periodo = periodoEscolhido();
  const ehPeriodoAtual = periodo.inicio <= Date.now() && Date.now() <= periodo.fim;

  let titulo = visao === 'semana' ? 'Semana' : formatarMesEAno(periodo.inicio);
  if (ehPeriodoAtual) {
    titulo = visao === 'semana' ? 'Esta Semana' : 'Este Mês';
  }
  document.getElementById('titulo-periodo').textContent = titulo;
  document.getElementById('intervalo').textContent = formatarIntervalo(periodo.inicio, periodo.fim);

  const todosOsDias = diasDoHistorico(periodo.inicio, periodo.fim);
  const totais = totaisDoHistorico(todosOsDias);
  document.getElementById('k-horas').textContent = formatarDuracao(totais.duracao);
  document.getElementById('k-sessoes').textContent = totais.sessoes;
  document.getElementById('k-inc').textContent = totais.incidentes;
  document.getElementById('dias-trab').textContent = totais.diasTrabalhados + (totais.diasTrabalhados === 1 ? ' dia trabalhado' : ' dias trabalhados');

  const dias = todosOsDias.filter(passaNosFiltros);
  const caixa = document.getElementById('dias');

  if (dias.length === 0) {
    if (todosOsDias.length === 0) {
      caixa.innerHTML = '<div class="card empty">Nenhuma jornada neste período. Inicie uma jornada na aba Rota para começar seu histórico.</div>';
    } else {
      caixa.innerHTML = '<div class="card empty">Nenhuma jornada encontrada com esses filtros.</div>';
    }
    return;
  }

  if (abrirPrimeiroDia) {
    abrirPrimeiroDia = false;
    const diaComIncidente = dias.find(function (d) { return d.incidentes > 0; });
    const diaParaAbrir = diaComIncidente || dias[0];
    diasAbertos[diaParaAbrir.dia] = true;
  }

  let html = '';
  for (const dia of dias) {
    html += cartaoDoDia(dia);
  }
  caixa.innerHTML = html;

  for (const botao of caixa.querySelectorAll('.day-head')) {
    botao.addEventListener('click', function () {
      const dia = botao.dataset.dia;
      diasAbertos[dia] = !diasAbertos[dia];
      atualizarTela();
    });
  }
}

const abas = document.querySelectorAll('#abas button');
for (const aba of abas) {
  aba.addEventListener('click', function () {
    visao = aba.dataset.p;
    for (const outra of abas) {
      outra.classList.remove('is-on');
    }
    aba.classList.add('is-on');
    montarOpcoesDePeriodo();
    abrirPrimeiroDia = true;
    atualizarTela();
  });
}

seletorDePeriodo.addEventListener('change', function () {
  abrirPrimeiroDia = true;
  atualizarTela();
});
document.getElementById('tipo').addEventListener('change', atualizarTela);
document.getElementById('busca').addEventListener('input', atualizarTela);

for (const botao of document.querySelectorAll('#eventos .ev')) {
  botao.addEventListener('click', function () {
    const tipo = botao.dataset.ev;
    eventosVisiveis[tipo] = !eventosVisiveis[tipo];
    botao.classList.toggle('off', !eventosVisiveis[tipo]);
    atualizarTela();
  });
}

document.getElementById('ajuda').addEventListener('click', function () {
  abrirModal({
    icone: 'help',
    titulo: 'Como ler o histórico',
    texto: 'Escolha a visão semanal ou mensal. Toque em um dia para ver a linha do tempo com início, pausas, SOS, ocorrências e fim. Use os botões de Eventos para mostrar ou esconder cada tipo.',
    botoes: [{ texto: 'Entendi', classe: 'btn-primary' }]
  });
});

montarOpcoesDePeriodo();
atualizarTela();
