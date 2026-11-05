"""Generate the presentation guide. Requires reportlab (Python)."""
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output/pdf/Roteiro_Global_Solution_UrbanRisk.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)
font_dir = Path("C:/Windows/Fonts")
if font_dir.exists():
    pdfmetrics.registerFont(TTFont("Guide", str(font_dir / "arial.ttf")))
    pdfmetrics.registerFont(TTFont("Guide-Bold", str(font_dir / "arialbd.ttf")))
else:
    pdfmetrics.registerFontFamily("Guide", normal="Helvetica", bold="Helvetica-Bold")
    # ReportLab's standard font aliases allow generation on other platforms.
    pdfmetrics.registerFont(pdfmetrics.Font("Guide", "Helvetica", "WinAnsiEncoding"))
    pdfmetrics.registerFont(pdfmetrics.Font("Guide-Bold", "Helvetica-Bold", "WinAnsiEncoding"))
pdfmetrics.registerFontFamily("Guide", normal="Guide", bold="Guide-Bold")
PW, PH = A4
M = 40
W = PW - M * 2
PURPLE = colors.HexColor("#6B56C8")
INK = colors.HexColor("#20283F")
MUTED = colors.HexColor("#68758B")
LINE = colors.HexColor("#DEE3EE")
PALE = colors.HexColor("#F3F0FC")
BODY = ParagraphStyle("Body", fontName="Guide", fontSize=9, leading=12.6, textColor=INK)
INTRO = ParagraphStyle("Intro", parent=BODY, fontSize=9.4, leading=13.5, textColor=MUTED)
c = canvas.Canvas(str(OUT), pagesize=A4)
c.setTitle("Roteiro da apresentação - UrbanRisk - Global Solution 2026.2")
c.setAuthor("Equipe UrbanRisk")

def paragraph(text, x, top, width, style=BODY, draw=True):
    p = Paragraph(text, style)
    h = p.wrap(width, PH)[1]
    if draw:
        p.drawOn(c, x, top - h)
    return h

def header(page, title, intro):
    c.setFillColor(PURPLE)
    c.rect(0, PH - 7, PW, 7, stroke=0, fill=1)
    c.setFont("Guide-Bold", 8)
    c.drawString(M, PH - 35, "URBANRISK  /  GLOBAL SOLUTION 2026.2  /  GUIA DE GRAVAÇÃO")
    c.setFillColor(INK)
    c.setFont("Guide-Bold", 21)
    c.drawString(M, PH - 68, title)
    h = paragraph(intro, M, PH - 83, W, INTRO)
    return PH - 83 - h - 23

def footer(page, bottom):
    if bottom < 54:
        raise RuntimeError(f"Page {page} overflows: {bottom:.1f}")
    c.setStrokeColor(LINE)
    c.line(M, 40, PW - M, 40)
    c.setFillColor(MUTED)
    c.setFont("Guide", 7.7)
    c.drawString(M, 25, "Preparação fora do vídeo | duração sugerida: cerca de 5 minutos")
    c.drawRightString(PW - M, 25, f"{page} / 5")
    print(f"page={page}, content_bottom={bottom:.1f}")
    c.showPage()

