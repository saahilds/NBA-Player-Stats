// Global function called when select element is changed
function onCategoryChanged() {
    var select = d3.select('#categorySelect').node();
    var category = select.options[select.selectedIndex].value;
    // Update chart with the selected category of cereal
    updateChart(category);
}

// recall that when data is loaded into memory, numbers are loaded as strings
// this function helps convert numbers into string during data preprocessing
function dataPreprocessor(row) {
    return {
        Year: row['Year'],
        Player: row['Player'],
        Position: row['Pos'],
        Age: row['Age'],
        Team: row['Tm'],
        nGames: row['G'],
        MinPlayed: row['MP'],
        EfficiencyRating: row['PER'],
        BoxPM: row['BPM'],
        FGs: row['FG'],
        FGPct: row['FG%'],
        ThreePTs: row['3P'],
        ThreePTPct: row['3P%'],
        FTs: row['FT'],
        FTPct: row['FT%'],
        ORB: row['ORB'],
        DRB: row['DRB'],
        TRB: row['TRB'],
        AST: row['AST'],
        STL: row['STL'],
        BLK: row['BLK'],
        TOV: row['TOV'],
        PFs: row['PF'],
        PTS: row['PTS'],
        PPG: row['PTS']/row['G'],
        APG: row['AST']/row['G'],
        RPG: row['TRB']/row['G']

    };
}

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = { t: 60, r: 20, b: 80, l: 60 };

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;



// scales
var statScale; // y axis
var xScale; // x axis

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', `translate(${padding.l}, ${padding.t})`);

var data;
var allTeamNames;
d3.csv('Seasons_Stats.csv', dataPreprocessor).then(function(dataset) {
    // Create global variables here and intialize the chart
    data = dataset;
    
    // Add axes to chart
    addAxes();
    
    
    // createPoints('2017');
    updateChart('2017');

    d3.select('#below')
        .append('p')
        .append('button')
        .style("border", "1px solid black")
        .text('Filter Data')
        .on('click', function() {
            p = document.getElementById("cutoff").value;
            playersAbove = players.filter(d => d.PPG >= p);
            chartG.selectAll('.Selected').remove();
            var player = chartG.selectAll('.Selected')
            .data(playersAbove, d => d.PPG);
            var playerEnter = player.enter()
                .append('g')
                .attr('class', 'Selected');
            playerEnter.append('circle')
                .data(playersAbove)
                .attr('fill', function(d) {
                    if (d.PPG < 10) {
                        return d3.color('pink');
                    } else if (d.PPG < 20) {
                        return d3.color('orange');
                    } else if (d.PPG < 25) {
                        return d3.color('red');
                    } else {
                        return d3.color('blue');
                    }
                })
                .attr('r', 6)
                .attr('class', 'Selected')
                .attr('cx', function(d) {
                    return teamScale(d.Team);
                })
                .attr('cy', function(d) {
                    return statScale(d.PPG);
                });
            player.exit().remove();
            hoverInfo();
        });
        
        
});

function addAxes() {
    // **** Draw the axes here ****
    allTeamNames = new Set();

    data.forEach(element => {
        allTeamNames.add(element['Team']);
    });
    allTeamNames = Array.from(allTeamNames).sort(); //maintain all teams on X-axis so we don't have to change for each year
    statScale = d3.scaleLinear()
        .domain([0,40])
        .range([chartHeight,0]);
    teamScale = d3.scalePoint()
        .domain(allTeamNames)
        .range([0,1092]); 
    yaxis = d3.axisLeft()
        .scale(statScale);
    xaxis = d3.axisBottom()
        .scale(teamScale);
    chartG.append("g")
        .call(yaxis);
    chartG.append("g")
        .attr('transform', 'translate(0,380)')
        .call(xaxis);
    //axis/chart labels
    svg.append('text')
        .attr('x',550)
        .attr('y', 35)
        .text("NBA Players PPG by Year");
    svg.append('text')
        .attr('x',-330)
        .attr('y',20)
        .attr('transform', 'rotate(-90)')
        .text("Points Per Game (PPG)");
    svg.append('text')
        .attr('x', 600)
        .attr('y', 480)
        .text('Team');
    //Legend
    svg.append('text')
        .attr('x', 1048)
        .attr('y', 20)
        .text('Legend:');
    svg.append('circle')
        .attr('r', 6)
        .attr('cx', 1053)
        .attr('cy', 34)
        .attr('fill', d3.color('pink'))
        .attr('opacity', .7);
    svg.append('text')
        .attr('x', 1062)
        .attr('y', 40)
        .text('0-9 PPG');
    svg.append('circle')
        .attr('r', 6)
        .attr('cx', 1053)
        .attr('cy', 50)
        .attr('fill', d3.color('orange'))
        .attr('opacity', .7);
    svg.append('text')
        .attr('x', 1062)
        .attr('y', 56)
        .text('10-19 PPG');
    svg.append('circle')
        .attr('r', 6)
        .attr('cx', 1053)
        .attr('cy', 66)
        .attr('fill', d3.color('red'))
        .attr('opacity', .7);
    svg.append('text')
        .attr('x', 1062)
        .attr('y', 72)
        .text('20-24 PPG');
    svg.append('circle')
        .attr('r', 6)
        .attr('cx', 1053)
        .attr('cy', 82)
        .attr('fill', d3.color('blue'))
        .attr('opacity', .7);
    svg.append('text')
        .attr('x', 1062)
        .attr('y', 88)
        .text('25+ PPG');
}
var teamName;
var teamNameEnter;

