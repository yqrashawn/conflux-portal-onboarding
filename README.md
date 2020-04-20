# ConfluxPortal Onboarding

This library is used to help onboard new ConfluxPortal users.

## Installation

`conflux-portal-onboarding` is made available as either a CommonJS module, and
ES6 module, or an ES5 bundle.

* ES6 module: `import ConfluxPortalOnboarding from 'conflux-portal-onboarding'`
* ES5 module: `const ConfluxPortalOnboarding = require('conflux-portal-onboarding')`
* ES5 bundle: `dist/conflux-portal-onboarding.bundle.js` (this can be included
  directly in a page)

## Usage

Minimal example:
```
const onboarding = new ConfluxPortalOnboarding()
onboarding.startOnboarding()
```

Here is an example of an onboarding button that uses this library:

```
<html>
  <head>
    <meta charset="UTF-8">
  </head>
  <body>
    <h1>Sample Dapp</h1>
    <button id='onboard'>Loading...</button>
    <script type="text/javascript" src="./conflux-portal-onboarding.bundle.js"></script>
    <script type="text/javascript">
      window.addEventListener('DOMContentLoaded', () => {
        const onboarding = new ConfluxPortalOnboarding()
        const onboardButton = document.getElementById('onboard')
        let accounts

        const updateButton = () => {
          if (!ConfluxPortalOnboarding.isConfluxPortalInstalled()) {
            onboardButton.innerText = 'Click here to install ConfluxPortal!'
            onboardButton.onclick = () => {
              onboardButton.innerText = 'Onboarding in progress'
              onboardButton.disabled = true
              onboarding.startOnboarding()
            }
          } else if (accounts && accounts.length > 0) {
            onboardButton.innerText = 'Connected'
            onboardButton.disabled = true
          } else {
            onboardButton.innerText = 'Connect'
            onboardButton.onclick = async () => {
              await window.conflux.enable()
            }
          }
        }

        updateButton()
        if (ConfluxPortalOnboarding.isConfluxPortalInstalled()) {
          window.conflux.on('accountsChanged', (newAccounts) => {
            accounts = newAccounts
            updateButton()
          })
        }
      })
    </script>
  </body>
</html>
```

## API

### Static methods

- `isConfluxPortalInstalled` return `true` if portal is installed
- `openPortalSite` open the `portal.conflux-chain.org` page in a new tab

### Instance methods

- `getDownloadUrl` Return a `Promise` contains the ConfluxPortal download url
  depending on user's browser and network states
- `startOnboarding` Open the page from `getDownloadUrl`
- `injectFakePortal` Inject a fake window.conflux.enable api if portal not
  installed. calling this api will open a new download page depending on user's
  browser and network states

### About the download url

In order to detect users' network states. Any api involving the download url is
async. If the api is a pure function, it will return a promise that resolves to
the desired result once the detection finishes. If the api is a function with
side effects, the side effects will be executed once the detection finishes. The
detection starts when `new ConfluxPortalOnboarding()` is called.

- `getDownloadUrl` is pure function
- `window.conflux.enable` and `startOnboarding` are functions with side effects.
