import { anthropic } from '@ai-sdk/anthropic';
import chalk from 'chalk';

import { defineTool, executeAgent, inferAgent, planMetadata } from 'agentscript-ai';
import * as s from 'agentscript-ai/schema';

// First we define some tools
const add = defineTool({
    description: 'Add two numbers',
    input: {
        a: s.number(),
        b: s.number(),
    },
    output: s.number(),
    handler: ({ input }) => input.a + input.b,
});

const multiply = defineTool({
    description: 'Multiply two numbers',
    input: {
        a: s.number(),
        b: s.number(),
    },
    output: s.number(),
    handler: ({ input }) => input.a * input.b,
});

const divide = defineTool({
    description: 'Divide two numbers',
    input: {
        a: s.number(),
        b: s.number(),
    },
    output: s.number(),
    handler: ({ input }) => input.a / input.b,
});

const square = defineTool({
    description: 'Square a number',
    input: {
        a: s.number(),
    },
    output: s.number(),
    handler: ({ input }) => input.a * input.a,
});

const squareRoot = defineTool({
    description: 'Square root of a number',
    input: {
        a: s.number(),
    },
    output: s.number(),
    handler: ({ input }) => Math.sqrt(input.a),
});

// Then we define the language model
const model = anthropic('claude-3-5-sonnet-latest');

const tools = {
    add,
    multiply,
    divide,
    square,
    squareRoot,
};

// Define a task for the agent
const prompt = 'Calculate the square root of eight times two';

// Define the expected output
const output = s.number();

// Let the LLM infer the agent based on the prompt and runtime
const agent = await inferAgent({
    model,
    tools,
    output,
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
