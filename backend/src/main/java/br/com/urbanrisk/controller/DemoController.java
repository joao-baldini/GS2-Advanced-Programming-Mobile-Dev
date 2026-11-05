package br.com.urbanrisk.controller;

import br.com.urbanrisk.dto.*;
import br.com.urbanrisk.model.*;
import br.com.urbanrisk.service.EventService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicLong;

@RestController @RequestMapping("/api/demo")
@ConditionalOnProperty(name="app.demo-enabled",havingValue="true")
public class DemoController {
    private final EventService service;
    private final AtomicLong lastReading=new AtomicLong(0);
    public DemoController(EventService service) { this.service=service; }
    @GetMapping("/status") public java.util.Map<String,Boolean> status() { return java.util.Map.of("enabled",true); }
    @PostMapping("/reading") public synchronized ResponseEntity<EventView> reading() {
        long now=System.currentTimeMillis();
        if(now-lastReading.get()<5000) return ResponseEntity.status(429).build();
        lastReading.set(now);
        return ResponseEntity.status(201).body(service.create(new EventInput("Alagamento detectado pelo sensor", "Nova leitura simulada: nível de água acima do limite de atenção. Demonstração de ingestão, priorização e atualização automática do aplicativo.",RiskType.FLOOD,Severity.CRITICAL,"Ipiranga",1800,-23.585,-46.610,SourceType.SENSOR,"Sensor UR-DEMO (simulado)",3.2,"m",Instant.now(),true)));
    }
}
