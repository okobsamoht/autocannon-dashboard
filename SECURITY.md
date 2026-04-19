# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅ Yes    |

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, email **okobsamoht@gmail.com** with:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix (optional)

You will receive an acknowledgement within 48 hours and a resolution timeline within 7 days.

## Scope

Autocannon Dashboard is a local desktop application. It does not operate a server, collect telemetry, or transmit data outside your machine. All test data is stored in your OS user-data directory via `electron-store`.

Security issues in scope:
- Privilege escalation via the Electron main/renderer bridge
- Arbitrary code execution through malicious project files
- Path traversal in export functionality

Out of scope:
- Vulnerabilities in the target server you are testing
- Issues requiring physical access to the device
- Social engineering
