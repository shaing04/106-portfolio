// global.js
console.log('js test 2');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a").filter(a => a.target !== "_blank");

let currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname,
);

currentLink?.classList.add("current");
