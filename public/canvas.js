const canvas = $("canvas");
const ctx = canvas[0].getContext("2d");
const inputField = $("#signature");

let isDrawing = false;
let lastX = 0;
let lastY = 0;

//to draw the signature
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.lineWidth = 1;
ctx.strokeStyle = "black";

canvas.on("mousedown", (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.on("mousemove", draw);

canvas.on("mouseup", () => {
    isDrawing = false;
    inputValue();
});

//cellphone
canvas.on("touchstart", (e) => {
    e.preventDefault();
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.on("touchmove", draw);

canvas.on("touchend", (e) => {
    e.preventDefault();
    isDrawing = false;
    inputValue();
});



function draw(e) {
    e.preventDefault();
    if (!isDrawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

//assigning signature value to the hidded input field
function inputValue() {
    //to save canvas image as data url
    let dataUrl = canvas[0].toDataURL();
    inputField.val(dataUrl);
}
