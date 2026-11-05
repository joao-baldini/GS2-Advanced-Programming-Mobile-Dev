import { pathToFileURL } from 'node:url';

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-23.5505&longitude=-46.6333&current=temperature_2m&timezone=GMT';

/** Public model output is an external estimate, not a street sensor measurement. */
export function normalizeWeather(payload, now = new Date()) {
  const temperature = payload?.current?.temperature_2m;
  const timestamp = payload?.current?.time;
  if (!Number.isFinite(temperature) || temperature < -60 || temperature > 60 ||
      payload?.current_units?.temperature_2m !== '°C' || typeof timestamp !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(timestamp)) {
    throw new Error('A fonte retornou temperatura, unidade ou horário inválidos. Nenhum registro foi enviado.');
  }
  const observed = new Date(timestamp + 'Z');
  if (!Number.isFinite(observed.getTime()) || observed > now || now - observed > 86400000) {
    throw new Error('A fonte retornou uma observação futura ou com mais de 24 horas. Nenhum registro foi enviado.');
  }
  return {
    title: `Monitoramento térmico da Sé: ${temperature.toFixed(1)} °C`,
    description: `Estimativa de temperatura a 2 m fornecida pelo modelo meteorológico Open-Meteo. Fonte: https://open-meteo.com/. Não confirma ilha de calor nem substitui a avaliação local. Pessoas afetadas não estimadas.`,
    type: 'HEAT',
    severity: temperature >= 40 ? 'CRITICAL' : temperature >= 35 ? 'HIGH' : temperature >= 30 ? 'MEDIUM' : 'LOW',
    neighborhood: 'Sé', affectedPeople: 0, latitude: -23.5505, longitude: -46.6333,
    source: 'PUBLIC_DATA', sourceName: 'Open-Meteo (modelo meteorológico público)',
    measuredValue: temperature, unit: '°C', observedAt: observed.toISOString(), simulated: false,
  };
}

export async function importWeather() {
  const base = (process.env.URBANRISK_API_URL || 'http://localhost:8080').replace(/\/$/, '');
  const key = process.env.INGESTION_KEY || 'urbanrisk-local-demo';
  const weather = await fetch(WEATHER_URL, { signal: AbortSignal.timeout(8000) });
  if (!weather.ok) throw new Error(`A fonte pública respondeu HTTP ${weather.status}. A API local não foi alterada.`);
  const observation = normalizeWeather(await weather.json());
  const headers = { 'Content-Type': 'application/json', 'X-Ingestion-Key': key };
  const response = await fetch(`${base}/api/observations`, { method: 'POST', headers, body: JSON.stringify(observation), signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`A ingestão respondeu HTTP ${response.status}. Confira o backend e INGESTION_KEY.`);
  const created = await response.json();
  // Normal conditions are retained for monitoring instead of being described as an emergency.
  if (observation.severity === 'LOW') {
    const status = await fetch(`${base}/api/events/${created.id}/status`, { method: 'PATCH', headers, body: JSON.stringify({ status: 'MONITORING' }), signal: AbortSignal.timeout(5000) });
    if (!status.ok) throw new Error(`Registro #${created.id} importado, mas não foi possível mudar o status para monitoramento.`);
  }
  console.log(`Base pública importada: #${created.id} | ${observation.measuredValue} °C | ${observation.observedAt} | simulated=false`);
  return created;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  importWeather().catch(error => { console.error(error.message); process.exitCode = 1; });
}
