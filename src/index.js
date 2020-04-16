import Bowser from 'bowser/src/bowser'

/** @enum {string} */
const ONBOARDING_STATE = {
  INSTALLED: 'INSTALLED',
  NOT_INSTALLED: 'NOT_INSTALLED',
  REGISTERED: 'REGISTERED',
  REGISTERING: 'REGISTERING',
  RELOADING: 'RELOADING',
}

/** @enum {string} */
const EXTENSION_DOWNLOAD_URL = {
  CHROME:
    'https://chrome.google.com/webstore/detail/conflux-portal/opafkgfpaamecojfkaialabagfofilmg',
  FIREFOX: 'https://addons.mozilla.org/en-US/firefox/addon/conflux-portal/',
  DEFAULT: 'https://portal.conflux-chain.org',
  GITHUB: 'https://github.com/Conflux-Chain/conflux-portal/releases',
}

// session storage key
const ONBOARDING_IN_PROGRESS = 'ONBOARDING_IN_PROGRESS'
const PORTAL_DOWNLOAD_URL = 'PORTAL_DOWNLOAD_URL'

/**
 * @typedef {Object} OnboardingOptions - Options for configuring onboarding
 */

class Onboarding {

  /**
   *
   * @param {OnboardingOptions} [options] - Options for configuring onboarding
   */
  constructor () {
    this.state = Onboarding.isConfluxPortalInstalled()
      ? ONBOARDING_STATE.INSTALLED
      : ONBOARDING_STATE.NOT_INSTALLED

    if (this.state === ONBOARDING_STATE.INSTALLED) {
      return
    }
    this.downloadUrl = this._getDownloadUrl()
    this.downloadUrl.then((url) => {
      this.downloadUrl = url
      sessionStorage.setItem(PORTAL_DOWNLOAD_URL, url)
    })
    this._openDownloadPage = this._openDownloadPage.bind(this)
    this.startOnboarding = this.startOnboarding.bind(this)
    this.stopOnboarding = this.stopOnboarding.bind(this)
  }

  getDownloadUrl () {
    return Promise.resolve(this.downloadUrl)
  }

  /**
   * Starts onboarding by opening the ConfluxPortal download page
   */
  startOnboarding () {
    if (sessionStorage.getItem(ONBOARDING_IN_PROGRESS)) {
      return
    }
    sessionStorage.setItem(ONBOARDING_IN_PROGRESS, true)
    this._openDownloadPage()
    sessionStorage.setItem(ONBOARDING_IN_PROGRESS, false)
  }

  _openDownloadPage () {
    this.getDownloadUrl().then((url) => window.open(url, '_blank'))
  }

  /**
   * get the right download url depends on users' client
   */
  async _getDownloadUrl () {
    if (this.downloadUrl) {
      return this.downloadUrl
    }

    const downloadUrlInSessionStorage = sessionStorage.getItem(
      PORTAL_DOWNLOAD_URL,
    )
    if (downloadUrlInSessionStorage) {
      return downloadUrlInSessionStorage
    }

    const browser = await Onboarding._detectBrowser()
    if (browser) {
      return EXTENSION_DOWNLOAD_URL[browser]
    }
    return EXTENSION_DOWNLOAD_URL.DEFAULT

  }

  /**
   * Checks whether the MetaMask extension is installed
   *
   * @returns {boolean} - `true` if MetaMask is installed, `false` otherwise.
   */
  static isConfluxPortalInstalled () {
    return Boolean(window.conflux && window.conflux.isConfluxPortal)
  }

  static async _detectBrowser () {
    const browserInfo = Bowser.parse(window.navigator.userAgent)
    if (browserInfo.browser.name === 'Firefox') {
      return 'FIREFOX'
    } else if (
      ['Chrome', 'Chromium'].includes(browserInfo.browser.name) &&
      (await Onboarding._canAccessChromeWebStore())
    ) {
      return 'CHROME'
    }

    if (
      location.host === 'portal.conflux-chain.org' ||
      location.host === 'portal.confluxnetwork.org'
    ) {
      return 'GITHUB'
    }
    return 'DEFAULT'
  }

  static _canAccessChromeWebStore () {
    return new Promise((resolve) => {
      setTimeout(() => resolve(false), 3000)
      fetch(EXTENSION_DOWNLOAD_URL.CHROME, { mode: 'cors' })
        .then(() => resolve(true))
        .catch(() => resolve(true))
    })
  }
}

export default Onboarding
