const {TimeoutError} = require('beaker-error-constants')
const EventTarget = require('dom-event-target')

exports.datDns = require('dat-dns')()

exports.timer = function (ms, fn) {
  var currentAction
  var isTimedOut = false

  const debugObject = {}
  Error.captureStackTrace(debugObject)

  // no timeout?
  if (!ms) return fn(() => false)

  return new Promise((resolve, reject) => {
    // start the timer
    const timer = setTimeout(() => {
      isTimedOut = true
      const message = currentAction ? `Timed out while ${currentAction}` : undefined
      const error = new TimeoutError(message)
      error.debugStack = debugObject.stack
      reject(error)
    }, ms)

    // call the fn to get the promise
    var promise = fn(action => {
      if (action) currentAction = action
      return isTimedOut
    })

    // wrap the promise
    promise.then(
      val => {
        clearTimeout(timer)
        resolve(val)
      },
      err => {
        clearTimeout(timer)
        reject(err)
      }
    )
  })
}

exports.toEventTarget = function (es) {
  var target = new EventTarget()
  es.on('data', ([event, args]) => target.send(event, args))
  target.close = es.destroy.bind(es)
  return target
}
