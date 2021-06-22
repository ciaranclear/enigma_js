import { validWiringCharacters } from '../../../enigma_core/rotor_components/validators/validators.js';
import { RotorRing } from '../../../enigma_core/rotor_components/rotor_ring/rotor_ring.js';

// REFLECTOR CORE

export class ReflectorCore{
  constructor(ring, wiringCharacters, deviceId=null, reWire=false) {
    this.characterSet = (function() {
      const chars = [];
      for (let i = 65; i < 91; i++) {
        chars.push(String.fromCharCode(i));
      }
      return chars;
    })();
    this.ring = ring;
    this.selfWired = false;
    this.deviceId = deviceId || '';
    this.reWire = reWire;
    this.rotorPositions = this.characterSet.length;
    this.validWiringCharacters = validWiringCharacters;
    this.wreChrs = this.validWiringCharacters(wiringCharacters);
  }

  flag() {
    /*
    Returns the flag for this device. The flag is determined by 
    the ring ie if it is a rotating reflector or a staic reflector.
    */
    return this.ring.flag;
  }

  output(index) {
    /*
    Return the output from the reflector for the index given.
    */
    this.validInputIndex(index);
    index = this.ring.coreOffset() + index;
    if (index >= this.rotorPositions) {
      index = index - this.rotorPositions;
    }
    try {
      if (!this.wreChrs.includes(String.fromCharCode(index + 65))) {
        throw new RangeError(index + " is not a valid input index. "
                           + "Index must be between 0 and " + this.rotorPositions-1);
      } else {
        index = this.wreChrs.indexOf(String.fromCharCode(index + 65));
      }
    }
    catch(error) {
      throw error;
    }
    finally {
      return index;
    }
  }

  validInputIndex(index) {
    /*
    returns a valid input index or raises RotorInputIndexError if the
    input index is not valid.
    */
    if (0 <= index <= this.rotorPositions) {
      return true;
    } else {
      throw new Error(index + " is not a valid input index. "
        + "Must be between 0 and " + positions);
    }
  }

  canReWire(wiringCharacters) {
    if (this.reWire) {
      this.wreChrs = this.validWiringCharacters(wiringCharacters);
    } else {
      const id = (this.deviceId === ' ' ? ' ' : ' ' + this.deviceId + ' ');
      throw new Error("Reflector " + id + " is not a rewirable reflector");
    }
  }
}

// RotatingReflector

export class RotatingReflector extends RotorRing{
  constructor(ringCharacters, wiringCharacters, deviceId) {
    super(ringCharacters, deviceId);
    this.core = new ReflectorCore(this, wiringCharacters, deviceId, false);
    this.flag = "R_REF";
  }
}

// StaticReflector

export class StaticReflector{
  constructor(wiringCharacters, deviceId=null) {
    this.deviceId = deviceId || '';
    this.rngOffset = 0;
    this.rotOffset = 0;
    this.flag = "F_REF";
    this.core = new ReflectorCore(this, wiringCharacters, deviceId, false);
  }

  setCore(coreObj) {
    /*
    Sets the core object given.        
    */
    const id = (this.deviceId === '' ? ' ' : ' ' + this.deviceId + ' ');
    if (this.deviceId !== coreObj.deviceId) {
      throw new Error("Compatability error!. Rotor" + id + "rotor ring id "
                  + this.deviceId + " is not equal to the rotor "
                  + "core id " + coreObj.deviceId);
    }
    this.core = coreObj;
    coreObj.ring = this;
  }

  coreOffset() {
    return 0;
  }
}

//

export class RewireableReflector {
  constructor(wiringCharacters, deviceId=null) {
    this.deviceId = deviceId || '';
    this.rngOffset = 0;
    this.rotOffset = 0;
    this.flag = "F_REF";

    this.core = new ReflectorCore(this, wiringCharacters, deviceId, true);
  }

  setCore(coreObj) {
    /*
    Sets the core object given.        
    */
    const id = (this.deviceId === '' ? ' ' : ' ' + this.deviceId + ' ');
    if (this.deviceId !== coreObj.deviceId) {
      throw new Error("Compatability error!. Rotor" + id + "rotor ring id "
                  + this.deviceId + " is not equal to the rotor "
                  + "core id " + coreObj.deviceId);
    }
    this.core = coreObj;
    coreObj.ring = this;
  }

  coreOffset() {
    return 0;
  }
}