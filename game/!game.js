function start() {
	console.log('gaming');
	ctx.font = "bold 18px monospace"
	newMap();
	gameLoop();
}

function gameLoop() {
	playerTick()
	drawBackground();
	drawTiles(1);
	drawTiles(2);
	particleStuff('spark')
	drawPlayer();
	
	particleStuff('smoke');
	if (dialogue) {
		dialogueStuff();
	} else {
		editorStuff();
		menuStuff();
		inventoryStuff();
	}
	
	fpsStuff();
	fadeStuff()
	
	if (STOP) {return true;} 
	requestAnimationFrame(gameLoop);
}





//PLAYER STUFF
//==============================================================
//==============================================================

let editorCamSupplement = 100;

let playerXSup = 9;
let playerYSup = 4;


function playerTick() {
	place.full = place.name + '.' + place.x + '.' + place.y
	if (isKeyPressed('z')) {
		player.zHeldDown = zLastTurn
		zLastTurn = true	
	} else {
		player.zHeldDown = false
		zLastTurn = false
	}
	if (!dialogue && !TYPING) {
		player.currentTile = player.x + playerXSup + ((player.y + playerYSup) * 32)
		if (!(player.walkTime > 0 && player.walkTime < player.walkDelay)) {
			if (!MENU) {
				playerControls();
			} else {
				joyX = 0
				joyY = 0
				joyDist = 0
			}
		}
		if (joyDist > 0) {
			tryMove(joyX, joyY)
		}
		cameraStuff()
		playerCheckOutOfBounds()
		if (player.actionReload !== 0) {
			player.actionReload--
		} else {
			checkForSigns()
			checkForChests()
		}
	}
}



var inven = ['gold coin', 'sword', 'healing potion']
var invenNums = [23, 1, 2]
var Inventory = false
let itemGained
let itemAmount

const itemLoc = []
const itemLocItem = []
const loottable = ['gold coin', 'healing potion']
const ltgainranges = [[1 , 3], [1, 1]]


function checkForChests() {
	if (!MENU && !TYPING && player.dir == 0) {
		if (player.chestBeingOpened) {
			player.chestFrameTimer++
			let i = player.chestFrameTimer
			if (i == 10) {
				player.chestFrameTimer = 0
				player.chestBeingOpened = false
			}
		} 

		if (!player.chestBeingOpened && isKeyPressed('z') && GRID[player.currentTile - GMAX] == 8) {
			if (EDITOR && !TYPING) {
				selectedArray = null
				selectedInputLocation = player.currentTile - GMAX + place.full
				TYPING = true
				typedInputBox.style.display = 'block'
				typedInputBox.value = text
				document.getElementById("submitButton").style.display = 'block'
				return;
			}
			if (itemLoc.indexOf(player.currentTile - GMAX + place.full) !== -1) {
				itemGained = itemLocItem[itemLoc.indexOf(player.currentTile - GMAX + place.full)]
				itemAmount = 1
			} else {
				let itemIdx = randInt(0, loottable.length-1)
				itemGained = loottable[itemIdx]
				itemAmount = randInt(ltgainranges[itemIdx][0], ltgainranges[itemIdx][1])
			}
			newDialogue('You got... ', tileImages[8])
			text = text + ((itemAmount == 1) ? ('A ' + itemGained + '! The ' + itemGained + ' was') : (itemAmount + ' ' + itemGained + 's! The ' + itemGained + 's were')) + ' put in your bag.'

			if (inven.indexOf(itemGained) == -1) {
				inven.push(itemGained)
				invenNums.push(itemAmount)
			} else {
				invenNums[inven.indexOf(itemGained)] += itemAmount
			}
			GRID[player.currentTile - GMAX] = 9
			player.chestBeingOpened = true
			player.actionReload = 10
		}
	}
}

function cameraStuff() {
	cameraX = player.x * 32 + (player.walkTime * joyX) + (EDITOR* 50) + (MENU * 50);
	if (cameraX < 0) {cameraX=0}
	if (cameraX > 422 + (EDITOR * 96) - 32 + (MENU * 50)) {cameraX = 422 +(EDITOR * 100) - 32 + (MENU * 50)}
	cameraY = player.y * 32 + ((player.walkTime) * joyY);
	if (cameraY > 724-32) {cameraY=724-32}
	if (cameraY < 0) {cameraY=0}
}


