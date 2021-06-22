import { RotorCollection } from '../../enigma_core/rotor_group_collection/rotor_collection.js';
import { loadStyleSheet } from '../../helper_functions/include_css.js';

export class RotorCollectionUI {
  constructor(scramblerUI, machineDict) {
    this.scramblerUI = scramblerUI;
    this.cssPath = "enigma_ui/rotor_collection_ui/rotor_collection_ui.css";
    this.rcContainerId = "rc-container";
    this.reContainer = null;
    this.rotorCollection = new RotorCollection(machineDict);
    this.deviceSelector = new DeviceSelector(this, scramblerUI);
    this.cells = {};
    this.init();
  }

  init() {
    this.makeCellsUI();
    loadStyleSheet(this.cssPath);
  }

  makeCellsUI() {
    const cellObjs = this.rotorCollection.cells;
    for(let cellId in cellObjs) {
      const cellObj = cellObjs[cellId];
      this.cells[cellId] = new RotorCollectionCellUI(this, cellObj);
    }
  }

  makeCollectionUI() {
    this.rcContainer.classList.add("rc-container-outer");
    this.rcContainer.children[0].classList.add("rc-container-inner");
    for(let cellId in this.cells) {
      this.rcContainer.children[0].appendChild(this.cells[cellId].element);
    }
  }

  displayOpen() {
    this.rcContainer = document.getElementById(this.rcContainerId);
    if(this.rcContainer.children[0].children.length === 0) {
      this.makeCollectionUI();
    }
    if(this.rcContainer) {
      this.rcContainer.style.display = "block";
    }
  }

  displayClosed() {
    this.deviceSelector.clearDeviceTransfer();
    if(this.rcContainer) this.rcContainer.style.display = "none";
  }

  returnDevice(obj) {
    for(let cellId in this.cells) {
      try {
        this.cells[cellId].returnDevice(obj);
        break;
      } catch(error) {
        continue;
      }
    }
  }
}


class RotorCollectionCellUI{
  constructor(rotorCollectionUI, cell) {
    this.rotorCollectionUI = rotorCollectionUI;
    this.cell = cell;
    this.element = this.makeUI();
    this.updateCell();
  }

  updateCell() {
    if(!this.cell.borrowed) {
      this.element.classList.remove("rc-cell-empty");
      this.element.classList.add("rc-cell-occupied");
      if(this.cell.deviceType === "ROTOR" && !this.cell.deviceObj.canTurnover()) {
        this.element.children[0].classList.add("rc-cell-fourth");
      } else {
        this.element.children[0].classList.add("rc-cell-norm");
      }
      this.element.children[0].innerText = this.cell.deviceObj.deviceId;
    } else {
      this.element.classList.remove("rc-cell-occupied");
      this.element.classList.add("rc-cell-empty");
      this.element.children[0].classList.remove("rc-cell-norm","rc-cell-fourth");
      this.element.children[0].innerText = this.cell.deviceObj.deviceId;
    }
  }

  makeUI() {
    const element = document.createElement("div");
    element.innerHTML = "<div></div>";
    element.classList.add("rc-cell");
    element.setAttribute("cell-id",`${this.cell.deviceObj.deviceId}`)
    return element;
  }

  borrowDevice() {
    const obj = this.cell.borrowDevice();
    this.updateCell();
    return obj;
  }

  returnDevice(obj) {
    this.cell.returnDevice(obj);
    this.updateCell();
  }
}

/*
add click listener to scrambler UI to select device from a selector UI
*/
class DeviceSelector{
  constructor(collectionUI, scramblerUI) {
    this.collectionUI = collectionUI;
    this.scramblerUI = scramblerUI;
    this.deviceTransfer = null;
    this.addListeners();
  }

  makeSelector(obj) {
    this.clearDeviceTransfer();
    if(obj.constructor.name === "Rotor") {
      this.deviceTransfer = new RotorSelector(this, obj);
    } else if(obj.constructor.name === "RewireableReflector") {
      this.deviceTransfer = new ReflectorSelector(this, obj);
    }
  }

  clearDeviceTransfer() {
    if(this.deviceTransfer) {
      const deviceObj = this.deviceTransfer.removeObj();
      this.collectionUI.returnDevice(deviceObj);
    }
  }

