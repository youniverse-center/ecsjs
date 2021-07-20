import Entity, { EntityID } from './Entity';
import View, { ComponentGroup } from './View';
import type { RegistryListenerTypes } from './RegistryListeners';
export declare class Registry<C = {}> {
    private entityComponents;
    private components;
    private nextEntity;
    private listeners;
    private getComponentMap;
    createEntity(): Entity<C>;
    hasComponent(entity: EntityID, name: keyof C): boolean;
    assignComponent<T extends keyof C>(entity: EntityID, name: T, component: C[T]): C[T];
    removeComponent(entity: EntityID, name: keyof C): void;
    getComponent<T extends keyof C>(entityId: EntityID, name: T): C[T];
    removeEntity(entity: EntityID): void;
    getView(groupAll: ComponentGroup<C>, groupAny?: ComponentGroup<C>): View<C>;
    registerListener<T extends keyof RegistryListenerTypes<C>>(name: T, listener: RegistryListenerTypes<C>[T]): void;
}
declare const createRegistry: <C>() => Registry<C>;
export default createRegistry;
