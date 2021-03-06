/* Based on: 
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/src/config.js
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/LICENSE.txt
*/

/*
Configuration Settings
----------------------

The config settings change depending on which environment the app is running in.
By default, this is the development environment, but this can be changed either by:

- An ?env query string, e.g. localhost:3000?env=production
- The NODE_ENV environment variable on the system running the app.

 */

var DEFAULT_ENV = 'development';
var envFromBrowser = locationMatch(/\W?env=(\w+)/);
var envFromShell = process.env.NODE_ENV;
var env = envFromBrowser || envFromShell || DEFAULT_ENV;

if (!env.match(/^(production|staging|development)$/)) {
  throw new Error(`Error: Invalid Environment - ${env}`);
}

const baseConfig = {
  development: {
    //panoptesAppId: '974cc8da2448bac692703f0b364a6b41a7662d91a5a3a1acb064eb703a01e6df', // TODO - add app id on staging
    zooniverseLinks: {
      host: 'https://master.pfe-preview.zooniverse.org/',
      projectId: '7859',
      projectSlug: 'edh/weather-rescue',
      projectLinkBase: 'https://www.zooniverse.org/projects/edh/weather-rescue'
    },
  },
  production: {
    //panoptesAppId: '064a5a32a9d2d389eeb876a8b7cb0fbe596fd80d7a040566f14965446d34c541',  // TODO - add production app id
    zooniverseLinks: {
      host: 'https://www.zooniverse.org/',
      projectId: '7859',
      projectSlug: 'edh/weather-rescue',
      projectLinkBase: 'https://www.zooniverse.org/projects/edh/weather-rescue'
    },
  },
};

baseConfig.staging = baseConfig.development;  //staging === development, as far as we're concerned.

const config = baseConfig[env];

export { env, config };

// Try and match the location.search property against a regex. Basically mimics
// the CoffeeScript existential operator, in case we're not in a browser.
function locationMatch(regex) {
  var match;
  if (typeof location !== 'undefined' && location !== null) {
    match = location.search.match(regex);
  }
  return (match && match[1]) ? match[1] : undefined;
}
