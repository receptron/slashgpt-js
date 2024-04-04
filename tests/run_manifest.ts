// put manifest file into manifests/main/
// json and yaml ( or yml) support.
// run script with open api key
// OPENAI_API_KEY=sk-xxxxxx npx ts-node -r tsconfig-paths/register tests/run_manifest.ts business.json

import { getFilePath, getBasePath } from "./common";
import { readManifestData } from "../src/file_utils";
import { callback } from "../src/simple_client";

import { ChatSession } from "../src/";
import { ChatConfig } from "../src/";

console.log(process.argv[2]);

const main = async () => {
  const manifest = readManifestData(getFilePath(process.argv[2]));
  const config = new ChatConfig(getBasePath());

  const session = new ChatSession(config, manifest);

  session.append_user_question(manifest.sample);
  await session.call_loop(callback);

  console.log(session.history);
};

main();
