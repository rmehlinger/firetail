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

export class FireTailBase extends ObsJsonCell {
  constructor(f, init=null, events) {
    // super(typeof f === 'function' ? f: () => f, init);
    super(init);
    this.f = f;
    this.events = events;
    this.firebaseRef = bind(this.f);
    autoSub(this.firebaseRef.onSet, ([o, n]) => {
      // console.info(o, n);
      if(o) {
        o.off();  // turn off old listeners, if any
      }
      let entries = Object.entries(this.events);
      entries.forEach(([ev, handler]) => n.on(ev, handler.bind(this)));
    });
  }
}

export class DepFireTailCell extends FireTailBase {
  constructor(f, init=null) {
    super(f, init, valueEvent);
  }
}

export class DepFireTailList extends DepFireTailCell {
  constructor(f, init) {
    super(f, init);
    this.events = listEvents;
  }
}

export class RWFireTailBase extends SrcJsonCell {
  constructor(firebaseRef, init, events) {
    super(init);
  }
}

export class RWFireTailCell extends SrcJsonCell {
  constructor(firebaseRef, init) {
    super(init, valueEvent);
  }
}

export class SrcFireTailArray extends RWFireTailBase {
  constructor (init) {
    super(init, listEvents);
  }
}