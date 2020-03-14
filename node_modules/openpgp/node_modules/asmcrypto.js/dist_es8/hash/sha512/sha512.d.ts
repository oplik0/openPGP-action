import { sha512_asm, sha512result } from './sha512.asm';
import { Hash } from '../hash';
export declare const _sha512_block_size = 128;
export declare const _sha512_hash_size = 64;
export declare class Sha512 extends Hash<sha512result> {
    static NAME: string;
    NAME: string;
    BLOCK_SIZE: number;
    HASH_SIZE: number;
    protected static heap_pool: never[];
    protected static asm_pool: never[];
    protected static asm_function: typeof sha512_asm;
    static bytes(data: Uint8Array): Uint8Array;
}
