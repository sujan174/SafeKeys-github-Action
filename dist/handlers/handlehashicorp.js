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
exports.handleHashicorpSecrets = handleHashicorpSecrets;
const Vault = require('node-vault');
const path = __importStar(require("path"));
async function handleHashicorpSecrets(leaks, vaultAddr, vaultToken) {
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
        }
        catch (error) {
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
            }
            else {
                console.error(`Failed to process secret: ${secretPath}`, error.message || error);
                throw error;
            }
        }
    }
}
