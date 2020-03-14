import { sha512_asm } from './sha512.asm';
import { Hash } from '../hash';
export const _sha512_block_size = 128;
export const _sha512_hash_size = 64;
export class Sha512 extends Hash {
    constructor() {
        super(...arguments);
        this.NAME = 'sha512';
        this.BLOCK_SIZE = _sha512_block_size;
        this.HASH_SIZE = _sha512_hash_size;
    }
    static bytes(data) {
        return new Sha512().process(data).finish().result;
    }
}
Sha512.NAME = 'sha512';
Sha512.heap_pool = [];
Sha512.asm_pool = [];
Sha512.asm_function = sha512_asm;
