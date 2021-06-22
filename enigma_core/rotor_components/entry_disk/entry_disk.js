import { validWiringCharacters } from '../validators/validators.js';


export class EntryDisk {
  constructor(wiringCharacters, deviceId='', selfWired=true) {
    this.characterSet = (function() {
      const chars = [];
      for (let i = 65; i < 91; i++) {
        chars.push(String.fromCharCode(i));
      }
      return chars;
    })();
    this.flag = "ED";
    this.selfWired = selfWired;
    this.deviceId = deviceId;
    this.validWiringCharacters = validWiringCharacters;
    this.wirChrs = this.validWiringCharacters(wiringCharacters);
  }

  entryDiskPositions() {
    /*
    Returns the number of positions on the entry disk.
    */
    return this.characterSet.length;
  }

  entryDiskWiring() {
    /*
    Returns the entry disk wiring.
    */
    return this.wirChrs;
  }

  lhOutput(character) {
    /*
    Returns the output index on the reflector side of the 
    entry disk associated with the input character given.
    */
    let output;
    try {
      character = character.toUpperCase();
      if (!this.characterSet.includes(character)) {
        throw new Error("Entry wheel wiring characters contains an "
                      + "invalid character " + character);
      }
      output = this.wirChrs.indexOf(character);
    }
    catch(error) {
      throw error;
    }
    finally {
      return output;
    }
  }

  rhOutput(index) {
    /*
    Returns the output character on the input side of the 
    entry disk associated with the input index given.
    */
    let output;
    try {
      output = this.wirChrs[index];
      if (!output) {
        throw new Error(index + " index is out of range of the entry disk wiring characters. "
                      + "Max value " + this.characterSet.length-1);
      }
    }
    catch(error) {
      throw error;
    }
    finally {
      return output;
    }
  }

  validEntryDiskCharactes(entryDiskCharacters) {
    /*
    Checks the entry disk wiring is valid. If not valid raises exception.
    */
    if (new set(entryDiskCharacters) !== entryDiskCharacters.length) {
      throw new Error("Entry disk wiring list has repeated characters. "
                      + "Must be list of unique characters");
    }
    if (entyDiskCharacters.length !== this.entryDiskPositions) {
      throw new Error("Entry disk wiring list is length "
                      + entryDiskCharacters + ". Must be length "
                      + this.entryDiskPositions);
    }
    for (let i = 0; i < entryDiskCharacters.length; i++) {
      const char = entryDiskCharacters[i];
      if ((typeof char) !== "string") {
        throw new Error("Entry disk wiring list contains "
                        + "a non string character " + character);
      }
      if (!this.charactterSet.includes(char.toUpperCase())) {
        throw Error("Entry disk wiring list contains "
                    + "an invalid character " + character);
      }
      entryDiskCharacters[i] = char.toUpperCase();
    }
    return entryDiskCharacters;
  }
}