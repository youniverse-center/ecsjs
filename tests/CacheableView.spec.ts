/* eslint-disable no-new */
import { ViewResult } from 'src/View';
import CacheableView from '../src/CacheableView';
import createRegistry, { Registry } from '../src/Registry';
import type { Components } from './TestComponents';

type ResultMapper = (result: ViewResult<Components>) => number;

const toEntityId: ResultMapper = ({ entity }) => entity.id;

describe('CacheableView', () => {
  let registry: Registry<Components>;
  beforeEach(() => {
    registry = createRegistry<Components>();
    registry.createEntity({
      Tag: {
        name: 'tag1',
      },
    });
    registry.createEntity({
      Name: {
        value: 'some entity',
      },
    });
    registry.createEntity({
      Tag: {
        name: 'tag2',
      },
    });
  });

  describe('creating view', () => {
    it('should not create view if result was not requestd', () => {
      const spy = jest.spyOn(registry, 'getView');
      new CacheableView(registry, ['Tag']);

      expect(spy).not.toBeCalled();
    });

    it('should return current result after created', () => {
      const view = new CacheableView(registry, ['Tag']);

      expect(view.result.map(toEntityId)).toMatchObject([1, 3]);
    });
  });

  describe('registry changing', () => {
    let view: CacheableView<Components>;
    beforeEach(() => {
      view = new CacheableView(registry, ['Tag'], ['Name']);
      expect(view.result.map(toEntityId)).toMatchObject([1, 3]);
    });

    it('should update result on component added to entity', () => {
      const entity = registry.getEntity(2);
      entity.addComponent('Tag', {
        name: 'tag2',
      });

      expect(view.result.map(toEntityId)).toMatchObject([1, 2, 3]);
    });

    it('should update result on component removed from entity', () => {
      const entity = registry.getEntity(1);
      entity.removeComponent('Tag');

      expect(view.result.map(toEntityId)).toMatchObject([3]);
    });

    it('should not create new view when added component does not change the view', () => {
      const spy = jest.spyOn(registry, 'getView');
      registry.getEntity(2).addComponent('Position', {
        x: 0,
        y: 0,
        z: 0,
      });

      expect(view.result.map(toEntityId)).toMatchObject([1, 3]);
      expect(spy).not.toBeCalled();
    });

    it('should update view when entity is removed', () => {
      const spy = jest.spyOn(registry, 'getView');
      registry.removeEntity(3);
      expect(view.result.map(toEntityId)).toMatchObject([1]);
      expect(spy).toBeCalled();
    });

    it('should update view when optional component is added to already existing entity in view', () => {
      const spy = jest.spyOn(registry, 'getView');
      registry.getEntity(1).addComponent('Name', {
        value: 'Best entity',
      });
      expect(view.result.map(toEntityId)).toMatchObject([1, 3]);
      expect(spy).toBeCalled();
    });
  });
});
