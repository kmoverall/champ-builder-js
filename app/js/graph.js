/**
 * Created by kevinoverall on 5/16/14.
 */

//I *could* use flot for this, but sometimes the journey is its own reward

$(function() {
    //Initializes the graph
    var graphs = Array.prototype.slice.call(document.getElementsByClassName("graph"), 0);
    for(var i = 0; i < graphs.length; i++) {
        drawAxes(graphs[i]);
    }

    //Runs the simulation and graphs the resultant data
    $("#simulateButton").click(function () {
        console.log("Simulating");
        $.getScript( Champion.scriptlocation, function( data, textStatus, jqxhr ) {
            Target.reset();
            Champion.reset();

            //This is a stupid hack that I'm not 100% sure is needed anymore
            Target.slows = {};
            Champion.slows = {};
            Target.effects = {};
            Champion.effects = {};

            Scripts.load();

            console.log("loaded champ scripts: " + Champion.scriptlocation);

            var results = simulate();
            for (var i = 0; i < graphs.length; i++) {
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
    ctx.moveTo(MARGIN, g.height-MARGIN);
    ctx.lineTo(g.width-MARGIN, g.height-MARGIN);
    ctx.moveTo(MARGIN, g.height-MARGIN);
    ctx.lineTo(MARGIN, MARGIN);
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.stroke();

    var xlbl = $(g).data("xlabel");
    ctx.textAlign = "center";
    ctx.font = "bold 20px sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ddd";
    ctx.fillText(xlbl, g.width/2, g.height-MARGIN/2);

    var ylbl = $(g).data("ylabel");
    ctx.textAlign = "center";
    ctx.font = "bold 20px sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ddd";
    ctx.save();
    ctx.translate(MARGIN/2, g.height/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText(ylbl, 0, 0);
    ctx.restore();
}

//Draws lines for the graph
function drawGraph(data, g) {
    var ctx = g.getContext("2d");
    ctx.beginPath();
    //Moves to initial data point
    ctx.moveTo(MARGIN + (data[0][0]/100)*(g.width-MARGIN*2), g.height-MARGIN - (data[0][1]/100)*(g.height-MARGIN*2));
    for(var i = 1; i < data.length; i++) {
        ctx.lineTo(MARGIN + (data[i][0]/100)*(g.width-MARGIN*2), g.height-MARGIN - (data[i][1]/100)*(g.height-MARGIN*2));
    }
    ctx.strokeStyle = "#f00";
    ctx.lineWidth = 4;
    ctx.stroke();
}