def card(top, tag, title, rows, commands=(), tint=False):
    inner = W - 32
    heights = [paragraph(t, 0, 0, inner, draw=False) for t in rows]
    cmd_h = 15 + 11 * len(commands) + 7 if commands else 0
    height = 43 + sum(heights) + max(0, len(rows)-1) * 7 + (cmd_h + 9 if commands else 0) + 17
    bottom = top - height
    c.setFillColor(PALE if tint else colors.white)
    c.setStrokeColor(LINE)
    c.roundRect(M, bottom, W, height, 8, stroke=1, fill=1)
    c.setFillColor(PURPLE)
    c.roundRect(M, bottom, 4, height, 2, stroke=0, fill=1)
    c.setFont("Guide-Bold", 7.7)
    c.drawString(M + 16, top - 16, tag)
    c.setFillColor(INK)
    c.setFont("Guide-Bold", 11)
    c.drawString(M + 16, top - 32, title)
    y = top - 43
    for row, h in zip(rows, heights):
        paragraph(row, M + 16, y, inner)
        y -= h + 7
    if commands:
        y += 1
        c.setFillColor(colors.HexColor("#F3F5F9"))
        c.roundRect(M + 16, y-cmd_h, inner, cmd_h, 5, stroke=0, fill=1)
        c.setFillColor(INK)
        c.setFont("Courier", 7.5)
        for i, command in enumerate(commands):
            if pdfmetrics.stringWidth(command, "Courier", 7.5) > inner-18:
                raise RuntimeError(f"Command too wide: {command}")
            c.drawString(M + 25, y - 14 - 11*i, command)
    return bottom - 12

def scene(top, number, timing, title, show, say, expected, commands=()):
    return card(top, f"CENA {number}  /  {timing}", title,
        [f"<b>Na tela:</b> {show}", f"<b>Fala sugerida:</b> {say}", f"<b>Resultado esperado:</b> {expected}"], commands)

y=header(1,"Prepare o projeto e a API", "Mesmo formato da Sprint 4: comandos por terminal, ações na tela, falas e resultados. Faça esta preparação antes de iniciar a gravação.")
y=card(y,"EQUIPE / REPOSITÓRIO","Abra a pasta no VS Code",[
    "<b>João Viviani Baldini - RM 558596</b><br/><b>Giuliano Ferreira Venceslau - RM 558674</b><br/><b>Enrico Nikolay Meirelles Zeronian - RM 558557</b>",
    "Clone somente se ainda não tiver a pasta. Abra o VS Code e use <b>Terminal &gt; Novo Terminal</b>. O README contém os requisitos de execução e os limites da demonstração."],
    ["git clone https://github.com/joao-baldini/" + "GS2-Advanced-Programming-Mobile-Dev.git", "cd GS2-Advanced-Programming-Mobile-Dev", "code ."],True)
y=card(y,"TERMINAL 1 / BACKEND","Spring Boot na porta 8080",[
    "Na raiz do projeto, entre em <b>backend/</b>. Java e javac devem ser <b>17</b>; o Maven deve usar esse JDK. Aguarde <b>Started UrbanRiskApplication</b> e mantenha o terminal aberto.",
    "O H2 em arquivo guarda os registros em <b>backend/data/</b>. Execute sempre nessa pasta para reencontrar o mesmo banco após o reinício."],
    ["cd backend","java -version","javac -version","mvn -version","mvn spring-boot:run"])
y=card(y,"TERMINAL 2 / API","Confirme o JSON antes de abrir o app",[
    "Abra outro terminal na raiz. O health responde <b>UP</b>. A lista retorna um objeto com <b>items</b>, <b>total</b> e horário do servidor. O primeiro banco recebe oito registros simulados; o total pode crescer durante o ensaio."],
    ["curl.exe http://localhost:8080/actuator/health", 'curl.exe "http://localhost:8080/api/events?size=3"', "curl.exe http://localhost:8080/api/dashboard"])
footer(1,y)

y=header(2,"Prepare o Expo e o celular", "Instale as dependências antes de gravar. O app usa Expo SDK 58; a web é a prévia do mesmo código React Native, útil para ensaiar.")
y=card(y,"TERMINAL 3 / PRÉVIA WEB","Abra o app na porta 8081",[
    "Em outro terminal na raiz, entre em <b>frontend/</b>. Use <b>Node.js 24</b>. Abra <b>http://localhost:8081</b>, espere o status <b>Conectado</b> e deixe a primeira consulta terminar."],
    ["cd frontend","node --version","npm ci","npm run web"])
