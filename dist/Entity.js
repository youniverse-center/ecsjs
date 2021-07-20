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
        constructor(entityId, registry) {
            this.entityId = entityId;
            this.registry = registry;
        }
        get id() {
            return this.entityId;
        }
        hasComponent(name) {
            return this.registry.hasComponent(this.entityId, name);
        }
        addComponent(name, component) {
            return this.registry.assignComponent(this.entityId, name, component);
        }
        removeComponent(name) {
            this.registry.removeComponent(this.entityId, name);
        }
        getComponent(name) {
            return this.registry.getComponent(this.entityId, name);
        }
    }
    exports.default = Entity;
});
