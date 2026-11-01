#!/usr/bin/env node
import { doctorFile, renderMarkdown } from '../src/doctor.mjs'
const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) { console.log('dsh-mcp-doctor <config.json> [--json]\\n\\nStatic MCP server config checks. Does not start servers or use the network.'); process.exit(0) }
const target = args.find((a) => !a.startsWith('--'))
if (!target) { console.error('dsh-mcp-doctor: config path required'); process.exit(2) }
try {
  const report = await doctorFile(target)
  if (args.includes('--json')) console.log(JSON.stringify(report, null, 2))
  else console.log(renderMarkdown(report))
  process.exitCode = report.verdict === 'BLOCK' ? 1 : 0
} catch (error) { console.error(`dsh-mcp-doctor: ${error.message}`); process.exitCode = 2 }
