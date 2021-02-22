import Entity, { EntityID } from './Entity';
import View, { ComponentGroup } from './View';
import { RegistryListenerTypes } from './RegistryListeners';
export declare class Registry<Components = {}> {
    private entityComponents;
    private components;
    private nextEntity;
    private listeners;
    private getComponentMap;
    createEntity(): Entity<Components>;
    hasComponent(entity: EntityID, name: keyof Components): boolean;
    assignComponent<T extends keyof Components>(entity: EntityID, name: T, component: Components[T]): Components[T];
    removeComponent(entity: EntityID, name: keyof Components): void;
    getComponent<T extends keyof Components>(entityId: EntityID, name: T): Components[T];
    removeEntity(entity: EntityID): void;
    getView(groupAll: ComponentGroup<Components>, groupAny?: ComponentGroup<Components>): View<Components>;
    registerListener<T extends keyof RegistryListenerTypes<Components>>(name: T, listener: RegistryListenerTypes<Components>[T]): void;
}
declare const createRegistry: <Components>() => Registry<Components>;
export default createRegistry;
