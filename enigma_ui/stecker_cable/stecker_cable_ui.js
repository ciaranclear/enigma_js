import { SteckerCable } from '../../enigma_core/stecker_cable/stecker_cable.js';
import { ConnectorUI } from '../connector_ui/connector_ui.js';

export class SteckerCableUI{
  constructor(steckerManager) {
    this.managerObj = steckerManager;
    this.steckerCable = new SteckerCable();
    this.plugsUI = this.makePlugsUI();
  }

  makePlugsUI(){
    const plugs = this.steckerCable.plugs;
    const plugsUI = {};
    for(let plug in plugs){
      plugsUI[plug] = new SteckerPlugUI(this, plugs[plug]);
    }
    return plugsUI;
  }

  updatePlugs() {
    let p1, p2;
    if(this.plugsUI["P1"].isConnected()){
      p1 = this.plugsUI["P1"].connectorObj.outerPinValue("LG");
    }else{
      p1 = '-';
    }
    if(this.plugsUI["P2"].isConnected()){
      p2 = this.plugsUI["P2"].connectorObj.outerPinValue("LG");
    }else{
      p2 = '-';
    }
    if(this.plugsUI["P1"].element) this.plugsUI["P1"].element.innerText = p2;
    if(this.plugsUI["P2"].element) this.plugsUI["P2"].element.innerText = p1;
  }

  addListeners(element){
    element.addEventListener("mouseover", function(){
      this.plugLights("add");
    }.bind(this));
    element.addEventListener("mouseout", function(){
      this.plugLights("remove");
    }.bind(this));
  }

  plugLights(mode){
    for(let plugId in this.plugsUI) {
      const plugUI = this.plugsUI[plugId];
      if(plugUI.element) {
        if(mode === "remove") plugUI.element.classList.remove("sp-plug-light");
        if(mode === "add") plugUI.element.classList.add("sp-plug-light");
      }
    }
  }

  connected() {
    
  }

  disconnected(){
    this.plugsUI["P1"].disconnect();
    this.plugsUI["P2"].disconnect();
  }

  isDisconnected() {
    return (!this.plugsUI["P1"].isConnected() &&
            !this.plugsUI["P2"].isConnected());
  }
}

class SteckerPlugUI extends ConnectorUI {
  constructor(controllerObj, steckerPlugObj){
    super(controllerObj, steckerPlugObj);
    this.element = null;
  }

  connected(){
    this.controllerObj.connected();
  }

  disconnected(){
    this.element = null;
    this.controllerObj.disconnected();
  }

  decorateElem(elem){
    elem.classList.add("sp-stecker-plug");
    this.element = elem;
    this.controllerObj.addListeners(elem);
    this.controllerObj.updatePlugs();
  }

  validConnector() {
    
  }
}