import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export type AppStoreSchema = {
  workspacePath?: string;
  settings?: Record<string, unknown>;
  extensions?: string[];
  aiConfig?: Record<string, unknown>;
  aiSessions?: Record<string, unknown>;
  debug?: Record<string, unknown>;
  terminals?: Record<string, unknown>;
};

export type StoreLike = {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
};

function encrypt(value: string, key: Buffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return JSON.stringify({ iv: iv.toString('hex'), authTag: authTag.toString('hex'), encrypted: encrypted.toString('hex') });
}

function decrypt(payload: string, key: Buffer) {
  const parsed = JSON.parse(payload) as { iv: string; authTag: string; encrypted: string };
  const iv = Buffer.from(parsed.iv, 'hex');
  const authTag = Buffer.from(parsed.authTag, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(parsed.encrypted, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}

export function createStore(): StoreLike {
  const userDataPath = path.join(process.env.HOME || process.cwd(), '.codel-editor');
  const key = crypto.createHash('sha256').update(userDataPath).digest();
  const storePath = path.join(userDataPath, 'store.json');

  let cache: Record<string, unknown> = {};

  if (fs.existsSync(storePath)) {
    try {
      const persisted = fs.readFileSync(storePath, 'utf8');
      const decrypted = decrypt(persisted, key);
      cache = JSON.parse(decrypted) as Record<string, unknown>;
    } catch {
      cache = {};
    }
  }

  const persist = () => {
    fs.mkdirSync(userDataPath, { recursive: true });
    fs.writeFileSync(storePath, encrypt(JSON.stringify(cache), key), 'utf8');
  };

  return {
    get: (key: string) => cache[key],
    set: (key: string, value: unknown) => {
      cache[key] = value;
      persist();
    }
  };
}
