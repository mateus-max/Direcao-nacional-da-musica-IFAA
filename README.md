# Departamento Nacional da Música — Quadro Virtual

Versão institucional independente para a Igreja da Fé Apostólica Americana. Este repositório não altera nem partilha a base de dados do Quadro Virtual AZNY.

## Estado atual

A fundação inicial inclui:
- interface adaptável a computador e telemóvel;
- autenticação Firebase para a Direção (e-mail/palavra-passe) e entrada anónima para participantes;
- criação/encerramento de sessões musicais;
- link de entrada partilhável;
- lista de participantes em tempo real;
- apontamentos textuais sincronizados e avisos da Direção.

Ainda **não** estão implementados nem validados: vídeo/áudio em direto, gravação, partilha de ecrã, piano interativo completo, editor de partitura, uploads de PDF/Word, avaliações completas, modo PWA e testes de carga para 500 participantes. Não anunciar esta versão como pronta para ensaios reais até esses itens e a segurança serem concluídos e testados.

## Publicação GitHub Pages

Em Settings → Pages, selecionar **Deploy from a branch**, branch `main` (depois da revisão/merge) e pasta `/(root)`. Os módulos JavaScript são servidos diretamente a partir de `app.js`.

## Configuração Firebase necessária

Projeto: `direcao-nacional-da-musica`.

1. Em Authentication → Sign-in method, ativar **Anonymous** e **Email/Password**.
2. Criar um utilizador de Direção em Authentication → Users. Não colocar a palavra-passe no código nem no GitHub.
3. Em Realtime Database → Rules, rever e aplicar as regras do ficheiro `database.rules.example.json`.
4. Testar com uma conta de Direção e dois participantes anónimos, em dispositivos/navegadores separados.
5. Configurar Storage apenas quando for implementado o envio de partituras e gravações.

A configuração web do Firebase incluída no cliente identifica o projeto, mas **não** substitui autenticação nem regras de segurança. Nunca colocar service-account keys, tokens privados ou palavras-passe neste repositório.

## Escala de 500 participantes

O Realtime Database pode sincronizar metadados e texto, mas não transporta os fluxos de áudio/vídeo. Para sessões com centenas de pessoas será necessária uma arquitetura de mídia adequada (por exemplo, SFU/WebRTC ou serviço equivalente), limites de microfone/câmara e testes reais de carga. Não há garantia de 500 participantes até a arquitetura ser escolhida e validada.

## Próximas etapas

1. Confirmar autenticação e regras de segurança.
2. Construir o quadro de escrita/desenho com sincronização multiutilizador.
3. Integrar materiais musicais, partituras e piano virtual.
4. Implementar avaliações e gestão de sessões.
5. Integrar áudio/vídeo e gravação com infraestrutura apropriada.
6. Realizar testes de segurança, telemóvel/PC e carga antes de disponibilizar ao coro.
