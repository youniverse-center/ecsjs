import Entity, { EntityID } from './Entity';
import View, { ComponentGroup } from './View';
import type { RegistryListeners, ComponentListener, EntityListener } from './RegistryListeners';

const matchesFilter = <T>(name: T, filter: T[]): boolean => !filter.length || filter.includes(name);

export class Registry<C = {}> {
  private entityComponents = new Map<EntityID, Set<keyof C>>();

  private components = new Map();

  private nextEntity: EntityID = 1;

  private listeners: RegistryListeners<C> = {
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

  public createEntity(): Entity<C> {
    const entity = new Entity(this.nextEntity, this);
    this.nextEntity += 1;
    this.entityComponents.set(entity.id, new Set());

    this.listeners.entityCreated.forEach((listener) => {
      listener(entity);
    });

    return entity;
  }

  public getEntity(entity: EntityID) {
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
    if (componentList) {
      componentList.add(name);
      this.getComponentMap(name).set(entity, component);
    }

    this.listeners.componentAdded
      .filter((listener) => matchesFilter(name, listener.filter))
      .forEach((listener) => {
        listener.handler(new Entity(entity, this), name, component);
      });

    return component;
  }

  public removeComponent(entity: EntityID, name: keyof C): void {
    const componentList = this.entityComponents.get(entity);
    if (componentList) {
      const component = this.getComponent(entity, name);
      this.listeners.componentRemoved
        .filter((listener) => matchesFilter(name, listener.filter))
        .forEach((listener) => {
          listener.handler(new Entity(entity, this), name, component);
        });

      componentList.delete(name);
    }
    this.getComponentMap(name).delete(entity);
  }

  public getComponent<T extends keyof C>(entityId: EntityID, name: T): C[T] {
    const component = this.getComponentMap(name).get(entityId);
    if (!component) {
      throw new Error(`Entity ${entityId} does not have component ${name}`);
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
    this.entityComponents.forEach((c, entityID) => {
      const componentArray = Array.from(c);
      const allComponents = groupAll.filter((e) => componentArray.includes(e));
      if (allComponents.length !== groupAll.length) {
        return;
      }

      const entity = new Entity(entityID, this);
      const searchComponents = groupAny.filter((e) => componentArray.includes(e))
        .concat(allComponents);
      searchComponents.forEach((componentName) => {
        const component = this.getComponent(entityID, componentName);
        if (component) {
          view.addComponent(entity, componentName, component);
        }
      });
    });

    return view;
  }

  public all(): Entity<C>[] {
    return Array.from(this.entityComponents.keys()).map((entityId) => new Entity(entityId, this));
  }

  public onComponentAdded(
    listener: ComponentListener<C, keyof C>,
    filter: (keyof C)[] = [],
  ): void {
    this.listeners.componentAdded.push({
      filter: filter,
      handler: listener,
    });
  }

  public offComponentAdded(listener: ComponentListener<C, keyof C>) {
    this.listeners.componentAdded = this.listeners.componentRemoved.filter((l) => l.handler !== listener);
  }

  public onComponentRemoved(
    listener: ComponentListener<C, keyof C>,
    filter: (keyof C)[] = [],
  ) {
    this.listeners.componentRemoved.push({
      filter: filter,
      handler: listener,
    });
  }

  public offComponentRemoved(listener: ComponentListener<C, keyof C>) {
    this.listeners.componentRemoved = this.listeners.componentRemoved.filter((l) => l.handler !== listener);
  }

  public onEntityCreated(listener: EntityListener<C>): void {
    this.listeners.entityCreated.push(listener);
  }

  public offEntityCreated(handler: EntityListener<C>) {
    this.listeners.entityCreated = this.listeners.entityCreated.filter((listener) => listener !== handler);
  }

  public onEntityRemoved(listener: EntityListener<C>): void {
    this.listeners.entityRemoved.push(listener);
  }

  public offEntityRemoved(handler: EntityListener<C>) {
    this.listeners.entityRemoved = this.listeners.entityRemoved.filter((listener) => listener !== handler);
  }
}

const createRegistry = <C>(): Registry<C> => new Registry<C>();

export default createRegistry;
