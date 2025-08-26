import { Leak } from '../types';

export async function handleSelfHostedSecrets(leaks: Leak[], vaultUrl: string, apiKey: string): Promise<void> {
    const endpoint = `${vaultUrl}/secrets`;
    console.log(`\nAttempting to send secrets to self-hosted vault at: ${endpoint}`);

    for (const leak of leaks) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                },
                body: JSON.stringify(leak),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}: ${result.error}`);
            }

            console.log(`✅ Successfully stored secret with ID: ${result.id}`);
        } catch (error) {
            console.error(`❌ Failed to send secret to self-hosted vault.`, error);
            throw error;
        }
    }
}