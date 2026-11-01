import { readFile, stat } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { isAbsolute } from 'node:path'

function commandExists(command) {
  if (isAbsolute(command)) return Boolean(spawnSync('test', ['-x', command]).status === 0)
  return spawnSync('sh', ['-c', 'command -v "$1" >/dev/null 2>&1', 'sh', command]).status === 0
}
export function findServers(config) {
  if (config?.mcpServers && typeof config.mcpServers === 'object') return config.mcpServers
  if (config?.mcp?.servers && typeof config.mcp.servers === 'object') return config.mcp.servers
  if (config?.servers && typeof config.servers === 'object') return config.servers
  return {}
}
export function doctor(config) {
  const servers = findServers(config)
  const issues = []
  const warnings = []
  const names = Object.keys(servers)
  if (!names.length) issues.push('no mcpServers/mcp.servers block found')
  const seen = new Set()
  for (const name of names) {
    if (!name.trim()) issues.push('empty server name')
    if (seen.has(name)) issues.push(`duplicate server name: ${name}`)
    seen.add(name)
    const server = servers[name]
    if (!server || typeof server !== 'object') { issues.push(`${name}: not an object`); continue }
    if (server.command) {
      if (typeof server.command !== 'string' || !server.command.trim()) issues.push(`${name}: command is empty`)
      else if (!commandExists(server.command)) issues.push(`${name}: command not found: ${server.command}`)
      if (server.args !== undefined && (!Array.isArray(server.args) || server.args.some((a) => typeof a !== 'string'))) issues.push(`${name}: args must be a string array`)
    } else if (server.url) {
      try { const u = new URL(server.url); if (!['http:', 'https:', 'ws:', 'wss:'].includes(u.protocol)) warnings.push(`${name}: unusual URL protocol ${u.protocol}`) }
      catch { issues.push(`${name}: invalid URL: ${server.url}`) }
    } else {
      issues.push(`${name}: needs command or url`)
    }
    if (server.env !== undefined && (typeof server.env !== 'object' || Array.isArray(server.env))) issues.push(`${name}: env must be an object`)
    if (server.timeout !== undefined && (!Number.isFinite(server.timeout) || server.timeout <= 0)) warnings.push(`${name}: timeout is not a positive number`)
  }
  return { servers: names.length, names, issues, warnings, verdict: issues.length ? 'BLOCK' : warnings.length ? 'WARN' : 'PASS' }
}
export async function doctorFile(path) {
  const info = await stat(path).catch(() => null)
  if (!info?.isFile()) throw new Error(`config not found: ${path}`)
  let config
  try { config = JSON.parse(await readFile(path, 'utf8')) } catch { throw new Error('config is not valid JSON') }
  return doctor(config)
}
export function renderMarkdown(report) {
  const lines = [`# MCP doctor: ${report.verdict}`, '', `- servers: ${report.servers}`, '']
  for (const i of report.issues) lines.push(`- BLOCK ${i}`)
  for (const w of report.warnings) lines.push(`- WARN ${w}`)
  if (!report.issues.length && !report.warnings.length) lines.push('No issues under these checks.')
  lines.push('', 'Static config checks only: no MCP server is started and no network request is made.')
  return lines.join('\n')
}
