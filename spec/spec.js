jasmine.CATCH_EXCEPTIONS = false;
import {DepFireTailCell} from '../src/main.js';
import * as firebase from 'firebase';
import * as rx from 'bobtail-rx';

let FirebaseServer = require('firebase-server');

new FirebaseServer(5000, 'test.firebase.localhost', {
  /* You can put your initial data model here, or just leave it empty */
});

let app = firebase.initializeApp({
  databaseURL: 'ws://test.firebaseio.localhost:5000',
});
let db = app.database();

// Error.stackTraceLimit = Infinity;


describe('DepFireTailCell', () => {
  let fieldVal, fieldKey, peopleCell;

  beforeEach(() => {
    fieldKey = rx.cell("people");
    fieldVal = () => {
      let ref = db.ref(fieldKey.get());
      console.info(fieldKey.get());
      return ref;
    };
    db.ref('people').set({"Joe": {id: 0, age: 50}});
    db.ref('cats').set({"Maple": {id: 0, age: 2}});
    peopleCell = new DepFireTailCell(fieldVal);
  });
  it('should update when Firebase value of ref changes', () => {
    expect(firebase).toBeTruthy();
    expect(peopleCell.data).toEqual({"Joe": {id: 0, age: 50}});
    fieldVal().update({
      "Fred": {id: 1, age: 40},
      "Bob": {id: 2, age: 60}
    });
    expect(peopleCell.data).toEqual({
      Joe: {id: 0, age: 50},
      Fred: {id: 1, age: 40},
      Bob: {id: 2, age: 60}
    })
  });
  it('should update when Firebase ref is deleted', () => {
    fieldVal().remove();
    expect(peopleCell.data).toBeNull();
  });
  it('should update when its ref changes', () => {
    fieldKey.set('cats');
    expect(peopleCell.data).toEqual({"Maple": {id: 0, age: 2}});
  });
});
