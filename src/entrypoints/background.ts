import { defineBackground } from 'wxt/sandbox';

export default defineBackground(() => {
  console.log('Text to Prompt background service worker started');

  // Handle extension installation or update
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      console.log('Extension installed');
    } else if (details.reason === 'update') {
      console.log('Extension updated');
    }
  });
});
