class Entity {
    entityId;
    registry;
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

class View {
    groupAll;
    groupAny;
    resultMap = new Map();
    constructor(groupAll, groupAny) {
        this.groupAll = groupAll;
        this.groupAny = groupAny;
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

class Registry {
    entityComponents = new Map();
    components = new Map();
    nextEntity = 1;
    listeners = {
        componentAdded: [],
        componentRemoved: [],
        entityCreated: [],
        entityRemoved: [],
    };
    getComponentMap(componentName) {
        if (!this.components.has(componentName)) {
            this.components.set(componentName, new Map());
        }
        return this.components.get(componentName);
    }
    createEntity() {
        const entity = new Entity(this.nextEntity, this);
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
            listener(new Entity(entity, this), name, component);
        });
        return component;
    }
    removeComponent(entity, name) {
        const componentList = this.entityComponents.get(entity);
        if (componentList) {
            const component = this.getComponent(entity, name);
            this.listeners.componentRemoved.forEach((listener) => {
                listener(new Entity(entity, this), name, component);
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
            listener(new Entity(entity, this));
        });
        componentList.forEach((componentName) => {
            this.removeComponent(entity, componentName);
        });
        this.entityComponents.delete(entity);
    }
    getView(groupAll, groupAny = []) {
        const view = new View(groupAll, groupAny);
        this.entityComponents.forEach((c, entityID) => {
            const componentArray = Array.from(c);
            const allComponents = groupAll.filter((e) => componentArray.includes(e));
            if (allComponents.length !== groupAll.length) {
                return;
            }
            const entity = new Entity(entityID, this);
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
const createRegistry$1 = () => new Registry();

// eslint-disable-next-line import/prefer-default-export
const createRegistry = createRegistry$1;

export { createRegistry };
