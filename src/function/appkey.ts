type Env = Record<string, string | undefined>;
type Log = (message: string) => void;

export const get_appkey_value = (appkey: string, url: string, env: Env, log: Log) => {
  if (!appkey) {
    return null;
  }
  const appkey_value = env["SLASH_GPT_ENV_" + appkey] || "";
  if (!appkey_value) {
    log("Missing " + appkey + " in .env file.");
  }

  const param = appkey_value.split(",") || [];
  if (param.length === 2) {
    const parsed_url = new URL(url);
    if (param[0] != parsed_url.hostname) {
      log("Invalid appkey domain " + appkey + " in .env file.");
      return null;
    }
    return param[1];
  }
  return appkey_value;
};
