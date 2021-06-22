
export function loadStyleSheet(path) {
  const links = document.getElementsByTagName("link");
  for(let i = 0; i < links.length; i++) {
    const link = links[i];
    if(link.getAttribute("href") === path) return;
  }
  const linkElem = document.createElement("link");
  linkElem.setAttribute("rel", "stylesheet");
  linkElem.setAttribute("type", "text/css");
  linkElem.setAttribute("href", path);
  document.getElementsByTagName("head")[0].appendChild(linkElem);
}