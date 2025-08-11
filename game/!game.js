function start() {
	console.log('gaming');
	arrowGUI.arrowList.push(new ArrowSelector(6 + MenuOffset, 32, 1, 4, 45, 17, ['Inventory', 'Save', 'EDITOR', 'Exit'], 1))
	arrowGUI.arrowList.push(new ArrowSelector(32, 285, 1, 3, 0, 17, ['Use', 'Toss', 'Exit'], 0))
	arrowGUI.arrowList.push(new ArrowSelector(125, 105, 9, 4, 39, 21, [], 2))
	loadIntoTextInput(alphabetString + '.?')
	ctx.font = "bold 18px monospace"
	loadScene();
	newMap();
	gameLoop();
}


function gameLoop() {
	ctx.save()
	ctx.scale(scale, scale)
	playerTick()
	if (!Inventory && !(TYPING && safeShowMenu)) {
		drawBackground()
		drawTiles(1)
		drawTiles(2)
		particleStuff('spark')
		drawPlayer()
		particleStuff('smoke')
		NPCstuff()
	}
	ctx.restore()
	menuStuff();
	inventoryStuff();
	editorStuff()
	typingStuff()
	dialogueStuff()
	fadeStuff()
	fpsStuff();
	if (STOP) {return true;} 
	requestAnimationFrame(gameLoop);
}





//PLAYER STUFF
//==============================================================
//==============================================================

