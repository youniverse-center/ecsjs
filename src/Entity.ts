import { Registry } from './Registry'

export type EntityID = number

export default class Entity<C> {
    constructor(private _id: EntityID, private registry: Registry<C>) {}

    public get id() {
        return this._id
    }

    public hasComponent<T extends keyof C>(name: T): boolean
    {
        return this.registry.hasComponent(this._id, name)
    }

    public addComponent<T extends keyof C>(name: T, component: C[T]): C[T]
    {
        return this.registry.assignComponent(this._id, name, component)
    }

    public removeComponent(name: keyof C): void
    {
        this.registry.removeComponent(this._id, name)
    }

    public getComponent<T extends keyof C>(name: T): C[T]
    {
        return this.registry.getComponent(this._id, name)
    }
}