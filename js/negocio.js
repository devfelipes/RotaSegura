const MINUTO = 60 * 1000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

const MAX_CONTATOS = 3;
const MINUTOS_DE_PAUSA = 15;
const MINUTOS_PARA_LEMBRAR_DE_NOVO = 15;

const OPCOES_ALERTA_PAUSA = [
  { minutos: 1, texto: '1 minuto (teste)' },
  { minutos: 60, texto: '1 hora' },
  { minutos: 90, texto: '1h 30min' },
  { minutos: 120, texto: '2 horas' },
  { minutos: 180, texto: '3 horas' },
  { minutos: 240, texto: '4 horas' }
];

const PLATAFORMAS = ['iFood', 'Rappi', 'Uber Eats', '99Food', 'Loggi', 'Outras'];
const CATEGORIAS_GASTO = ['Combustível', 'Manutenção', 'Alimentação', 'Taxa', 'Outros'];
const TIPOS_OCORRENCIA = ['Acidente', 'Assalto/Roubo', 'Falha Mecânica', 'Outros'];
const PARENTESCOS = ['Mãe', 'Pai', 'Esposa', 'Marido', 'Companheira(o)', 'Irmã', 'Irmão', 'Filha', 'Filho', 'Amiga', 'Amigo', 'Outro'];

const DIAS_DA_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MESES_CURTOS = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];


class Pausa {
  constructor(inicio, fim) {
    this.inicio = inicio;
    this.fim = fim || null;
  }

  emAndamento() {
    return this.fim === null;
  }

  duracao() {
    const fim = this.fim || Date.now();
    return fim - this.inicio;
  }
}

class Jornada {
  constructor(dadosDaJornada) {
    this.id = dadosDaJornada.id;
    this.inicio = dadosDaJornada.inicio;
    this.fim = dadosDaJornada.fim || null;
    this.pausas = [];
    for (const p of dadosDaJornada.pausas) {
      this.pausas.push(new Pausa(p.inicio, p.fim));
    }
  }

  estaAtiva() {
    return this.fim === null;
  }

  pausaAtual() {
    for (const p of this.pausas) {
      if (p.emAndamento()) {
        return p;
      }
    }
    return null;
  }

  estaEmPausa() {
    return this.pausaAtual() !== null;
  }

  tempoTotal() {
    const fim = this.fim || Date.now();
    return fim - this.inicio;
  }

  tempoDePausa() {
    let soma = 0;
    for (const p of this.pausas) {
      soma = soma + p.duracao();
    }
    return soma;
  }

  tempoTrabalhado() {
    return this.tempoTotal() - this.tempoDePausa();
  }

  tempoSemPausa() {
    if (this.estaEmPausa()) {
      return 0;
    }
    let ultimoDescanso = this.inicio;
    for (const p of this.pausas) {
      if (p.fim > ultimoDescanso) {
        ultimoDescanso = p.fim;
      }
    }
    return Date.now() - ultimoDescanso;
  }
}

class ContatoConfianca {
  constructor(id, nome, parentesco, telefone) {
    this.id = id;
    this.nome = nome.trim();
    this.parentesco = parentesco;
    this.telefone = telefone.trim();
    this.recebeSOS = true;
    this.recebeTrajeto = false;
  }

  iniciais() {
    return pegarIniciais(this.nome);
  }

  validar() {
    const erros = {};
    if (this.nome.length < 2) {
      erros.nome = 'Informe o nome do contato.';
    }
    if (!this.parentesco) {
      erros.parentesco = 'Escolha o parentesco.';
    }
    if (!telefoneValido(this.telefone)) {
      erros.telefone = 'Informe um telefone com DDD, ex.: (71) 98765-4321.';
    }
    return erros;
  }
}

class LancamentoFinanceiro {
  constructor(dadosDoLancamento) {
    this.id = dadosDoLancamento.id;
    this.tipo = dadosDoLancamento.tipo;
    this.valor = dadosDoLancamento.valor;
    this.dataHora = dadosDoLancamento.dataHora;
    this.descricao = dadosDoLancamento.descricao;
    this.plataforma = dadosDoLancamento.plataforma || null;
  }

  ehGanho() {
    return this.tipo === 'ganho';
  }
}

class Ganho extends LancamentoFinanceiro {
  constructor(dadosDoLancamento) {
    super(dadosDoLancamento);
    this.entregas = dadosDoLancamento.entregas || 0;
  }

  detalhe() {
    const palavra = this.entregas === 1 ? ' entrega' : ' entregas';
    return 'Ganhos · ' + this.entregas + palavra + ' · ' + this.plataforma;
  }
}

