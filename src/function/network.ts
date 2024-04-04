import { replate_template } from "@/function/utils";
import { request, gql } from "graphql-request";

const get_url_params = (__url: string, __headers: Record<string, string>, __appkey_value: string, http_arguments: Record<string, string>) => {
  const appkey = { appkey: __appkey_value };
  const headers = Object.keys(__headers).reduce((tmp: Record<string, string>, key: string) => {
    tmp[key] = replate_template({ ...(http_arguments || {}), ...appkey }, __headers[key]);
    return tmp;
  }, {});

  const http_args = Object.keys(http_arguments).reduce((tmp: Record<string, string>, key: string) => {
    tmp[key] = encodeURIComponent(http_arguments[key]);
    return tmp;
  }, {});
  const url = replate_template({ ...http_args, ...appkey }, __url);
  return {
    url,
    headers,
  };
};

export const http_request = async (
  __url: string,
  method: string,
  __headers: Record<string, string>,
  __appkey_value: string,
  http_arguments: Record<string, string>,
) => {
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

export const graphQLRequest = async (__url: string, __headers: Record<string, string>, __appkey_value: string, http_arguments: Record<string, string>) => {
  try {
    const { url, headers } = get_url_params(__url, __headers, __appkey_value, http_arguments);

    const query = http_arguments["query"];
    const params = http_arguments["variables"];
    const document = gql`
      ${query}
    `;

    // console.log("GRAPH", query, params, url, headers, document);
    const data = await request(url, document);
    return JSON.stringify(data);
  } catch (e) {
    console.log(e);
    return "{}";
  }
};
