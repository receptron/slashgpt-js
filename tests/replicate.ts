// import readline from "readline";
import { getBasePath } from "./common";
import { callback } from "../src/simple_client";

import { ChatSession } from "../src/";
import { ChatConfig } from "../src/";

const main = async () => {
  const manifest = {
    title: "replicate",
    about: "",
    bot: "",
    prompt: [],
    model: "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478",
    language: ["ja"],
    sample: "Explain how the universe works in 300 words or less.",
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
