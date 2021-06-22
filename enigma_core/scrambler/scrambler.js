import { EntryDisk } from '../../enigma_core/rotor_components/entry_disk/entry_disk.js';
// Scrambler

export class Scrambler{
  constructor(scramblerUI, machineDict) {
    // entry disk, rotor group cells, turnover mechanism
    this.scramblerUI = scramblerUI;
    this.leverType = (machineDict["TURNOVER_MECHANISIM"] === "LEVER" ? true : false);
    this.ed = new EntryDisk(machineDict["ENTRY_WHEEL"]);
    this.cells = {};
    this.cellsMap = machineDict["ROTOR_GROUP_CELLS"];
    this.validCellsMap(this.cellsMap);
    this.setCells(this.cellsMap);
    this.valid = false;
  }

  rotorCellPositions() {
    let positions = [];
    for (let position in this.cells) {
      positions.push(position);
    }
    return positions.slice(0,-1);
  }

  rotorFlag(position) {
    /*
    Returns the flag for the position given.
    */
    this.validRotorPosition(position);
    return this.cells[position].flag;
  }

  reflectorFlag() {
    /*
    Returns the reflector flag.
    */
    return this.cells["REF"].flag;
  }

  rotorPositions() {
    /*
    Returns the number of rotor cell positions.
    */
    return this.rotorCellPositions().length;
  }

  removeDevice(deviceObj) {
    /*
    Removes a device object from the scrambler if it is the 
    device object provided. 
    */
    for (const position in this.cells) {
      if (this.cells[poition].getDevice() === deviceObj) {
        this.cells[position].removeDevice();
      }
    }
  }

  addRotor(position, rotorObj) {
    /*
    Sets the rotor object provided in the position given.
    */
    this.validRotorPosition(position);
    this.cells[position].setDevice(rotorObj);
  }

  removeRotor(position) {
    /*
    Removes a rotor object from the position given.
    */
    this.validRotorPosition(position);
    this.cells[position].removeDevice();
  }

  queryRotor(position) {
    /*
    Returns the rotor object from the position given but does not 
    remove it.
    */
    this.validRotorPosition(position);
    return this.cells[position].getDevice();
  }

  addReflector(reflectorObj) {
    /*
    Sets the reflector object given.
    */
    this.cells["REF"].setDevice(reflectorObj);
  }

  removeReflector() {
    /*
    Removes the reflector object.
    */
    this.cells["REF"].removeDevice();
  }

  queryReflector() {
    /*
    Returns the reflector object but does not remove it.
    */
    return this.cells["REF"].getDevice();
  }

  validRotorPosition(position) {
    /*
    Returns True if rotor position given is valid else raises an 
    exception.
    */
    if (this.rotorCellPositions().includes(position)) {
      return true;
    } else {
      throw new Error(`${position} is not a valid rotor position.`);
    }
  }

  getRotors() {
    /*
    Returns a dctionary with the key value pairs of rotor position 
    and rotor id.
    */
    const rotorsDict = {};
    const rotorPositions = this.rotorPositions();
    for (let i = 0; i < rotorPositions.length; i++) {
      const rotorPosition = rotorPositions[i]; 
      const rotor = this.cells[rotorPosition].getDevice();
      if (rotor) {
        rotorsDict[rotorPosition] = rotor.deviceId;
      } else {
        rotorsDict[rotorPosition] = null;
      }
    }
    return rotorsDict;
  }

  rotorSettings() {
    /*
    Returns a disctionary with key value pairs of rotor position and 
    rotor setting for each rotor and the rotor setting of the rotating 
    reflector if applicable.
    */
    const rotorSettings = {};
    const rotorPositions = this.rotorPositions();
    for (let i = 0; i < rotorPositions.length; i++) {
      const rotorPosition = rotorPositions[i]; 
      const rotor = this.cells[rotorPosition].getDevice();
      if (rotor) {
        rotorSettings[rotorPosition] = rotor.rotorSetting;
      } else {
        rotorSettings[rotorPosition] = null;
      }
      if (this.cells["REF"].flag === "R_REF") {
        const reflector = this.cells["REF"].getDevice();
        if (reflector) {
          rotorSettings["REF"] = reflector.rotorSetting;
        } else {
          rotorSettings["REF"] = null;
        }
      }
    }
    return rotor_settings
  }

