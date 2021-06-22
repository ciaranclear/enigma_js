

export class Connector {
  constructor(connectorType, id, deviceObj){
    this.connectorType = connectorType;
    this.id = id;
    this.deviceObj = deviceObj;
    this.connectorUI = null;
    this.connected = false;
    this.connectedObj = null;
  }

  connect(connectingObj) {
    /*
    Connects a plug object to this socket.
    */
    if (!this.isConnected()) {
      this.connected = true;
      this.connectedObj = connectingObj;
      this.connectedObj.connect(this);
      this.deviceObj.connected(this);
    } else if (this.connectedObj !== connectingObj) {
      throw new Error(this.id + " already connected");
    }
  }

  disconnect() {
    /*
    Disconnects the connected plug.
    */
    if (this.connected) {
      this.connected = false;
      this.connectedObj.disconnect();
      this.connectedObj = null;
      this.deviceObj.disconnected();
    }
  }

  isConnected() {
    /*
    Returns a boolean value for connected status.
    */
    return this.connected;
  }

  isValid() {
    return this.deviceObj.isValid(this.id);
  }

  innerPinValue(pinType) {
    /*
    Returns this sockets plugboard character value.
    */
    pinType = this.validPinType(pinType);
    if (this.deviceObj) {
      if(this.connectorUI) this.connectorUI.innerPinValue(pinType);
      return this.deviceObj.innerPinValue(this.id, pinType);
    } else {
      throw new Error("Must be connected to a device to get device value!");
    }
  }

  outerPinValue(pinType) {
    /*
    Returns this sockets plugboard character value.
    */
    pinType = this.validPinType(pinType);
    if (this.connected) {
      if(this.connectorUI) this.connectorUI.outerPinValue(pinType);
      return this.connectedObj.innerPinValue(pinType);
    } else {
      throw new Error("Not connected to an external device!");
    }
  }

  connectedType() {
    if (this.connected) {
      return this.connectedObj.connectorType;
    } else {
      throw new Error("Not connected to an external device!");
    }
  }

  connectedId() {
    if (this.connected) {
      return this.connectedObj.id;
    } else {
      throw new Error("Not connected to an external device!");
    }
  }

  validPinType(pinType) {
    /*
    Returns the pin type if pin_type is valid else raises an exception.
    */
    if (["SM", "LG"].includes(pinType)) {
      return pinType;
    } else {
      throw new Error(pinType + " is not a valid pin type. Must be 'SM' or 'LG'");
    }
  }
}