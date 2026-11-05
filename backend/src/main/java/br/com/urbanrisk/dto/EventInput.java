package br.com.urbanrisk.dto;

import br.com.urbanrisk.model.*;
import jakarta.validation.constraints.*;
import java.time.Instant;

public record EventInput(
    @NotBlank @Size(max=100) String title,
    @NotBlank @Size(max=600) String description,
    @NotNull RiskType type,
    @NotNull Severity severity,
    @NotBlank @Size(max=80) String neighborhood,
    @Min(0) @Max(10000000) int affectedPeople,
    @DecimalMin("-90") @DecimalMax("90") double latitude,
    @DecimalMin("-180") @DecimalMax("180") double longitude,
    @NotNull SourceType source,
    @NotBlank @Size(max=100) String sourceName,
    Double measuredValue,
    @Size(max=12) String unit,
    @PastOrPresent Instant observedAt,
    boolean simulated
) {}
