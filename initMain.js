const canvas = document.getElementById('canvas');
const ctx= canvas.getContext('2d');
ctx.imageSmoothingEnabled = false


var solids = [false, false, false, false, true, true, true, true, true, true]
var mouseX;
var mouseY;
var mouseDown = false;
var activeTab = true;
var tick = 0;

var player = {
	x : 3,
	y : 3,
	speed : 1,
	dir : 180,
	frame : 1,
	walkTime : 0,
	walkDelay : 32,
	currentTile : 0,
	signReload : 0
}

var cameraY;
var cameraX;
var joyX = 0;
var joyY = 0;
var joyDist;
var GMAX = 32;
const GRID = [];

var EDITOR = false;
var brushnum = 2;
var LAYER = 1;
var pallx = 0;
var pally = 0;
var pallIdx = 2;
var brushpidx;

window.addEventListener('mousemove', function (e) {
	mouseX = e.x;
	mouseY = e.y;
 	mouseX = mouseX-canvas.offsetLeft
	mouseY = mouseY-canvas.offsetHeight
});

       document.addEventListener('mousedown', () => {
            mouseDown = true;
        });

        document.addEventListener('mouseup', () => {
            mouseDown = false;
        });

function checkMouseBounds(def, x1, y1, x2, y2) {
	if (def) {
		if (mouseX < 0) {return false}
		if (mouseX > 300) {return false}
		if (mouseY < 0) {return false}
		if (mouseY > 150) {return false}
	} else {
		if (mouseX < x1) {return false}
		if (mouseX > x2) {return false}
		if (mouseY < y1) {return false}
		if (mouseX > y2) {return false}
	}
	return true;
}

function printImg(image, x, y) {
	ctx.drawImage(image, x, y);
}


window.onblur = function () {
	activeTab = false
};
      
window.onfocus = function () {
	activeTab = true	
};



const keysPressed = {};


function isKeyPressed(key) {
	return keysPressed[key] == true;
}

	
document.addEventListener('keydown', function(event) {
	keysPressed[event.key] = true;
});


document.addEventListener('keyup', function(event) {
	keysPressed[event.key] = false;
});

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

const playerImages = [];

const playerSources = [
	'img/player/walk01.png',
	'img/player/walk02.png',
	'img/player/idle0.png',
	'img/player/idle90.png',
	'img/player/walk901.png',
	'img/player/walk902.png',
	'img/player/idle180.png',
	'img/player/walk1801.png',
	'img/player/walk1802.png',
	'img/player/idle270.png',
	'img/player/walk2701.png',
	'img/player/walk2702.png'
]

for (let i = 0; i < playerSources.length; i++) {
	const img = new Image();
	img.src = playerSources[i];
	playerImages.push(img);
}

const tileImages = [];

const tileSources = [
	'img/tiles/background.bmp',
	'img/tiles/blank.bmp',
	'img/tiles/tile1.bmp',
	'img/tiles/tile2.png',
	'img/tiles/tile3.png',
	'img/tiles/tile4f0.png',
	'img/tiles/tile4f1.png',
	'img/tiles/tile4f2.png',
	'img/tiles/tile4f3.png',
	'img/tiles/tile5.png'
]

for (let i = 0; i < tileSources.length; i++) {
	const img = new Image();
	img.src = tileSources[i];
	tileImages.push(img);
}