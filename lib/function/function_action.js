"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const network_1 = require("../function/network");
const utils_1 = require("../function/utils");
class FuctionAction {
    constructor(function_action_data) {
        this.function_action_data = function_action_data;
    }
    async call_api(name, call_arguments, base_dir) {
        const callType = (this.function_action_data["type"] || "").toLowerCase();
        if (callType === "rest") {
            const appkey_value = this.get_appkey_value() || "";
            return await (0, network_1.http_request)(this.function_action_data["url"], this.function_action_data["method"], (this.function_action_data["headers"] || {}), appkey_value, call_arguments);
        }
        else if (callType === "graphql") {
            const appkey_value = this.get_appkey_value() || "";
            return (0, network_1.graphQLRequest)(this.function_action_data["url"], (this.function_action_data["headers"] || {}), appkey_value, call_arguments);
        }
        else if (callType === "data_url") {
            return this.read_dataURL_template(base_dir, this.function_action_data["template_message"], this.function_action_data["mime_type"], this.function_action_data["message"], call_arguments);
        }
        else if (callType === "message_template") {
            return (0, utils_1.replate_template)(call_arguments, this.function_action_data["message"]);
        }
        else if (callType === "emit") {
            console.log("emit");
        }
        else if (callType === "debug") {
            console.log(name, "arguments: " + JSON.stringify(call_arguments, null, "\t"));
            return null;
        }
        return "Success";
    }
    read_dataURL_template(base_dir, template_message, mime_type, message, call_arguments) {
        // console.log(base_dir, template_message, mime_type, message, call_arguments);
        const data = (0, utils_1.replate_template)(call_arguments, template_message);
        const dataURL = "data:" + mime_type + ";charset=utf-8," + encodeURIComponent(data);
        return (0, utils_1.replate_template)({ url: dataURL }, message);
    }
    get_appkey_value() {
        const appkey = this.function_action_data.appkey;
        const url = this.function_action_data.url;
        if (!appkey) {
            return null;
        }
        const appkey_value = process.env["SLASH_GPT_ENV_" + appkey] || "";
        if (!appkey_value) {
            console.log("Missing " + appkey + " in .env file.");
        }
        const param = appkey_value.split(",") || [];
        if (param.length === 2) {
            const parsed_url = new URL(url);
            if (param[0] != parsed_url.hostname) {
                console.log("Invalid appkey domain " + appkey + " in .env file.");
                return null;
            }
            return param[1];
        }
        return appkey_value;
    }
}
exports.default = FuctionAction;
