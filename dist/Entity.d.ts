import { Registry } from './Registry';
export declare type EntityID = number;
export default class Entity<Components> {
    private _id;
    private registry;
    constructor(_id: EntityID, registry: Registry<Components>);
    get id(): number;
    hasComponent<T extends keyof Components>(name: T): boolean;
    addComponent<T extends keyof Components>(name: T, component: Components[T]): Components[T];
    removeComponent(name: keyof Components): void;
    getComponent<T extends keyof Components>(name: T): Components[T];
}
