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

var Entity = /*#__PURE__*/function () {
  function Entity(entityId, registry) {
    _classCallCheck(this, Entity);

    this.entityId = entityId;
    this.registry = registry;
  }

  _createClass(Entity, [{
    key: "id",
    get: function get() {
      return this.entityId;
    }
  }, {
    key: "components",
    value: function components() {
      return this.registry.getComponents(this.entityId);
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

    this.resultMap = new Map();
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

var matchesFilter = function matchesFilter(name, filter) {
  return !filter.length || filter.includes(name);
};

var Registry = /*#__PURE__*/function () {
  function Registry() {
    _classCallCheck(this, Registry);

    this.entityComponents = new Map();
    this.components = new Map();
    this.nextEntity = 1;
    this.listeners = {
      componentAdded: [],
      componentRemoved: [],
      entityCreated: [],
      entityRemoved: []
    };
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
    key: "getEntity",
    value: function getEntity(entity) {
      return new Entity(entity, this);
    }
  }, {
    key: "getComponents",
    value: function getComponents(entity) {
      var components = this.entityComponents.get(entity);

      if (!components) {
        return [];
      }

      return Array.from(components);
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

      this.listeners.componentAdded.filter(function (listener) {
        return matchesFilter(name, listener.filter);
      }).forEach(function (listener) {
        listener.handler(new Entity(entity, _this), name, component);
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
        this.listeners.componentRemoved.filter(function (listener) {
          return matchesFilter(name, listener.filter);
        }).forEach(function (listener) {
          listener.handler(new Entity(entity, _this2), name, component);
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
    key: "all",
    value: function all() {
      var _this5 = this;

      return Array.from(this.entityComponents.keys()).map(function (entityId) {
        return new Entity(entityId, _this5);
      });
    }
  }, {
    key: "onComponentAdded",
    value: function onComponentAdded(listener) {
      var filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      this.listeners.componentAdded.push({
        filter: filter,
        handler: listener
      });
    }
  }, {
    key: "offComponentAdded",
    value: function offComponentAdded(listener) {
      this.listeners.componentAdded = this.listeners.componentRemoved.filter(function (l) {
        return l.handler !== listener;
      });
    }
  }, {
    key: "onComponentRemoved",
    value: function onComponentRemoved(listener) {
      var filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      this.listeners.componentRemoved.push({
        filter: filter,
        handler: listener
      });
    }
  }, {
    key: "offComponentRemoved",
    value: function offComponentRemoved(listener) {
      this.listeners.componentRemoved = this.listeners.componentRemoved.filter(function (l) {
        return l.handler !== listener;
      });
    }
  }, {
    key: "onEntityCreated",
    value: function onEntityCreated(listener) {
      this.listeners.entityCreated.push(listener);
    }
  }, {
    key: "offEntityCreated",
    value: function offEntityCreated(handler) {
      this.listeners.entityCreated = this.listeners.entityCreated.filter(function (listener) {
        return listener !== handler;
      });
    }
  }, {
    key: "onEntityRemoved",
    value: function onEntityRemoved(listener) {
      this.listeners.entityRemoved.push(listener);
    }
  }, {
    key: "offEntityRemoved",
    value: function offEntityRemoved(handler) {
      this.listeners.entityRemoved = this.listeners.entityRemoved.filter(function (listener) {
        return listener !== handler;
      });
    }
  }]);

  return Registry;
}();

var createRegistry$1 = function createRegistry() {
  return new Registry();
};

var createRegistry = createRegistry$1;

export { createRegistry };