function checkForSigns() {
	if (!MENU && isKeyPressed('z') && player.dir == 0 && !player.zHeldDown) {	
		if (GRID[player.currentTile - GMAX] == 7) {
			newDialogue(player.currentTile - GMAX + place.full, tileImages[7])
			player.actionReload = 10
		}
	}

}
function playerControls() {
	joyX = (isKeyPressed('d') || isKeyPressed('ArrowRight'));
	joyX -= (isKeyPressed('a') || isKeyPressed('ArrowLeft'));
	joyY = (isKeyPressed('s') || isKeyPressed('ArrowDown'));
	joyY -= (isKeyPressed('w') || isKeyPressed('ArrowUp'));
	joyDist = Math.sqrt((joyX * joyX) + (joyY * joyY));
	if (joyX !== 0 && joyY !== 0) {joyX = 0}
	if (joyX > 0) {player.dir = 90} else if (joyX < 0) {player.dir = 270}

	if (joyY > 0) {player.dir = 180} else if (joyY < 0) {player.dir = 0}
}


function tryMove(dx, dy) {
	if (joyDist > 0 && !pathIsSolid()) {
		player.walkTime += (isKeyPressed('x') * 1) + 1 
		if (player.walkTime >= player.walkDelay) {
			player.x += dx;
			player.y += dy;
			player.walkTime = 0
		}
	}
}


function pathIsSolid() {
	if (joyY == 0) {
		if (solids[GRID[player.currentTile + joyX]]) {return true}
	}
	if (joyX == 0) {
		if (solids[GRID[player.currentTile + (joyY*GMAX)]]) {return true}
	}
	return false
}


let color = 0
let playerPrintX
let playerPrintY

function drawPlayer() {
	playerPrintX = player.x * 32  + (canvas.width / 2)  - cameraX + (player.walkTime * joyX) - 1
	playerPrintY = player.y * 32  + (canvas.height / 2) - cameraY + (player.walkTime * joyY) - 14
	// Left Leg
	ctx.drawImage(
		playerImages[color],
		(player.dir == 90) * 8, 26, 8, 6, 
		playerPrintX + ((player.dir % 180 == 0) * 1) + ((player.dir == 90) * 6) + ((player.dir == 270) * 4) - 4, 
		playerPrintY + ((!(player.walkTime % 16 >= 8) && joyDist !== 0) * -2) + 10, 
		8, 6 
	)
	// Right Leg
	ctx.drawImage(
		playerImages[color],
		(player.dir == 270) * -8 + 9, 26, 7, 5, 
		playerPrintX + ((player.dir == 90) * -3) + ((player.dir == 270) * -5) + 6, 
		playerPrintY + ((player.walkTime % 16 >= 8 && joyDist !== 0) * -2) + 10, 
		7, 5
	)
	// Head
	ctx.drawImage(
		playerImages[color],
		player.dir / 90 * 18, 0, 18, 11, 
		playerPrintX - 2, 
		playerPrintY - 11, 
		18, 11, 
	)
	//player body		
	ctx.drawImage(
		playerImages[color],
		23, 26, 11, 11, 
		playerPrintX, 
		playerPrintY, 
		11, 11
	)
	//bag
	ctx.drawImage(
		playerImages[color],
		player.dir / 90 * 18, 17, 18, 7, 
		playerPrintX - 2, 
		playerPrintY, 
		18, 7
	)
	if (player.dir % 180 !== 90) {
	//left hand
		ctx.drawImage(
			playerImages[color],
			60, 26, 4, 4, 
			playerPrintX - 4, 
			playerPrintY + ((player.walkTime % 16 >= 8 && joyDist !== 0) * -2) + 4, 
			4, 4 
		)
	}
	//right hand
	ctx.drawImage(
		playerImages[color],
		60, 26, 4, 4, 
		playerPrintX + ((player.dir % 180 == 90) * -7) + 11, 
		playerPrintY + ((!(player.walkTime % 16 >= 8) && joyDist !== 0) * -2)+ 4, 
		4, 4 
	)
	//Kewl Hat
	ctx.drawImage(
		playerImages[color],
		player.dir / 90 * 18, 12, 18, 4, 
		playerPrintX - 1 - ((player.dir == 270) * 3) - (player.dir == 0), 
		playerPrintY - 11, 
		18, 4 
	)

	if (tick % 10 === 1) {
		player.frame++
	}
}


