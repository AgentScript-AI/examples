import { anthropic } from '@ai-sdk/anthropic';
import fs from 'fs-extra';

import { defineToolModule, inferAgent, refineTools, renderRuntime } from 'agentscript-ai';

import { loadShopwareTools, runAgent } from './utils.ts';

// Then we define the language model
// const model = google('gemini-2.0-flash-001');
const model = anthropic('claude-3-5-sonnet-latest');

// Define a task for the agent
const prompt = 'Update prices for all products, so that gross price ends with .99';

const shopwareTools = await loadShopwareTools();

// Refine the tools to make them more specific and accurate for the task
// This is optional, but it can help the LLM to generate more accurate and specific code
// and makes the context window smaller.
const shopwareToolsRefined = await refineTools({
    tools: shopwareTools,
    model,
    prompt,
    systemPrompt: ['To get product prices ALWAYS load products, not prices directly.'],
});

const tools = defineToolModule({
    shopware: shopwareToolsRefined,
});

const runtime = renderRuntime({
    tools,
});

// Save the runtime to a file for inspection
await fs.outputFile('codegen/runtime.d.ts', runtime.code);

// Let the LLM infer the agent based on the prompt and runtime
const agent = await inferAgent({
    model,
    tools,
    prompt,
    systemPrompt: [
        'When updating anything, pass only fields that changed.',
        'Do not use associations, use "fields" parameter instead.',
        'Product price array may be empty, do not update if that is the case.',
    ],
});

// Save the agent to a file for inspection and reuse
await fs.outputFile('codegen/agent.js', agent.script.code);

// We have the agent ready, but it's not yet executed
await runAgent(agent);
