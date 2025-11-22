import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';
import { commits, data, updateScatterPlot } from './main.js';

commits.sort((a, b) => a.datetime - b.datetime);

let commitProgress = 100;

// Time scale for commits
let timeScale = d3
  .scaleTime()
  .domain([
    d3.min(commits, (d) => d.datetime),
    d3.max(commits, (d) => d.datetime),
  ])
  .range([0, 100]);

let commitMaxTime = timeScale.invert(commitProgress);

const timeOptions = {
  dateStyle: 'long',
  timeStyle: 'short',
};

let filteredCommits = commits;

function updateFileDisplay(filteredCommits) {
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let lines = filteredCommits.flatMap((d) => d.lines);

  let files = d3
    .groups(lines, (d) => d.file)
    .map(([name, lines]) => ({ name, lines }))
    .sort((a, b) => b.lines.length - a.lines.length); // descending by line count

  let filesContainer = d3
    .select('#files')
    .selectAll('div')
    .data(files, (d) => d.name);

  const filesEnter = filesContainer
    .enter()
    .append('div')
    .call((div) => {
      const dt = div.append('dt');
      dt.append('code');
      dt.append('small');
      div.append('dd');
    });

  const filesMerged = filesContainer.merge(filesEnter);

  filesMerged.select('dt > code').text((d) => d.name);
  filesMerged.select('dt > small').html((d) => `${d.lines.length} lines`);
  filesMerged
    .select('dd')
    .selectAll('div')
    .data((d) => d.lines)
    .join(
      (enter) => enter.append('div').attr('class', 'loc'),
      (update) => update,
      (exit) => exit.remove(),
    )
    .attr('style', (d) => `--color: ${colors(d.type)}`);

  filesMerged.order();
}

const slider = document.getElementById('commit-progress');

if (slider) {
  slider.min = 0;
  slider.max = 100;
  slider.value = commitProgress;

  slider.addEventListener('input', () => {
    commitProgress = slider.value;

    commitMaxTime = timeScale.invert(commitProgress);

    document.getElementById('commit-max-time').textContent =
      commitMaxTime.toLocaleString(undefined, timeOptions);

    filteredCommits = commits
      .filter((d) => d.datetime <= commitMaxTime)
      .sort((a, b) => a.datetime - b.datetime);
    updateScatterPlot(data, filteredCommits);
    updateFileDisplay(filteredCommits);
  });
}

// initial render
filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
updateScatterPlot(data, filteredCommits);
updateFileDisplay(filteredCommits);

// Render steps for scrollytelling
d3.select('#scatter-story')
  .selectAll('.step')
  .data(filteredCommits, (d) => d.id)
  .join('div')
  .attr('class', 'step')
  .html(
    (d, i) => `
    On ${d.datetime.toLocaleString('en', {
      dateStyle: 'full',
      timeStyle: 'short',
    })},
    I made <a href="${d.url}" target="_blank">${
      i > 0 ? 'another commit' : 'my first commit, and it was glorious'
    }</a>.
    I edited ${d.totalLines} lines across ${
      d3.rollups(
        d.lines,
        (D) => D.length,
        (d) => d.file,
      ).length
    } files.
    Then I looked over all I had made, and I saw that it was very good.
    `,
  );

// Handler for when a scroll step enters
function onStepEnter(response) {
  const commit = response.element.__data__;
  const maxTime = commit.datetime;

  // Filter commits up to this step
  const stepCommits = commits.filter((d) => d.datetime <= maxTime);

  updateScatterPlot(data, stepCommits);
  updateFileDisplay(stepCommits);

  // Optionally update slider to match scrolled commit
  if (slider) {
    slider.value = timeScale(maxTime);
    document.getElementById('commit-max-time').textContent =
      maxTime.toLocaleString(undefined, timeOptions);
  }
}

// Scatter plot scroll
const scatterScroller = scrollama();
scatterScroller
  .setup({
    container: '#scatter-history',
    step: '#scatter-history .step',
  })
  .onStepEnter((response) => {
    const commit = response.element.__data__;
    updateScatterPlot(
      data,
      commits.filter((d) => d.datetime <= commit.datetime),
    );
  });

// Render steps for scrollytelling
d3.select('#file-story')
  .selectAll('.step')
  .data(filteredCommits, (d) => d.id)
  .join('div')
  .attr('class', 'step')
  .html(
    (d, i) => `
    On ${d.datetime.toLocaleString('en', {
      dateStyle: 'full',
      timeStyle: 'short',
    })},
    I made <a href="${d.url}" target="_blank">${
      i > 0 ? 'another commit' : 'my first commit, and it was glorious'
    }</a>.
    I edited ${d.totalLines} lines across ${
      d3.rollups(
        d.lines,
        (D) => D.length,
        (d) => d.file,
      ).length
    } files.
    Then I looked over all I had made, and I saw that it was very good.
    `,
  );
// Scrollama for file dots
const fileScroller = scrollama();
fileScroller
  .setup({
    container: 'body', // main page scroll
    step: '#file-story .step',
  })
  .onStepEnter((response) => {
    const commit = response.element.__data__;
    updateFileDisplay(commits.filter((d) => d.datetime <= commit.datetime));
  });
