import { LlmUsage } from "@/types";

import Manifest from "@/manifest";
import FunctionCall from "@/function/function_call";

import { LLMEngineBase } from "@/llms/engines/base";
import { LlmModel } from "@/llms/model";

import Replicate from "replicate";
import EventSource from "eventsource";

export class LLMEngineReplicate extends LLMEngineBase {
  replicate: Replicate;
  llm_models: LlmModel;

  constructor(model: LlmModel, option?: any) {
    super();
    this.llm_models = model;
    const api_key = this.llm_models.get_api_key();
    this.replicate = api_key ? new Replicate({ auth: api_key }) : new Replicate();
  }
  async chat_completion(messages: any[], manifest: Manifest, verbose: boolean, callbackStraming?: (message: string) => void) {
    const model_name = manifest.model_name();

    const send_message = messages
      .filter((m) => {
        return ["user", "system", "function", "assistant"].includes(m.role);
      })
      .map((m) => m.content)
      .join("\n");

    const task = async (callback?: (message: string) => void) => {
      return new Promise(async (resolved, reject) => {
        try {
          const prediction = await this.replicate.predictions.create({
            model: model_name,
            version: "2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1",
            input: {
              prompt: send_message,
            },
            stream: true,
          });
          let content: string[] = [];
          if (prediction?.urls?.stream) {
            const source = new EventSource(prediction.urls.stream, {
              withCredentials: true,
            });

            source.addEventListener("output", (e) => {
              if (callback) {
                callback(e.data);
              }
              content.push(e.data);
            });

            source.addEventListener("done", (e) => {
              source.close();
              resolved(content.join(""));
            });
          }
        } catch (e) {
          reject(e);
        }
      });
    };

    const res = (await task(callbackStraming)) as string;

    return { role: "assistant", res, function_call: null, usage: null };
  }
}
