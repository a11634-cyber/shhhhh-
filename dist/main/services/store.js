"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStore = createStore;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function encrypt(value, key) {
    const iv = crypto_1.default.randomBytes(12);
    const cipher = crypto_1.default.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return JSON.stringify({ iv: iv.toString('hex'), authTag: authTag.toString('hex'), encrypted: encrypted.toString('hex') });
}
function decrypt(payload, key) {
    const parsed = JSON.parse(payload);
    const iv = Buffer.from(parsed.iv, 'hex');
    const authTag = Buffer.from(parsed.authTag, 'hex');
    const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(parsed.encrypted, 'hex')), decipher.final()]);
    return decrypted.toString('utf8');
}
function createStore() {
    const userDataPath = path_1.default.join(process.env.HOME || process.cwd(), '.codel-editor');
    const key = crypto_1.default.createHash('sha256').update(userDataPath).digest();
    const storePath = path_1.default.join(userDataPath, 'store.json');
    let cache = {};
    if (fs_1.default.existsSync(storePath)) {
        try {
            const persisted = fs_1.default.readFileSync(storePath, 'utf8');
            const decrypted = decrypt(persisted, key);
            cache = JSON.parse(decrypted);
        }
        catch {
            cache = {};
        }
    }
    const persist = () => {
        fs_1.default.mkdirSync(userDataPath, { recursive: true });
        fs_1.default.writeFileSync(storePath, encrypt(JSON.stringify(cache), key), 'utf8');
    };
    return {
        get: (key) => cache[key],
        set: (key, value) => {
            cache[key] = value;
            persist();
        }
    };
}
