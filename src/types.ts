export type { Manifest } from "@/manifest";

export type LlmUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

export type ManifestData = {
  title: string;
  about: string;
  bot: string;
  temperature: number;
  model: string;
  prompt: string[];
  actions?: any;
  sample: string;
  functions?: string | Record<string, string> | any;
  function_call?: string;
  skip_function_result?: boolean;
};

export type ChatDataContent = { type: string; text: string } | { type: string; image_url: { url: string } };

export type ChatData = {
  role: string;
  content: string | ChatDataContent[];
  name?: string;
  preset?: boolean;
  function_data?: any;
  usage?: LlmUsage | null;
  id?: string; // for "function";
  tool_use_id?: string; // for "function_result"
};
