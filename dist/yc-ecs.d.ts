declare type EntityID = number;
declare class Entity<C> {
    private entityId;
    private registry;
    constructor(entityId: EntityID, registry: Registry<C>);
    get id(): number;
    hasComponent<T extends keyof C>(name: T): boolean;
    addComponent<T extends keyof C>(name: T, component: C[T]): C[T];
    removeComponent(name: keyof C): void;
    getComponent<T extends keyof C>(name: T): C[T];
}

declare type ComponentGroup<C> = (keyof C)[];
declare type ViewResult<C> = {
    entity: Entity<C>;
    component: <T extends keyof C>(name: T) => C[T];
    hasComponent: (name: keyof C) => boolean;
};
declare class View<C> {
    groupAll: ComponentGroup<C>;
    groupAny: ComponentGroup<C>;
    private resultMap;
    constructor(groupAll: ComponentGroup<C>, groupAny: ComponentGroup<C>);
    addComponent<T extends keyof C>(entity: Entity<C>, componentName: T, component: C[T]): void;
    get result(): ViewResult<C>[];
}

declare type EntityListener = <C>(entity: Entity<C>) => void;
declare type ComponentListener<C, T extends keyof C> = (entity: Entity<C>, name: T, component: C[T]) => void;
declare type RegistryListenerTypes<C> = {
    componentAdded: ComponentListener<C, keyof C>;
    componentRemoved: ComponentListener<C, keyof C>;
    entityCreated: EntityListener;
    entityRemoved: EntityListener;
};
declare type RegistryListener<C, T extends keyof RegistryListenerTypes<C>> = RegistryListenerTypes<C>[T];

declare class Registry<C = {}> {
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

export { ComponentGroup, ComponentListener, Entity, EntityListener, Registry, RegistryListener, View, createRegistry };
