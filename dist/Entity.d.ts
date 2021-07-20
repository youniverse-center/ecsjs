import type { Registry } from './Registry';
export declare type EntityID = number;
export default class Entity<C> {
    private entityId;
    private registry;
    constructor(entityId: EntityID, registry: Registry<C>);
    get id(): number;
    hasComponent<T extends keyof C>(name: T): boolean;
    addComponent<T extends keyof C>(name: T, component: C[T]): C[T];
    removeComponent(name: keyof C): void;
    getComponent<T extends keyof C>(name: T): C[T];
}
