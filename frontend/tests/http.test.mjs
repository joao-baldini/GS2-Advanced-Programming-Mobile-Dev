import { test } from "node:test";
import assert from "node:assert/strict";
import { requestJson } from "../src/services/http.ts";

test("accepts valid JSON returned by the backend", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(JSON.stringify({ items: [{ id: 7 }] }), { status: 200 }),
  );
  assert.deepEqual(await requestJson("http://api.test/events"), {
    items: [{ id: 7 }],
  });
});
test("HTTP failures do not become an empty successful list", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(JSON.stringify({ message: "Serviço indisponível" }), {
        status: 503,
      }),
  );
  await assert.rejects(
    requestJson("http://api.test/events"),
    /Serviço indisponível/,
  );
});
test("a stalled backend request is aborted so the interface can recover", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    (_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () =>
          reject(new Error("aborted")),
        );
      }),
  );
  await assert.rejects(
    requestJson("http://api.test/events", {}, undefined, 25),
    /aborted/,
  );
});
test("network failure rejects and the next request can reconnect", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    if (calls++ === 0) throw new TypeError("Failed to fetch");
    return new Response('{"restored":true}');
  });
  await assert.rejects(
    requestJson("http://api.test/events"),
    /Failed to fetch/,
  );
  assert.deepEqual(await requestJson("http://api.test/events"), {
    restored: true,
  });
});
