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

- `getDownloadUrl` return a `Promise` contains the ConfluxPortal download url
  depending on user's browser and network state
- `startOnboarding` open the from `getDownloadUrl`

### Inject fake ConfluxPortal api

Create the onboarding instance with `new ConfluxPortalOnboarding()` will inject
a `window.conflux.enable` api into the current page if ConfluxPortal is not
installed. Calling the api is same as calling `startOnboarding`.
