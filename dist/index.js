"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const handleaws_1 = require("./handlers/handleaws");
const handlehashicorp_1 = require("./handlers/handlehashicorp");
const handleselfhosted_1 = require("./handlers/handleselfhosted");
async function run() {
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
        const leaks = JSON.parse(reportContent);
        if (leaks.length === 0) {
            console.log("Gitleaks report contains no leaks. All good!");
            return;
        }
        console.log(`\nDetected ${leaks.length} potential secret(s). Processing...`);
        switch (vaultProvider) {
            case 'aws':
                const awsRegion = process.env.INPUT_AWS_REGION;
                if (!awsRegion)
                    throw new Error("aws_region input is required for 'aws' provider");
                await (0, handleaws_1.handleAWSSecrets)(leaks, awsRegion);
                break;
            case 'hashicorp':
                const vaultAddr = process.env.INPUT_VAULT_ADDR;
                const vaultToken = process.env.INPUT_VAULT_TOKEN;
                if (!vaultAddr || !vaultToken)
                    throw new Error("vault_addr and vault_token are required for 'hashicorp' provider");
                await (0, handlehashicorp_1.handleHashicorpSecrets)(leaks, vaultAddr, vaultToken);
                break;
            case 'self-hosted':
                const vaultUrl = process.env.INPUT_SELF_HOSTED_VAULT_URL;
                const apiKey = process.env.INPUT_SELF_HOSTED_VAULT_API_KEY;
                if (!vaultUrl || !apiKey) {
                    throw new Error("self_hosted_vault_url and self_hosted_vault_api_key are required for 'self-hosted' provider");
                }
                await (0, handleselfhosted_1.handleSelfHostedSecrets)(leaks, vaultUrl, apiKey);
                break;
            default:
                throw new Error(`Unsupported vault_provider: ${vaultProvider}`);
        }
        console.log("\n[Action Required] Secrets have been secured in your vault.");
        console.log("Please update your code to fetch these secrets from the vault instead of hardcoding them.");
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Action failed: ${error.message}`);
            process.exit(1);
        }
    }
}
run();