  ringSettings() {
    /*
    Returns a disctionary with key value pairs of rotor position and 
    ring setting for each rotor.
    */
    const ringSettings = {};
    const rotorPositions = this.rotorPositions();
    for (let i = 0; i < rotorPositions.length; i++) {
      const rotorPosition = rotorPositions[i]; 
      const rotor = this.cells[rotorPosition].getDevice();
      if (rotor) {
        ringSettings[rotorPosition] = rotor.ringSetting;
      } else {
        ringSettings[rotorPosition] = null;
      }
    }
    return ringSettings;
  }

  reflectorId() {
    /*
    Returns the reflector object id if there is a reflector 
    object else None.
    */
    const reflector = this.cells["REF"].getDevice();
    if (reflector) {
      return reflector.core.deviceId;
    } else {
      return null;
    }
  }

  keyedInput(character) {
    this.rotorTurnover();
    return this.output(character);
  }

  output(character) {
    /*
    Returns the output character from the scrambler for the input 
    character given.
    */
    let index = this.ed.lhOutput(character);
    let rotorPositions = this.rotorCellPositions();
    for (let i = 0; i < rotorPositions.length; i++) {
      const rotorPosition = rotorPositions[i];
      const rotor = this.cells[rotorPosition].getDevice();
      index = rotor.core.lhOutput(index);
    }
    const reflector = this.cells["REF"].getDevice();
    index = reflector.core.output(index);
    rotorPositions.reverse();
    for (let i = 0; i < rotorPositions.length; i++) {
      const rotorPosition = rotorPositions[i];
      const rotor = this.cells[rotorPosition].getDevice();
      index = rotor.core.rhOutput(index);
    }
    return this.ed.rhOutput(index);
  }

  rotorTurnover() {
    /*
    Turnsover the first rotor and adjacent rotor if the first rotor 
    was on a turnover character. The second rotor will turnover 
    the third rotor if the second rotor was on a turnover character. 
    If the actuation is a lever type double stepping is applied. If 
    the actuation is gear type (ie non lever type) no double stepping 
    is applied.
    */
    if (this.validGroup()) {
      if (!this.leverType && this.cells["R1"].getDevice().onTurnover() 
        && this.cells["R2"].getDevice().onTurnover()) {
        this.cells["R3"].getDevice().incRotorSetting();
      } else if (this.leverType && this.cells["R2"].getDevice().onTurnover()) {
        this.cells["R2"].getDevice().incRotorSetting();
        this.cells["R3"].getDevice().incRotorSetting();
      }
      if (this.cells["R1"].getDevice().onTurnover()) {
        this.cells["R2"].getDevice().incRotorSetting();
      }
      this.cells["R1"].getDevice().incRotorSetting();
    } else {
      throw new Error("Rotor group is not valid");
    }
  }

  turnovers() {
    const turnovers = {"R2":false, "R3":false};
    if (this.validGroup()) {
      if (!this.leverType && this.cells["R1"].getDevice().onTurnover() 
        && this.cells["R2"].getDevice().onTurnover()) {
        turnovers["R3"] = true;
      } else if (this.leverType && this.cells["R2"].getDevice().onTurnover()) {
        turnovers["R3"] = true;
      }
      if (this.cells["R1"].getDevice().onTurnover()) {
        turnovers["R2"] = true;
      }
    } else {
      throw new Error("Rotor group is not valid");
    }
    return turnovers;
  }

  validGroup() {
    /*
    Returns True if each cell has a rotor or reflector pressent 
    else returns False.
    */
    for (let cell in this.cells) {
      if (!this.cells[cell].getDevice()) {
        this.valid = false;
        return false;
      }
    }
    this.valid = true;
    return true;
  }

