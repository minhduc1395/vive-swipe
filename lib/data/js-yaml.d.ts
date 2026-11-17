declare module "js-yaml" {
  export const JSON_SCHEMA: unknown;
  export function load(input: string, opts?: { schema?: unknown }): unknown;
}
