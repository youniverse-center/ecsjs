import createRegistry, { Registry } from '../src/Registry';

type Components = {
  Tag: {
    name: string
  },
  Name: {
    value: string
  },
  Position: {
    x: number,
    y: number,
    z: number
  }
};

describe('Registry', () => {
  let registry: Registry<Components>;

  beforeEach(() => {
    registry = createRegistry<Components>();
  });

  test('creates entities with sequential ids', () => {
    const entity1 = registry.createEntity();
    const entity2 = registry.createEntity();
    expect(entity1.id).toBe(1);
    expect(entity2.id).toBe(2);
  });

  test('creates entity with components', () => {
    const entity = registry.createEntity({
      Name: {
        value: 'Entity name',
      },
      Tag: {
        name: 'Some tag',
      },
    });

    expect(entity.components()).toStrictEqual(['Name', 'Tag']);
  });

  test('creates entity with specified component value', () => {
    const entity = registry.createEntity({
      Name: {
        value: 'Some entity',
      },
    });

    expect(entity.getComponent('Name').value).toBe('Some entity');
  });

  test('created entity has component passed on cretating function', () => {
    const entity = registry.createEntity({
      Name: {
        value: 'Some entity',
      },
    });

    expect(entity.hasComponent('Name')).toBe(true);
  });

  test('triggers component added listener when creating entity with component', () => {
    let triggeredListener = false;
    registry.onComponentAdded((entity, name, component) => {
      triggeredListener = entity.id === 1
        && name === 'Name'
        && (component as Components['Name']).value === 'Some other entity';
    });

    registry.createEntity({
      Name: {
        value: 'Some other entity',
      },
    });

    expect(triggeredListener).toBe(true);
  });

  test('triggers component added listener when creating entity with component after entity created listener', () => {
    let entityCreatedTriggered = false;
    let triggeredSecond = false;
    registry.onComponentAdded(() => {
      triggeredSecond = entityCreatedTriggered;
    });
    registry.onEntityCreated((entity) => {
      entityCreatedTriggered = entity.id === 1;
    });

    registry.createEntity({
      Name: {
        value: 'Some awesome entity',
      },
    });

    expect(triggeredSecond).toBe(true);
  });

  test('removes component added listener', () => {
    let i = 0;
    const listener = () => {
      i += 1;
    };

    registry.onComponentAdded(listener);
    const entity = registry.createEntity();
    entity.addComponent('Tag', { name: 'tag' });
    registry.offComponentAdded(listener);
    const entity2 = registry.createEntity();
    entity2.addComponent('Tag', { name: 'tag' });

    expect(i).toBe(1);
  });

  test('removes component removed listener', () => {
    let i = 0;
    const listener = () => {
      i += 1;
    };

    registry.onComponentRemoved(listener);
    const entity = registry.createEntity();
    entity.addComponent('Tag', { name: 'tag' });
    const entity2 = registry.createEntity();
    entity2.addComponent('Tag', { name: 'tag' });

    entity.removeComponent('Tag');
    registry.offComponentRemoved(listener);
    entity2.removeComponent('Tag');

    expect(i).toBe(1);
  });

  test('removes entity created listener', () => {
    let i = 0;
    const listener = () => {
      i += 1;
    };

    registry.onEntityCreated(listener);
    registry.createEntity();
    registry.offEntityCreated(listener);
    registry.createEntity();

    expect(i).toBe(1);
  });

  test('removes entity removed listener', () => {
    let i = 0;
    const listener = () => {
      i += 1;
    };

    registry.onEntityRemoved(listener);
    const e1 = registry.createEntity();
    const e2 = registry.createEntity();

    registry.removeEntity(e1.id);
    registry.offEntityRemoved(listener);
    registry.removeEntity(e2.id);

    expect(i).toBe(1);
  });

  test('filters component added listener by component name', () => {
    let i = 0;
    const listener = () => {
      i += 1;
    };

    registry.onComponentAdded(listener, ['Tag', 'Name']);
    const entity = registry.createEntity();
    entity.addComponent('Tag', { name: 'tag' });
    entity.addComponent('Name', { value: 'name' });
    entity.addComponent('Position', { x: 0, y: 0, z: 0 });

    expect(i).toBe(2);
  });

  test('entity returns component list', () => {
    const entity = registry.createEntity();
    entity.addComponent('Tag', { name: 'tag' });
    entity.addComponent('Name', { value: 'name' });
    entity.addComponent('Position', { x: 0, y: 0, z: 0 });
    const actual = entity.components();
    actual.sort();
    const expected = ['Tag', 'Name', 'Position'];
    expected.sort();

    expect(actual).toStrictEqual(expected);
  });

  test('returns all entities', () => {
    const e1 = registry.createEntity();
    const e2 = registry.createEntity();
    const e3 = registry.createEntity();
    registry.removeEntity(e2.id);

    expect(registry.all().map((entity) => entity.id)).toStrictEqual([e1.id, e3.id]);
  });

  test('throws an error if entity does not exist when getting by id from registry', () => {
    const getNotRegisteredEntity = () => {
      registry.getEntity(123);
    };

    expect(getNotRegisteredEntity).toThrow('Entity 123 not found');
  });

  test('returns empty array when getting components for non existing entity', () => {
    expect(registry.getComponents(1)).toStrictEqual([]);
  });

  test('returns entity with given id', () => {
    registry.createEntity();

    expect(registry.getEntity(1).id).toBe(1);
  });

  test('Throws error when assigning component to not registered entity', () => {
    expect(() => {
      registry.assignComponent(1, 'Name', {
        value: 'some name',
      });
    }).toThrow('Entity 1 not found');
  });

  test('Throws error when removing component to not registered entity', () => {
    expect(() => {
      registry.removeComponent(1, 'Name');
    }).toThrow('Entity 1 not found');
  });

  test('Throws error when getting component not assigned to entity', () => {
    const entity = registry.createEntity();

    expect(() => {
      entity.getComponent('Name');
    }).toThrow('Entity 1 does not have component Name');
  });

  test('Does not trigger listener when removing not registered entity', () => {
    let listenerTriggered = false;
    registry.onEntityRemoved(() => {
      listenerTriggered = true;
    });
    registry.removeEntity(1);

    expect(listenerTriggered).toBe(false);
  });

  test('Triggers component removed listener for all components when removing entity', () => {
    const triggeredListeners: any = {};

    registry.createEntity({
      Name: {
        value: 'name',
      },
      Tag: {
        name: 'tag',
      },
    });

    registry.onComponentRemoved((entity, name) => {
      triggeredListeners[name] = entity.id === 1;
    });

    registry.removeEntity(1);

    expect(triggeredListeners).toStrictEqual({
      Name: true,
      Tag: true,
    });
  });

  test('Creates view for all matched entities', () => {
    registry.createEntity({
      Name: {
        value: 'e1',
      },
      Position: {
        x: 0, y: 0, z: 0,
      },
    });
    registry.createEntity({
      Tag: {
        name: 'e2',
      },
    });
    registry.createEntity({
      Name: {
        value: 'e3',
      },
      Tag: {
        name: 'e3',
      },
    });

    const view = registry.getView(['Name']);

    expect(view.result.map(({ component }) => component('Name').value)).toStrictEqual(['e1', 'e3']);
  });
});