function playerCheckOutOfBounds() {
	if (player.x < -9) {changeScene('edge', -1, 0)}
	if (player.y < -4) {changeScene('edge', 0, -1)}
	if (player.x > 21) {changeScene('edge', 1, 0)}
	if (player.y > 26) {changeScene('edge', 0, 1)}
}

function changeScene(type, dx, dy) {
	if (EDITOR) {saveScene()}

	if (type === 'edge') {
		place.x += dx
		place.y += dy
	}
	place.full = place.name + '.' + place.x + '.' + place.y
	loadScene()

	if (type === 'edge') {
		if (dx) {
			if (dx === 1) {player.x = -9}
			if (dx === -1) {player.x = 21}
		}
		if (dy) {
			if (dy === 1) {player.y = -3}
			if (dy === -1) {player.y = 25}
		}
	}
	particlesArray = []	
}



function saveScene() {
	savedGRIDS[savedNAMES.indexOf(place.full)] = GRID
}

function loadScene() {
	if (savedNAMES.indexOf(place.full) === -1) {
		newMap()
		savedGRIDS.push(GRID)
		savedNAMES.push(place.full)
	}
	GRID = savedGRIDS[savedNAMES.indexOf(place.full)]
}

//MAP STUFF
//==============================================================
//==============================================================

function drawBackground() {
	ctx.drawImage(UIImages[0], -((cameraX % 32)+32), -((cameraY % 32)+32));
	ctx.drawImage(UIImages[0], -((cameraX % 32)+32) + UIImages[0].width, -((cameraY % 32)+32));
	ctx.drawImage(UIImages[0], -((cameraX % 32)+32), -((cameraY % 32)+32) + UIImages[0].height);
	ctx.drawImage(UIImages[0], -((cameraX % 32)+32) + UIImages[0].width, -((cameraY % 32)+32) + UIImages[0].height);
}

let cx = 0
let cy = 0

function drawTiles(lay) {
	let gidx = Math.floor(cameraX / 32) + ((lay-1)*GMAX*GMAX)
	gidx += GMAX * Math.floor(cameraY / 32)
	let y = -(cameraY % 32)
	let x = -(cameraX % 32)
	
	for (let i = 0; i < 12; i++) {
		x = - (cameraX % 32)
		for (let j = 0; j < 22; j++) {
			if (GRID[gidx] !== 0 && GRID[gidx] !== undefined) {
				ctx.drawImage(
						tileImages[GRID[gidx] + ((GRID[gidx] == 3) * Math.ceil(tick/8) % 4)], 
						x, y
						);
				if (tileSources[GRID[gidx]] === 'img/tiles/tile4f0.png') {
					if (tick % 60 === 1) {
						particlesArray.push(new Particle('smoke', x+11+cameraX, y+cameraY, 0))
					}
					if (Math.random() > 0.999) {
						particlesArray.push(new Particle('spark', x+cameraX, y+cameraY, 50))
					}
				}

			}
			x += 32
			gidx++
		}
		gidx += GMAX-22
		y += 32
		
	}
}



function newMap() {
	GRID = []
	for (let i = 0; i < (GMAX); i++) {
		GRID.push(2)
	}
	for (let i = 0; i < (GMAX-3); i++) {
		GRID.push(2)
		for (let j = 0; j < (GMAX-3); j++) {
			if (Math.random() > 0.7) {
				GRID.push(1);
			} else { 
				GRID.push(0);
			}
		}
		GRID.push(2)
		GRID.push(0)
	}
	for (let i = 0; i < GMAX-1; i++) {
		GRID.push(2)
	}
	for (let i = 0; i < (GMAX+1) * GMAX; i++) {
		GRID.push(0)
	}

}

//EDITOR (edit to try redeploying
//====================================================
//====================================================

function editorStuff() {
	if (EDITOR) {
		drawEditor()
		drawPallete()
		if (isKeyPressed('x') && !TYPING) {
			EDITOR = false;
			saveScene();
			MENU = true
		}
	}
	if (brushnum < 0 || brushnum > tileImages.length-1) {brushnum = 0}
}


