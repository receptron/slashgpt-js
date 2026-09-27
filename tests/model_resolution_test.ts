import { Manifest } from "@/index";
import { LlmModel } from "@/llms/model";
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
