import {autoSub, bind, snap} from 'bobtail-rx';
import {ObsJsonCell, SrcJsonCell} from 'bobtail-json-cell';

let valueEvent = {value(data){
  console.warn(this.data, data.val());
  this._update(data.val());
}};
let listEvents = {
  child_added(data){
    return this._updating(() => this.data[data.key] = data.val());
  },
  child_changed(data){
    return this._updating(() => this.data[data.key] = data.val());
  },
  child_removed(data){
    return this._updating(() => this.data[data.key]);
  }
};

function identity(x) {return x;}

class FireTailBase extends ObsJsonCell {
  constructor(refFn, xformFn=identity, init=null, events=valueEvent) {
    // super(typeof refFn === 'function' ? refFn: () => refFn, init);
    super(init);
    this.refFn = refFn;
    this.xformFn = xformFn;  // used for e.g.
    this.events = events;
    this.refCell = bind(this.refFn);
    autoSub(this.refCell.onSet, ([o, n]) => {
      if(o) {
        o.off();  // turn off old listeners, if any
      }
      let entries = Object.entries(this.events);
      this._updating(() => entries.forEach(([ev, handler]) => n.on(ev, handler.bind(this))));
    });
  }
}

class DepFireTailBase extends FireTailBase {
  constructor() {
    super(...arguments);
  }
  // FIXME: figure out some way to do this via inheritance rather than copy-paste from bobtail-json-cell.
  setProperty(getPath, basePath, obj, prop, val) {
    if (!this._nowUpdating) {
      throw new DepMutationError("Cannot mutate DepJsonCell!");
    }
    else return super.setProperty(getPath, basePath, obj, prop, val);
  }

  deleteProperty(getPath, basePath, obj, prop) {
    if (!this._nowUpdating) {
      throw new DepMutationError("Cannot mutate DepJsonCell!");
    }
    else return super.deleteProperty(getPath, basePath, obj, prop);
  }
}

export class DepFireTailCell extends FireTailBase {
  constructor(refFn, init=null) {
    super(refFn, identity, init, valueEvent);
  }
}

export class DepFireTailList extends DepFireTailCell {
  constructor(refFn, xformFn, init) {
    super(refFn, xformFn, init, listEvents);
  }
}

export class RWFireTailBase extends FireTailBase {
  constructor(refFn, xformFn, init, events) {
    super(init);
    initFireTailObj.call(this, refFn, xformFn, events);
  }
  setProperty (getPath, basePath, obj, prop, val) {
    // super.setProperty(getPath, basePath, obj, prop, val);
    this.refCell.raw().update({[getPath(prop).join('/')]: val});
  }
  deleteProperty (getPath, basePath, obj, prop) {
    // super.deleteProperty(getPath, basePath, obj, prop);
    this.refCell.raw().remove(getPath(prop).join('/'));
  }
  push (elem) {
    return this.refCell.raw().push(elem);
  }
}

export class RWFireTailCell extends RWFireTailBase {
  constructor(refFn, init) {
    super(refFn, identity, init, valueEvent);
  }
}

export class RWFireTailArray extends RWFireTailBase {
  constructor (refFn, init, xformFn) {
    super(refFn, xformFn, init, valueEvent);
  }
}