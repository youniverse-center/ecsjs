import type Entity from './Entity';

export type ComponentGroup<C> = (keyof C)[];

type ViewResult<C> = {
  entity: Entity<C>,
  component: <T extends keyof C>(name: T) => C[T]
  hasComponent: (name: keyof C) => boolean
};

export default class View<C> {
  private resultMap = new Map<Entity<C>, Map<keyof C, C[keyof C]>>();

  constructor(private groupAll: ComponentGroup<C>, private groupAny: ComponentGroup<C>) {}

  public test(entity: Entity<C>): boolean {
    const componentList = entity.components();
    const matchedComponents = this.groupAll.filter((e) => componentList.includes(e));

    return matchedComponents.length === this.groupAll.length;
  }

  public addEntity(entity: Entity<C>): void {
    const entityMap = new Map<keyof C, C[keyof C]>();
    this.resultMap.set(entity, entityMap);

    [...this.groupAll, ...this.groupAny].forEach((name) => {
      if (entity.hasComponent(name)) {
        entityMap.set(name, entity.getComponent(name));
      }
    });
  }

  public hasEntity(entity: Entity<C>): boolean {
    return this.resultMap.has(entity);
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
