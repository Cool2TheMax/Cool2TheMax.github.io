var dialogue = false;
var text;
var alreadyPrinted = "";
var letter = 1;
var speaker;
var textSkipNext = false;
var textMultipleNum = -1
var textMultiple = false;


function dialogueStuff() {
	printRect('rgb(43, 43, 43)')
	typeText();
}

function printRect(fill) {
	ctx.fillStyle = fill
	ctx.fillRect(80, 190, canvas.width - 160, 100)
}

function typeText() {
	let x = 190
	let y = 210
	ctx.fillStyle = 'rgb(250, 255, 186)';
	ctx.drawImage(speaker, 80, 200, 96, 96)
	
	for (let i = 0; i < alreadyPrinted.length; i++) {
		if ((!(alreadyPrinted.charAt(i) == '#' || alreadyPrinted.charAt(i) == '/')|| textSkipNext)) {
				textSkipNext = false
				ctx.fillText(alreadyPrinted.charAt(i), x, y)
				x += 10
		} else if (alreadyPrinted.charAt(i) == '#') {
			x = 190
			y += 15
		} else if (alreadyPrinted.charAt(i) == '/') {textSkipNext = true}
		if (x > 505) {
			x = 190
			y += 15
		}
	}

	if (tick % 4 == 3) {
		alreadyPrinted = alreadyPrinted + text.charAt(letter-1)
		if (letter < text.length + 1) {
			letter++
		}
	}
	if (isKeyPressed('x')) {
		letter = text.length + 1
		alreadyPrinted = text
	}
	if (isKeyPressed('z') && letter == text.length + 1) {
		if (textMultiple) {
			textMultipleNum++
		}
		dialogue = false

	}
}

function newDialogue(newText, newSpeaker) {
	dialogue = true;
	if (typeof newText === 'object') {
		textMultipleNum++
		text = newText[textMultipleNum]
		textMultiple = true
	}
	text = newText;
	speaker = newSpeaker;
	alreadyPrinted = "";
	letter = 1;
	dialogueStuff()
}


