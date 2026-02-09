[![npm version](https://badge.fury.io/js/slashgpt.svg)](https://badge.fury.io/js/slashgpt)
# SlashGPT js

This is ported from Python. This runs in the browser and Node.js.
Unlike the Python version, it does not support chat in the cli. This is software used as a library.

It does not support the feature to execute Python native code.

The current status is...

## Supported manifest items
- *title* (string, **required**): Title for the user to see
- *about* (string, optional): About the manifest (URL, email, github id, or twitter id)
- *description* (string, optional): Human/LLM readable description of this agent
- *bot* (string, optional): Agent name. The default is Agent({agent_name}).
- *temperature* (number, optional): Temperature (the default is 0.7)
- *model* (string or dict, optional): LLM model (such as "gpt-4-613", the default is "gpt-3-turbo")
- *prompt* (array of strings, **required**): The system prompts which define the agent (required)
- *functions* (string or list, optional): string - location of the function definitions, list - function definitions
- *actions* (object, optional): Template-based function processor (see details below)
- *skip_function_result* (boolean): skip the chat completion right after the function call.


## Not supported manifest items

#### for chat
- *sample* or *smaple...* (string, optional): Sample question (type "/sample" to submit it as the user message)
- *you* (string, optional): User name. The default is You({agent_name}).
- *intro* (array of strings, optional): Introduction statements (will be randomly selected)

#### little used
- *form* (string): format string to extend user's query (e.g. "Write python code to {question}").
- *result_form* (string): format string to extend function call result.
- *list* (array of string, optional): {random} will put one of them randomly into the prompt

- *function_call* (string, optional): the name of tne function LLM should call
- *logprobs* (number, optional): Number of "next probable tokens" + associated log probabilities to return alongside the output
- *num_completions* (number, optional): Number of different completions to request from the model per prompt
- *resource* (string, optional): location of the resource file. Use {resource} to paste it into the prompt

#### Not supported by browser
- *embeddings* (object, optional):
  - *name* (string, optional): index name of the embedding vector database

#### for python
- *module* (string, optional): location of the Python script to be loaded for function calls
- *notebook* (boolean): create a new notebook at the beginning of each session (for code_palm2)


- *stream* (boolean, optional): Enable LLM output streaming (not yet implemented)