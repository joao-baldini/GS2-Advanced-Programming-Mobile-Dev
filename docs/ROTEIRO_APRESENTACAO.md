# Roteiro da apresentação — UrbanRisk

**Global Solution 2026.2 · Advanced Programming And Mobile Dev**  
**Equipe:** João Viviani Baldini (558596), Giuliano Ferreira Venceslau (558674) e Enrico Nikolay Meirelles Zeronian (558557).

Formato da Sprint 4: preparação fora do vídeo, comandos por terminal, cenas com tempo, o que mostrar, fala sugerida e resultado esperado. Planejamento de aproximadamente **5 minutos**; essa duração é uma sugestão, pois o enunciado não fixa limite.

## Preparação — fora da gravação

### 1. Abrir o projeto no VS Code

```powershell
git clone https://github.com/joao-baldini/GS2-Advanced-Programming-Mobile-Dev.git
cd GS2-Advanced-Programming-Mobile-Dev
code .
```

Se já clonou, abra a pasta existente; não crie outra cópia do banco sem necessidade. No VS Code, abra **Terminal > Novo Terminal**. Antes da gravação, confirme Java/javac 17, Maven 3.9+ e Node.js 24.

### 2. Terminal 1 — backend

Partindo da raiz do projeto:

```powershell
cd backend
java -version
javac -version
mvn -version
mvn spring-boot:run
```

Espere a mensagem `Started UrbanRiskApplication`. Mantenha esse terminal aberto e identificado como **Backend**. O H2 em arquivo guarda os registros em `backend/data/`; execute sempre nesta pasta. Não rode duas instâncias na porta 8080.

### 3. Terminal 2 — teste da API

Abra outro terminal na raiz:

```powershell
curl.exe http://localhost:8080/actuator/health
curl.exe "http://localhost:8080/api/events?size=3"
curl.exe http://localhost:8080/api/dashboard
```

O primeiro comando responde `UP`. A lista é um objeto com `items`, `total`, `page`, `size` e `serverTime`, não um array solto. No banco novo com modo demo ativo, são criados oito eventos. Nas execuções seguintes, o total pode ser maior. Escolha um ID real para comparar com o app.

### 4. Terminal 3 — Expo na web

Abra mais um terminal na raiz:

```powershell
cd frontend
node --version
npm ci
npm run web
```

Abra `http://localhost:8081`. Deixe o app com **Conectado** e o painel preenchido. O tempo em ms é a duração da consulta; o intervalo automático é de 5 segundos. Faça instalações antes de começar o vídeo.

### 5. Celular físico — recomendado para evidenciar o app mobile

No Terminal 3, substitua o comando web por:

```powershell
cd frontend
ipconfig
$env:EXPO_PUBLIC_API_URL="http://SEU_IPV4:8080"
npx expo start --clear
```

Substitua `SEU_IPV4` pelo IPv4 real do computador. Não digite o marcador literalmente. Computador e telefone devem estar no mesmo Wi-Fi. Abra `http://SEU_IPV4:8080/api/events` no Safari/Chrome do telefone antes de ler o QR Code com Expo Go compatível com **SDK 58**. Se não abrir, confira IP, Wi-Fi e firewall. O iPhone usa a câmera para abrir o QR Code.

Combine a captura da tela do computador com a do telefone; a equipe pode gravar a tela do celular e inserir a captura no vídeo. A prévia web é útil para ensaiar os mesmos fluxos. No celular, a central oferece notificações locais; a web usa avisos dentro do aplicativo.

### 6. Checklist de ensaio

- README aberto no navegador, com os três integrantes visíveis.
- Três terminais identificados: Backend, API e Expo.
- App com conexão ativa e pelo menos um registro disponível.
- Antes da cena do sensor, abra o app e espere a primeira sincronização; ela estabelece a referência de alertas.
- Mantenha o filtro em **Todos os riscos** e limpe a busca para o novo evento aparecer.
- Deixe a tela em posição de mostrar o status de conexão e o topo do painel durante a queda da API.
- Feche notificações pessoais do computador/celular antes de gravar.
- Ensaie parar e reiniciar apenas a API, mantendo o Expo aberto.

## Cena 1 · 0:00–0:30 — proposta e equipe

