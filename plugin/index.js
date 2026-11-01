import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { doctorFile, renderMarkdown } from '../src/doctor.mjs'
const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url))
const SKILL_PATH = join(PLUGIN_DIR, '..', 'skills', 'mcp-doctor', 'SKILL.md')
const PROVIDER = 'dsh-mcp-doctor'
export const name = 'mcp-doctor'
export const inject = ['tools', 'skills']
function stripFrontmatter(text) { if (!text.startsWith('---\n')) return text; const end = text.indexOf('\n---\n', 4); return end === -1 ? text : text.slice(end + 5) }
const summary = { name: 'mcp-doctor', description: 'Static validation of an MCP JSON config: command availability, URL syntax, required command/url, args/env types, duplicate/empty names. Does not start servers or use the network.', whenToUse: 'An MCP config is failing or before importing one from another client.', invocation: { modelInvocable: true, userInvocable: true }, source: 'bundled', provider: PROVIDER, resourceBase: { kind: 'directory', path: join(PLUGIN_DIR, '..', 'skills', 'mcp-doctor') }, rank: 600, locator: 'mcp-doctor', metadata: { domain: 'mcp', version: '0.1.0' } }
export function apply(ctx) {
  ctx.tools.register({ name: 'mcp_doctor', description: 'Statically validate a local MCP JSON config. Checks command/url presence, command availability, URL syntax, args/env types, and names. Does not start servers or use the network.', parameters: { type: 'object', additionalProperties: false, properties: { config: { type: 'string', description: 'Path to a JSON config with mcpServers or mcp.servers.' }, format: { type: 'string', enum: ['markdown', 'json'] } }, required: ['config'] }, output: { schema: { type: 'object', additionalProperties: false, properties: { markdown: { type: 'string' }, verdict: { type: 'string' }, servers: { type: 'integer' } }, required: ['markdown', 'verdict', 'servers'] }, render: (_a, v) => [{ type: 'text', text: v.markdown }] }, timeoutMs: 20_000, async execute(args = {}) { const r = await doctorFile(args.config); return { markdown: args.format === 'json' ? JSON.stringify(r, null, 2) : renderMarkdown(r), verdict: r.verdict, servers: r.servers } } })
  ctx.skills.registerProvider(() => ({ name: PROVIDER, async list() { return [summary] }, async get(c) { if (c?.name !== 'mcp-doctor') return undefined; return { ...summary, content: stripFrontmatter(await readFile(SKILL_PATH, 'utf8')) } } }))
}
