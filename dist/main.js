(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('bobtail-deep-cell', ['exports', 'bobtail-rx', 'bobtail-json-cell'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('bobtail-rx'), require('bobtail-json-cell'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.rx, global.bobtailJsonCell);
    global.bobtailDeepCell = mod.exports;
  }
})(this, function (exports, _bobtailRx, _bobtailJsonCell) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.RWFireTailArray = exports.RWFireTailCell = exports.RWFireTailBase = exports.DepFireTailList = exports.DepFireTailCell = undefined;

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

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var _get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var valueEvent = {
    value: function value(data) {
      this._update(data.val());
    }
  };
  var listEvents = {
    child_added: function child_added(data) {
      var _this = this;

      return this._updating(function () {
        return _this.data[data.key] = data.val();
      });
    },
    child_changed: function child_changed(data) {
      var _this2 = this;

      return this._updating(function () {
        return _this2.data[data.key] = data.val();
      });
    },
    child_removed: function child_removed(data) {
      var _this3 = this;

      return this._updating(function () {
        return _this3.data[data.key];
      });
    }
  };

  function identity(x) {
    return x;
  }

  var FireTailBase = function (_ObsJsonCell) {
    _inherits(FireTailBase, _ObsJsonCell);

    function FireTailBase(refFn) {
      var xformFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : identity;
      var init = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var events = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : valueEvent;

      _classCallCheck(this, FireTailBase);

      var _this4 = _possibleConstructorReturn(this, (FireTailBase.__proto__ || Object.getPrototypeOf(FireTailBase)).call(this, init));

      _this4.refFn = refFn;
      _this4.xformFn = xformFn; // used for e.g.
      _this4.events = events;
      _this4.refCell = (0, _bobtailRx.bind)(_this4.refFn);
      (0, _bobtailRx.autoSub)(_this4.refCell.onSet, function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            o = _ref2[0],
            n = _ref2[1];

        if (o) {
          o.off(); // turn off old listeners, if any
        }
        var entries = Object.entries(_this4.events);
        _this4._updating(function () {
          return entries.forEach(function (_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2),
                ev = _ref4[0],
                handler = _ref4[1];

            return n.on(ev, handler.bind(_this4));
          });
        });
      });
      return _this4;
    }

    return FireTailBase;
  }(_bobtailJsonCell.ObsJsonCell);

  var DepFireTailBase = function (_FireTailBase) {
    _inherits(DepFireTailBase, _FireTailBase);

    function DepFireTailBase() {
      _classCallCheck(this, DepFireTailBase);

      return _possibleConstructorReturn(this, (DepFireTailBase.__proto__ || Object.getPrototypeOf(DepFireTailBase)).apply(this, arguments));
    }
    // FIXME: figure out some way to do this via inheritance rather than copy-paste from bobtail-json-cell.


    _createClass(DepFireTailBase, [{
      key: 'setProperty',
      value: function setProperty(getPath, basePath, obj, prop, val) {
        if (!this._nowUpdating) {
          throw new DepMutationError("Cannot mutate DepJsonCell!");
        } else return _get(DepFireTailBase.prototype.__proto__ || Object.getPrototypeOf(DepFireTailBase.prototype), 'setProperty', this).call(this, getPath, basePath, obj, prop, val);
      }
    }, {
      key: 'deleteProperty',
      value: function deleteProperty(getPath, basePath, obj, prop) {
        if (!this._nowUpdating) {
          throw new DepMutationError("Cannot mutate DepJsonCell!");
        } else return _get(DepFireTailBase.prototype.__proto__ || Object.getPrototypeOf(DepFireTailBase.prototype), 'deleteProperty', this).call(this, getPath, basePath, obj, prop);
      }
    }]);

    return DepFireTailBase;
  }(FireTailBase);

  var DepFireTailCell = exports.DepFireTailCell = function (_DepFireTailBase) {
    _inherits(DepFireTailCell, _DepFireTailBase);

    function DepFireTailCell(refFn) {
      var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, DepFireTailCell);

      return _possibleConstructorReturn(this, (DepFireTailCell.__proto__ || Object.getPrototypeOf(DepFireTailCell)).call(this, refFn, identity, init, valueEvent));
    }

    return DepFireTailCell;
  }(DepFireTailBase);

  var DepFireTailList = exports.DepFireTailList = function (_DepFireTailBase2) {
    _inherits(DepFireTailList, _DepFireTailBase2);

    function DepFireTailList(refFn, init) {
      _classCallCheck(this, DepFireTailList);

      return _possibleConstructorReturn(this, (DepFireTailList.__proto__ || Object.getPrototypeOf(DepFireTailList)).call(this, refFn, init, listEvents));
    }

    return DepFireTailList;
  }(DepFireTailBase);

  var RWFireTailBase = exports.RWFireTailBase = function (_FireTailBase2) {
    _inherits(RWFireTailBase, _FireTailBase2);

    function RWFireTailBase(refFn, xformFn, init, events) {
      _classCallCheck(this, RWFireTailBase);

      var _this8 = _possibleConstructorReturn(this, (RWFireTailBase.__proto__ || Object.getPrototypeOf(RWFireTailBase)).call(this, init));

      initFireTailObj.call(_this8, refFn, xformFn, events);
      return _this8;
    }

    _createClass(RWFireTailBase, [{
      key: 'setProperty',
      value: function setProperty(getPath, basePath, obj, prop, val) {
        // super.setProperty(getPath, basePath, obj, prop, val);
        this.refCell.raw().update(_defineProperty({}, getPath(prop).join('/'), val));
      }
    }, {
      key: 'deleteProperty',
      value: function deleteProperty(getPath, basePath, obj, prop) {
        // super.deleteProperty(getPath, basePath, obj, prop);
        this.refCell.raw().remove(getPath(prop).join('/'));
      }
    }, {
      key: 'push',
      value: function push(elem) {
        return this.refCell.raw().push(elem);
      }
    }]);

    return RWFireTailBase;
  }(FireTailBase);

  var RWFireTailCell = exports.RWFireTailCell = function (_RWFireTailBase) {
    _inherits(RWFireTailCell, _RWFireTailBase);

    function RWFireTailCell(refFn, init) {
      _classCallCheck(this, RWFireTailCell);

      return _possibleConstructorReturn(this, (RWFireTailCell.__proto__ || Object.getPrototypeOf(RWFireTailCell)).call(this, refFn, identity, init, valueEvent));
    }

    return RWFireTailCell;
  }(RWFireTailBase);

  var RWFireTailArray = exports.RWFireTailArray = function (_RWFireTailBase2) {
    _inherits(RWFireTailArray, _RWFireTailBase2);

    function RWFireTailArray(refFn, init, xformFn) {
      _classCallCheck(this, RWFireTailArray);

      return _possibleConstructorReturn(this, (RWFireTailArray.__proto__ || Object.getPrototypeOf(RWFireTailArray)).call(this, refFn, xformFn, init, valueEvent));
    }

    return RWFireTailArray;
  }(RWFireTailBase);
});

//# sourceMappingURL=main.js.map