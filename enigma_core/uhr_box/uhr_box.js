import { Connector } from '../../enigma_core/connector/connector.js';

const UHR_DICT = {
  "CONNECTIONS_LIST": [6, 31, 4, 29, 18, 39, 16, 25, 30, 23,
                       28, 1, 38, 11, 36, 37, 26, 27, 24, 21,
                       14, 3, 12, 17, 2, 7, 0, 33, 10, 35,
                       8, 5, 22, 19, 20, 13, 34, 15, 32, 9],

  "PLUG_A_MAP": {
    "0": "01ALG", "2": "01ASM",
    "4": "02ALG", "6": "02ASM",
    "8": "03ALG", "10": "03ASM",
    "12": "04ALG", "14": "04ASM",
    "16": "05ALG", "18": "05ASM",
    "20": "06ALG", "22": "06ASM",
    "24": "07ALG", "26": "07ASM",
    "28": "08ALG", "30": "08ASM",
    "32": "09ALG", "34": "09ASM",
    "36": "10ALG", "38": "10ASM"
  },

  "PLUG_B_MAP": {
    "0": "07BLG", "2": "07BSM",
    "4": "01BLG", "6": "01BSM",
    "8": "08BLG", "10": "08BSM",
    "12": "06BLG", "14": "06BSM",
    "16": "02BLG", "18": "02BSM",
    "20": "09BLG", "22": "09BSM",
    "24": "05BLG", "26": "05BSM",
    "28": "03BLG", "30": "03BSM",
    "32": "10BLG", "34": "10BSM",
    "36": "04BLG", "38": "04BSM"
  },

  "PLUGS_LIST": ["01A", "02A", "03A", "04A", "05A",
                 "06A", "07A", "08A", "09A", "10A",
                 "01B", "02B", "03B", "04B", "05B",
                 "06B", "07B", "08B", "09B", "10B"]
}

export class UhrBox{
  constructor(uhrBoxUI) {
    this.uhrBoxUI = uhrBoxUI;
    this.positions = 40;
    this.rotorPosition = 0;
    this.connections = this.validConnections(UHR_DICT["CONNECTIONS_LIST"]);
    this.plugAMap = this.extendPlugMap(UHR_DICT["PLUG_A_MAP"]);
    this.plugBMap = this.extendPlugMap(UHR_DICT["PLUG_B_MAP"]);
    this.uhrPlugsDict = this.makeUhrPlugsDict(UHR_DICT["PLUGS_LIST"]);
  }

  setUhrBoxSetting(setting) {
    if (0 <= setting < 40) {
      this.rotorPosition = parseInt(setting);
    } else {
      throw new Error(`${setting} is not a valid uhr box setting`);
    }
  }

  getUhrBoxSetting() {
    return this.rotorPosition;
  }

  isValid() {
    let connections = 0;
    for (let plugId in this.uhrPlugsDict) {
      const plug = this.uhrPlugsDict[plugId];
      if (plug.isConnected()) {
        connections += 1;
      }
    }
    if (connections === 0 || connections === 20) {
      return true;
    } else {
      return false;
    }
  }

  numberOfConnected() {
    let connections = 0;
    for (let plugId in this.uhrPlugsDict) {
      const plug = this.uhrPlugsDict[plugId];
      if (plug.isConnected()) {
        connections += 1;
      }
    }
    return connections;
  }

  connectedPins(plugId) {
    const lg = this.validPinId(`${plugId}LG`);
    const sm = this.validPinId(`${plugId}SM`);
    const side = plugId.slice(2,3);
    const lgConPin = (side === "A" ? this.sideBValue(lg) : this.sideAValue(lg));
    const lgConPlug = lgConPin.slice(0, 3);
    const lgConPinType = lgConPin.slice(3, 5);
    const smConPin = (side === "A" ? this.sideBValue(sm) : this.sideAValue(sm));
    const smConPlug = smConPin.slice(0, 3);
    const smConPinType = smConPin.slice(3, 5);
    return {
      "LG":{"PLUG":lgConPlug ,"PIN_TYPE":lgConPinType},
      "SM":{"PLUG":smConPlug ,"PIN_TYPE":smConPinType}
    };
  }

