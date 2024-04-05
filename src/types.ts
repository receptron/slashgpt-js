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
  actions: any;
  sample: string;
  functions?: string | Record<string, string>;
  function_call?: string;
  skip_function_result?: boolean;
};

export type ChatData = {
  role: string;
  content: string;
  name?: string;
  preset?: boolean;
  function_data?: any;
  usage?: LlmUsage | null;
  id?: string; // for "function";
  tool_use_id?: string; // for "function_result"
};
