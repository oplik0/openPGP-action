import { _heap_init, _heap_write } from '../other/utils';
import { IllegalStateError } from '../other/errors';
var Hash = /** @class */ (function () {
    function Hash() {
        this.pos = 0;
        this.len = 0;
        this.acquire_asm();
    }
    Hash.prototype.acquire_asm = function () {
        if (this.heap === undefined && this.asm === undefined) {
            this.heap = this.constructor.heap_pool.pop() || _heap_init();
            this.asm = this.constructor.asm_pool.pop() || this.constructor.asm_function({ Uint8Array: Uint8Array }, null, this.heap.buffer);
            this.reset();
        }
    };
    Hash.prototype.release_asm = function () {
        this.constructor.heap_pool.push(this.heap);
        ;
        this.constructor.asm_pool.push(this.asm);
        this.heap = undefined;
        this.asm = undefined;
    };
    Hash.prototype.reset = function () {
        this.acquire_asm();
        this.result = null;
        this.pos = 0;
        this.len = 0;
        this.asm.reset();
        return this;
    };
    Hash.prototype.process = function (data) {
        if (this.result !== null)
            throw new IllegalStateError('state must be reset before processing new data');
        this.acquire_asm();
        var asm = this.asm;
        var heap = this.heap;
        var hpos = this.pos;
        var hlen = this.len;
        var dpos = 0;
        var dlen = data.length;
        var wlen = 0;
        while (dlen > 0) {
            wlen = _heap_write(heap, hpos + hlen, data, dpos, dlen);
            hlen += wlen;
            dpos += wlen;
            dlen -= wlen;
            wlen = asm.process(hpos, hlen);
            hpos += wlen;
            hlen -= wlen;
            if (!hlen)
                hpos = 0;
        }
        this.pos = hpos;
        this.len = hlen;
        return this;
    };
    Hash.prototype.finish = function () {
        if (this.result !== null)
            throw new IllegalStateError('state must be reset before processing new data');
        this.acquire_asm();
        this.asm.finish(this.pos, this.len, 0);
        this.result = new Uint8Array(this.HASH_SIZE);
        this.result.set(this.heap.subarray(0, this.HASH_SIZE));
        this.pos = 0;
        this.len = 0;
        this.release_asm();
        return this;
    };
    return Hash;
}());
export { Hash };