  defaultSettings() {
    /*
    Sets the rotors and rotating reflector if applicable to 
    its default settings. 
    */
    for (rotorPosition in this.rotorPositions()) {
      const rotor = this.cells[rotorPosition].getDevice();
      if (rotor) {
        rotor.defaultRotorSetting();
      }
      if (this.cells["REF"].flag === "R_REF") {
        const reflector = this.cells["REF"].getDevice();
        if (reflector) {
          reflector.defaultRotorSetting();
        }
      }
    }
  }

  setCells(cellsMap) {
    /*
    Sets cells according to cells map given.
    */
    for (let cell in cellsMap) {
      this.cells[cell] = new ScramblerCell(cellsMap[cell]);
    }
  }

  validCellsMap(cellsMap) {
    /*
    Checks that the cell map given is valid and returns it. If not 
    valid raises an exception.
    */
    const cells = ["R1","R2","R3","R4","REF"];
    if ((typeof cellsMap) !== "object" && Array.isArray(cellsMap)) {
      throw new Error("Cells map error!. cells map must be an object");
    }
    if (!(4 <= cellsMap.length <= 5)) {
      throw new Error(`Cells map length error!. cells map given length is `
        `${cellsMap.length}. Cells map must be length 4 or 5`);
    }
    for (let cell in cellsMap) {
      if (!cells.includes(cell)) {
        throw new Error(`Invalid cells map key. ${cell} is not a valid `
                        `cell key. Cell key must be in ${cells}`);
      }
    } 
    const reflectorFlag = cellsMap["REF"];
    const reflectorFlags = ["F_REF","R_REF"];
    if (!reflectorFlags.includes(reflectorFlag)) {
      throw new Error(`Invalid reflector flag. ${reflectorFlag} is not `
        `a valid reflector flag. Must be in ${reflectorFlags}`);
    }
    
    const rotorFlags = ["F_ROT","R_ROT"];
    for (let cell in cellsMap) {
      if (cell !== "REF") {
        const rotorFlag = cellsMap[cell];
        if (!rotorFlags.includes(rotorFlag)) {
          throw new Error(`Invalid rotor flag. ${rotorFlag} at rotor `
            `position ${cell} is not a valid rotor flag. Must be in ` 
            `${rotorFlags}`);
        }
      }
    }
    return cellsMap;
  }
}

// SCRAMBLER EXCEPTIONS
class CompatabilityError {
  constructor(flag, device) {
    console.log(device.constructor.name);
    const error = new Error(`Device ${device.constructor.name} flag 
    ${device.flag} is not compatible for cell with flag ${flag}`);
    return error;
  }
}

class ScramblerCell {
  constructor(flag) {
    this.device = null;
    this.flags = ["R_ROT","F_ROT","F_REF","R_REF"];
    this.flag = this.validFlag(flag);
  }

  compatible(deviceObj) {
    /*
    Returns comparisson for device_obj flag and cell flag.
    */
    return deviceObj.core.flag() === this.flag;
  }  

  validFlag(flag) {
    /*
    Returns a valid flag or raises ValueError.
    */
    if (this.flags.includes(flag.toUpperCase())) {
      return flag.toUpperCase();
    } else {
      throw new Error(`Flag error!. '${flag}' is not a valid flag. `
                      `Needs to be flag in ${this.flags}`);
    }
  }

  getDevice() {
    /*
    Returns the device.
    */
    return this.device;
  }

  setDevice(deviceObj) {
    /*
    Accepts a device object and sets it as the cell device if 
    it is a compatable device else raises CompatabilityError.
    */
    if (this.compatible(deviceObj)) {
      this.device = deviceObj;
    } else {
      throw new CompatabilityError(this.flag, deviceObj);
    }
  }
    
  removeDevice() {
    /*
    Removes the device object and returns it.
    */
    const device = this.device;
    this.device = null;
    return device;
  }

  hasDevice() {
    return (this.device ? true : false);
  }
}