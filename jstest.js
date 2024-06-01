function choose(arr) {return arr[Math.floor(Math.random()*arr.length)];}

function start() {
	var header = document.getElementById('header2');
	header.textContent = choose(['The Metaverse Peter', 'Are you my Father?', 'Do you know the Muffin Man?', 'Take the blue pill', (Math.round(Math.random() * 10)+1) + ' Days until the machines revolt.', 'Javascript Enabled!']);
	var consoletext = 'bruh';
	console.log(consoletext);
}

function startDraw() {
	const animButton = document.getElementById('animation');
	animButton.remove();
	draw();
}

function draw() { 
	if (x > 600) {
		x = 0;
		ctx.fillStyle = 'darkgray';
		ctx.fillRect(0, 0, 300, 150);
		ctx.fillStyle = 'grey';
		ctx.fillRect(10, 20, 280, 16)
		ctx.fillStyle = 'black';
		ctx.font = "12px Courier";
  		ctx.fillText(Math.random(), 10, 50);
	}
	x += 15;
	ctx.fillStyle = 'blue';
	ctx.fillRect(x/2, 65, 30, 30);
	requestAnimationFrame(draw);
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var x = 601;