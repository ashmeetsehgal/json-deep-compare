// Minimal crypto polyfill for CI environments
if (typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.getRandomValues !== 'function') {
  const { webcrypto } = require('crypto');
  if (webcrypto && webcrypto.getRandomValues) {
    globalThis.crypto = webcrypto;
  } else {
    // Fallback polyfill
    globalThis.crypto = {
      getRandomValues: function(array) {
        const crypto = require('crypto');
        const randomBytes = crypto.randomBytes(array.length);
        for (let i = 0; i < array.length; i++) {
          array[i] = randomBytes[i];
        }
        return array;
      }
    };
  }
}
