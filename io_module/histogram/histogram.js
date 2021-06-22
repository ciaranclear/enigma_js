/*
Init Parameters
1. input output boolean controls alpha numeric display

. in input hist convert display alpha and alpha numeric
*/
import { includeHTML } from '../../helper_functions/include_html.js';
import { loadStyleSheet } from '../../helper_functions/include_css.js';

export class Histogram {
  ALPHA = ['A','B','C','D','E','F','G','H','I','J',
           'K','L','M','N','O','P','Q','R','S','T',
           'U','V','W','X','Y','Z',];
  NUM = ['A','B','C','D','E','F','G','H','I','J',
         'K','L','M','N','O','P','Q','R','S','T',
         'U','V','W','X','Y','Z','0','1','2','3',
         '4','5','6','7','8','9'];
  constructor(enigmaUI, ioModule, container) {
    this.enigmaUI = enigmaUI;
    this.ioModule = ioModule;
    this.container = container;
    this.modes = {1:"ORIG", 2:"ALPHA", 3:"NUM"};
    this.mode = (this.ioModule.IOMaster ? 1 : 2);
    this.text = null;
    this.linear = false;
    this.rotate = false;
    this.paddingLeft = 30;
    this.paddingRight = 10;
    this.paddingTop = 10;
    this.paddingBottom = 50;
    this.cssPath = "io_module/histogram/histogram.css";
    this.container.setAttribute("w3-include-html","io_module/histogram/histogram.html");
    this.init();
  }

  async init() {
    await includeHTML();
    loadStyleSheet(this.cssPath);
    setTimeout(function(){
      this.makeSVG();
      this.makeCharObject();
      this.makeGraph();
      this.addListeners();
      this.updateControls();
    }.bind(this),1000);
  }

  /*
  1. make svg element
  2. add controls listeners
  3. add svg listeners
  4. makeVericalYScale
  5. makeHorizontalYScale
  6. makeVericalXScale
  7. makeHorizontalXScale
  8. makeVerticalBars
  9. makeHorizontalBars
  10. changeModeListener
  11. orderListener
  12. linearListener
  13. rotateListener
  14. indexOfConincidence
  15. clear
  16. barHighLightListener
  17. addCharacter
  */