**Na tela:** mostre o README no GitHub, o nome do projeto, os três integrantes/RMs e as pastas `backend/` e `frontend/`.

**Fala sugerida:** “Esta é a Urban Risk Intelligence Platform. Nossa solução reúne sensores, bases públicas e relatos comunitários para acompanhar alagamentos, calor e interrupções de serviços. O backend é Spring Boot e o app é React Native, no mesmo repositório.”

**Comando:** nenhum. Não gaste tempo clonando ou instalando durante a gravação.

**Resultado esperado:** tema, equipe e duas stacks ficam claros.

## Cena 2 · 0:30–1:05 — API rodando e persistência

**Na tela:** mostre o Terminal 1 com Spring Boot ativo. No Terminal 2, consulte a lista. Destaque ID, `source`, `sourceName`, `confidence`, `simulated` e `analysis` de um item.

```powershell
curl.exe "http://localhost:8080/api/events?size=2"
```

**Fala sugerida:** “A API recebe e persiste os registros no H2 em arquivo. Cada ocorrência informa a origem e a confiança estimada. Os dados iniciais de demonstração são simulados e estão identificados. A lista chega ordenada por prioridade calculada no servidor.”

**Resultado esperado:** JSON real da API, com dados persistidos e origem explícita.

## Cena 3 · 1:05–1:45 — painel e análise explicável

**Na tela:** mostre o app com **Conectado**. Compare um título/ID com a API. Abra o detalhe de um evento de sensor e role até **Análise de prioridade**. Mostre fonte, confiança, fatores e recomendação.

**Fala sugerida:** “O app consulta a API a cada cinco segundos. O painel apresenta ocorrências, prioridade e confiança. Nossa análise combina severidade, confiança da origem, impacto estimado e recência. Cada pontuação tem uma explicação; é apoio à triagem, não uma previsão treinada de IA.”

**Comando:** nenhum. Abra o detalhe pela lista ou pelo mapa esquemático.

**Resultado esperado:** evento da API no app e explicação dos quatro fatores. Pontuações podem variar pela idade do registro; não prometa um número fixo para dados antigos.

## Cena 4 · 1:45–2:35 — cadastro comunitário integrado

**Na tela:** toque em **Registrar ocorrência** e preencha:

| Campo | Valor para o vídeo |
| --- | --- |
| Tipo | Alagamentos |
| Título | Alagamento — apresentação GS |
| Bairro | Ipiranga |
| Descrição | Água acumulada na via após chuva. Registro acadêmico de demonstração. |
| Severidade | Alto |
| Pessoas afetadas | 120 |

Toque no botão de registrar. Vá a **Ocorrências**, busque pelo título e abra o detalhe. No Terminal 2, consulte a API:

```powershell
curl.exe "http://localhost:8080/api/events?type=FLOOD&neighborhood=Ipiranga"
```

**Fala sugerida:** “Este relato é enviado pelo aplicativo, recebe ID do backend e fica persistido. Como é comunitário, entra com 60% de confiança estimada e precisa de verificação. O formulário não pede nome ou documento.”

**Resultado esperado:** o mesmo título e ID aparecem no app e no JSON. Os números de confiança representam uma regra de triagem por fonte.

## Cena 5 · 2:35–3:15 — leitura e alerta em tempo quase real

**Na tela:** volte a **Visão geral**, selecione **Todos os riscos** e limpe a busca. No Terminal 2, envie a leitura abaixo. Não atualize a página manualmente. Aguarde a próxima consulta, mostre o contador/novo evento e abra **Central de alertas**.

```powershell
curl.exe -X POST http://localhost:8080/api/demo/reading
```

**Fala sugerida:** “Enviei uma leitura simulada de sensor para a API. O app recebeu o novo evento automaticamente na próxima consulta e o colocou na central porque a prioridade é alta ou crítica. É atualização periódica de cinco segundos. No celular, podemos ativar notificações locais enquanto o app está em execução.”

**Resultado esperado:** novo evento **Alagamento detectado pelo sensor**, origem SENSOR, indicador de simulação e prioridade 98 para uma leitura recém-criada. Se repetir em menos de 5 segundos, a API pode responder `429`; aguarde e tente uma vez.

