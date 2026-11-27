verificarLogin();
criarMenuInferior('rota', 'Rota/Rede');
vigiarPausa();

const areaDosBotoes = document.getElementById('fabs');
const botaoSOS = criarBotaoSOS(areaDosBotoes);
if (botaoSOS) {
  areaDosBotoes.insertBefore(botaoSOS, areaDosBotoes.firstChild);
}

const ICONE_DO_PONTO = { rider: 'helmet', oficina: 'wrench', banheiro: 'droplet', descanso: 'coffee' };
const NOME_DO_PONTO = { rider: 'Entregador por perto', oficina: 'Oficina', banheiro: 'Banheiro / bebedouro', descanso: 'Ponto de descanso' };

let filtroDoMapa = 'todos';
let cartaoAberto = null;

function desenharPontos() {
  let html = '';
  for (let i = 0; i < PONTOS_DO_MAPA.length; i++) {
    const ponto = PONTOS_DO_MAPA[i];
    const aparece = filtroDoMapa === 'todos' || filtroDoMapa === ponto.tipo;
    const nome = ponto.nome || NOME_DO_PONTO[ponto.tipo];
    html += `<button class="pin ${ponto.tipo}" data-numero="${i}" style="left:${ponto.x}%;top:${ponto.y}%" ${aparece ? '' : 'hidden'} aria-label="${nome}">${icone(ICONE_DO_PONTO[ponto.tipo], 20)}</button>`;
  }
  document.getElementById('pins').innerHTML = html;

  for (const botao of document.querySelectorAll('.pin')) {
    botao.addEventListener('click', function (evento) {
      evento.stopPropagation();
      mostrarCartao(PONTOS_DO_MAPA[botao.dataset.numero]);
    });
  }
}

function mostrarCartao(ponto) {
  fecharCartao();
  let informacao = ponto.info;
  if (ponto.tipo === 'rider') {
    informacao = 'Anônimo · ' + (200 + ponto.x * 9) + ' m de você';
  }
  cartaoAberto = document.createElement('div');
  cartaoAberto.className = 'pin-card';
  cartaoAberto.innerHTML = `<span class="pin ${ponto.tipo}">${icone(ICONE_DO_PONTO[ponto.tipo], 20)}</span>
    <div><strong>${ponto.nome || NOME_DO_PONTO[ponto.tipo]}</strong><span>${informacao}</span></div>`;
  document.getElementById('mapa').appendChild(cartaoAberto);
}

function fecharCartao() {
  if (cartaoAberto !== null) {
    cartaoAberto.remove();
    cartaoAberto = null;
  }
}

document.getElementById('mapa').addEventListener('click', fecharCartao);

const botoesDeFiltro = document.querySelectorAll('#filtros .chip');
for (const botao of botoesDeFiltro) {
  botao.addEventListener('click', function (evento) {
    evento.stopPropagation();
    filtroDoMapa = botao.dataset.f;
    for (const outro of botoesDeFiltro) {
      outro.classList.remove('is-on');
    }
    botao.classList.add('is-on');
    desenharPontos();
  });
}

const botaoInvisivel = document.getElementById('invisivel');

function mostrarSeEstaInvisivel() {
  const invisivel = !dadosDePrivacidade().aparecerNoMapa;
  botaoInvisivel.classList.toggle('is-on', invisivel);
  botaoInvisivel.querySelector('span').textContent = invisivel ? 'Você está invisível' : 'Ficar Invisível';
  document.querySelector('.me-dot').style.opacity = invisivel ? '0.45' : '1';
}

botaoInvisivel.addEventListener('click', function (evento) {
  evento.stopPropagation();
  const ficarInvisivel = dadosDePrivacidade().aparecerNoMapa;
  mudarPrivacidade('aparecerNoMapa', !ficarInvisivel);
  mostrarSeEstaInvisivel();
  if (ficarInvisivel) {
    mostrarAviso('Você está invisível para outros entregadores.');
  } else {
    mostrarAviso('Você voltou a aparecer no mapa.');
  }
});

desenharPontos();
mostrarSeEstaInvisivel();
