import type Entity from './Entity';
export declare type ComponentGroup<C> = (keyof C)[];
declare type ViewResult<C> = {
    entity: Entity<C>;
    component: <T extends keyof C>(name: T) => C[T];
    hasComponent: (name: keyof C) => boolean;
};
export default class View<C> {
    groupAll: ComponentGroup<C>;
    groupAny: ComponentGroup<C>;
    private resultMap;
    constructor(groupAll: ComponentGroup<C>, groupAny: ComponentGroup<C>);
    addComponent<T extends keyof C>(entity: Entity<C>, componentName: T, component: C[T]): void;
    get result(): ViewResult<C>[];
}
export {};