class Gasto extends LancamentoFinanceiro {
  constructor(dadosDoLancamento) {
    super(dadosDoLancamento);
    this.categoria = dadosDoLancamento.categoria || 'Outros';
  }

  detalhe() {
    return this.categoria + ' · ' + (this.plataforma || 'Gasto geral');
  }
}


function doisDigitos(numero) {
  return String(numero).padStart(2, '0');
}

function formatarDinheiro(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarNumero(valor) {
  if (Number.isInteger(valor)) {
    return String(valor);
  }
  return valor.toFixed(2).replace('.', ',');
}

function formatarHora(momento) {
  const d = new Date(momento);
  return doisDigitos(d.getHours()) + ':' + doisDigitos(d.getMinutes());
}

function formatarData(momento) {
  const d = new Date(momento);
  return doisDigitos(d.getDate()) + '/' + doisDigitos(d.getMonth() + 1) + '/' + d.getFullYear();
}

function formatarDataHora(momento) {
  return formatarData(momento) + ' às ' + formatarHora(momento);
}

function formatarRelogio(ms) {
  const totalSegundos = Math.max(0, Math.floor(ms / 1000));
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  return doisDigitos(horas) + ':' + doisDigitos(minutos) + ':' + doisDigitos(segundos);
}

function formatarMinutosSegundos(ms) {
  const totalSegundos = Math.max(0, Math.ceil(ms / 1000));
  return doisDigitos(Math.floor(totalSegundos / 60)) + ':' + doisDigitos(totalSegundos % 60);
}

function formatarDuracao(ms) {
  const totalMinutos = Math.round(ms / MINUTO);
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  return horas + 'h ' + doisDigitos(minutos) + 'm';
}

function nomeDoDia(momento) {
  return DIAS_DA_SEMANA[new Date(momento).getDay()];
}

function nomeDoDiaCurto(momento) {
  return DIAS_CURTOS[new Date(momento).getDay()];
}

function formatarDiaEMes(momento) {
  const d = new Date(momento);
  return d.getDate() + ' ' + MESES[d.getMonth()];
}

function formatarDiaDeMes(momento) {
  const d = new Date(momento);
  return d.getDate() + ' de ' + MESES[d.getMonth()].toLowerCase();
}

function formatarMesEAno(momento) {
  const d = new Date(momento);
  return MESES[d.getMonth()] + ' ' + d.getFullYear();
}

function formatarIntervalo(inicio, fim) {
  const a = new Date(inicio);
  const b = new Date(fim);
  return a.getDate() + ' ' + MESES_CURTOS[a.getMonth()] + ' – ' + b.getDate() + ' ' + MESES_CURTOS[b.getMonth()] + ' ' + b.getFullYear();
}

function formatarIntervaloCurto(inicio, fim) {
  const a = new Date(inicio);
  const b = new Date(fim);
  return doisDigitos(a.getDate()) + '–' + doisDigitos(b.getDate()) + '/' + doisDigitos(b.getMonth() + 1);
}

function tempoAtras(momento) {
  const minutos = Math.floor((Date.now() - momento) / MINUTO);
  if (minutos < 1) {
    return 'Agora';
  }
  if (minutos < 60) {
    return 'Há ' + minutos + ' min';
  }
  if (mesmoDia(momento, Date.now())) {
    return 'Hoje, ' + formatarHora(momento);
  }
  return formatarData(momento) + ' · ' + formatarHora(momento);
}

function pegarIniciais(nome) {
  const partes = nome.trim().split(' ');
  let iniciais = partes[0].charAt(0);
  if (partes.length > 1) {
    iniciais = iniciais + partes[partes.length - 1].charAt(0);
  }
  return iniciais.toUpperCase();
}

function primeiroNome(nome) {
  return nome.split(' ')[0];
}


function inicioDoDia(momento) {
  const d = new Date(momento);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function fimDoDia(momento) {
  const d = new Date(momento);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function somarDias(momento, quantidade) {
  const d = new Date(momento);
  d.setDate(d.getDate() + quantidade);
  return d.getTime();
}

function mesmoDia(a, b) {
  return inicioDoDia(a) === inicioDoDia(b);
}

function ehHoje(momento) {
  return mesmoDia(momento, Date.now());
}

function ehOntem(momento) {
  return mesmoDia(momento, somarDias(Date.now(), -1));
}

function periodoDaSemana(momento) {
  const d = new Date(inicioDoDia(momento));
  let diasDesdeSegunda = d.getDay() - 1;
  if (diasDesdeSegunda < 0) {
    diasDesdeSegunda = 6;
  }
  const segunda = somarDias(d.getTime(), -diasDesdeSegunda);
  return { inicio: segunda, fim: fimDoDia(somarDias(segunda, 6)) };
}

function periodoDoMes(momento) {
  const d = new Date(momento);
  const primeiroDia = new Date(d.getFullYear(), d.getMonth(), 1);
  const ultimoDia = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { inicio: primeiroDia.getTime(), fim: fimDoDia(ultimoDia) };
}

function periodoDoDia(momento) {
  return { inicio: inicioDoDia(momento), fim: fimDoDia(momento) };
}


function temErros(erros) {
  return Object.keys(erros).length > 0;
}

function somenteNumeros(texto) {
  return String(texto).replace(/\D/g, '');
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function telefoneValido(telefone) {
  const numeros = somenteNumeros(telefone);
  return numeros.length === 10 || numeros.length === 11;
}

function cpfValido(cpf) {
  const numeros = somenteNumeros(cpf);
  if (numeros.length !== 11) {
    return false;
  }
  if (numeros === numeros[0].repeat(11)) {
    return false;
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma = soma + Number(numeros[i]) * (10 - i);
  }
  let digito1 = (soma * 10) % 11;
  if (digito1 === 10) {
    digito1 = 0;
  }

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma = soma + Number(numeros[i]) * (11 - i);
  }
  let digito2 = (soma * 10) % 11;
  if (digito2 === 10) {
    digito2 = 0;
  }

  return digito1 === Number(numeros[9]) && digito2 === Number(numeros[10]);
}

function mascaraCpf(texto) {
  const n = somenteNumeros(texto).slice(0, 11);
  let resultado = n.slice(0, 3);
  if (n.length > 3) resultado = resultado + '.' + n.slice(3, 6);
  if (n.length > 6) resultado = resultado + '.' + n.slice(6, 9);
  if (n.length > 9) resultado = resultado + '-' + n.slice(9, 11);
  return resultado;
}

function mascaraTelefone(texto) {
  const n = somenteNumeros(texto).slice(0, 11);
  if (n.length === 0) return '';
  if (n.length <= 2) return '(' + n;
  if (n.length <= 6) return '(' + n.slice(0, 2) + ') ' + n.slice(2);
  if (n.length <= 10) return '(' + n.slice(0, 2) + ') ' + n.slice(2, 6) + '-' + n.slice(6);
  return '(' + n.slice(0, 2) + ') ' + n.slice(2, 7) + '-' + n.slice(7);
}

function esconderCpf(cpf) {
  return '***.***.***-' + somenteNumeros(cpf).slice(-2);
}

function converterValor(texto) {
  const numero = Number(String(texto).replace(/\./g, '').replace(',', '.'));
  return Math.round(numero * 100) / 100;
}


function estaLogado() {
  return idUsuarioLogado() !== null;
}

function cadastrarUsuario(email, cpf, senha, confirmacao) {
  const erros = {};
  email = email.trim().toLowerCase();
  const usuarios = listarUsuarios();

  if (!emailValido(email)) {
    erros.email = 'Informe um e-mail válido.';
  } else if (usuarios.some(function (u) { return u.email === email; })) {
    erros.email = 'Já existe uma conta com este e-mail.';
  }

  if (!cpfValido(cpf)) {
    erros.cpf = 'CPF inválido. Confira os números.';
  } else if (usuarios.some(function (u) { return somenteNumeros(u.cpf) === somenteNumeros(cpf); })) {
    erros.cpf = 'Este CPF já está cadastrado.';
  }

  if (senha.length < 6) {
    erros.senha = 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (senha !== confirmacao) {
    erros.confirmacao = 'As senhas não conferem.';
  }

  if (temErros(erros)) {
    return erros;
  }

  const id = gerarId();
  usuarios.push({ id: id, email: email, cpf: mascaraCpf(cpf), senha: senha });
  salvarUsuarios(usuarios);

  const nome = email.split('@')[0];
  gravarNoNavegador(CHAVE_DADOS + id, criarDadosVazios(email, nome, mascaraCpf(cpf)));
  abrirSessao(id);
  return erros;
}

function entrar(email, senha) {
  email = email.trim().toLowerCase();
  for (const u of listarUsuarios()) {
    if (u.email === email && u.senha === senha) {
      abrirSessao(u.id);
      return true;
    }
  }
  return false;
}

function alterarSenha(senhaAtual, novaSenha, confirmacao) {
  const usuarios = listarUsuarios();
  const usuario = usuarios.find(function (u) { return u.id === idUsuarioLogado(); });

  if (usuario.senha !== senhaAtual) {
    return { atual: 'Senha atual incorreta.' };
  }
  if (novaSenha.length < 6) {
    return { nova: 'A nova senha deve ter pelo menos 6 caracteres.' };
  }
  if (novaSenha !== confirmacao) {
    return { conf: 'As senhas não conferem.' };
  }

  usuario.senha = novaSenha;
  salvarUsuarios(usuarios);
  return {};
}

function sair() {
  fecharSessao();
}

function excluirConta() {
  const id = idUsuarioLogado();
  if (id === 'demo') {
    gravarNoNavegador(CHAVE_DEMO_REMOVIDA, true);
  }
  apagarUsuario(id);
}


function listarJornadas() {
  const lista = [];
  for (const j of carregarDados().jornadas) {
    lista.push(new Jornada(j));
  }
  return lista;
}

function jornadaAtiva() {
  for (const j of listarJornadas()) {
    if (j.estaAtiva()) {
      return j;
    }
  }
  return null;
}

function guardarJornada(jornada) {
  const lista = carregarDados().jornadas;
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].id === jornada.id) {
      lista[i] = jornada;
      salvarDados();
      return;
    }
  }
  lista.push(jornada);
  salvarDados();
}

function iniciarJornada() {
  if (jornadaAtiva() !== null) {
    return;
  }
  const jornada = new Jornada({ id: gerarId(), inicio: Date.now(), fim: null, pausas: [] });
  carregarDados().lembrarPausaDepoisDe = null;
  guardarJornada(jornada);
}

function pausarJornada() {
  const jornada = jornadaAtiva();
  if (jornada === null || jornada.estaEmPausa()) {
    return;
  }
  jornada.pausas.push(new Pausa(Date.now(), null));
  carregarDados().lembrarPausaDepoisDe = null;
  guardarJornada(jornada);
}

function retomarJornada() {
  const jornada = jornadaAtiva();
  if (jornada === null || !jornada.estaEmPausa()) {
    return;
  }
  jornada.pausaAtual().fim = Date.now();
  guardarJornada(jornada);
}

function encerrarJornada() {
  const jornada = jornadaAtiva();
  if (jornada === null) {
    return null;
  }
  if (jornada.estaEmPausa()) {
    jornada.pausaAtual().fim = Date.now();
  }
  jornada.fim = Date.now();
  guardarJornada(jornada);
  expirarLinkDaRota();
  return jornada;
}

function tempoRestanteDaPausa() {
  const jornada = jornadaAtiva();
  if (jornada === null || !jornada.estaEmPausa()) {
    return 0;
  }
  return MINUTOS_DE_PAUSA * MINUTO - jornada.pausaAtual().duracao();
}

function precisaAlertarPausa() {
  const d = carregarDados();
  const jornada = jornadaAtiva();
  if (jornada === null || jornada.estaEmPausa()) {
    return false;
  }
  if (d.lembrarPausaDepoisDe !== null && Date.now() < d.lembrarPausaDepoisDe) {
    return false;
  }
  return jornada.tempoSemPausa() >= d.entregador.tempoAlertaPausa * MINUTO;
}

function lembrarPausaDepois() {
  carregarDados().lembrarPausaDepoisDe = Date.now() + MINUTOS_PARA_LEMBRAR_DE_NOVO * MINUTO;
  salvarDados();
}

function definirTempoAlertaPausa(minutos) {
  const d = carregarDados();
  d.entregador.tempoAlertaPausa = minutos;
  d.lembrarPausaDepoisDe = null;
  salvarDados();
}

function resumoDeHoje() {
  const resumo = { trabalhado: 0, sessoes: 0, pausas: 0 };
  for (const j of listarJornadas()) {
    if (ehHoje(j.inicio)) {
      resumo.trabalhado = resumo.trabalhado + j.tempoTrabalhado();
      resumo.sessoes = resumo.sessoes + 1;
      resumo.pausas = resumo.pausas + j.pausas.length;
    }
  }
  return resumo;
}


function listarContatos() {
  const lista = [];
  for (const c of carregarDados().contatos) {
    const contato = new ContatoConfianca(c.id, c.nome, c.parentesco, c.telefone);
    contato.recebeSOS = c.recebeSOS;
    contato.recebeTrajeto = c.recebeTrajeto;
    lista.push(contato);
  }
  return lista;
}

function buscarContato(id) {
  return carregarDados().contatos.find(function (c) { return c.id === id; });
}

function podeAdicionarContato() {
  return carregarDados().contatos.length < MAX_CONTATOS;
}

function salvarContato(id, nome, parentesco, telefone) {
  const novo = new ContatoConfianca(id, nome, parentesco, telefone);
  const erros = novo.validar();
  if (temErros(erros)) {
    return erros;
  }

  if (id) {
    const existente = buscarContato(id);
    existente.nome = novo.nome;
    existente.parentesco = novo.parentesco;
    existente.telefone = novo.telefone;
  } else {
    if (!podeAdicionarContato()) {
      return { geral: 'Você já tem ' + MAX_CONTATOS + ' contatos. Remova um para adicionar outro.' };
    }
    novo.id = gerarId();
    carregarDados().contatos.push(novo);
  }
  salvarDados();
  return {};
}

function alterarOpcaoDoContato(id, campo, valor) {
  buscarContato(id)[campo] = valor;
  salvarDados();
}

function removerContato(id) {
  const d = carregarDados();
  d.contatos = d.contatos.filter(function (c) { return c.id !== id; });
  salvarDados();
}


function configuracaoSOS() {
  return carregarDados().sos;
}

function mudarConfiguracaoSOS(campo, valor) {
  carregarDados().sos[campo] = valor;
  salvarDados();
}

function contatosQueRecebemSOS() {
  return listarContatos().filter(function (c) { return c.recebeSOS; });
}

function obterLocalizacao(aoObter) {
  let respondeu = false;

  function responder(local) {
    if (!respondeu) {
      respondeu = true;
      aoObter(local);
    }
  }

  setTimeout(function () { responder(LOCAL_PADRAO); }, 4000);

  if (!navigator.geolocation) {
    responder(LOCAL_PADRAO);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    function (posicao) {
      const lat = posicao.coords.latitude;
      const lng = posicao.coords.longitude;
      responder({ lat: lat, lng: lng, endereco: 'Lat ' + lat.toFixed(5) + ', Lng ' + lng.toFixed(5) });
    },
    function () {
      responder(LOCAL_PADRAO);
    }
  );
}

function linkDoMapa(local) {
  return 'https://www.google.com/maps?q=' + local.lat + ',' + local.lng;
}

function acionarSOS(aoTerminar) {
  obterLocalizacao(function (local) {
    const d = carregarDados();
    const jornada = jornadaAtiva();
    const nomes = [];
    if (d.sos.avisarContatos) {
      for (const c of contatosQueRecebemSOS()) {
        nomes.push(c.nome);
      }
    }
    d.alertasSOS.push({
      id: gerarId(),
      dataHora: Date.now(),
      jornadaId: jornada ? jornada.id : null,
      local: local,
      contatos: nomes
    });
    salvarDados();
    aoTerminar();
  });
}

function ultimoSOS() {
  const lista = carregarDados().alertasSOS;
  if (lista.length === 0) {
    return null;
  }
  return lista[lista.length - 1];
}


function dadosDoCompartilhamento() {
  return carregarDados().compartilhamento;
}

function ativarCompartilhamento(ativo) {
  dadosDoCompartilhamento().ativo = ativo;
  if (!ativo) {
    expirarLinkDaRota();
  }
  salvarDados();
}

function gerarLinkDaRota() {
  const c = dadosDoCompartilhamento();
  const jornada = jornadaAtiva();
  if (!c.ativo) {
    return { erro: 'Ative o compartilhamento de trajeto primeiro.' };
  }
  if (jornada === null) {
    return { erro: 'Inicie uma jornada para gerar o link. Ele expira ao encerrar a jornada.' };
  }
  if (c.codigo === null || c.jornadaId !== jornada.id) {
    c.codigo = Math.random().toString(36).slice(2, 10);
    c.jornadaId = jornada.id;
    c.criadoEm = Date.now();
    salvarDados();
  }
  return { url: 'https://rotasegura.app/acompanhar/' + c.codigo };
}

function expirarLinkDaRota() {
  const c = dadosDoCompartilhamento();
  c.codigo = null;
  c.jornadaId = null;
  c.criadoEm = null;
  salvarDados();
}


function listarOcorrencias() {
  const lista = carregarDados().ocorrencias.slice();
  lista.sort(function (a, b) { return b.dataHora - a.dataHora; });
  return lista;
}

function registrarOcorrencia(tipo, endereco, local, descricao, foto, dataHora) {
  const erros = {};
  if (!TIPOS_OCORRENCIA.includes(tipo)) {
    erros.tipo = 'Escolha o tipo de ocorrência.';
  }
  if (endereco.trim() === '') {
    erros.local = 'Informe o local.';
  }
  if (tipo === 'Outros' && descricao.trim().length < 5) {
    erros.descricao = 'Descreva o que aconteceu.';
  }
  if (temErros(erros)) {
    return erros;
  }

  const jornada = jornadaAtiva();
  carregarDados().ocorrencias.push({
    id: gerarId(),
    tipo: tipo,
    dataHora: dataHora,
    jornadaId: jornada ? jornada.id : null,
    local: { lat: local.lat, lng: local.lng, endereco: endereco.trim() },
    descricao: descricao.trim(),
    foto: foto
  });
  salvarDados();
  return {};
}

function removerOcorrencia(id) {
  const d = carregarDados();
  d.ocorrencias = d.ocorrencias.filter(function (o) { return o.id !== id; });
  salvarDados();
}


function listarLancamentos() {
  const lista = [];
  for (const l of carregarDados().lancamentos) {
    if (l.tipo === 'ganho') {
      lista.push(new Ganho(l));
    } else {
      lista.push(new Gasto(l));
    }
  }
  lista.sort(function (a, b) { return b.dataHora - a.dataHora; });
  return lista;
}

function lancamentosDoPeriodo(inicio, fim, plataforma) {
  return listarLancamentos().filter(function (l) {
    const dentroDoPeriodo = l.dataHora >= inicio && l.dataHora <= fim;
    const daPlataforma = !plataforma || plataforma === 'Todas' || l.plataforma === plataforma;
    return dentroDoPeriodo && daPlataforma;
  });
}

function calcularTotais(lista) {
  const totais = { ganhos: 0, gastos: 0, saldo: 0, entregas: 0 };
  for (const l of lista) {
    if (l.ehGanho()) {
      totais.ganhos = totais.ganhos + l.valor;
      totais.entregas = totais.entregas + l.entregas;
    } else {
      totais.gastos = totais.gastos + l.valor;
    }
  }
  totais.saldo = totais.ganhos - totais.gastos;
  return totais;
}

function adicionarLancamento(tipo, valorDigitado, opcao, plataforma, entregas, descricao, dataHora) {
  const erros = {};
  const valor = converterValor(valorDigitado);
  if (!(valor > 0)) {
    erros.valor = 'Informe um valor maior que zero.';
  }
  if (!opcao) {
    erros[tipo === 'ganho' ? 'plataforma' : 'categoria'] = 'Escolha uma opção.';
  }
  if (temErros(erros)) {
    return erros;
  }

  const lancamento = { id: gerarId(), tipo: tipo, valor: valor, dataHora: dataHora };
  if (tipo === 'ganho') {
    lancamento.plataforma = opcao;
    lancamento.entregas = Number(entregas) || 0;
    lancamento.descricao = descricao.trim() || 'Entregas ' + opcao;
  } else {
    lancamento.categoria = opcao;
    lancamento.plataforma = plataforma || null;
    lancamento.descricao = descricao.trim() || opcao;
  }
  carregarDados().lancamentos.push(lancamento);
  salvarDados();
  return {};
}

function removerLancamento(id) {
  const d = carregarDados();
  d.lancamentos = d.lancamentos.filter(function (l) { return l.id !== id; });
  salvarDados();
}

function metaDiaria() {
  return carregarDados().entregador.metaDiaria;
}

function definirMetaDiaria(valorDigitado) {
  const valor = converterValor(valorDigitado);
  if (!(valor > 0)) {
    return false;
  }
  carregarDados().entregador.metaDiaria = valor;
  salvarDados();
  return true;
}

function ganhosDosUltimos7Dias(ultimoDia) {
  const lista = [];
  for (let i = 6; i >= 0; i--) {
    const dia = somarDias(inicioDoDia(ultimoDia), -i);
    const totais = calcularTotais(lancamentosDoPeriodo(dia, fimDoDia(dia)));
    lista.push({ dia: dia, ganhos: totais.ganhos });
  }
  return lista;
}


function diasDoHistorico(inicio, fim) {
  const d = carregarDados();
  const diasEncontrados = {};

  function pegarDia(momento) {
    const chave = inicioDoDia(momento);
    if (!diasEncontrados[chave]) {
      diasEncontrados[chave] = { dia: chave, jornadas: 0, eventos: [], duracao: 0, incidentes: 0 };
    }
    return diasEncontrados[chave];
  }

  for (const j of listarJornadas()) {
    if (j.inicio < inicio || j.inicio > fim) continue;
    const dia = pegarDia(j.inicio);
    dia.jornadas = dia.jornadas + 1;
    dia.duracao = dia.duracao + j.tempoTotal();
    dia.eventos.push({ tipo: 'inicio', hora: j.inicio, texto: 'Início às ' + formatarHora(j.inicio) });
    for (const p of j.pausas) {
      const texto = p.emAndamento() ? 'Pausa em andamento' : 'Pausa realizada (' + Math.round(p.duracao() / MINUTO) + 'm)';
      dia.eventos.push({ tipo: 'pausa', hora: p.inicio, texto: texto });
    }
    if (j.fim) {
      dia.eventos.push({ tipo: 'fim', hora: j.fim, texto: 'Fim às ' + formatarHora(j.fim) });
    } else {
      dia.eventos.push({ tipo: 'fim', hora: Date.now(), texto: 'Jornada em andamento', andamento: true });
    }
  }

  for (const a of d.alertasSOS) {
    if (a.dataHora < inicio || a.dataHora > fim) continue;
    const dia = pegarDia(a.dataHora);
    dia.eventos.push({ tipo: 'sos', hora: a.dataHora, texto: 'SOS Acionado (' + formatarHora(a.dataHora) + ')' });
    dia.incidentes = dia.incidentes + 1;
  }

  for (const o of d.ocorrencias) {
    if (o.dataHora < inicio || o.dataHora > fim) continue;
    const dia = pegarDia(o.dataHora);
    dia.eventos.push({ tipo: 'ocorrencia', hora: o.dataHora, texto: 'Ocorrência: ' + o.tipo });
    dia.incidentes = dia.incidentes + 1;
  }

  const lista = Object.values(diasEncontrados);
  for (const dia of lista) {
    dia.eventos.sort(function (a, b) { return a.hora - b.hora; });
  }
  lista.sort(function (a, b) { return b.dia - a.dia; });
  return lista;
}

function totaisDoHistorico(dias) {
  const totais = { duracao: 0, sessoes: 0, incidentes: 0, diasTrabalhados: 0 };
  for (const dia of dias) {
    totais.duracao = totais.duracao + dia.duracao;
    totais.sessoes = totais.sessoes + dia.jornadas;
    totais.incidentes = totais.incidentes + dia.incidentes;
    if (dia.jornadas > 0) {
      totais.diasTrabalhados = totais.diasTrabalhados + 1;
    }
  }
  return totais;
}


function listarAlertas() {
  const agora = Date.now();
  const alertas = [
    { icone: 'storm', cor: '#f97316', titulo: 'Alerta de Chuva Forte', texto: 'Previsão de chuva forte na sua região (Salvador) nas próximas 2 horas. Reduza a velocidade e use capa.', hora: agora - 10 * MINUTO },
    { icone: 'cone', cor: '#f59e0b', titulo: 'Trânsito Intenso', texto: 'Acidente reportado na Av. Paralela sentido centro. Considere rotas alternativas.', hora: agora - 25 * MINUTO },
    { icone: 'leaf', cor: '#18754b', titulo: 'Dica de Postura', texto: 'Aproveite sua próxima pausa para alongar as costas e os ombros. A postura correta previne lesões a longo prazo.', hora: agora - 40 * MINUTO }
  ];

  const jornada = jornadaAtiva();
  if (jornada !== null && jornada.tempoSemPausa() > HORA) {
    alertas.unshift({ icone: 'coffee', cor: '#2462eb', titulo: 'Hora de uma pausa', texto: 'Você está rodando há ' + formatarDuracao(jornada.tempoSemPausa()) + ' sem parar. Uma pausa de 15 minutos ajuda a manter a atenção no trânsito.', hora: agora });
  }

  const sos = ultimoSOS();
  if (sos !== null && agora - sos.dataHora < DIA) {
    const para = sos.contatos.length > 0 ? sos.contatos.join(' e ') : 'nenhum contato';
    alertas.push({ icone: 'shield-alert', cor: '#dc2626', titulo: 'SOS enviado', texto: 'Seu alerta de emergência foi enviado para ' + para + '.', hora: sos.dataHora });
  }
  return alertas;
}


const REGIOES = { 'Bairro da Paz': 67, 'Paralela': 42, 'Pituaçu': 35, 'Imbuí': 51, 'Stiep': 28 };

const PONTOS_DO_MAPA = [
  { tipo: 'rider', x: 24, y: 27 },
  { tipo: 'rider', x: 50, y: 47 },
  { tipo: 'rider', x: 80, y: 63 },
  { tipo: 'rider', x: 17, y: 86 },
  { tipo: 'oficina', x: 75, y: 37, nome: 'Moto Peças Paralela', info: 'Oficina · 450 m · aberta até 20h' },
  { tipo: 'descanso', x: 38, y: 73, nome: 'Ponto de apoio Vila Mariana', info: 'Descanso · 600 m · água e tomada' },
  { tipo: 'banheiro', x: 17, y: 55, nome: 'Banheiro e bebedouro — Posto Paralela', info: 'Banheiro · 300 m · 24 horas' },
  { tipo: 'banheiro', x: 66, y: 83, nome: 'Bebedouro — Parque de Pituaçu', info: 'Bebedouro · 800 m · até 18h' }
];

function pessoasOnline(regiao) {
  return REGIOES[regiao] + (new Date().getMinutes() % 5);
}

function regiaoDoChat() {
  return carregarDados().chat.regiao;
}

function mudarRegiaoDoChat(regiao) {
  carregarDados().chat.regiao = regiao;
  salvarDados();
}

function mensagensDaRegiao(regiao) {
  const lista = carregarDados().chat.mensagens.filter(function (m) { return m.regiao === regiao; });
  lista.sort(function (a, b) { return a.dataHora - b.dataHora; });
  return lista;
}

function enviarMensagem(texto, tag) {
  const d = carregarDados();
  texto = texto.trim();
  if (!d.privacidade.chatLocal) {
    return 'O chat local está desativado nas suas configurações de privacidade.';
  }
  if (texto === '') {
    return 'Escreva uma mensagem.';
  }
  const temCpf = /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/.test(texto);
  const temTelefone = /\d{4,5}-?\d{4}/.test(texto);
  if (temCpf || temTelefone) {
    return 'Não compartilhe telefone ou CPF no chat. Proteja seus dados.';
  }
  d.chat.mensagens.push({ id: gerarId(), regiao: d.chat.regiao, autor: d.entregador.nome, texto: texto, dataHora: Date.now(), minha: true, tag: tag || null });
  salvarDados();
  return '';
}

function receberMensagem(autor, texto) {
  const d = carregarDados();
  d.chat.mensagens.push({ id: gerarId(), regiao: d.chat.regiao, autor: autor, texto: texto, dataHora: Date.now() });
  salvarDados();
}


function dadosDoEntregador() {
  return carregarDados().entregador;
}

function dadosDoVeiculo() {
  return carregarDados().veiculo;
}

function dadosDePrivacidade() {
  return carregarDados().privacidade;
}

function mudarPrivacidade(campo, valor) {
  carregarDados().privacidade[campo] = valor;
  salvarDados();
}

function calcularIdade(dataNascimento) {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario = hoje.getMonth() < nascimento.getMonth() || (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) {
    idade = idade - 1;
  }
  return idade;
}

function salvarDadosPessoais(novos) {
  const erros = {};
  const email = novos.email.trim().toLowerCase();
  const usuarios = listarUsuarios();
  const emailEmUso = usuarios.some(function (u) { return u.email === email && u.id !== idUsuarioLogado(); });

  if (novos.nome.trim().length < 3) {
    erros.nome = 'Informe seu nome completo.';
  }
  if (!emailValido(email)) {
    erros.email = 'E-mail inválido.';
  } else if (emailEmUso) {
    erros.email = 'Este e-mail já está em uso.';
  }
  if (novos.telefone && !telefoneValido(novos.telefone)) {
    erros.telefone = 'Telefone inválido.';
  }
  if (novos.cnh && somenteNumeros(novos.cnh).length !== 11) {
    erros.cnh = 'A CNH tem 11 números.';
  }
  if (novos.nascimento && calcularIdade(novos.nascimento) < 18) {
    erros.nascimento = 'Você precisa ter 18 anos ou mais.';
  }
  if (novos.plataformas.length === 0) {
    erros.plataformas = 'Selecione ao menos uma plataforma.';
  }
  if (temErros(erros)) {
    return erros;
  }

  const e = dadosDoEntregador();
  e.nome = novos.nome.trim();
  e.email = email;
  e.telefone = novos.telefone;
  e.nascimento = novos.nascimento;
  e.cidade = novos.cidade;
  e.cnh = somenteNumeros(novos.cnh);
  e.categoriaCnh = novos.categoriaCnh;
  e.plataformas = novos.plataformas;
  if (novos.foto) {
    e.foto = novos.foto;
  }
  salvarDados();

  const usuario = usuarios.find(function (u) { return u.id === idUsuarioLogado(); });
  usuario.email = email;
  salvarUsuarios(usuarios);
  return {};
}

function salvarVeiculo(novos) {
  const erros = {};
  const placa = novos.placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const ano = Number(novos.ano);

  if (novos.modelo.trim().length < 2) {
    erros.modelo = 'Informe a marca e o modelo.';
  }
  if (placa && placa !== 'XXX0X00' && !/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placa)) {
    erros.placa = 'Placa inválida (ex.: ABC1D23).';
  }
  if (novos.ano && (ano < 1980 || ano > new Date().getFullYear() + 1)) {
    erros.ano = 'Ano inválido.';
  }
  if (temErros(erros)) {
    return erros;
  }

  const v = dadosDoVeiculo();
  v.modelo = novos.modelo.trim();
  v.placa = placa;
  v.ano = novos.ano;
  v.cor = novos.cor;
  v.cilindrada = novos.cilindrada;
  v.bau = novos.bau;
  v.equipamentos = novos.equipamentos;
  v.crlv = novos.crlv;
  salvarDados();
  return {};
}

function exportarDados() {
  return { geradoEm: new Date().toISOString(), aplicativo: 'RotaSegura', dados: carregarDados() };
}
