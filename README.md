![NPM Version](https://img.shields.io/npm/v/agentscript-ai)
![agentscript.ai](https://img.shields.io/badge/website-agentscript%2Eai-blue)

# AgentScript examples

AgentScript is a unique open-source framework for building re-act AI agents.

## How to use examples?

Start by installing all dependencies:

```
yarn
```

Create an `.env` file in the root (or per example). \
Since we are using Anthropic Claude model, all examples require Anthropic API:

```
ANTHROPIC_API_KEY=your-anthropic-api-key
```

Then go into example you would like to run and execute:

```
yarn start
```

Some examples may require additional env variables (if they use third party apis).\
Refer to their respective `README` files for details.
