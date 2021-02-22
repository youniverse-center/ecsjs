import { Registry } from './Registry'

export type EntityID = number

export default class Entity<Components> {
    constructor(private _id: EntityID, private registry: Registry<Components>) {}

    public get id() {
        return this._id
    }

    public hasComponent<T extends keyof Components>(name: T): boolean
    {
        return this.registry.hasComponent(this._id, name)
    }

    public addComponent<T extends keyof Components>(name: T, component: Components[T]): Components[T]
    {
        return this.registry.assignComponent(this._id, name, component)
    }

    public removeComponent(name: keyof Components): void
    {
        this.registry.removeComponent(this._id, name)
    }

    public getComponent<T extends keyof Components>(name: T): Components[T]
    {
        return this.registry.getComponent(this._id, name)
    }
}