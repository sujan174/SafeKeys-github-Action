# Secrets Vault Scanner

*Scans for hardcoded secrets and automatically adds them to a configured vault: AWS Secrets Manager, HashiCorp Vault, or a Self-Hosted SafeKeys Vault.*

![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)  
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)  
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)  
![HashiCorp](https://img.shields.io/badge/HashiCorp_Vault-000000?style=for-the-badge&logo=vault&logoColor=white)  

This action integrates seamlessly into your CI/CD pipeline, helping you catch exposed credentials before they become a security risk.

## Features

- **Multi-Vault Support**: Natively supports storing secrets in three popular systems.
- **Automated Scanning**: Automatically scans your codebase on every push or pull request.
- **Secure Credential Handling**: Uses GitHub's encrypted secrets to securely authenticate with your chosen vault.
- **Flexible Configuration**: Easily configure which vault to use and provide the necessary credentials.
- **Easy Integration**: Add secret scanning to your workflow with just a few lines of YAML.

## Vaults Supported

| Vault Provider | Configuration Type |
|---|---|
| Self-Hosted SafeKeys Vault | `self-hosted` |
| AWS Secrets Manager | `aws` |
| HashiCorp Vault | `hashicorp` |

## Getting Started

To use this action, you need to add a workflow file to your repository (e.g., `.github/workflows/secrets_scan.yml`) and configure the required secrets in your repository settings.

### 1. Configure GitHub Secrets

Before setting up the workflow, you must add the credentials for your desired vault to your repository's secrets. Go to **Settings > Secrets and variables > Actions** and add the secrets based on which vault you plan to use.

#### For Self-Hosted SafeKeys Vault:
- `SELF_HOSTED_VAULT_URL`: The full URL of your SafeKeys Vault server (e.g., `https://my-vault.onrender.com`).
- `SELF_HOSTED_VAULT_API_KEY`: The API key for your SafeKeys Vault server.

#### For AWS Secrets Manager:
- `AWS_ROLE_TO_ASSUME`: The IAM Role ARN to assume for AWS authentication (via OIDC).
- `AWS_REGION`: The AWS region where your secrets will be stored (e.g., `us-east-1`).

#### For HashiCorp Vault:
- `VAULT_ADDR`: The full URL of your HashiCorp Vault instance.
- `VAULT_TOKEN`: Your HashiCorp Vault access token.

### 2. Create a Workflow File

Create a YAML file in your `.github/workflows/` directory. Below are examples for each supported vault.

## 📋 Usage Examples

### Example 1: Using a Self-Hosted SafeKeys Vault

This is the simplest setup, ideal for personal projects or small teams.

```yaml
name: Scan for Secrets (Self-Hosted)

on: [push]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Secrets Vault Scanner
        uses: sjn174/secrets-vault-scanner@v1
        with:
          vault_provider: 'self-hosted'
          self_hosted_vault_url: ${{ secrets.SELF_HOSTED_VAULT_URL }}
          self_hosted_vault_api_key: ${{ secrets.SELF_HOSTED_VAULT_API_KEY }}
```

### Example 2: Using AWS Secrets Manager

This configuration is ideal for teams already using the AWS ecosystem.

```yaml
name: Scan for Secrets (AWS)

on: [push]

permissions:
  id-token: write
  contents: read

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Secrets Vault Scanner
        uses: sjn174/secrets-vault-scanner@v1
        with:
          vault_provider: 'aws'
          aws_role_to_assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
          aws_region: ${{ secrets.AWS_REGION }}
```

### Example 3: Using HashiCorp Vault

This setup is perfect for organizations that use HashiCorp Vault for centralized secret management.

```yaml
name: Scan for Secrets (HashiCorp)

on: [push]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Secrets Vault Scanner
        uses: sjn174/secrets-vault-scanner@v1
        with:
          vault_provider: 'hashicorp'
          vault_addr: ${{ secrets.VAULT_ADDR }}
          vault_token: ${{ secrets.VAULT_TOKEN }}
```

## ⚙️ Action Inputs

| Input | Required | Description |
|---|---|---|
| `vault_provider` | Yes | The type of vault to use. Must be one of: `self-hosted`, `aws`, `hashicorp`. |
| `self_hosted_vault_url` | If `vault_provider` is `self-hosted` | The URL for your self-hosted SafeKeys Vault server. |
| `self_hosted_vault_api_key` | If `vault_provider` is `self-hosted` | The API key for your self-hosted vault. |
| `aws_role_to_assume` | If `vault_provider` is `aws` | The IAM Role ARN to assume for AWS authentication (via OIDC). |
| `aws_region` | If `vault_provider` is `aws` | The AWS region for Secrets Manager (e.g., `us-east-1`). |
| `vault_addr` | If `vault_provider` is `hashicorp` | The address of your HashiCorp Vault instance. |
| `vault_token` | If `vault_provider` is `hashicorp` | Your access token for HashiCorp Vault. |

## Security

It is critical to store all credentials (`SELF_HOSTED_VAULT_API_KEY`, `AWS_ROLE_TO_ASSUME`, `VAULT_TOKEN`, etc.) as encrypted secrets in your GitHub repository settings. **Do not hardcode them in your workflow files.**
