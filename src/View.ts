import type Entity from './Entity';

export type ComponentGroup<C> = (keyof C)[];

type ViewResult<C> = {
  entity: Entity<C>,
  component: <T extends keyof C>(name: T) => C[T]
  hasComponent: (name: keyof C) => boolean
};

export default class View<C> {
  private resultMap = new Map<Entity<C>, Map<keyof C, C[keyof C]>>()
  ;

  constructor(public groupAll: ComponentGroup<C>, public groupAny: ComponentGroup<C>) {}

  public addComponent<T extends keyof C>(entity: Entity<C>, componentName: T, component: C[T]) {
    let entityMap = this.resultMap.get(entity);
    if (!entityMap) {
      entityMap = new Map<T, C[T]>();
      this.resultMap.set(entity, entityMap);
    }

    entityMap.set(componentName, component);
  }

  public get result() {
    const r: ViewResult<C>[] = [];
    this.resultMap.forEach((components, entity: Entity<C>) => {
      r.push({
        entity,
        component<T extends keyof C>(name: T): C[T] {
          return components.get(name) as C[T];
        },
        hasComponent(name: keyof C): boolean {
          return components.has(name);
        },
      });
    });

    return r;
  }
}
