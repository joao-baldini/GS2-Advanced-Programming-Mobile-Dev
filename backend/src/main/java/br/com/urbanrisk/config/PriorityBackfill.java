package br.com.urbanrisk.config;

import br.com.urbanrisk.repository.EventRepository;
import br.com.urbanrisk.service.PriorityService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Upgrades local development databases created before priority was materialized. */
@Component @Order(0)
public class PriorityBackfill implements CommandLineRunner {
    private final EventRepository repository;
    private final PriorityService priority;
    public PriorityBackfill(EventRepository repository, PriorityService priority) { this.repository=repository; this.priority=priority; }
    @Override @Transactional public void run(String... args) {
        for(var event: repository.findAllByBasePriority(0)) event.basePriority=priority.baseScore(event);
    }
}
