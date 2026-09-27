import { Manifest } from "@/index";
import { LlmModel } from "@/llms/model";
import { resolve_model_data } from "@/llms/model_resolution";
import { LLMEngineOpenAIGPT, LLMEngineAnthropic, LLMEngineHuggingface, LLMEngineGroq, LLMEngineReplicate } from "@/llms/engines";

import test from "node:test";
import assert from "node:assert";

const dummy_key_env = ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "HF_API_KEY", "GROQ_API_KEY", "REPLICATE_API_KEY"];
dummy_key_env.forEach((name) => {
  process.env[name] = process.env[name] || "dummy-key-for-test";
});

const manifestFor = (model: string | undefined) => {
  const data = { title: "", about: "", bot: "", temperature: 0.7, prompt: [], actions: {}, sample: "" };
  // a manifest file may omit "model"; ManifestData cannot express that, so build it from JSON
  return new Manifest(JSON.parse(JSON.stringify({ ...data, model })));
};

type Expected = { engine: string; model_name: string; api_key: string; max_token: number; engineClass: abstract new (...args: never[]) => unknown };

const gpt: Expected = { engine: "openai-gpt", model_name: "gpt-3.5-turbo", api_key: "OPENAI_API_KEY", max_token: 4096, engineClass: LLMEngineOpenAIGPT };
const claude: Expected = {
  engine: "anthropic",
  model_name: "claude-3-opus-20240229",
  api_key: "ANTHROPIC_API_KEY",
  max_token: 1024,
  engineClass: LLMEngineAnthropic,
};
const mistral: Expected = {
  engine: "huggingface",
  model_name: "mistralai/Mistral-7B-Instruct-v0.2",
  api_key: "HF_API_KEY",
  max_token: 4096,
  engineClass: LLMEngineHuggingface,
};
const groq: Expected = { engine: "groq", model_name: "mixtral-8x7b-32768", api_key: "GROQ_API_KEY", max_token: 1024, engineClass: LLMEngineGroq };
const replicate: Expected = { engine: "replicate", model_name: "stability-ai", api_key: "REPLICATE_API_KEY", max_token: 1024, engineClass: LLMEngineReplicate };

const cases: [string | undefined, Expected][] = [
  [undefined, gpt],
  ["", gpt],
  ["gpt-3.5-turbo", gpt],
  ["gpt-3.5-turbo-16k", gpt],
  ["gpt-4", gpt],
  ["gpt", gpt],
  ["claude-3-opus-20240229", claude],
  ["claude-3-opus-20240229-v2", claude],
  ["claude-2", claude],
  ["claude", claude],
  ["mistralai/Mistral-7B-Instruct-v0.2", mistral],
  ["mixtral-8x7b-32768", groq],
  ["stability-ai", replicate],
  ["stability-ai/sdxl", replicate],
];

cases.forEach(([model, expected]) => {
  test(`LlmModel picks ${expected.engine} for model ${JSON.stringify(model)}`, () => {
    const llm = new LlmModel(manifestFor(model), { apiKey: "dummy-key-for-test" });
    assert.deepStrictEqual(llm.model_data, {
      engine_name: expected.engine,
      model_name: expected.model_name,
      api_key: expected.api_key,
      max_token: expected.max_token,
    });
    assert.ok(llm["engine"] instanceof expected.engineClass);
    assert.strictEqual(llm.get_api_key(), process.env[expected.api_key]);
  });
});

["GPT-4", "Claude-3", "llama-3", "mistralai", "mixtral", "stability", " gpt-4", "o1-preview", "my-stability-ai", "x-gpt-3.5-turbo", "clip-vit", "gp-4"].forEach(
  (model) => {
    test(`LlmModel refuses unknown model ${JSON.stringify(model)}`, () => {
      assert.throws(() => new LlmModel(manifestFor(model), { apiKey: "dummy-key-for-test" }), /no llm engine/);
    });
  },
);

const table = [gpt, mistral, claude, groq, replicate];
const fragments = ["gpt", "GPT", "gpt-3.5-turbo", "claude", "claude-3-opus-20240229", "mistralai/Mistral-7B-Instruct-v0.2", "mixtral-8x7b-32768"];
const more_fragments = ["stability-ai", "stability", "-", "/", " ", "x", "0", "constructor", "__proto__", "", "cl", "gp", "é", "🙂"];
const generator_seed = 20260927;
const generator_rounds = 3000;

const seededModelNames = () => {
  const all = [...fragments, ...more_fragments];
  const state = { seed: generator_seed };
  const next = (n: number) => {
    state.seed = (state.seed * 1103515245 + 12345) % 2147483648;
    return state.seed % n;
  };
  return Array.from({ length: generator_rounds }, () => Array.from({ length: next(4) }, () => all[next(all.length)]).join(""));
};

const expectedFor = (model: string): Expected | undefined => {
  const by_table = table.find((entry) => (model || gpt.model_name).startsWith(entry.model_name));
  if (by_table) return by_table;
  if (model.startsWith("gpt")) return gpt;
  if (model.startsWith("claude")) return claude;
  return undefined;
};

test(`resolve_model_data and LlmModel agree with the lookup rule over generated names (seed ${generator_seed})`, () => {
  seededModelNames().forEach((model) => {
    const expected = expectedFor(model);
    if (!expected) {
      assert.throws(() => resolve_model_data(model), /no llm engine/, model);
      assert.throws(() => new LlmModel(manifestFor(model), { apiKey: "dummy-key-for-test" }), /no llm engine/, model);
      return;
    }
    const resolved = resolve_model_data(model);
    assert.strictEqual(resolved.engine_name, expected.engine, model);
    assert.strictEqual(resolved.api_key, expected.api_key, model);
    assert.strictEqual(resolve_model_data(model), resolved, model);
    const llm = new LlmModel(manifestFor(model), { apiKey: "dummy-key-for-test" });
    assert.strictEqual(llm.model_data, resolved, model);
    assert.ok(llm["engine"] instanceof expected.engineClass, model);
  });
});

test("resolve_model_data treats a missing model name as the default gpt model", () => {
  assert.deepStrictEqual(resolve_model_data(undefined), resolve_model_data("gpt-3.5-turbo"));
  assert.strictEqual(resolve_model_data(""), resolve_model_data(undefined));
});
