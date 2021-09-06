(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.YcEcs = {}));
}(this, (function (exports) { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var Entity = /*#__PURE__*/function () {
    function Entity(entityId, registry) {
      _classCallCheck(this, Entity);

      _defineProperty(this, "entityId", void 0);

      _defineProperty(this, "registry", void 0);

      this.entityId = entityId;
      this.registry = registry;
    }

    _createClass(Entity, [{
      key: "id",
      get: function get() {
        return this.entityId;
      }
    }, {
      key: "hasComponent",
      value: function hasComponent(name) {
        return this.registry.hasComponent(this.entityId, name);
      }
    }, {
      key: "addComponent",
      value: function addComponent(name, component) {
        return this.registry.assignComponent(this.entityId, name, component);
      }
    }, {
      key: "removeComponent",
      value: function removeComponent(name) {
        this.registry.removeComponent(this.entityId, name);
      }
    }, {
      key: "getComponent",
      value: function getComponent(name) {
        return this.registry.getComponent(this.entityId, name);
      }
    }]);

    return Entity;
  }();

  var View = /*#__PURE__*/function () {
    function View(groupAll, groupAny) {
      _classCallCheck(this, View);

      _defineProperty(this, "groupAll", void 0);

      _defineProperty(this, "groupAny", void 0);

      _defineProperty(this, "resultMap", new Map());

      this.groupAll = groupAll;
      this.groupAny = groupAny;
    }

    _createClass(View, [{
      key: "addComponent",
      value: function addComponent(entity, componentName, component) {
        var entityMap = this.resultMap.get(entity);

        if (!entityMap) {
          entityMap = new Map();
          this.resultMap.set(entity, entityMap);
        }

        entityMap.set(componentName, component);
      }
    }, {
      key: "result",
      get: function get() {
        var r = [];
        this.resultMap.forEach(function (components, entity) {
          r.push({
            entity: entity,
            component: function component(name) {
              return components.get(name);
            },
            hasComponent: function hasComponent(name) {
              return components.has(name);
            }
          });
        });
        return r;
      }
    }]);

    return View;
  }();

  var Registry = /*#__PURE__*/function () {
    function Registry() {
      _classCallCheck(this, Registry);

      _defineProperty(this, "entityComponents", new Map());

      _defineProperty(this, "components", new Map());

      _defineProperty(this, "nextEntity", 1);

      _defineProperty(this, "listeners", {
        componentAdded: [],
        componentRemoved: [],
        entityCreated: [],
        entityRemoved: []
      });
    }

    _createClass(Registry, [{
      key: "getComponentMap",
      value: function getComponentMap(componentName) {
        if (!this.components.has(componentName)) {
          this.components.set(componentName, new Map());
        }

        return this.components.get(componentName);
      }
    }, {
      key: "createEntity",
      value: function createEntity() {
        var entity = new Entity(this.nextEntity, this);
        this.nextEntity += 1;
        this.entityComponents.set(entity.id, new Set());
        this.listeners.entityCreated.forEach(function (listener) {
          listener(entity);
        });
        return entity;
      }
    }, {
      key: "hasComponent",
      value: function hasComponent(entity, name) {
        return this.getComponentMap(name).has(entity);
      }
    }, {
      key: "assignComponent",
      value: function assignComponent(entity, name, component) {
        var _this = this;

        var componentList = this.entityComponents.get(entity);

        if (componentList) {
          componentList.add(name);
          this.getComponentMap(name).set(entity, component);
        }

        this.listeners.componentAdded.forEach(function (listener) {
          listener(new Entity(entity, _this), name, component);
        });
        return component;
      }
    }, {
      key: "removeComponent",
      value: function removeComponent(entity, name) {
        var _this2 = this;

        var componentList = this.entityComponents.get(entity);

        if (componentList) {
          var component = this.getComponent(entity, name);
          this.listeners.componentRemoved.forEach(function (listener) {
            listener(new Entity(entity, _this2), name, component);
          });
          componentList["delete"](name);
        }

        this.getComponentMap(name)["delete"](entity);
      }
    }, {
      key: "getComponent",
      value: function getComponent(entityId, name) {
        var component = this.getComponentMap(name).get(entityId);

        if (!component) {
          throw new Error("Entity ".concat(entityId, " does not have component ").concat(name));
        }

        return component;
      }
    }, {
      key: "removeEntity",
      value: function removeEntity(entity) {
        var _this3 = this;

        var componentList = this.entityComponents.get(entity);

        if (!componentList) {
          return;
        }

        this.listeners.entityRemoved.forEach(function (listener) {
          listener(new Entity(entity, _this3));
        });
        componentList.forEach(function (componentName) {
          _this3.removeComponent(entity, componentName);
        });
        this.entityComponents["delete"](entity);
      }
    }, {
      key: "getView",
      value: function getView(groupAll) {
        var _this4 = this;

        var groupAny = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var view = new View(groupAll, groupAny);
        this.entityComponents.forEach(function (c, entityID) {
          var componentArray = Array.from(c);
          var allComponents = groupAll.filter(function (e) {
            return componentArray.includes(e);
          });

          if (allComponents.length !== groupAll.length) {
            return;
          }

          var entity = new Entity(entityID, _this4);
          var searchComponents = groupAny.filter(function (e) {
            return componentArray.includes(e);
          }).concat(allComponents);
          searchComponents.forEach(function (componentName) {
            var component = _this4.getComponent(entityID, componentName);

            if (component) {
              view.addComponent(entity, componentName, component);
            }
          });
        });
        return view;
      }
    }, {
      key: "registerListener",
      value: function registerListener(name, listener) {
        this.listeners[name].push(listener);
      }
    }]);

    return Registry;
  }();

  var createRegistry$1 = function createRegistry() {
    return new Registry();
  };

  var createRegistry = createRegistry$1;

  exports.createRegistry = createRegistry;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
