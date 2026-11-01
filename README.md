# MCP Doctor for DSH

> Static validation of a local MCP JSON config. No server start, no handshake, no network.

## Use

```bash
node bin/dsh-mcp-doctor.mjs ./mcp.json
node bin/dsh-mcp-doctor.mjs ./mcp.json --json
```

In DSH:

```text
Use mcp_doctor on ./mcp.json.
```

## Checks

- `mcpServers`, `mcp.servers`, or `servers` present
- command/url present
- command exists on PATH or absolute executable
- URL syntax/protocol
- args and env types
- empty/duplicate names

## Limits

- JSON only
- Command lookup uses the current environment, not the MCP client's
- No actual MCP handshake/tool enumeration/auth
- Not a security audit

## Tests

```bash
npm test
```

## Provenance

A small independent config validator. License: MIT.
