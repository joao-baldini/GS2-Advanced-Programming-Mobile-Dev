package br.com.urbanrisk.config;

import br.com.urbanrisk.dto.*;
import br.com.urbanrisk.model.*;
import br.com.urbanrisk.repository.EventRepository;
import br.com.urbanrisk.service.EventService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import java.time.Instant;

@Component
@ConditionalOnProperty(name="app.demo-enabled",havingValue="true")
public class DemoData implements CommandLineRunner {
    private final EventRepository repository;
    private final EventService service;
    public DemoData(EventRepository repository, EventService service) { this.repository=repository; this.service=service; }
    @Override public void run(String... args) {
        if(repository.count()>0) return;
        seed("Nível do rio em atenção", "Leitura simulada registra elevação do nível do Tamanduateí. Evite travessias próximas às margens.", RiskType.FLOOD,Severity.CRITICAL,"Ipiranga",1200,-23.588,-46.608,SourceType.SENSOR,"Sensor fluviométrico UR-01 (simulado)",2.8,"m",4);
        seed("Calor intenso na região central", "Base pública simulada indica temperatura elevada e baixa circulação de ar. Reforce a hidratação.", RiskType.HEAT,Severity.HIGH,"Sé",2400,-23.550,-46.633,SourceType.PUBLIC_DATA,"Boletim meteorológico (base simulada)",36.4,"°C",12);
        seed("Interrupção no abastecimento de água", "Moradores relatam falta de água em parte do bairro. Informação comunitária ainda não verificada.", RiskType.SERVICE,Severity.HIGH,"Vila Mariana",650,-23.589,-46.636,SourceType.COMMUNITY,"Relato comunitário (simulado)",null,null,18);
        seed("Acúmulo de água na via", "Sensor simulado aponta lâmina d'água em trecho de baixa drenagem. Procure caminhos alternativos.", RiskType.FLOOD,Severity.HIGH,"Mooca",340,-23.560,-46.598,SourceType.SENSOR,"Sensor de drenagem UR-04 (simulado)",18.0,"cm",24);
        seed("Falta de energia no quarteirão", "Relato comunitário simulado de interrupção de energia. A confirmação depende da concessionária.", RiskType.SERVICE,Severity.MEDIUM,"Pinheiros",180,-23.566,-46.692,SourceType.COMMUNITY,"Relato comunitário (simulado)",null,null,45);
        seed("Temperatura em elevação", "Estação simulada registra aquecimento gradual. Acompanhe as condições nas próximas horas.", RiskType.HEAT,Severity.MEDIUM,"Santana",280,-23.502,-46.625,SourceType.SENSOR,"Estação ambiental UR-03 (simulada)",32.1,"°C",55);
        seed("Manutenção da rede de água", "Aviso de manutenção programada proveniente de base pública simulada.", RiskType.SERVICE,Severity.LOW,"Butantã",120,-23.571,-46.708,SourceType.PUBLIC_DATA,"Comunicado de serviço (base simulada)",null,null,90);
        seed("Ponto de atenção após a chuva", "Relato comunitário simulado de drenagem lenta. Sem confirmação de alagamento no momento.", RiskType.FLOOD,Severity.LOW,"Liberdade",40,-23.558,-46.635,SourceType.COMMUNITY,"Relato comunitário (simulado)",null,null,140);
    }
    private void seed(String title,String description,RiskType type,Severity severity,String area,int people,double lat,double lng,SourceType source,String name,Double value,String unit,int minutes) {
        service.create(new EventInput(title,description,type,severity,area,people,lat,lng,source,name,value,unit,Instant.now().minusSeconds(minutes*60L),true));
    }
}
