import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  ChevronRight,
  ShieldCheck,
  Sun,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react-native";
import { C, levelColors, riskColors, s } from "../theme";
import { RiskEvent, RiskType, levelLabels, sourceLabels } from "../types";
export const fmt = (value: number) => value.toLocaleString("pt-BR");
export const time = (value: string) =>
  new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
export function ago(value: string) {
  const n = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60000),
  );
  return n === 0
    ? "Agora"
    : n < 60
      ? `Há ${n} min`
      : n < 1440
        ? `Há ${Math.floor(n / 60)} h`
        : `Há ${Math.floor(n / 1440)} dias`;
}
export function RiskIcon({
  type,
  size = 19,
}: {
  type: RiskType;
  size?: number;
}) {
  const Icon = type === "FLOOD" ? Waves : type === "HEAT" ? Sun : Zap;
  return <Icon size={size} color={riskColors[type]} strokeWidth={1.8} />;
}
export function Button({
  children,
  onPress,
  secondary,
  disabled,
  icon: Icon,
}: {
  children: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.buttonSecondary,
        disabled && { opacity: 0.5 },
        pressed && { opacity: 0.78 },
      ]}
    >
      {Icon && <Icon size={17} color={secondary ? C.purple : "#fff"} />}
      <Text style={[s.buttonText, secondary && { color: C.purple }]}>
        {children}
      </Text>
    </Pressable>
  );
}
export function Badge({ event }: { event: RiskEvent }) {
  const color = levelColors[event.analysis.level];
  return (
    <View style={[s.badge, { backgroundColor: color + "12" }]}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={[s.badgeText, { color }]}>
        {levelLabels[event.analysis.level]}
      </Text>
    </View>
  );
}
export function EventRow({
  event,
  onPress,
  compact = false,
}: {
  event: RiskEvent;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver ${event.title}, prioridade ${levelLabels[event.analysis.level]}`}
      onPress={onPress}
      style={({ pressed }) => [s.eventRow, pressed && { opacity: 0.7 }]}
    >
      <View
        style={[
          s.eventIcon,
          { backgroundColor: riskColors[event.type] + "12" },
        ]}
      >
        <RiskIcon type={event.type} size={compact ? 19 : 22} />
      </View>
      <View style={{ flex: 1, gap: 7 }}>
        <View style={s.between}>
          <Text
            numberOfLines={2}
            style={[s.eventTitle, compact && { fontSize: 13 }]}
          >
            {event.title}
          </Text>
          {!compact && <Badge event={event} />}
        </View>
        <View style={[s.row, { flexWrap: "wrap", gap: 10 }]}>
          <Text style={s.small}>{event.neighborhood}</Text>
          <Text style={s.small}>{ago(event.observedAt)}</Text>
          {!compact && (
            <Text style={s.small}>
              {sourceLabels[event.source]} ·{" "}
              {Math.round(event.confidence * 100)}% de confiança
            </Text>
          )}
        </View>
        {compact && (
          <View style={s.between}>
            <Badge event={event} />
            <Text style={s.small}>{event.analysis.score}/100</Text>
          </View>
        )}
      </View>
      {!compact && <ChevronRight size={18} color="#A4AABB" />}
    </Pressable>
  );
}
export function Empty({ message }: { message: string }) {
  return (
    <View style={s.empty}>
      <ShieldCheck size={31} color="#B0A5DB" />
      <Text style={s.emptyText}>{message}</Text>
    </View>
  );
}
export function Field({
  label,
  value,
  onChange,
  placeholder,
  max,
  multiline,
  numeric,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  max: number;
  multiline?: boolean;
  numeric?: boolean;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9198A7"
        maxLength={max}
        multiline={multiline}
        keyboardType={numeric ? "number-pad" : "default"}
        style={[
          s.field,
          multiline && { minHeight: 100, textAlignVertical: "top" },
        ]}
      />
    </View>
  );
}
