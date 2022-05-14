# Getting Started

It is strongly recommended to use TypeScript so you will have all the goodies what comes with typing and code completion.

## Create registry without TypeScript

```js
// src/ecs.js
import { createRegistry } from '@youniverse-center/ecsjs';

export default createRegistry();
```

And you are good to go with the entities and components.

## Create registry with TypeScript

First we will create typings for our components:

```ts
//src/components.ts
import { Vector2 } from 'three';

type NameComponent {
    value: string
}

type TagsComponent {
    tags: string[]
}

type TransformComponent {
    position: Vector2
}

export type Components = {
    Name: NameComponent,
    Tags: TagsComponent,
    Transform: TransformComponent
}
```

Then we create the registry pointing what components we have.

```ts
// src/ecs.ts
import { createRegistry } from '@youniverse-center/ecsjs';
import Components from './components';

export createRegistry<Components>();
```

## Create entity

To create entity use `createEntity(): Entity` method on the registry.

```ts
import ecs from './ecs.ts';

const entity = ecs.createEntity();
```

## Add component

```ts
import ecs from './ecs.ts';

const entity = ecs.createEntity();

// with entity wrapper
const tagsComponent = entity.addComponent('Tags', { tags: ['awesomness'] });
// addComponent returs reference to the component
tagsComponent.tags.push('another tag');

// or with registry
const nameComponent = ecs.assignComponent(entity.id, 'Name', {
  value: 'Some awesome entity',
});
//assignComponent returns reference to the component
nameComponent.value = 'More than awesome entity';
```

::: tip
From version 1.3.2 you can assign components when creating entity like this:
```typescript
entity = ecs.createEntity({
  Tags: {
    tags: ['awesomness']
  },
  Name: {
    value: 'Some awesome entity'
  }
});
```
:::

## Query the registry

To get entities with specific components use `getView(allComponents: ComponentGroup, anyComponents: ComponentGroup): View`

By `allComponents` you specify what components the entity has to have.
By `anyComponents` you specify what components you are interested in but the entity doesn't have to have it.

`ComponentGroup` is an array of keys of your components (`type ComponentGroup = (keyof Components)[]`)

This method will return the View object with `result` accessor, what is an array of the produced entity view elements.
Each of this elements are:

- `entity: Entity` - entity object wrapper
- `component: <T keyof Components>(componentName: T) => Components[T]` - method to get one of the components specified in the query
- `hasComponent: (componentName: keyof Components) => boolean` - method to get info if the view has a component for current entity

```ts
import ecs from './ecs';

const view = ecs.getView(['Name'], ['Tags']);

view.result.forEach(({ entity, component, hasComponent }) => {
  console.log(`Entity ${entity.id} is called ${component('Name').value}.`);

  if (hasComponent('Tags')) {
    console.log(` * Is tagged with: ${component('Tags').tags.join(', ')}`);
  }

  if (entity.hasComponent('Transform')) {
    const pos = entity.getComponent('Transform').position;
    console.log(
      `I did not ask for this but this entity is special.
      It has a place at: ${pos.x}:${pos.y}.`
    );
  }
});
```

::: tip
Don't confuse `component` and `hasComponent` with the methods available on the entity object wrapper.
This components are in the context of the view and will only have components you specifed in the query.
If you need other components, use methods on the entity wrapper object.
:::
