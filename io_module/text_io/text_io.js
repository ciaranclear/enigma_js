import { includeHTML } from '../../helper_functions/include_html.js';
import { loadStyleSheet } from '../../helper_functions/include_css.js';

export class TextIO{
  CHARS = [
           'A','B','C','D','E','F','G','H','I','J',
           'K','L','M','N','O','P','Q','R','S','T',
           'U','V','W','X','Y','Z','0','1','2','3',
           '4','5','6','7','8','9',' '
          ];
  ALPHA = {
         '0':'P','1':'Q','2':'W','3':'E','4':'R',
         '5':'T','6':'Z','7':'U','8':'I','9':'O'
         };
  NUM = {
           'P':'0','Q':'1','W':'2','E':'3','R':'4',
           'T':'5','Z':'6','U':'7','I':'8','O':'9'
           };
  constructor(enigmaUI, ioModule, container, isMaster=false) {
    this.enigmaUI = enigmaUI;
    this.ioModule = ioModule;
    this.container = container;
    this.isMaster = isMaster;
    this.histogram = null;
    this.group = null;
    this.enigmaValid = false;
    this.converted = false;
    this.modes = {1:"ORIG", 2:"ALPHA", 3:"NUM"};
    this.mode = (this.isMaster ? 1 : 2);
    this.rawInput = '';
    this.text = {"ORIG":'',"ALPHA":'',"NUM":''};
    this.cssPath = "io_module/text_io/text_io.css";
    this.container.setAttribute("w3-include-html","io_module/text_io/text_io.html");
    this.readElement = null;
    this.init();
  }

  async init() {
    await includeHTML();
    loadStyleSheet(this.cssPath);
    setTimeout(function(){
      this.updateControls();
      this.addListeners();
      this.initRead();
    }.bind(this),500);
  }

  checkState() {
    this.enigmaValid = this.enigmaUI.enigmaValid;
    this.updateControls();
  }

  initRead() {
    const write = this.container.querySelector(".io-write");
    const read = this.container.querySelector(".io-read");
    this.readElement = read;
    if(!this.isMaster) {
      write.style.display = "none";
      read.style.display = "block";
    }
  }

  mouseOverEvent(e) {
    if(e.target.closest(".io-window")) {
      const elem1 = e.target.closest(".io-window")
      const elem2 = this.container;
      if(elem1 === elem2) {
        const targetElem = this.container.querySelector(".io-controls");
        targetElem.style.visibility = "visible";
      }
    }
  }

  mouseOutEvent(e) {
    if(e.target.closest(".io-window")) {
      const elem1 = e.target.closest(".io-window")
      const elem2 = this.container;
      if(elem1 === elem2) {
        const targetElem = this.container.querySelector(".io-controls");
        targetElem.style.visibility = "hidden";
      }
    }
  }

  scrollEvent(e) {
    if(e.target.closest(".io-read")) {
      const target = e.target.closest(".io-read");
      const pos = target.scrollTop;
      if(this.ioModule.slave) {
        this.ioModule.slave.textIO.readElement.scrollTop = pos;
      } else if(this.ioModule.master) {
        this.ioModule.master.textIO.readElement.scrollTop = pos;
      }
    }
  }

  addListeners() {
    const obj = this.enigmaUI.appUI;
    obj.addListener("click", function(e){
      this.convertEvent(e);
      this.clearEvent(e);
      this.modeEvent(e);
    }.bind(this));
    obj.addListener("keyup", function(e){
      this.updateWrite(e);
    }.bind(this));
    obj.addListener("scroll", function(e){
      this.scrollEvent(e);
    }.bind(this), true);
    obj.addListener("mouseover", function(e){
      this.mouseOverEvent(e);
    }.bind(this));
    obj.addListener("mouseout", function(e){
      this.mouseOutEvent(e);
    }.bind(this));
  }

  updateWrite(e) {
    const write = this.container.querySelector(".io-write");
    if(e.target === write) {
      this.filterText(write.value);
      this.updateControls();
    }
  }

  async enigmaInput() {
    for(let i = 0; i < this.text["ORIG"].length; i++) {
      const orig = this.text["ORIG"][i];
      const alpha = this.text["ALPHA"][i];
      const num = this.text["NUM"][i];
      if(orig === ' ') continue;
      const elem = this.makeCharElement(orig, alpha, num);
      const turnovers = this.enigmaUI.scramblerUI.scrambler.turnovers();
      const variable = await this.inputChar(alpha);
      this.addCharElement(elem);
      this.ioModule.histogram.addCharacter(orig, alpha, num);
      this.ioModule.slave.textIO.enigmaOutput(alpha, variable, turnovers);
    }
  }

  inputChar(orig) {
    return new Promise((resolve, reject) => {
      const variable = this.enigmaUI.remoteKeyDown(orig);
      setTimeout(function(){
        this.enigmaUI.remoteKeyUp(orig);
        resolve(variable);
      }.bind(this), 100);
    });
  }

  enigmaOutput(input, output, turnovers) {
    this.rawInput += input;
    this.filterText(output);
    const ind = this.text["ORIG"].length-1;
    const orig = this.text["ORIG"][ind];
    const alpha = this.text["ALPHA"][ind];
    const num = this.text["NUM"][ind];
    const elem = this.makeCharElement(orig, alpha, num, turnovers);
    this.addCharElement(elem);
    this.ioModule.histogram.addCharacter(orig, alpha, num);
  }

