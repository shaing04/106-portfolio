import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');

renderProjects(projects, projectsContainer, 'h2');

function renderPieChart(projectsGiven) {
    const svg = d3.select('svg');
    const legend = d3.select('.legend');

    svg.selectAll('path').remove();
    legend.selectAll('*').remove();

    const colors = d3.scaleOrdinal(d3.schemeTableau10);

    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );

    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => arcGenerator(d));
    let selectedIndex = -1;

    newArcs.forEach((arc, idx) => {
        svg.append('path')
        .attr('d', arc)
        .attr('fill', colors(idx))
        .attr('cursor', 'pointer') // indicate clickable
        .on('click', () => {
                // toggle selection
                selectedIndex = selectedIndex === idx ? -1 : idx;

                // update path classes
                svg.selectAll('path')
                .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));

                // update legend classes
                legend.selectAll('li')
                    .attr('class', (_, i) => (i === selectedIndex ? 'legend-item selected' : 'legend-item'));

                // filter projects using if/else format
                if (selectedIndex === -1) {
                    // no wedge selected, show all projects
                    renderProjects(projects, projectsContainer, 'h2');
                } else {
                    // wedge selected, filter by year
                    const selectedYear = newData[selectedIndex].label;
                    const filtered = projectsGiven.filter(p => p.year === selectedYear);
                    renderProjects(filtered, projectsContainer, 'h2');
                }
        });
    });

    const legendList = legend.append('ul').attr('class', 'legend-ul');

    newData.forEach((d, idx) => {
        legendList.append('li')
              .attr('style', `--color:${colors(idx)}`)
              .attr('class', 'legend-item')
              .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });

    
}

renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
    let query = event.target.value;
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});
