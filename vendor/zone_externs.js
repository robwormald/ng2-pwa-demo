/**
 * @externs
 */
var Zone = function(){};
Zone.prototype.parent;
Zone.prototype.name;

/**
 * @type Zone
 */
Zone.current;
Zone.currentTask;
/**
 * Returns a value associated with the `key`.
 *
 * If the current zone does not have a key, the request is delegated to the parent zone. Use
 * [ZoneSpec.properties] to configure the set of properties asseciated with the current zone.
 *
 * @param key The key to retrieve.
 * @returns {any} Tha value for the key, or `undefined` if not found.
 */
Zone.prototype.get = function(key){};
/**
 * Used to create a child zone.
 *
 * @param {ZoneSpec} zoneSpec A set of rules which the child zone should follow.
 * @returns {Zone} A new child zone.
 */
Zone.prototype.fork = function(zoneSpec){};
/**
 * Wraps a callback function in a new function which will properly restore the current zone upon
 * invocation.
 *
 * The wrapped function will properly forward `this` as well as `arguments` to the `callback`.
 *
 * Before the function is wrapped the zone can intercept the `callback` by declaring
 * [ZoneSpec.onIntercept].
 *
 * @param callback the function which will be wrapped in the zone.
 * @param source A unique debug location of the API being wrapped.
 * @returns {function(): *} A function which will invoke the `callback` through [Zone.runGuarded].
 */
Zone.prototype.wrap = function(callback, source) {};
/**
 * Invokes a function in a given zone.
 *
 * The invocation of `callback` can be intercepted be declaring [ZoneSpec.onInvoke].
 *
 * @param callback The function to invoke.
 * @param applyThis
 * @param applyArgs
 * @param source A unique debug location of the API being invoked.
 * @returns {any} Value from the `callback` function.
 */
Zone.prototype.run = function(callback, applyThis, applyArgs, source) {};
/**
 * Invokes a function in a given zone and catches any exceptions.
 *
 * Any exceptions thrown will be forwarded to [Zone.HandleError].
 *
 * The invocation of `callback` can be intercepted be declaring [ZoneSpec.onInvoke]. The
 * handling of exceptions can intercepted by declaring [ZoneSpec.handleError].
 *
 * @param callback The function to invoke.
 * @param applyThis
 * @param applyArgs
 * @param source A unique debug location of the API being invoked.
 * @returns {any} Value from the `callback` function.
 */
Zone.prototype.runGuarded = function(callback, applyThis, applyArgs, source) {};

/**
   * Schedules a microtask
   *
   * @param source
   * @param callback
   * @param data
   * @param customSchedule
   * @returns {*}
   */
Zone.prototype.scheduleMicroTask = function(source, callback, data, customSchedule) {};
/**
   * Schedules a microtask
   *
   * @param source
   * @param callback
   * @param data
   * @param customSchedule
   * @returns {*}
   */
Zone.prototype.scheduleMacroTask = function(source, callback, data, customSchedule) {};
/**
   * Schedules a microtask
   *
   * @param source
   * @param callback
   * @param data
   * @param customSchedule
   * @returns {*}
   */
Zone.prototype.scheduleEventTask = function(source, callback, data, customSchedule) {};

/**
   * Allows the zone to intercept canceling of scheduled Task.
   *
   * The interception is configured using [ZoneSpec.onCancelTask]. The default canceler invokes
   * the [Task.cancelFn].
   *
   * @param task
   * @returns {any}
   */
Zone.prototype.cancelTask = function(task) {};


var ZoneDelegate = function(){}
ZoneDelegate.prototype.zone;
ZoneDelegate.prototype.fork = function(targetZone, zoneSpec){}
ZoneDelegate.prototype.intercept = function(targetZone, callback, source){}
ZoneDelegate.prototype.invoke = function(targetZone, callback, applyThis, applyArgs, source){}
ZoneDelegate.prototype.handleError = function(targetZone, error){}
ZoneDelegate.prototype.scheduleTask = function(targetZone, task){}
ZoneDelegate.prototype.invokeTask = function(targetZone, task, applyThis, applyArgs){}
ZoneDelegate.prototype.cancelTask = function(targetZone, task){}
ZoneDelegate.prototype.hasTask = function(targetZone, isEmpty){}


var ZoneSpec = function(){}
ZoneSpec.prototype.name;
ZoneSpec.prototype.properties;