  makeCharElement(orig, alpha, num, turnovers) {
    if(!this.group) this.makeGroupElement();
    const elem = document.createElement("div");
    if(this.isMaster) elem.setAttribute("ORIG", orig);
    elem.setAttribute("ALPHA", alpha);
    elem.setAttribute("NUM", num);
    elem.innerText = elem.getAttribute(this.modes[this.mode]);
    if(turnovers) {
      if(turnovers["R2"]) elem.classList.add("io-r2-turnover");
      if(turnovers["R3"]) elem.classList.add("io-r3-turnover");
    }
    return elem;
  }

  makeGroupElement() {
    const read = this.container.querySelector(".io-read");
    const elem = document.createElement("div");
    elem.classList.add("io-output-group");
    read.appendChild(elem);
    this.group = elem;
  }

  addCharElement(elem) {
    this.group.appendChild(elem);
    if(this.group.children.length === 5) {
      this.group.innerHTML += `<div>&nbsp</div>`;
      this.group = null;
    }
  }

  clearEvent(e) {
    const target = e.target.closest(".io-clear");
    if(target === this.container.querySelector(".io-clear")) {
      if(this.ioModule.slave) {
        this.ioModule.slave.textIO.clear();
      }
      this.clear();
      this.updateControls();
    }
  }

  convertEvent(e) {
    const target = e.target.closest(".io-convert");
    if(target && target.classList.contains("io-on")) {
      const write = this.container.querySelector(".io-write");
      const read = this.container.querySelector(".io-read");
      if(!this.converted && this.textAvail()) {
        write.style.display = "none";
        read.style.display = "block";
        this.enigmaInput();
        this.converted = true;
        this.updateControls();
      }
    }
  }

  modeEvent(e) {
    let target = e.target.closest(".io-alpha");
    if(target === this.container.querySelector(".io-alpha")) {
      this.changeMode();
      this.updateModeBtn();
    }

    target = e.target.closest(".io-write");
    const write = this.container.querySelector(".io-write");
    if(target === write) {
      this.mode = 1;
      this.updateModeBtn();
      write.value = this.text[this.modes[this.mode]];
    }
  }

  clear() {
    // clear text dictionary, read and write windows
    this.text = {"ORIG":'',"ALPHA":'',"NUM":''};
    this.rawInput = '';
    const write = this.container.querySelector(".io-write");
    const read = this.container.querySelector(".io-read");
    write.value = '';
    read.innerHTML = '';
    this.converted = false;
    this.group = null;
    this.ioModule.histogram.clearData();
    if(this.isMaster) {
      write.style.display = "flex";
      read.style.display = "none";
    }
  }

  changeMode() {
    // change mode setting
    this.mode++;
    if(this.mode > 3) this.mode = (this.isMaster ? 1 : 2);
    const write = this.container.querySelector(".io-write");
    write.value = this.text[this.modes[this.mode]];

    const read = this.container.querySelector(".io-read");
    const groups = read.children;
    for(let i = 0; i < groups.length; i++) {
      const group = groups[i].children;
      for(let j = 0; j < group.length; j++) {
        const elem = group[j];
        const attrib = elem.getAttribute(this.modes[this.mode]);
        if(attrib) elem.innerText = attrib;
      }
    }
  }

  updateControls() {
    this.updateClearBtn();
    this.updateConvertBtn();
    this.updateModeBtn();
  }

  updateClearBtn() {
    const btn = this.container.querySelector(".io-clear");
    if(this.isMaster) {
      btn.classList.remove("io-inactive");
      if(this.textAvail()) {
        btn.classList.remove("io-off");
        btn.classList.add("io-on");
      } else {
        btn.classList.remove("io-on");
        btn.classList.add("io-off");
      }
    }
  }

  updateConvertBtn() {
    const btn = this.container.querySelector(".io-convert");
    if(this.isMaster) {
      btn.classList.remove("io-inactive");
      if(this.enigmaValid && this.textAvail() && !this.converted) {
        btn.classList.remove("io-off");
        btn.classList.add("io-on");
      } else {
        btn.classList.remove("io-on");
        btn.classList.add("io-off");
      }
    }
  }

  updateModeBtn() {
    const btn = this.container.querySelector(".io-alpha");
    btn.classList.remove("io-inactive");
    btn.classList.add("io-on");
    btn.innerText = this.modes[this.mode];
  }

  filterText(text) {
    // clear text dictionary and populate with converted chars
    const write = this.container.querySelector(".io-write");
    this.text = {"ORIG":'',"ALPHA":'',"NUM":''};
    for(let i = 0; i < text.length; i++) {
      let char = text[i];
      try {
        char = this.validCharacter(char);
      } catch(err) {
        continue;
      }
      this.text["ORIG"] += char;
      this.text["ALPHA"] += this.alphaChar(char);
      this.text["NUM"] += this.numChar(char);
    }
    write.value = this.text["ORIG"];
  }

  textAvail() {
    return this.text["ORIG"].length !== 0;
  }

  alphaChar(char) {
    // if char has alpha representation return alpha rep
    char = this.validCharacter(char);
    return (this.ALPHA[char] ? this.ALPHA[char] : char);
  }

  numChar(char) {
    // if char has number representation return number rep
    char = this.validCharacter(char);
    return (this.NUM[char] ? this.NUM[char] : char);
  }

  validCharacter(character) {
    // if character is valid return upcase character else raise error
    character = character.toUpperCase();
    if (this.CHARS.includes(character)) {
      return character;
    } else {
      throw new Error(`Text io error!. ${character} is an invald character`);
    }
  }
}
