import { ManifestData } from "@/types";
import Manifest from "@/manifest";
import ChatHistory from "@/chat_history";
import ChatConfig from "@/chat_config";
import LlmModel from "@/llms/model";
import { LlmUsage, ChatDataContent } from "@/types";
import * as fs from "fs";

class ChatSession {
  public username: string;
  public manifest: Manifest;
  public history: ChatHistory;
  public prompt: string;

  private llm_model: LlmModel;
  private config: ChatConfig;

  constructor(config: ChatConfig, manifest_data: ManifestData, option?: Record<string, any>) {
    this.config = config;

    this.username = "you!";
    this.manifest = new Manifest(manifest_data, config.base_path);
    this.history = new ChatHistory();

    this.prompt = this.manifest.prompt_data();
    if (this.prompt) {
      this.append_message("system", this.prompt, true);
    }
    this.llm_model = new LlmModel(this.manifest, option);
  }

  botname() {
    return this.manifest.botname();
  }

  append_message(
    role: string,
    content: string | ChatDataContent[],
    preset: boolean,
    usage?: LlmUsage | null,
    name?: string,
    function_data?: any,
    tool_use_id?: string,
  ) {
    this.history.append_message({
      role,
      content,
      name,
      preset,
      function_data,
      usage,
      tool_use_id,
    });
  }
  append_user_question(message: string) {
    const post_message = this.manifest.format_question(message);
    this.append_message("user", post_message, false);
  }
  append_user_image(message: string, imagePath: string) {
    const base64Image = (() => {
      try {
        // Read the file as a binary buffer
        const imageBuffer = fs.readFileSync(imagePath);
        // Convert the buffer to a base64 string
        const base64String = imageBuffer.toString("base64");
        return base64String;
      } catch (error) {
        console.error("Error reading file:", error);
        throw error;
      }
    })();
    const post_message = this.manifest.format_question(message);
    this.append_message(
      "user",
      [
        {
          type: "text",
          text: post_message,
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${base64Image}`,
          },
        },
      ],
      false,
    );
  }

  async call_llm(callback: (callback_type: string, data: unknown) => void, callbackStraming?: (message: string) => void) {
    const messages = this.history.messages();
    const { role, res, function_call, usage } = await this.llm_model.generate_response(messages, this.manifest, true, callbackStraming);
    if (role && res) {
      this.append_message(role, res, false, usage);
    }
    if (res) {
      callback("bot", res);
    }

    return { function_call };
  }

  public async call_loop(callback: (callback_type: string, data: unknown) => void, callbackStraming?: (message: string) => void) {
    const { function_call } = await this.call_llm(callback, callbackStraming);

    if (function_call) {
      // for js original feature
      if (function_call.function_name) {
        this.append_message("function_result", "", false, null, "", function_call.call_arguments, function_call.tool_use_id);
      }
      // not support emit yet.
      const { function_message, function_name, should_call_llm } = await function_call.process_function_call(this.history, true);

      if (function_message) {
        callback("function", { function_name, function_message });
      }
      if (should_call_llm) {
        await this.call_loop(callback);
      }
    }
  }
}

export default ChatSession;
