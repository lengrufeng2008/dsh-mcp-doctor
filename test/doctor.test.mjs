import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { doctorFile } from '../src/doctor.mjs'
import { apply } from '../plugin/index.js'
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
test('good config passes and bad config blocks', async () => {
  assert.equal((await doctorFile(join(ROOT, 'test/fixtures/good.json'))).verdict, 'PASS')
  const bad = await doctorFile(join(ROOT, 'test/fixtures/bad.json'))
  assert.equal(bad.verdict, 'BLOCK')
  assert.ok(bad.issues.some((i) => i.includes('command not found')))
  assert.ok(bad.issues.some((i) => i.includes('invalid URL')))
})
test('CLI and plugin register', async () => {
  const r = spawnSync(process.execPath, [join(ROOT, 'bin/dsh-mcp-doctor.mjs'), join(ROOT, 'test/fixtures/bad.json')], { encoding: 'utf8' })
  assert.equal(r.status, 1)
  assert.match(r.stdout, /BLOCK/)
  const tools = []; let factory
  apply({ tools: { register: (t) => tools.push(t) }, skills: { registerProvider: (fn) => { factory = fn } } })
  assert.equal(tools[0].name, 'mcp_doctor')
  const result = await tools[0].execute({ config: join(ROOT, 'test/fixtures/good.json') })
  assert.equal(result.verdict, 'PASS')
  assert.equal((await factory().list())[0].name, 'mcp-doctor')
})
