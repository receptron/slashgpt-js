// import readline from "readline";
import { getFilePath, getBasePath } from "./common";
import { callback } from "../src/simple_client";

import { ChatSession } from "../src/";
import { ChatConfig } from "../src/";

const main = async () => {
  const manifest = {
    title: "anthropic",
    about: "",
    bot: "",
    prompt: [],
    model: "claude-3-opus-20240229",
    language: ["ja"],
    sample: "日本の歴史を2000文字でまとめてください",
    temperature: 0.2,
    translator: true,
  };

  const config = new ChatConfig(getBasePath());
  const session = new ChatSession(config, manifest);

  session.append_user_question(manifest.sample);
  await session.call_loop(callback, (token: string) => {
    console.log(token);
  });

  console.log(session.history);
};

main();
