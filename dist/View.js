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
    class View {
        constructor(groupAll, groupAny) {
            this.groupAll = groupAll;
            this.groupAny = groupAny;
            this.resultMap = new Map();
        }
        addComponent(entity, componentName, component) {
            let entityMap = this.resultMap.get(entity);
            if (!entityMap) {
                entityMap = new Map();
                this.resultMap.set(entity, entityMap);
            }
            entityMap.set(componentName, component);
        }
        get result() {
            const r = [];
            this.resultMap.forEach((components, entity) => {
                r.push({
                    entity,
                    component(name) {
                        return components.get(name);
                    },
                    hasComponent(name) {
                        return components.has(name);
                    },
                });
            });
            return r;
        }
    }
    exports.default = View;
});