function drawEditor() {
	if (mouseX < 500) {
		let gx = Math.floor((mouseX + cameraX) / 32)
		let gy = Math.floor((mouseY + cameraY) / 32)
		let gidx = gx+(gy*GMAX)
		if (brushnum > tileImages.length) {brushnum=0}
		printImg(tileImages[brushnum], (gx*32)-cameraX, (gy*32)-cameraY)

		ctx.strokeRect((gx*32)-cameraX, (gy*32)-cameraY, 32, 32)
		let tmp = gidx + ((LAYER-1)*(GMAX*GMAX))
		if (mouseDown && checkMouseBounds(true)) {
			if (GRID[tmp] == 7) {
				tmp2 = DialogueLocations.indexOf(tmp + place.full)
				DIALOGUES.splice(tmp2, 1)
				DialogueLocations.splice(tmp2, 1)
			} 
			if (brushnum == 7) {
				DialogueLocations.push(tmp + place.full)
				DIALOGUES.push("~iThis~b string is a test of bold text and ~iitalic ~btext. How well does it wrap?")//'You Saw The Sign! Did It Open Up Your eyes? Anyways, the site you\'re on is cool2themax.github.io! Tell your friends!')
			} else if (GRID[tmp] == 8 && itemLoc.indexOf(tmp + place.full) !== -1) {
				tmp2 = itemLoc.indexOf(tmp + place.full)
				itemLoc.splice(tmp2, 1)
				itemLocItem.splice(tmp2, 1)
			}
			GRID[tmp] = brushnum
		}
		if (isKeyPressed('e') && checkMouseBounds()) {brushnum = GRID[tmp]}
		
	}
}





function drawPallete(){
	ctx.fillStyle = "black"
	ctx.fillRect(canvas.width - 100, 0, 100, canvas.height)
	pallx += joyX
	pally += joyY
	if (pallx < 0) {pallx=0}
	if (pally < 0) {pally=0}
	if (pallx > 0) {pallx=0}
	if (pally < 0) {pally=0}
	pallIdx = pallx + (pally * 3)
	let gx
	let gy
	let x = 502
	let y = 11

	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 3; j++) {
			printImg(UIImages[1], x, y)
			if (j+(i*3)+1 < tileImages.length) {
				printImg(tileImages[j+(i*3)+1], x, y)
			}
			if (j+(i*3)+1 === brushnum) {
				gx = x
				gy = y
			}
			x += 32
		}
	x = 502
	y += 32
	}
	if (mouseX > 502 && mouseDown === true && checkMouseBounds(true)) {
		brushnum = Math.ceil((mouseX-502)/32)+((Math.ceil((mouseY-11)/32))-1)*3
	}
	ctx.strokeRect(gx, gy, 32, 32)
	
}




//EFFECTS
//===========================================================
//===========================================================

var particlesArray = []


class Particle {
	constructor(type, x, y, frame) {
		this.x = x
		this.y = y
		if (type === 'smoke') {
			this.speedY = 1
		} else if (type === 'spark') {
			this.speedY = 6 +((Math.random()-0.5)*4)
			this.speedX = randInt(-3, 3)
		}
		
		this.type = type
		this.frame = frame
	}

	draw() {
		if (this.type === 'smoke') {
			ctx.fillStyle = "rgba(120, 120, 120," + (100-(Math.round(this.frame/4))*3)/100 + ")"
			ctx.fillRect(this.x - cameraX, this.y - cameraY, 10, 10)		
		} else if (this.type === 'spark') {
			ctx.fillStyle = "yellow"
			ctx.fillRect(this.x - cameraX, this.y - cameraY, 2, 2)
		}	
	}

	update() {
		if (this.type === 'smoke') {
			this.y -= this.speedY
		} else if (this.type === 'spark') {
			if (this.frame < 15) {
				this.y -= this.speedY
				this.x += this.speedX
				this.speedY -= 1
				this.speedX = this.speedX * 0.9
			}
		}
		this.frame++
	}



}


function particleStuff(type) {
	let par = particlesArray.length
	for (let i = 0; i < par-1; i++) {
		if (particlesArray[i].type === type) {particlesArray[i].draw()
			if (tick % 5 === 1) {
				particlesArray[i].update()
			}
			if (particlesArray[i].frame > 150) {
				particlesArray.splice(i, 1)
				i--
				par--
			}
		}
	}
}


let fadeDuration = 60
let fadeTime = 0
let fade = false
let safeShowMenu = false

