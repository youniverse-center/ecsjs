import type Entity from './Entity';
export declare type EntityListener = <C>(entity: Entity<C>) => void;
export declare type ComponentListener<C, T extends keyof C> = (entity: Entity<C>, name: T, component: C[T]) => void;
export declare type RegistryListenerTypes<C> = {
    componentAdded: ComponentListener<C, keyof C>;
    componentRemoved: ComponentListener<C, keyof C>;
    entityCreated: EntityListener;
    entityRemoved: EntityListener;
};
export declare type RegistryListener<C, T extends keyof RegistryListenerTypes<C>> = RegistryListenerTypes<C>[T];
export declare type RegistryListeners<C> = {
    componentAdded: ComponentListener<C, keyof C>[];
    componentRemoved: ComponentListener<C, keyof C>[];
    entityCreated: EntityListener[];
    entityRemoved: EntityListener[];
};
