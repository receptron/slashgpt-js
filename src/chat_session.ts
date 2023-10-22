import { ManifestData } from "./types";
import Manifest from "./manifest";
import ChatHistory from "./chat_history";
import ChatConfig from "./chat_config";
import LlmModel from "./llms/model";

class ChatSession {
  public username: string;
  public manifest: Manifest;
  public history: ChatHistory;
  public prompt: string;
  
  private llm_model: LlmModel;
  private config: ChatConfig;
  
  constructor(config: ChatConfig, manifest_data: ManifestData) {
    this.config = config;

    this.username = "you!"
    this.manifest = new Manifest(manifest_data, config.base_path);
    this.history = new ChatHistory();
    
    this.prompt = this.manifest.prompt_data()
    if (this.prompt) {
      this.append_message("system", this.prompt, true);
    }
    
    this.llm_model = new LlmModel();
  }
  
  botname() {
    return this.manifest.botname();
  }

  append_message(role: string, message: string, preset: boolean, name?: string) {
    this.history.append_message({"role": role, "content": message, "name": name, "preset": preset})
  }
  append_user_question(message: string) {
    const post_message = this.manifest.format_question(message);
    this.append_message("user", post_message, false);
  }

  async call_llm() {
    const messages = this.history.messages();
    await this.llm_model.generate_response(messages, this.manifest, true);
    // const {res, function_call} = { res:{}, function_call: process_function_call: () => {}};

    return {res: "", function_call: {}}
  }

  public async call_loop(callback: (callback_type: string, data: string) => void) {
    const { res, function_call } = await this.call_llm();

    if (res) {
      callback("bot", res)
    }
    if (function_call) {
      // not support emit yet.
      /*
      const {
        function_message,
        function_name,
        should_call_llm,
      } = function_call.process_function_call(
        self.history,
        true,
      )
      if (function_message) {
        callback("function", {function_name, function_message})
      }
      if (should_call_llm) {
        this.call_loop(callback)
      }
      */
    }
  }
}

export default ChatSession;