if (estaLogado()) {
  location.replace('index.html');
}

const formularioLogin = document.getElementById('form');

formularioLogin.addEventListener('submit', function (evento) {
  evento.preventDefault();
  const email = formularioLogin.email.value;
  const senha = formularioLogin.senha.value;

  if (entrar(email, senha)) {
    location.replace('index.html');
  } else {
    mostrarErros(formularioLogin, { senha: 'E-mail ou senha incorretos.' });
  }
});
