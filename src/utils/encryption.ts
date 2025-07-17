import CryptoJS from 'crypto-js';

const SECRET_KEY = 'vault-of-legacy-secret-key-2024';

export class EncryptionService {
  static encrypt(data: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  static decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  static hashData(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128/8).toString();
  }

  static hashPassword(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    }).toString();
  }
}