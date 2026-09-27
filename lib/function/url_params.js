"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_url_params = void 0;
const utils_1 = require("../function/utils");
const get_url_params = (__url, __headers, __appkey_value, http_arguments) => {
    const appkey = { appkey: __appkey_value };
    const headers = Object.keys(__headers).reduce((tmp, key) => {
        tmp[key] = (0, utils_1.replate_template)({ ...(http_arguments || {}), ...appkey }, __headers[key]);
        return tmp;
    }, {});
    const http_args = Object.keys(http_arguments).reduce((tmp, key) => {
        tmp[key] = encodeURIComponent(http_arguments[key]);
        return tmp;
    }, {});
    const url = (0, utils_1.replate_template)({ ...http_args, ...appkey }, __url);
    return {
        url,
        headers,
    };
};
exports.get_url_params = get_url_params;
