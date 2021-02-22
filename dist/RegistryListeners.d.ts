import Entity from './Entity';
export declare type EntityListener = <Components>(entity: Entity<Components>) => void;
export declare type ComponentListener<Components, T extends keyof Components> = (entity: Entity<Components>, name: T, component: Components[T]) => void;
export declare type RegistryListenerTypes<Components> = {
    componentAdded: ComponentListener<Components, keyof Components>;
    componentRemoved: ComponentListener<Components, keyof Components>;
    entityCreated: EntityListener;
    entityRemoved: EntityListener;
};
export declare type RegistryListener<Components, T extends keyof RegistryListenerTypes<Components>> = RegistryListenerTypes<Components>[T];
export declare type RegistryListeners<Components> = {
    componentAdded: ComponentListener<Components, keyof Components>[];
    componentRemoved: ComponentListener<Components, keyof Components>[];
    entityCreated: EntityListener[];
    entityRemoved: EntityListener[];
};
