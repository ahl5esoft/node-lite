export abstract class CryptBase {
    public abstract decrypt(cipherText: string): Promise<string>;
    public abstract encrypt(plaintext: string): Promise<string>;
    public abstract compare(plaintext: string, cipherText: string): Promise<boolean>;
}