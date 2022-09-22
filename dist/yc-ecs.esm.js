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
    components() {
        return this.registry.getComponents(this.entityId);
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
    test(entity) {
        const componentList = entity.components();
        const matchedComponents = this.groupAll.filter((e) => componentList.includes(e));
        return matchedComponents.length === this.groupAll.length;
    }
    addEntity(entity) {
        const componentMap = new Map();
        this.resultMap.set(entity.id, {
            entity,
            componentMap,
        });
        [...this.groupAll, ...this.groupAny].forEach((name) => {
            if (entity.hasComponent(name)) {
                componentMap.set(name, entity.getComponent(name));
            }
        });
    }
    hasEntity(entity) {
        return this.resultMap.has(entity.id);
    }
    get result() {
        const r = [];
        this.resultMap.forEach((resultEntry) => {
            const components = resultEntry.componentMap;
            r.push({
                entity: resultEntry.entity,
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

const matchesFilter = (name, filter) => !filter.length || filter.includes(name);
class Registry {
    entityComponents = new Map();
    components = new Map();
    nextEntity = 1;
    listeners = {
        afterComponentRemoved: [],
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
    createEntity(components = {}) {
        const entity = new Entity(this.nextEntity, this);
        this.nextEntity += 1;
        this.entityComponents.set(entity.id, new Set());
        this.listeners.entityCreated.forEach((listener) => {
            listener(entity);
        });
        const componentEntries = Object.entries(components);
        componentEntries.forEach(([name, value]) => {
            entity.addComponent(name, value);
        });
        return entity;
    }
    getEntity(entity) {
        if (!this.entityComponents.has(entity)) {
            throw new Error(`Entity ${entity} not found`);
        }
        return new Entity(entity, this);
    }
    getComponents(entity) {
        const components = this.entityComponents.get(entity);
        if (!components) {
            return [];
        }
        return Array.from(components);
    }
    hasComponent(entity, name) {
        return this.getComponentMap(name).has(entity);
    }
    assignComponent(entity, name, component) {
        const componentList = this.entityComponents.get(entity);
        if (!componentList) {
            throw new Error(`Entity ${entity} not found`);
        }
        componentList.add(name);
        this.getComponentMap(name).set(entity, component);
        this.listeners.componentAdded
            .filter((listener) => matchesFilter(name, listener.filter))
            .forEach((listener) => {
            listener.handler(new Entity(entity, this), name, component);
        });
        return component;
    }
    removeComponent(entity, name) {
        const componentList = this.entityComponents.get(entity);
        if (!componentList) {
            throw new Error(`Entity ${entity} not found`);
        }
        const component = this.getComponent(entity, name);
        this.listeners.componentRemoved
            .filter((listener) => matchesFilter(name, listener.filter))
            .forEach((listener) => {
            listener.handler(new Entity(entity, this), name, component);
        });
        componentList.delete(name);
        this.getComponentMap(name).delete(entity);
        this.listeners.afterComponentRemoved
            .filter((listener) => matchesFilter(name, listener.filter))
            .forEach((listener) => {
            listener.handler(new Entity(entity, this), name, component);
        });
    }
    getComponent(entityId, name) {
        const component = this.getComponentMap(name).get(entityId);
        if (!component) {
            throw new Error(`Entity ${entityId} does not have component ${String(name)}`);
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
        this.all()
            .filter((entity) => view.test(entity))
            .forEach((matchedEntity) => {
            view.addEntity(matchedEntity);
        });
        return view;
    }
    all() {
        return Array.from(this.entityComponents.keys()).map((entityId) => new Entity(entityId, this));
    }
    onAfterComponentRemoved(listener, filter = []) {
        this.listeners.afterComponentRemoved.push({
            filter,
            handler: listener,
        });
    }
    offAfterComponentRemoved(listener) {
        this.listeners.afterComponentRemoved = this.listeners.afterComponentRemoved.filter((l) => (l.handler !== listener));
    }
    onComponentAdded(listener, filter = []) {
        this.listeners.componentAdded.push({
            filter,
            handler: listener,
        });
    }
    offComponentAdded(listener) {
        this.listeners.componentAdded = this.listeners
            .componentAdded.filter((l) => l.handler !== listener);
    }
    onComponentRemoved(listener, filter = []) {
        this.listeners.componentRemoved.push({
            filter,
            handler: listener,
        });
    }
    offComponentRemoved(listener) {
        this.listeners.componentRemoved = this.listeners
            .componentRemoved.filter((l) => l.handler !== listener);
    }
    onEntityCreated(listener) {
        this.listeners.entityCreated.push(listener);
    }
    offEntityCreated(handler) {
        this.listeners.entityCreated = this.listeners
            .entityCreated.filter((listener) => listener !== handler);
    }
    onEntityRemoved(listener) {
        this.listeners.entityRemoved.push(listener);
    }
    offEntityRemoved(handler) {
        this.listeners.entityRemoved = this.listeners
            .entityRemoved.filter((listener) => listener !== handler);
    }
}
const createRegistry = () => new Registry();

class CacheableView {
    registry;
    requiredComponents;
    optionalComponents;
    view = null;
    constructor(registry, requiredComponents, optionalComponents = []) {
        this.registry = registry;
        this.requiredComponents = requiredComponents;
        this.optionalComponents = optionalComponents;
        const viewComponents = [
            ...this.requiredComponents,
            ...this.optionalComponents,
        ];
        this.registry.onComponentAdded(this.onEntityChanged.bind(this), viewComponents);
        this.registry.onAfterComponentRemoved(this.onEntityChanged.bind(this), viewComponents);
    }
    get result() {
        if (this.view === null) {
            this.rebuildView();
        }
        return this.view.result;
    }
    invalidate() {
        this.view = null;
    }
    rebuildView() {
        this.view = this.registry.getView(this.requiredComponents, this.optionalComponents);
    }
    onEntityChanged(entity) {
        if (this.view === null) {
            return;
        }
        const hasAllRequiredComponents = this.requiredComponents.every((componentName) => (entity.hasComponent(componentName)));
        if ((hasAllRequiredComponents && !this.view.hasEntity(entity))
            || (!hasAllRequiredComponents && this.view.hasEntity(entity))) {
            this.invalidate();
        }
    }
}

export { CacheableView, createRegistry };
