function _extends(d, b) {
    "use strict";
    if (Object.create) {
        if (b.prototype === null) {
            console.log(d);
        }
        d.prototype = Object.create(b.prototype);

        d.prototype.constructor = d;
        return;
    }

    function Extender() {
        this.constructor = d;
    }
    Extender.prototype = b.prototype;
    d.prototype = new Extender();
}
