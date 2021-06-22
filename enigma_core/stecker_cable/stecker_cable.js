import { Connector } from '../../enigma_core/connector/connector.js';

export class SteckerCable {
  constructor(){
    this.plugs = {"P1": new Connector("STECKER_PLUG", "P1", this),
                  "P2": new Connector("STECKER_PLUG", "P2", this)};
  }

  innerPinValue(plugId, pinType) {
    /*
    Returns the value of the connected pin on the opposing plug
    */
    pinType = this.correspondingPinType(pinType);
    if (plugId === "P1") {
      return this.plugs["P2"].outerPinValue(pinType);
    } else if (plugId === "P2") {
      return this.plugs["P1"].outerPinValue(pinType);
    } else {
      throw new Error(plugId + "is not a valid stecker plug id."
                    + "\nMust be 'P1' or 'P2'");
    }
  }

  isValid() {
    /*
    Returns boolean indicating if both plugs are connected
    */
    for (plug in this.plugs) {
      if (!this.plugs[plug].isConnected()) {
        return false;
      }
    }
    return true;
  }

  correspondingPinType(pinType) {
    /*
    Returns the opposing pin_type
    */
    pinType = this.validPinType(pinType);
    return (pinType === "LG" ? "SM" : "LG");
  }

  validPinType(pinType) {
    /*
    Raises an exception if the pin_type is not valid
    */
    if (!["SM","LG"].includes(pinType)) {
      throw new Error(pin_type + " is not a valid stecker pin type");
    }
  }

  connected(connectorObj) {

  }

  disconnected(connectorObj) {
    
  }
}