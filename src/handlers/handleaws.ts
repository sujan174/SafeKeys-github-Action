import { SecretsManagerClient, CreateSecretCommand, ResourceExistsException } from "@aws-sdk/client-secrets-manager";
import * as path from 'path';
import { Leak } from '../types';

export async function handleAWSSecrets(leaks: Leak[], region: string): Promise<void> {
    const client = new SecretsManagerClient({ region });

    for (const leak of leaks) {
        const shortCommitId = leak.Commit.substring(0, 7);
        const secretName = `leaked/${leak.Description.replace(/\s+/g, '-')}/${path.basename(leak.File)}/${shortCommitId}`;
        
        console.log(`\nAttempting to create secret in AWS Secrets Manager: ${secretName}`);

        const command = new CreateSecretCommand({
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
        } catch (error) {
            if (error instanceof ResourceExistsException) {
                console.log(`Secret already exists. No action needed.`);
            } else {
                console.error(`Failed to create secret: ${secretName}`, error);
                throw error;
            }
        }
    }
}