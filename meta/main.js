
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

let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);