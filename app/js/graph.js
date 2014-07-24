/**
 * Created by kevinoverall on 5/16/14.
 */

//I *could* use flot for this, but sometimes the journey is its own reward

var margin = 50;

//Initializes the graph
$(function() {
    var graphs = Array.prototype.slice.call(document.getElementsByClassName("graph"), 0);
    for(var i = 0; i < graphs.length; i++) {
        drawAxes(graphs[i]);
    }

    $("#simulateButton").click(function () {
        $.getScript( "js/simulation.js", function( data, textStatus, jqxhr ) {
            console.log("Simulating");
            var results = simulate();
            for(var i = 0; i < graphs.length; i++) {
                graphs[i].width = graphs[i].width;
                drawGraph(results[graphs[i].id], graphs[i]);
                drawAxes(graphs[i]);
            }
        });
    });
});

//Draws and labels axes for the graphs
function drawAxes(g) {
    var ctx = g.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(margin, g.height-margin);
    ctx.lineTo(g.width-margin, g.height-margin);
    ctx.moveTo(margin, g.height-margin);
    ctx.lineTo(margin, margin);
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.stroke();

    var xlbl = $(g).data("xlabel");
    ctx.textAlign = "center";
    ctx.font = "bold 20px sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ddd";
    ctx.fillText(xlbl, g.width/2, g.height-margin/2);

    var ylbl = $(g).data("ylabel");
    ctx.textAlign = "center";
    ctx.font = "bold 20px sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ddd";
    ctx.save();
    ctx.translate(margin/2, g.height/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText(ylbl, 0, 0);
    ctx.restore();
}

//Draws lines for the graph
function drawGraph(data, g) {
    var ctx = g.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(margin, g.height-margin);
    for(var i = 0; i < data.length; i++) {
        ctx.lineTo(margin + (data[i][0]/20)*(g.width-margin*2), g.height-margin - (data[i][1]/100)*(g.height-margin*2));
    }
    ctx.strokeStyle = "#f00";
    ctx.lineWidth = 4;
    ctx.stroke();
}
