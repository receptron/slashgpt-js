import Manifest from "@/manifest";
import ChatHistory from "@/chat_history";
import FunctionAction from "@/function/function_action";

class FunctionCall {
  private manifest: Manifest;
  private function_call_data: Record<string, string>;

  private function_action: FunctionAction | null;

  public function_name: string;
  public call_arguments: Record<string, string>;
  public tool_use_id: string | undefined;

  constructor(data: Record<string, string>, manifest: Manifest) {
    this.function_call_data = data;
    // console.log(this.function_call_data);
    this.manifest = manifest;

    this.function_name = this.name();
    const actions = this.manifest.actions();
    this.function_action = actions && actions[this.function_name] ? new FunctionAction(actions[this.function_name]) : null;

    this.call_arguments = this.get_call_arguments();
    this.tool_use_id = data.tool_use_id;
  }
  function_data() {
    return {
      function_name: this.function_name,
      call_arguments: this.call_arguments,
    };
  }
  name() {
    return this.function_call_data.name;
  }
  get_call_arguments() {
    const call_arguments = this.function_call_data.arguments;
    if (call_arguments && typeof call_arguments === "string") {
      try {
        return JSON.parse(call_arguments);
      } catch (e) {
        console.log(e);
      }
    }
    return call_arguments;
  }
  public async process_function_call(history: ChatHistory, verbose: boolean = false) {
    if (!this.function_name) {
      return {
        function_message: null,
        function_name: null,
        should_call_llm: false,
      };
    }
    const function_message = await (() => {
      if (this.function_action) {
        return this.function_action.call_api(this.function_name, this.call_arguments, this.manifest.base_dir);
      }
      return null;
    })();

    if (function_message) {
      const last = history.last_message();
      history.append_message({
        role: "function",
        content: function_message,
        name: this.function_name,
        id: last?.tool_use_id, // for tools
      });
    }
    const should_call_llm = !this.manifest.skip_function_result() && !!function_message;

    return {
      function_message,
      function_name: this.function_name,
      should_call_llm,
      call_arguments: this.call_arguments,
    };
  }
}

export default FunctionCall;
