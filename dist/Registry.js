var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Entity", "./View"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Registry = void 0;
    const Entity_1 = __importDefault(require("./Entity"));
    const View_1 = __importDefault(require("./View"));
    class Registry {
        constructor() {
            this.entityComponents = new Map();
            this.components = new Map();
            this.nextEntity = 1;
            this.listeners = {
                componentAdded: [],
                componentRemoved: [],
                entityCreated: [],
                entityRemoved: [],
            };
        }
        getComponentMap(componentName) {
            if (!this.components.has(componentName)) {
                this.components.set(componentName, new Map());
            }
            return this.components.get(componentName);
        }
        createEntity() {
            const entity = new Entity_1.default(this.nextEntity, this);
            this.nextEntity += 1;
            this.entityComponents.set(entity.id, new Set());
            this.listeners.entityCreated.forEach((listener) => {
                listener(entity);
            });
            return entity;
        }
        hasComponent(entity, name) {
            return this.getComponentMap(name).has(entity);
        }
        assignComponent(entity, name, component) {
            const componentList = this.entityComponents.get(entity);
            if (componentList) {
                componentList.add(name);
                this.getComponentMap(name).set(entity, component);
            }
            this.listeners.componentAdded.forEach((listener) => {
                listener(new Entity_1.default(entity, this), name, component);
            });
            return component;
        }
        removeComponent(entity, name) {
            const componentList = this.entityComponents.get(entity);
            if (componentList) {
                const component = this.getComponent(entity, name);
                this.listeners.componentRemoved.forEach((listener) => {
                    listener(new Entity_1.default(entity, this), name, component);
                });
                componentList.delete(name);
            }
            this.getComponentMap(name).delete(entity);
        }
        getComponent(entityId, name) {
            const component = this.getComponentMap(name).get(entityId);
            if (!component) {
                throw new Error(`Entity ${entityId} does not have component ${name}`);
            }
            return component;
        }
        removeEntity(entity) {
            const componentList = this.entityComponents.get(entity);
            if (!componentList) {
                return;
            }
            this.listeners.entityRemoved.forEach((listener) => {
                listener(new Entity_1.default(entity, this));
            });
            componentList.forEach((componentName) => {
                this.removeComponent(entity, componentName);
            });
            this.entityComponents.delete(entity);
        }
        getView(groupAll, groupAny = []) {
            const view = new View_1.default(groupAll, groupAny);
            this.entityComponents.forEach((c, entityID) => {
                const componentArray = Array.from(c);
                const allComponents = groupAll.filter((e) => componentArray.includes(e));
                if (allComponents.length !== groupAll.length) {
                    return;
                }
                const entity = new Entity_1.default(entityID, this);
                const searchComponents = groupAny.filter((e) => componentArray.includes(e))
                    .concat(allComponents);
                searchComponents.forEach((componentName) => {
                    const component = this.getComponent(entityID, componentName);
                    if (component) {
                        view.addComponent(entity, componentName, component);
                    }
                });
            });
            return view;
        }
        registerListener(name, listener) {
            this.listeners[name].push(listener);
        }
    }
    exports.Registry = Registry;
    const createRegistry = () => new Registry();
    exports.default = createRegistry;
});
