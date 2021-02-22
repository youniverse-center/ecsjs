import Entity from './Entity'

export type ComponentGroup<Components> = (keyof Components)[]

type ViewResult<Components> = {
    entity: Entity<Components>,
    component: <T extends keyof Components>(name: T) => Components[T]
    hasComponent: (name: keyof Components) => boolean
}

export default class View<Components> {
    private _result = new Map<Entity<Components>, Map<keyof Components, Components[keyof Components]>>()
    constructor(public groupAll: ComponentGroup<Components>, public groupAny: ComponentGroup<Components>) {}

    public addComponent<T extends keyof Components>(entity: Entity<Components>, componentName: T, component: Components[T])
    {
        let entityMap = this._result.get(entity)
        if (!entityMap) {
            entityMap = new Map<T, Components[T]>()
            this._result.set(entity, entityMap)
        }

        entityMap.set(componentName, component)
    }

    public get result() {
        const r: ViewResult<Components>[] = [];
        this._result.forEach((components, entity: Entity<Components>) => {
            r.push({
                entity: entity,
                component<T extends keyof Components>(name: T): Components[T] {
                    return components.get(name) as Components[T]
                },
                hasComponent(name: keyof Components): boolean {
                    return components.has(name)
                }
            })
        })

        return r
    }
}
