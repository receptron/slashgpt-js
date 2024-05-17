// import readline from "readline";
import { getFilePath, getBasePath } from "./common";
import { callback } from "../src/simple_client";

import { ChatSession } from "../src/";
import { ChatConfig } from "../src/";

const main = async () => {
  const manifest = {
    title: "groq",
    about: "",
    bot: "",
    prompt: [],
    model: "mixtral-8x7b-32768",
    language: ["ja"],
    sample: "Complete the equation 1+1= ,just the answer",
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
