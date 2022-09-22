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

## Cachable View

::: warning
This feature is available since version 1.4.0.
:::

When creating view by `getView()` it won't update it's result. When you want to check if the view has changed (entity with given components were added or removed) you had to query the registry again.

Version 1.4.0 introduce a new `CacheableView` class which listens to component addition or deletion in the registry.

If there was a change in the registry that does not affect the view, view will stay valid and by calling the result the registry won't be queried.

If there is a change that will affect the view, then all view is discarded and will be rebuild when accessing the view results.

***NOTE:** Registry is queried when you call the result property for the first time or the view was discarded, not when creating CacheableView.*

```ts
import ecs from './ecs';
import { CacheableView } from '@youniverse-center/ecsjs'

// CacheableView(registry, requiredComponents, optionalComponents)
const view = new CacheableView(ecs, ['Name'], ['Tags'])
// registry not queried yet

const entityIdsInView = view.result.map(({ entity }) => entity.id)
// registry queried for the first time

const viewResultsWithNameAndTags = view.result
  .filter(({ hasComponent }) => hasComponent('Tags'))
// registry is not queried again, there was no change

ecs.createEntity({
  Tags: {
    tags: ['some tag']
  }
})

view.result
// view is still valid - added entity does not fit in the view - it does
// not have all required components, the registry won't be queried

ecs.createEntity({
  Name: {
    value: 'New entity'
  }
})
// view is invalidated but registry is not queried yet

view.result // query registry for updated results
```