function playerTick() {
	arrowStuff()
	playerActionTileCalc()
	place.full = place.name + '.' + place.x + '.' + place.y
	keysHeldDownCheck()
	if (!dialogue && !TYPING) {
		player.currentTile = player.x + (player.y * 32)
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

function arrowStuff() {
	if (tick % 4 == 0) {
		arrowGUI.update([isKeyPressed('ArrowUp'), isKeyPressed('ArrowRight'), isKeyPressed('ArrowDown'), isKeyPressed('ArrowLeft')])
	}
}

function playerActionTileCalc() {
	if (player.dir % 2 == 1) {
		if (player.dir == 1) { 
			player.actionTile = player.currentTile + 1
		} else {
			player.actionTile = player.currentTile - 1
		}
	} else {
		player.actionTile = player.currentTile - (GMAX * (player.dir - 1))
	}
}

var zLastTurn = false
var zHeldDown = false
var xLastTurn = false
var xHeldDown = false

function keysHeldDownCheck() {
	if (isKeyPressed('z')) {
		zHeldDown = zLastTurn
		zLastTurn = true	
	} else {
		zHeldDown = false
		zLastTurn = false
	}
	if (isKeyPressed('x')) {
		xHeldDown = xLastTurn
		xLastTurn = true	
	} else {
		xHeldDown = false
		xLastTurn = false
	}
}

let itemGained
let itemAmount
const itemLoc = []
const itemLocItem = []
const loottable = ['gold coin', 'healing potion']
const ltgainranges = [[1 , 3], [1, 1]]

function checkForChests() {
	if (!MENU && !TYPING) {
		if (isKeyPressed('z') && GRID[player.actionTile] == 8 && !zHeldDown) {
			if (EDITOR && !TYPING) {
				selectedArray = null
				selectedArrayIndex = player.actionTile + place.full
				TYPING = true
				if (itemLoc.indexOf(player.actionTile + place.full) !== -1) {
					newDialogue('', 'c')
					currentString = itemLocItem[itemLoc.indexOf(player.actionTile + place.full)]
					selectedArrayIndex = itemLoc.indexOf(player.actionTile + place.full)
				} else {
					itemLoc.push(player.actionTile + place.full)
					itemLocItem.push(undefined)
					newDialogue('', 'c')
					selectedArrayIndex = itemLoc.length - 1
					currentString = text
				}
				prompt = 'Insert Item: '
				alreadyPrinted = prompt + text
				letter = (prompt + text).length + 1
				startFade()
				return;
			}
			if (itemLoc.indexOf(player.actionTile + place.full) !== -1) {
				itemGained = itemLocItem[itemLoc.indexOf(player.actionTile + place.full)]
				itemAmount = 1
			} else {
				let itemIdx = randInt(0, loottable.length - 1)
				itemGained = loottable[itemIdx]
				itemAmount = randInt(ltgainranges[itemIdx][0], ltgainranges[itemIdx][1])
			}
			chestOpenDialogue()
			GRID[player.actionTile] = 9
			player.actionReload = 10			
		}
	}
}

const vowelsList = ['a', 'e', 'i', 'o', 'u']
function chestOpenDialogue() {
	newDialogue('You got... ', 'c')
	if (itemAmount == 1) {
		if (vowelsList.indexOf(itemGained[0]) !== -1) {
			text = text + 'An '
		} else {
			text = text + 'A '
		}
		text = text + itemGained + '! The ' + itemGained + ' was'
	} else {
		text = text + itemAmount + ' ' + itemGained + 's! The ' + itemGained + 's were'
	}
	text = text + ' put in your bag.'
	if (inven.indexOf(itemGained) == -1) {
		inven.push(itemGained)
		invenNums.push(itemAmount)
	} else {
		invenNums[inven.indexOf(itemGained)] += itemAmount
	}
}

function checkForSigns() {
	if (!MENU && isKeyPressed('z') && !zHeldDown) {	
		if (GRID[player.actionTile] == 7) {
			newDialogue(player.actionTile + place.full, 's')
			player.actionReload = 10
			if (EDITOR && !TYPING) {
				selectedArray = 'd'
				prompt = 'Insert Text: '
				alreadyPrinted = prompt + text
				currentString = text
				letter = (prompt + text).length + 1
				TYPING = true
				startFade();
			} else if (text == '') {
				text = 'There Is Nothing Written Here. A blank slate ready for something new.'
			}
		}
	}

}

let cyMax = 332
let cxMax = 192
let scale = 2
function cameraStuff() {
	cameraX = (player.x - 20 / scale) * 16 + (Math.ceil(player.walkTime * joyX / 2)) + (EDITOR * 50) + (MENU * 50);
	cameraX = Math.max(0, Math.min(cameraX, cxMax))
	cameraY = (player.y - 12 / scale) * 16 + (Math.ceil(player.walkTime * joyY / 2));
	cameraY = Math.max(0, Math.min(cameraY, cyMax))
}

function playerControls() {
	joyX = (isKeyPressed('d') || isKeyPressed('ArrowRight'));
	joyX -= (isKeyPressed('a') || isKeyPressed('ArrowLeft'));
	joyY = (isKeyPressed('s') || isKeyPressed('ArrowDown'));
	joyY -= (isKeyPressed('w') || isKeyPressed('ArrowUp'));
	joyDist = Math.sqrt((joyX * joyX) + (joyY * joyY));
	if (joyX !== 0 && joyY !== 0) {joyX = 0}
	if (joyX > 0) {player.dir = 1} else if (joyX < 0) {player.dir = 3}
	if (joyY > 0) {player.dir = 0} else if (joyY < 0) {player.dir = 2}
	if (isKeyPressed('x')) {player.isSprinting = true} else {player.isSprinting = false}
}


function tryMove(dx, dy) {
	let solidity
	if (joyDist !== 0){
		if (joyY == 0) {
			solidity = pathIsSolid(player.currentTile + joyX)
		} else {solidity = pathIsSolid(player.currentTile + (joyY*GMAX))}
		if (!solidity) {
			player.walkTime += (player.isSprinting * 1) + 1 
			if (player.walkTime >= player.walkDelay) {
				player.x += dx;
				player.y += dy;
				player.walkTime = 0
			}
		}
	}
}


function pathIsSolid(g) {
	return (solids[GRID[g]] || NPCat(g)) && !((player.dir == 3 && player.x == 0) || (player.dir == 1 && player.x == GMAX - 1) || (player.dir == 2 && player.y == 0) || (player.dir == 0 && player.y == GMAX - 1))
}

function NPCat(g) {
	for (let i = 0; i < NPClist.length; i++) {
		if (NPClist[i].grid == g || NPClist[i].targetTile == g) {
			return true;
		}
	}

	return false;
}

let playerPrintX
let playerPrintY

function drawPlayer() {
	playerPrintX = player.x * 16 - cameraX + Math.ceil(player.walkTime * joyX / 2)
	playerPrintY = player.y * 16 - cameraY + Math.ceil(player.walkTime * joyY / 2) - 12
	if (joyDist == 0 || (player.walkTime > 8 && player.walkTime < 16) || (player.walkTime > 24) || player.walkTime == 0) {
		ctx.drawImage(NPCImages[0], 0 + (32 * (player.dir % 2 == 1)) + (16 * (tick % 30 > 15 && joyDist == 0)), 0 + (24 * (player.dir >= 2)), 16, 24, playerPrintX, playerPrintY, 16, 24)
	} else {
		ctx.drawImage(NPCImages[1], 0 + (32 * (player.dir % 2 == 1)) + (16 * (player.walkTime > 16)), 0 + (24 * (player.dir >= 2)), 16, 24, playerPrintX, playerPrintY, 16, 24)
	}
}

function playerCheckOutOfBounds() {
	if (player.x < 0) {changeScene('edge', -1, 0)}
	if (player.y < 0) {changeScene('edge', 0, -1)}
	if (player.x > GMAX - 1) {changeScene('edge', 1, 0)}
	if (player.y > GMAX - 1) {changeScene('edge', 0, 1)}
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
			if (dx === 1) {player.x = 0}
			if (dx === -1) {player.x = GMAX - 1}
		}
		if (dy) {
			if (dy === 1) {player.y = 0}
			if (dy === -1) {player.y = GMAX - 1}
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
	NPClist = []
	for (let i = 0; i < NPCall.length; i++) {
		if (NPCall[i].scene == place.full) {
			let NPC = {sprite : NPCall[i].sprite, targetTile : 0, 
				walkTime : 0, walk: NPCall[i].walk, sourceTile : NPCall[i].sourceTile, 
				grid : NPCall[i].sourceTile, dir : 0, spin : NPCall[i].spin, 
				Mdir : NPCall[i].Mdir, time : randInt(0, 240), speech : NPCall[i].speech}
			NPClist.push(NPC)
		}
	}
}

//MAP STUFF
//==============================================================
//==============================================================

function drawBackground() {
	let tmpx = UIImages[0].width / 2
	let tmpy = UIImages[0].height / 2
	ctx.drawImage(UIImages[0], -((cameraX % 16)+32), -((cameraY % 16)+32), tmpx, tmpy);
	ctx.drawImage(UIImages[0], -((cameraX % 16)+32) + tmpx, -((cameraY % 16)+32), tmpx, tmpy);
	ctx.drawImage(UIImages[0], -((cameraX % 16)+32), -((cameraY % 16)+32) + tmpy, tmpx, tmpy);
	ctx.drawImage(UIImages[0], -((cameraX % 16)+32) + tmpx, -((cameraY % 16)+32) + tmpy, tmpx, tmpy);
}

let NPClist = [
]

let NPCall = [
	{sprite : 1, walk : true, sourceTile : 70, spin : true, Mdir : 0, scene : 'over.0.0', speech : ['Hi, I am Bob.', 'How are you today?']}
]

function newNPC(g) {
	NPClist.push({sprite : 2, targetTile : 0, walkTime : 0, grid : g, dir : 0, spin : true, Mdir : 0, time : randInt(0, 240), speech : ['Hi, I am Bob.', 'How are you today?'], sourceTile : g, walk : true})
	NPCall.push({sprite : 2, spin : true, Mdir : 0, scene : place.full, speech : ['Hi, I am Bob.', 'How are you today?'], sourceTile : g, walk : true}) 
} 

let NPCttp = -1

function NPCstuff() {
	if (NPClist.length == 0) {return;}
	if (!dialogue && !EDITOR && !MENU && !TYPING && player.actionReload == 0 && isKeyPressed('z') && NPCat(player.actionTile) && !zHeldDown) {
		for (let i = 0; i < NPClist.length; i++) {
			if (NPClist[i].grid == player.actionTile && NPClist[i].walkTime == 0) {
				newDialogue(NPClist[i].speech, (NPClist[i].sprite * 3) + 2)
				NPCttp = i
				if (player.dir == 0) {
					NPClist[i].dir = 2
				} else if (player.dir == 1) {
					NPClist[i].dir = 3
				} else {
					NPClist[i].dir = player.dir - 2
				}
				i = NPClist.length
				player.actionReload = 10
			}
		}
	}
	let gidx = Math.floor(cameraX / 16)
	gidx += GMAX * Math.floor(cameraY / 16)
	let y = -(cameraY % 16)
	let x = -(cameraX % 16)
	for (let i = 0; i < 12; i++) {
		x = - (cameraX % 16)
		for (let j = 0; j < 22; j++) {
			for (let k = 0; k < NPClist.length; k++) {
				if (NPClist[k].grid == gidx) {
					tmpx = 0
					tmpy = 0
					if (NPClist[k].walkTime !== 0) {
						if (NPClist[k].dir == 0) {
							tmpy = Math.ceil(NPClist[k].walkTime / 2)
						} else if (NPClist[k].dir == 1) {
							tmpx = Math.ceil(NPClist[k].walkTime / 2)
						} else if (NPClist[k].dir == 2) {
							tmpy = - Math.ceil(NPClist[k].walkTime / 2)
						} else {tmpx = - Math.ceil(NPClist[k].walkTime / 2)}
					}
					let skin = NPClist[k].sprite
					if (NPClist[k].walkTime == 0 || (NPClist[k].walkTime > 8 && NPClist[k].walkTime < 16) || (NPClist[k].walkTime > 24)) {
						ctx.drawImage(NPCImages[skin * 3], 0 + (16 * (tick % 20 > 10)) + (32 * (NPClist[k].dir % 2 == 1)), 0 + (24 * (NPClist[k].dir > 1)), 16, 24, x + tmpx, y + tmpy - 12, 16, 24)
					} else {
						ctx.drawImage(NPCImages[(skin * 3) + 1], 0 + (32 * (NPClist[k].dir % 2 == 1)) + (16 * (NPClist[k].walkTime > 16)), 0 + (24 * (NPClist[k].dir >= 2)), 16, 24, x + tmpx, y + tmpy - 12, 16, 24)
					}
					if (NPClist[k].time % 60 == 0 && k !== NPCttp && NPClist[k].walkTime == 0) {
						if (NPClist[k].time == 240 && NPClist[k].walk) {
							NPClist[k].time = 0
							NPCmovement(k)
						} else if (NPClist[k].spin) {
							NPClist[k].dir = NPClist[k].Mdir + randInt(-1, 1)
							if (NPClist[k].dir == -1) {
								NPClist[k].dir = 3
							} else if (NPClist[k].dir == 4) {
								NPClist[k].dir = 0
							}
						}
					}
					if (NPClist[k].walkTime !== 0) {
						NPClist[k].walkTime++
						if (NPClist[k].walkTime > 32) {
							NPClist[k].grid = NPClist[k].targetTile
							NPClist[k].walkTime = 0
						}
					}
					if (k !== NPCttp) {
						NPClist[k].time++
					}
				}
			}

			x += 16
			gidx++
		}
		gidx += GMAX-22
		y += 16
		
	}
}

function NPCmovement(k) {
	let okMoves = [-GMAX, -1, 1, GMAX]
	let validTiles = [-GMAX -1, -GMAX, -GMAX + 1, -1, 0, 1, GMAX-1, GMAX, GMAX+1]
	okMoves = okMoves.map((x) => x + NPClist[k].grid)
	validTiles = validTiles.map((x) => x + NPClist[k].sourceTile)
	for (let i = 0; i < 9; i++) {
		if (pathIsSolid(validTiles[i]) || validTiles[i] == player.currentTile || (player.actionTile == validTiles[i] && player.walkTime !== 0)) {
			validTiles.splice(i, 1)
			i--
		}
	}
	for (let i = 0; i < 4; i++) {
		if (validTiles.indexOf(okMoves[i]) == -1) {
			okMoves.splice(i, 1)
			i--
		}
		if (okMoves[i + 1] == undefined) {
			i = 4
		}
	}
	NPClist[k].targetTile = okMoves[randInt(0, okMoves.length - 1)]
	if (NPClist[k].targetTile == undefined) {
		NPClist[k].targetTile = NPClist[k].grid
	} else {
		let tmp = NPClist[k].targetTile - NPClist[k].grid
		if (tmp == GMAX) {
			tmp = 0
		} else if (tmp == -GMAX) {
			tmp = 2
		} else if (tmp == -1) {
			tmp = 3
		} else {tmp = 1}
		NPClist[k].dir = tmp
		NPClist[k].walkTime++
	}

}

function drawTiles(lay) {
	let gidx = Math.floor(cameraX / 16) + ((lay-1)*GMAX*GMAX)
	gidx += GMAX * Math.floor(cameraY / 16)
	let y = -(cameraY % 16)
	let x = -(cameraX % 16)
	for (let i = 0; i < 12; i++) {
		x = - (cameraX % 16)
		for (let j = 0; j < 22; j++) {
			if (GRID[gidx] !== 0 && GRID[gidx] !== undefined) {
				printTileImgFromMap('tile', GRID[gidx] + ((GRID[gidx] == 3) * Math.ceil(tick/8) % 4), x, y, 16, 16)
				if (activeTab) {
					createParticlesFromTiles(gidx, x, y)
				}
			}
			x += 16
			gidx++
		}
		gidx += GMAX-22
		y += 16
		
	}
}

function createParticlesFromTiles(gidx, x, y) {
	if (GRID[gidx] == 3) {
		if (tick % 60 === 1) {
			particlesArray.push(new Particle('smoke', x + cameraX + 5, y + cameraY, 0))
		}
		if (Math.random() > 0.997) {
			particlesArray.push(new Particle('spark', x + cameraX + 5, y + cameraY + 5, 0))
		}
	}
}

function newMap() {
	GRID = []
	for (let i = 0; i < (GMAX); i++) {
		GRID.push(2)
	}
	for (let i = 0; i < (GMAX-2); i++) {
		GRID.push(2)
		for (let j = 0; j < (GMAX-2); j++) {
			if (Math.random() > 0.7) {
				GRID.push(1);
			} else { 
				GRID.push(0);
			}
		}
		GRID.push(2)
	}
	for (let i = 0; i < GMAX; i++) {
		GRID.push(2)
	}
}

function createEllipse(centerX, centerY, radius, type) {
	let yMid
	let x = 0
	let y = -radius
	while (x < -y) {
		yMid = y + 0.5

		if (x*x + (yMid * yMid) > radius * radius) {
			y++
		}
		GRID[(centerY + y) * GMAX + centerX + x] = type
		GRID[(centerY + y) * GMAX + centerX - x] = type
		GRID[(centerY - y) * GMAX + centerX + x] = type
		GRID[(centerY - y) * GMAX + centerX - x] = type
		GRID[(centerY + x) * GMAX + centerX + y] = type
		GRID[(centerY - x) * GMAX + centerX + y] = type
		GRID[(centerY + x) * GMAX + centerX - y] = type
		GRID[(centerY - x) * GMAX + centerX - y] = type
		x++
	}
}

//EDITOR
//====================================================
//====================================================
var EDITOR = false;
var brushnum = 2;
var LAYER = 1;
var pallx = 0;
var pally = 0;
var pallIdx = 2;
var brushpidx;


function editorStuff() {
	if (EDITOR) {
		drawEditor()
		drawPallete()
		if (isKeyPressed('x') && !xHeldDown && !TYPING) {
			EDITOR = false;
			MENU = true;
			arrowGUI.activeIndex = 0
			saveScene();
		}
	}
}


function drawEditor() {
	if (mouseX < 500) {
		let gx = Math.floor((mouseX + (cameraX*scale)) / (scale * 16))
		let gy = Math.floor((mouseY + (cameraY*scale)) / (scale * 16))
		let gidx = gx+(gy*GMAX)
		printTileImgFromMap('tile', brushnum, (gx * 16 * scale) - cameraX * scale, (gy * 16 * scale) - cameraY * scale, 16 * scale, 16 * scale)

		ctx.fillStyle = 'rgb(43, 43, 43)'
		ctx.strokeRect((gx * 16 * scale) - cameraX * scale, (gy * 16 * scale) - cameraY * scale, 16 * scale, 16 * scale)
		let tmp = gidx + ((LAYER-1)*(GMAX*GMAX))
		if (mouseDown && checkMouseBounds(true) && !TYPING) {
			if (GRID[tmp] == 7) {
				tmp2 = DialogueLocations.indexOf(tmp + place.full)
				DIALOGUES.splice(tmp2, 1)
				DialogueLocations.splice(tmp2, 1)
			} else if (GRID[tmp] == 8 && itemLoc.indexOf(tmp + place.full) !== -1) {
				tmp2 = itemLoc.indexOf(tmp + place.full)
				itemLoc.splice(tmp2, 1)
				itemLocItem.splice(tmp2, 1)
			}
			if (brushnum == 7) {
				DialogueLocations.push(tmp + place.full)
				DIALOGUES.push('')
			}
			GRID[tmp] = brushnum
		}
		if (isKeyPressed('e') && checkMouseBounds() && !TYPING) {brushnum = GRID[tmp]}
		
	}
}





function drawPallete(){
	ctx.fillStyle = 'rgb(43, 43, 43)'
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
	let x = canvas.width - 98
	let y = 5
	
	let tileIndex = 0	

	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 3; j++) {
			ctx.drawImage(UIImages[1], x, y)
			printTileImgFromMap('tile', tileIndex, x, y, 32, 32)
			if (tileIndex === brushnum) {
				gx = x
				gy = y
			}
			if (tileIndex == 3) {tileIndex += 3}
			x += 32
			tileIndex++
		}
	x = canvas.width - 98
	y += 32
	}

	if (mouseX > canvas.width - 98 && mouseDown === true && checkMouseBounds(true)) {
		brushnum = Math.ceil((mouseX-(canvas.width - 98))/32)+(((Math.ceil((mouseY-11)/32))-1)*3) - 1
		if (brushnum > 3) {brushnum += 3}
	}
	ctx.strokeRect(gx, gy, 32, 32)
	
}