  makeSVG() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    console.log(`WIDTH:${this.container.clientWidth} HEIGHT:${this.container.clientHeight}`);
    svg.setAttribute("viewBox", "0 0 " + this.container.clientWidth + " " + this.container.clientHeight);
    //svg.setAttribute("viewBox", "0 0 " + 300 + " " + 300);
    svg.classList.add("hi-svg-window");
    this.container.appendChild(svg);
  }

  addListeners() {
    const obj = this.enigmaUI.appUI;
    obj.addListener("click", function(e){
      this.modeListener(e);
      this.linearListener(e);
      this.rotateListener(e);
    }.bind(this));
    obj.addListener("mouseover", function(e){
      this.barHighlightListener(e);
    }.bind(this));
    obj.addListener("mouseover", function(e){
      this.mouseOverEvent(e);
    }.bind(this));
    obj.addListener("mouseout", function(e){
      this.mouseOutEvent(e);
    }.bind(this));
  }

  mouseOverEvent(e) {
    if(e.target.closest(".hi-window")) {
      const elem1 = e.target.closest(".hi-window")
      const elem2 = this.container;
      if(elem1 === elem2) {
        const targetElem = this.container.querySelector(".hi-controls");
        targetElem.style.visibility = "visible";
      }
    }
  }

  mouseOutEvent(e) {
    if(e.target.closest(".hi-window")) {
      const elem1 = e.target.closest(".hi-window")
      const elem2 = this.container;
      if(elem1 === elem2) {
        const targetElem = this.container.querySelector(".hi-controls");
        targetElem.style.visibility = "hidden";
      }
    }
  }

  makeGraph() {
    this.container.getElementsByTagName("svg")[0].innerHTML = '';
    if(this.rotate) {
      this.verticalXScale();
      this.horizontalYScale();
      this.horizontalBars();
    } else {
      this.horizontalXScale();
      this.verticalYScale();
      this.verticalBars();
    }
  }

  percentages() {
    const linear = [0,25,50,75,100];
    const logarithm = [0,1,2,3,4,5,10,15,20,25,50,75,100];
    return (this.linear ? linear : logarithm);
  }

  yScaleValue(percent) {
    let length;
    let y;
    const svg = this.container.querySelector("svg");
    if(this.rotate) {
      length = svg.clientWidth - (this.paddingLeft + this.paddingRight);
    } else {
      length = svg.clientHeight - (this.paddingTop + this.paddingBottom);
    }
    if(this.linear) {
      y = length - (length * (100 - percent)/100);
    } else {
      y = length * ((percent / 100) ** 0.5);
    }
    return y;
  }

  yScaleArray() {
    const arr = this.percentages();
    const yScaleValues = {};
    for(let i = 0; i < arr.length; i++) {
      const percent = arr[i];
      yScaleValues[percent] = this.yScaleValue(percent);
    }
    return yScaleValues;
  }

  verticalYScale() {
    const yScaleArray = this.yScaleArray();
    const svg = this.container.querySelector("svg");
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const offset = height - this.paddingBottom;
    for(let percent in yScaleArray) {
      const x = this.paddingLeft;
      const y = offset - yScaleArray[percent];
      this.gridLine(this.paddingLeft, width-this.paddingRight, y, y);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1",`${x}`);
      line.setAttribute("x2",`${x-6}`);
      line.setAttribute("y1",`${y}`);
      line.setAttribute("y2",`${y}`);
      line.classList.add("hi-vertical-y-scale");

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x",`${x-8}`);
      text.setAttribute("y",`${y+4}`);
      text.setAttribute("style","text-anchor: end;");
      text.textContent = percent;
      text.classList.add("hi-vertical-y-scale");

      svg.appendChild(line);
      svg.appendChild(text);
    }
  }

  horizontalYScale() {
    const yScaleArray = this.yScaleArray();
    const svg = this.container.querySelector("svg");
    const height = svg.clientHeight;
    for(let percent in yScaleArray) {
      const x = this.paddingLeft + yScaleArray[percent];
      const y = height - this.paddingBottom;
      this.gridLine(x, x, y, this.paddingTop);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1",`${x}`);
      line.setAttribute("x2",`${x}`);
      line.setAttribute("y1",`${y}`);
      line.setAttribute("y2",`${y+6}`);
      line.classList.add("hi-horizontal-y-scale");

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x",`${x}`);
      text.setAttribute("y",`${y+16}`);
      text.setAttribute("style","text-anchor: middle;");
      text.textContent = percent;
      text.classList.add("hi-horizontal-y-scale");

      svg.appendChild(line);
      svg.appendChild(text);
    }
  }

  verticalXScale() {
    const charSet = this.charSet();
    const svg = this.container.querySelector("svg");
    const height = svg.clientHeight;
    const length = height - (this.paddingTop + this.paddingBottom);
    const inc = length / charSet.length;
    for(let i = 0; i < charSet.length; i++) {
      const x = this.paddingLeft;
      const y = this.paddingTop + (inc*i) + (inc*0.5);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1",`${x}`);
      line.setAttribute("x2",`${x-6}`);
      line.setAttribute("y1",`${y}`);
      line.setAttribute("y2",`${y}`);
      line.classList.add("hi-vertical-x-scale");

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.textContent = charSet[i];
      text.setAttribute("x",`${x-8}`);
      text.setAttribute("y",`${y+3}`);
      text.setAttribute("style","text-anchor: end;");
      text.classList.add("hi-vertical-x-scale");

      svg.appendChild(line);
      svg.appendChild(text);
    }
  }

  horizontalXScale() {
    const charSet = this.charSet();
    const svg = this.container.querySelector("svg");
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const length = width - (this.paddingLeft + this.paddingRight);
    const inc = length / charSet.length;

    for(let i = 0; i < charSet.length; i++) {
      const x = this.paddingLeft + (i*inc) + (inc*0.5);
      const y = height - this.paddingBottom;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1",`${x}`);
      line.setAttribute("x2",`${x}`);
      line.setAttribute("y1",`${y}`);
      line.setAttribute("y2",`${y+6}`);
      line.classList.add("hi-horizontal-x-scale");

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.textContent = charSet[i];
      text.setAttribute("x",`${x}`);
      text.setAttribute("y",`${y+15}`);
      text.setAttribute("style","text-anchor: middle;");
      text.classList.add("hi-horizontal-x-scale");

      svg.appendChild(line);
      svg.appendChild(text);
    }
  }

  gridLine(x1, x2, y1, y2) {
    const svg = this.container.querySelector("svg");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1",`${x1}`);
    line.setAttribute("x2",`${x2}`);
    line.setAttribute("y1",`${y1}`);
    line.setAttribute("y2",`${y2}`);
    line.classList.add("hi-grid-line");
    svg.appendChild(line);
  }

  verticalBars() {
    this.removeBars();
    const modeType = this.modes[this.mode];
    const obj = this.text[modeType];
    const svg = this.container.querySelector("svg");
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const charSet = this.charSet();
    const xScale = width - (this.paddingLeft + this.paddingRight);
    const yScale = height - (this.paddingTop + this.paddingBottom);
    const inc = xScale / charSet.length;
    const barWidth = inc-1;
    for(let i = 0; i < charSet.length; i++) {
      const char = charSet[i];
      const percentage = obj[char]["PERCENTAGE"];
      if(percentage) {
        const barHeight = this.yScaleValue(percentage);
        const x = this.paddingLeft + (i*inc);
        const y = yScale + this.paddingTop - barHeight;
        const rect = document.createElementNS("http://www.w3.org/2000/svg","rect");
        rect.classList.add("hi-bar");
        rect.setAttribute("x",x);
        rect.setAttribute("y",y);
        rect.setAttribute("width",barWidth);
        rect.setAttribute("height",barHeight);
        svg.appendChild(rect);
      }
    }
  }

  horizontalBars() {
    this.removeBars();
    const modeType = this.modes[this.mode];
    const obj = this.text[modeType];
    const svg = this.container.querySelector("svg");
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const charSet = this.charSet();
    const xScale = width - (this.paddingLeft + this.paddingRight);
    const yScale = height - (this.paddingTop + this.paddingBottom);
    const inc = yScale / charSet.length;
    const barHeight = inc-1;
    for(let i = 0; i < charSet.length; i++) {
      const char = charSet[i];
      const percentage = obj[char]["PERCENTAGE"];
      if(percentage) {
        const barWidth = this.yScaleValue(percentage);
        const x = this.paddingLeft;
        const y = this.paddingTop + (inc*i);
        const rect = document.createElementNS("http://www.w3.org/2000/svg","rect");
        rect.classList.add("hi-bar");
        rect.setAttribute("x",x);
        rect.setAttribute("y",y);
        rect.setAttribute("width",barWidth);
        rect.setAttribute("height",barHeight);
        svg.appendChild(rect);
      }
    }
  }

  removeBars() {
    const bars = this.container.querySelectorAll(".hi-bar");
    for(let i = 0; i < bars.length; i++) {
      bars[i].remove();
    }
  }

  modeListener(e) {
    let target = e.target.closest(".hi-alpha");
    if(target === this.container.querySelector(".hi-alpha")) {
      this.changeMode();
      this.updateModeBtn();
      this.removeBars();
      this.makeGraph();
    }
  }

  linearListener(e) {
    let target = e.target.closest(".hi-linear");
    if(target === this.container.querySelector(".hi-linear")) {
      this.linear = (this.linear ? false : true);
      this.updateScaleBtn();
      this.removeBars();
      this.makeGraph();
    }
  }

  rotateListener(e) {
    let target = e.target.closest(".hi-rotate");
    if(target === this.container.querySelector(".hi-rotate")) {
      this.rotate = (this.rotate ? false : true);
      this.removeBars();
      this.makeGraph();
    }
  }

  barHighlightListener() {

  }

  changeMode() {
    this.mode++;
    if(this.mode > 3) this.mode = (this.ioModule.IOMaster ? 1 : 2);
  }

  updateControls() {
    this.updateModeBtn();
    this.updateScaleBtn();
  }

  updateModeBtn() {
    const btn = this.container.querySelector(".hi-alpha");
    btn.classList.remove("hi-inactive");
    btn.classList.add("hi-on");
    btn.innerText = this.modes[this.mode];
  }

  updateScaleBtn() {
    const btn = this.container.querySelector(".hi-linear");
    btn.classList.remove("hi-inactive");
    if(this.linear) {
      btn.innerText = "LINEAR";
    } else {
      btn.innerText = "LOG";
    }
  }

  indexOfCoincidence() {

  }

  clear() {
    this.clearData();
    this.makeGraph();
  }

  clearData() {
    this.makeCharObject();
    this.removeBars();
  }

  addCharacter(orig, alpha, num) {
    if(orig) {
      this.text["ORIG"][orig]["COUNT"] += 1;
      this.text["ORIG"]["TOTAL"] += 1;
    }
    if(alpha) {
      this.text["ALPHA"][alpha]["COUNT"] += 1;
      this.text["ALPHA"]["TOTAL"] += 1;
    }
    if(num) {
      this.text["NUM"][num]["COUNT"] += 1;
      this.text["NUM"]["TOTAL"] += 1;
    }
    this.calcPercentages();
    this.makeGraph();
  }

  makeCharObject() {
    const obj = {};
    obj["ORIG"] = {"TOTAL":0};
    obj["ALPHA"] = {"TOTAL":0};
    obj["NUM"] = {"TOTAL":0};
    for(let i = 0; i < this.NUM.length; i++) {
      const char = this.NUM[i];
      obj["ORIG"][char] = {"COUNT":0,"PERCENTAGE":0};
      obj["NUM"][char] = {"COUNT":0,"PERCENTAGE":0};
    }
    for(let i = 0; i < this.ALPHA.length; i++) {
      const char = this.ALPHA[i];
      obj["ALPHA"][char] = {"COUNT":0,"PERCENTAGE":0};
    }
    this.text = obj;
  }

  calcPercentages() {
    for(let mode in this.modes) {
      const modeType = this.modes[mode];
      const obj = this.text[modeType];
      const total = obj["TOTAL"];
      for(let char in obj) {
        const count = obj[char]["COUNT"];
        if(count) obj[char]["PERCENTAGE"] = 100 * count/total;
      }
    }
  }

  checkState() {
    this.updateModeBtn();
  }

  charSet() {
    if([1,3].includes(this.mode)) {
      return this.NUM;
    } else {
      return this.ALPHA;
    }
  }
}