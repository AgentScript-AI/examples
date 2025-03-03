import fs from 'fs/promises';

import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import chalk from 'chalk';

import { filterOperations, parseOpenApiDoc, toolsFromOpenApi } from '@agentscript-ai/openapi';
import { parseScript } from '@agentscript-ai/parser';
import { createAgent, executeAgent, inferAgent, planMetadata, renderRuntime } from 'agentscript-ai';

const apiUrl = String(process.env.SHOPWARE_API_URL);
const specUrl = `${apiUrl}/_info/openapi3.json`;

const clientId = String(process.env.SHOPWARE_CLIENT_ID);
const clientSecret = String(process.env.SHOPWARE_CLIENT_SECRET);

const authResponse = await fetch(`${apiUrl}/oauth/token`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
    }),
});

const auth = (await authResponse.json()) as { access_token: string };
const specText = await fetch(specUrl).then(r => r.text());
const spec = await parseOpenApiDoc(specText);

filterOperations(spec, {
    exclude: [
        '/oauth/token',
        '/_action/sync',
        /acl/,
        /product-export/,
        /product-search-config/,
        /product-configurator/,
        /app-payment-method/,
        /media/,
        /snippet/,
        /mail-template/,
        /import-export/,
        /plugin/,
        /state-machine/,
        /webhook/,
        /user-config/,
        /app-administration/,
        /app-action-button/,
        /app-template/,
        /script/,
        /user-recovery/,
        /document-base-config/,
        /seo/,
        /cms/,
        /theme/,
        /user-access/,
        /flow/,
        /aggregate/,
    ],
});

// Then we define the language model
const model = google('gemini-2.0-flash-001');
// const model = anthropic('claude-3-5-sonnet-latest');

// Define a task for the agent
const prompt = 'Update prices for all products, so that gross price ends with .99';

const tools = toolsFromOpenApi({
    spec,
    baseUrl: apiUrl,
    headers: {
        Authorization: `Bearer ${auth.access_token}`,
    },
});

const runtime = renderRuntime({
    tools,
});

await fs.writeFile('runtime.d.ts', runtime.code);
const code = `
// Get the first page of products
let productList = getProductList({ limit: 100, page: 1 });

// Check if there are any products
if (productList && productList.data) {
  // Iterate over the products
  productList.data.map(product => {
    // Get the product's prices
    let prices = product.price;

    // Check if the product has any prices
    if (prices && prices.length > 0) {
      // Iterate over the prices and increase them by 10%
      prices.map(price => {
        // Increase the gross and net prices by 10%
        price.gross = price.gross * 1.1;
        price.net = price.net * 1.1;

        // Check if listPrice exists and update it
        if (price.listPrice) {
          price.listPrice.gross = price.listPrice.gross * 1.1;
          price.listPrice.net = price.listPrice.net * 1.1;
        }

        // Check if regulationPrice exists and update it
        if (price.regulationPrice) {
          price.regulationPrice.gross = price.regulationPrice.gross * 1.1;
          price.regulationPrice.net = price.regulationPrice.net * 1.1;
        }
      });

      // Update the product with the new prices
      updateProductPrice({
        id: product.id,
        data: {
          price: prices
        }
      });
    }
  });
}`;

const script = parseScript(code);

// const agent = createAgent({
//     tools,
//     script,
// });

// Let the LLM infer the agent based on the prompt and runtime
const agent = await inferAgent({
    model,
    tools,
    prompt,
    systemPrompt: [
        'When updating anything, pass only fields that changed.',
        'Do not use associations, use "fields" parameter instead.',
        'To update prices, use updateProductPrice. Price array may be empty, do not update if that is the case.',
    ],
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
