import fs from 'fs-extra';

import { parseScript } from '@agentscript-ai/parser';
import { createAgent, defineToolModule, renderRuntime } from 'agentscript-ai';

import { loadShopwareTools, runAgent } from './utils.ts';

const shopwareTools = await loadShopwareTools();

const tools = defineToolModule({
    shopware: shopwareTools,
});

// Load the agent code
const code = await fs.readFile('codegen/agent.js', 'utf-8');
const script = parseScript(code);

const runtime = renderRuntime({
    tools,
});

// Save the runtime to a file for inspection
await fs.outputFile('codegen/runtime.d.ts', runtime.code);

const agent = createAgent({
    tools,
    script,
});

// We have the agent ready, but it's not yet executed
await runAgent(agent);
