import { validRingCharacters, validTurnoverCharacters } from '../../../enigma_core/rotor_components/validators/validators.js';

// ROTOR_RING

export class RotorRing{
  constructor(ringCharacters, deviceId=null, turnoverCharacters=[]) {
    this.characterSet = (function() {
      const chars = [];
      for (let i = 65; i < 91; i++) {
        chars.push(String.fromCharCode(i));
      }
      return chars;
    })();
    this.core = null;
    this.deviceId = deviceId || '';
    this.validRingCharacters = validRingCharacters;
    this.validTurnoverCharacters = validTurnoverCharacters;
    this.rngChrs = this.validRingCharacters(ringCharacters);
    this.rngOffset = 0;
    this.rotOffset = 0;
    this.turnoverCharacters = this.validTurnoverCharacters(turnoverCharacters);
    if (turnoverCharacters) {
      this.onTurnover = onTurnover;
      this.keyedRotor = keyedRotor;
    }
  }

  stringRepresentation() {
    // Returns the core string.
    return this.core.stringRepresentation();
  }

  rotorPositions() {
    return this.characterSet.length;
  }

  getRotorCore() {
    // Returns the rotor core object.
    return this.core;
  }

  setRotorCore(coreObj) {
    // Sets core object as the rotor core.
    id = (this.deviceId == '' ? ' ' : " " + this.deviceId + " ");
    if (this.rotorPositions() != coreObj.rotorPositions) {
      throw new  Error(`Compatability error!. Rotor ${id} rotor positions `
                       ` '${this.rotorPositions()}' is not equal to `
                       `core rotor positions '${coreObj.rotorPositions}'`);
    }
    if (this.characterSet != coreObj.characterSet) {
      throw new Error(`Compatability error!. Rotor ${id} rotor character `
                      `set is not equal to core character set`);
    }
    if (this.deviceId != coreObj.deviceId) {
      throw new Error(`Compatability error!. Rotor ${id} rotor ring id `
                      `${this.deviceId} is not equal to the rotor `
                      `core id ${coreObj.deviceId}`);
    }
    this.core = coreObj;
    coreObj.ring = this;    
  }

  ringCharacters() {
    // Returns the ring characters list.
    return this.rngChrs;
  }

  getRotorSetting() {
    // returns the current rotor setting
    return this.rngChrs[this.rotOffset];
  }

  setRotorSetting(rotorSetting) {
    // sets a new rotor setting
    rotorSetting = this.validRingCharacter(rotorSetting);
    this.rotOffset = this.rngChrs.indexOf(rotorSetting);
  }

  getRingSetting() {
    return this.rngChrs[this.rngOffset];
  }

  setRingSetting(ringSetting) {
    ringSetting = this.validRingCharacter(ringSetting);
    this.rngOffset = this.rngChrs.indexOf(ringSetting);
  }

  validRingCharacter(character) {
    /*
    returns a valid ring character or raises RotorRingCharacterError
    if not a valid ring character.
    */
    character = character.toUpperCase();
    if (!isNaN(parseInt(character)) && character.length === 1) {
      character = "0" + character;
    }
    if (!this.rngChrs.includes(character)) {
      throw new RotorRingCharacterError(character);
    }
    return character;
  }

  incRotorSetting() {
    // increments the rotor setting by one step.
    this.rotOffset = this.changeOffset(this.rotOffset, 1);
  }

  decRotorSetting() {
    // decrements the rotor setting by one step.
    this.rotOffset = this.changeOffset(this.rotOffset, -1);
  }

  incRingSetting() {
    // increments the ring setting by one step.
    this.rngOffset = this.changeOffset(this.rngOffset, 1);
  }

  decRingSetting() {
    // decrements the ring setting by one step.
    this.rngOffset = this.changeOffset(this.rngOffset, -1);
  }

  resetRotor() {
    /*
    resets the ring and rotor settings to their default values
    which is the same values they had at rotor initialization.
    */
    this.rngOffset = 0;
    this.rotOffset = 0;
  }

  defaultRotorSetting() {
    /*
    resets rotor setting to its default value which is the value
    it had at rotor initialization.
    */
    this.rotOffset = 0;
  }

  currentRingCharacters() {
    /*
    returns a list with the current ring characters.
    */
    const slice1 = this.rngChrs.slice(this.rotOffset, this.rngChrs.length);
    const slice2 = this.rngChrs.slice(0, this.rotOffset);
    return slice1.concat(slice2);
  }

  canTurnover() {
    /*
    returns a boolean value leindicating if the rotor can be turned over
    by the stepping mechanism for the current rotor setting.
    */
    return this.turnoverCharacters.length !== 0;
  }

  coreOffset() {
    const coreOffset = this.rotOffset + this.rngOffset;
    if (coreOffset >= this.rotorPositions()) {
      coreOffset = coreOffset - this.rotorPositions();
    }
    return coreOffset;
  }

  changeOffset(value, direction) {
    // returns a new offset value within the limits of the rotor positions
    if (direction === 1) {
      if (value === this.rotorPositions()-1) {
        value = 0;
      } else {
        value += 1;
      }
    } else if (direction === -1) {
      if (value === 0) {
        value = this.rotorPositions()-1;
      } else {
        value -= 1;
      }
    }
    return value;
  }
}


// functions for turnover functionality only added if turnover array has characters.

function onTurnover() {
  /*
  returns a boolean reflecting if the rotor is at a rotor setting which
  will allow it to turn over.
  */
  return this.turnoverCharacters.includes(this.getRotorSetting());
}

function keyedRotor() {
  /*
  increments the the rotor setting one step and returns the on_turnover
  state before the rotor setting was incremented.
  */
  const turnover = this.onTurnover();
  this.incRotorSetting();
  return turnover;
}