var canvas = $("canvas");
var ctx = canvas[0].getContext("2d");
var click = false;

window.onload = function () {
    canvas.mousedown(function (e) {
        click = true;
        draw(e.pageX, e.pageY);
    });

    canvas.mouseup(function (e) {
        click = false;
        draw(e.pageX, e.pageY);
    });

    canvas.mousemove(function (e) {
        if (click === true) {
            draw(e.pageX, e.pageY);
        }
    });

    //refazer para ficar mais fluido, usar stroke ao inves de arc
    function draw(xPos, yPos) {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.fillStyle = "black";
        ctx.lineJoin = "round";
        ctx.arc(
            xPos - canvas.offset().left,
            yPos - canvas.offset().top,
            2,
            0,
            2 * Math.PI
        );
        ctx.fill();
        ctx.closePath();
    }
};