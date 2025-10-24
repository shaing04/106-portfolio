import { fetchJSON, renderProjects, fetchGitHubData, BASE_PATH } from './global.js';

const projects = await fetchJSON(`${BASE_PATH}lib/projects.json`);


const latestProjects = projects.slice(0, 3);

const projectsContainer = document.querySelector('.projects');

renderProjects(latestProjects, projectsContainer, 'h2');

const githubData = await fetchGitHubData('shaing04');
const profileStats = document.querySelector('#profile-stats');

if (profileStats) {
  profileStats.innerHTML = `
        <dl>
          <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
          <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
          <dt>Followers:</dt><dd>${githubData.followers}</dd>
          <dt>Following:</dt><dd>${githubData.following}</dd>
        </dl>
    `;
}