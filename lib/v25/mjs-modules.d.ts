/** Allow static/dynamic imports of v25 ESM scripts from TypeScript runners. */
declare module "*.mjs" {
  const mod: Record<string, unknown>;
  export default mod;
}
