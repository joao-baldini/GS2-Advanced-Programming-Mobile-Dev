package br.com.urbanrisk;

import br.com.urbanrisk.model.*;
import br.com.urbanrisk.service.PriorityService;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import static org.assertj.core.api.Assertions.*;

class PriorityServiceTest {
    private final PriorityService service=new PriorityService();
    private final Instant now=Instant.parse("2026-11-05T12:00:00Z");
    private RiskEvent event() {
        var e=new RiskEvent(); e.type=RiskType.FLOOD; e.severity=Severity.CRITICAL; e.source=SourceType.SENSOR;
        e.confidence=0.9; e.affectedPeople=1800; e.observedAt=now; return e;
    }
    @Test void criticalSensorIsPrioritizedWithExplanation() {
        var a=service.analyze(event(),now);
        assertThat(a.score()).isEqualTo(98); assertThat(a.level()).isEqualTo("CRITICAL"); assertThat(a.reasons()).hasSize(4);
    }
    @Test void oldReadingsLoseFreshnessPoints() {
        var e=event(); int fresh=service.analyze(e,now).score(); e.observedAt=now.minusSeconds(90000);
        assertThat(service.analyze(e,now).score()).isEqualTo(fresh-10);
    }
    @Test void resolvedEventHasZeroPriority() { var e=event(); e.status=EventStatus.RESOLVED; assertThat(service.analyze(e,now).score()).isZero(); }
    @Test void communityTrustIsLowerThanSensorTrust() { assertThat(service.confidence(SourceType.COMMUNITY)).isLessThan(service.confidence(SourceType.SENSOR)); }
}
