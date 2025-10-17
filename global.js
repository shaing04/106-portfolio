// global.js
console.log('js test 1');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// const navLinks = $$("nav a").filter(a => a.target !== "_blank");

// let currentLink = navLinks.find(a => {
//   let linkPath = a.pathname.replace(/index\.html$/, "");
//   let currentPath = location.pathname.replace(/index\.html$/, "");
//   return a.host === location.host && linkPath.endsWith(currentPath);
// });

// currentLink?.classList.add("current");

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/website/";         // GitHub Pages repo name

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'resume/', title: 'Resume'},
  { url: 'contact/', title: 'Contact'}, 
  // add the rest of your pages here
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
}