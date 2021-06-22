import { UhrBox } from '../../enigma_core/uhr_box/uhr_box.js';
import { includeHTML } from '../../helper_functions/include_html.js';
import { loadStyleSheet } from '../../helper_functions/include_css.js';
import { ConnectorUI } from '../connector_ui/connector_ui.js';

export class UhrBoxUI {
  constructor(enigmaUI, plugboardUI, uhrBoxContainer, machineDict) {
    this.enigmaUI = enigmaUI;
    this.plugboardUI = plugboardUI;
    this.container = uhrBoxContainer;
    this.elementIds = {"help":"ub-help"};
    this.cssPath = "enigma_ui/uhr_box_ui/uhr_box_ui.css";
    this.container.setAttribute("w3-include-html","enigma_ui/uhr_box_ui/uhr_box_ui.html");
    this.container.style.display = "block";
    this.plugTransfer = null;
    this.uhrBox = new UhrBox();
    this.plugHolders = {};
    this.listeners = [["mouseover",this.mouseOverEvents.bind(this)],
                      ["mouseout",this.unLightPlugListener.bind(this)],
                      ["dragstart",this.pbDragStart.bind(this)],
                      ["dragenter",this.pbDragEnter.bind(this)],
                      ["dragover",this.pbDragOver.bind(this)],
                      ["drop",this.pbDragDrop.bind(this)],
                      ["click",this.pbDisconnect.bind(this)],
                      ["mouseover",this.mouseOverEvents.bind(this)],
                      ["mouseout",this.unLightPlugListener.bind(this)],
                      ["dragstart",this.ubDragStart.bind(this)],
                      ["dragend",this.dragEnd.bind(this)]];
    this.listenersAdded = false;
    this.init();
  }

  async init() {
    await includeHTML();
    loadStyleSheet(this.cssPath);
    this.makePlugHolders();
    this.addListeners();
    this.settingListener();
  }
  
  addListeners() {
    const obj = this.enigmaUI.appUI;
    for(let i = 0; i < this.listeners.length; i++) {
      const event = this.listeners[i][0];
      const func = this.listeners[i][1];
      obj.addListener(event, func);
    }
  }

  removeListeners() {
    const obj = this.enigmaUI.appUI;
    for(let i = 0; i < this.listeners.length; i++) {
      const event = this.listeners[i][0];
      const func = this.listeners[i][1];
      obj.removeListener(event, func);
    }
  }

  close() {
    this.removeListeners();
    this.container.style.display = "none";
  }

  dragImage(e) {
    if(e.target.classList.contains("ub-plug")) {
      document.getElementById("ub-drag-image").innerHTML = e.target.cloneNode(true).outerHTML;
    }
  }

  makePlugHolders() {
    // make plug holders and init plug for each holder
    const plugObjs = this.uhrBox.uhrPlugsDict;
    for(let plugId in plugObjs) {
      const plugObj =  plugObjs[plugId];
      const plugUIObj = new UhrBoxPlug(this, plugObj);
      const id = `ub-holder-${plugId}`;
      const plugHolder = new PlugHolderUI(plugUIObj, id);
      this.plugHolders[plugId] = plugHolder;
    }
  }

  disconnected(connectorUI) {
    // return plug to plug holder
    const id = connectorUI.connectorObj.id;
    this.plugHolders[id].returnPlug(connectorUI);
    this.unLightPlug(id);
  }

  connected(connectorUI) {
    // remove plug from plug holder
    
  }

  lightPlugListener(e) {
    // get id
    if(e.target.closest(".ub-plug")) {
      const target = e.target.closest(".ub-plug");
      const id = target.getAttribute("id");
      const plugId = id.slice(id.length-3,id.length);
      this.lightPlug(plugId);
    }
  }

  unLightPlugListener(e) {
    // get id
    if(e.target.closest(".ub-plug")) {
      const target = e.target.closest(".ub-plug");
      const id = target.getAttribute("id");
      const plugId = id.slice(id.length-3,id.length);
      this.unLightPlug(plugId);
    }
  }

  lightPlug(plugId) {
    const elem1 = document.getElementById(`pb-ub-plug-${plugId}`);
    const elem2 = document.getElementById(`ub-plug-${plugId}`);
    if(elem1) elem1.classList.add("ub-plug-light-lg","ub-plug-light-sm");
    if(elem2) elem2.classList.add("ub-plug-light-lg","ub-plug-light-sm");
    const cons = this.uhrBox.connectedPins(plugId);
    for(let pinType in cons) {
      const plugId = cons[pinType]["PLUG"];
      const conPinType = cons[pinType]["PIN_TYPE"];
      const cls = (conPinType === "LG" ? "ub-plug-light-lg":"ub-plug-light-sm");
      const ids = [`pb-ub-plug-${plugId}`, `ub-plug-${plugId}`];
      ids.forEach((id) => {
        const elem = document.getElementById(id);
        if(elem) {
          elem.classList.add(cls);
        }
      })
    }
  }

  unLightPlug(plugId) {
    const elem1 = document.getElementById(`pb-ub-plug-${plugId}`);
    const elem2 = document.getElementById(`ub-plug-${plugId}`);
    if(elem1) elem1.classList.remove("ub-plug-light-lg","ub-plug-light-sm");
    if(elem2) elem2.classList.remove("ub-plug-light-lg","ub-plug-light-sm");
    const cons = this.uhrBox.connectedPins(plugId);
    for(let pinType in cons) {
      const plugId = cons[pinType]["PLUG"];
      const ids = [`pb-ub-plug-${plugId}`, `ub-plug-${plugId}`];
      ids.forEach((id) => {
        const elem = document.getElementById(id);
        if(elem) {
          elem.classList.remove("ub-plug-light-lg","ub-plug-light-sm");
        }
      })
    }
  }

