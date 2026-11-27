const CHAVE_USUARIOS = 'rotasegura_usuarios';
const CHAVE_SESSAO = 'rotasegura_sessao';
const CHAVE_DADOS = 'rotasegura_dados_';
const CHAVE_DEMO_REMOVIDA = 'rotasegura_demo_removida';

const LOCAL_PADRAO = { lat: -12.9489, lng: -38.4133, endereco: 'Av. Paralela, Salvador - BA' };

let dados = null;

function lerDoNavegador(chave) {
  const texto = localStorage.getItem(chave);
  if (texto === null) {
    return null;
  }
  return JSON.parse(texto);
}

function gravarNoNavegador(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (erro) {
    alert('Não há espaço no navegador para salvar. Tente usar uma foto menor.');
    return false;
  }
}

function gerarId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000);
}

function listarUsuarios() {
  return lerDoNavegador(CHAVE_USUARIOS) || [];
}

function salvarUsuarios(usuarios) {
  gravarNoNavegador(CHAVE_USUARIOS, usuarios);
}

function idUsuarioLogado() {
  return lerDoNavegador(CHAVE_SESSAO);
}

function abrirSessao(idUsuario) {
  gravarNoNavegador(CHAVE_SESSAO, idUsuario);
  dados = null;
}

function fecharSessao() {
  localStorage.removeItem(CHAVE_SESSAO);
  dados = null;
}

function carregarDados() {
  const id = idUsuarioLogado();
  if (!id) {
    return null;
  }
  if (dados === null) {
    dados = lerDoNavegador(CHAVE_DADOS + id);
  }
  return dados;
}

function salvarDados() {
  return gravarNoNavegador(CHAVE_DADOS + idUsuarioLogado(), dados);
}

function recarregarDados() {
  dados = null;
  return carregarDados();
}

function criarDadosVazios(email, nome, cpf) {
  return {
    entregador: {
      nome: nome,
      email: email,
      cpf: cpf,
      nascimento: '',
      telefone: '',
      cidade: 'Salvador, BA',
      cnh: '',
      categoriaCnh: 'A',
      plataformas: [],
      foto: null,
      tipo: 'Entregador de moto',
      tempoAlertaPausa: 120,
      metaDiaria: 350,
      doisFatores: false
    },
    veiculo: {
      modelo: '',
      placa: '',
      ano: '',
      cor: '',
      cilindrada: '',
      bau: 'sem',
      crlv: null,
      equipamentos: { capacete: false, jaqueta: false, luvas: false, colete: false }
    },
    privacidade: {
      visibilidade: 'contatos',
      aparecerNoMapa: true,
      chatLocal: true,
      compartilharLocalizacao: false,
      notificacoes: true,
      permissoes: {}
    },
    sos: {
      botaoTela: true,
      atalhoEnergia: false,
      contagem: 3,
      localizacaoTempoReal: true,
      avisarContatos: true,
      gravarAudio: false,
      ligar190: false,
      ligar192: false
    },
    contatos: [],
    jornadas: [],
    alertasSOS: [],
    ocorrencias: [],
    lancamentos: [],
    compartilhamento: { ativo: true, codigo: null, jornadaId: null, criadoEm: null },
    chat: { regiao: 'Bairro da Paz', mensagens: [] },
    lembrarPausaDepoisDe: null
  };
}

function apagarUsuario(idUsuario) {
  localStorage.removeItem(CHAVE_DADOS + idUsuario);
  const usuarios = listarUsuarios().filter(function (u) {
    return u.id !== idUsuario;
  });
  salvarUsuarios(usuarios);
  fecharSessao();
}

function horarioDoDia(diasAtras, hora, minuto) {
  const data = new Date();
  data.setDate(data.getDate() - diasAtras);
  data.setHours(hora, minuto, 0, 0);
  return data.getTime();
}

