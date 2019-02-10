/* Request handlers */

// Dependancies
const _data = require('./data');
const helpers = require('./helpers');

// Define the handlers
const handlers = {};

// Users
handlers.users = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
}

// Container for the users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
    // Check that all required fields are filled out
    const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? data.payload.tosAgreement : false;
    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user doesnt already exist
        // eslint-disable-next-line no-unused-vars
        _data.read('users', phone, (error, data) => {
            if (error) {
                // Hash the password
                const hashedPassword = helpers.hash(password);

                // Create the user object
                if (hashedPassword) {
                    const userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true,
                    };

                    // Store the user
                    _data.create('users', phone, userObject, (error) => {
                        if (!error) {
                            callback(200);
                        } else {
                            callback(500, { 'Error': 'Could not create the new user' });
                        }
                    });
                } else {
                    callback(500, { 'Error': 'Could not hash the user\'s password' });
                }

            } else {
                // User already exist
                callback(400, { 'Error': 'A user with that phone number already exists' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields' });
    }
};

// Users - get
// Required data: phone
// Optional data: none
handlers._users.get = (data, callback) => {
    // Check phone number is valid
    const phone = typeof (data.queryStrObject.phone) == 'string' && data.queryStrObject.phone.trim().length == 10 ? data.queryStrObject.phone.trim() : false;
    if (phone) {
        // Get the token from the headers
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, (error, data) => {
                    if (!error && data) {
                        // Remove the hashed password from the user object
                        delete data.hashedPassword;
                        callback(200, data);
                    } else {
                        callback(404);
                    }
                });
            } else {
                callback(403, { 'Error': 'Missing required token in header, or token is invalid' });
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
};

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified) 
handlers._users.put = (data, callback) => {
    // Check for the required field
    const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    // check for the optional fields
    const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    // Error if phone is invalid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {
            // Get the token from the headers
            const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
            // Verify that the given token is valid for the phone number
            handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {
                    // Lookup the user
                    _data.read('users', phone, (error, userData) => {
                        if (!error && data) {
                            // Update the necessary fields
                            if (firstName) {
                                userData.firstName = firstName;
                            }

                            if (lastName) {
                                userData.lastName = lastName;
                            }

                            if (password) {
                                userData.hashedPassword = helpers.hash(password);
                            }

                            // Store the new updates
                            _data.update('users', phone, userData, (error) => {
                                if (!error) {
                                    callback(200);
                                } else {
                                    callback(500, { 'Error': 'Could not update user' });
                                }
                            })
                        } else {
                            callback(400, { 'Error': 'The specified user does not exist' });
                        }
                    });
                } else {
                    callback(403, { 'Error': 'Missing required token in header, or token is invalid' });
                }
            });
        } else {
            callback(400, { 'Error': 'Missing fields to update' });
        }
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
};

// Users - delete
// Required field: phone
// @TODO: Cleanup (delete) any other data files associated with this user
handlers._users.delete = (data, callback) => {
    // Check that the phone number is valid
    const phone = typeof (data.queryStrObject.phone) == 'string' && data.queryStrObject.phone.trim().length == 10 ? data.queryStrObject.phone.trim() : false;
    if (phone) {
        // Get the token from the headers
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, (error, data) => {
                    if (!error && data) {
                        _data.delete('users', phone, (error) => {
                            if (!error) {
                                callback(200);
                            } else {
                                callback(500, { "Error": "Could not delete specified user" });
                            }
                        });
                    } else {
                        callback(400, { 'Error': 'Could not find specified user' });
                    }
                });
            } else {
                callback(403, { 'Error': 'Missing required token in header, or token is invalid' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
};

// Tokens
handlers.tokens = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
}

// Container for all tokens methods
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
    const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone && password) {
        // Lookup the user who matches phone number
        _data.read('users', phone, (error, userData) => {
            if (!error && userData) {
                // Hash the sent password and compare to user's stored password
                const hashedPassword = helpers.hash(password);
                if (hashedPassword == userData.hashedPassword) {
                    // if valid create a new token with a random name. Set expiration date 1 hour in the future
                    const tokenID = helpers.createRandomString(20);
                    const expires = Date.now() + (1000 * 60 * 60);
                    const tokenObject = {
                        'phone': phone,
                        'id': tokenID,
                        'expires': expires,
                    }

                    // Stores the token
                    _data.create('tokens', tokenID, tokenObject, (error) => {
                        if (!error) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, { 'Error': 'Could not create the new token' });
                        }
                    });
                } else {
                    callback(400, {
                        'Error': 'Password did not match specified user\'s stored password'
                    });
                }
            } else {
                callback(400, { 'Error': 'Could not find the specified user' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields' });
    }
};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = (data, callback) => {
    // Check that the id is valid
    const id = typeof (data.queryStrObject.id) == 'string' && data.queryStrObject.id.trim().length == 20 ? data.queryStrObject.id.trim() : false;
    if (id) {
        // Lookup the token
        _data.read('tokens', id, (error, tokenData) => {
            if (!error && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields' });
    }
};

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
    const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    const extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

    if (id && extend) {
        // Lookup the token
        _data.read('tokens', id, (error, tokenData) => {
            if (!error && tokenData) {
                // Check to make sure that the token isn't already expired
                if (tokenData.expires > Date.now()) {
                    // Set the expiration an hour from now
                    tokenData.expires = Date.now() + (1000 * 60 * 60);

                    // Store the new updates
                    _data.update('tokens', id, tokenData, (error) => {
                        if (!error) {
                            callback(200);
                        } else {
                            callback(500, { 'Error': 'Could not update the token\'s expiration date' });
                        }
                    })
                } else {
                    callback(400, { 'Error': 'The token has already expired, and cannot be extended. ' });
                }
            } else {
                callback(400, { 'Error': 'Specified token does not exist' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field(s) or field(s) are invalid' });
    }

};

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = (data, callback) => {
    // Check that the id is valid
    const id = typeof (data.queryStrObject.id) == 'string' && data.queryStrObject.id.trim().length == 20 ? data.queryStrObject.id.trim() : false;
    if (id) {
        // Lookup the toekn
        _data.read('tokens', id, (error, data) => {
            if (!error && data) {
                _data.delete('tokens', id, (error) => {
                    if (!error) {
                        callback(200);
                    } else {
                        callback(500, { "Error": "Could not delete specified token" });
                    }
                });
            } else {
                callback(400, { 'Error': 'Could not find specified token' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
    // Lookup the token
    _data.read('tokens', id, (error, tokenData) => {
        if (!error && tokenData) {
            // Check that the token is for the given user and has not expires
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

// Sample handler
handlers.hello = (data, callback) => {
    // Callback a http status code, and a payload object
    callback(200, { 'message': 'Hello Pirple!' });
};

// Ping handler
handlers.ping = (data, callback) => {
    // Callback a http status code, and a payload object
    callback(200);
};

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
}

// Export the module
module.exports = handlers;