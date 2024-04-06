import { Manifest } from "@/index";

import test from "node:test";
import assert from "node:assert";

test("manifest test", () => {
  const manifest = new Manifest({
    title: "",
    about: "",
    bot: "",
    temperature: 0.7,
    model: "",
    prompt: [],
    actions: {},
    sample: "",
  });
  assert.strictEqual(manifest.botname(), "Agent()");
});
