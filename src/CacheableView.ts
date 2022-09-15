import Entity from './Entity';
import { Registry } from './Registry';
import View, { ComponentGroup, ViewResult } from './View';

export default class CacheableView<T> {
  private view: View<T> | null = null;

  constructor(
    private registry: Registry<T>,
    private requiredComponents: ComponentGroup<T>,
    private optionalComponents: ComponentGroup<T> = [],
  ) {
    const viewComponents = [
      ...this.requiredComponents,
      ...this.optionalComponents,
    ];

    this.registry.onComponentAdded(this.onEntityChanged.bind(this), viewComponents);
    this.registry.onAfterComponentRemoved(this.onEntityChanged.bind(this), viewComponents);
  }

  get result(): ViewResult<T>[] {
    if (this.view === null) {
      this.rebuildView();
    }

    return this.view!.result;
  }

  public invalidate() {
    this.view = null;
  }

  private rebuildView() {
    this.view = this.registry.getView(this.requiredComponents, this.optionalComponents);
  }

  private onEntityChanged(entity: Entity<T>) {
    if (this.view === null) {
      return;
    }

    const hasAllRequiredComponents = this.requiredComponents.every((componentName) => (
      entity.hasComponent(componentName)
    ));

    if (
      (hasAllRequiredComponents)
      || (!hasAllRequiredComponents && this.view!.hasEntity(entity))
    ) {
      this.invalidate();
    }
  }
}
