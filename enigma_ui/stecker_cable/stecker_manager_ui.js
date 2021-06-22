/*
Objectives
1. init stecker cable ui
2. set click listeners on plugboard sockets
3. control issuing of stecker cables
*/

import { SteckerCableUI } from "./stecker_cable_ui.js";
import { loadStyleSheet } from '../../helper_functions/include_css.js';


export class SteckerManagerUI {
  constructor(enigmaUI, plugboardUI){
    this.enigmaUI = enigmaUI;
    this.plugboardUI = plugboardUI;
    this.cssPath = "enigma_ui/stecker_cable/stecker_plug.css";
    this.listeners = [];
    this.cables = [];
    this.currentCable = null;
    this.init();
  }

  init() {
    loadStyleSheet(this.cssPath);
    this.addSocketListeners();
  }
  
  addSocketListeners() {
    const obj = this.enigmaUI.appUI;
    const func = this.clicked.bind(this);
    this.listeners.push(["click", func]);
    obj.addListener("click", func);
  }

  close() {
    const obj = this.enigmaUI.appUI;
    let event = this.listeners.pop();
    while(event) {
      console.log(event);
      obj.removeListener(event[0],event[1]);
      event = this.listeners.pop();
    }
  }

  clicked(e) {
    if(e.target.closest(".pb-socket-container")) {
      const targetElem = e.target.closest(".pb-socket-container");
      const socketChar = targetElem.parentElement.getAttribute("char");
      const socketUI = this.plugboardUI.socketsUI[socketChar];
      if(!socketUI.isConnected()){
        socketUI.connect(this.nextSteckerPlug());
      }else{
        socketUI.disconnect();
      }    
    }
  }

  newSteckerCable() {
    const cable = new SteckerCableUI(this);
    this.cables.push(cable);
    this.currentCable = cable;
  }

  nextSteckerPlug() {
    if(!this.currentCable){
      this.newSteckerCable();
    }
    const plugs = this.currentCable.plugsUI;
    if (!plugs["P1"].isConnected()) {
      return plugs["P1"];
    } else if (!plugs["P2"].isConnected()) {
      this.currentCable = null;
      return plugs["P2"];
    }
  }

  checkUnusedCables() {
    const connected = [];
    this.cables.forEach(cable => {
      if(!cable.isDisconnected()) {
        connected.push(cable);
      }
    });
    this.cables = connected;
  }

  generateMessage() {
    this.checkUnusedCables();
    if(this.cables.length !== 0 && this.cables.length !== 10) {
      return {"LEVEL":"ADVISORY",
              "COMPONENT":"STECKER MANAGER",
              "MESSAGE":`${this.cables.length} CABLES CONNECTED NORMALLY 10 CABLES CONNECTED`};
    }
  }
}