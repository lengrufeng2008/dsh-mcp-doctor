---
name: mcp-doctor
description: Validate a local MCP JSON config without starting servers or using the network. Use mcp_doctor before importing a config or when an MCP client reports a failure.
whenToUse: "An MCP config is failing, is being imported from Claude/Cursor/Codex, or needs a static first pass."
---

# MCP doctor

```text
Use mcp_doctor on ./mcp.json.
```

It accepts a JSON file with `mcpServers`, `mcp.servers`, or `servers` and checks:

- command or URL present
- command exists on PATH (or an absolute executable)
- URL syntax and protocol
- args/env types
- empty or duplicate names

## Limits

- JSON only; no YAML TOML.
- No server start, handshake, tool enumeration, auth, or network request.
- `command -v` checks the current environment, not the MCP client's environment.
- Not a security review.
