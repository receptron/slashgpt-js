import { replate_template } from "@/function/utils";

export const get_url_params = (__url: string, __headers: Record<string, string>, __appkey_value: string, http_arguments: Record<string, string>) => {
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
