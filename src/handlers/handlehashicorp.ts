import * as Vault from 'node-vault';
import * as path from 'path';
import { Leak } from '../types';

export async function handleHashicorpSecrets(leaks: Leak[], vaultAddr: string, vaultToken: string): Promise<void> {
    const vault = Vault({
        apiVersion: 'v1',
        endpoint: vaultAddr,
        token: vaultToken,
    });

    for (const leak of leaks) {
        const shortCommitId = leak.Commit.substring(0, 7);
        const secretPath = `kv/data/leaked/${leak.Description.replace(/\s+/g, '-')}/${path.basename(leak.File)}/${shortCommitId}`;

        console.log(`\nProcessing secret for HashiCorp Vault at path: ${secretPath}`);

        try {
            await vault.read(secretPath);
            console.log(`Secret already exists at this path. No action needed.`);

        } catch (error: any) {
            if (error.response && error.response.statusCode === 404) {
                console.log(`Secret does not exist. Attempting to create...`);
                
                await vault.write(secretPath, {
                    data: {
                        value: leak.Secret,
                        sourceFile: leak.File,
                        sourceCommit: leak.Commit,
                        ruleDescription: leak.Description,
                        managedBy: 'ai-secrets-vault-action',
                    },
                });
                console.log(`Successfully created secret in Vault.`);

            } else {
                console.error(`Failed to process secret: ${secretPath}`, error.message || error);
                throw error;
            }
        }
    }
}