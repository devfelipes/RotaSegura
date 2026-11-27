# RotaSegura

Aplicação web responsiva de bem-estar e segurança para entregadores por aplicativo.
Feita somente com **HTML, CSS e JavaScript**, sem servidor (RNF08), a partir dos protótipos do Figma.

## Como abrir

Dê dois cliques em `login.html`, ou sirva a pasta com um servidor local:

```
python -m http.server 8000      # depois acesse http://localhost:8000/login.html
```

Conta de demonstração: **joao.silva@rotasegura.com**, senha **rota1234**.
Você também pode criar uma conta nova em "Cadastre-se".

> Use o servidor local para testar geolocalização, câmera e microfone: alguns navegadores bloqueiam esses recursos em `file://`.

## Arquitetura em 3 camadas (RQ06)

| Camada | Arquivo | Papel |
|---|---|---|
| Interface | `*.html`, `css/style.css`, `js/icons.js`, `js/ui.js`, `js/paginas/*.js` | Telas e componentes (menu, botão SOS, janelas, avisos). Cada tela tem seu próprio arquivo em `js/paginas/` |
| Lógica de negócio | `js/negocio.js` | Classes do domínio (Jornada, Pausa, ContatoConfianca, Ganho/Gasto…) e funções com as regras dos requisitos (ex.: `iniciarJornada()`, `salvarContato()`) |
| Dados | `js/dados.js` | Salva e lê os dados no `localStorage` do navegador, separados por usuário |

## Telas

| Tela | Arquivo | Requisitos |
|---|---|---|
| Login / Cadastro | `login.html`, `cadastro.html` | RF01 |
| Tela principal | `index.html` | RF02 |
| Jornada (Rota) + alerta de pausa | `jornada.html` | RF02, RF03 |
| Pausa em andamento | `pausa.html` | RQ02 |
| SOS (confirmação e envio) | botão em todas as telas, `sos.html` | RF05, RF06 |
| Mapa e rede de apoio | `mapa.html` | RF09, RF10, RNQ06 |
| Chat local | `chat.html` | RF09, RNQ07 |
| Histórico / relatório | `historico.html` | RF04, RQ04 |
| Alertas | `alertas.html` | RF12 |
| Registrar ocorrência | `ocorrencia.html` | RF08 |
| Perfil | `perfil.html` | — |
| Dados pessoais / Moto | `dados-pessoais.html`, `moto.html` | RF01 |
| Contatos de confiança | `contatos.html` | RF06, RQ01 |
| Configurações do SOS | `config-sos.html` | RF05 |
| Compartilhar rota | `compartilhar-rota.html` | RF07, RNF05 |
| Controle financeiro / lançamentos | `financeiro.html`, `lancamentos.html` | RF11, RQ05 |
| Configurações e privacidade | `privacidade.html` | RNF04, RNQ04–RNQ07 |

## Regras principais

- Até **3 contatos de confiança** (RQ01). O valor fica na constante `MAX_CONTATOS`, em `js/negocio.js`.
- Pausa sugerida de **15 minutos** (RQ02). O tempo para o alerta é editável em Perfil › Jornada (RQ03).
  A opção "1 minuto (teste)" existe para demonstrar o alerta na apresentação.
- O SOS só é enviado depois de segurar o botão pelo tempo configurado (3, 5 ou 10 s), e pode ser cancelado.
- O link de trajeto expira automaticamente ao encerrar a jornada (RF07).

## Limitações (front-end sem servidor)

- O envio real de SMS/notificações aos contatos, os entregadores do mapa, o clima e o trânsito são **simulados**.
- As senhas ficam salvas no próprio navegador, sem criptografia. Num sistema real elas ficariam protegidas num servidor.
- O mapa é a imagem do protótipo. A posição do usuário vem do GPS do navegador, quando ele permite.
- O acionamento automático do SOS por desvio brusco de rota (RF05) precisa de rastreamento contínuo
  e de uma rota de referência, que dependem de um back-end. Por isso não está implementado.
