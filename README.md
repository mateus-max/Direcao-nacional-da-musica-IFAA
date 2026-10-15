# Departamento Nacional da Música — Quadro Virtual

Versão institucional independente para a Igreja da Fé Apostólica Americana. O repositório `QUADRO-AZNY` não é modificado por este projeto.

## Páginas principais

- `index.html`: página principal de identificação antes de entrar.
- `quadro.html`: quadro virtual interativo.
- `direcao.html`: painel da Direção.
- `entrada.html`: página auxiliar de entrada.
- `avaliacao.html` e `fazer-avaliacao.html`: páginas auxiliares de avaliação.
- `data/provincias-municipios.json`: lista das 21 províncias e 326 municípios de Angola, com base no conjunto de dados Angola DPA 2025 (Lei 14/24).
- `portal-inicial.html` e `portal.html`: versões anteriores preservadas.

## Fluxo de entrada

1. O utilizador informa o nome, função (Diretor, Dirigente ou Corista), província, município e atividade.
2. Para coristas num ensaio, também seleciona a voz (Soprano, Mezzo-soprano, Contralto, Tenor, Barítono, Baixo, Voz infantil ou Outra voz).
3. Um Diretor ou Dirigente pode iniciar uma sessão; os participantes devem abrir o link de convite partilhado pela Direção.
4. O quadro apresenta a identidade de quem dirige a sessão e a identidade do participante no modo de participação.

## Firebase

Projeto: `direcao-nacional-da-musica`.

O quadro utiliza Firebase Realtime Database e autenticação anónima, herdados da estrutura do quadro original e configurados para o projeto institucional. Antes de utilização pública, rever as regras da base de dados e configurar autenticação/permissões adequadas para o perfil da Direção. A presença de uma configuração Firebase no código do navegador não é, por si só, uma barreira de segurança.

## Limitações a validar

Esta alteração implementa a página principal, o formulário de identidade, a seleção de localização, a escolha de voz para ensaios e o fluxo de links. É necessário testar a publicação, entrada de participantes, sincronização, permissões, câmaras, gravações e materiais em dispositivos reais. A capacidade para 500 participantes em áudio/vídeo não está garantida e exige arquitetura de mídia e testes de carga.

A lista de municípios foi derivada de um conjunto público baseado na divisão político-administrativa de 2025. Deve ser comparada com a versão oficial mais recente antes de uso administrativo formal.
