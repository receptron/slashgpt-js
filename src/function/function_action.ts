import { http_request, graphQLRequest } from "@/function/network";
import { replate_template } from "@/function/utils";
import { get_appkey_value } from "@/function/appkey";

class FuctionAction {
  private function_action_data: Record<string, string>;

  constructor(function_action_data: Record<string, string>) {
    this.function_action_data = function_action_data;
  }
  public async call_api(name: string, call_arguments: Record<string, string>, base_dir: string) {
    const callType = (this.function_action_data["type"] || "").toLowerCase();
    if (callType === "rest") {
      const appkey_value = this.get_appkey_value() || "";

      return await http_request(
        this.function_action_data["url"],
        this.function_action_data["method"],
        (this.function_action_data["headers"] || {}) as Record<string, string>,
        appkey_value,
        call_arguments,
      );
    } else if (callType === "graphql") {
      const appkey_value = this.get_appkey_value() || "";
      return graphQLRequest(
        this.function_action_data["url"],
        (this.function_action_data["headers"] || {}) as Record<string, string>,
        appkey_value,
        call_arguments,
      );
    } else if (callType === "data_url") {
      return this.read_dataURL_template(
        base_dir,
        this.function_action_data["template_message"],
        this.function_action_data["mime_type"],
        this.function_action_data["message"],
        call_arguments,
      );
    } else if (callType === "message_template") {
      return replate_template(call_arguments, this.function_action_data["message"]);
    } else if (callType === "emit") {
      console.log("emit");
    } else if (callType === "debug") {
      console.log(name, "arguments: " + JSON.stringify(call_arguments, null, "\t"));
      return null;
    }
    return "Success";
  }

  private read_dataURL_template(base_dir: string, template_message: string, mime_type: string, message: string, call_arguments: Record<string, unknown>) {
    // console.log(base_dir, template_message, mime_type, message, call_arguments);

    const data = replate_template(call_arguments, template_message);
    const dataURL = "data:" + mime_type + ";charset=utf-8," + encodeURIComponent(data);
    return replate_template({ url: dataURL }, message);
  }

  private get_appkey_value() {
    return get_appkey_value(this.function_action_data.appkey, this.function_action_data.url, process.env, console.log);
  }
}

export default FuctionAction;