  isDevice(obj) {
    if(this.deviceTransfer && obj === this.deviceTransfer.obj) {
      return true;
    } else {
      return false;
    }
  }
  
  addListeners() {
    const obj = this.scramblerUI.enigmaUI.appUI;
    obj.addListener("click", function(e){
      if(e.target.closest(".sc-cell")) {
        this.scramblerListener(e);
      } else if(e.target.closest(".rc-rotor-display")) {
        this.rotorListener(e);
      } else if(e.target.closest(".rc-reflector-display")) {
        this.reflectorListener(e);
      } else if(e.target.closest(".rc-cell")) {
        this.collectionListener(e);
      }
    }.bind(this));
  }

  scramblerListener(e) {
    /*
    1. if device in selection area and empty cell clicked set device in cell
    2. if device in selection area and non empty cell is clicked on clear selection
       area and remove device from cell and move to selection area if applicable or 
       return to collection
    */
    const targetElem = e.target.closest(".sc-cell");
    const cellId = targetElem.getAttribute("cell");
    const cellUI = this.scramblerUI.cellsUI[cellId];
    if(!cellUI.cellOccupied() && this.deviceTransfer && this.deviceTransfer.obj && cellUI.compatible(this.deviceTransfer.obj)) {
      const obj = this.deviceTransfer.removeObj();
      cellUI.setObject(obj);
    } else if(cellUI.cellOccupied() && this.scramblerUI.open) {
      const obj = cellUI.removeObject();
      if(["StaticReflector","RotatingReflector"].includes(obj.constructor.name)) {
        this.collectionUI.returnDevice(obj);
        if(this.deviceTransfer && this.deviceTransfer.obj) {
          const otherObj = this.deviceTransfer.removeObj();
          cellUI.setObject(otherObj);
        }
      } else {
        this.makeSelector(obj);
      }
    }
  }

  collectionListener(e) {
    const targetElem = e.target.closest(".rc-cell");
    const cellId = targetElem.getAttribute("cell-id");
    const cellUI = this.collectionUI.cells[cellId];

    if(this.isDevice(cellUI.cell.deviceObj)) {
      this.clearDeviceTransfer();
    } else if (!cellUI.cell.borrowed) {
      const deviceObj = cellUI.borrowDevice();
      if(!["StaticReflector","RotatingReflector"].includes(deviceObj.constructor.name)) {
        this.makeSelector(deviceObj);
      } else {
        const otherObj = this.scramblerUI.cellsUI["REF"].removeObject();
        if(otherObj) {
          this.collectionUI.returnDevice(otherObj);
        }
        this.scramblerUI.cellsUI["REF"].setObject(deviceObj);
      }
    }
  }

  rotorListener(e) {

  }

  reflectorListener(e) {

  }
}


class RotorSelector{
  constructor(controller, obj) {
    this.controller = controller;
    this.obj = obj;
    this.element = null;
    this.displayObj();
  }

  displayObj() {
    /*
    
    */
    this.element = document.createElement("div");
    this.element.innerHTML = `<div>${this.obj.deviceId}</div>`;
    if(this.obj.canTurnover()) {
      this.element.children[0].classList.add("rc-selector-norm");
    } else {
      this.element.children[0].classList.add("rc-selector-fourth");
    }
    this.element.classList.add("rc-rotor-display");
    this.controller.scramblerUI.scContainer.appendChild(this.element);
  }

  removeObj() {
    // remove UI
    this.controller.deviceTransfer = null;
    this.element.remove();
    return this.obj;
  }
}


class ReflectorSelector{
  constructor(controller, obj) {
    this.controller = controller;
    this.obj = obj;
    this.element = null;
    this.displayObj();
  }

  displayObj() {
    this.element = document.createElement("div");
    this.element.innerHTML = `<div>${this.obj.deviceId}</div>`;
    this.element.children[0].classList.add("rc-selector-norm");
    this.element.classList.add("rc-reflector-display");
    this.controller.scramblerUI.scContainer.appendChild(this.element);
  }

  removeObj() {
    // remove UI
    this.controller.deviceTransfer = null;
    this.element.remove();
    return this.obj;
  }
}