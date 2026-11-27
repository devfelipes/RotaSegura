verificarLogin();

const entregadorDaTela = dadosDoEntregador();
const formularioDados = document.getElementById('form');
let fotoNova = null;

function atualizarTopo() {
  const nome = formularioDados.nome.value || entregadorDaTela.nome;
  const foto = fotoNova || entregadorDaTela.foto;
  document.getElementById('avatar').innerHTML = fotoDoEntregador({ nome: nome, foto: foto }, 'ring', 72);
  document.getElementById('nome-topo').textContent = nome;
}

formularioDados.nome.value = entregadorDaTela.nome;
formularioDados.nascimento.value = entregadorDaTela.nascimento;
formularioDados.telefone.value = entregadorDaTela.telefone;
formularioDados.email.value = entregadorDaTela.email;
formularioDados.cidade.value = entregadorDaTela.cidade;
formularioDados.cnh.value = entregadorDaTela.cnh;
formularioDados.categoriaCnh.value = entregadorDaTela.categoriaCnh;
document.getElementById('cpf').value = esconderCpf(entregadorDaTela.cpf);
document.getElementById('tipo').textContent = entregadorDaTela.tipo;
atualizarTopo();

const caixaDePlataformas = document.getElementById('plataformas');
let botoesDePlataforma = '';
for (const p of PLATAFORMAS) {
  botoesDePlataforma += opcaoHTML(p, p, entregadorDaTela.plataformas.includes(p));
}
caixaDePlataformas.innerHTML = botoesDePlataforma;
ativarEscolhaMultipla(caixaDePlataformas);

formularioDados.nome.addEventListener('input', atualizarTopo);

formularioDados.telefone.addEventListener('input', function () {
  formularioDados.telefone.value = mascaraTelefone(formularioDados.telefone.value);
});

formularioDados.cnh.addEventListener('input', function () {
  formularioDados.cnh.value = somenteNumeros(formularioDados.cnh.value);
});

document.getElementById('foto').addEventListener('change', function (evento) {
  lerFoto(evento.target.files[0], 320, function (foto) {
    fotoNova = foto;
    atualizarTopo();
    mostrarAviso('Foto pronta. Toque em Salvar alterações.');
  });
});

formularioDados.addEventListener('submit', function (evento) {
  evento.preventDefault();
  const erros = salvarDadosPessoais({
    nome: formularioDados.nome.value,
    nascimento: formularioDados.nascimento.value,
    telefone: formularioDados.telefone.value,
    email: formularioDados.email.value,
    cidade: formularioDados.cidade.value,
    cnh: formularioDados.cnh.value,
    categoriaCnh: formularioDados.categoriaCnh.value,
    plataformas: valoresMarcados(caixaDePlataformas),
    foto: fotoNova
  });

  if (temErros(erros)) {
    mostrarErros(formularioDados, erros);
    return;
  }
  limparErros(formularioDados);
  mostrarAviso('Dados atualizados');
});
