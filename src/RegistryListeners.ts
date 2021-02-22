import Entity from './Entity';

export type EntityListener = <Components>(entity: Entity<Components>) => void
export type ComponentListener<Components, T extends keyof Components> = (entity: Entity<Components>, name: T, component: Components[T]) => void

export type RegistryListenerTypes<Components> = {
    componentAdded: ComponentListener<Components, keyof Components>,
    componentRemoved: ComponentListener<Components, keyof Components>,
    entityCreated: EntityListener,
    entityRemoved: EntityListener
}

export type RegistryListener<Components, T extends keyof RegistryListenerTypes<Components>> = RegistryListenerTypes<Components>[T]

export type RegistryListeners<Components> = {
    componentAdded: ComponentListener<Components, keyof Components>[],
    componentRemoved: ComponentListener<Components, keyof Components>[],
    entityCreated: EntityListener[],
    entityRemoved: EntityListener[]
}
