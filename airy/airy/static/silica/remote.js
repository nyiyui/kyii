'use strict'
const dataElem = document.getElementById('remote-data')
const url = dataElem.dataset['url']

console.log(`${url}から承認待ち`)
const es = new EventSource(url)
es.addEventListener('timeout', (e) => {
	console.log('タイムアウト')
	document.getElementById('remote-timeout').style.display = 'block'
})
es.addEventListener('decided', (e) => {
	console.log('承認')
	document.getElementById('remote-decided').style.display = 'block'
	document.getElementById('remote-submit').submit()
})
