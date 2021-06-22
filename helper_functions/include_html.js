
export async function includeHTML() {
  let elems, i, elem, file;
  const promises = [];
  // Loop through a collection of all HTML elements:
  elems = document.getElementsByTagName("*");
  for (i = 0; i < elems.length; i++) {
    elem = elems[i];
    //search for elements with a certain atrribute:
    file = elem.getAttribute("w3-include-html");
    if (file) {
      promises.push((function(elem){
        return new Promise((resolve, reject) => {
          fetch(file)
          .then(response => {
            return response.text();
          }).then(html => {
            elem.innerHTML = html;
            elem.removeAttribute("w3-include-html");
            includeHTML();
            resolve();
          }).catch(err => {
            reject(err);
          })
        });
      })(elem));
    }
  }
  const results = await Promise.all(promises);
  return results;
}