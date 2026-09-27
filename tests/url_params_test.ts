import { http_request } from "@/function/network";

import test from "node:test";
import assert from "node:assert";

type SentRequest = { url: string; headers: unknown };

const sentBy = async (url: string, headers: Record<string, string>, appkey: string, args: Record<string, string>) => {
  const sent: SentRequest[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    sent.push({ url: String(input), headers: init?.headers });
    return new Response("ok", { status: 200 });
  };
  try {
    await http_request(url, "GET", headers, appkey, args);
  } finally {
    globalThis.fetch = originalFetch;
  }
  assert.strictEqual(sent.length, 1);
  return sent[0];
};

test("http_request encodes the arguments in the url but not the appkey", async () => {
  const sent = await sentBy("https://api.example.com/?q={q}&k={appkey}", {}, "a b&c", { q: "東京 & {x}" });
  assert.strictEqual(sent.url, "https://api.example.com/?q=%E6%9D%B1%E4%BA%AC%20%26%20%7Bx%7D&k=a b&c");
});

test("http_request fills headers with raw arguments and the appkey", async () => {
  const sent = await sentBy("https://api.example.com/", { Authorization: "Bearer {appkey}", "X-Q": "{q}/{q}" }, "k&1", { q: "a b" });
  assert.deepStrictEqual(sent.headers, { Authorization: "Bearer k&1", "X-Q": "a b/a b" });
});

test("http_request lets the appkey win over an argument named appkey", async () => {
  const sent = await sentBy("https://api.example.com/{appkey}", { H: "{appkey}" }, "real", { appkey: "fake" });
  assert.strictEqual(sent.url, "https://api.example.com/real");
  assert.deepStrictEqual(sent.headers, { H: "real" });
});

test("http_request expands placeholders that arrive inside header arguments, but not url arguments", async () => {
  const sent = await sentBy("https://api.example.com/?q={q}", { "X-Q": "{q}" }, "secret", { q: "{appkey}" });
  assert.strictEqual(sent.url, "https://api.example.com/?q=%7Bappkey%7D");
  assert.deepStrictEqual(sent.headers, { "X-Q": "secret" });
});
