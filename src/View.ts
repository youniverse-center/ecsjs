import Entity from './Entity'

export type ComponentGroup<C> = (keyof C)[]

type ViewResult<C> = {
    entity: Entity<C>,
    component: <T extends keyof C>(name: T) => C[T]
    hasComponent: (name: keyof C) => boolean
}

export default class View<C> {
    private _result = new Map<Entity<C>, Map<keyof C, C[keyof C]>>()
    constructor(public groupAll: ComponentGroup<C>, public groupAny: ComponentGroup<C>) {}

    public addComponent<T extends keyof C>(entity: Entity<C>, componentName: T, component: C[T])
    {
        let entityMap = this._result.get(entity)
        if (!entityMap) {
            entityMap = new Map<T, C[T]>()
            this._result.set(entity, entityMap)
        }

        entityMap.set(componentName, component)
    }

    public get result() {
        const r: ViewResult<C>[] = [];
        this._result.forEach((components, entity: Entity<C>) => {
            r.push({
                entity: entity,
                component<T extends keyof C>(name: T): C[T] {
                    return components.get(name) as C[T]
                },
                hasComponent(name: keyof C): boolean {
                    return components.has(name)
                }
            })
        })

        return r
    }
}
