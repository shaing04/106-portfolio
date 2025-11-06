
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

//let data = await loadData();

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
        url: 'https://github.com/shaing04/106-portfolio/commit/' + commit,
        // ... what else?
        author, date, time, timezone, datetime, 

        // what else might be useful?
        file, type,

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
        configurable: true
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
    const uniqueFiles = d3.group(data, d => d.file).size;
    dl.append('dd').text(uniqueFiles);
    //console.log(uniqueFiles)

    // Number of days worked on site
    dl.append('dt').text('Days Worked On Site');
    const daysWorked = d3.group(data, d => d.date).size;
    dl.append('dd').text(daysWorked); 

    // Time of Day 
    const workByPeriod = d3.rollups(data, (v) => v.length, (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' }),);
    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
    dl.append('dt').text('Average Time of Day for Work'); 
    dl.append('dd').text(maxPeriod)



}   

//let data = await loadData();
//let commits = processCommits(data);

//renderCommitInfo(data, commits);


function renderScatterPlot(data, commits) { 
    // put all the JS code of steps inside this function
    const width = 1000; 
    const height = 600;

    const svg = d3.select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    const xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([0, width])
        .nice();

    const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
    

    const margin = { top: 10, right: 10, bottom: 30, left: 20 }; 

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    // Update scales with new ranges
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    // Add gridlines BEFORE the axes
    const gridlines = svg.append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    const xAxis = d3.axisBottom(xScale); 
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00'); 

    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis);

    // Add Y axis
    svg.append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);


    const dots = svg.append('g').attr('class', 'dots');

    dots.selectAll('circle')
        .data(commits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', 5)
        .attr('fill', 'steelblue');

    
}


let data = await loadData(); 
let commits = processCommits(data);
console.log(commits);

renderCommitInfo(data, commits);

renderScatterPlot(data, commits);

//console.log(data[0].date, data[0].datetime);
