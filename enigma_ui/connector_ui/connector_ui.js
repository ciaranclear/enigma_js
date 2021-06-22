

export class ConnectorUI{
  constructor(controllerObject, connectorObject=null) {
    this.controllerObj = controllerObject;
    this.connectorObj = connectorObject;
    this.connectedObj = null;
  }

  connect(connectingObj) {
    this.validConnector(connectingObj);
    if (!this.isConnected()) {
      this.connectedObj = connectingObj;
      connectingObj.connect(this);
      if (connectingObj.connectorObj && this.connectorObj) {
        this.connectorObj.connect(connectingObj.connectorObj);
      }
      this.connected();
    }
  }

  disconnect() {
    if (this.isConnected()) {
      const obj = this.connectedObj;
      this.connectedObj = null;
      obj.disconnect();
      if (this.connectorObj) {
        this.connectorObj.disconnect();
      }
      this.disconnected();
    }
  }

  connected(){
    // can be overriden
  }

  disconnected(){
    // can be overriden
  }

  isConnected() {
    return (this.connectedObj ? true : false);
  }

  innerPinValue(pinType) {
    // can be overriden
  }

  outerPinValue(pinType) {
    // can be overriden
  }

  validConnector(connectingObj) {
    console.log(this.controllerObj);
    this.controllerObj.validConnector(this, connectingObj);
  }
}