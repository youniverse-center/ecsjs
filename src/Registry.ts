import Entity, { EntityID } from './Entity';
import View, { ComponentGroup } from './View';
import type { RegistryListeners, ComponentListener, EntityListener } from './RegistryListeners';

const matchesFilter = <T>(name: T, filter: T[]): boolean => !filter.length || filter.includes(name);

type CreateEntityComponents<C> = Partial<{
  [K in keyof C]: C[K]
}>;

export class Registry<C = {}> {
  private entityComponents = new Map<EntityID, Set<keyof C>>();

  private components = new Map();

  private nextEntity: EntityID = 1;

  private listeners: RegistryListeners<C> = {
    afterComponentRemoved: [],
    componentAdded: [],
    componentRemoved: [],
    entityCreated: [],
    entityRemoved: [],
  };

  private getComponentMap<T extends keyof C>(componentName: T): Map<EntityID, C[T]> {
    if (!this.components.has(componentName)) {
      this.components.set(componentName, new Map<EntityID, C[T]>());
    }

    return this.components.get(componentName);
  }

  public createEntity(components: CreateEntityComponents<C> = {}): Entity<C> {
    const entity = new Entity(this.nextEntity, this);
    this.nextEntity += 1;
    this.entityComponents.set(entity.id, new Set());

    this.listeners.entityCreated.forEach((listener) => {
      listener(entity);
    });

    const componentEntries = Object.entries(components) as {
      [K in keyof C]: [K, C[K]]
    }[keyof C][];

    componentEntries.forEach(([name, value]) => {
      entity.addComponent(name, value);
    });

    return entity;
  }

  public getEntity(entity: EntityID) {
    if (!this.entityComponents.has(entity)) {
      throw new Error(`Entity ${entity} not found`);
    }
    return new Entity(entity, this);
  }

  public getComponents(entity: EntityID): (keyof C)[] {
    const components = this.entityComponents.get(entity);
    if (!components) {
      return [];
    }

    return Array.from(components);
  }

  public hasComponent(entity: EntityID, name: keyof C): boolean {
    return this.getComponentMap(name).has(entity);
  }

  public assignComponent<T extends keyof C>(entity: EntityID, name: T, component: C[T]): C[T] {
    const componentList = this.entityComponents.get(entity);
    if (!componentList) {
      throw new Error(`Entity ${entity} not found`);
    }

    componentList.add(name);
    this.getComponentMap(name).set(entity, component);

    this.listeners.componentAdded
      .filter((listener) => matchesFilter(name, listener.filter))
      .forEach((listener) => {
        listener.handler(new Entity(entity, this), name, component);
      });

    return component;
  }

  public removeComponent(entity: EntityID, name: keyof C): void {
    const componentList = this.entityComponents.get(entity);
    if (!componentList) {
      throw new Error(`Entity ${entity} not found`);
    }

    const component = this.getComponent(entity, name);
    this.listeners.componentRemoved
      .filter((listener) => matchesFilter(name, listener.filter))
      .forEach((listener) => {
        listener.handler(new Entity(entity, this), name, component);
      });

    componentList.delete(name);
    this.getComponentMap(name).delete(entity);

    this.listeners.afterComponentRemoved
      .filter((listener) => matchesFilter(name, listener.filter))
      .forEach((listener) => {
        listener.handler(new Entity(entity, this), name, component);
      });
  }

  public getComponent<T extends keyof C>(entityId: EntityID, name: T): C[T] {
    const component = this.getComponentMap(name).get(entityId);
    if (!component) {
      throw new Error(`Entity ${entityId} does not have component ${String(name)}`);
    }

    return component;
  }

  public removeEntity(entity: EntityID): void {
    const componentList = this.entityComponents.get(entity);
    if (!componentList) {
      return;
    }

    this.listeners.entityRemoved.forEach((listener) => {
      listener(new Entity(entity, this));
    });

    componentList.forEach((componentName) => {
      this.removeComponent(entity, componentName);
    });
    this.entityComponents.delete(entity);
  }

  public getView(groupAll: ComponentGroup<C>, groupAny: ComponentGroup<C> = []): View<C> {
    const view = new View(groupAll, groupAny);

    this.all()
      .filter((entity) => view.test(entity))
      .forEach((matchedEntity) => {
        view.addEntity(matchedEntity);
      });

    return view;
  }

  public all(): Entity<C>[] {
    return Array.from(this.entityComponents.keys()).map((entityId) => new Entity(entityId, this));
  }

  public onAfterComponentRemoved(
    listener: ComponentListener<C, keyof C>,
    filter: (keyof C)[] = [],
  ): void {
    this.listeners.afterComponentRemoved.push({
      filter,
      handler: listener,
    });
  }

  public offAfterComponentRemoved(listener: ComponentListener<C, keyof C>) {
    this.listeners.afterComponentRemoved = this.listeners.afterComponentRemoved.filter((l) => (
      l.handler !== listener
    ));
  }

  public onComponentAdded(
    listener: ComponentListener<C, keyof C>,
    filter: (keyof C)[] = [],
  ): void {
    this.listeners.componentAdded.push({
      filter,
      handler: listener,
    });
  }

  public offComponentAdded(listener: ComponentListener<C, keyof C>) {
    this.listeners.componentAdded = this.listeners
      .componentAdded.filter((l) => l.handler !== listener);
  }

  public onComponentRemoved(
    listener: ComponentListener<C, keyof C>,
    filter: (keyof C)[] = [],
  ) {
    this.listeners.componentRemoved.push({
      filter,
      handler: listener,
    });
  }

  public offComponentRemoved(listener: ComponentListener<C, keyof C>) {
    this.listeners.componentRemoved = this.listeners
      .componentRemoved.filter((l) => l.handler !== listener);
  }

  public onEntityCreated(listener: EntityListener<C>): void {
    this.listeners.entityCreated.push(listener);
  }

  public offEntityCreated(handler: EntityListener<C>) {
    this.listeners.entityCreated = this.listeners
      .entityCreated.filter((listener) => listener !== handler);
  }

  public onEntityRemoved(listener: EntityListener<C>): void {
    this.listeners.entityRemoved.push(listener);
  }

  public offEntityRemoved(handler: EntityListener<C>) {
    this.listeners.entityRemoved = this.listeners
      .entityRemoved.filter((listener) => listener !== handler);
  }
}

const createRegistry = <C>(): Registry<C> => new Registry<C>();

export default createRegistry;
