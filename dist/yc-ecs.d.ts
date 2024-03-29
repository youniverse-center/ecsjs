declare type EntityID = number;
declare class Entity<C> {
    private entityId;
    private registry;
    constructor(entityId: EntityID, registry: Registry<C>);
    get id(): number;
    components(): (keyof C)[];
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
    private groupAll;
    private groupAny;
    private resultMap;
    constructor(groupAll: ComponentGroup<C>, groupAny: ComponentGroup<C>);
    test(entity: Entity<C>): boolean;
    addEntity(entity: Entity<C>): void;
    hasEntity(entity: Entity<C>): boolean;
    get result(): ViewResult<C>[];
}

declare type EntityListener<C> = (entity: Entity<C>) => void;
declare type ComponentListener<C, T extends keyof C> = (entity: Entity<C>, name: T, component: C[T]) => void;
declare type RegistryListenerTypes<C> = {
    componentAdded: ComponentListener<C, keyof C>;
    componentRemoved: ComponentListener<C, keyof C>;
    entityCreated: EntityListener<C>;
    entityRemoved: EntityListener<C>;
};
declare type RegistryListener<C, T extends keyof RegistryListenerTypes<C>> = RegistryListenerTypes<C>[T];

declare type CreateEntityComponents<C> = Partial<{
    [K in keyof C]: C[K];
}>;
declare class Registry<C = {}> {
    private entityComponents;
    private components;
    private nextEntity;
    private listeners;
    private getComponentMap;
    createEntity(components?: CreateEntityComponents<C>): Entity<C>;
    getEntity(entity: EntityID): Entity<C>;
    getComponents(entity: EntityID): (keyof C)[];
    hasComponent(entity: EntityID, name: keyof C): boolean;
    assignComponent<T extends keyof C>(entity: EntityID, name: T, component: C[T]): C[T];
    removeComponent(entity: EntityID, name: keyof C): void;
    getComponent<T extends keyof C>(entityId: EntityID, name: T): C[T];
    removeEntity(entity: EntityID): void;
    getView(groupAll: ComponentGroup<C>, groupAny?: ComponentGroup<C>): View<C>;
    all(): Entity<C>[];
    onAfterComponentRemoved(listener: ComponentListener<C, keyof C>, filter?: (keyof C)[]): void;
    offAfterComponentRemoved(listener: ComponentListener<C, keyof C>): void;
    onComponentAdded(listener: ComponentListener<C, keyof C>, filter?: (keyof C)[]): void;
    offComponentAdded(listener: ComponentListener<C, keyof C>): void;
    onComponentRemoved(listener: ComponentListener<C, keyof C>, filter?: (keyof C)[]): void;
    offComponentRemoved(listener: ComponentListener<C, keyof C>): void;
    onEntityCreated(listener: EntityListener<C>): void;
    offEntityCreated(handler: EntityListener<C>): void;
    onEntityRemoved(listener: EntityListener<C>): void;
    offEntityRemoved(handler: EntityListener<C>): void;
}
declare const createRegistry: <C>() => Registry<C>;

declare class CacheableView<T> {
    private registry;
    private requiredComponents;
    private optionalComponents;
    private view;
    constructor(registry: Registry<T>, requiredComponents: ComponentGroup<T>, optionalComponents?: ComponentGroup<T>);
    get result(): ViewResult<T>[];
    invalidate(): void;
    private rebuildView;
    private onEntityChanged;
}

export { CacheableView, ComponentGroup, ComponentListener, Entity, EntityListener, Registry, RegistryListener, View, createRegistry };
