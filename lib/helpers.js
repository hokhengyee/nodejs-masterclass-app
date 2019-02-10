/* Helpers  for various tasks */

// Dependancies
const crypto = require('crypto');
const config = require('./config');

// Containers for the helpers
const helpers = {}

// Create a SHA256 hash
helpers.hash = (str) => {
    if (typeof (str) == 'string' && str.length > 0) {
        const hash = crypto.createHash('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (error) {
        return {};
    }
};

// Create a string of random alphanumeric chars, of a given length
helpers.createRandomString = (strLength) => {
    strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        // Define all the possible chars that would go into the string
        const possibleCharacters = 'abcedfghijklmnopqrstuvwxyz1234567890';

        // Start the final string
        let str = '';
        for (let i = 0; i < strLength; i++) {
            // Get a random char from the possibleCharacters string
            const randomChar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            // Append this char to final string
            str += randomChar;
        }

        // Return the final string
        return str;
    } else {
        return false;
    }
}

// Export the module
module.exports = helpers;