function criarDadosDemo() {
  const d = criarDadosVazios('joao.silva@rotasegura.com', 'João Silva', '100.000.004-42');

  d.entregador.nascimento = '1992-08-15';
  d.entregador.telefone = '(71) 98765-4321';
  d.entregador.cnh = '01234567890';
  d.entregador.plataformas = ['iFood', 'Rappi'];
  d.entregador.foto = 'assets/img/avatar-joao.jpg';

  d.veiculo.modelo = 'Honda CG 150 Fan';
  d.veiculo.placa = 'XXX0X00';
  d.veiculo.ano = '2024';
  d.veiculo.cor = 'Preta';
  d.veiculo.cilindrada = '150cc';
  d.veiculo.bau = 'bau';
  d.veiculo.crlv = { exemplo: true, nome: 'crlv_exemplo.jpg', tamanho: '1,2 MB', foto: null };
  d.veiculo.equipamentos = { capacete: true, jaqueta: true, luvas: true, colete: false };

  d.contatos.push({ id: gerarId(), nome: 'Ana Exemplo', parentesco: 'Irmã', telefone: '(11) 99999-0001', recebeSOS: true, recebeTrajeto: true });
  d.contatos.push({ id: gerarId(), nome: 'Bruno Exemplo', parentesco: 'Amigo', telefone: '(11) 99999-0002', recebeSOS: true, recebeTrajeto: false });

  d.jornadas.push({ id: 'j1', inicio: horarioDoDia(3, 8, 0), fim: horarioDoDia(3, 14, 30), pausas: [{ inicio: horarioDoDia(3, 10, 30), fim: horarioDoDia(3, 10, 45) }] });
  d.jornadas.push({ id: 'j2', inicio: horarioDoDia(2, 7, 30), fim: horarioDoDia(2, 14, 30), pausas: [{ inicio: horarioDoDia(2, 11, 0), fim: horarioDoDia(2, 11, 15) }] });
  d.jornadas.push({ id: 'j3', inicio: horarioDoDia(1, 9, 0), fim: horarioDoDia(1, 14, 45), pausas: [{ inicio: horarioDoDia(1, 12, 0), fim: horarioDoDia(1, 12, 15) }] });

  d.alertasSOS.push({ id: gerarId(), dataHora: horarioDoDia(3, 12, 30), jornadaId: 'j1', local: LOCAL_PADRAO, contatos: ['Ana Exemplo', 'Bruno Exemplo'] });
  d.ocorrencias.push({ id: gerarId(), tipo: 'Falha Mecânica', dataHora: horarioDoDia(3, 13, 10), jornadaId: 'j1', local: LOCAL_PADRAO, descricao: 'Corrente da moto escapou na Av. Paralela.', foto: null });

  d.lancamentos.push({ id: gerarId(), tipo: 'ganho', valor: 126, dataHora: horarioDoDia(0, 18, 20), descricao: 'Entregas iFood', plataforma: 'iFood', entregas: 7 });
  d.lancamentos.push({ id: gerarId(), tipo: 'ganho', valor: 78.5, dataHora: horarioDoDia(0, 17, 45), descricao: 'Entregas Rappi', plataforma: 'Rappi', entregas: 5 });
  d.lancamentos.push({ id: gerarId(), tipo: 'ganho', valor: 44, dataHora: horarioDoDia(0, 16, 30), descricao: 'Entregas Uber Eats', plataforma: 'Uber Eats', entregas: 3 });
  d.lancamentos.push({ id: gerarId(), tipo: 'ganho', valor: 38, dataHora: horarioDoDia(0, 15, 10), descricao: 'Entregas 99Food', plataforma: '99Food', entregas: 2 });
  d.lancamentos.push({ id: gerarId(), tipo: 'gasto', valor: 40, dataHora: horarioDoDia(0, 14, 0), descricao: 'Abastecimento', categoria: 'Combustível', plataforma: null });
  d.lancamentos.push({ id: gerarId(), tipo: 'gasto', valor: 25, dataHora: horarioDoDia(0, 13, 30), descricao: 'Ajuste da corrente', categoria: 'Manutenção', plataforma: null });
  d.lancamentos.push({ id: gerarId(), tipo: 'gasto', valor: 18.5, dataHora: horarioDoDia(0, 12, 15), descricao: 'Almoço', categoria: 'Alimentação', plataforma: null });
  d.lancamentos.push({ id: gerarId(), tipo: 'gasto', valor: 10, dataHora: horarioDoDia(0, 11, 0), descricao: 'Taxa de saque', categoria: 'Taxa', plataforma: 'Rappi' });

  const ganhosDaSemana = [185, 240, 310, 160, 220, 265];
  const plataformasDaSemana = ['iFood', 'Rappi', 'iFood', 'Uber Eats', 'iFood', 'Rappi'];
  for (let i = 0; i < 6; i++) {
    const diasAtras = 6 - i;
    d.lancamentos.push({ id: gerarId(), tipo: 'ganho', valor: ganhosDaSemana[i], dataHora: horarioDoDia(diasAtras, 19, 0), descricao: 'Entregas ' + plataformasDaSemana[i], plataforma: plataformasDaSemana[i], entregas: Math.round(ganhosDaSemana[i] / 18) });
    d.lancamentos.push({ id: gerarId(), tipo: 'gasto', valor: 35, dataHora: horarioDoDia(diasAtras, 12, 0), descricao: 'Abastecimento', categoria: 'Combustível', plataforma: null });
  }

  d.chat.mensagens.push({ id: gerarId(), regiao: 'Bairro da Paz', autor: 'Rafael Costa', texto: 'Boa noite, pessoal! O apoio da Vila Mariana está aberto. Tem água e tomada por lá 💪', dataHora: horarioDoDia(0, 19, 28), avatar: 'assets/img/avatar-rafael.jpg' });
  d.chat.mensagens.push({ id: gerarId(), regiao: 'Bairro da Paz', autor: 'Juliana Lima', texto: 'Cuidado na Av. Santo Amaro, perto do nº 1450. Buraco grande na faixa da direita.', dataHora: horarioDoDia(0, 19, 31), tag: 'buraco' });
  d.chat.mensagens.push({ id: gerarId(), regiao: 'Bairro da Paz', autor: 'João Silva', texto: 'Valeu pelo aviso, Ju! Vou pela Domingos de Morais. Boa jornada pra nós 🙌', dataHora: horarioDoDia(0, 19, 33), minha: true });
  d.chat.mensagens.push({ id: gerarId(), regiao: 'Bairro da Paz', autor: 'André Santos', texto: 'Passei no apoio agora. Água gelada e espaço pra descansar. Recomendo!', dataHora: horarioDoDia(0, 19, 35) });

  return d;
}

function criarContaDemo() {
  const usuarios = listarUsuarios();
  const jaExiste = usuarios.some(function (u) {
    return u.email === 'joao.silva@rotasegura.com';
  });
  if (jaExiste || lerDoNavegador(CHAVE_DEMO_REMOVIDA)) {
    return;
  }
  const id = 'demo';
  usuarios.push({ id: id, email: 'joao.silva@rotasegura.com', cpf: '100.000.004-42', senha: 'rota1234' });
  salvarUsuarios(usuarios);
  gravarNoNavegador(CHAVE_DADOS + id, criarDadosDemo());
}

criarContaDemo();
