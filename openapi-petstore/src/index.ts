import fs from 'fs/promises';

import { anthropic } from '@ai-sdk/anthropic';
import chalk from 'chalk';

import { parseOpenApiDoc, toolsFromOpenApi } from '@agentscript-ai/openapi';
import { executeAgent, inferAgent, planMetadata, renderRuntime } from 'agentscript-ai';

const apiUrl = 'https://petstore3.swagger.io/api/v3';
const specUrl = 'https://petstore3.swagger.io/api/v3/openapi.json';
const specText = await fetch(specUrl).then(r => r.text());
const spec = await parseOpenApiDoc(specText);

// Then we define the language model
const model = anthropic('claude-3-5-sonnet-latest');

// Define a task for the agent
const prompt = 'I want to buy a dog';

const tools = toolsFromOpenApi({
    spec,
    baseUrl: apiUrl,
});

const runtime = renderRuntime({
    tools,
});

await fs.writeFile('runtime.d.ts', runtime.code);

// Let the LLM infer the agent based on the prompt and runtime
const agent = await inferAgent({
    model,
    tools,
    prompt,
});

// We have the agent ready, but it's not yet executed
console.log(chalk.green('Generated plan:'));
console.log(planMetadata(agent));
console.log();

console.log(chalk.green('Generated code:'));
console.log(agent.script.code);
console.log();

// Now execute the agent
await executeAgent({ agent });

// We can now inspect the agent variables and output
console.log(chalk.green('Agent variables:'));
console.log(agent.root.variables);
console.log();