function fadeStuff() {
	if (fade) {
	fadeTime++
		ctx.fillStyle = 'rgba(0, 0, 0, ' + (Math.max(0, Math.min(1, -Math.pow((fadeTime - fadeDuration / 2) / (fadeDuration / 2), 2) + 1))) + ')'
		ctx.fillRect(0, 0, 600, 300)
		if (fadeTime >= fadeDuration) {
			fade = false
			fadeTime = 0
		} 
		if (1 == (Math.max(0, Math.min(1, -Math.pow((fadeTime - fadeDuration / 2) / (fadeDuration / 2), 2) + 1)))) {
			if (safeShowMenu) {safeShowMenu = false; Inventory = false} else (safeShowMenu = true)
		}
	}
}

function startFade() {
	fade = true
	fadeTime = 0
}

function drawTriangle(dir, x, y) {
	ctx.beginPath()
	ctx.moveTo(19 + x, 8 + y)
	ctx.lineTo(0 + x, 16 + y)
	ctx.lineTo(0 + x, 0 + y)
	ctx.lineTo(19 + x, 8 + y)
	ctx.closePath()
	ctx.fill()
}

//MENU
//===========================================================
//===========================================================

var skinMenu = false
var menuLevel = 0;
const MenuItems = ['Inventory', 'Save', 'Skins', 'EDITOR', 'Exit']
const MenuFunctions = [
		function() {
			feedback.push({text : 'WIP: Inventory is work in progress', howLongAgo : 0})
			Inventory = true
			invLevel = 0
			invScroll = 0
			startFade();
		}, 
		function() {
			saveScene()
			feedback.push({text : 'WIP: Saving is work in progress', howLongAgo : 0})
		},
		function () {
			skinMenu = true
		},
		function () {
			MENU = false;
			EDITOR = true;
		},

		function() {MENU = false}
	]

let menuJoyX
let menuJoyY
function menuStuff() {
	if (isKeyPressed('Enter') && !EDITOR && !Inventory && !dialogue && tick % 10 == 0) {
		if (!MENU) {
			MENU = true;
			menuLevel = 0;
		}
	}
	if (MENU) {
		if (tick % 4 == 0){
			menuJoyY = (isKeyPressed('s') || isKeyPressed('ArrowDown'))
			menuJoyY -= (isKeyPressed('w') || isKeyPressed('ArrowUp'))
			menuJoyX = (isKeyPressed('d') || isKeyPressed('ArrowRight'))
			menuJoyX -= (isKeyPressed('a') || isKeyPressed('ArrowLeft'))
			if (!skinMenu && !Inventory) {
				menuLevel += menuJoyY * !((menuLevel == 0 && menuJoyY == -1) || (menuLevel == MenuItems.length - 1 && menuJoyY == 1))
			}
		}
		if (isKeyPressed('x') && !Inventory) {MenuFunctions[MenuFunctions.length-1]()}
		if (isKeyPressed('z') && !player.zHeldDown && !Inventory) {MenuFunctions[menuLevel]()}
		drawSubMenu()
		drawMenu()
	}
}

var MenuOffset = 470

function drawMenu() {

	ctx.fillStyle = 'rgb(43, 43, 43)'
	ctx.fillRect(MenuOffset, 10, 120, 200)
	ctx.fillStyle = 'rgb(250, 255, 186)'				
	for (let i = 0; i < MenuItems.length; i++) {
		ctx.fillText(MenuItems[i], 6 + MenuOffset, i * 17 + 32)
	}

	ctx.beginPath()
	ctx.moveTo(100 + MenuOffset, menuLevel * 17 + 28)
	ctx.lineTo(118 + MenuOffset, menuLevel * 17 + 35)
	ctx.lineTo(118 + MenuOffset, menuLevel * 17 + 21)
	ctx.lineTo(100 + MenuOffset, menuLevel * 17 + 28)
	ctx.closePath()
	ctx.fill()
}


var skinMenuWidth = 75

