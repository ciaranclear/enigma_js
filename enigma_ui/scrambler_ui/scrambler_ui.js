import { Scrambler } from '../../enigma_core/scrambler/scrambler.js';
import { RotorCollectionUI } from '../rotor_collection_ui/rotor_collection_ui.js';
import { includeHTML } from '../../helper_functions/include_html.js';
import { loadStyleSheet } from '../../helper_functions/include_css.js';

export class ScramblerUI {
  constructor(enigmaUI, scramblerContainer, machineDict) {
    this.enigmaUI = enigmaUI;
    this.scContainer = scramblerContainer;
    this.elementIds = {"help-open":"sc-help",
                       "help-close":"sc-close-icon"};
    this.cssPath = "enigma_ui/scrambler_ui/scrambler_ui.css";
    this.scContainer.setAttribute("w3-include-html","enigma_ui/scrambler_ui/scrambler_ui.html");
    this.open = false;
    this.cellsUI = {};
    this.scrambler = new Scrambler(this, machineDict);
    this.rotorCollection = new RotorCollectionUI(this, machineDict);
    this.init();
  }

  init() {
    includeHTML();
    loadStyleSheet(this.cssPath);
    this.addListeners();
    this.makeCellsUI();
  }

  loadStyleSheet = function() {
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("type", "text/css");
    linkElem.setAttribute("href", this.cssPath);
    document.getElementsByTagName("head")[0].appendChild(linkElem);
  }
  
  addListeners() {
    const obj = this.enigmaUI.appUI;
    obj.addListener("click", function(e){
      this.rotorSettingListener(e);
      this.openCloseClickListener(e);
    }.bind(this));
  }

  rotorSettingListener(e) {
    if(e.target.closest(".sc-rotor-key")) {
      const targetElem = e.target.closest(".sc-rotor-key");
      const cellId = targetElem.parentElement.parentElement.getAttribute("cell");
      if(targetElem.classList.contains("sc-key-inc")) {
        if(this.cellsUI[cellId].cellOccupied()) {
          this.cellsUI[cellId].incRotorSetting();
        }
      } else if(targetElem.classList.contains("sc-key-dec")) {
        if(this.cellsUI[cellId].cellOccupied()) {
          this.cellsUI[cellId].decRotorSetting();
        }
      }
    }
  }

  openCloseClickListener(e) {
    /*
    1. if scrambler closed open each cell and set mode to open
    2. if scrambler open close each cell and set mode to closed
    */
    if(e.target.id === "sc-open-close") {
      (this.open ? this.open=false : this.open=true);
      for(let cellId in this.cellsUI) {
        console.log(`CELL ID ${cellId}`);
        const cellUI = this.cellsUI[cellId];
        (this.open ? cellUI.displayOpen() : cellUI.displayClosed())
      }
      
      if(this.open) {
        this.rotorCollection.displayOpen();
      } else {
        this.rotorCollection.displayClosed();
      }
    }
  }

  makeCellsUI() {
    setTimeout(function(){
      const assy = document.getElementById("sc-scrambler-assy");
      assy.innerHTML = "";
      const cellIdsArr = (function(){
        const arr = [];
        for(let cellId in this.scrambler.cells){
          arr.push(cellId);
        }
        return arr.reverse();
      }.bind(this)());
      for(let i=0; i < cellIdsArr.length; i++) {
        const cellId = cellIdsArr[i];
        const cellObj = this.scrambler.cells[cellId];
        const container = document.createElement("div");
        container.classList.add("sc-cell");
        container.setAttribute("cell",cellId);
        container.setAttribute("id",`sc-cell-${cellId}`);
        assy.appendChild(container);
        this.cellsUI[cellId] = new ScramblerCellUI(this.enigmaUI, cellObj, cellId, container);
      }
    }.bind(this),1000);
  }

  updateScramblerUI() {
    for(let cellId in this.cellsUI) {
      this.cellsUI[cellId].updateUI();
    }
  }

  readyState() {
    return this.scrambler.validGroup();
  }

  generateMessage() {
    if(!this.scrambler.valid) {
      return {"LEVEL":"WARN",
              "COMPONENT":"SCRAMBLER",
              "MESSAGE":"SCRAMBLER NOT VALID"};
    }
  }

  /*
  1. use cell flags to init scrambler cellsUI
  2. each cell creates its own elements
  3. add a delegate to the scrambler container for click events
  4. the scrambler will also initialise the rotor collection
  */
}


