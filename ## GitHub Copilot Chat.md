## GitHub Copilot Chat

- Extension Version: 0.28.0 (prod)
- VS Code: vscode/1.101.0
- OS: Windows

## Network

User Settings:
```json
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 140.82.114.6 (28 ms)
- DNS ipv6 Lookup: Error (34 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (24 ms)
- Electron fetch (configured): HTTP 503 (2858 ms)
- Node.js https: HTTP 503 (2913 ms)
- Node.js fetch: HTTP 200 (910 ms)
- Helix fetch: HTTP 200 (1364 ms)

Connecting to https://api.individual.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.114.22 (5 ms)
- DNS ipv6 Lookup: Error (22 ms): getaddrinfo ENOTFOUND api.individual.githubcopilot.com
- Proxy URL: None (10 ms)
- Electron fetch (configured): HTTP 200 (333 ms)
- Node.js https: HTTP 200 (5667 ms)
- Node.js fetch: HTTP 200 (2381 ms)
- Helix fetch: timed out after 10 seconds

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).

.customer-service-link {
  color: #eebbc3 !important;
  font-weight: bold;
  background: #232946;
  border-radius: 6px;
  padding: 4px 12px;
}