function drawSubMenu() {
	let Where = MenuOffset - skinMenuWidth - 10
	if (skinMenu) {
		ctx.fillStyle = 'rgb(43, 43, 43)'
		ctx.fillRect(Where, 53, skinMenuWidth, 85)
		ctx.fillStyle = 'rgb(250, 255, 186)'
		ctx.fillText('Current', Where + (skinMenuWidth / 2) - ('Current'.length * 10 / 2), 75)
		ctx.fillText('Skin', Where + (skinMenuWidth / 2) - ('Skin'.length * 10 / 2), 75 + 17)
		ctx.fillText(color, Where + (skinMenuWidth / 2) - (color.toString().length * 10 / 2), 17 * 2 + 75)
		for (let j = 0; j < 2; j++) {
			ctx.beginPath()
			ctx.moveTo((-36 * (j == 1)) + (1 + 18 * (j == 0))  + Where + 46,  17 * 3 + 71)
			ctx.lineTo((-36 * (j == 1)) + (1 - 18 * (j == 0)) + Where + 64,  17 * 3 + 79)
			ctx.lineTo((-36 * (j == 1)) + (1 - 18 * (j == 0))  + Where + 64, 17 * 3 + 63)
			ctx.lineTo((-36 * (j == 1)) + (1 + 18 * (j == 0))  + Where + 46, 17 * 3 + 71)
			ctx.closePath()
			ctx.fill()
		}
		if (tick % 4 == 0) {
			color += menuJoyX * !((color == 0 && menuJoyX == -1) || (color == playerImages.length - 1 && menuJoyX == 1))
		}

		if (isKeyPressed('x')) {skinMenu = false}
	}
}

var invLevel = 0
var invScroll = 0
var invSub = false
var invSubSel = 0
var invSubAllow = 0
var invSubFuncs = [
	function(i) {inven.splice(i, 1); invenNums.splice(i, 1)},
	function() {invSub = false}
]


function inventoryStuff() {
	if (Inventory && safeShowMenu) {
		ctx.drawImage(UIImages[2], 0, 0, 600, 300)
		ctx.fillStyle = 'black'
		if (tick % 5 == 0 && !invSub) {
			invLevel += menuJoyY * !((invLevel == 0 && menuJoyY == -1) || (invLevel == inven.length && menuJoyY == 1))

			if (menuJoyY == -1 && invLevel >= 0) {
				if (invLevel < invScroll) {
					invScroll--
				}
			}
			if (menuJoyY == 1 && invLevel < inven.length + 1) {
				if (invLevel >= invScroll + 11) {
					invScroll++
				}
			}
			if (isKeyPressed('z') && invLevel !== inven.length && invSubAllow == 0) {
				invSub = true
				invSubAllow++
			}
		}
		drawTriangle(null, 221, ((invLevel - invScroll) * 20) + 64)
		for (i = 0; i < 11; i++) {
			if (inven[i + invScroll] !== undefined) {
				ctx.fillText(inven[i + invScroll].toLocaleUpperCase(), (i == invLevel - invScroll) * 20 + 222, i * 20 + 78)
				ctx.fillText( 'x' + invenNums[i + invScroll],  580 - ((invenNums[i + invScroll].toString().length + 1) * 10), i * 20 + 78)
			} else if (inven[i + invScroll - 1] !== undefined || inven.length == 0 && i == 0) {
				ctx.fillText('CLOSE BAG', (i == invLevel - invScroll) * 20 + 222, i * 20 + 78)
			}
		}
		if (invSub) {
			drawTriangle(null, 22, invSubSel * 17 + 187)
			ctx.fillText('TOSS', 42, 200)
			ctx.fillText('EXIT', 42, 217)
			invSubSel += menuJoyY * !((invSubSel == 0 && menuJoyY == -1) || (invSubSel == invSubFuncs.length - 1 && menuJoyY == 1))
			if (!isKeyPressed('z') && invSubAllow !== 2) {invSubAllow++}
			if (isKeyPressed('z') && invSubAllow == 2) {invSubFuncs[invSubSel](invLevel); invSub = false; invSubAllow++}
		}
		if (invSubAllow == 3 && !isKeyPressed('z')) {invSubAllow = 0}
		if ((isKeyPressed('x') || isKeyPressed('z') && invLevel == inven.length) && fadeTime == 0 && !invSub) {
			startFade();
		}
	}

}


//FPS
//===========================================================
//===========================================================


let times = []
var feedback = []

function fpsStuff() {
	const now = performance.now();
	while (times.length > 0 && times[0] <= now - 1000) {
		times.shift();
	}
	times.push(now);

	ctx.fillStyle = 'black'
	for (let i = 0; i < feedback.length; i++) {
		ctx.fillText(feedback[i].text, 0,  i * 20 + 20)
		feedback[i].howLongAgo++
		if (feedback[i].howLongAgo > 120) {
			feedback.splice(i, 1)
		}
	}
	if (EDITOR) {
		ctx.fillText('Editor Enabled. Press [X] to close', 0, feedback.length * 20 + 20)
	}
	ctx.fillText('FPS: ' + times.length, 0, feedback.length * 20 + 20 + (EDITOR * 20))

	if (activeTab) {
		tick++
	}
}
