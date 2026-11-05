package br.com.urbanrisk.service;

import br.com.urbanrisk.dto.*;
import br.com.urbanrisk.model.*;
import br.com.urbanrisk.repository.EventRepository;
import br.com.urbanrisk.repository.EventSpecifications;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.Instant;
import java.util.*;

@Service
@Transactional(readOnly=true)
public class EventService {
    private final EventRepository repository;
    private final PriorityService priority;
    public EventService(EventRepository repository, PriorityService priority) { this.repository=repository; this.priority=priority; }
    public record EventPage(List<EventView> items, long total, int page, int size, Instant serverTime) {}
    public EventPage list(RiskType type, EventStatus status, String neighborhood, int page, int size) {
        Specification<RiskEvent> spec = (root,q,cb) -> cb.conjunction();
        if(type != null) spec=spec.and((root,q,cb)->cb.equal(root.get("type"),type));
        if(status != null) spec=spec.and((root,q,cb)->cb.equal(root.get("status"),status));
        if(neighborhood != null && !neighborhood.isBlank()) spec=spec.and((root,q,cb)->cb.equal(cb.lower(root.get("neighborhood")),neighborhood.toLowerCase(Locale.ROOT)));
        Instant now=Instant.now();
        var result=repository.findAll(spec.and(EventSpecifications.prioritized(now)), PageRequest.of(page,size));
        var ranked=result.getContent().stream().map(e->EventView.of(e,priority.analyze(e,now))).toList();
        return new EventPage(ranked,result.getTotalElements(),page,size,now);
    }
    public EventView get(long id) { var e=find(id); return EventView.of(e,priority.analyze(e,Instant.now())); }
    private RiskEvent find(long id) { return repository.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Ocorrência não encontrada")); }
    @Transactional
    public EventView create(EventInput input) {
        RiskEvent e=new RiskEvent();
        e.title=input.title().trim(); e.description=input.description().trim(); e.type=input.type();
        e.severity=input.severity(); e.source=input.source(); e.sourceName=input.sourceName().trim();
        e.neighborhood=input.neighborhood().trim(); e.affectedPeople=input.affectedPeople();
        e.latitude=input.latitude(); e.longitude=input.longitude(); e.confidence=priority.confidence(input.source());
        e.basePriority=priority.baseScore(e);
        e.simulated=input.simulated(); e.measuredValue=input.measuredValue(); e.unit=input.unit();
        e.observedAt=input.observedAt()==null?Instant.now():input.observedAt(); e.createdAt=Instant.now();
        repository.save(e); return EventView.of(e,priority.analyze(e,Instant.now()));
    }
    @Transactional
    public EventView status(long id, EventStatus status) {
        var e=find(id); e.status=status; repository.save(e); return EventView.of(e,priority.analyze(e,Instant.now()));
    }
    public Map<String,Object> metrics() {
        var now=Instant.now();
        var byType=new LinkedHashMap<String,Long>();
        for(var t:RiskType.values()) byType.put(t.name(),repository.countByTypeAndStatusNot(t,EventStatus.RESOLVED));
        return Map.of("active",repository.countByStatusNot(EventStatus.RESOLVED),"critical",repository.count(EventSpecifications.critical(now)),
            "averageConfidence",repository.averageActiveConfidence(),"byType",byType,
            "total",repository.count(),"pollIntervalSeconds",5,"serverTime",now);
    }
}
