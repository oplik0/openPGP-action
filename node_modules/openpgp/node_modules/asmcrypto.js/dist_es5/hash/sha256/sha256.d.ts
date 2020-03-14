import { sha256_asm, sha256result } from './sha256.asm';
import { Hash } from '../hash';
export declare const _sha256_block_size = 64;
export declare const _sha256_hash_size = 32;
export declare class Sha256 extends Hash<sha256result> {
    static NAME: string;
    NAME: string;
    BLOCK_SIZE: number;
    HASH_SIZE: number;
    protected static heap_pool: never[];
    protected static asm_pool: never[];
    protected static asm_function: typeof sha256_asm;
    static bytes(data: Uint8Array): Uint8Array;
}
