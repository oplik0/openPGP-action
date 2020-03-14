var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { sha512_asm } from './sha512.asm';
import { Hash } from '../hash';
export var _sha512_block_size = 128;
export var _sha512_hash_size = 64;
var Sha512 = /** @class */ (function (_super) {
    __extends(Sha512, _super);
    function Sha512() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.NAME = 'sha512';
        _this.BLOCK_SIZE = _sha512_block_size;
        _this.HASH_SIZE = _sha512_hash_size;
        return _this;
    }
    Sha512.bytes = function (data) {
        return new Sha512().process(data).finish().result;
    };
    Sha512.NAME = 'sha512';
    Sha512.heap_pool = [];
    Sha512.asm_pool = [];
    Sha512.asm_function = sha512_asm;
    return Sha512;
}(Hash));
export { Sha512 };
