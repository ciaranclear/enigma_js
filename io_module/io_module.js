import { includeHTML } from '../helper_functions/include_html.js';
import { loadStyleSheet } from '../helper_functions/include_css.js';
import { TextIO } from './text_io/text_io.js';
import { Histogram } from './histogram/histogram.js';

export class IOModule{
  constructor(enigmaUI, container, IOMaster=false) {
    this.enigmaUI = enigmaUI;
    this.container = container;
    this.IOMaster = IOMaster;
    this.textIO = null;
    this.histogram = null;
    this.slave = null;
    this.master = null;
    this.cssPath = "io_module/io_module.css";
    this.container.setAttribute("w3-include-html","io_module/io_module.html");
    this.init();
  }

  async init() {
    await includeHTML();
    loadStyleSheet(this.cssPath);
    setTimeout(function(){
      let elem = this.container.querySelector(".io-window");
      this.textIO = new TextIO(this.enigmaUI, this, elem, this.IOMaster);
      elem = this.container.querySelector(".hi-window");
      this.histogram = new Histogram(this.enigmaUI, this, elem);
    }.bind(this), 1000);
  }

  checkState() {
    this.textIO.checkState();
    this.histogram.checkState();
    return true;
  }
}