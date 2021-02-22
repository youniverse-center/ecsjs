(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Entity {
        constructor(_id, registry) {
            this._id = _id;
            this.registry = registry;
        }
        get id() {
            return this._id;
        }
        hasComponent(name) {
            return this.registry.hasComponent(this._id, name);
        }
        addComponent(name, component) {
            return this.registry.assignComponent(this._id, name, component);
        }
        removeComponent(name) {
            this.registry.removeComponent(this._id, name);
        }
        getComponent(name) {
            return this.registry.getComponent(this._id, name);
        }
    }
    exports.default = Entity;
});