y=card(y,"TERMINAL 3 / TELEFONE FÍSICO","Expo Go e computador na mesma rede",[
    "Para mostrar o app mobile, use os comandos abaixo em vez da inicialização web. Substitua <b>SEU_IPV4</b> pelo IPv4 do computador mostrado por <b>ipconfig</b>. O marcador não deve ser copiado literalmente.",
    "No telefone, teste <b>http://SEU_IPV4:8080/api/events</b> no navegador. Depois leia o QR Code com <b>Expo Go compatível com SDK 58</b>. No iPhone, use a câmera. Se não conectar, confira IP, Wi-Fi e firewall da porta 8080."],
    ["cd frontend","ipconfig",'$env:EXPO_PUBLIC_API_URL="http://SEU_IPV4:8080"',"npx expo start --clear"])
y=card(y,"ANTES DE GRAVAR","Deixe a demonstração pronta",[
    "<b>Janelas:</b> README, Terminal 1 (Backend), Terminal 2 (API), Terminal 3 (Expo) e tela do app. Se usar telefone, prepare uma captura da sua tela junto ao computador.",
    "<b>App:</b> primeiro carregamento concluído; filtro <b>Todos os riscos</b>; busca vazia. O painel consulta a cada 5 segundos. O valor em ms mede a consulta, não esse intervalo.",
    "<b>Ensaio:</b> confirme que consegue parar só a API, manter o Expo e reiniciar na mesma pasta. A gravação proposta dura cerca de 5 minutos; o enunciado não fixa duração."],tint=True)
footer(2,y)

y=header(3,"Vídeo: proposta, API e análise", "Trecho planejado: 0:00 a 1:45. Mostre a integração e explique a prioridade antes de cadastrar um novo relato.")
y=scene(y,1,"0:00-0:30","Projeto e equipe", "No GitHub, mostre README, os três integrantes/RMs e as pastas backend/ e frontend/.",
    "'Esta é a Urban Risk Intelligence Platform. Reunimos sensores, bases públicas e relatos comunitários para acompanhar alagamentos, calor e interrupções de serviços. A API é Spring Boot e o app é React Native.'",
    "Tema, equipe e duas stacks ficam claros. Não instale dependências durante a gravação.")
y=scene(y,2,"0:30-1:05","API ativa e registros persistidos", "Mostre o Terminal 1 ativo. No Terminal 2, consulte eventos e destaque ID, source, sourceName, confidence, simulated e analysis.",
    "'A API persiste os registros no H2 em arquivo. Cada dado tem origem e confiança estimada. Os registros iniciais são simulados e identificados. A lista é ordenada por prioridade no servidor.'",
    "JSON real da API. Selecione um ID existente para comparar com o aplicativo.",
    ['curl.exe "http://localhost:8080/api/events?size=2"'])
y=scene(y,3,"1:05-1:45","Painel e prioridade explicável", "No app conectado, compare um título/ID com a API. Abra o detalhe de um sensor e mostre fonte, confiança, análise de prioridade e recomendação.",
    "'O app consulta a API a cada cinco segundos. A análise combina severidade, confiança, impacto estimado e recência. Cada pontuação tem explicação: é apoio à triagem, não uma previsão treinada de IA.'",
    "Os quatro fatores aparecem no detalhe. Pontuações antigas podem variar pela recência; a confiança é uma hipótese por fonte.")
footer(3,y)

y=header(4,"Vídeo: cadastro e novo sensor", "Trecho planejado: 1:45 a 3:15. Cadastre pelo aplicativo e, depois, envie uma leitura para demonstrar a atualização automática.")
y=scene(y,4,"1:45-2:35","Registro comunitário pelo aplicativo", "Toque em Registrar ocorrência. Tipo: Alagamentos; título: 'Alagamento - apresentação GS'; bairro: Ipiranga; descrição: 'Água acumulada na via após chuva. Registro acadêmico de demonstração.'; severidade: Alto; pessoas: 120. Registre, abra o detalhe e compare o ID com a API.",
    "'O relato é enviado pelo aplicativo, recebe ID do backend e fica persistido. Como é comunitário, entra com 60% de confiança estimada e precisa de verificação. Não pedimos nome nem documento.'",
    "O mesmo título e ID no app e no JSON. Use a busca em Ocorrências para localizar o cadastro.",
    ['curl.exe "http://localhost:8080/api/events?type=FLOOD&neighborhood=Ipiranga"'])
