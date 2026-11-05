import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeWeather } from '../import-public-weather.mjs';

const now = new Date('2026-11-05T12:00:00Z');
const payload = temperature => ({ current: { temperature_2m: temperature, time: '2026-11-05T11:45' }, current_units: { temperature_2m: '°C' } });

test('preserves external source, observation time, and absence of estimated population', () => {
  const event = normalizeWeather(payload(36.2), now);
  assert.equal(event.source, 'PUBLIC_DATA');
  assert.equal(event.simulated, false);
  assert.equal(event.severity, 'HIGH');
  assert.equal(event.affectedPeople, 0);
  assert.equal(event.observedAt, '2026-11-05T11:45:00.000Z');
});
test('mild temperature is classified as low severity', () => {
  assert.equal(normalizeWeather(payload(24), now).severity, 'LOW');
});
test('rejects missing values, wrong units and future data instead of fabricating readings', () => {
  assert.throws(() => normalizeWeather(payload(null), now), /inválidos/);
  assert.throws(() => normalizeWeather({ ...payload(30), current_units: { temperature_2m: '°F' } }, now), /inválidos/);
  assert.throws(() => normalizeWeather(payload(30), new Date('2026-11-05T10:00:00Z')), /futura/);
});
