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

  test('removes after component removed listener', () => {
    let i = 0;
    const listener = () => {
      i += 1;
    };

    registry.onAfterComponentRemoved(listener);
    const entity = registry.createEntity();
    entity.addComponent('Tag', { name: 'tag' });
    const entity2 = registry.createEntity();
    entity2.addComponent('Tag', { name: 'tag' });

    entity.removeComponent('Tag');
    registry.offAfterComponentRemoved(listener);
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
});
