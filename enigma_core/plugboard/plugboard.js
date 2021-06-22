import { Connector } from '../../enigma_core/connector/connector.js';

export class Plugboard{
  constructor(plugboardUI) {
    this.plugboardUI = plugboardUI;
    this.sockets = this.newPlugboard();
    this.valid = true;
    this.validDevice();
  }

  validDevice() {
    /*
    valid if every socket is self steckered or if connected has a corresponding connection
    */
    let state = true;
    for (let socket in this.sockets) {
      let socketObj = this.sockets[socket];
      if (socketObj.isConnected()) {
        const pins = ["SM","LG"];
        pins.forEach(pin => {
          try{
            socketObj.outerPinValue(pin);
          } catch(err) {
            state = false;
          }
        });
      }
    }
    this.valid = state;
    return state;
  }

  validCharacter(character) {
    if (this.sockets[character.toUpperCase()]) {
      return character.toUpperCase();
    } else {
      throw new Error(`${character} is not a valid plugboard character`);
    }
  }

  validPinType(pinType) {
    if (["SM","LG"].includes(pinType)) {
      return pinType;
    } else {
      throw new Error(`${pinType} is not a valid pin type`);
    }
  }

  innerPinValue(id, pinType) {
    return id;
  }

  outerPinValue(character, pinType) {
    character = this.validCharacter(character);
    pinType = this.validPinType(pinType);
    return this.sockets[character].outerPinValue(pinType);
  }

  newPlugboard() {
    const plugboardSockets = {};
    const alphabetArray = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    for (let i = 0; i < alphabetArray.length; i++) {
      let character = alphabetArray[i];
      plugboardSockets[character] = new PlugboardSocket(character, this);
    }
    return plugboardSockets;
  }

  connected(connectorObj) {
    this.validDevice();
  }

  disconnected(connectorObj) {
    this.validDevice();
  }
}


class PlugboardSocket extends Connector {
  constructor(character, plugboardObj){
    super("PLUGBOARD_SOCKET", character, plugboardObj);
  }

  outerPinValue(pinType) {
    /*
    Returns this sockets plugboard character value.
    */
    pinType = this.validPinType(pinType);
    if (this.connected) {
      return this.connectedObj.innerPinValue(pinType);
    } else {
      return this.id;
    }
  }

  connectedType() {
    /*
    Returns the "SHORTING_BAR" if not connected or connectedType if connected.
    */
    if (this.connected) {
      return this.connectedType();
    } else {
      return "SHORTING_BAR";
    }
  }
}