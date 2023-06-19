import { supported, parseCreationOptionsFromJSON, parseRequestOptionsFromJSON, create, get } from 'https://cdn.skypack.dev/pin/@github/webauthn-json@v2.1.1-A999j74rVdkNx01xHnzq/mode=imports/optimized/@github/webauthn-json/browser-ponyfill.js'

const pkcForm = document.getElementById('js-pkc-form')
const webauthnUnsupported = document.getElementById('js-webauthn-unsupported')
const webauthnNotAllowed = document.getElementById('js-webauthn-not-allowed')
const webauthnIDKError = document.getElementById('js-webauthn-idk')
const pkcField = document.getElementById("js-pkc-field")
const actions = {
  create: createCredentials,
  get: getCredentials,
}

function resetErrors() {
  webauthnUnsupported.style.display = "none"
  webauthnNotAllowed.style.display = "none"
  webauthnIDKError.style.display = "none"
}

function checkSupported() {
  if (supported()) return;
  console.error('WebAuthn unsupported; telling user')
  webauthnUnsupported.style.display = "initial"
}

async function createCredentials() {
  const co = parseCreationOptionsFromJSON({ publicKey: JSON.parse(pkcForm.dataset.createOptions) })
  console.log('creation options:', co)
  try {
    const pkc = await create(co)
    console.log('creation pkc:', pkc)
    pkcField.value = JSON.stringify(pkc)
    pkcForm.submit()
  } catch (err) {
    console.error('create credential: ', err)
    if (err instanceof DOMException && err.name == "NotAllowedError") {
      webauthnNotAllowed.style.display = "initial"
    } else {
      webauthnIDKError.style.display = "initial"
    }
  }
}

async function getCredentials() {
  const ro = parseRequestOptionsFromJSON({ publicKey: JSON.parse(pkcForm.dataset.getOptions) })
  console.log('request/get options:', ro)
  try {
    const pkc = await get(ro)
    console.log('creation pkc:', pkc)
    pkcField.value = JSON.stringify(pkc)
    pkcForm.submit()
  } catch (err) {
    console.error('create credential: ', err)
    if (err instanceof DOMException && err.name == "NotAllowedError") {
      webauthnNotAllowed.style.display = "initial"
    } else {
      webauthnIDKError.style.display = "initial"
    }
  }
}

async function doAction() {
  resetErrors()
  checkSupported()
  await actions[pkcForm.dataset.action]()
}

await doAction()

document.getElementById('js-action-button').addEventListener('click', doAction)
