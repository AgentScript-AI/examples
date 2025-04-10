import { common, jsdoc, typescript } from '@agentscript-ai/eslint';

export default [
    //
    ...common(),
    ...typescript({ target: 'node' }),
    ...jsdoc(),
];
