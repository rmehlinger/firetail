import {autoSub, bind, snap} from 'bobtail-rx';
import {ObsJsonCell, SrcJsonCell} from 'bobtail-json-cell';

let valueEvent = {value(data){
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

class FireTailBase extends ObsJsonCell {
  constructor(refFn, init=null, events=valueEvent) {
    // super(typeof refFn === 'function' ? refFn: () => refFn, init);
    super(init);
    this.refFn = refFn;
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

export class DepFireTailCell extends DepFireTailBase {
  constructor(refFn, init=null) {
    super(refFn, init, valueEvent);
  }
}

export class RWFireTailBase extends FireTailBase {
  constructor(refFn, init, events) {
    super(refFn, init, events);
  }
  setProperty (getPath, basePath, obj, prop, val) {
    super.setProperty(getPath, basePath, obj, prop, val);
    this.refCell.raw().update({[getPath(prop).slice(1).join('/')]: val});
    return true;
  }
  deleteProperty (getPath, basePath, obj, prop) {
    super.deleteProperty(getPath, basePath, obj, prop);
    this.refCell.raw().update({[getPath(prop).slice(1).join('/')]: null});
    return true;
  }
}

export class RWFireTailCell extends RWFireTailBase {
  constructor(refFn, init) {
    super(refFn, init, valueEvent);
  }
}
