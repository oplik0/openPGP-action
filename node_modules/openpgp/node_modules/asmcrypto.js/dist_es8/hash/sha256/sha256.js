import { sha256_asm } from './sha256.asm';
import { Hash } from '../hash';
export const _sha256_block_size = 64;
export const _sha256_hash_size = 32;
export class Sha256 extends Hash {
    constructor() {
        super(...arguments);
        this.NAME = 'sha256';
        this.BLOCK_SIZE = _sha256_block_size;
        this.HASH_SIZE = _sha256_hash_size;
    }
    static bytes(data) {
        return new Sha256().process(data).finish().result;
    }
}
Sha256.NAME = 'sha256';
Sha256.heap_pool = [];
Sha256.asm_pool = [];
Sha256.asm_function = sha256_asm;
