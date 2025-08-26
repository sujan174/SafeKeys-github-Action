import * as fs from 'fs';
import * as path from 'path';
import { Leak } from './types';
import { handleAWSSecrets } from './handlers/handleaws';
import { handleHashicorpSecrets } from './handlers/handlehashicorp';
import { handleSelfHostedSecrets } from './handlers/handleselfhosted';

async function run(): Promise<void> {
    try {
        console.log("Starting Secrets Vault Scanner Action...");

        const vaultProvider = process.env.INPUT_VAULT_PROVIDER;
        const workspace = process.env.GITHUB_WORKSPACE;

        if (!workspace) {
            throw new Error("GITHUB_WORKSPACE is not set.");
        }

        const reportPath = path.join(workspace, 'gitleaks-report.json');

        if (!fs.existsSync(reportPath)) {
            console.log("No gitleaks-report.json found. No secrets detected.");
            return;
        }

        const reportContent = fs.readFileSync(reportPath, 'utf8');
        if (!reportContent.trim()) {
            console.log("Gitleaks report is empty. No secrets detected.");
            return;
        }

        const leaks: Leak[] = JSON.parse(reportContent);

        if (leaks.length === 0) {
            console.log("Gitleaks report contains no leaks. All good!");
            return;
        }

        console.log(`\nDetected ${leaks.length} potential secret(s). Processing...`);

        switch (vaultProvider) {
            case 'aws':
                const awsRegion = process.env.INPUT_AWS_REGION;
                if (!awsRegion) throw new Error("aws_region input is required for 'aws' provider");
                await handleAWSSecrets(leaks, awsRegion);
                break;
            
            case 'hashicorp':
                const vaultAddr = process.env.INPUT_VAULT_ADDR;
                const vaultToken = process.env.INPUT_VAULT_TOKEN;
                if (!vaultAddr || !vaultToken) throw new Error("vault_addr and vault_token are required for 'hashicorp' provider");
                await handleHashicorpSecrets(leaks, vaultAddr, vaultToken);
                break;

            case 'self-hosted':
                const vaultUrl = process.env.INPUT_SELF_HOSTED_VAULT_URL;
                const apiKey = process.env.INPUT_SELF_HOSTED_VAULT_API_KEY;
                if (!vaultUrl || !apiKey) {
                    throw new Error("self_hosted_vault_url and self_hosted_vault_api_key are required for 'self-hosted' provider");
                }
                await handleSelfHostedSecrets(leaks, vaultUrl, apiKey);
                break;

            default:
                throw new Error(`Unsupported vault_provider: ${vaultProvider}`);
        }

        console.log("\n[Action Required] Secrets have been secured in your vault.");
        console.log("Please update your code to fetch these secrets from the vault instead of hardcoding them.");

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Action failed: ${error.message}`);
            process.exit(1);
        }
    }
}

run();