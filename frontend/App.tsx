import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { usePathname, useRouter, type Href } from "expo-router";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock3,
  Database,
  Info,
  Layers,
  LayoutDashboard,
  MapPin,
  Plus,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react-native";
import { useRiskContext } from "./src/context/RiskContext";
import { getEvent, simulateReading } from "./src/services/api";
import { enableNotifications } from "./src/services/notifications";
import {
  Level,
  RiskEvent,
  RiskType,
  levelLabels,
  typeLabels,
} from "./src/types";
import { C, levelColors, riskColors, s } from "./src/theme";
import {
  Button,
  Empty,
  EventRow,
  fmt,
  RiskIcon,
  time,
} from "./src/components/ui";
import { TerritoryMap } from "./src/components/TerritoryMap";
import { DetailModal, ReportModal } from "./src/components/EventModals";

const pages = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "events", label: "Ocorrências", icon: Layers },
  { id: "alerts", label: "Central de alertas", icon: Bell },
  { id: "sources", label: "Fontes de dados", icon: Database },
];
export default function App() {
  const { width } = useWindowDimensions();
  const desktop = width >= 1050,
    wide = width >= 1300;
  const feed = useRiskContext();
  const router = useRouter();
  const pathname = usePathname();
  const page = pathname === "/" ? "overview" : pathname.slice(1);
  const setPage = (next: string) =>
    router.replace((next === "overview" ? "/" : `/${next}`) as Href);
  const [filter, setFilter] = useState<RiskType | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<RiskEvent | null>(null);
  const [detailError, setDetailError] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [notice, setNotice] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(false);
  const events = feed.snapshot?.events || [],
    metrics = feed.snapshot?.metrics;
  const filtered = useMemo(
    () =>
      events.filter(
        (e) =>
          (filter === "ALL" || e.type === filter) &&
          `${e.title} ${e.neighborhood} ${e.description}`
            .toLocaleLowerCase("pt-BR")
            .includes(query.toLocaleLowerCase("pt-BR")),
      ),
    [events, filter, query],
  );
  const priority = filtered.filter(
    (e) => e.status !== "RESOLVED" && e.analysis.score >= 60,
  );
  const liveSelected = selected
    ? events.find((e) => e.id === selected.id) || selected
    : null;
  async function openDetail(event: RiskEvent) {
    setSelected(event);
    setDetailError("");
    try {
      setSelected(await getEvent(event.id));
    } catch {
      setDetailError(
        "Sem acesso à API. Você está vendo a última consulta salva.",
      );
    }
  }
  async function simulate() {
    setSimulating(true);
    setNotice("");
    try {
      await simulateReading();
      setNotice(
        "Leitura enviada à API. Aguarde a atualização automática do painel.",
      );
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : "Não foi possível enviar a leitura.",
      );
    } finally {
      setSimulating(false);
    }
  }
  const online = feed.status === "online";
  const nav = (
    <>
      {pages.map((p) => {
        const Icon = p.icon;
        return (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            accessibilityState={{ selected: page === p.id }}
            onPress={() => setPage(p.id)}
            style={[
              s.navItem,
              page === p.id && s.navActive,
              !desktop && { paddingHorizontal: 13 },
            ]}
          >
            <Icon
              size={19}
              color={page === p.id ? C.purple : C.muted}
              strokeWidth={1.8}
            />
            <Text
              style={[
                s.navText,
                page === p.id && { color: C.purple, fontWeight: "600" },
                !desktop && { fontSize: 12 },
              ]}
            >
              {p.label}
            </Text>
            {p.id === "alerts" && feed.alerts.length > 0 && (
              <View style={s.count}>
                <Text style={s.countText}>{feed.alerts.length}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </>
  );
  return (
    <View style={s.app}>
      <StatusBar style="dark" />
      {desktop && (
        <View style={s.sidebar}>
          <View style={s.brand}>
            <View style={s.brandIcon}>
              <Activity size={26} color="white" />
            </View>
            <View>
              <Text style={s.brandName}>
                urbanrisk<Text style={{ color: C.purple }}>.</Text>
              </Text>
              <Text style={s.brandSub}>Inteligência para proteger</Text>
            </View>
          </View>
          <Text style={s.navCaption}>Monitoramento urbano</Text>
          <View style={{ gap: 7 }}>{nav}</View>
          <View style={{ flex: 1 }} />
          <View style={s.sidebarTip}>
            <View style={s.row}>
              <ShieldCheck size={20} color={C.purple} />
              <Text style={s.tipTitle}>Cuidado que conecta</Text>
            </View>
            <Text style={s.tipCopy}>
              Informação confiável para decisões mais seguras na sua cidade.
            </Text>
            <View style={[s.row, { marginTop: 16 }]}>
              <View style={[s.dot, { backgroundColor: C.green }]} />
              <Text style={s.small}>Projeto Global Solution 2026</Text>
            </View>
          </View>
          <View style={s.profile}>
            <View style={s.avatar}>
              <Users size={18} color={C.purple} />
            </View>
            <View>
              <Text style={s.profileName}>Comunidade urbana</Text>
              <Text style={s.small}>Moradores e agentes locais</Text>
            </View>
          </View>
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View
          style={[
            s.topbar,
            !desktop && {
              paddingHorizontal: 18,
              paddingTop: Platform.OS === "ios" ? 52 : 20,
            },
          ]}
        >
          <View style={s.row}>
            {!desktop && <Activity size={24} color={C.purple} />}
            <Text style={s.topTitle}>
              {desktop ? "Urban Risk Intelligence Platform" : "urbanrisk."}
            </Text>
            {desktop && (
              <View style={s.globalTag}>
                <Text style={s.globalTagText}>Global Solution</Text>
              </View>
            )}
          </View>
          <View style={[s.row, { gap: 18 }]}>
            <View style={s.row}>
              {online ? (
                <Wifi size={14} color={C.green} />
              ) : (
                <WifiOff size={14} color={C.amber} />
              )}
              <Text
                style={[
                  s.small,
                  { color: online ? C.green : C.amber, fontWeight: "600" },
                ]}
              >
                {online
                  ? "Conectado"
                  : feed.status === "loading"
                    ? "Conectando"
                    : "Desconectado"}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir central de alertas"
              onPress={() => setPage("alerts")}
              style={s.bellButton}
            >
              <Bell size={20} color={C.muted} />
              {feed.alerts.length > 0 && <View style={s.bellDot} />}
            </Pressable>
          </View>
        </View>
        {!desktop && (
          <View style={s.mobileNav}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 4 }}
            >
              {nav}
            </ScrollView>
          </View>
        )}
        <ScrollView
          contentContainerStyle={[
            s.content,
            !desktop && { padding: 18, paddingBottom: 44 },
          ]}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={feed.refresh} />
          }
        >
          {feed.status === "offline" && (
            <View accessibilityRole="alert" style={s.offlineBanner}>
              <WifiOff size={20} color={C.amber} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[s.bannerTitle, { color: "#8A5F1D" }]}>
                  Backend desconectado
                </Text>
                <Text style={s.bannerCopy}>
                  {feed.snapshot
                    ? `Exibindo dados salvos em ${time(feed.snapshot.syncedAt)}. Eles podem estar desatualizados. Reconexão automática a cada 5 segundos.`
                    : "A API não está respondendo. A aplicação continua disponível e tenta reconectar a cada 5 segundos."}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tentar reconectar agora"
                onPress={feed.refresh}
              >
                <RefreshCw size={20} color={C.amber} />
              </Pressable>
            </View>
          )}
          {feed.reconnected && (
            <View
              accessibilityRole="alert"
              style={[
                s.offlineBanner,
                { backgroundColor: "#EAF7F1", borderColor: "#CDE7DB" },
              ]}
            >
              <CheckCircle2 size={20} color={C.green} />
              <Text style={[s.bannerTitle, { color: C.green }]}>
                Conexão restabelecida. Dados atualizados automaticamente.
              </Text>
            </View>
          )}
          {notice !== "" && (
            <View accessibilityRole="alert" style={s.notice}>
              <Info size={17} color={C.purple} />
              <Text style={{ flex: 1, color: C.purple, fontSize: 13 }}>
                {notice}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar aviso"
                onPress={() => setNotice("")}
              >
                <X size={16} color={C.purple} />
              </Pressable>
            </View>
          )}
          <View
            style={[
              s.pageHeading,
              !desktop && {
                flexDirection: "column",
                alignItems: "stretch",
                gap: 18,
              },
            ]}
          >
            <View style={{ gap: 7 }}>
              <View style={s.row}>
                <MapPin size={13} color={C.muted} />
                <Text style={s.small}>São Paulo, SP</Text>
                <View style={s.miniDot} />
                <Text style={s.small}>
                  {new Date().toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </View>
              <Text style={[s.pageTitle, !desktop && { fontSize: 27 }]}>
                {page === "overview"
                  ? "Sua cidade, mais segura."
                  : pages.find((p) => p.id === page)?.label}
              </Text>
              <Text style={s.subtitle}>
                {page === "overview"
                  ? "Acompanhe os riscos. Antecipe o cuidado."
                  : page === "events"
                    ? "Informação da cidade, organizada por prioridade."
                    : page === "alerts"
                      ? "Novos riscos que precisam da sua atenção."
                      : "Saiba de onde vem cada informação."}
              </Text>
            </View>
            <Button icon={Plus} onPress={() => setShowReport(true)}>
              Registrar ocorrência
            </Button>
          </View>
          {feed.status === "loading" && !feed.snapshot && (
            <View style={s.loading}>
              <ActivityIndicator color={C.purple} />
              <Text style={s.subtitle}>Consultando os dados da cidade…</Text>
            </View>
          )}
          {(page === "overview" || page === "events") && (
            <>
              <View style={[s.stats, !desktop && { gap: 10 }]}>
                {[
                  {
                    label: "Ocorrências ativas",
                    value: metrics ? fmt(metrics.active) : "—",
                    icon: Layers,
                    color: C.purple,
                    detail: "Riscos em acompanhamento",
                  },
                  {
                    label: "Prioridade crítica",
                    value: metrics ? fmt(metrics.critical) : "—",
                    icon: ShieldCheck,
                    color: C.red,
                    detail: "Atenção imediata",
                  },
                  {
                    label: "Confiança média",
                    value: metrics
                      ? `${Math.round(metrics.averageConfidence * 100)}%`
                      : "—",
                    icon: CheckCircle2,
                    color: C.green,
                    detail: "Estimativa por origem do dado",
                  },
                  {
                    label: "Tempo de atualização",
                    value: online ? `${feed.latency} ms` : "—",
                    icon: RefreshCw,
                    color: C.blue,
                    detail: "Consulta automática a cada 5 s",
                  },
                ].map((m, i) => (
                  <View
                    key={m.label}
                    style={[
                      s.stat,
                      !desktop && {
                        width: "48%",
                        flexBasis: "47%",
                        flexGrow: 1,
                        padding: 16,
                      },
                    ]}
                  >
                    <View style={s.between}>
                      <Text style={s.statLabel}>{m.label}</Text>
                      <m.icon size={18} color={m.color} strokeWidth={1.7} />
                    </View>
                    <Text
                      style={[
                        s.statValue,
                        i === 1 && { color: C.red },
                        !desktop && { fontSize: 27 },
                      ]}
                    >
                      {m.value}
                    </Text>
                    <Text style={s.small}>{m.detail}</Text>
                  </View>
                ))}
              </View>
              <View
                style={[
                  s.filterBar,
                  !desktop && {
                    alignItems: "stretch",
                    flexDirection: "column",
                  },
                ]}
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 7 }}
                  style={{ flexGrow: 0 }}
                >
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setFilter("ALL")}
                    style={[s.filter, filter === "ALL" && s.filterActive]}
                  >
                    <Layers
                      size={15}
                      color={filter === "ALL" ? C.purple : C.muted}
                    />
                    <Text
                      style={[
                        s.filterText,
                        filter === "ALL" && { color: C.purple },
                      ]}
                    >
                      Todos os riscos
                    </Text>
                  </Pressable>
                  {(Object.keys(typeLabels) as RiskType[]).map((t) => (
                    <Pressable
                      key={t}
                      accessibilityRole="button"
                      onPress={() => setFilter(t)}
                      style={[s.filter, filter === t && s.filterActive]}
                    >
                      <RiskIcon type={t} size={15} />
                      <Text
                        style={[
                          s.filterText,
                          filter === t && { color: C.purple },
                        ]}
                      >
                        {typeLabels[t]}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <View style={s.search}>
                  <Search size={16} color={C.muted} />
                  <TextInput
                    accessibilityLabel="Buscar ocorrência ou bairro"
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Buscar ocorrência ou bairro"
                    placeholderTextColor="#8B92A2"
                    style={s.searchInput}
                  />
                </View>
              </View>
            </>
          )}
          {page === "overview" && (
            <>
              <View style={[s.mainGrid, !wide && { flexDirection: "column" }]}>
                <View style={[s.panel, { flex: 1.6 }]}>
                  <View style={s.panelHead}>
                    <View>
                      <Text style={s.panelTitle}>Riscos no território</Text>
                      <Text style={[s.small, { marginTop: 5 }]}>
                        Uma visão dos eventos na sua cidade
                      </Text>
                    </View>
                    <View style={s.live}>
                      <View
                        style={[
                          s.dot,
                          { backgroundColor: online ? C.green : C.amber },
                        ]}
                      />
                      <Text style={[s.liveText, !online && { color: C.amber }]}>
                        {online ? "Atualização contínua" : "Última consulta"}
                      </Text>
                    </View>
                  </View>
                  <TerritoryMap events={filtered} onSelect={openDetail} />
                  <View style={s.legend}>
                    {(Object.keys(typeLabels) as RiskType[]).map((t) => (
                      <View key={t} style={s.row}>
                        <View
                          style={[s.dot, { backgroundColor: riskColors[t] }]}
                        />
                        <Text style={s.small}>{typeLabels[t]}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={[s.panel, { flex: 1 }]}>
                  <View style={s.panelHead}>
                    <View style={s.row}>
                      <View style={s.priorityIcon}>
                        <ShieldCheck size={17} color={C.red} />
                      </View>
                      <Text style={s.panelTitle}>Atenção prioritária</Text>
                    </View>
                    <Text style={s.small}>{priority.length} eventos</Text>
                  </View>
                  {priority.length ? (
                    priority
                      .slice(0, 3)
                      .map((e) => (
                        <EventRow
                          key={e.id}
                          compact
                          event={e}
                          onPress={() => openDetail(e)}
                        />
                      ))
                  ) : (
                    <Empty message="Nenhum risco prioritário nesta seleção." />
                  )}
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setPage("events")}
                    style={s.panelFooter}
                  >
                    <Text style={s.link}>Ver todas as ocorrências</Text>
                    <ArrowRight size={16} color={C.purple} />
                  </Pressable>
                </View>
              </View>
              <View
                style={[s.bottomGrid, !wide && { flexDirection: "column" }]}
              >
                <View style={[s.panel, { flex: 1.6 }]}>
                  <View style={s.panelHead}>
                    <Text style={s.panelTitle}>Últimas ocorrências</Text>
                    <Text style={s.small}>Mais recentes primeiro</Text>
                  </View>
                  {[...filtered]
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .slice(0, 3)
                    .map((e) => (
                      <EventRow
                        key={e.id}
                        event={e}
                        onPress={() => openDetail(e)}
                      />
                    ))}
                  {!filtered.length && (
                    <Empty
                      message={
                        feed.status === "offline"
                          ? "Aguardando a conexão com a API."
                          : "Nenhuma ocorrência encontrada."
                      }
                    />
                  )}
                </View>
                <View style={[s.panel, { flex: 1 }]}>
                  <View style={s.panelHead}>
                    <Text style={s.panelTitle}>Panorama dos riscos</Text>
                    <Activity size={18} color={C.muted} />
                  </View>
                  <View style={{ padding: 23, gap: 23 }}>
                    {(Object.keys(typeLabels) as RiskType[]).map((t) => {
                      const count = metrics?.byType[t] || 0;
                      return (
                        <View key={t} style={{ gap: 10 }}>
                          <View style={s.between}>
                            <View style={s.row}>
                              <RiskIcon type={t} size={17} />
                              <Text style={s.barLabel}>{typeLabels[t]}</Text>
                            </View>
                            <Text style={s.barCount}>{count}</Text>
                          </View>
                          <View style={s.barTrack}>
                            <View
                              style={[
                                s.barFill,
                                {
                                  backgroundColor: riskColors[t],
                                  width: `${metrics?.active ? (count / metrics.active) * 100 : 0}%`,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </>
          )}
          {page === "events" && (
            <View style={s.panel}>
              <View style={s.panelHead}>
                <Text style={s.panelTitle}>Ocorrências no território</Text>
                <View style={s.row}>
                  <ArrowDown size={14} color={C.muted} />
                  <Text style={s.small}>
                    Maior prioridade primeiro · {filtered.length}
                  </Text>
                </View>
              </View>
              {filtered.map((e) => (
                <EventRow key={e.id} event={e} onPress={() => openDetail(e)} />
              ))}
              {!filtered.length && (
                <Empty message="Nenhuma ocorrência corresponde à sua busca." />
              )}
            </View>
          )}
          {page === "alerts" && (
            <View style={s.panel}>
              <View style={[s.panelHead, { flexWrap: "wrap", gap: 12 }]}>
                <Text style={s.panelTitle}>Alertas recebidos nesta sessão</Text>
                <View style={s.row}>
                  <Button secondary onPress={feed.clearAlerts}>
                    Marcar como lidos
                  </Button>
                  {Platform.OS !== "web" && (
                    <Button
                      secondary
                      onPress={async () => {
                        try {
                          const ok = await enableNotifications();
                          setNotificationsOn(ok);
                          setNotice(
                            ok
                              ? "Notificações locais ativadas para novos alertas com o app em execução."
                              : "Permissão não concedida. Você pode acompanhar os alertas nesta tela.",
                          );
                        } catch {
                          setNotice(
                            "Notificações indisponíveis neste dispositivo. A central do app continua funcionando.",
                          );
                        }
                      }}
                    >
                      {notificationsOn
                        ? "Notificações ativadas"
                        : "Ativar notificações"}
                    </Button>
                  )}
                </View>
              </View>
              <View style={s.explanation}>
                <Info size={18} color={C.purple} />
                <Text style={s.explanationText}>
                  Novas ocorrências com prioridade alta ou crítica aparecem aqui
                  após a sincronização. A primeira consulta estabelece a
                  referência.{" "}
                  {Platform.OS === "web"
                    ? "Na prévia web, os avisos aparecem dentro do aplicativo."
                    : "Notificações locais funcionam com o app em execução; não há push em segundo plano."}
                </Text>
              </View>
              {feed.alerts.map((e) => (
                <EventRow
                  key={e.id}
                  event={events.find((current) => current.id === e.id) || e}
                  onPress={() => openDetail(e)}
                />
              ))}
              {!feed.alerts.length && (
                <Empty message="Tudo acompanhado por aqui. Novos alertas prioritários aparecerão automaticamente." />
              )}
            </View>
          )}
          {page === "sources" && (
            <View style={{ gap: 22 }}>
              <View
                style={[s.sourceGrid, !desktop && { flexDirection: "column" }]}
              >
                {[
                  {
                    type: "SENSOR",
                    title: "Sensores urbanos",
                    icon: Radio,
                    trust: 90,
                    copy: "Leituras de nível de água e temperatura, recebidas pela rota de ingestão autenticada.",
                  },
                  {
                    type: "PUBLIC_DATA",
                    title: "Bases públicas",
                    icon: Database,
                    trust: 95,
                    copy: "Boletins e registros externos normalizados pela mesma API, com identificação da origem.",
                  },
                  {
                    type: "COMMUNITY",
                    title: "Registros comunitários",
                    icon: Users,
                    trust: 60,
                    copy: "Ocorrências relatadas por moradores. São tratadas como informações não verificadas.",
                  },
                ].map((source) => (
                  <View key={source.type} style={[s.panel, s.sourceCard]}>
                    <View style={s.sourceIcon}>
                      <source.icon size={26} color={C.purple} />
                    </View>
                    <Text style={s.sourceTitle}>{source.title}</Text>
                    <Text style={s.sourceCopy}>{source.copy}</Text>
                    <View style={s.between}>
                      <Text style={s.small}>Confiança estimada</Text>
                      <Text style={s.sourceTrust}>{source.trust}%</Text>
                    </View>
                    <View style={s.barTrack}>
                      <View
                        style={[
                          s.barFill,
                          {
                            width: `${source.trust}%`,
                            backgroundColor: C.purple,
                          },
                        ]}
                      />
                    </View>
                    <Text style={s.small}>
                      {events.filter((e) => e.source === source.type).length}{" "}
                      registros nesta consulta
                    </Text>
                  </View>
                ))}
              </View>
              <View style={[s.panel, { padding: 25, gap: 16 }]}>
                <Text style={s.panelTitle}>Como a prioridade é calculada</Text>
                <Text style={s.sourceCopy}>
                  Análise multicritério explicável, de 0 a 100 pontos. O backend
                  combina severidade (até 45), confiança da fonte (até 25),
                  impacto populacional estimado (até 20) e recência (até 10). A
                  pontuação é recalculada nas consultas.
                </Text>
                <View style={[s.row, { flexWrap: "wrap", gap: 10 }]}>
                  {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as Level[]).map(
                    (l, i) => (
                      <View
                        key={l}
                        style={[
                          s.badge,
                          { backgroundColor: levelColors[l] + "12" },
                        ]}
                      >
                        <Text style={{ color: levelColors[l], fontSize: 12 }}>
                          {levelLabels[l]}:{" "}
                          {["80–100", "60–79", "40–59", "0–39"][i]}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
                <Text style={s.sourceCopy}>
                  A confiança representa uma hipótese por categoria de fonte, e
                  não uma probabilidade calibrada. Sensores podem falhar, bases
                  podem estar defasadas e relatos precisam de confirmação. A
                  análise apoia triagem e não substitui a Defesa Civil.
                </Text>
                <Text style={s.sourceCopy}>
                  Privacidade: o cadastro não pede nome, telefone ou documento.
                  Informe apenas o bairro e o contexto do risco; evite endereços
                  residenciais e outros dados pessoais.
                </Text>
              </View>
            </View>
          )}
          {feed.snapshot?.demoEnabled && (
            <View
              style={[
                s.demoStrip,
                !desktop && { flexDirection: "column", alignItems: "stretch" },
              ]}
            >
              <View style={[s.row, { flex: 1 }]}>
                <Radio size={19} color={C.purple} />
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={s.demoTitle}>Ambiente de demonstração</Text>
                  <Text style={s.small}>
                    Dados iniciais simulados e persistidos na API. Envie uma
                    leitura para acompanhar a atualização.
                  </Text>
                </View>
              </View>
              <Button
                secondary
                icon={simulating ? Clock3 : Plus}
                disabled={simulating || !online}
                onPress={simulate}
              >
                {simulating ? "Enviando…" : "Simular leitura"}
              </Button>
            </View>
          )}
          <View
            style={[
              s.footer,
              !desktop && {
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 8,
              },
            ]}
          >
            <View style={s.row}>
              <ShieldCheck size={14} color={C.muted} />
              <Text style={s.small}>
                Informação para cuidar. Tecnologia para prevenir.
              </Text>
            </View>
            <View style={s.row}>
              <Clock3 size={12} color={C.muted} />
              <Text style={s.small}>
                {feed.snapshot
                  ? `Última sincronização às ${time(feed.snapshot.syncedAt)}`
                  : "Aguardando primeira sincronização"}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
      <DetailModal
        event={liveSelected}
        error={detailError}
        onClose={() => setSelected(null)}
      />
      <ReportModal
        visible={showReport}
        online={online}
        onClose={() => setShowReport(false)}
        onSuccess={() => {
          setShowReport(false);
          setNotice(
            "Ocorrência registrada. Obrigado por ajudar a cuidar da cidade.",
          );
          void feed.refresh();
        }}
      />
    </View>
  );
}
