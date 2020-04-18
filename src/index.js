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
   * Create a onboarding instance, it will inject a fake window.conflux.enalbe
   * portal api, if portal is not installed. Calling the api will open a web
   * page help the user to install ConfluxPortal
   *
   * @param {noInject} [boolean] don't inject the fake portal api
   */
  constructor ({ noInject = false }) {
    this.state = Onboarding.isConfluxPortalInstalled()
      ? ONBOARDING_STATE.INSTALLED
      : ONBOARDING_STATE.NOT_INSTALLED

    if (this.state === ONBOARDING_STATE.INSTALLED) {
      return
    }

    if (!noInject) {
      this._injectFakePortal()
    }

    this.downloadUrl = this._getDownloadUrl()
    this.downloadUrl.then((url) => {
      this.downloadUrl = url
      sessionStorage.setItem(PORTAL_DOWNLOAD_URL, url)
    })
    this._openDownloadPage = this._openDownloadPage.bind(this)
    this.startOnboarding = this.startOnboarding.bind(this)
  }

  _injectFakePortal () {
    window.conflux = { enalbe: this.startOnboarding }
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
        location.host === 'portal.confluxnetwork.org' ||
        window.FAKE_PORTAL_SITE
    ) {
      // eslint-disable-next-line no-empty-function
      EXTENSION_DOWNLOAD_URL.GITHUB = await Onboarding._getGithubReleaseUrl().catch(() => {})
      return 'GITHUB'
    }
    return 'DEFAULT'
  }

  static _canAccessChromeWebStore (tolerance = 3000) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(false), tolerance)
      fetch(EXTENSION_DOWNLOAD_URL.CHROME, { mode: 'cors' })
        .then(() => resolve(true))
        .catch(() => resolve(true))
    })
  }

  static async _getGithubReleaseUrl ({ browser, version = 'LATEST' } = {}) {
    // 'Firefox', 'Chrome', 'Chromium'
    const userBrowser =
      browser || Bowser.parse(window.navigator.userAgent).browser.name
    const b = userBrowser.toLowerCase().includes('firefox')
      ? 'firefox'
      : 'chrom'
    if (version !== 'latest' && (/^\d{1,2}\.\d{1,2}\.\d{1,2}$/u).test(version)) {
      throw new Error(
        `Invalid version number: ${version}, version number should be LATEST or "*.*.*" where "*" should be number`,
      )
    }

    const releasesRes = await fetch(
      'https://api.github.com/repos/Conflux-Chain/conflux-portal/releases',
      { mode: 'cors' },
    )
    if (!releasesRes.ok) {
      throw new Error('Error getting release info from github.')
    }
    const releases = await releasesRes.json()
    const rightVersion =
      version === 'LATEST'
        ? releases[0]
        : releases.find(({ tag_name: tagName }) => tagName.includes(version))

    if (!rightVersion || !rightVersion.assets || !rightVersion.assets.length) {
      throw new Error(
        `Invalid version number, there's no version ${version} or there's no assets under that version of release`,
      )
    }
    const rightAsset = rightVersion.assets.find(({ browser_download_url: browserDownloadUrl }) => browserDownloadUrl.includes(b))
    if (!rightAsset) {
      throw new Error(
        `Invalid version numver, there's no asked assets in release ${version}`,
      )
    }

    return rightAsset.browser_download_url
  }

  /**
   * open portal.conflux-chain.org page
   */
  static openPortalSite () {
    window.open(EXTENSION_DOWNLOAD_URL.DEFAULT, '_blank')
  }
}

export default Onboarding