//EFFECTS
//===========================================================
//===========================================================

function capitalizeProperly(g) {
	return g[0].toUpperCase() + g.slice(1, g.length);
}


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
			ctx.fillRect((this.x - cameraX), (this.y - cameraY), 5, 5)		
		} else if (this.type === 'spark') {
			ctx.fillStyle = "yellow"
			ctx.fillRect(Math.ceil(this.x - cameraX), Math.ceil(this.y - cameraY), 1, 1)
		}	
	}

	update() {
		if (this.type === 'smoke') {
			this.y -= this.speedY
		} else if (this.type === 'spark') {
			if (this.frame < 15) {
				this.y -= this.speedY / 2
				this.x += this.speedX / 2
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
		if (particlesArray[i].type === type) {
			particlesArray[i].draw()
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
		ctx.fillRect(0, 0, 640, 360)
		if (fadeTime >= fadeDuration) {
			fade = false
			fadeTime = 0
		}
		if (1 == (Math.max(0, Math.min(1, -Math.pow((fadeTime - fadeDuration / 2) / (fadeDuration / 2), 2) + 1)))) {
			if (safeShowMenu) {safeShowMenu = false; Inventory = false; TYPING = false; dialogue = false;} else (safeShowMenu = true)
		}
	}
}

function startFade() {
	fade = true
	fadeTime = 0
}



//MENU
//===========================================================
//===========================================================

var skinMenu = false
const MenuFunctions = [
		function() {
			arrowGUI.activeIndex = 0
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
			arrowGUI.activeIndex = -1
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
			arrowGUI.activeIndex = 0
		}
	}
	if (MENU) {
		if (tick % 4 == 0){
			menuJoyY = (isKeyPressed('s') || isKeyPressed('ArrowDown'))
			menuJoyY -= (isKeyPressed('w') || isKeyPressed('ArrowUp'))
			menuJoyX = (isKeyPressed('d') || isKeyPressed('ArrowRight'))
			menuJoyX -= (isKeyPressed('a') || isKeyPressed('ArrowLeft'))
		}
		if (isKeyPressed('x') && !xHeldDown && !Inventory) {MenuFunctions[MenuFunctions.length-1]()}
		if (isKeyPressed('z') && !zHeldDown && !Inventory) {MenuFunctions[arrowGUI.arrowList[0].arrowLocation]()}
		drawMenu()
	}
}

var MenuOffset = canvas.width - 120 - 20

function drawMenu() {
	ctx.fillStyle = 'rgb(43, 43, 43)'
	ctx.fillRect(MenuOffset, 10, 120, 200)
	ctx.fillStyle = 'rgb(250, 255, 186)'				
	arrowGUI.arrowList[0].draw()
}

var inven = ['gold coin', 'sword', 'healing potion']
var invenNums = [23, 1, 2]
var Inventory = false

var invLevel = 0
var invScroll = 0
var invSub = false
var invSubFuncs = [
	function(i) {
		if (itemFuncs[itemsList.indexOf(inven[i])] !== null) {
			itemFuncs[itemsList.indexOf(inven[i])](i)
		} else {
			newDialogue('You shouldn\'t use that right now...', 2)
		}

	},
	function(i) {itemRemoval(i, invenNums[i])},
	function() {}
]

const itemFuncs = [
	null, null,
	function(i) {
			newDialogue('You Drank the Health Potion!', 2)
			itemRemoval(i, 1)
	}
]
const itemsList = ['gold coin', 'sword', 'healing potion']
const itemDesc = ['A shiny gold coin', 'A bit too expensive for all of it\'s rust', 'Smells sweet, but tastes horrible']

function itemRemoval(i, number) {
	invenNums[i] -= number
	if (invenNums[i] < 1) {
		inven.splice(i, 1)
		invenNums.splice(i, 1)
		invLevel--
		if (invLevel < 0) {invLevel = 0}
	}
}


function inventoryStuff() {
	if (Inventory && safeShowMenu) {
		ctx.drawImage(UIImages[2], 0, 0, 640, 360)
		ctx.fillStyle = 'rgb(250, 255, 186)'
		if (inven.length !== 0) {
			invScrollLogic()
			drawTriangle(null, 241 + Math.sin(tick / 30) * 10, ((invLevel - invScroll) * 24) + 54)
		}
		for (i = 0; i < 11; i++) {
			if (inven[i + invScroll] !== undefined) {
				ctx.fillText(capitalizeProperly(inven[i + invScroll]), ((i == invLevel - invScroll) * (24 + Math.sin((tick - 20) / 30) * 15)) + 242, i * 24 + 68)
				ctx.fillText( 'x' + invenNums[i + invScroll],  600 - ((invenNums[i + invScroll].toString().length + 1) * 10), i * 24 + 68)
			} else if (inven.length == 0) {
				if (i == 0) {
					ctx.fillText('You have no items', 242, 68)
				} else if (i == 1) {
					ctx.fillText('Press [X] to exit inventory', 242, 92)
				}
			}
		}
		if (inven.length !== 0) {
			printTileImgFromMap('item', itemsList.indexOf(inven[invLevel]), 35, 25, 144, 144)
			ctx.strokeRect(30, 20, 154, 154)
			wrapTextF(itemDesc[itemsList.indexOf(inven[invLevel])], 32, 200, 15, 17)
			ctx.strokeRect(30, 180, 154, 80)
		}
		if (invSub && inven.length !== 0) {
			arrowGUI.arrowList[1].draw()
			ctx.strokeRect(30, 265, 154, 70)
			if (isKeyPressed('z') && !zHeldDown && !dialogue) {
				invSubFuncs[arrowGUI.arrowList[1].arrowLocation](invLevel)
				invSub = false
				arrowGUI.activeIndex = -1
				return;
			}
		}
		if (!zHeldDown && isKeyPressed('z') && !dialogue) {invSub = true; arrowGUI.activeIndex = 1}
		if (isKeyPressed('x') && !xHeldDown && fadeTime == 0 && !dialogue) {
			if (!invSub) {
				arrowGUI.activeIndex = 0
				startFade();
			} else {
				invSub = false
			}
		}
	}

}
function drawTriangle(dir, x, y) {
	ctx.beginPath()
	ctx.moveTo(19 + x, 8 + y)
	ctx.lineTo(x, 16 + y)
	ctx.lineTo(x, y)
	ctx.lineTo(19 + x, 8 + y)
	ctx.closePath()
	ctx.fill()
}

function invScrollLogic() {
	if (tick % 5 == 0 && !invSub) {
		invLevel += menuJoyY * !((invLevel == 0 && menuJoyY == -1) || (invLevel == inven.length - 1 && menuJoyY == 1))
			if (menuJoyY == -1 && invLevel >= 0) {
			if (invLevel < invScroll) {
				invScroll--
			}
		}
		if (menuJoyY == 1 && invLevel < inven.length) {
			if (invLevel >= invScroll + 11) {
				invScroll++
			}
		}	
	}
}

//TYPING
//===========================================================
//===========================================================
let newFontSize = 27
let TYPING = false
var currentString = ''
var selectedArrayIndex
var selectedArray
var prompt = ''
function typingStuff() {
	if (TYPING && safeShowMenu) {
		ctx.fillStyle = 'rgb(250, 255, 186)'
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		if (inputTextMode == 1) {
			ctx.fillStyle = 'rgb(189, 85, 77)'
		} else if (inputTextMode == 0) {
			ctx.fillStyle = 'rgb(42, 86, 156)'
		} else {
			ctx.fillStyle = 'rgb(48, 140, 63)'
		}
		ctx.fillRect(111, 74, 415, 116)
		let displayString = prompt + currentString
		if (tick % 40 > 20) {displayString = displayString + '_'}
		alreadyPrinted = displayString
		ctx.fillStyle = 'black'
		ctx.font = "bold " + newFontSize + "px monospace"
		arrowGUI.activeIndex = '2'
		arrowGUI.arrowList[2].draw()
		ctx.font = "bold 18px monospace"
		if (isKeyPressed('z') && !zHeldDown) {
			let selectedChar = arrowGUI.arrowList[2].names[arrowGUI.arrowList[2].arrowLocation]
			if (selectedChar == '') {
				selectedChar = ' '
			} else if (selectedChar == 'Erase') {
				currentString = currentString.slice(0, currentString.length - 1)
			} else if (selectedChar == 'Enter') {
				startFade();
				alreadyPrinted = currentString
				letter = currentString.length
				feedback.push({text: 'Text Recorded In Object', howLongAgo : 0})
				if (selectedArray == 'd') {
					DIALOGUES[DialogueLocations.indexOf(selectedArrayIndex)] = currentString
				} else {
					itemLocItem[selectedArrayIndex] = currentString
				}
			} else if (selectedChar == 'Lower') {
				inputTextMode = 1
				loadIntoTextInput(alphabetString.toLowerCase() + '.?')
			} else if (selectedChar == 'Upper') {
				inputTextMode = 0
				loadIntoTextInput(alphabetString + '.?')
			} else if (selectedChar == 'Other') {
				inputTextMode = 2
				loadIntoTextInput('12345+=67890-*#$%^&():!<> /~')
			}
			if (selectedChar.length > 1) {selectedChar = ''}
			currentString = currentString + selectedChar
		}
	}
}

let inputTextMode = 0
let alphabetString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
function loadIntoTextInput(newInputMap) {
	let newInput = stringToArr(newInputMap)
	newInput.splice(7, 0, ' ')
	newInput.splice(8, 0, 'Erase')
	newInput.splice(16, 0, ' ')
	if (inputTextMode == 1) {
		newInput.splice(17, 0, 'Upper')
		newInput.splice(25, 0, ' ')
		newInput.splice(26, 0, 'Other')
	} else if (inputTextMode == 0) {
		newInput.splice(17, 0, 'Lower')
		newInput.splice(25, 0, ' ')
		newInput.splice(26, 0, 'Other')
	} else {
		newInput.splice(17, 0, 'Upper')
		newInput.splice(25, 0, ' ')
		newInput.splice(26, 0, 'Lower')
	}
	newInput.push(' ')
	newInput.push('Enter')
	arrowGUI.arrowList[2].names = newInput
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
