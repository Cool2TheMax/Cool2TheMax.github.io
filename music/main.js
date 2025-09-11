function start() {
	document.getElementById('begin').style.display = 'none'
	document.getElementById('controls').style.display = 'block'
	changeSong(0)
	loop()
	
}
let audio = null
let songIdx = 0
let List = ['Feels Like We Only Go Backwards', 'Lateralus', 'Scar Tissue', 'Creep', 'The Grudge', 'Everlong']
function changeSong(newIndex) {
	if (audio !== null) {
		if (audio.paused) {
			onPlayPress()
		}
		if (!audio.ended) {
			audio.pause()
		}
	}
	songIdx = newIndex
	if (songIdx >= List.length) {
		songIdx = 0
	} else if (songIdx < 0) {
		songIdx += List.length
	}
	audio = new Audio(List[songIdx] + '.mp3')
	audio.play()
}
function loop() {
	if (audio.ended) {
		changeSong(songIdx + 1)
	}
	requestAnimationFrame(loop)
}


let playButton = document.getElementById('play')
let pauseButton = document.getElementById('pause')
function onPlayPress() {
	playButton.style.display = 'none'
	document.getElementById('pause').style.display = 'inline-block'
	audio.play()
}

function onPausePress() {
	document.getElementById('play').style.display = 'inline-block'
	pauseButton.style.display = 'none'
	audio.pause()
}