function createPoints(year) {
    // players = data.filter(d => d.Year === year);
    chartG.selectAll('.Unselected')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'Unselected')
    chartG.selectAll('.Unselected')
        .append('circle')
        .data(data)
        .attr('fill', d3.color('blue'))
        .attr('cx', function(d) {
            return teamScale(d.Team);
        })
        .attr('cy', function(d) {
            return statScale(d.PPG);
        })
        .attr('r', 6);
    // hoverInfo();
    }
    


var players;
function updateChart(year, cutoff=0) {
    //  Create a filtered array of players based on the year
    players = data.filter(d => d.Year === year);
    var player = chartG.selectAll('.Selected')
        .data(players, d => d.PPG);
    var playerEnter = player.enter()
        .append('g')
        .attr('class', 'Selected');
    playerEnter.append('circle')
        .data(players)
        .attr('fill', function(d) { //fill by ppg intervals
            if (d.PPG < 10) {
                return d3.color('pink');
            } else if (d.PPG < 20) {
                return d3.color('orange');
            } else if (d.PPG < 25) {
                return d3.color('red');
            } else {
                return d3.color('blue');
            }
        })
        .attr('r', 6)
        .attr('class', 'Selected')
        .attr('cx', function(d) {
            return teamScale(d.Team);
        })
        .attr('cy', function(d) {
            return statScale(d.PPG);
        });
    player.exit().remove();
    hoverInfo();

    // teamName.exit().remove();
}

function hoverInfo() { //hover feature for details on demand 
    d3.selectAll('.Selected')
        .on('mouseover', function(d,i) {
            d3.select(this).transition()
                .duration('1')
                .style('opacity',1);
            document.getElementById('name').innerHTML = d.Player;
            document.getElementById('age').innerHTML = d.Age;
            document.getElementById('team').innerHTML = d.Team;
            document.getElementById('ppg').innerHTML = d.PPG.toFixed(1);
            document.getElementById('apg').innerHTML = d.APG.toFixed(1);
            document.getElementById('rpg').innerHTML = d.RPG.toFixed(1);
            document.getElementById('gp').innerHTML = d.nGames;
            document.getElementById('fg%').innerHTML = (d.FGPct*100).toFixed(1);
            document.getElementById('3p%').innerHTML = (d.ThreePTPct*100).toFixed(1);
            document.getElementById('ft%').innerHTML = (d.FTPct*100).toFixed(1);
        })
        .on('mouseout', function(d,i) {
            d3.select(this).transition()
                .duration('1')
                .style('opacity',0.7);
            document.getElementById('name').innerHTML = "";
            document.getElementById('age').innerHTML = "";
            document.getElementById('team').innerHTML = "";
            document.getElementById('ppg').innerHTML = "";
            document.getElementById('apg').innerHTML = "";
            document.getElementById('rpg').innerHTML = "";
            document.getElementById('gp').innerHTML = "";
            document.getElementById('fg%').innerHTML = "";
            document.getElementById('3p%').innerHTML = "";
            document.getElementById('ft%').innerHTML = "";
        });
}

// Remember code outside of the data callback function will run before the data loads
