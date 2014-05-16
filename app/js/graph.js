/**
 * Created by kevinoverall on 5/16/14.
 */

//I *could* use flot for this, but sometimes the journey is it's own reward

//Initializes the graph
$(function() {
    var graphs = Array.prototype.slice.call(document.getElementsByClassName("graph"), 0);
    for(var i = 0; i < graphs.length; i++) {
        drawAxes(graphs[i]);
    }
});

//Draws and labels axes for the graphs
function drawAxes(g) {
    var ctx = g.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(50, g.height-50);
    ctx.lineTo(g.width-50, g.height-50);
    ctx.moveTo(50, g.height-50);
    ctx.lineTo(50, 50);
    ctx.strokeStyle = "#ddd";
    ctx.stroke();

    var xlbl = $(g).data("xlabel");
    ctx.textAlign = "center";
    ctx.font = "bold 20px sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ddd";
    ctx.fillText(xlbl, g.width/2, g.height-25);

    var ylbl = $(g).data("ylabel");
    ctx.textAlign = "center";
    ctx.font = "bold 20px sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ddd";
    ctx.save();
    ctx.translate(25, g.height/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText(ylbl, 0, 0);
    ctx.restore();
}