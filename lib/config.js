/* Create and export configuration variables */

// Container for all the environments
const environments = {};

// Staging (default) environment
environments.staging = {
    'port': 3000,
    'envName': 'staging',
    'hashingSecret': 'thisIsASecret',
};

// Production environment
environments.production = {
    'port': 8080,
    'envName': 'production',
    'hashingSecret': 'thisIsAlsoASecret',
};

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment exist, if not, default to staging
const environmentToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Exports the module
module.exports = environmentToExport;
