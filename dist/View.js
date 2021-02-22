export default class View {
    constructor(groupAll, groupAny) {
        this.groupAll = groupAll;
        this.groupAny = groupAny;
        this._result = new Map();
    }
    addComponent(entity, componentName, component) {
        let entityMap = this._result.get(entity);
        if (!entityMap) {
            entityMap = new Map();
            this._result.set(entity, entityMap);
        }
        entityMap.set(componentName, component);
    }
    get result() {
        const r = [];
        this._result.forEach((components, entity) => {
            r.push({
                entity: entity,
                component(name) {
                    return components.get(name);
                },
                hasComponent(name) {
                    return components.has(name);
                }
            });
        });
        return r;
    }
}
