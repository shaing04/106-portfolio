import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

//let data = await loadData();
let xScale, yScale;

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

//let commits = d3.groups(data, (d) => d.commit);
//console.log(commits)

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      // Each 'lines' array contains all lines modified in this commit
      // All lines in a commit have the same author, date, etc.
      // So we can get this information from the first line
      let first = lines[0];

      // What information should we return about this commit?
      let { author, date, time, timezone, datetime, file, type } = first;

      let ret = {
        id: commit,
        url: 'https://github.com/shaing04/portfolio/commit/' + commit,
        // ... what else?
        author,
        date,
        time,
        timezone,
        datetime,

        // what else might be useful?
        file,
        type,

        // Calculate hour as a decimal for time analysis
        // e.g., 2:30 PM = 14.5
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        // How many lines were modified?
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        // What other options do we need to set?
        // Hint: look up configurable, writable, and enumerable
        writable: true,
        enumerable: true,
        configurable: true,
      });

      return ret;
    });
}

//let data = await loadData();
//let commits = processCommits(data);
//console.log(commits);

function renderCommitInfo(data, commits) {
  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Add more stats as needed...

  // Add number of files
  dl.append('dt').text('Number of Files in the Codebase');
  const uniqueFiles = d3.group(data, (d) => d.file).size;
  dl.append('dd').text(uniqueFiles);
  //console.log(uniqueFiles)

  // Number of days worked on site
  dl.append('dt').text('Days Worked On Site');
  const daysWorked = d3.group(data, (d) => d.date).size;
  dl.append('dd').text(daysWorked);

  // Time of Day
  const workByPeriod = d3.rollups(
    data,
    (v) => v.length,
    (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' }),
  );
  const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
  dl.append('dt').text('Average Time of Day for Work');
  dl.append('dd').text(maxPeriod);
}

//let data = await loadData();
//let commits = processCommits(data);

//renderCommitInfo(data, commits);

export function renderScatterPlot(data, commits) {
  // put all the JS code of steps inside this function
  const width = 1000;
  const height = 600;

  // Sort commits by total lines in descending order
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('id', 'chart-svg') // ADD THIS LINE
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const margin = { top: 10, right: 10, bottom: 30, left: 20 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  xScale = d3
    .scaleTime()
    //points were overlapping with the y axis
    .domain([
      d3.timeDay.offset(
        d3.min(commits, (d) => d.date),
        -1,
      ), // one day before
      d3.timeDay.offset(
        d3.max(commits, (d) => d.date),
        +1,
      ),
    ]) // one day after
    .range([0, width])
    .nice(d3.timeDay);

  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  // Update scales with new ranges
  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  // Add gridlines BEFORE the axes
  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  gridlines.call(
    d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width),
  );

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  // Add X axis
  svg
    .append('g')
    .attr('class', 'x-axis') // ADD CLASS for updates
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  svg
    .append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([5, 30]);

  const brushLayer = svg.append('g').attr('class', 'brush');
  const dots = svg.append('g').attr('class', 'dots');

  dots
    .selectAll('circle')
    .data(sortedCommits, (d) => d.id)
    .join('circle')
    .attr('cx', (d) => xScale(d.date))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    //.style('fill', '#4e79a7')
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });

  createBrushSelector(brushLayer);
}

export function updateScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // FIX: Select the SVG by ID instead of nested selection
  const svg = d3.select('#chart-svg');

  // Add clipPath to limit circles inside plot
  svg
    .append('defs')
    .append('clipPath')
    .attr('id', 'scatter-clip')
    .append('rect')
    .attr('x', usableArea.left)
    .attr('y', usableArea.top)
    .attr('width', usableArea.width)
    .attr('height', usableArea.height);

  // FIX: Update the existing xScale domain (don't reassign)
  xScale.domain(d3.extent(commits, (d) => d.datetime)).nice();

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);

  const xAxis = d3.axisBottom(xScale);

  // remove the old x-axis code, then replace with:
  const xAxisGroup = svg.select('g.x-axis');
  xAxisGroup.selectAll('*').remove();
  xAxisGroup.call(xAxis);

  const dots = svg
    .select('.dots')
    .attr('class', 'dots')
    .attr('clip-path', 'url(#scatter-clip)');

  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  dots
    .selectAll('circle')
    .data(sortedCommits, (d) => d.id)
    .join('circle')
    .attr('cx', (d) => xScale(d.date))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });
}

function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

function createBrushSelector(svg) {
  // Create brush
  //svg.call(d3.brush());

  // Update brush initialization to listen for events
  svg.call(d3.brush().on('start brush end', brushed));

  // Raise dots and everything after overlay
  svg.selectAll('.dots, .overlay ~ *').raise();
}

function brushed(event) {
  const selection = event.selection;
  d3.selectAll('circle').classed('selected', (d) =>
    isCommitSelected(selection, d),
  );
  renderSelectionCount(selection);
  renderLanguageBreakdown(selection);
}

function isCommitSelected(selection, commit) {
  if (!selection) {
    return false;
  }
  // TODO: return true if commit is within brushSelection
  // and false if not
  const [x0, x1] = selection.map((d) => d[0]);
  const [y0, y1] = selection.map((d) => d[1]);
  const x = xScale(commit.date);
  const y = yScale(commit.hourFrac);

  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

function renderSelectionCount(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];

  const countElement = document.querySelector('#selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function renderLanguageBreakdown(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type,
  );

  // Update DOM with breakdown
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
  }
}

let data = await loadData();
let commits = processCommits(data);
console.log(commits);

renderCommitInfo(data, commits);

renderScatterPlot(data, commits);

renderTooltipContent(commits);

//  export so meta.js can use
export { commits, data };
//console.log(data[0].date, data[0].datetime);
