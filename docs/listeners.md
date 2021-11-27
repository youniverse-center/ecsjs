# Listeners

You can also add some basic listeners to the registry.

There are four self explanatory listeners:

- `componentAdded`
- `componentRemoved`
- `entityCreated`
- `entityRemoved`

You can register listeners with `on*` methods on the registry and unregister with `off*` methods.

The `component*` listeners accept listeners like:

```ts
<T extends keyof Components>(entity: Entity, name: T, component: Components[T]) => void
```

and the `entity*` listeners:

```ts
(entity: Entity) => void
```

For example:

```ts
type Components = {
  Name: {
    value: string;
  };
  SomeComponent: {};
};

import { createRegistry } from '@youniverse-center/ecsjs';

const reg = createRegistry<Components>();

reg.onEntityCreated((entity) => {
  console.log(`Entity ${entity.id} created.`);
});

reg.onEntityRemoved((entity) => {
  console.log(`Entity ${entity.id} removed`);
});

reg.onComponentAdded((entity, componentName, component) => {
  console.log(
    `Component "${componentName}" added to entity ${entity.id}`,
    component
  );
}, []);

reg.onComponentRemoved((entity, componentName, component) => {
  console.log(
    `Component "${componentName}" removed from entity ${entity.id}`,
    component
  );
});

const entityA = reg.createEntity();
entityA.addComponent('Name', { value: 'Entity A' });

const entityB = reg.createEntity();
const entityC = reg.createEntity();

entityB.addComponent('Name', { value: 'Entity B' });
entityB.addComponent('SomeComponent', {});
entityC.addComponent('Name', { value: 'Entity C' });
entityC.addComponent('SomeComponent', {});

entityC.removeComponent('SomeComponent');

reg.removeEntity(entityB.id);
reg.removeEntity(entityC.id);
```

will result in console

```bash
Entity 1 created.
Component "Name" added to entity 1 { value: 'Entity A' }
Entity 2 created.
Entity 3 created.
Component "Name" added to entity 2 { value: 'Entity B' }
Component "SomeComponent" added to entity 2 {}
Component "Name" added to entity 3 { value: 'Entity C' }
Component "SomeComponent" added to entity 3 {}
Component "SomeComponent" removed from entity 3 {}
Entity 2 removed
Component "Name" removed from entity 2 { value: 'Entity B' }
Component "SomeComponent" removed from entity 2 {}
Entity 3 removed
Component "Name" removed from entity 3 { value: 'Entity C' }
```

::: tip
`entityRemoved` event is fired before removing components, so you have access to all components of that entity when the `removeEntity` was called.
:::
