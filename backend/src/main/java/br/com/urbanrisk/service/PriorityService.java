package br.com.urbanrisk.service;

import br.com.urbanrisk.model.*;
import java.time.*;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PriorityService {
    public record Analysis(int score, String level, List<String> reasons, String recommendation) {}
    public Analysis analyze(RiskEvent event, Instant now) {
        int severity = switch(event.severity) { case LOW -> 10; case MEDIUM -> 22; case HIGH -> 34; case CRITICAL -> 45; };
        int trust = (int)Math.round(event.confidence * 25);
        int impact = Math.min(20, (int)Math.round(Math.log10(Math.max(1, event.affectedPeople)) * 6));
        long ageMinutes = Math.max(0, Duration.between(event.observedAt, now).toMinutes());
        int freshness = ageMinutes <= 30 ? 10 : ageMinutes <= 120 ? 7 : ageMinutes <= 1440 ? 3 : 0;
        int score = event.status == EventStatus.RESOLVED ? 0 : Math.min(100, severity + trust + impact + freshness);
        String level = score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";
        String action = event.status == EventStatus.RESOLVED ? "Ocorrência encerrada. Consulte o histórico." : switch(event.type) {
            case FLOOD -> "Evite vias alagadas e procure rotas seguras. Em emergência, acione a Defesa Civil (199).";
            case HEAT -> "Hidrate-se, procure locais ventilados e acompanhe pessoas vulneráveis.";
            case SERVICE -> "Planeje alternativas e acompanhe os canais da concessionária responsável.";
        };
        return new Analysis(score, level, List.of("Severidade: " + severity + "/45", "Confiança da fonte: " + trust + "/25", "Impacto estimado: " + impact + "/20", "Recência: " + freshness + "/10"), action);
    }
    public double confidence(SourceType source) {
        return switch(source) { case SENSOR -> 0.90; case PUBLIC_DATA -> 0.95; case COMMUNITY -> 0.60; };
    }
    public int baseScore(RiskEvent event) {
        int severity = switch(event.severity) { case LOW -> 10; case MEDIUM -> 22; case HIGH -> 34; case CRITICAL -> 45; };
        int trust = (int)Math.round(event.confidence * 25);
        int impact = Math.min(20, (int)Math.round(Math.log10(Math.max(1,event.affectedPeople)) * 6));
        return severity + trust + impact;
    }
}