  innerPinValue(plugId, pinType) {
    const pinId = this.validPinId(plugId+pinType);
    const side = plugId.slice(2,3);
    const connectedPinId = (side === "A" ? this.sideBValue(pinId) : this.sideAValue(pinId));
    const connectedPlug = connectedPinId.slice(0, 3);
    const connectedPinType = connectedPinId.slice(3, 5);
    return this.uhrPlugsDict[connectedPlug].outerPinValue(connectedPinType);
  }

  sideAValue(pinId) {
    if (this.plugBMap[pinId]) {
      let term = this.plugBMap[pinId];
      let conn = parseInt(term) + this.rotorPosition;
      conn = (conn > 39 ? conn -= 40 : conn);
      let index = this.connections.indexOf(conn);
      term = index - this.rotorPosition;
      term = (term < 0 ? term += 40 : term);
      return this.plugAMap[term];
    } else {
      throw new Error(`${pinId} is not a valid B side pin id`);
    }
  }

  sideBValue(pinId) {
    if (this.plugAMap[pinId]) {
      let term = this.plugAMap[pinId];
      let index = parseInt(term) + this.rotorPosition;
      index = (index > 39 ? index -= 40 : index);
      let conn = this.connections[index];
      conn -= this.rotorPosition;
      conn = (conn < 0 ? conn += 40 : conn);
      return this.plugBMap[conn];
    } else {
      throw new Error(`${pinId} is not a valid A side pin id`);
    }
  }

  validUhrBoxSetting(setting) {
    if (0 < setting < 40) {
      return setting;
    } else {
      throw new Error(`${setting} is not a valid uhr box setting.`);
    }
  }

  validPinId(pinId) {
    if (this.plugAMap[pinId] || this.plugBMap[pinId]) {
      return pinId;
    } else {
      throw new Error(`${pinId} is not a valid pin id`);
    }
  }

  validConnections(connections) {
    let errMsg = null;
    let c = connections;
    let sorter = (a, b) => a - b;
    const unique = [...new Set(c.filter(c => Number.isInteger(c)))].sort(sorter);
    if (connections.length !== 40) {
      errMsg = "Connections is not correct length. Must be length 40.";
    } else if (unique.length !== 40) {
      errMsg = "Connections has repeated values. All values must be unique";
    } else if (unique[0] !== 0 || unique[39] !== 39) {
      errMsg = "Connections values must be in range of 0 -> 39";
    }

    for (let i = 0; i < connections.length; i++) {
      if (i % 2 === 0 && connections[i] % 2 !== 0) {
        errMsg = "Connections must have even values at even indexes.";
        break;
      } else if (i % 2 !== 0 && connections[i] % 2 === 0) {
        errMsg = "Connections must have odd values at odd indexes.";
        break;
      }
    }

    let pair = [];
    for (let i = 0; i < connections.length; i++) {
      if (i % 2 === 0) {
        pair.push(connections[i]);
        if (pair.length === 2) {
          if (pair[0] - pair[1] !== 2) {
            errMsg = "For each subsequent pair of values at non overlapping "
                   + "even indexes in connections the first value of the "
                   + "pair must be n+2 were n is the second value of the pair.";
            break;
          }
          pair = [];
        }
      }
    }

    if (errMsg) {
      throw new Error(errMsg);
    }
    return connections;
  }

  extendPlugMap(plugMap) {
    /*
    Extends a dictionary by taking each key value pair and using 
    the value as a key and the key as the value.
    */

    const newMap = {};
    for (let connection in plugMap) {
      if (plugMap.hasOwnProperty(connection)) {
        const plug = plugMap[connection];
        newMap[plug] = connection;
        newMap[connection] = plug;
      }
    }
    return newMap;
  }

  makeUhrPlugsDict(plugsArray) {
    const plugsDict = {};
    for (let i = 0; i < plugsArray.length; i++) {
      const plugId = plugsArray[i];
      plugsDict[plugId] = new Connector("UHR_BOX_PLUG", plugId, this);
    }
    return plugsDict;
  }

  connected(connectorObj) {

  }

  disconnected(connectorObj) {
    
  }
}