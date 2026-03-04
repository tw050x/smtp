// import { createCipheriv, randomBytes, createDecipheriv } from 'crypto';
// import { default as secret } from './secret'

// interface EncryptedData {
//   iv: string;
//   content: string;
// }

// interface Encryption {
//   encrypt: (text: string) => EncryptedData;
//   decrypt: (encryptedData: EncryptedData) => string;
// }

// interface EncryptionParameters {
//   algorithm: string;
//   secretKey: string;
//   iv?: Buffer;
// }

// /**
//  * Creates an object containing methods for encrypting and decrypting data using AES-256-CBC.
//  * @returns {Encryption} An object with `encrypt` and `decrypt` methods.
//  */
// const createEncrypter = (parameters: EncryptionParameters): Encryption => {
//   const iv = parameters.iv || randomBytes(16);

//   // Function to encrypt data
//   const encrypt = (text: string): EncryptedData => {
//     const cipher = createCipheriv(parameters.algorithm, Buffer.from(parameters.secretKey, 'hex'), iv);
//     let encrypted = cipher.update(text, 'utf8', 'hex');
//     encrypted += cipher.final('hex');
//     return {
//       iv: iv.toString('hex'),
//       content: encrypted
//     };
//   }

//   // Function to decrypt data
//   const decrypt = (encryptedData: EncryptedData): string => {
//     const decipher = createDecipheriv(parameters.algorithm, Buffer.from(parameters.secretKey, 'hex'), Buffer.from(encryptedData.iv, 'hex'));
//     let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
//     decrypted += decipher.final('utf8');
//     return decrypted;
//   }

//   return { encrypt, decrypt };
// }

// export const { decrypt, encrypt } = createEncrypter({
//   algorithm: 'aes-256-cbc',
//   secretKey: secret.encrypterSecretKey,
// });

// export default createEncrypter;
