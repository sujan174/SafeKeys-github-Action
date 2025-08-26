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
exports.handleAWSSecrets = handleAWSSecrets;
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
const path = __importStar(require("path"));
async function handleAWSSecrets(leaks, region) {
    const client = new client_secrets_manager_1.SecretsManagerClient({ region });
    for (const leak of leaks) {
        const shortCommitId = leak.Commit.substring(0, 7);
        const secretName = `leaked/${leak.Description.replace(/\s+/g, '-')}/${path.basename(leak.File)}/${shortCommitId}`;
        console.log(`\nAttempting to create secret in AWS Secrets Manager: ${secretName}`);
        const command = new client_secrets_manager_1.CreateSecretCommand({
            Name: secretName,
            Description: `Secret found in ${leak.File} at commit ${leak.Commit}`,
            SecretString: leak.Secret,
            Tags: [
                { Key: "ManagedBy", Value: "ai-secrets-vault-action" },
                { Key: "SourceFile", Value: leak.File },
                { Key: "SourceCommit", Value: leak.Commit },
            ]
        });
        try {
            const response = await client.send(command);
            console.log(`Successfully created secret: ${response.ARN}`);
        }
        catch (error) {
            if (error instanceof client_secrets_manager_1.ResourceExistsException) {
                console.log(`Secret already exists. No action needed.`);
            }
            else {
                console.error(`Failed to create secret: ${secretName}`, error);
                throw error;
            }
        }
    }
}
