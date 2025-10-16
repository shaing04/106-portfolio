// global.js
console.log('js test 4');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a").filter(a => a.target !== "_blank");

let currentLink = navLinks.find(a => {
  let linkPath = a.pathname.replace(/index\.html$/, "");
  let currentPath = location.pathname.replace(/index\.html$/, "");
  return a.host === location.host && linkPath.endsWith(currentPath);
});

currentLink?.classList.add("current");

currentLink?.classList.add("current");


console.log(location.pathname);
console.log(navLinks.map(a => a.pathname));

