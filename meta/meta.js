import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { commits, data, updateScatterPlot } from './main.js';

// Your slider code here...

let commitProgress = 100;

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

function onTimeSliderChange() {
  commitProgress = document.getElementById('commit-progress').value;

  commitMaxTime = timeScale.invert(commitProgress);

  document.getElementById('commit-max-time').textContent =
    commitMaxTime.toLocaleString(undefined, timeOptions);

  filteredCommits = commits.filter((d) => d.date <= commitMaxTime);
  updateScatterPlot(data, filteredCommits);

  // after initializing filteredCommits
  let lines = filteredCommits.flatMap((d) => d.lines);
  let files = d3
    .groups(lines, (d) => d.file)
    .map(([name, lines]) => {
      return { name, lines };
    });

  let filesContainer = d3
    .select('#files')
    .selectAll('div')
    .data(files, (d) => d.name)
    .join((enter) =>
      enter.append('div').call((div) => {
        const dt = div.append('dt');
        dt.append('code');
        dt.append('small');
        div.append('dd');
      }),
    );

  // This code updates the div info
  filesContainer.select('dt > code').text((d) => d.name);

  filesContainer.select('dt > small').html((d) => `${d.lines.length} lines`);

  filesContainer
    .select('dd')
    .selectAll('div')
    .data((d) => d.lines)
    .join('div')
    .attr('class', 'loc');
}

const slider = document.getElementById('commit-progress');
slider.min = 0;
slider.max = 100;
slider.value = commitProgress;
slider.addEventListener('input', onTimeSliderChange);

onTimeSliderChange();
