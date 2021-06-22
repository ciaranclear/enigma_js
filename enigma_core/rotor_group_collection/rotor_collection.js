import { StaticReflector, RotatingReflector, RewireableReflector } from '../../enigma_core/rotor_components/reflector/reflector.js';
import { Rotor } from '../../enigma_core/rotor_components/rotor/rotor.js';

export class RotorCollection{
  constructor(machineDict) {
    this.machineDict = machineDict;
    this.cells = {};
    this.makeReflectorCells();
    this.makeRotorCells();
  }

  availableRotors() {
    /*
    Returns a list of rotors that have not been borrowed.
    */
    const rotors = [];
    for (cell in this.cells) {
      let cellObj = this.cells[cell];
      if (cellObj.deviceType === "ROTOR" && !cellObj.borrowed) {
        rotors.push(cell);
      }
    }
    return rotors;
  }

  availableReflectors() {
    /*
    Returns a list of refletors that have not been borrowed.
    */
    const reflector = [];
    for (cell in this.cells) {
      let cellObj = this.cells[cell];
      if (cellObj.deviceType === "REFLECTOR" && !cellObj.borrowed) {
        reflectors.push(cell);
      }
    }
    return reflectors;
  }

  rotorList(flag) {
    /*
    Returns a list of rotors that apply to the flag given.
    */
    const rotors = [];
    if (!["R_ROT","F_ROT"].includes(flag)) {
      throw new Error("Rotor flag error!. " + flag + " is not a valid flag");
    }
    for (rotor in this.rotors) {
      if (this.rotors[rotor]["turnover_chars"].length !== 0 && flag === "R_ROT") {
        rotors.push(rotor);
      } else if (this.rotors[rotor]["turnover_chars"].length === 0 && flag === "F_ROT") {
        rotors.push(rotor);
      }
    }
    return rotors;
  }

  reflectorList() {
    /*
    Returns a list of reflectors.
    */
    const reflectors = [];
    for (let reflector in this.reflectors) {
      reflectors.push(reflector);
    }
    return reflectors;
  }

  borrowDevice(device) {
    if (!this.cells[device]) {
      throw new Error("Device name error! " + device + " does not exist");
    } else if (this.cells[device] && !this.cells[device].borrowed) {
      return this.cells[device].borrowDevice();
    } else if (this.cells[device] && this.cells[device].borrowed) {
      throw new DeviceBorrowedError("");
    } 
  }

  returnDevice(deviceObj) {
    for (cell in this.cells) {
      if (this.cells[cell].isDevice(deviceObj)) {
        this.cells[cell].returnDevice(deviceObj);
        return;
      }
    }
    throw new Error("Device object given not in collection");
  }

  makeRotorCells() {
    /*
    Initializes the rotor objects.
    */
    const rotors = this.machineDict["ROTORS"];
    for (let rotor in rotors) {
      const ringCharacters = this.machineDict["RING_CHARACTERS"];
      const wiringCharacters = rotors[rotor]["wiring_chars"];
      const turnoverCharacters = rotors[rotor]["turnover_chars"];
      const rotorObj = new Rotor(ringCharacters, wiringCharacters, rotor, turnoverCharacters);
      this.cells[rotor] = new CollectionCell(rotorObj, "ROTOR");
    }
  }

  makeReflectorCells() {
    /*
    Initializes the reflector objects.
    */
    let reflectorObj;
    const reflectors = this.machineDict["REFLECTORS"];
    const ringCharacters = this.machineDict["RING_CHARACTERS"];
    for (let reflector in reflectors) {
      let wiringCharacters = reflectors[reflector]["wiring_chars"];
      if (reflectors[reflector]["mode"] === "fixed") {
        reflectorObj = new StaticReflector(wiringCharacters, reflector);
      } else if (reflectors[reflector]["mode"] === "rotating") {
        reflectorObj = new RotatingReflector(ringCharacters, wiringCharacters, reflector);
      } else if (reflectors[reflector]["mode"] === "rewireable") {
        reflectorObj = new RewireableReflector(wiringCharacters, reflector, true);
      }
      this.cells[reflector] = new CollectionCell(reflectorObj, "REFLECTOR");
    }
  }
}


class CollectionCell{
  constructor(deviceObj, deviceType) {
    this.deviceObj = deviceObj;
    this.deviceType = deviceType;
    this.borrowed = false;
  }

  borrowDevice() {
    this.borrowed = true;
    return this.getDevice();
  }

  getDevice() {
    return (this.deviceObj ? this.deviceObj : null);
  }

  returnDevice(deviceObj) {
    console.log(`RETURNING ${deviceObj.deviceId}`);
    if (this.isDevice(deviceObj)) {
      console.log(`RETURNED ${deviceObj.deviceId}`);
      this.borrowed = false;
    } else {
      throw new Error("device object returned is not the same as stored object");
    }
  }

  isDevice(deviceObj) {
    return deviceObj === this.deviceObj;
  }
}