/**
   * Allows the zone to intercept canceling of scheduled Task.
   *
   * The interception is configured using [ZoneSpec.onCancelTask]. The default canceler invokes
   * the [Task.cancelFn].
   *
   * @param {ZoneDelegate} parentZoneDelegate
   * @param {Zone} currentZone
   * @param {Zone} targetZone
   * @param {ZoneSpec} zoneSpec
   * @returns {Zone}
   */
ZoneSpec.prototype.onFork = function(parentZoneDelegate, currentZone, targetZone, zoneSpec){}

/**
   * Allows interception of the wrapping of the callback.
   *
   * @param {ZoneDelegate} parentZoneDelegate Delegate which performs the parent [ZoneSpec] operation.
   * @param {Zone} currentZone The current [Zone] where the current interceptor has beed declared.
   * @param {Zone} targetZone The [Zone] which originally received the request.
   * @param delegate The argument passed into the `warp` method.
   * @param source The argument passed into the `warp` method.
   */
ZoneSpec.prototype.onIntercept = function(parentZoneDelegate, currentZone, targetZone,delegate, source){}

/**
   * Allows interception of the callback invocation.
   *
   * @param {ZoneDelegate} parentZoneDelegate Delegate which performs the parent [ZoneSpec] operation.
   * @param {Zone} currentZone The current [Zone] where the current interceptor has beed declared.
   * @param {Zone} targetZone The [Zone] which originally received the request.
   * @param delegate The argument passed into the `run` method.
   * @param applyThis The argument passed into the `run` method.
   * @param applyArgs The argument passed into the `run` method.
   * @param source The argument passed into the `run` method.
   */
ZoneSpec.prototype.onInvoke = function(parentZoneDelegate, currentZone, targetZone, delegate, applyThis, applyArgs, source){}

/**
   * Allows interception of the error handling.
   *
   * @param {ZoneDelegate} parentZoneDelegate Delegate which performs the parent [ZoneSpec] operation.
   * @param {Zone} currentZone The current [Zone] where the current interceptor has beed declared.
   * @param {Zone} targetZone The [Zone] which originally received the request.
   * @param error The argument passed into the `handleError` method.
   */
ZoneSpec.prototype.onHandleError = function(parentZoneDelegate, currentZone, targetZone, error){}

/**
   * Allows interception of task scheduling.
   *
   * @param {ZoneDelegate} parentZoneDelegate Delegate which performs the parent [ZoneSpec] operation.
   * @param {Zone} currentZone The current [Zone] where the current interceptor has beed declared.
   * @param {Zone} targetZone The [Zone] which originally received the request.
   * @param {Task} task The argument passed into the `scheduleTask` method.
   */
ZoneSpec.prototype.onScheduleTask = function(parentZoneDelegate, currentZone, targetZone, task){}

/**
   * Allows interception of task invocation.
   *
   * @param {ZoneDelegate} parentZoneDelegate Delegate which performs the parent [ZoneSpec] operation.
   * @param {Zone} currentZone The current [Zone] where the current interceptor has beed declared.
   * @param {Zone} targetZone The [Zone] which originally received the request.
   * @param {Task} task The argument passed into the `scheduleTask` method.
   */
ZoneSpec.prototype.onInvokeTask = function(parentZoneDelegate, currentZone, targetZone, task, applyThis, applyArgs){}

/**
   * Allows interception of task cancelation.
   *
   * @param parentZoneDelegate Delegate which performs the parent [ZoneSpec] operation.
   * @param currentZone The current [Zone] where the current interceptor has beed declared.
   * @param targetZone The [Zone] which originally received the request.
   * @param {Task} task The argument passed into the `cancelTask` method.
   */
ZoneSpec.prototype.onCancelTask = function(parentZoneDelegate, currentZone, targetZone, task){}

/**
   * Notifies of changes to the task queue empty status.
   *
   * @param {ZoneDelegate} parentZoneDelegate Delegate which performs the parent [ZoneSpec] operation.
   * @param {Zone} currentZone The current [Zone] where the current interceptor has beed declared.
   * @param {Zone} targetZone The [Zone] which originally received the request.
   * @param hasTaskState
   */
ZoneSpec.prototype.onHasTask = function(parentZoneDelegate, currentZone, targetZone, hasTaskState){}

function Task(){}
Task.prototype.type;
