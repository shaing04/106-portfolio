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
}

const slider = document.getElementById('commit-progress');
slider.min = 0;
slider.max = 100;
slider.value = commitProgress;
slider.addEventListener('input', onTimeSliderChange);

onTimeSliderChange();