class ScramblerCellUI{
  constructor(enigmaUI, cellObj, cellId, container) {
    this.enigmaUI = enigmaUI;
    this.cellObj = cellObj;
    this.cellId = cellId;
    this.container = container;
    this.makeUI();
  }

  displayClosed() {
    this.container.children[0].style.display = "flex";
    this.container.children[1].style.display = "none";
    if(this.cellObj.flag === "F_REF") {
      this.container.style.display = "none";
    }
  }

  displayOpen() {
    this.container.children[0].style.display = "none";
    this.container.children[1].style.display = "flex";
    if(this.cellObj.flag === "F_REF") {
      this.container.style.display = "block";
    }
  }

  cellOccupied() {
    return this.cellObj.hasDevice();
  }

  compatible(Obj) {
    if(this.cellObj.flag === Obj.core.flag()) {
      return true;
    } else {
      return false;
    }
  }

  setObject(obj) {
    this.cellObj.setDevice(obj);
    this.updateUI();
    this.enigmaUI.readyState();
  }

  removeObject() {
    const obj = this.cellObj.removeDevice();
    this.updateUI();
    this.enigmaUI.readyState();
    return obj;
  }

  incRotorSetting() {
    this.cellObj.getDevice().incRotorSetting();
    this.updateUI();
  }

  decRotorSetting() {
    this.cellObj.getDevice().decRotorSetting();
    this.updateUI();
  }

  updateUI() {
    let elem;
    if(["R_ROT","F_ROT","R_REF"].includes(this.cellObj.flag)) {
      if(this.cellObj.hasDevice()) {
        elem = this.container.children[0].children[1];
        elem.innerText = this.cellObj.device.getRotorSetting();
        elem = this.container.children[1].children[0];
        elem.innerText = this.cellObj.device.deviceId;
      } else {
        elem = this.container.children[0].children[1];
        elem.innerText = "=";
        elem = this.container.children[1].children[0];
        elem.innerText = this.cellId;
      }
    } else if(this.cellObj.flag === "F_REF") {
      if(this.cellObj.hasDevice()) {
        elem = this.container.children[1].children[0];
        elem.innerText = this.cellObj.device.deviceId;
      } else {
        elem = this.container.children[1].children[0];
        elem.innerText = this.cellId;
      }
    }
  }

  makeUI() {
    /*
    1. make cell container
    2. make closed cellUI
    3. make open cellUI
    */
    const openRotor = function() {
      const container = document.createElement("div");
      container.classList.add("sc-cell-open");
      if(this.cellObj.flag !== "F_ROT") {
        container.classList.add("sc-cell-open-norm");
      } else {
        container.classList.add("sc-cell-open-fourth");
      }
      container.innerHTML = `<div>${this.cellId}</div>`;
      return container;
    }.bind(this);

    const closedRotor = function(flag) {
      const container = document.createElement("div");
      container.classList.add("sc-cell-closed");
      addKey(container, "inc");
      addWindow(container, flag);
      addKey(container, "dec");
      return container;
    };

    const openReflector = function() {
      const container = document.createElement("div");
      container.classList.add("sc-cell-open","sc-cell-open-norm");
      container.innerHTML = `<div>${this.cellId}</div>`;
      return container;
    }.bind(this);

    const closedReflector = function() {
      const container = document.createElement("div");
      container.classList.add("sc-cell-closed");
      return container;
    };

    const addKey = function(container, flag) {
      const keyElem = document.createElement("div");
      keyElem.classList.add(`sc-key-${flag}`);
      keyElem.classList.add("sc-rotor-key");
      keyElem.innerHTML = "<div></div><div></div><div></div>";
      container.appendChild(keyElem);
    }.bind(this);

    const addWindow = function(container) {
      const windowElem = document.createElement("div");
      const flag = this.cellObj.flag;
      windowElem.innerText = '=';
      if(["R_ROT","R_REF"].includes(flag)) {
        windowElem.classList.add("sc-rotor-window");
      } else if(flag === "F_ROT") {
        windowElem.classList.add("sc-rotor-window-fourth");
      }
      container.appendChild(windowElem);
    }.bind(this);

    if(["R_ROT","F_ROT","R_REF"].includes(this.cellObj.flag)) {
      this.container.appendChild(closedRotor());
      this.container.appendChild(openRotor());
    } else {
      this.container.appendChild(closedReflector());
      this.container.appendChild(openReflector());
      this.container.style.display = "none";
    }
  }
}