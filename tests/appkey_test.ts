import FuctionAction from "@/function/function_action";
import { get_appkey_value } from "@/function/appkey";

import test from "node:test";
import assert from "node:assert";

const ENV_NAME = "SLASH_GPT_ENV_APPKEY_TEST";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather?q={location}&appid={appkey}";

const captureLogs = (run: () => unknown) => {
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...messages: unknown[]) => logs.push(messages.join(" "));
  try {
    return { result: run(), logs };
  } finally {
    console.log = originalLog;
  }
};

const appkeyFromAction = (envValue: string | undefined, appkey = "APPKEY_TEST", url = WEATHER_URL) => {
  if (envValue === undefined) {
    delete process.env[ENV_NAME];
  } else {
    process.env[ENV_NAME] = envValue;
  }
  const action = new FuctionAction({ type: "rest", url, appkey });
  try {
    return captureLogs(() => action["get_appkey_value"]());
  } finally {
    delete process.env[ENV_NAME];
  }
};

test("FuctionAction reads the key from SLASH_GPT_ENV_<appkey>", () => {
  assert.deepStrictEqual(appkeyFromAction("plain-key"), { result: "plain-key", logs: [] });
});

test("FuctionAction hands the key only to the host named in the env value", () => {
  assert.deepStrictEqual(appkeyFromAction("api.openweathermap.org,secret"), { result: "secret", logs: [] });
  assert.deepStrictEqual(appkeyFromAction("evil.example.com,secret"), {
    result: null,
    logs: ["Invalid appkey domain APPKEY_TEST in .env file."],
  });
});

test("FuctionAction returns the whole env value when it has more than one comma", () => {
  assert.deepStrictEqual(appkeyFromAction("api.openweathermap.org,secret,extra"), { result: "api.openweathermap.org,secret,extra", logs: [] });
});

test("FuctionAction warns and returns empty when the env value is missing", () => {
  assert.deepStrictEqual(appkeyFromAction(undefined), { result: "", logs: ["Missing APPKEY_TEST in .env file."] });
});

test("FuctionAction returns null without an appkey", () => {
  assert.deepStrictEqual(appkeyFromAction("plain-key", ""), { result: null, logs: [] });
});

const API_HOST = "api.example.com";
const API_URL = "https://api.example.com/v1?q={q}";

const appkeyFromEnv = (envValue: string | undefined, url = API_URL) => {
  const logs: string[] = [];
  const env = envValue === undefined ? {} : { SLASH_GPT_ENV_K: envValue };
  const result = get_appkey_value("K", url, env, (message) => logs.push(message));
  return { result, logs };
};

test("get_appkey_value returns the key for the matching host, as written", () => {
  assert.deepStrictEqual(appkeyFromEnv(`${API_HOST},secret`), { result: "secret", logs: [] });
  assert.deepStrictEqual(appkeyFromEnv(`${API_HOST}, secret `), { result: " secret ", logs: [] });
  assert.deepStrictEqual(appkeyFromEnv(`${API_HOST},`), { result: "", logs: [] });
});

test("get_appkey_value returns a value without a host part as it is", () => {
  assert.deepStrictEqual(appkeyFromEnv("secret"), { result: "secret", logs: [] });
  assert.deepStrictEqual(appkeyFromEnv("a,b,c"), { result: "a,b,c", logs: [] });
});

test("get_appkey_value refuses the key for any other host", () => {
  const refused = { result: null, logs: ["Invalid appkey domain K in .env file."] };
  assert.deepStrictEqual(appkeyFromEnv("evil.com,secret"), refused);
  assert.deepStrictEqual(appkeyFromEnv("API.EXAMPLE.COM,secret"), refused);
  assert.deepStrictEqual(appkeyFromEnv(`${API_HOST}.evil.com,secret`), refused);
  assert.deepStrictEqual(appkeyFromEnv(`${API_HOST},secret`, "https://evil.com/?h=api.example.com"), refused);
  assert.deepStrictEqual(appkeyFromEnv(",secret"), refused);
});

test("get_appkey_value handles a missing appkey, a missing env value and a broken url", () => {
  assert.strictEqual(get_appkey_value("", API_URL, { SLASH_GPT_ENV_: "x" }, assert.fail), null);
  assert.deepStrictEqual(appkeyFromEnv(undefined), { result: "", logs: ["Missing K in .env file."] });
  assert.deepStrictEqual(appkeyFromEnv(""), { result: "", logs: ["Missing K in .env file."] });
  assert.throws(() => appkeyFromEnv(`${API_HOST},secret`, "not a url"), TypeError);
  assert.deepStrictEqual(appkeyFromEnv("secret", "not a url"), { result: "secret", logs: [] });
});

test("get_appkey_value never hands a host-bound key to another host (generated)", () => {
  const seed = Number(process.env.APPKEY_TEST_SEED ?? Date.now() % 2147483648);
  const state = { seed };
  const rand = () => (state.seed = (state.seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const pick = <T>(items: T[]): T => items[Math.floor(rand() * items.length)];
  const hosts = [API_HOST, "API.EXAMPLE.COM", "evil.com", "", " ", "api.example.com.", "localhost"];
  const urls = [API_URL, "https://evil.com/", "http://localhost:8080/", "https://api.example.com./"];
  const GENERATED_CASES = 2000;
  Array.from({ length: GENERATED_CASES }).forEach(() => {
    const host = pick(hosts);
    const url = pick(urls);
    const key = pick(["secret", " s ", "0", ""]);
    const { result } = appkeyFromEnv(`${host},${key}`, url);
    const expected = host === new URL(url).hostname ? key : null;
    assert.strictEqual(result, expected, `seed=${seed} host=${JSON.stringify(host)} url=${url}`);
  });
});
