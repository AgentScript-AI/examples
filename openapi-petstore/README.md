![NPM Version](https://img.shields.io/npm/v/agentscript-ai)
![agentscript.ai](https://img.shields.io/badge/website-agentscript%2Eai-blue)

# AgentScript simple tools example

AgentScript is a unique open-source framework for building re-act AI agents.

This example shows how to define and use tools in AgentScript.

## How to use

Start by installing all dependencies:

```
yarn
```

Create an `.env` file in the root (or in this directory). \
Since we are using Anthropic Claude model, it requires Anthropic API:

```
ANTHROPIC_API_KEY=your-anthropic-api-key
```

Execute the example:

```
yarn start
```

## Note

Not all language features are implemented in AgentScript yet. \
Sometimes LLM will generate a code that fails to parse. We are working on that! \
In this case just restart.
