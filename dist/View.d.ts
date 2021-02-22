import Entity from './Entity';
export declare type ComponentGroup<Components> = (keyof Components)[];
declare type ViewResult<Components> = {
    entity: Entity<Components>;
    component: <T extends keyof Components>(name: T) => Components[T];
    hasComponent: (name: keyof Components) => boolean;
};
export default class View<Components> {
    groupAll: ComponentGroup<Components>;
    groupAny: ComponentGroup<Components>;
    private _result;
    constructor(groupAll: ComponentGroup<Components>, groupAny: ComponentGroup<Components>);
    addComponent<T extends keyof Components>(entity: Entity<Components>, componentName: T, component: Components[T]): void;
    get result(): ViewResult<Components>[];
}
export {};
