// global.js
console.log('js 2 test 17')

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

export const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/106-portfolio/";         // GitHub Pages repo name


export async function fetchJSON(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Fetched data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  // heading levels
  const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (!headings.includes(headingLevel)) {
    console.warn(`Invalid heading level "${headingLevel}". Defaulting to h2.`);
    headingLevel = 'h2';
  }

  containerElement.innerHTML = '';

  projects.forEach((project) => {
    const article = document.createElement('article');

    const heading = document.createElement(headingLevel);
    const img = document.createElement('img');
    const p = document.createElement('p');

    heading.textContent = project.title;
    img.src = project.image || '';
    img.alt = project.title || 'Project image';
    p.textContent = project.description || '';

    article.append(heading, img, p);

    containerElement.appendChild(article);
  });
}

export async function fetchGitHubData(username) {
  // return statement here
  return fetchJSON(`https://api.github.com/users/${username}`);

}



const container = document.querySelector('.projects');
const title = document.querySelector('.projects-title');

fetchJSON(`${BASE_PATH}lib/projects.json`).then((projects) => {
  renderProjects(projects, container);
  if (title) {
    title.textContent = `${projects.length} Projects`;
  }
});


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

document.body.insertAdjacentHTML(
  'afterbegin',
  `
	<label class="color-scheme">
		Theme:
		<select id = 'color-scheme'>
			<option value = 'light dark' selected>Automatic</option>
      <option value = 'light'>Light</option>
      <option value = 'dark'>Dark</option>
		</select>
	</label>`,
);

const select = document.querySelector('#color-scheme');

if ("colorScheme" in localStorage) {
  const savedScheme = localStorage.colorScheme;
  select.value = savedScheme;
  if (savedScheme === "auto") {
    document.documentElement.style.colorScheme = "light dark";
  } else {
    document.documentElement.style.colorScheme = savedScheme;
  }
}

select.addEventListener('input', function (event) {
  const value = event.target.value;
  console.log('color scheme changed to', value);
  document.documentElement.style.setProperty('color-scheme', value);
  localStorage.colorScheme = value

  if (value === 'auto') { 
    document.documentElement.style.colorScheme = 'light dark';

  }
  else { 
    document.documentElement.style.colorScheme = value;
  }
});

const form = document.querySelector('form');

form?.addEventListener('submit', function (event) {
  event.preventDefault(); // stop normal submission

  const data = new FormData(form);
  const params = [];

  for (let [name, value] of data) {
    params.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
  }

  const url = `${form.action}?${params.join('&')}`;
  console.log('Opening:', url);
  location.href = url;
});

//fetchJSON('./lib/projects.json');
