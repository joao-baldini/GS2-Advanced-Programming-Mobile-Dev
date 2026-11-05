package br.com.urbanrisk;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:urbanrisk-test;DB_CLOSE_DELAY=-1","app.demo-enabled=false","app.ingestion-key=test-key"})
@AutoConfigureMockMvc
class ApiIntegrationTest {
    @Autowired MockMvc mvc;
    private String body(String source) { return """
        {"title":"Alagamento na via","description":"Água acumulada após chuva intensa.","type":"FLOOD","severity":"HIGH","neighborhood":"Ipiranga","affectedPeople":120,"latitude":-23.58,"longitude":-46.61,"source":"%s","sourceName":"Teste"}
        """.formatted(source); }
    @Test void communityCreatesAndReadsPersistedEvent() throws Exception {
        String json=mvc.perform(post("/api/events").contentType("application/json").content(body("COMMUNITY"))).andExpect(status().isCreated()).andExpect(jsonPath("confidence").value(0.6)).andExpect(jsonPath("simulated").value(false)).andReturn().getResponse().getContentAsString();
        var id=new com.fasterxml.jackson.databind.ObjectMapper().readTree(json).get("id").asLong();
        mvc.perform(get("/api/events/"+id)).andExpect(status().isOk()).andExpect(jsonPath("title").value("Alagamento na via"));
    }
    @Test void communityCannotImpersonateSensor() throws Exception { mvc.perform(post("/api/events").contentType("application/json").content(body("SENSOR"))).andExpect(status().isForbidden()); }
    @Test void ingestionRequiresKeyAndDerivesTrust() throws Exception {
        mvc.perform(post("/api/observations").contentType("application/json").content(body("PUBLIC_DATA"))).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/observations").header("X-Ingestion-Key","test-key").contentType("application/json").content(body("PUBLIC_DATA"))).andExpect(status().isCreated()).andExpect(jsonPath("confidence").value(0.95));
    }
    @Test void validationRejectsMalformedInputAndPagination() throws Exception {
        mvc.perform(post("/api/events").contentType("application/json").content("{}")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/events?size=10000")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/events?type=INVALID")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/events/999999")).andExpect(status().isNotFound());
    }
    @Test void statusChangesAreProtected() throws Exception {
        mvc.perform(patch("/api/events/1/status").contentType("application/json").content("{\"status\":\"RESOLVED\"}")).andExpect(status().isUnauthorized());
    }
    @Test void paginatedQueriesAreGloballyRankedAndMetricsAgree() throws Exception {
        mvc.perform(post("/api/events").contentType("application/json").content(body("COMMUNITY"))).andExpect(status().isCreated());
        mvc.perform(post("/api/observations").header("X-Ingestion-Key","test-key").contentType("application/json").content(body("SENSOR").replace("\"HIGH\"","\"CRITICAL\""))).andExpect(status().isCreated());
        var mapper=new com.fasterxml.jackson.databind.ObjectMapper();
        var first=mapper.readTree(mvc.perform(get("/api/events?size=1&page=0")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        var second=mapper.readTree(mvc.perform(get("/api/events?size=1&page=1")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        org.assertj.core.api.Assertions.assertThat(first.get("items").get(0).get("analysis").get("score").asInt()).isGreaterThanOrEqualTo(second.get("items").get(0).get("analysis").get("score").asInt());
        org.assertj.core.api.Assertions.assertThat(first.get("items").get(0).get("id")).isNotEqualTo(second.get("items").get(0).get("id"));
        mvc.perform(get("/api/dashboard")).andExpect(status().isOk()).andExpect(jsonPath("critical").isNumber()).andExpect(jsonPath("averageConfidence").isNumber());
        mvc.perform(get("/api/events?type=FLOOD&status=ACTIVE&neighborhood=Ipiranga")).andExpect(status().isOk()).andExpect(jsonPath("items[0].type").value("FLOOD"));
    }
    @Test void demoRoutesAreAbsentWhenDisabled() throws Exception { mvc.perform(post("/api/demo/reading")).andExpect(status().isNotFound()); }
    @Test void corsAllowsOnlyConfiguredBrowserOrigin() throws Exception {
        mvc.perform(options("/api/events").header("Origin","http://localhost:8081").header("Access-Control-Request-Method","GET")).andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin","http://localhost:8081"));
        mvc.perform(options("/api/events").header("Origin","https://unknown.example").header("Access-Control-Request-Method","GET")).andExpect(status().isForbidden());
    }
}
