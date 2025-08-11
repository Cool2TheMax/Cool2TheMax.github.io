let dialogue = false;
let text;
let alreadyPrinted = "";
let letter = 1;
let speaker;
let textSkipNext = false;
let textMultipleNum = 0
let textMultiple = false;
let tpSleepTime = 0
let textSource = ''


function dialogueStuff() {
	if (dialogue && (safeShowMenu || (!TYPING && !Inventory))) {
		printRect('rgb(43, 43, 43)');
		typeText();
	}
}

function printRect(fill) {
	ctx.fillStyle = fill
	ctx.fillRect(80, 220, canvas.width - 160, 100)
	ctx.fillStyle = 'black'
	ctx.strokeRect(80, 220, canvas.width - 160, 100)
}


var wrapWidth = 320

function typeText() {
	let x = 190
	let y = 240
	ctx.fillStyle = 'rgb(250, 255, 186)'
	if (speaker == 's' || speaker == 'c') {
		printTileImgFromMap('tile', 7 + ((speaker == 'c') * 1), 80, 220 + ((speaker == 's') * 10), 96, 96)
	} else {
		ctx.drawImage(NPCImages[speaker], 80, 220, 96, 96)
	}
	wrapTextF(alreadyPrinted, x, y, 32, 15)
	if (TYPING) {return;}
	if (isKeyPressed('x')) {
		letter = text.length + 1
		alreadyPrinted = text
	}
	if (isKeyPressed('z') && letter == text.length + 1 && !zHeldDown) {
		if (textMultiple) {
			if (textSource[textMultipleNum] !== undefined) {
				textMultipleNum++
				alreadyPrinted = ''
				letter = 1
				text = textSource[textMultipleNum]
				if (text == undefined) {
					text = ''
					dialogue = false
					NPCttp = -1
					return;
				}
			} else {
				NPCttp = -1
				text = ''
				textMultiple = false
				textMultipleNum = 0
				dialogue = false
				return;
			}
		} else {
			letter = 1
			text = ''
			NPCttp = -1
			dialogue = false
			return;
		}
	}
	if (tick % 4 == 3) {
		if (letter < text.length + 1) {
			alreadyPrinted = alreadyPrinted + text.charAt(letter - 1)
			letter++
			
		}
	}
	ctx.font = 'bold 18px monospace'
}


function newDialogue(textLocationI, newSpeaker) {
	dialogue = true;
	textSource = textLocationI
	selectedArrayIndex = textLocationI
	textMultipleNum = 0
	speaker = newSpeaker;
	alreadyPrinted = "";
	letter = 1;
	if (DIALOGUES[DialogueLocations.indexOf(textLocationI)] === undefined) {
		text = textLocationI
	} else {
		text = DIALOGUES[DialogueLocations.indexOf(textLocationI)]
		textSource = DIALOGUES[DialogueLocations.indexOf(textLocationI)]
	}
	if (textLocationI == undefined || textLocationI == '' || text == '') {return;}
	if (text[0].length > 1) {
		if (text !== textLocationI) {
			text = DIALOGUES[DialogueLocations.indexOf(textLocationI)][0]
		} else {
			text = textLocationI[0]
			textSource = textLocationI
		}
		textMultiple = true	
	} else {
		textMultiple = false
	}
}



function wrapTextF(ttp, newx, newy, maxWidth, lineHeight) {
	let letteridx = 0
	let yIdx = newy
	
	//get next word of paragraph
		
	let wordList = []
	let word = ''
	let curLineLength = 0
	let prevLetter = ''
	while (ttp.charAt(letteridx) !== '') {
		word = ''
		while (!(ttp.charAt(letteridx) == '' || ttp.charAt(letteridx) == ' ' || prevLetter == '~')) {
			prevLetter = ttp.charAt(letteridx)
			if (ttp.charAt(letteridx) !== '~') {
				word += ttp.charAt(letteridx)
			} else {
				curLineLength--
			}
			letteridx++
		}
			if (curLineLength + word.length >= maxWidth) {
			curLineLength = 0
			yIdx += lineHeight
			
		}
		for (let i = 0; i < word.length; i++) {
			ctx.fillText(word.charAt(i), newx + (curLineLength * 10), yIdx)
			curLineLength++
		}
		if (prevLetter == '~') {
			if (ttp.charAt(letteridx) == 'i') {
				ctx.font = 'italic 18px monospace'
			} else if (ttp.charAt(letteridx) == 'b') {
				ctx.font = 'bold 18px monospace'
			}
			prevLetter = ''
		}
		letteridx++
		curLineLength++
	}
	ctx.font = 'bold 18px monospace'
}
