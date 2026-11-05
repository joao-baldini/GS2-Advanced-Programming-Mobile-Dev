package br.com.urbanrisk.dto;

import br.com.urbanrisk.model.*;
import br.com.urbanrisk.service.PriorityService.Analysis;
import java.time.Instant;

public record EventView(Long id, String title, String description, RiskType type, SourceType source,
    String sourceName, Severity severity, EventStatus status, String neighborhood, int affectedPeople,
    double latitude, double longitude, double confidence, boolean simulated, Double measuredValue,
    String unit, Instant observedAt, Instant createdAt, Analysis analysis) {
    public static EventView of(RiskEvent e, Analysis a) {
        return new EventView(e.id,e.title,e.description,e.type,e.source,e.sourceName,e.severity,e.status,
            e.neighborhood,e.affectedPeople,e.latitude,e.longitude,e.confidence,e.simulated,e.measuredValue,
            e.unit,e.observedAt,e.createdAt,a);
    }
}
