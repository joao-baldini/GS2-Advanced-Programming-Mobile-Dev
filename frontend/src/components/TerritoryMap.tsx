import React from "react";
import { Platform, Text, View } from "react-native";
import { Info, MapPin } from "lucide-react-native";
import Svg, { Circle, G, Path, Rect, Text as SvgText } from "react-native-svg";
import { C, riskColors, s } from "../theme";
import { RiskEvent } from "../types";
export function TerritoryMap({
  events,
  onSelect,
}: {
  events: RiskEvent[];
  onSelect: (e: RiskEvent) => void;
}) {
  return (
    <View style={s.map}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 720 380"
        preserveAspectRatio="xMidYMid slice"
        accessibilityLabel="Visão esquemática dos bairros de São Paulo com ocorrências da API"
      >
        <Rect width="720" height="380" fill="#EFF2F2" />
        <Path
          d="M0 0H130L195 78L128 140L0 112Z M480 0H720V88L624 105L540 65Z M465 280L570 250L680 325L720 380H490Z M0 250L78 226L117 288L90 380H0Z"
          fill="#E1EBDF"
        />
        <G fill="none" stroke="#FFFFFF" strokeWidth="13">
          <Path d="M-30 78L750 290M45 -30L360 420M250 -30L730 360M-30 310L640 -30M-20 188L750 82M180 420L745 180M430 -30L323 420M-10 362L740 337" />
        </G>
        <G fill="none" stroke="#E1E6E7" strokeWidth="2">
          <Path d="M-30 78L750 290M45 -30L360 420M250 -30L730 360M-30 310L640 -30M-20 188L750 82M180 420L745 180M430 -30L323 420M-10 362L740 337" />
        </G>
        <G fill="none" stroke="#FAFBFC" strokeWidth="5">
          <Path d="M0 35L720 223M0 130L720 355M0 260L670 0M0 340L720 50M110 0L430 380M330 0L670 380M550 0L440 380M140 380L245 0M0 215L720 130" />
        </G>
        <Path
          d="M-30 316C125 310 175 105 320 137S410 330 535 251S630 168 760 186"
          fill="none"
          stroke="#BCD8E7"
          strokeWidth="17"
        />
        <Path
          d="M-30 316C125 310 175 105 320 137S410 330 535 251S630 168 760 186"
          fill="none"
          stroke="#D0E5ED"
          strokeWidth="10"
        />
        <G fill="#8E9B9B" fontSize="11" fontFamily="Arial">
          <SvgText x="303" y="64">
            Santana
          </SvgText>
          <SvgText x="122" y="195">
            Pinheiros
          </SvgText>
          <SvgText
            x="321"
            y="187"
            fontWeight="bold"
            fontSize="15"
            fill="#66757B"
          >
            São Paulo
          </SvgText>
          <SvgText x="480" y="166">
            Mooca
          </SvgText>
          <SvgText x="390" y="321">
            Vila Mariana
          </SvgText>
          <SvgText x="544" y="304">
            Ipiranga
          </SvgText>
          <SvgText x="80" y="324">
            Butantã
          </SvgText>
          <SvgText x="312" y="235">
            Liberdade
          </SvgText>
        </G>
        {events
          .filter((e) => e.status !== "RESOLVED")
          .slice(0, 35)
          .map((e, i) => {
            const x =
              Math.max(
                30,
                Math.min(680, 70 + ((e.longitude + 46.72) / 0.14) * 570),
              ) +
              (i % 3) * 7;
            const y =
              Math.max(
                32,
                Math.min(340, 50 + ((-23.49 - e.latitude) / 0.12) * 265),
              ) +
              (i % 2) * 6;
            return (
              <G
                key={e.id}
                {...((Platform.OS === "web"
                  ? { onPress: null, onClick: () => onSelect(e) }
                  : { onPress: () => onSelect(e) }) as React.ComponentProps<
                  typeof G
                >)}
                accessibilityLabel={e.title}
              >
                <Circle
                  cx={x}
                  cy={y}
                  r={25}
                  fill={riskColors[e.type]}
                  opacity={0.09}
                />
                <Circle
                  cx={x}
                  cy={y}
                  r={13}
                  fill={riskColors[e.type]}
                  stroke="white"
                  strokeWidth="3"
                />
                <SvgText
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {e.type === "FLOOD" ? "≈" : e.type === "HEAT" ? "☀" : "ϟ"}
                </SvgText>
              </G>
            );
          })}
      </Svg>
      <View style={s.mapLabel}>
        <MapPin size={13} color={C.muted} />
        <Text style={s.small}>São Paulo, SP</Text>
      </View>
      <View style={s.mapNote}>
        <Info size={12} color={C.muted} />
        <Text style={[s.small, { fontSize: 10 }]}>
          Mapa esquemático · posições aproximadas
        </Text>
      </View>
    </View>
  );
}
