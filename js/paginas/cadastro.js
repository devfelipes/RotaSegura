const formularioCadastro = document.getElementById('form');

formularioCadastro.cpf.addEventListener('input', function () {
  formularioCadastro.cpf.value = mascaraCpf(formularioCadastro.cpf.value);
});

formularioCadastro.addEventListener('submit', function (evento) {
  evento.preventDefault();
  const erros = cadastrarUsuario(
    formularioCadastro.email.value,
    formularioCadastro.cpf.value,
    formularioCadastro.senha.value,
    formularioCadastro.confirmacao.value
  );

  if (temErros(erros)) {
    mostrarErros(formularioCadastro, erros);
  } else {
    location.replace('index.html');
  }
});
