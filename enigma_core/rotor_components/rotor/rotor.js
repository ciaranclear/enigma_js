import { validWiringCharacters } from '../../../enigma_core/rotor_components/validators/validators.js';
import { RotorRing } from '../../../enigma_core/rotor_components/rotor_ring/rotor_ring.js';

// ROTOR
export class Rotor extends RotorRing {
  constructor(ringCharacters, wiringCharacters, deviceId=null,     turnoverCharacters=null) {
    super(ringCharacters, deviceId, turnoverCharacters);
    this.core = new RotorCore(this, wiringCharacters, deviceId);
  }
}

// ROTOR_CORE

class RotorCore{
  constructor(ring, wiringCharacters, deviceId) {
    this.characterSet = (function() {
      const chars = [];
      for (let i = 65; i < 91; i++) {
        chars.push(String.fromCharCode(i));
      }
      return chars;
    })();
    this.ring = ring;
    this.selfWired = true;
    this.deviceId = deviceId || '';
    this.rotorPositions = this.characterSet.length;
    this.validWiringCharacters = validWiringCharacters;
    this.wirChrs = this.validWiringCharacters(wiringCharacters);
    this.entryDiscRotorHash = {};
    this.reflectorRotorHash = {};
    this.makeRotorHashTables();
  }

  getWiringCharacters() {
    // returns the wiring character list that was provided during initialization
    return this.wirChrs;
  }

  rotorDict() {
    /*
    returns a dictionary object with 'ROTOR_TYPE' 'ROTOR_SETTING'
    'RING_SETTING' 'RING_CHARACTERS' 'ROTOR_CHARACTERS' and
    'TURNOVER_CHARACTERS'. The ring characters list and rotor characters
    list are shifted to reflect there current values for the current ring
    and rotor settings.
    */
    return {
      "ROTOR_TYPE": this.deviceId,
      "ROTOR_SETTING": this.ring.getRotorSetting,
      "RING_SETTING": this.ring.getRingSetting,
      "RING_CHARACTERS": this.ring.currentRingCharacters(),
      "ROTOR_CHARACTERS": this.currentWiringCharacters(),
      "TURNOVER_CHARACTERS": this.ring.trnChrs
    }
  }

  flag() {
    return (this.ring.canTurnover() ? "R_ROT" : "F_ROT");
  }

  lhOutput(inputIndex) {
    /*
    returns an index repressenting the absolute rotor position the signal
    exited on the left hand side of the rotor going towards the reflector.
    */
    if (this.validInputIndex(inputIndex)) {
      return this.entryDiscRotorHash[this.ring.coreOffset()][inputIndex];
    }
  }

  rhOutput(inputIndex) {
    /*
    returns an index repressenting the absolute rotor position the signal
    exited on the right hand side of the rotor going towards the entry wheel.
    */
    if (this.validInputIndex(inputIndex)) {
      return this.reflectorRotorHash[this.ring.coreOffset()][inputIndex];
    }
  }

  validInputIndex(index) {
    /*
    returns a valid input index or raises RotorInputIndexError if the
    input index is not valid.
    */
    if (0 <= index <= this.rotorPositions) {
      return true;
    }
    throw new RotorInputIndexError(index, this.rotorPositions);
  }

  currentWiringCharacters() {
    /*
    returns a list with the current rotor wiring characters.
    */
    const slice1 = this.wirChrs.slice(this.ring.coreOffset(), this.wirChrs.length);
    const slice2 = this.wirChrs.slice(0, this.ring.coreOffset());
    return slice1.concat(slice2);
  }

  makeRotorHashTables() {
    /*
    makes a hash table for the left hand and right hand sides of the rotor.
    The hash tables are used to lookup values instead of shifting rotor lists
    every time the rotor position is changed.
    */
    let getIndexes = function(arr1, arr2) {
      const newArr = [];
      for (let j = 0; j < arr2.length; j++) {
        newArr.push(arr1.indexOf(arr2[j]));
      }
      return newArr;
    };
    let wirChrs = this.wirChrs;
    let letters = this.characterSet;

    for (let i = 0; i < this.rotorPositions; i++) {
      wirChrs = this.rotateArray(wirChrs);
      letters = this.rotateArray(letters);
      let entryWires = getIndexes(letters, wirChrs);
      let reflectorWires = getIndexes(wirChrs, letters);
      this.entryDiscRotorHash[this.rotorPositions-i-1] = entryWires;
      this.reflectorRotorHash[this.rotorPositions-i-1] = reflectorWires;
    }
  }

  rotateArray(arr) {
    const slice1 = arr.slice(-1, arr.length);
    const slice2 = arr.slice(0, -1);
    return slice1.concat(slice2);
  }
}
