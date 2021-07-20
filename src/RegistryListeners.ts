import Entity from './Entity';

export type EntityListener = <C>(entity: Entity<C>) => void
export type ComponentListener<C, T extends keyof C> = (entity: Entity<C>, name: T, component: C[T]) => void

export type RegistryListenerTypes<C> = {
    componentAdded: ComponentListener<C, keyof C>,
    componentRemoved: ComponentListener<C, keyof C>,
    entityCreated: EntityListener,
    entityRemoved: EntityListener
}

export type RegistryListener<C, T extends keyof RegistryListenerTypes<C>> = RegistryListenerTypes<C>[T]

export type RegistryListeners<C> = {
    componentAdded: ComponentListener<C, keyof C>[],
    componentRemoved: ComponentListener<C, keyof C>[],
    entityCreated: EntityListener[],
    entityRemoved: EntityListener[]
}
