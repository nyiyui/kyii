'use strict'
const dataElem = document.getElementById('remote-data')
const url = dataElem.dataset.url

function show(className) {
  Array.from(document.getElementsByClassName(className)).forEach((e) => {
    e.style.display = 'block'
  })
}

console.log(`${url}から承認待ち`)
show('yesscript')

let decided = false

const intervalId = setInterval(async () => {
  let res = await fetch(url)
  if (res.status === 200) {
    console.log('承認済')
    show('remote-decided')
    clearInterval(intervalId)
    decided = true
    setTimeout(() => {
      document.getElementById('remote-submit').submit()
    }, 3*1000)
  } else if (res.status === 202) {
    console.log('承認待ち。。。')
  } else {
    console.log(`承認エラー: ${res.statusText}`)
  }
}, 1000)

setTimeout(() => {
  if (decided) return;
  show('remote-timeout')
  console.log('タイムアウト')
  clearInterval(intervalId)
}, 30*1000)
