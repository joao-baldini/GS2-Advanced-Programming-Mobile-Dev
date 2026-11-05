package br.com.urbanrisk.repository;

import br.com.urbanrisk.model.RiskEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import br.com.urbanrisk.model.EventStatus;
import br.com.urbanrisk.model.RiskType;

public interface EventRepository extends JpaRepository<RiskEvent, Long>, JpaSpecificationExecutor<RiskEvent> {
    java.util.List<RiskEvent> findAllByBasePriority(int basePriority);
    long countByStatusNot(EventStatus status);
    long countByTypeAndStatusNot(RiskType type, EventStatus status);
    @Query("select coalesce(avg(e.confidence), 0) from RiskEvent e where e.status <> br.com.urbanrisk.model.EventStatus.RESOLVED")
    double averageActiveConfidence();
}
