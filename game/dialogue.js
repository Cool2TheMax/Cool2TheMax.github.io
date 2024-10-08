var dialogue = false;
var text;
var alreadyPrinted = "";
var letter = 1;
var speaker;
var textSkipNext = false;
var textMultipleNum = -1
var textMultiple = false;
var TYPING = false;


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
	selectedInputLocation
	ctx.drawImage(speaker, 80, 200, 96, 96)
	if (EDITOR && !(letter == text.length + 1) && !TYPING) {
		alreadyPrinted = text
		letter = text.length + 1
		TYPING = true
		
		typedInputBox.style.display = 'block'
		typedInputBox.value = text
		document.getElementById("submitButton").style.display = 'block'
		return;
	}	
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


function newDialogue(textLocationI, newSpeaker) {
	dialogue = true;
	if (typeof newText === 'object') {
		textMultipleNum++
		text = newText[textMultipleNum]
		textMultiple = true
	}
	
	selectedInputLocation = textLocationI
	text = DIALOGUES[DialogueLocations.indexOf(textLocationI)]
	speaker = newSpeaker;
	alreadyPrinted = "";
	letter = 1;
	//dialogueStuff()
}


