import FuctionAction from "@/function/function_action";

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