## Cena 6 · 3:15–3:55 — backend parado, app funcionando

**Na tela:** volte ao topo de **Visão geral**. No Terminal 1, pressione **Ctrl+C** e espere a API encerrar. Não pare o Expo. Mantenha o app aberto por até aproximadamente 8 segundos; mostre **Desconectado**, **Backend desconectado**, horário da consulta e aviso de que os dados podem estar desatualizados. Navegue entre telas para demonstrar que não travou.

```powershell
# Opcional, no Terminal 2: deve falhar porque a API parou.
curl.exe --max-time 3 http://localhost:8080/api/events
```

**Fala sugerida:** “Agora parei somente o backend. O app percebe a falha, avisa que está desconectado e identifica o horário dos dados salvos. Posso continuar navegando; os registros em cache não são apresentados como novas leituras.”

**Resultado esperado:** falha real de conexão, aviso visível e interface utilizável. Não feche o app: aqui a continuidade do cache faz parte da demonstração.

## Cena 7 · 3:55–4:40 — reinício e recuperação automática

**Na tela:** no Terminal 1, ainda em `backend/`, execute:

```powershell
mvn spring-boot:run
```

Espere `Started UrbanRiskApplication`. Sem recarregar o app, mostre **Conexão restabelecida** e **Conectado**. O aviso verde dura alguns segundos; mantenha a câmera no app quando o servidor terminar de iniciar. Abra a ocorrência cadastrada na cena 4 e compare seu ID com a API. Se o boot da sua máquina demorar, acelere somente essa espera no vídeo, identificando o corte.

**Fala sugerida:** “Com a API de volta, o app reconecta automaticamente. O alerta cadastrado continua com o mesmo ID, pois o banco é persistente. Não foi necessário reiniciar o aplicativo.”

**Resultado esperado:** recuperação sem travamento, consulta atualizada e dados preservados. Também existe um botão de tentativa manual no aviso, mas a reconexão automática já atende este fluxo.

## Cena 8 · 4:40–5:00 — qualidade, limites e entrega

**Na tela:** mostre **Fontes de dados** e a seção de testes do README. Finalize no painel conectado.

**Fala sugerida:** “A plataforma organiza três origens de informação com confiança e prioridade explicáveis. Validamos a API, o cliente HTTP e o fluxo de desconexão e recuperação. O repositório contém as duas stacks, as instruções e o roteiro. A demonstração usa dados simulados; integrações externas reais e push em segundo plano são evoluções futuras.”

**Resultado esperado:** encerramento coerente com o que o projeto realmente executa.

## Depois da gravação

1. Assista ao vídeo e confira que API, app, queda e reconexão aparecem de forma legível.
2. Publique no destino escolhido pela equipe; se usar YouTube, prefira **Não listado**, acessível ao professor.
3. Troque “Vídeo da apresentação: a gravar pela equipe” no README pela URL verdadeira.
4. Confirme que os commits necessários estão no GitHub. Cada integrante deve realizar suas próprias contribuições com sua identidade Git.
5. Envie **ENTREGA_GS.txt** no portal FIAP até **19/11/2026 às 23h55**. O enunciado exige TXT com integrantes e link do GitHub.

## Diagnóstico rápido

| Sintoma | Ação |
| --- | --- |
| `localhost:8080` não responde | Confira Terminal 1, Java/Maven, logs e porta 8080. |
| App web conecta, telefone não | Troque localhost pelo IPv4 do computador, confira rede e firewall e reinicie o Expo. |
| Expo Go incompatível | Use versão compatível com SDK 58. A prévia web serve para ensaio. |
| Lista vazia | Confira filtros, busca e JSON. Banco vazio é diferente de backend desconectado. |
| Novo sensor não aparece na central | Espere a primeira sincronização antes de enviar e mantenha o app em primeiro plano. |
| Depois do reinício, dados sumiram | Execute a API dentro de `backend/`, mantendo o mesmo arquivo H2; confira `DATABASE_URL`. |
| Cadastro falha durante queda | Os campos permanecem preenchidos. Reconecte a API e toque novamente em registrar. |
| Notificação do sistema não aparece | Ative permissão na central do celular; na web os alertas são internos. Não há push remoto em segundo plano. |
