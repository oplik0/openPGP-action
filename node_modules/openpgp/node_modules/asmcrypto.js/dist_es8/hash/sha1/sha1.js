import { sha1_asm } from './sha1.asm';
import { Hash } from '../hash';
export const _sha1_block_size = 64;
export const _sha1_hash_size = 20;
export class Sha1 extends Hash {
    constructor() {
        super(...arguments);
        this.NAME = 'sha1';
        this.BLOCK_SIZE = _sha1_block_size;
        this.HASH_SIZE = _sha1_hash_size;
    }
    static bytes(data) {
        return new Sha1().process(data).finish().result;
    }
}
Sha1.NAME = 'sha1';
Sha1.heap_pool = [];
Sha1.asm_pool = [];
Sha1.asm_function = sha1_asm;
