const typedInputBox = document.getElementById("typedInput")
var typedInput = typedInputBox.value;

const canvas = document.getElementById('canvas');
const ctx= canvas.getContext('2d');
ctx.imageSmoothingEnabled = false

let DIALOGUES = []
let DialogueLocations = []

var solids = [false, false, true, true, true, true, true, true, true, true]
var mouseX;
var mouseY;
var mouseDown = false;
var activeTab = true;
var tick = 0;

var STOP = false;
var MENU = false;

var player = {
	x : 3,
	y : 3,
	speed : 1,
	dir : 180,
	frame : 1,
	walkTime : 0,
	walkDelay : 32,
	currentTile : 0,
	zHeldDown : false,
	actionReload : 0,
	chestFrameTimer : 0,
	chestBeingOpened : false
}

var zLastTurn = false

var cameraY;
var cameraX;
var joyX = 0;
var joyY = 0;
var joyDist;
var GMAX = 32;
var GRID = [];
var place = {
	name : 'over',
	x : 0,
	y : 0,
	full : 'over.0.0'
}
var savedGRIDS = [GRID]
var savedNAMES = [place.full]


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
	mouseY = mouseY-canvas.offsetTop
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
		if (mouseX > 600) {return false}
		if (mouseY < 0) {return false}
		if (mouseY > 300) {return false}
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
	'img/player/p1.png',
	'img/player/p2.png',
	'img/player/p3.png'
]

for (let i = 0; i < playerSources.length; i++) {
	const img = new Image();
	img.src = playerSources[i];
	playerImages.push(img);
}

const tileImages = [];

const tileSources = [
	'img/tiles/tile1.bmp',
	'img/tiles/tile2.png',
	'img/tiles/tile3.png',
	'img/tiles/tile4f0.png',
	'img/tiles/tile4f1.png',
	'img/tiles/tile4f2.png',
	'img/tiles/tile4f3.png',
	'img/tiles/tile5.png',
	'img/tiles/tile6f0.png',
	'img/tiles/tile6f1.png'
]

for (let i = 0; i < tileSources.length; i++) {
	const img = new Image();
	img.src = tileSources[i];
	tileImages.push(img);
}

const UIImages = [];

const UISources = [
	'img/UI/background.bmp',
	'img/UI/blank.bmp',
	'img/UI/inventoryBack.png',
	'img/UI/sword.png'
	
]

for (let i = 0; i < UISources.length; i++) {
	const img = new Image();
	img.src = UISources[i];
	UIImages.push(img);
}

const enemyImages = [];

const enemySources = [
	'img/enemies/spooksheet.png',
	'img/enemies/slimesheet.png'
]

for (let i = 0; i < enemySources.length; i++) {
	const img = new Image();
	img.src = enemySources[i];
	enemyImages.push(img);
}


var selectedInputLocation
var selectedArray

function typedAnswerSubmit() {
	typedInput = typedInputBox.value
	typedInputBox.style.display = 'none'
	document.getElementById("submitButton").style.display = 'none'
	TYPING = false
	feedback.push({text: 'Text Recorded In Sign', howLongAgo : 0})
	if (selectedArray == 'd') {
		DIALOGUES[DialogueLocations.indexOf(selectedInputLocation)] = typedInput
	} else {
		itemLocItem[itemLoc.indexOf(selectedInputLocation)] = typedInput
	}
}
