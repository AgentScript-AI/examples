import { anthropic } from '@ai-sdk/anthropic';
import chalk from 'chalk';

import { LinearClient, searchIssues } from '@agentscript-ai/linear';
import { executeAgent, inferAgent, planMetadata } from 'agentscript-ai';
import * as s from 'agentscript-ai/schema';
import { addToDate, summarizeData } from 'agentscript-ai/tools';

// Configure the language model
const model = anthropic('claude-3-5-sonnet-latest');

// Configure the Linear client
const linear = LinearClient({
    apiKey: process.env.LINEAR_API_KEY,
});

// Define available tools.
const tools = {
    // Needed for date calculation
    addToDate,
    // Turns data into text
    summarizeData: summarizeData({ model }),
    // We'll wrap Linear tools in a namespace
    linear: {
        // Search issues in Linear
        // It's a tool that uses LLM to generate a Linear query and then executes it
        searchIssues: searchIssues({ model, linear }),
    },
};

// Define a task for the agent
const prompt = 'Give me a progress update of tasks created in the last month';

// Define the expected output
const output = s.string();

// Let the LLM infer the agent based on the prompt and runtime
const agent = await inferAgent({
    tools,
    output,
    model,
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

console.log(chalk.green('Agent output:'));
console.log(agent.output);
