# SafeKeys Vault Scanner (GitHub Action)

The **SafeKeys Vault Scanner** is a GitHub Action that automatically scans your codebase for **hardcoded secrets** (API keys, tokens, passwords, etc.) during CI/CD runs. When secrets are detected, it securely **forwards them to your SafeKeys Vault Server** for safe storage and auditing.

## Features

- **Automated Secret Scanning**: Detects API keys, tokens, and sensitive credentials.
- **Vault Integration**: Stores findings directly in a running SafeKeys Vault Server.
- **Secure by Default**: Uses your configured `VAULT_API_KEY` for authenticated storage.
- **Seamless CI/CD**: Works in pull requests, pushes, or scheduled workflows.
- 
## Getting Started

### Prerequisites

- A running instance of the **SafeKeys Vault Server** (setup guide here).
- The server URL and API key (`VAULT_API_KEY`).

### Usage

Add the SafeKeys Vault Scanner Action to your workflow:

```yaml
name: 'Test Local Action'
on:
  push:
jobs:
  test-self-hosted-action:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Create fake secret file for testing
        run: |
          echo "api_key = 'Example-leaked-api-key'" > test-secrets.txt

      - name: Run Secrets Vault Scanner
        uses: ./
        with:
          vault_provider: 'self-hosted'
          self_hosted_vault_url: ${{ secrets.VAULT_URL }}
          self_hosted_vault_api_key: ${{ secrets.VAULT_API_KEY }}
```

## ⚙️ Inputs

| Input | Required | Description |
|-------|----------|-------------|
| `vault-url` | Yes | The URL of your running SafeKeys Vault Server (e.g., `https://your-vault.onrender.com`) |
| `vault-api-key` | Yes | The API key configured in your Vault server (`VAULT_API_KEY`) |

## Example Secret Record

When a secret is found, it is automatically sent to the Vault Server:

```json
{
    Description: string;
    StartLine: number;
    Secret: string;
    File: string;
    Commit: string;
}
```

And stored securely in the server's JSON database.

## Security Notes

- Always set `VAULT_API_KEY` and `VAULT_URL` as **encrypted GitHub Secrets** in your repository settings.
- Never hardcode secrets in your workflow files.
- Ensure your Vault server is deployed with **HTTPS enabled**.
