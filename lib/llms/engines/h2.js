"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inference_1 = require("@huggingface/inference");
const api_key = "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";
const main = async () => {
    let out = "";
    for await (const chunk of (0, inference_1.chatCompletionStream)({
        accessToken: api_key,
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [{ role: "user", content: "Complete the equation 1+1= ,just the answer" }],
        max_tokens: 500,
        temperature: 0.1,
        seed: 0,
    })) {
        console.log(chunk.choices[0].delta);
        if (chunk.choices && chunk.choices.length > 0) {
            out += chunk.choices[0].delta.content;
        }
    }
    console.log(out);
};
main();
