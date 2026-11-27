verificarLogin();
criarMenuInferior('perfil');
vigiarPausa();

let visaoFinanceira = 'dia';
let dataDeReferencia = Date.now();

const NOME_DA_VISAO = { dia: 'do dia', semana: 'da semana', mes: 'do mês' };
const TITULO_DA_META = { dia: 'Sua meta diária', semana: 'Sua meta da semana', mes: 'Sua meta do mês' };

function periodoAtual() {
  if (visaoFinanceira === 'dia') return periodoDoDia(dataDeReferencia);
  if (visaoFinanceira === 'semana') return periodoDaSemana(dataDeReferencia);
  return periodoDoMes(dataDeReferencia);
}

function andarNoTempo(passos) {
  if (visaoFinanceira === 'dia') {
    dataDeReferencia = somarDias(dataDeReferencia, passos);
  } else if (visaoFinanceira === 'semana') {
    dataDeReferencia = somarDias(dataDeReferencia, passos * 7);
  } else {
    const data = new Date(dataDeReferencia);
    data.setDate(1);
    data.setMonth(data.getMonth() + passos);
    dataDeReferencia = data.getTime();
  }
  atualizarTela();
}

function textoDaData(periodo, ehAtual) {
  if (visaoFinanceira === 'dia') {
    let prefixo = nomeDoDiaCurto(dataDeReferencia) + ', ';
    if (ehHoje(dataDeReferencia)) prefixo = 'Hoje, ';
    if (ehOntem(dataDeReferencia)) prefixo = 'Ontem, ';
    return prefixo + formatarData(dataDeReferencia);
  }
  if (visaoFinanceira === 'semana') {
    return (ehAtual ? 'Esta semana, ' : '') + formatarIntervaloCurto(periodo.inicio, periodo.fim);
  }
  return formatarMesEAno(periodo.inicio);
}

function mostrarMeta(ganhos, periodo) {
  const quantidadeDeDias = Math.round((periodo.fim - periodo.inicio) / DIA);
  const meta = metaDiaria() * quantidadeDeDias;
  let porcentagem = Math.round((ganhos / meta) * 100);
  if (porcentagem > 100) {
    porcentagem = 100;
  }

  document.getElementById('meta-tit').textContent = TITULO_DA_META[visaoFinanceira];
  document.getElementById('meta-pct').textContent = porcentagem + '% alcançada';
  document.getElementById('meta-val').textContent = formatarDinheiro(ganhos);
  document.getElementById('meta-de').textContent = 'de ' + formatarDinheiro(meta) + ' em ganhos';
  document.getElementById('meta-bar').style.width = porcentagem + '%';

  const falta = meta - ganhos;
  let mensagem = 'Meta batida! Parabéns pelo trabalho. 🎉';
  if (falta > 0) {
    mensagem = 'Faltam ' + formatarDinheiro(falta) + '.';
    if (porcentagem >= 75) mensagem += ' Tá quase lá!';
    else if (porcentagem >= 40) mensagem += ' Bora que dá!';
    mensagem += ' Toque para mudar a meta.';
  }
  document.getElementById('meta-msg').textContent = mensagem;
}

function mostrarGrafico(periodo) {
  let ultimoDia = Math.min(periodo.fim, Date.now());
  if (visaoFinanceira === 'dia') {
    ultimoDia = dataDeReferencia;
  }
  const dias = ganhosDosUltimos7Dias(ultimoDia);
  document.getElementById('ritmo-int').textContent = formatarIntervaloCurto(dias[0].dia, dias[6].dia);

  let maior = 1;
  for (const d of dias) {
    if (d.ganhos > maior) maior = d.ganhos;
  }

  let html = '';
  for (let i = 0; i < dias.length; i++) {
    const altura = Math.max(2, (dias[i].ganhos / maior) * 78);
    html += `
      <div class="bar ${i === 6 ? 'on' : ''}">
        <span class="v">${formatarNumero(dias[i].ganhos)}</span>
        <span class="b" style="height:${altura}%"></span>
        <span class="d">${nomeDoDiaCurto(dias[i].dia)}</span>
      </div>`;
  }
  document.getElementById('bars').innerHTML = html;
}

function atualizarTela() {
  const periodo = periodoAtual();
  const ehAtual = periodo.inicio <= Date.now() && Date.now() <= periodo.fim;
  document.getElementById('prox').disabled = ehAtual;
  document.getElementById('data').textContent = textoDaData(periodo, ehAtual);

  const totais = calcularTotais(lancamentosDoPeriodo(periodo.inicio, periodo.fim));
  const nome = NOME_DA_VISAO[visaoFinanceira];
  document.getElementById('saldo-lbl').textContent = 'Saldo líquido ' + nome;
  document.getElementById('saldo').textContent = (totais.saldo < 0 ? '− ' : '') + formatarDinheiro(Math.abs(totais.saldo));
  document.getElementById('ganhos').textContent = formatarDinheiro(totais.ganhos);
  document.getElementById('gastos').textContent = formatarDinheiro(totais.gastos);
  document.getElementById('rodape').textContent = 'Seu saldo considera todos os lançamentos ' + nome + '.';

  mostrarMeta(totais.ganhos, periodo);
  mostrarGrafico(periodo);
}

function editarMeta() {
  const painel = abrirPainel('Meta diária de ganhos', `
    <form class="form-stack" id="fm" novalidate>
      <div class="field">
        <label class="field-label" for="mv">Quanto você quer ganhar por dia? (R$)</label>
        <input class="input" id="mv" name="meta" inputmode="decimal" value="${formatarNumero(metaDiaria())}" style="font-size:22px;font-weight:700">
      </div>
      <button class="btn btn-primary" type="submit">Salvar meta</button>
    </form>`);

  const formulario = painel.elemento.querySelector('#fm');
  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();
    if (!definirMetaDiaria(formulario.meta.value)) {
      mostrarErros(formulario, { meta: 'Informe um valor maior que zero.' });
      return;
    }
    painel.fechar();
    atualizarTela();
    mostrarAviso('Meta atualizada');
  });
}

const abasFinanceiras = document.querySelectorAll('#abas button');
for (const aba of abasFinanceiras) {
  aba.addEventListener('click', function () {
    visaoFinanceira = aba.dataset.m;
    dataDeReferencia = Date.now();
    for (const outra of abasFinanceiras) {
      outra.classList.remove('is-on');
    }
    aba.classList.add('is-on');
    atualizarTela();
  });
}

document.getElementById('ant').addEventListener('click', function () { andarNoTempo(-1); });
document.getElementById('prox').addEventListener('click', function () { andarNoTempo(1); });
document.getElementById('add-ganho').addEventListener('click', function () { abrirFormularioDeLancamento('ganho', atualizarTela); });
document.getElementById('add-gasto').addEventListener('click', function () { abrirFormularioDeLancamento('gasto', atualizarTela); });
document.getElementById('meta').addEventListener('click', editarMeta);

atualizarTela();
