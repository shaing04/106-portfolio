// global.js
console.log('js test 9');

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
  : "/106-portfolio/";         // GitHub Pages repo name

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'resume/', title: 'Resume'},
  { url: 'contact/', title: 'Contact'}, 
  { url: 'https://github.com/shaing04', title: 'GitHub'},
  { url: 'https://www.linkedin.com/in/susana-haing/', title: 'LinkedIn'}
  // add the rest of your pages here
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  url = !url.startsWith('http') ? BASE_PATH + url : url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  // highlight current page
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }

  // open external links in a new tab
  if (a.host !== location.host) {
    a.target = "_blank";            
    a.rel = "noopener noreferrer";  
  }

  nav.append(a);
}


