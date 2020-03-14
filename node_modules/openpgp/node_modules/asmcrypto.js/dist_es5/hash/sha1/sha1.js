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
import { sha1_asm } from './sha1.asm';
import { Hash } from '../hash';
export var _sha1_block_size = 64;
export var _sha1_hash_size = 20;
var Sha1 = /** @class */ (function (_super) {
    __extends(Sha1, _super);
    function Sha1() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.NAME = 'sha1';
        _this.BLOCK_SIZE = _sha1_block_size;
        _this.HASH_SIZE = _sha1_hash_size;
        return _this;
    }
    Sha1.bytes = function (data) {
        return new Sha1().process(data).finish().result;
    };
    Sha1.NAME = 'sha1';
    Sha1.heap_pool = [];
    Sha1.asm_pool = [];
    Sha1.asm_function = sha1_asm;
    return Sha1;
}(Hash));
export { Sha1 };
