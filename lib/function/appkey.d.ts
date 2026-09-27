type Env = Record<string, string | undefined>;
type Log = (message: string) => void;
export declare const get_appkey_value: (appkey: string, url: string, env: Env, log: Log) => string | null;
export {};