  pbDragStart(e) {
    // ".ub-plug"
    if(e.target.closest(".pb-socket-container")) {
      const dragElement = document.getElementById("ub-drag-image");
      e.dataTransfer.setDragImage(dragElement, 15, 30);
      const targetElem = e.target.closest(".ub-plug");
      const plugId = targetElem.getAttribute("id").slice(11,14);
      const char = targetElem.parentElement.parentElement.getAttribute("char");
      const socket = this.plugboardUI.socketsUI[char];
      setTimeout(function(){
        socket.disconnect();
        this.plugTransfer = this.plugHolders[plugId].removePlug();
      }.bind(this), 0);
    }
  }

  pbDragEnter(e) {
    
  }

  pbDragOver(e) {
    e.preventDefault();
  }

  pbDragDrop(e) {
    e.preventDefault();
    if(e.target.closest(".pb-socket-container")) {
      const targetElem = e.target.closest(".pb-socket-container");
      const socketChar = targetElem.parentElement.getAttribute("char");
      const socket = this.plugboardUI.socketsUI[socketChar];
      // if socket char is not connected connect with transfer plug
      if(!socket.isConnected()) {
        socket.connect(this.plugTransfer);
      } 
    }
  }

  pbDisconnect(e) {
    if(e.target.closest(".ub-plug")) {
      const targetElem = e.target.closest(".ub-plug");
      const plugId = targetElem.getAttribute("id").slice(11,14);
      const plugHolder = this.plugHolders[plugId];
      const plugUIObj = plugHolder.plugUIObj;
      plugUIObj.disconnect();
    }
  }

  ubDragStart(e) {
    // ".ub-plug"
    if(e.target.closest(".ub-holder")) {
      const dragElement = document.getElementById("ub-drag-image");
      e.dataTransfer.setDragImage(dragElement, 15, 30);
      setTimeout(function(){
        const targetElem = e.target.closest(".ub-plug");
        const plugId = targetElem.getAttribute("id").slice(8,11);
        const plugHolder = this.plugHolders[plugId];
        if(!plugHolder.isRemoved) {
          this.plugTransfer = plugHolder.removePlug();
        }
      }.bind(this), 0);
    }
  }

  dragEnd(e) {
    if(!this.plugTransfer.isConnected()) {
      this.plugTransfer.disconnected();
    }
  }

  mouseOverEvents(e) {
    this.dragImage(e);
    this.lightPlugListener(e);
  }
  
  settingListener() {
    const obj = this.enigmaUI.appUI;
    obj.addListener("change", function(e){
      if(e.target.id === "uhr-box-setting") {
        const setting = e.target.value;
        this.uhrBox.setUhrBoxSetting(setting);
        if(setting.length === 1) e.target.value = `0${setting}`;
        this.enigmaUI.readyState();
      }
    }.bind(this));
  }

  generateMessage() {
    // if uhr box not valid generate warning
    // if not all plugs connected generate advisory
    if (![0,20].includes(this.uhrBox.numberOfConnected())) {
      return {"LEVEL":"ADVISORY",
              "COMPONENT":"UHR BOX",
              "MESSAGE":"UHR BOX PLUGS CONNECTION NOT COMPLETE"};
    }
  }
}


class UhrBoxPlug extends ConnectorUI {
  constructor(controllerObj, connectorObj) {
    super(controllerObj, connectorObj);
    this.elementId = `ub-plug-${this.connectorObj.id}`;
    this.element = null;
  }

  connected(){
    this.controllerObj.connected(this);
  }

  disconnected() {
    this.controllerObj.disconnected(this);
  }

  decorateElem(elem){
    const plugType = this.connectorObj.id.slice(2,4);
    const plugId = this.connectorObj.id;
    const id = `pb-ub-plug-${plugId}`;
    elem.classList.add("ub-plug", `ub-${plugType.toLowerCase()}-plug`);
    elem.setAttribute("id", id);
    elem.setAttribute("draggable", "true");
    elem.innerHTML = `<div></div>
                      <div>${plugId}</div>
                      <div></div>`;
  }

  validConnector() {
    //
  }
}


class PlugHolderUI {
  constructor(plugUIObj, plugHolderId) {
    this.plugUIObj = this.validConnector(plugUIObj);
    this.plugHolderId = plugHolderId;
    this.isRemoved = false;
  }

  makeHolderElement() {
    const id = this.plugUIObj.connectorObj.id;
    const elem = document.createElement("div");
    elem.classList.add("ub-holder-empty");
    elem.innerText = id;
    return elem;
  }

  removePlug() {
    // remove plugUIObj from holder
    this.isRemoved = true;
    this.updateUI();
    return this.plugUIObj;
  }

  returnPlug(plugUIObj) {
    // validate and return plugUIObj
    this.plugUIObj = this.validConnector(plugUIObj);
    this.isRemoved = false;
    this.updateUI();
  }

  updateUI() {
    // update holder UI
    const elem = document.getElementById(this.plugHolderId);
    if(!this.isRemoved) {
      elem.children[1].style.display = "none";
      elem.children[0].style.display = "flex";
    } else {
      elem.children[0].style.display = "none";
      elem.children[1].style.display = "flex";
    }
  }

  validConnector(plugUIObj) {
    //
    return plugUIObj;
  }
}

