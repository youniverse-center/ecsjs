import type Entity from './Entity';

export type ComponentGroup<C> = (keyof C)[];

export type ViewResult<C> = {
  entity: Entity<C>,
  component: <T extends keyof C>(name: T) => C[T]
  hasComponent: (name: keyof C) => boolean
};

type ResultEntry<C> = {
  entity: Entity<C>,
  componentMap: Map<keyof C, C[keyof C]>
};

export default class View<C> {
  private resultMap = new Map<number, ResultEntry<C>>();

  constructor(private groupAll: ComponentGroup<C>, private groupAny: ComponentGroup<C>) {}

  public test(entity: Entity<C>): boolean {
    const componentList = entity.components();
    const matchedComponents = this.groupAll.filter((e) => componentList.includes(e));

    return matchedComponents.length === this.groupAll.length;
  }

  public addEntity(entity: Entity<C>): void {
    const componentMap = new Map<keyof C, C[keyof C]>();
    this.resultMap.set(entity.id, {
      entity,
      componentMap,
    });

    [...this.groupAll, ...this.groupAny].forEach((name) => {
      if (entity.hasComponent(name)) {
        componentMap.set(name, entity.getComponent(name));
      }
    });
  }

  public hasEntity(entity: Entity<C>): boolean {
    return this.resultMap.has(entity.id);
  }

  public get result() {
    const r: ViewResult<C>[] = [];
    this.resultMap.forEach((resultEntry) => {
      const components = resultEntry.componentMap;
      r.push({
        entity: resultEntry.entity,
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
