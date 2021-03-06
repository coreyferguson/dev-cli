
const cp = require('../cp');
const path = require('path');
const spawn = require('child_process').spawn;

/**
 * Docker utilities.
 * @namespace docker
 * @example
 * const { docker } = require('dev-env-lib');
 */
class Docker {

  /**
   * Build docker image.
   * @memberOf docker
   * @function buildImage
   * @param {string} name - Name of docker image
   * @param {cp~PathSegments} dockerfilePath - Absolute or relative (to workingDirectory) path to Dockerfile
   * @returns {Promise.<cp~AggregatedOutput>} aggregated output
   */
  buildImage(name, dockerfilePath) {
    if (!dockerfilePath) return Promise.reject(
      new Error('Missing required argument: dockerfilePath'));
    if (dockerfilePath instanceof Array) {
      dockerfilePath = path.resolve.apply(null, dockerfilePath);
    }
    return cp.spawnTemplate({
      cwd: dockerfilePath,
      templatePath: [__dirname, 'templates/buildImage'],
      model: { dockerfilePath, name }
    });
  }

  /**
   * Remove docker image.
   * @memberOf docker
   * @function removeImage
   * @param {string} name - Name of docker image
   * @returns {cp~AggregatedOutput} aggregated output
   */
  removeImage(name) {
    return cp.spawnTemplate({
      cwd: __dirname,
      templatePath: [__dirname, 'templates/removeImage'],
      model: { name }
    }).catch(err => {
      if (err.code !== 1) throw new Error(err);
      else return err;
    });
  }

  /**
   * Check if a docker image already exists.
   * @memberOf docker
   * @function imageExists
   * @param {string} name - Name of docker image
   * @returns {Promise.<boolean>} existance of docker image
   */
  imageExists(name) {
    return cp.spawnTemplate({
      cwd: __dirname,
      templatePath: [__dirname, 'templates/getImage'],
      model: { name }
    }).then(response => {
      return /dev-env-lib-test-docker/.test(response.stdout);
    });
  }

  /**
   * Create a virtual network with docker.
   * @memberOf docker
   * @function createNetwork
   * @param {string} name - Name of docker image
   * @returns {Promise.<cp~AggregatedOutput>} aggregated output
   */
  createNetwork(name) {
    return cp.spawnTemplate({
      cwd: __dirname,
      templatePath: [__dirname, 'templates/createNetwork'],
      model: { name }
    }).catch(err => {
      if (err.code !== 1) throw new Error(err);
      else return err;
    });
  }

  /**
   * Remove a virtual network with docker.
   * @memberOf docker
   * @function removeNetwork
   * @param {string} name - Name of docker image
   * @returns {Promise.<cp~AggregatedOutput>} aggregated output
   */
  removeNetwork(name) {
    return cp.spawnTemplate({
      cwd: __dirname,
      templatePath: [__dirname, 'templates/removeNetwork'],
      model: { name }
    }).catch(err => {
      if (err.code !== 1) throw new Error(err);
      else return err;
    });
  }

  /**
   * Remove a docker container.
   * @memberOf docker
   * @function removeContainer
   * @param {string} name - Name of docker container
   * @returns {Promise.<cp~AggregatedOutput>} aggregated output
   */
  removeContainer(name) {
    return cp.spawnTemplate({
      cwd: __dirname,
      templatePath: [__dirname, 'templates/removeContainer'],
      model: { name }
    }).catch(err => {
      if (err.code !== 1) throw new Error(err);
      else return err;
    });
  }

  /**
   * Tail the logs of a container until output matches the given regex.
   * @memberOf docker
   * @function waitForContainerOutput
   * @param {string} name - Name of docker container
   * @param {RegExp} regex - regex to match in output
   * @returns {Promise} fulfill on match, reject when process closed without match
   */
  waitForContainerOutput(name, regex) {
    return new Promise((resolve, reject) => {
      const cp = spawn('docker', ['logs', '-f', name]);
      function testData(data) {
        if (regex.test(data.toString())) {
          cp.kill('SIGINT');
          resolve();
        }
      }
      cp.stderr.on('data', testData);
      cp.stdout.on('data', testData);
      cp.on('close', code => {
        reject(new Error('stdio closed without matching regex. code: ' + code));
      });
    });
  }

}

module.exports = new Docker();
module.exports.Docker = Docker;
