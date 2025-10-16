// global.js
console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a").filter(a => a.target !== "_blank");

let currentLink = navLinks.find(a => {
  let linkPath = a.pathname.replace(/index\.html$/, "");
  let currentPath = location.pathname.replace(/index\.html$/, "");
  return a.host === location.host && linkPath === currentPath;
});

currentLink?.classList.add("current");
