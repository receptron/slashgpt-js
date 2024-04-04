import { print_bot } from "@/chat_utils";
import { ChatSession, ChatConfig } from "@/index";
import { readManifestData } from "@/file_utils";

export const callback = (callback_type: string, data: unknown) => {
  if (callback_type === "bot") {
    print_bot("bot", JSON.stringify(data));
  }
};

export const justRun = async (fileFullName: string) => {
  const manifest = readManifestData(fileFullName);
  const config = new ChatConfig("./");

  const session = new ChatSession(config, manifest);

  session.append_user_question(manifest.sample);
  await session.call_loop(callback);
  return session;
};
