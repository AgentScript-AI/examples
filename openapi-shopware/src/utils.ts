import chalk from 'chalk';

import { filterOpenApiDoc, parseOpenApiDoc, toolsFromOpenApi } from '@agentscript-ai/openapi';
import type { Agent } from 'agentscript-ai';
import { executeAgent, planMetadata } from 'agentscript-ai';

/**
 * Loads the shopware tools from the openapi spec
 * @returns the shopware tools
 */
export async function loadShopwareTools() {
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

    const auth = (await authResponse.json()) as {
        /**
         *
         */
        access_token: string;
    };
    const specText = await fetch(specUrl).then(r => r.text());
    const spec = await parseOpenApiDoc(specText);

    filterOpenApiDoc({
        spec,
        excludeOperations: [
            '/oauth/token',
            '/_action/sync',
            /acl/i,
            /product-export/i,
            /product-search-config/i,
            /product-configurator/i,
            /app-payment-method/i,
            /media/i,
            /snippet/i,
            /mail-template/i,
            /import-export/i,
            /plugin/i,
            /state-machine/i,
            /webhook/i,
            /user-config/i,
            /app-administration/i,
            /app-action-button/i,
            /app-template/i,
            /script/i,
            /user-recovery/i,
            /document-base-config/i,
            /seo/i,
            /cms/i,
            /theme/i,
            /user-access/i,
            /flow/i,
            /aggregate/i,
        ],
        excludeSchemas: [/cms/i],
        excludeSchemaProperties: [/cms/i],
        excludeOperationParameters: parameter => {
            if (parameter.deprecated) {
                return true;
            }

            // SwagQL is shopware feature not documented in the openapi spec
            if (parameter.description?.toLowerCase().includes('swagql')) {
                return true;
            }
        },
    });

    const shopwareTools = toolsFromOpenApi({
        spec,
        baseUrl: apiUrl,
        headers: {
            Authorization: `Bearer ${auth.access_token}`,
        },
    });

    return shopwareTools;
}

/**
 * Runs the agent and logs the plan, code and variables
 * @param agent the agent to run
 */
export async function runAgent(agent: Agent) {
    console.log(chalk.green('Generated plan:'));
    console.log(planMetadata(agent));
    console.log();

    console.log(chalk.green('Generated code:'));
    console.log(agent.script.code);
    console.log();

    // Now execute the agent
    await executeAgent({ agent, input: {} });

    // We can now inspect the agent variables and output
    console.log(chalk.green('Agent variables:'));
    console.log(agent.root.variables);
    console.log();
}
