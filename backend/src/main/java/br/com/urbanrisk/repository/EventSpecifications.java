package br.com.urbanrisk.repository;

import br.com.urbanrisk.model.*;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import java.time.Instant;

public final class EventSpecifications {
    private EventSpecifications() {}
    public static Expression<Integer> score(Root<RiskEvent> root, CriteriaBuilder cb, Instant now) {
        Expression<Integer> freshness=cb.<Integer>selectCase()
            .when(cb.greaterThan(root.get("observedAt"),now.minusSeconds(31*60)),10)
            .when(cb.greaterThan(root.get("observedAt"),now.minusSeconds(121*60)),7)
            .when(cb.greaterThan(root.get("observedAt"),now.minusSeconds(1441*60)),3).otherwise(0);
        return cb.<Integer>selectCase().when(cb.equal(root.get("status"),EventStatus.RESOLVED),0)
            .otherwise(cb.sum(root.<Integer>get("basePriority"),freshness));
    }
    public static Specification<RiskEvent> prioritized(Instant now) {
        return (root,query,cb) -> {
            if(query != null && query.getResultType()!=Long.class && query.getResultType()!=long.class)
                query.orderBy(cb.desc(score(root,cb,now)),cb.desc(root.get("observedAt")),cb.desc(root.get("id")));
            return cb.conjunction();
        };
    }
    public static Specification<RiskEvent> critical(Instant now) { return (root,q,cb)->cb.greaterThanOrEqualTo(score(root,cb,now),80); }
}
