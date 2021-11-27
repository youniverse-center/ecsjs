import type { Registry } from './Registry';

export type EntityID = number;

export default class Entity<C> {
  constructor(private entityId: EntityID, private registry: Registry<C>) {}

  public get id() {
    return this.entityId;
  }

  public components(): (keyof C)[] {
    return this.registry.getComponents(this.entityId);
  }

  public hasComponent<T extends keyof C>(name: T): boolean {
    return this.registry.hasComponent(this.entityId, name);
  }

  public addComponent<T extends keyof C>(name: T, component: C[T]): C[T] {
    return this.registry.assignComponent(this.entityId, name, component);
  }

  public removeComponent(name: keyof C): void {
    this.registry.removeComponent(this.entityId, name);
  }

  public getComponent<T extends keyof C>(name: T): C[T] {
    return this.registry.getComponent(this.entityId, name);
  }
}