y=scene(y,5,"2:35-3:15","Leitura simulada e alerta automático", "Volte a Visão geral, limpe a busca e selecione Todos os riscos. Envie o POST no Terminal 2. Não atualize manualmente. Aguarde a consulta e abra a Central de alertas.",
    "'Enviei uma leitura simulada de sensor à API. O app recebeu o evento na próxima consulta e o colocou na central por sua prioridade. É atualização periódica de cinco segundos.'",
    "Novo 'Alagamento detectado pelo sensor', origem SENSOR, simulação identificada e prioridade 98 quando recente. Um novo evento deve aparecer na central.",
    ["curl.exe -X POST http://localhost:8080/api/demo/reading"])
y=card(y,"NOTIFICAÇÕES / DEMONSTRAÇÃO","O que dizer com precisão",[
    "<b>Primeira consulta:</b> estabelece a referência; não notifica os eventos antigos. Envie o sensor depois de o app estar sincronizado.",
    "<b>Celular:</b> a central oferece Ativar notificações. As notificações são locais, com o app em execução. Na web, os alertas ficam dentro do aplicativo; não há push remoto em segundo plano.",
    "<b>Simulador:</b> só existe com modo demo ativo e permite uma leitura a cada 5 segundos. Resposta 429 significa aguardar antes de repetir."],tint=True)
footer(4,y)

y=header(5,"Vídeo: queda e reconexão", "Trecho planejado: 3:15 a 5:00. Esta é a comprovação central de disponibilidade pedida no enunciado: pare o backend de verdade e mostre a recuperação.")
y=scene(y,6,"3:15-3:55","Pare somente o backend", "Deixe o app no topo de Visão geral. No Terminal 1, pressione Ctrl+C e espere encerrar. Mantenha Expo e app abertos. Aguarde até cerca de 8 segundos; mostre Desconectado, o aviso e o horário dos dados salvos. Navegue para provar que não travou.",
    "'Parei apenas o backend. O app percebe a falha e identifica que os dados são da consulta anterior. A interface continua funcionando, e o cache não é apresentado como nova leitura.'",
    "Aviso de falha real e navegação preservada. O GET opcional abaixo deve falhar.",
    ["curl.exe --max-time 3 http://localhost:8080/api/events"])
y=scene(y,7,"3:55-4:40","Reinicie e acompanhe a recuperação", "No Terminal 1, dentro de backend/, execute o comando. Após Started UrbanRiskApplication, mantenha a câmera no app: ele mostra Conexão restabelecida por alguns segundos e volta a Conectado. Compare o ID do cadastro da cena 4.",
    "'Com a API de volta, o app reconecta automaticamente. O registro continua com o mesmo ID porque o banco é persistente. Não precisei reiniciar o aplicativo.'",
    "Recuperação automática e dados preservados. Se acelerar o tempo de boot no vídeo, identifique o corte.",
    ["mvn spring-boot:run"])
y=scene(y,8,"4:40-5:00","Finalize e prepare a entrega", "Mostre Fontes de dados, os testes no README e encerre no painel conectado. Depois de gravar, publique o vídeo e acrescente a URL verdadeira no README.",
    "'Organizamos três origens com confiança e prioridade explicáveis. Validamos API, cliente HTTP e recuperação da conexão. As duas stacks e instruções estão no repositório. A demonstração usa dados simulados.'",
    "Envie ENTREGA_GS.txt ao portal FIAP até 19/11/2026 às 23h55. Se usar YouTube, prefira Não listado. O roteiro Markdown no repositório inclui diagnóstico de problemas.")
footer(5,y)
c.save()
print(OUT)
