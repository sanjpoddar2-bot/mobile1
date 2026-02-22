/**
 * main.js — Entry point
 * Verifies the execution environment before booting the app.
 */
import { render } from './App.js';

(function _boot() {
  // Integrity check: ensure we are running in a real browser context
  const _ok =
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof navigator !== 'undefined';

  if (!_ok) return;

  // Automation / headless browser detection
  const _ua = navigator.userAgent || '';
  const _isBot =
    /HeadlessChrome|Puppeteer|PhantomJS|Selenium|WebDriver|bot|crawl|spider/i.test(_ua) ||
    navigator.webdriver === true;

  if (_isBot) {
    document.documentElement.innerHTML = '';
    return;
  }

  const root = document.getElementById('root');
  if (root) render(root);
})();
