package br.com.urbanrisk.controller;

import br.com.urbanrisk.dto.*;
import br.com.urbanrisk.model.*;
import br.com.urbanrisk.service.EventService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.net.URI;
import java.util.Map;

@RestController @RequestMapping("/api") @Validated
public class EventController {
    private final EventService service;
    @Value("${app.ingestion-key}") private String ingestionKey;
    public EventController(EventService service) { this.service=service; }
    @GetMapping("/events") public EventService.EventPage list(@RequestParam(required=false) RiskType type,
        @RequestParam(required=false) EventStatus status, @RequestParam(required=false) @Size(max=80) String neighborhood,
        @RequestParam(defaultValue="0") @Min(0) @Max(1000000) int page, @RequestParam(defaultValue="100") @Min(1) @Max(100) int size) {
        return service.list(type,status,neighborhood,page,size);
    }
    @GetMapping("/events/{id}") public EventView get(@PathVariable long id) { return service.get(id); }
    @GetMapping("/dashboard") public Map<String,Object> metrics() { return service.metrics(); }
    @PostMapping("/events") public ResponseEntity<EventView> community(@Valid @RequestBody EventInput input) {
        if(input.source()!=SourceType.COMMUNITY) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Use a ingestão autenticada para sensores e bases públicas");
        return created(service.create(new EventInput(input.title(),input.description(),input.type(),input.severity(),input.neighborhood(),input.affectedPeople(),input.latitude(),input.longitude(),SourceType.COMMUNITY,"Relato comunitário",null,null,input.observedAt(),false)));
    }
    @PostMapping("/observations") public ResponseEntity<EventView> ingest(@RequestHeader(value="X-Ingestion-Key",defaultValue="") String key,@Valid @RequestBody EventInput input) {
        authorize(key); return created(service.create(input));
    }
    public record StatusInput(@NotNull EventStatus status) {}
    @PatchMapping("/events/{id}/status") public EventView status(@PathVariable long id,@RequestHeader(value="X-Ingestion-Key",defaultValue="") String key,@Valid @RequestBody StatusInput input) {
        authorize(key); return service.status(id,input.status());
    }
    private void authorize(String key) {
        if(ingestionKey.isBlank() || !MessageDigest.isEqual(key.getBytes(StandardCharsets.UTF_8),ingestionKey.getBytes(StandardCharsets.UTF_8)))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Chave de ingestão inválida");
    }
    private ResponseEntity<EventView> created(EventView event) { return ResponseEntity.created(URI.create("/api/events/"+event.id())).body(event); }
}
