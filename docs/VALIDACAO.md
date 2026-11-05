# Verificação da entrega

Verificação local em **05/11/2026**, Windows, JDK 17, Node.js 24, H2 e prévia web do Expo SDK 58.

| Verificação | Resultado |
| --- | --- |
| Backend: `mvn test` | 12 testes aprovados (8 integração HTTP/JPA + 4 análise) |
| Frontend: `npm test` | 4 testes aprovados: JSON, HTTP inválido, timeout e recuperação |
| TypeScript: `npm run typecheck` | Sem erros |
| Qualidade: `npm run lint` | Aprovado |
| SDK: `npx expo install --check` | Dependências compatíveis |
| Expo: `npx expo-doctor` | 20/20 verificações aprovadas |
| Bundle web: `npm run build:web` | Exportação concluída em `frontend/dist/` |
| API iniciada com H2 file | Health e endpoints de eventos e métricas respondendo |
| Cadastro pelo app | Formulário validou obrigatórios, enviou POST e exibiu ocorrência persistida |
| Novo sensor | POST de demonstração chegou ao painel e à central após sincronização |
| API parada de verdade | App mostrou desconexão e consulta anterior com aviso; não travou |
| Reinício da API | App reconectou sem recarregar; IDs e registros anteriores preservados |
| Responsividade | Inspeção visual da prévia em desktop e viewport de 390 × 844 |
| Busca sem resultados | Estado vazio identificado e navegação preservada |

## Cobertura por requisito do enunciado

| Requisito | Evidência no código/entrega |
| --- | --- |
| Spring Boot + React Native no mesmo repositório | `backend/` e `frontend/` |
| Sensores, bases públicas e comunidade | Ingestão autenticada, três contratos de exemplo e formulário comunitário |
| Persistência | JPA + H2 file; reinício preserva IDs |
| REST com priorização | `EventController`, `PriorityService`, `EventSpecifications` |
| Origem e confiança | `source`, `sourceName`, `confidence`; valores definidos pelo servidor |
| Painel e lista/mapa | Visão geral, ocorrências, detalhe e mapa esquemático |
| Alertas | Central do app, contador e notificações locais opt-in no código nativo |
| Interface acessível | Textos de estado, ícones com rótulos, labels nos inputs, controles sem depender só de cor |
| Camadas e testes | Separação de controller/service/repository; JUnit/MockMvc e testes do HTTP cliente |
| Recurso de IA ou análise | Análise multicritério explicável, sem alegação de IA treinada |
| Escalabilidade | Paginação/ordenação no banco, agregações, índice e configuração de banco externo |
| Disponibilidade | Timeout, cache, reconexão, health check e roteiro de falha real |
| Proteção de dados | Minimização, CORS, validação, chave de ingestão e ausência de identificadores pessoais no formulário |
| Execução, equipe e entrega | README, TXT com três RMs e roteiro Markdown/PDF |

## Limites da verificação

A execução visual foi feita no navegador usando React Native Web. Não houve teste em iPhone/Android físico, build de loja, teste de notificação nativa no aparelho, estudo de usabilidade, teste de carga ou verificação PostgreSQL. A equipe deve fazer o ensaio no aparelho usado na apresentação.

Não há conexão automática com fontes governamentais, sensores físicos ou serviço de push. O carregamento inicial e o simulador usam dados explicitamente simulados. A API recebe dados externos já normalizados por um coletor autorizado.

A integração contínua está configurada; seu resultado remoto deve ser conferido na aba Actions depois do push. A gravação e a publicação do vídeo são responsabilidade da equipe, conforme solicitado.

`npm audit` apontou avisos moderados em dependências transitivas das ferramentas Expo/ESLint. Não foram aplicadas atualizações forçadas que alterassem a versão do SDK; essa manutenção deve ser reavaliada antes de uma implantação pública. Não houve achados altos ou críticos nesse levantamento local.
