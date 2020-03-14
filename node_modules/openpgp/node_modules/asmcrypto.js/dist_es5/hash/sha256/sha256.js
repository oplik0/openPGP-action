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
import { sha256_asm } from './sha256.asm';
import { Hash } from '../hash';
export var _sha256_block_size = 64;
export var _sha256_hash_size = 32;
var Sha256 = /** @class */ (function (_super) {
    __extends(Sha256, _super);
    function Sha256() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.NAME = 'sha256';
        _this.BLOCK_SIZE = _sha256_block_size;
        _this.HASH_SIZE = _sha256_hash_size;
        return _this;
    }
    Sha256.bytes = function (data) {
        return new Sha256().process(data).finish().result;
    };
    Sha256.NAME = 'sha256';
    Sha256.heap_pool = [];
    Sha256.asm_pool = [];
    Sha256.asm_function = sha256_asm;
    return Sha256;
}(Hash));
export { Sha256 };
