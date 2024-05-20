"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphQLRequest = exports.http_request = void 0;
const utils_1 = require("../function/utils");
const graphql_request_1 = require("graphql-request");
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
const http_request = async (__url, method, __headers, __appkey_value, http_arguments) => {
    const { url, headers } = get_url_params(__url, __headers, __appkey_value, http_arguments);
    const response = await (async () => {
        if (method === "POST") {
            return await fetch(url, {
                method: "post",
                body: JSON.stringify({
                    ...http_arguments,
                    ...{ "Content-Type": "application/json" },
                }),
                headers,
            });
        }
        return await fetch(url, { headers });
    })();
    if (response.status === 200) {
        return response.text();
    }
    console.log("Got " + response.status + ":" + response.text() + "from " + __url);
    return null;
};
exports.http_request = http_request;
const graphQLRequest = async (__url, __headers, __appkey_value, http_arguments) => {
    try {
        const { url } = get_url_params(__url, __headers, __appkey_value, http_arguments);
        const query = http_arguments["query"];
        // const params = http_arguments["variables"];
        const document = (0, graphql_request_1.gql) `
      ${query}
    `;
        // console.log("GRAPH", query, params, url, headers, document);
        const data = await (0, graphql_request_1.request)(url, document);
        return JSON.stringify(data);
    }
    catch (e) {
        console.log(e);
        return "{}";
    }
};
exports.graphQLRequest = graphQLRequest;
