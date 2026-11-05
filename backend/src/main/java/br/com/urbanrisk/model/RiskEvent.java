package br.com.urbanrisk.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "risk_events", indexes = @Index(name="idx_event_status_type_time", columnList="status,type,observedAt"))
public class RiskEvent {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
    @Column(nullable=false, length=100) public String title;
    @Column(nullable=false, length=600) public String description;
    @Enumerated(EnumType.STRING) @Column(nullable=false) public RiskType type;
    @Enumerated(EnumType.STRING) @Column(nullable=false) public SourceType source;
    @Column(nullable=false, length=100) public String sourceName;
    @Enumerated(EnumType.STRING) @Column(nullable=false) public Severity severity;
    @Enumerated(EnumType.STRING) @Column(nullable=false) public EventStatus status = EventStatus.ACTIVE;
    @Column(nullable=false, length=80) public String neighborhood;
    public int affectedPeople;
    public double latitude;
    public double longitude;
    public double confidence;
    public int basePriority;
    public boolean simulated;
    public Double measuredValue;
    @Column(length=12) public String unit;
    @Column(nullable=false) public Instant observedAt;
    @Column(nullable=false) public Instant createdAt;
    @Version public Long version;
}
