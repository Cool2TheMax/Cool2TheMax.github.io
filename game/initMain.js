const canvas = document.getElementById('canvas');
const ctx= canvas.getContext('2d');
ctx.imageSmoothingEnabled = false

let DIALOGUES = []
let DialogueLocations = []

var solids = [false, false, true, true, true, true, true, true, true, true, false]
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
	dir : 0,
	frame : 1,
	walkTime : 0,
	walkDelay : 32,
	isSprinting : false,
	currentTile : 0,
	actionReload : 0,
	actionTile : 0
}


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
		if (mouseX > 640) {return false}
		if (mouseY < 0) {return false}
		if (mouseY > 360) {return false}
	} else {
		if (mouseX < x1) {return false}
		if (mouseX > x2) {return false}
		if (mouseY < y1) {return false}
		if (mouseX > y2) {return false}
	}
	return true;
}

function stringToArr(st) {
	let final = []
	for (let i = 0; i < st.length; i++) {
		final.push(st.charAt(i))
	}
	return final;
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
const tileSources = ['img/tiles/tileMap.png']
const tileMapWidth = 4



for (let i = 0; i < tileSources.length; i++) {
	const img = new Image();
	img.src = tileSources[i];
	tileImages.push(img);
}

function printTileImgFromMap(type, tileID, x, y, width, height) {
	let mapX = ((tileID % tileMapWidth)) * 16
	let mapY = ((tileID - (tileID % tileMapWidth)) / tileMapWidth) * 16
	if (type == 'tile') {
		var image = tileImages[0]
	} else if (type == 'item'){
		var image = UIImages[3]
	}
	ctx.drawImage(image, mapX, mapY, 16, 16, x, y, width, height)

}

const UIImages = [];

const UISources = [
	'img/UI/background.png',
	'img/UI/blank.bmp',
	'img/UI/inventoryBack.png',
	'img/UI/items.png'
]

for (let i = 0; i < UISources.length; i++) {
	const img = new Image();
	img.src = UISources[i];
	UIImages.push(img);
}

const NPCImages = [];

const NPCSources = [
	'img/NPC/character1.png',
	'img/NPC/character1walk.png',
	'img/NPC/character1head.png',
	'img/NPC/character2.png',
	'img/NPC/character2walk.png',
	'img/NPC/character2head.png',
	'img/NPC/character3.png',
	'img/NPC/character3walk.png',
	'img/NPC/character3head.png',
]

for (let i = 0; i < NPCSources.length; i++) {
	const img = new Image();
	img.src = NPCSources[i];
	NPCImages.push(img);
}
