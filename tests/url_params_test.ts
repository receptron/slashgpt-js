import { http_request } from "@/function/network";
import { get_url_params } from "@/function/url_params";
import { replate_template } from "@/function/utils";

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

test("replate_template replaces every occurrence, in key order, and leaves unknown placeholders", () => {
  assert.strictEqual(replate_template({ a: "1", b: "2" }, "{a}{b}{a}{c}"), "121{c}");
  assert.strictEqual(replate_template({ a: "{b}", b: "x" }, "{a}"), "x");
  assert.strictEqual(replate_template({ b: "x", a: "{b}" }, "{a}"), "{b}");
  assert.strictEqual(replate_template({ a: "$&" }, "{a}"), "{a}");
  assert.strictEqual(replate_template({ a: "$$" }, "{a}"), "$");
  assert.strictEqual(replate_template({}, "{a}"), "{a}");
});

test("get_url_params encodes url arguments, keeps headers raw and lets the appkey win", () => {
  assert.deepStrictEqual(get_url_params("https://h/?q={q}&k={appkey}", { A: "{q}:{appkey}" }, "k 1", { q: "a b", appkey: "fake" }), {
    url: "https://h/?q=a%20b&k=k 1",
    headers: { A: "a b:k 1" },
  });
});

test("get_url_params lets replacement patterns in a raw value rewrite headers and the appkey, not url arguments", () => {
  assert.deepStrictEqual(get_url_params("https://h/?q={q}&k={appkey}", { A: "{q}", B: "{appkey}" }, "k$$", { q: "$&" }), {
    url: "https://h/?q=%24%26&k=k$",
    headers: { A: "{q}", B: "k$" },
  });
});

test("get_url_params throws without arguments object", () => {
  assert.throws(() => get_url_params("https://h/", {}, "k", null as unknown as Record<string, string>), TypeError);
});

test("get_url_params encodes each url argument and always sends the real appkey (generated)", () => {
  const seed = Number(process.env.URL_PARAMS_TEST_SEED ?? Date.now() % 2147483648);
  const state = { seed };
  const rand = () => (state.seed = (state.seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const pick = <T>(items: T[]): T => items[Math.floor(rand() * items.length)];
  const keys = ["q", "a", "constructor", "toString", "x y"];
  const values = ["", "0", "a b", "東京", "{q}", "{appkey}", "&=?/#%|", "$", "\u{1F600}"];
  const GENERATED_CASES = 2000;
  Array.from({ length: GENERATED_CASES }).forEach(() => {
    const args: Record<string, string> = {};
    keys.filter(() => rand() < 0.5).forEach((key) => (args[key] = pick(values)));
    if (rand() < 0.3) args.appkey = pick(values);
    const appkey = pick(values);
    const argKeys = Object.keys(args).filter((key) => key !== "appkey");
    const url = argKeys.map((key) => "{" + key + "}").join("|");
    const result = get_url_params(url, { K: "{appkey}" }, appkey, args);
    const context = `seed=${seed} args=${JSON.stringify(args)} appkey=${JSON.stringify(appkey)}`;
    assert.deepStrictEqual(result.headers, { K: appkey }, context);
    if (argKeys.length > 0) {
      assert.deepStrictEqual(
        result.url.split("|"),
        argKeys.map((key) => encodeURIComponent(args[key])),
        context,
      );
    }
  });
});
