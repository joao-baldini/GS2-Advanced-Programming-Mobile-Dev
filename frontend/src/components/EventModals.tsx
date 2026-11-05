import React, { useState } from "react";
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  Activity,
  Check,
  Clock3,
  ExternalLink,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react-native";
import { createReport } from "../services/api";
import { C, levelColors, s } from "../theme";
import { Level, RiskEvent, RiskType, levelLabels, typeLabels } from "../types";
import { Badge, Button, Field, fmt, RiskIcon } from "./ui";

export function DetailModal({
  event,
  error,
  onClose,
}: {
  event: RiskEvent | null;
  error: string;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={!!event}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.modalBackdrop}>
        <View style={[s.modalCard, { maxWidth: 620 }]}>
          <View style={s.modalHead}>
            <Text style={s.panelTitle}>Detalhes da ocorrência</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar detalhes"
              onPress={onClose}
              style={s.closeButton}
            >
              <X size={21} color={C.muted} />
            </Pressable>
          </View>
          {event && (
            <ScrollView contentContainerStyle={{ padding: 26, gap: 20 }}>
              {error !== "" && (
                <Text accessibilityRole="alert" style={{ color: C.amber }}>
                  {error}
                </Text>
              )}
              <View style={s.between}>
                <View style={s.row}>
                  <RiskIcon type={event.type} />
                  <Text style={s.small}>
                    {typeLabels[event.type]} · #{event.id}
                  </Text>
                </View>
                <Badge event={event} />
              </View>
              <Text style={s.detailTitle}>{event.title}</Text>
              <Text style={s.detailCopy}>{event.description}</Text>
              <View style={s.detailFacts}>
                {[
                  ["Bairro", event.neighborhood],
                  [
                    "Pessoas afetadas",
                    `${fmt(event.affectedPeople)} (estimativa)`,
                  ],
                  ["Origem", event.sourceName],
                  [
                    "Confiança estimada",
                    `${Math.round(event.confidence * 100)}%`,
                  ],
                  [
                    "Situação",
                    event.status === "ACTIVE"
                      ? "Ativa"
                      : event.status === "MONITORING"
                        ? "Em monitoramento"
                        : "Resolvida",
                  ],
                  [
                    "Leitura",
                    event.measuredValue == null
                      ? "Não informada"
                      : `${event.measuredValue} ${event.unit || ""}`,
                  ],
                  [
                    "Observação",
                    new Date(event.observedAt).toLocaleString("pt-BR"),
                  ],
                ].map(([label, value]) => (
                  <View style={s.fact} key={label}>
                    <Text style={s.small}>{label}</Text>
                    <Text style={s.factValue}>{value}</Text>
                  </View>
                ))}
              </View>
              <View style={s.analysisBox}>
                <View style={s.between}>
                  <View style={s.row}>
                    <Activity size={18} color={C.purple} />
                    <Text style={s.analysisTitle}>Análise de prioridade</Text>
                  </View>
                  <Text style={s.analysisScore}>
                    {event.analysis.score}
                    <Text style={{ fontSize: 13, color: C.muted }}>/100</Text>
                  </Text>
                </View>
                {event.analysis.reasons.map((r) => (
                  <View key={r} style={s.row}>
                    <Check size={14} color={C.purple} />
                    <Text style={s.detailCopy}>{r}</Text>
                  </View>
                ))}
              </View>
              <View style={s.recommendation}>
                <ShieldCheck size={21} color={C.green} />
                <Text style={[s.detailCopy, { flex: 1 }]}>
                  {event.analysis.recommendation}
                </Text>
              </View>
              {event.simulated && (
                <Text style={s.small}>
                  Dado simulado para demonstração acadêmica. Não representa uma
                  ocorrência confirmada na cidade.
                </Text>
              )}
              <Button
                secondary
                icon={ExternalLink}
                onPress={() => {
                  void Linking.openURL(
                    `https://www.openstreetmap.org/?mlat=${event.latitude}&mlon=${event.longitude}#map=15/${event.latitude}/${event.longitude}`,
                  );
                }}
              >
                Ver coordenadas no mapa
              </Button>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

export function ReportModal({
  visible,
  online,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  online: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [people, setPeople] = useState("");
  const [type, setType] = useState<RiskType>("FLOOD");
  const [severity, setSeverity] = useState<Level>("MEDIUM");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!title.trim() || !description.trim() || !neighborhood.trim()) {
      setError("Preencha o título, o bairro e a descrição da ocorrência.");
      return;
    }
    if (!/^\d+$/.test(people || "0") || Number(people) > 10000000) {
      setError("Informe uma estimativa inteira entre 0 e 10.000.000 pessoas.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createReport({
        title: title.trim(),
        description: description.trim(),
        neighborhood: neighborhood.trim(),
        type,
        severity,
        affectedPeople: Number(people || 0),
        latitude: -23.5505,
        longitude: -46.6333,
        source: "COMMUNITY",
        sourceName: "Relato comunitário",
      });
      setTitle("");
      setDescription("");
      setNeighborhood("");
      setPeople("");
      setType("FLOOD");
      setSeverity("MEDIUM");
      onSuccess();
    } catch {
      setError(
        "Não foi possível registrar na API. Seus campos foram mantidos; tente novamente após reconectar.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.modalBackdrop}>
        <View style={s.modalCard}>
          <View style={s.modalHead}>
            <Text style={s.panelTitle}>Registrar ocorrência</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar cadastro"
              onPress={onClose}
              style={s.closeButton}
            >
              <X size={21} color={C.muted} />
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 25, gap: 19 }}
          >
            <Text style={s.detailCopy}>
              Sua observação ajuda a comunidade. Informe o risco e evite incluir
              dados pessoais.
            </Text>
            <View style={{ gap: 8 }}>
              <Text style={s.fieldLabel}>Tipo de risco</Text>
              <View style={[s.row, { flexWrap: "wrap", gap: 8 }]}>
                {(Object.keys(typeLabels) as RiskType[]).map((t) => (
                  <Pressable
                    key={t}
                    accessibilityRole="button"
                    accessibilityState={{ selected: type === t }}
                    onPress={() => setType(t)}
                    style={[s.filter, type === t && s.filterActive]}
                  >
                    <RiskIcon type={t} size={16} />
                    <Text style={s.filterText}>{typeLabels[t]}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <Field
              label="Título da ocorrência *"
              value={title}
              onChange={setTitle}
              placeholder="Ex.: acúmulo de água na via"
              max={100}
            />
            <Field
              label="Bairro *"
              value={neighborhood}
              onChange={setNeighborhood}
              placeholder="Ex.: Ipiranga"
              max={80}
            />
            <Field
              label="O que você observou? *"
              value={description}
              onChange={setDescription}
              placeholder="Descreva a situação sem informar dados pessoais."
              max={600}
              multiline
            />
            <View style={{ gap: 8 }}>
              <Text style={s.fieldLabel}>Severidade observada</Text>
              <View style={[s.row, { flexWrap: "wrap", gap: 8 }]}>
                {(Object.keys(levelLabels) as Level[]).map((l) => (
                  <Pressable
                    key={l}
                    accessibilityRole="button"
                    accessibilityState={{ selected: severity === l }}
                    onPress={() => setSeverity(l)}
                    style={[
                      s.filter,
                      severity === l && {
                        backgroundColor: levelColors[l] + "12",
                        borderColor: levelColors[l],
                      },
                    ]}
                  >
                    <View
                      style={[s.dot, { backgroundColor: levelColors[l] }]}
                    />
                    <Text style={s.filterText}>{levelLabels[l]}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <Field
              label="Pessoas afetadas (estimativa opcional)"
              value={people}
              onChange={setPeople}
              placeholder="Ex.: 100"
              numeric
              max={8}
            />
            <Text style={s.small}>
              O registro será comunitário, com 60% de confiança estimada. O mapa
              usará o centro de São Paulo como referência aproximada; o bairro
              informado fica preservado.
            </Text>
            {!online && (
              <Text style={{ color: C.amber, fontSize: 13 }}>
                Backend desconectado. Seus campos são preservados nesta sessão.
              </Text>
            )}
            {error !== "" && (
              <Text
                accessibilityRole="alert"
                style={{ color: C.red, fontSize: 13, lineHeight: 20 }}
              >
                {error}
              </Text>
            )}
            <Button
              icon={saving ? Clock3 : Plus}
              disabled={saving}
              onPress={save}
            >
              {saving ? "Registrando…" : "Registrar ocorrência"}
            </Button>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
