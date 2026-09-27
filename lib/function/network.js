"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphQLRequest = exports.http_request = void 0;
const url_params_1 = require("../function/url_params");
const graphql_request_1 = require("graphql-request");
const http_request = async (__url, method, __headers, __appkey_value, http_arguments) => {
    const { url, headers } = (0, url_params_1.get_url_params)(__url, __headers, __appkey_value, http_arguments);
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
        const { url } = (0, url_params_1.get_url_params)(__url, __headers, __appkey_value, http_arguments);
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
