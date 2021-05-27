/**
 * On promise rejection returns correct stack trace. Very usefull for external libraries which use non-standard async/await/Promise mechanism (i.e. processTicksAndRejections).
 *
 * @export
 * @template T
 * @param {Promise<T>} promise
 * @returns {Promise<T>}
 */
async function withStack(promise) {
  const stacktrace = new Error()
  try {
    return await promise
  } catch (e) {
    stacktrace.message = e.message
    throw stacktrace
  }
}

module.exports = withStack;