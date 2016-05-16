var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function () {
    'use strict';
    var globalScope;
    if (typeof window === 'undefined') {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            // TODO: Replace any with WorkerGlobalScope from lib.webworker.d.ts #3492
            globalScope = self;
        }
        else {
            globalScope = global;
        }
    }
    else {
        globalScope = window;
    }
    function scheduleMicroTask(fn) {
        Zone.current.scheduleMicroTask('scheduleMicrotask', fn);
    }
    // Need to declare a new variable for global here since TypeScript
    // exports the original value of the symbol.
    var global$1 = globalScope;
    var Type = Function;
    function getTypeNameForDebugging(type) {
        if (type['name']) {
            return type['name'];
        }
        return typeof type;
    }
    var Math = global$1.Math;
    var _devMode = true;
    var _modeLocked = false;
    function lockMode() {
        _modeLocked = true;
    }
    function assertionsEnabled() {
        return _devMode;
    }
    // TODO: remove calls to assert in production environment
    // Note: Can't just export this and import in in other files
    // as `assert` is a reserved keyword in Dart
    global$1.assert = function assert(condition) {
        // TODO: to be fixed properly via #2830, noop for now
    };
    function isPresent(obj) {
        return obj !== undefined && obj !== null;
    }
    function isBlank(obj) {
        return obj === undefined || obj === null;
    }
    function isString(obj) {
        return typeof obj === "string";
    }
    function isFunction(obj) {
        return typeof obj === "function";
    }
    function isType(obj) {
        return isFunction(obj);
    }
    function isPromise(obj) {
        return obj instanceof global$1.Promise;
    }
    function isArray(obj) {
        return Array.isArray(obj);
    }
    function noop() { }
    function stringify(token) {
        if (typeof token === 'string') {
            return token;
        }
        if (token === undefined || token === null) {
            return '' + token;
        }
        if (token.name) {
            return token.name;
        }
        if (token.overriddenName) {
            return token.overriddenName;
        }
        var res = token.toString();
        var newLineIndex = res.indexOf("\n");
        return (newLineIndex === -1) ? res : res.substring(0, newLineIndex);
    }
    var StringWrapper = (function () {
        function StringWrapper() {
        }
        StringWrapper.fromCharCode = function (code) { return String.fromCharCode(code); };
        StringWrapper.charCodeAt = function (s, index) { return s.charCodeAt(index); };
        StringWrapper.split = function (s, regExp) { return s.split(regExp); };
        StringWrapper.equals = function (s, s2) { return s === s2; };
        StringWrapper.stripLeft = function (s, charVal) {
            if (s && s.length) {
                var pos = 0;
                for (var i = 0; i < s.length; i++) {
                    if (s[i] != charVal)
                        break;
                    pos++;
                }
                s = s.substring(pos);
            }
            return s;
        };
        StringWrapper.stripRight = function (s, charVal) {
            if (s && s.length) {
                var pos = s.length;
                for (var i = s.length - 1; i >= 0; i--) {
                    if (s[i] != charVal)
                        break;
                    pos--;
                }
                s = s.substring(0, pos);
            }
            return s;
        };
        StringWrapper.replace = function (s, from, replace) {
            return s.replace(from, replace);
        };
        StringWrapper.replaceAll = function (s, from, replace) {
            return s.replace(from, replace);
        };
        StringWrapper.slice = function (s, from, to) {
            if (from === void 0) { from = 0; }
            if (to === void 0) { to = null; }
            return s.slice(from, to === null ? undefined : to);
        };
        StringWrapper.replaceAllMapped = function (s, from, cb) {
            return s.replace(from, function () {
                var matches = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    matches[_i - 0] = arguments[_i];
                }
                // Remove offset & string from the result array
                matches.splice(-2, 2);
                // The callback receives match, p1, ..., pn
                return cb(matches);
            });
        };
        StringWrapper.contains = function (s, substr) { return s.indexOf(substr) != -1; };
        StringWrapper.compare = function (a, b) {
            if (a < b) {
                return -1;
            }
            else if (a > b) {
                return 1;
            }
            else {
                return 0;
            }
        };
        return StringWrapper;
    }());
    // JS has NaN !== NaN
    function looseIdentical(a, b) {
        return a === b || typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b);
    }
    // JS considers NaN is the same as NaN for map Key (while NaN !== NaN otherwise)
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
    function getMapKey(value) {
        return value;
    }
    function normalizeBool(obj) {
        return isBlank(obj) ? false : obj;
    }
    function isJsObject(o) {
        return o !== null && (typeof o === "function" || typeof o === "object");
    }
    function print(obj) {
        console.log(obj);
    }
    function warn(obj) {
        console.warn(obj);
    }
    var _symbolIterator = null;
    function getSymbolIterator() {
        if (isBlank(_symbolIterator)) {
            if (isPresent(globalScope.Symbol) && isPresent(Symbol.iterator)) {
                _symbolIterator = Symbol.iterator;
            }
            else {
                // es6-shim specific logic
                var keys = Object.getOwnPropertyNames(Map.prototype);
                for (var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    if (key !== 'entries' && key !== 'size' &&
                        Map.prototype[key] === Map.prototype['entries']) {
                        _symbolIterator = key;
                    }
                }
            }
        }
        return _symbolIterator;
    }
    function isPrimitive(obj) {
        return !isJsObject(obj);
    }
    /**
     * A parameter metadata that specifies a dependency.
     *
     * ### Example ([live demo](http://plnkr.co/edit/6uHYJK?p=preview))
     *
     * ```typescript
     * class Engine {}
     *
     * @Injectable()
     * class Car {
     *   engine;
     *   constructor(@Inject("MyEngine") engine:Engine) {
     *     this.engine = engine;
     *   }
     * }
     *
     * var injector = Injector.resolveAndCreate([
     *  provide("MyEngine", {useClass: Engine}),
     *  Car
     * ]);
     *
     * expect(injector.get(Car).engine instanceof Engine).toBe(true);
     * ```
     *
     * When `@Inject()` is not present, {@link Injector} will use the type annotation of the parameter.
     *
     * ### Example
     *
     * ```typescript
     * class Engine {}
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine: Engine) {} //same as constructor(@Inject(Engine) engine:Engine)
     * }
     *
     * var injector = Injector.resolveAndCreate([Engine, Car]);
     * expect(injector.get(Car).engine instanceof Engine).toBe(true);
     * ```
     * @ts2dart_const
     */
    var InjectMetadata = (function () {
        function InjectMetadata(token) {
            this.token = token;
        }
        InjectMetadata.prototype.toString = function () { return "@Inject(" + stringify(this.token) + ")"; };
        return InjectMetadata;
    }());
    /**
     * A parameter metadata that marks a dependency as optional. {@link Injector} provides `null` if
     * the dependency is not found.
     *
     * ### Example ([live demo](http://plnkr.co/edit/AsryOm?p=preview))
     *
     * ```typescript
     * class Engine {}
     *
     * @Injectable()
     * class Car {
     *   engine;
     *   constructor(@Optional() engine:Engine) {
     *     this.engine = engine;
     *   }
     * }
     *
     * var injector = Injector.resolveAndCreate([Car]);
     * expect(injector.get(Car).engine).toBeNull();
     * ```
     * @ts2dart_const
     */
    var OptionalMetadata = (function () {
        function OptionalMetadata() {
        }
        OptionalMetadata.prototype.toString = function () { return "@Optional()"; };
        return OptionalMetadata;
    }());
    /**
     * `DependencyMetadata` is used by the framework to extend DI.
     * This is internal to Angular and should not be used directly.
     * @ts2dart_const
     */
    var DependencyMetadata = (function () {
        function DependencyMetadata() {
        }
        Object.defineProperty(DependencyMetadata.prototype, "token", {
            get: function () { return null; },
            enumerable: true,
            configurable: true
        });
        return DependencyMetadata;
    }());
    /**
     * A marker metadata that marks a class as available to {@link Injector} for creation.
     *
     * ### Example ([live demo](http://plnkr.co/edit/Wk4DMQ?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class UsefulService {}
     *
     * @Injectable()
     * class NeedsService {
     *   constructor(public service:UsefulService) {}
     * }
     *
     * var injector = Injector.resolveAndCreate([NeedsService, UsefulService]);
     * expect(injector.get(NeedsService).service instanceof UsefulService).toBe(true);
     * ```
     * {@link Injector} will throw {@link NoAnnotationError} when trying to instantiate a class that
     * does not have `@Injectable` marker, as shown in the example below.
     *
     * ```typescript
     * class UsefulService {}
     *
     * class NeedsService {
     *   constructor(public service:UsefulService) {}
     * }
     *
     * var injector = Injector.resolveAndCreate([NeedsService, UsefulService]);
     * expect(() => injector.get(NeedsService)).toThrowError();
     * ```
     * @ts2dart_const
     */
    var InjectableMetadata = (function () {
        function InjectableMetadata() {
        }
        return InjectableMetadata;
    }());
    /**
     * Specifies that an {@link Injector} should retrieve a dependency only from itself.
     *
     * ### Example ([live demo](http://plnkr.co/edit/NeagAg?p=preview))
     *
     * ```typescript
     * class Dependency {
     * }
     *
     * @Injectable()
     * class NeedsDependency {
     *   dependency;
     *   constructor(@Self() dependency:Dependency) {
     *     this.dependency = dependency;
     *   }
     * }
     *
     * var inj = Injector.resolveAndCreate([Dependency, NeedsDependency]);
     * var nd = inj.get(NeedsDependency);
     *
     * expect(nd.dependency instanceof Dependency).toBe(true);
     *
     * var inj = Injector.resolveAndCreate([Dependency]);
     * var child = inj.resolveAndCreateChild([NeedsDependency]);
     * expect(() => child.get(NeedsDependency)).toThrowError();
     * ```
     * @ts2dart_const
     */
    var SelfMetadata = (function () {
        function SelfMetadata() {
        }
        SelfMetadata.prototype.toString = function () { return "@Self()"; };
        return SelfMetadata;
    }());
    /**
     * Specifies that the dependency resolution should start from the parent injector.
     *
     * ### Example ([live demo](http://plnkr.co/edit/Wchdzb?p=preview))
     *
     * ```typescript
     * class Dependency {
     * }
     *
     * @Injectable()
     * class NeedsDependency {
     *   dependency;
     *   constructor(@SkipSelf() dependency:Dependency) {
     *     this.dependency = dependency;
     *   }
     * }
     *
     * var parent = Injector.resolveAndCreate([Dependency]);
     * var child = parent.resolveAndCreateChild([NeedsDependency]);
     * expect(child.get(NeedsDependency).dependency instanceof Depedency).toBe(true);
     *
     * var inj = Injector.resolveAndCreate([Dependency, NeedsDependency]);
     * expect(() => inj.get(NeedsDependency)).toThrowError();
     * ```
     * @ts2dart_const
     */
    var SkipSelfMetadata = (function () {
        function SkipSelfMetadata() {
        }
        SkipSelfMetadata.prototype.toString = function () { return "@SkipSelf()"; };
        return SkipSelfMetadata;
    }());
    /**
     * Specifies that an injector should retrieve a dependency from any injector until reaching the
     * closest host.
     *
     * In Angular, a component element is automatically declared as a host for all the injectors in
     * its view.
     *
     * ### Example ([live demo](http://plnkr.co/edit/GX79pV?p=preview))
     *
     * In the following example `App` contains `ParentCmp`, which contains `ChildDirective`.
     * So `ParentCmp` is the host of `ChildDirective`.
     *
     * `ChildDirective` depends on two services: `HostService` and `OtherService`.
     * `HostService` is defined at `ParentCmp`, and `OtherService` is defined at `App`.
     *
     *```typescript
     * class OtherService {}
     * class HostService {}
     *
     * @Directive({
     *   selector: 'child-directive'
     * })
     * class ChildDirective {
     *   constructor(@Optional() @Host() os:OtherService, @Optional() @Host() hs:HostService){
     *     console.log("os is null", os);
     *     console.log("hs is NOT null", hs);
     *   }
     * }
     *
     * @Component({
     *   selector: 'parent-cmp',
     *   providers: [HostService],
     *   template: `
     *     Dir: <child-directive></child-directive>
     *   `,
     *   directives: [ChildDirective]
     * })
     * class ParentCmp {
     * }
     *
     * @Component({
     *   selector: 'app',
     *   providers: [OtherService],
     *   template: `
     *     Parent: <parent-cmp></parent-cmp>
     *   `,
     *   directives: [ParentCmp]
     * })
     * class App {
     * }
     *
     * bootstrap(App);
     *```
     * @ts2dart_const
     */
    var HostMetadata = (function () {
        function HostMetadata() {
        }
        HostMetadata.prototype.toString = function () { return "@Host()"; };
        return HostMetadata;
    }());
    /**
     * Allows to refer to references which are not yet defined.
     *
     * For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of
     * DI is declared,
     * but not yet defined. It is also used when the `token` which we use when creating a query is not
     * yet defined.
     *
     * ### Example
     * {@example core/di/ts/forward_ref/forward_ref.ts region='forward_ref'}
     */
    function forwardRef(forwardRefFn) {
        forwardRefFn.__forward_ref__ = forwardRef;
        forwardRefFn.toString = function () { return stringify(this()); };
        return forwardRefFn;
    }
    /**
     * Lazily retrieves the reference value from a forwardRef.
     *
     * Acts as the identity function when given a non-forward-ref value.
     *
     * ### Example ([live demo](http://plnkr.co/edit/GU72mJrk1fiodChcmiDR?p=preview))
     *
     * ```typescript
     * var ref = forwardRef(() => "refValue");
     * expect(resolveForwardRef(ref)).toEqual("refValue");
     * expect(resolveForwardRef("regularValue")).toEqual("regularValue");
     * ```
     *
     * See: {@link forwardRef}
     */
    function resolveForwardRef(type) {
        if (isFunction(type) && type.hasOwnProperty('__forward_ref__') &&
            type.__forward_ref__ === forwardRef) {
            return type();
        }
        else {
            return type;
        }
    }
    /**
     * Specifies that a constant attribute value should be injected.
     *
     * The directive can inject constant string literals of host element attributes.
     *
     * ### Example
     *
     * Suppose we have an `<input>` element and want to know its `type`.
     *
     * ```html
     * <input type="text">
     * ```
     *
     * A decorator can inject string literal `text` like so:
     *
     * {@example core/ts/metadata/metadata.ts region='attributeMetadata'}
     * @ts2dart_const
     */
    var AttributeMetadata = (function (_super) {
        __extends(AttributeMetadata, _super);
        function AttributeMetadata(attributeName) {
            _super.call(this);
            this.attributeName = attributeName;
        }
        Object.defineProperty(AttributeMetadata.prototype, "token", {
            get: function () {
                // Normally one would default a token to a type of an injected value but here
                // the type of a variable is "string" and we can't use primitive type as a return value
                // so we use instance of Attribute instead. This doesn't matter much in practice as arguments
                // with @Attribute annotation are injected by ElementInjector that doesn't take tokens into
                // account.
                return this;
            },
            enumerable: true,
            configurable: true
        });
        AttributeMetadata.prototype.toString = function () { return "@Attribute(" + stringify(this.attributeName) + ")"; };
        return AttributeMetadata;
    }(DependencyMetadata));
    /**
     * Declares an injectable parameter to be a live list of directives or variable
     * bindings from the content children of a directive.
     *
     * ### Example ([live demo](http://plnkr.co/edit/lY9m8HLy7z06vDoUaSN2?p=preview))
     *
     * Assume that `<tabs>` component would like to get a list its children `<pane>`
     * components as shown in this example:
     *
     * ```html
     * <tabs>
     *   <pane title="Overview">...</pane>
     *   <pane *ngFor="let o of objects" [title]="o.title">{{o.text}}</pane>
     * </tabs>
     * ```
     *
     * The preferred solution is to query for `Pane` directives using this decorator.
     *
     * ```javascript
     * @Component({
     *   selector: 'pane',
     *   inputs: ['title']
     * })
     * class Pane {
     *   title:string;
     * }
     *
     * @Component({
     *  selector: 'tabs',
     *  template: `
     *    <ul>
     *      <li *ngFor="let pane of panes">{{pane.title}}</li>
     *    </ul>
     *    <ng-content></ng-content>
     *  `
     * })
     * class Tabs {
     *   panes: QueryList<Pane>;
     *   constructor(@Query(Pane) panes:QueryList<Pane>) {
      *    this.panes = panes;
      *  }
     * }
     * ```
     *
     * A query can look for variable bindings by passing in a string with desired binding symbol.
     *
     * ### Example ([live demo](http://plnkr.co/edit/sT2j25cH1dURAyBRCKx1?p=preview))
     * ```html
     * <seeker>
     *   <div #findme>...</div>
     * </seeker>
     *
     * @Component({ selector: 'seeker' })
     * class Seeker {
     *   constructor(@Query('findme') elList: QueryList<ElementRef>) {...}
     * }
     * ```
     *
     * In this case the object that is injected depend on the type of the variable
     * binding. It can be an ElementRef, a directive or a component.
     *
     * Passing in a comma separated list of variable bindings will query for all of them.
     *
     * ```html
     * <seeker>
     *   <div #find-me>...</div>
     *   <div #find-me-too>...</div>
     * </seeker>
     *
     *  @Component({
     *   selector: 'seeker'
     * })
     * class Seeker {
     *   constructor(@Query('findMe, findMeToo') elList: QueryList<ElementRef>) {...}
     * }
     * ```
     *
     * Configure whether query looks for direct children or all descendants
     * of the querying element, by using the `descendants` parameter.
     * It is set to `false` by default.
     *
     * ### Example ([live demo](http://plnkr.co/edit/wtGeB977bv7qvA5FTYl9?p=preview))
     * ```html
     * <container #first>
     *   <item>a</item>
     *   <item>b</item>
     *   <container #second>
     *     <item>c</item>
     *   </container>
     * </container>
     * ```
     *
     * When querying for items, the first container will see only `a` and `b` by default,
     * but with `Query(TextDirective, {descendants: true})` it will see `c` too.
     *
     * The queried directives are kept in a depth-first pre-order with respect to their
     * positions in the DOM.
     *
     * Query does not look deep into any subcomponent views.
     *
     * Query is updated as part of the change-detection cycle. Since change detection
     * happens after construction of a directive, QueryList will always be empty when observed in the
     * constructor.
     *
     * The injected object is an unmodifiable live list.
     * See {@link QueryList} for more details.
     * @ts2dart_const
     */
    var QueryMetadata = (function (_super) {
        __extends(QueryMetadata, _super);
        function QueryMetadata(_selector, _a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.descendants, descendants = _c === void 0 ? false : _c, _d = _b.first, first = _d === void 0 ? false : _d, _e = _b.read, read = _e === void 0 ? null : _e;
            _super.call(this);
            this._selector = _selector;
            this.descendants = descendants;
            this.first = first;
            this.read = read;
        }
        Object.defineProperty(QueryMetadata.prototype, "isViewQuery", {
            /**
             * always `false` to differentiate it with {@link ViewQueryMetadata}.
             */
            get: function () { return false; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QueryMetadata.prototype, "selector", {
            /**
             * what this is querying for.
             */
            get: function () { return resolveForwardRef(this._selector); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QueryMetadata.prototype, "isVarBindingQuery", {
            /**
             * whether this is querying for a variable binding or a directive.
             */
            get: function () { return isString(this.selector); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QueryMetadata.prototype, "varBindings", {
            /**
             * returns a list of variable bindings this is querying for.
             * Only applicable if this is a variable bindings query.
             */
            get: function () { return this.selector.split(','); },
            enumerable: true,
            configurable: true
        });
        QueryMetadata.prototype.toString = function () { return "@Query(" + stringify(this.selector) + ")"; };
        return QueryMetadata;
    }(DependencyMetadata));
    // TODO: add an example after ContentChildren and ViewChildren are in master
    /**
     * Configures a content query.
     *
     * Content queries are set before the `ngAfterContentInit` callback is called.
     *
     * ### Example
     *
     * ```
     * @Directive({
     *   selector: 'someDir'
     * })
     * class SomeDir {
     *   @ContentChildren(ChildDirective) contentChildren: QueryList<ChildDirective>;
     *
     *   ngAfterContentInit() {
     *     // contentChildren is set
     *   }
     * }
     * ```
     * @ts2dart_const
     */
    var ContentChildrenMetadata = (function (_super) {
        __extends(ContentChildrenMetadata, _super);
        function ContentChildrenMetadata(_selector, _a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.descendants, descendants = _c === void 0 ? false : _c, _d = _b.read, read = _d === void 0 ? null : _d;
            _super.call(this, _selector, { descendants: descendants, read: read });
        }
        return ContentChildrenMetadata;
    }(QueryMetadata));
    /**
     * Describes the current state of the change detector.
     */
    var ChangeDetectorState;
    (function (ChangeDetectorState) {
        /**
         * `NeverChecked` means that the change detector has not been checked yet, and
         * initialization methods should be called during detection.
         */
        ChangeDetectorState[ChangeDetectorState["NeverChecked"] = 0] = "NeverChecked";
        /**
         * `CheckedBefore` means that the change detector has successfully completed at least
         * one detection previously.
         */
        ChangeDetectorState[ChangeDetectorState["CheckedBefore"] = 1] = "CheckedBefore";
        /**
         * `Errored` means that the change detector encountered an error checking a binding
         * or calling a directive lifecycle method and is now in an inconsistent state. Change
         * detectors in this state will no longer detect changes.
         */
        ChangeDetectorState[ChangeDetectorState["Errored"] = 2] = "Errored";
    })(ChangeDetectorState || (ChangeDetectorState = {}));
    /**
     * Describes within the change detector which strategy will be used the next time change
     * detection is triggered.
     */
    var ChangeDetectionStrategy;
    (function (ChangeDetectionStrategy) {
        /**
         * `CheckedOnce` means that after calling detectChanges the mode of the change detector
         * will become `Checked`.
         */
        ChangeDetectionStrategy[ChangeDetectionStrategy["CheckOnce"] = 0] = "CheckOnce";
        /**
         * `Checked` means that the change detector should be skipped until its mode changes to
         * `CheckOnce`.
         */
        ChangeDetectionStrategy[ChangeDetectionStrategy["Checked"] = 1] = "Checked";
        /**
         * `CheckAlways` means that after calling detectChanges the mode of the change detector
         * will remain `CheckAlways`.
         */
        ChangeDetectionStrategy[ChangeDetectionStrategy["CheckAlways"] = 2] = "CheckAlways";
        /**
         * `Detached` means that the change detector sub tree is not a part of the main tree and
         * should be skipped.
         */
        ChangeDetectionStrategy[ChangeDetectionStrategy["Detached"] = 3] = "Detached";
        /**
         * `OnPush` means that the change detector's mode will be set to `CheckOnce` during hydration.
         */
        ChangeDetectionStrategy[ChangeDetectionStrategy["OnPush"] = 4] = "OnPush";
        /**
         * `Default` means that the change detector's mode will be set to `CheckAlways` during hydration.
         */
        ChangeDetectionStrategy[ChangeDetectionStrategy["Default"] = 5] = "Default";
    })(ChangeDetectionStrategy || (ChangeDetectionStrategy = {}));
    /**
     * List of possible {@link ChangeDetectionStrategy} values.
     */
    var CHANGE_DETECTION_STRATEGY_VALUES = [
        ChangeDetectionStrategy.CheckOnce,
        ChangeDetectionStrategy.Checked,
        ChangeDetectionStrategy.CheckAlways,
        ChangeDetectionStrategy.Detached,
        ChangeDetectionStrategy.OnPush,
        ChangeDetectionStrategy.Default
    ];
    function isDefaultChangeDetectionStrategy(changeDetectionStrategy) {
        return isBlank(changeDetectionStrategy) ||
            changeDetectionStrategy === ChangeDetectionStrategy.Default;
    }
    /**
     * Directives allow you to attach behavior to elements in the DOM.
     *
     * {@link DirectiveMetadata}s with an embedded view are called {@link ComponentMetadata}s.
     *
     * A directive consists of a single directive annotation and a controller class. When the
     * directive's `selector` matches
     * elements in the DOM, the following steps occur:
     *
     * 1. For each directive, the `ElementInjector` attempts to resolve the directive's constructor
     * arguments.
     * 2. Angular instantiates directives for each matched element using `ElementInjector` in a
     * depth-first order,
     *    as declared in the HTML.
     *
     * ## Understanding How Injection Works
     *
     * There are three stages of injection resolution.
     * - *Pre-existing Injectors*:
     *   - The terminal {@link Injector} cannot resolve dependencies. It either throws an error or, if
     * the dependency was
     *     specified as `@Optional`, returns `null`.
     *   - The platform injector resolves browser singleton resources, such as: cookies, title,
     * location, and others.
     * - *Component Injectors*: Each component instance has its own {@link Injector}, and they follow
     * the same parent-child hierarchy
     *     as the component instances in the DOM.
     * - *Element Injectors*: Each component instance has a Shadow DOM. Within the Shadow DOM each
     * element has an `ElementInjector`
     *     which follow the same parent-child hierarchy as the DOM elements themselves.
     *
     * When a template is instantiated, it also must instantiate the corresponding directives in a
     * depth-first order. The
     * current `ElementInjector` resolves the constructor dependencies for each directive.
     *
     * Angular then resolves dependencies as follows, according to the order in which they appear in the
     * {@link ViewMetadata}:
     *
     * 1. Dependencies on the current element
     * 2. Dependencies on element injectors and their parents until it encounters a Shadow DOM boundary
     * 3. Dependencies on component injectors and their parents until it encounters the root component
     * 4. Dependencies on pre-existing injectors
     *
     *
     * The `ElementInjector` can inject other directives, element-specific special objects, or it can
     * delegate to the parent
     * injector.
     *
     * To inject other directives, declare the constructor parameter as:
     * - `directive:DirectiveType`: a directive on the current element only
     * - `@Host() directive:DirectiveType`: any directive that matches the type between the current
     * element and the
     *    Shadow DOM root.
     * - `@Query(DirectiveType) query:QueryList<DirectiveType>`: A live collection of direct child
     * directives.
     * - `@QueryDescendants(DirectiveType) query:QueryList<DirectiveType>`: A live collection of any
     * child directives.
     *
     * To inject element-specific special objects, declare the constructor parameter as:
     * - `element: ElementRef` to obtain a reference to logical element in the view.
     * - `viewContainer: ViewContainerRef` to control child template instantiation, for
     * {@link DirectiveMetadata} directives only
     * - `bindingPropagation: BindingPropagation` to control change detection in a more granular way.
     *
     * ### Example
     *
     * The following example demonstrates how dependency injection resolves constructor arguments in
     * practice.
     *
     *
     * Assume this HTML template:
     *
     * ```
     * <div dependency="1">
     *   <div dependency="2">
     *     <div dependency="3" my-directive>
     *       <div dependency="4">
     *         <div dependency="5"></div>
     *       </div>
     *       <div dependency="6"></div>
     *     </div>
     *   </div>
     * </div>
     * ```
     *
     * With the following `dependency` decorator and `SomeService` injectable class.
     *
     * ```
     * @Injectable()
     * class SomeService {
     * }
     *
     * @Directive({
     *   selector: '[dependency]',
     *   inputs: [
     *     'id: dependency'
     *   ]
     * })
     * class Dependency {
     *   id:string;
     * }
     * ```
     *
     * Let's step through the different ways in which `MyDirective` could be declared...
     *
     *
     * ### No injection
     *
     * Here the constructor is declared with no arguments, therefore nothing is injected into
     * `MyDirective`.
     *
     * ```
     * @Directive({ selector: '[my-directive]' })
     * class MyDirective {
     *   constructor() {
     *   }
     * }
     * ```
     *
     * This directive would be instantiated with no dependencies.
     *
     *
     * ### Component-level injection
     *
     * Directives can inject any injectable instance from the closest component injector or any of its
     * parents.
     *
     * Here, the constructor declares a parameter, `someService`, and injects the `SomeService` type
     * from the parent
     * component's injector.
     * ```
     * @Directive({ selector: '[my-directive]' })
     * class MyDirective {
     *   constructor(someService: SomeService) {
     *   }
     * }
     * ```
     *
     * This directive would be instantiated with a dependency on `SomeService`.
     *
     *
     * ### Injecting a directive from the current element
     *
     * Directives can inject other directives declared on the current element.
     *
     * ```
     * @Directive({ selector: '[my-directive]' })
     * class MyDirective {
     *   constructor(dependency: Dependency) {
     *     expect(dependency.id).toEqual(3);
     *   }
     * }
     * ```
     * This directive would be instantiated with `Dependency` declared at the same element, in this case
     * `dependency="3"`.
     *
     * ### Injecting a directive from any ancestor elements
     *
     * Directives can inject other directives declared on any ancestor element (in the current Shadow
     * DOM), i.e. on the current element, the
     * parent element, or its parents.
     * ```
     * @Directive({ selector: '[my-directive]' })
     * class MyDirective {
     *   constructor(@Host() dependency: Dependency) {
     *     expect(dependency.id).toEqual(2);
     *   }
     * }
     * ```
     *
     * `@Host` checks the current element, the parent, as well as its parents recursively. If
     * `dependency="2"` didn't
     * exist on the direct parent, this injection would
     * have returned
     * `dependency="1"`.
     *
     *
     * ### Injecting a live collection of direct child directives
     *
     *
     * A directive can also query for other child directives. Since parent directives are instantiated
     * before child directives, a directive can't simply inject the list of child directives. Instead,
     * the directive injects a {@link QueryList}, which updates its contents as children are added,
     * removed, or moved by a directive that uses a {@link ViewContainerRef} such as a `ngFor`, an
     * `ngIf`, or an `ngSwitch`.
     *
     * ```
     * @Directive({ selector: '[my-directive]' })
     * class MyDirective {
     *   constructor(@Query(Dependency) dependencies:QueryList<Dependency>) {
     *   }
     * }
     * ```
     *
     * This directive would be instantiated with a {@link QueryList} which contains `Dependency` 4 and
     * `Dependency` 6. Here, `Dependency` 5 would not be included, because it is not a direct child.
     *
     * ### Injecting a live collection of descendant directives
     *
     * By passing the descendant flag to `@Query` above, we can include the children of the child
     * elements.
     *
     * ```
     * @Directive({ selector: '[my-directive]' })
     * class MyDirective {
     *   constructor(@Query(Dependency, {descendants: true}) dependencies:QueryList<Dependency>) {
     *   }
     * }
     * ```
     *
     * This directive would be instantiated with a Query which would contain `Dependency` 4, 5 and 6.
     *
     * ### Optional injection
     *
     * The normal behavior of directives is to return an error when a specified dependency cannot be
     * resolved. If you
     * would like to inject `null` on unresolved dependency instead, you can annotate that dependency
     * with `@Optional()`.
     * This explicitly permits the author of a template to treat some of the surrounding directives as
     * optional.
     *
     * ```
     * @Directive({ selector: '[my-directive]' })
     * class MyDirective {
     *   constructor(@Optional() dependency:Dependency) {
     *   }
     * }
     * ```
     *
     * This directive would be instantiated with a `Dependency` directive found on the current element.
     * If none can be
     * found, the injector supplies `null` instead of throwing an error.
     *
     * ### Example
     *
     * Here we use a decorator directive to simply define basic tool-tip behavior.
     *
     * ```
     * @Directive({
     *   selector: '[tooltip]',
     *   inputs: [
     *     'text: tooltip'
     *   ],
     *   host: {
     *     '(mouseenter)': 'onMouseEnter()',
     *     '(mouseleave)': 'onMouseLeave()'
     *   }
     * })
     * class Tooltip{
     *   text:string;
     *   overlay:Overlay; // NOT YET IMPLEMENTED
     *   overlayManager:OverlayManager; // NOT YET IMPLEMENTED
     *
     *   constructor(overlayManager:OverlayManager) {
     *     this.overlay = overlay;
     *   }
     *
     *   onMouseEnter() {
     *     // exact signature to be determined
     *     this.overlay = this.overlayManager.open(text, ...);
     *   }
     *
     *   onMouseLeave() {
     *     this.overlay.close();
     *     this.overlay = null;
     *   }
     * }
     * ```
     * In our HTML template, we can then add this behavior to a `<div>` or any other element with the
     * `tooltip` selector,
     * like so:
     *
     * ```
     * <div tooltip="some text here"></div>
     * ```
     *
     * Directives can also control the instantiation, destruction, and positioning of inline template
     * elements:
     *
     * A directive uses a {@link ViewContainerRef} to instantiate, insert, move, and destroy views at
     * runtime.
     * The {@link ViewContainerRef} is created as a result of `<template>` element, and represents a
     * location in the current view
     * where these actions are performed.
     *
     * Views are always created as children of the current {@link ViewMetadata}, and as siblings of the
     * `<template>` element. Thus a
     * directive in a child view cannot inject the directive that created it.
     *
     * Since directives that create views via ViewContainers are common in Angular, and using the full
     * `<template>` element syntax is wordy, Angular
     * also supports a shorthand notation: `<li *foo="bar">` and `<li template="foo: bar">` are
     * equivalent.
     *
     * Thus,
     *
     * ```
     * <ul>
     *   <li *foo="bar" title="text"></li>
     * </ul>
     * ```
     *
     * Expands in use to:
     *
     * ```
     * <ul>
     *   <template [foo]="bar">
     *     <li title="text"></li>
     *   </template>
     * </ul>
     * ```
     *
     * Notice that although the shorthand places `*foo="bar"` within the `<li>` element, the binding for
     * the directive
     * controller is correctly instantiated on the `<template>` element rather than the `<li>` element.
     *
     * ## Lifecycle hooks
     *
     * When the directive class implements some {@link ../../guide/lifecycle-hooks.html} the callbacks
     * are called by the change detection at defined points in time during the life of the directive.
     *
     * ### Example
     *
     * Let's suppose we want to implement the `unless` behavior, to conditionally include a template.
     *
     * Here is a simple directive that triggers on an `unless` selector:
     *
     * ```
     * @Directive({
     *   selector: '[unless]',
     *   inputs: ['unless']
     * })
     * export class Unless {
     *   viewContainer: ViewContainerRef;
     *   templateRef: TemplateRef;
     *   prevCondition: boolean;
     *
     *   constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef) {
     *     this.viewContainer = viewContainer;
     *     this.templateRef = templateRef;
     *     this.prevCondition = null;
     *   }
     *
     *   set unless(newCondition) {
     *     if (newCondition && (isBlank(this.prevCondition) || !this.prevCondition)) {
     *       this.prevCondition = true;
     *       this.viewContainer.clear();
     *     } else if (!newCondition && (isBlank(this.prevCondition) || this.prevCondition)) {
     *       this.prevCondition = false;
     *       this.viewContainer.create(this.templateRef);
     *     }
     *   }
     * }
     * ```
     *
     * We can then use this `unless` selector in a template:
     * ```
     * <ul>
     *   <li *unless="expr"></li>
     * </ul>
     * ```
     *
     * Once the directive instantiates the child view, the shorthand notation for the template expands
     * and the result is:
     *
     * ```
     * <ul>
     *   <template [unless]="exp">
     *     <li></li>
     *   </template>
     *   <li></li>
     * </ul>
     * ```
     *
     * Note also that although the `<li></li>` template still exists inside the `<template></template>`,
     * the instantiated
     * view occurs on the second `<li></li>` which is a sibling to the `<template>` element.
     * @ts2dart_const
     */
    var DirectiveMetadata = (function (_super) {
        __extends(DirectiveMetadata, _super);
        function DirectiveMetadata(_a) {
            var _b = _a === void 0 ? {} : _a, selector = _b.selector, inputs = _b.inputs, outputs = _b.outputs, properties = _b.properties, events = _b.events, host = _b.host, bindings = _b.bindings, providers = _b.providers, exportAs = _b.exportAs, queries = _b.queries;
            _super.call(this);
            this.selector = selector;
            this._inputs = inputs;
            this._properties = properties;
            this._outputs = outputs;
            this._events = events;
            this.host = host;
            this.exportAs = exportAs;
            this.queries = queries;
            this._providers = providers;
            this._bindings = bindings;
        }
        Object.defineProperty(DirectiveMetadata.prototype, "inputs", {
            /**
             * Enumerates the set of data-bound input properties for a directive
             *
             * Angular automatically updates input properties during change detection.
             *
             * The `inputs` property defines a set of `directiveProperty` to `bindingProperty`
             * configuration:
             *
             * - `directiveProperty` specifies the component property where the value is written.
             * - `bindingProperty` specifies the DOM property where the value is read from.
             *
             * When `bindingProperty` is not provided, it is assumed to be equal to `directiveProperty`.
             *
             * ### Example ([live demo](http://plnkr.co/edit/ivhfXY?p=preview))
             *
             * The following example creates a component with two data-bound properties.
             *
             * ```typescript
             * @Component({
             *   selector: 'bank-account',
             *   inputs: ['bankName', 'id: account-id'],
             *   template: `
             *     Bank Name: {{bankName}}
             *     Account Id: {{id}}
             *   `
             * })
             * class BankAccount {
             *   bankName: string;
             *   id: string;
             *
             *   // this property is not bound, and won't be automatically updated by Angular
             *   normalizedBankName: string;
             * }
             *
             * @Component({
             *   selector: 'app',
             *   template: `
             *     <bank-account bank-name="RBC" account-id="4747"></bank-account>
             *   `,
             *   directives: [BankAccount]
             * })
             * class App {}
             *
             * bootstrap(App);
             * ```
             *
             */
            get: function () {
                return isPresent(this._properties) && this._properties.length > 0 ? this._properties :
                    this._inputs;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DirectiveMetadata.prototype, "properties", {
            get: function () { return this.inputs; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DirectiveMetadata.prototype, "outputs", {
            /**
             * Enumerates the set of event-bound output properties.
             *
             * When an output property emits an event, an event handler attached to that event
             * the template is invoked.
             *
             * The `outputs` property defines a set of `directiveProperty` to `bindingProperty`
             * configuration:
             *
             * - `directiveProperty` specifies the component property that emits events.
             * - `bindingProperty` specifies the DOM property the event handler is attached to.
             *
             * ### Example ([live demo](http://plnkr.co/edit/d5CNq7?p=preview))
             *
             * ```typescript
             * @Directive({
             *   selector: 'interval-dir',
             *   outputs: ['everySecond', 'five5Secs: everyFiveSeconds']
             * })
             * class IntervalDir {
             *   everySecond = new EventEmitter();
             *   five5Secs = new EventEmitter();
             *
             *   constructor() {
             *     setInterval(() => this.everySecond.emit("event"), 1000);
             *     setInterval(() => this.five5Secs.emit("event"), 5000);
             *   }
             * }
             *
             * @Component({
             *   selector: 'app',
             *   template: `
             *     <interval-dir (everySecond)="everySecond()" (everyFiveSeconds)="everyFiveSeconds()">
             *     </interval-dir>
             *   `,
             *   directives: [IntervalDir]
             * })
             * class App {
             *   everySecond() { console.log('second'); }
             *   everyFiveSeconds() { console.log('five seconds'); }
             * }
             * bootstrap(App);
             * ```
             *
             */
            get: function () {
                return isPresent(this._events) && this._events.length > 0 ? this._events : this._outputs;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DirectiveMetadata.prototype, "events", {
            get: function () { return this.outputs; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DirectiveMetadata.prototype, "providers", {
            /**
             * Defines the set of injectable objects that are visible to a Directive and its light DOM
             * children.
             *
             * ## Simple Example
             *
             * Here is an example of a class that can be injected:
             *
             * ```
             * class Greeter {
             *    greet(name:string) {
             *      return 'Hello ' + name + '!';
             *    }
             * }
             *
             * @Directive({
             *   selector: 'greet',
             *   bindings: [
             *     Greeter
             *   ]
             * })
             * class HelloWorld {
             *   greeter:Greeter;
             *
             *   constructor(greeter:Greeter) {
             *     this.greeter = greeter;
             *   }
             * }
             * ```
             */
            get: function () {
                return isPresent(this._bindings) && this._bindings.length > 0 ? this._bindings :
                    this._providers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DirectiveMetadata.prototype, "bindings", {
            /** @deprecated */
            get: function () { return this.providers; },
            enumerable: true,
            configurable: true
        });
        return DirectiveMetadata;
    }(InjectableMetadata));
    /**
     * Declare reusable UI building blocks for an application.
     *
     * Each Angular component requires a single `@Component` annotation. The
     * `@Component`
     * annotation specifies when a component is instantiated, and which properties and hostListeners it
     * binds to.
     *
     * When a component is instantiated, Angular
     * - creates a shadow DOM for the component.
     * - loads the selected template into the shadow DOM.
     * - creates all the injectable objects configured with `providers` and `viewProviders`.
     *
     * All template expressions and statements are then evaluated against the component instance.
     *
     * For details on the `@View` annotation, see {@link ViewMetadata}.
     *
     * ## Lifecycle hooks
     *
     * When the component class implements some {@link ../../guide/lifecycle-hooks.html} the callbacks
     * are called by the change detection at defined points in time during the life of the component.
     *
     * ### Example
     *
     * {@example core/ts/metadata/metadata.ts region='component'}
     * @ts2dart_const
     */
    var ComponentMetadata = (function (_super) {
        __extends(ComponentMetadata, _super);
        function ComponentMetadata(_a) {
            var _b = _a === void 0 ? {} : _a, selector = _b.selector, inputs = _b.inputs, outputs = _b.outputs, properties = _b.properties, events = _b.events, host = _b.host, exportAs = _b.exportAs, moduleId = _b.moduleId, bindings = _b.bindings, providers = _b.providers, viewBindings = _b.viewBindings, viewProviders = _b.viewProviders, _c = _b.changeDetection, changeDetection = _c === void 0 ? ChangeDetectionStrategy.Default : _c, queries = _b.queries, templateUrl = _b.templateUrl, template = _b.template, styleUrls = _b.styleUrls, styles = _b.styles, directives = _b.directives, pipes = _b.pipes, encapsulation = _b.encapsulation;
            _super.call(this, {
                selector: selector,
                inputs: inputs,
                outputs: outputs,
                properties: properties,
                events: events,
                host: host,
                exportAs: exportAs,
                bindings: bindings,
                providers: providers,
                queries: queries
            });
            this.changeDetection = changeDetection;
            this._viewProviders = viewProviders;
            this._viewBindings = viewBindings;
            this.templateUrl = templateUrl;
            this.template = template;
            this.styleUrls = styleUrls;
            this.styles = styles;
            this.directives = directives;
            this.pipes = pipes;
            this.encapsulation = encapsulation;
            this.moduleId = moduleId;
        }
        Object.defineProperty(ComponentMetadata.prototype, "viewProviders", {
            /**
             * Defines the set of injectable objects that are visible to its view DOM children.
             *
             * ## Simple Example
             *
             * Here is an example of a class that can be injected:
             *
             * ```
             * class Greeter {
             *    greet(name:string) {
             *      return 'Hello ' + name + '!';
             *    }
             * }
             *
             * @Directive({
             *   selector: 'needs-greeter'
             * })
             * class NeedsGreeter {
             *   greeter:Greeter;
             *
             *   constructor(greeter:Greeter) {
             *     this.greeter = greeter;
             *   }
             * }
             *
             * @Component({
             *   selector: 'greet',
             *   viewProviders: [
             *     Greeter
             *   ],
             *   template: `<needs-greeter></needs-greeter>`,
             *   directives: [NeedsGreeter]
             * })
             * class HelloWorld {
             * }
             *
             * ```
             */
            get: function () {
                return isPresent(this._viewBindings) && this._viewBindings.length > 0 ? this._viewBindings :
                    this._viewProviders;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentMetadata.prototype, "viewBindings", {
            get: function () { return this.viewProviders; },
            enumerable: true,
            configurable: true
        });
        return ComponentMetadata;
    }(DirectiveMetadata));
    /**
     * Declare reusable pipe function.
     *
     * A "pure" pipe is only re-evaluated when either the input or any of the arguments change.
     *
     * When not specified, pipes default to being pure.
     *
     * ### Example
     *
     * {@example core/ts/metadata/metadata.ts region='pipe'}
     * @ts2dart_const
     */
    var PipeMetadata = (function (_super) {
        __extends(PipeMetadata, _super);
        function PipeMetadata(_a) {
            var name = _a.name, pure = _a.pure;
            _super.call(this);
            this.name = name;
            this._pure = pure;
        }
        Object.defineProperty(PipeMetadata.prototype, "pure", {
            get: function () { return isPresent(this._pure) ? this._pure : true; },
            enumerable: true,
            configurable: true
        });
        return PipeMetadata;
    }(InjectableMetadata));
    /**
     * Declares a data-bound input property.
     *
     * Angular automatically updates data-bound properties during change detection.
     *
     * `InputMetadata` takes an optional parameter that specifies the name
     * used when instantiating a component in the template. When not provided,
     * the name of the decorated property is used.
     *
     * ### Example
     *
     * The following example creates a component with two input properties.
     *
     * ```typescript
     * @Component({
     *   selector: 'bank-account',
     *   template: `
     *     Bank Name: {{bankName}}
     *     Account Id: {{id}}
     *   `
     * })
     * class BankAccount {
     *   @Input() bankName: string;
     *   @Input('account-id') id: string;
     *
     *   // this property is not bound, and won't be automatically updated by Angular
     *   normalizedBankName: string;
     * }
     *
     * @Component({
     *   selector: 'app',
     *   template: `
     *     <bank-account bank-name="RBC" account-id="4747"></bank-account>
     *   `,
     *   directives: [BankAccount]
     * })
     * class App {}
     *
     * bootstrap(App);
     * ```
     * @ts2dart_const
     */
    var InputMetadata = (function () {
        function InputMetadata(
            /**
             * Name used when instantiating a component in the template.
             */
            bindingPropertyName) {
            this.bindingPropertyName = bindingPropertyName;
        }
        return InputMetadata;
    }());
    /**
     * Defines template and style encapsulation options available for Component's {@link View}.
     *
     * See {@link ViewMetadata#encapsulation}.
     */
    var ViewEncapsulation;
    (function (ViewEncapsulation) {
        /**
         * Emulate `Native` scoping of styles by adding an attribute containing surrogate id to the Host
         * Element and pre-processing the style rules provided via
         * {@link ViewMetadata#styles} or {@link ViewMetadata#stylesUrls}, and adding the new Host Element
         * attribute to all selectors.
         *
         * This is the default option.
         */
        ViewEncapsulation[ViewEncapsulation["Emulated"] = 0] = "Emulated";
        /**
         * Use the native encapsulation mechanism of the renderer.
         *
         * For the DOM this means using [Shadow DOM](https://w3c.github.io/webcomponents/spec/shadow/) and
         * creating a ShadowRoot for Component's Host Element.
         */
        ViewEncapsulation[ViewEncapsulation["Native"] = 1] = "Native";
        /**
         * Don't provide any template or style encapsulation.
         */
        ViewEncapsulation[ViewEncapsulation["None"] = 2] = "None";
    })(ViewEncapsulation || (ViewEncapsulation = {}));
    var VIEW_ENCAPSULATION_VALUES = [ViewEncapsulation.Emulated, ViewEncapsulation.Native, ViewEncapsulation.None];
    /**
     * Metadata properties available for configuring Views.
     *
     * Each Angular component requires a single `@Component` and at least one `@View` annotation. The
     * `@View` annotation specifies the HTML template to use, and lists the directives that are active
     * within the template.
     *
     * When a component is instantiated, the template is loaded into the component's shadow root, and
     * the expressions and statements in the template are evaluated against the component.
     *
     * For details on the `@Component` annotation, see {@link ComponentMetadata}.
     *
     * ### Example
     *
     * ```
     * @Component({
     *   selector: 'greet',
     *   template: 'Hello {{name}}!',
     *   directives: [GreetUser, Bold]
     * })
     * class Greet {
     *   name: string;
     *
     *   constructor() {
     *     this.name = 'World';
     *   }
     * }
     * ```
     * @ts2dart_const
     */
    var ViewMetadata = (function () {
        function ViewMetadata(_a) {
            var _b = _a === void 0 ? {} : _a, templateUrl = _b.templateUrl, template = _b.template, directives = _b.directives, pipes = _b.pipes, encapsulation = _b.encapsulation, styles = _b.styles, styleUrls = _b.styleUrls;
            this.templateUrl = templateUrl;
            this.template = template;
            this.styleUrls = styleUrls;
            this.styles = styles;
            this.directives = directives;
            this.pipes = pipes;
            this.encapsulation = encapsulation;
        }
        return ViewMetadata;
    }());
    var LifecycleHooks;
    (function (LifecycleHooks) {
        LifecycleHooks[LifecycleHooks["OnInit"] = 0] = "OnInit";
        LifecycleHooks[LifecycleHooks["OnDestroy"] = 1] = "OnDestroy";
        LifecycleHooks[LifecycleHooks["DoCheck"] = 2] = "DoCheck";
        LifecycleHooks[LifecycleHooks["OnChanges"] = 3] = "OnChanges";
        LifecycleHooks[LifecycleHooks["AfterContentInit"] = 4] = "AfterContentInit";
        LifecycleHooks[LifecycleHooks["AfterContentChecked"] = 5] = "AfterContentChecked";
        LifecycleHooks[LifecycleHooks["AfterViewInit"] = 6] = "AfterViewInit";
        LifecycleHooks[LifecycleHooks["AfterViewChecked"] = 7] = "AfterViewChecked";
    })(LifecycleHooks || (LifecycleHooks = {}));
    /**
     * @internal
     */
    var LIFECYCLE_HOOKS_VALUES = [
        LifecycleHooks.OnInit,
        LifecycleHooks.OnDestroy,
        LifecycleHooks.DoCheck,
        LifecycleHooks.OnChanges,
        LifecycleHooks.AfterContentInit,
        LifecycleHooks.AfterContentChecked,
        LifecycleHooks.AfterViewInit,
        LifecycleHooks.AfterViewChecked
    ];
    var _nextClassId = 0;
    function extractAnnotation(annotation) {
        if (isFunction(annotation) && annotation.hasOwnProperty('annotation')) {
            // it is a decorator, extract annotation
            annotation = annotation.annotation;
        }
        return annotation;
    }
    function applyParams(fnOrArray, key) {
        if (fnOrArray === Object || fnOrArray === String || fnOrArray === Function ||
            fnOrArray === Number || fnOrArray === Array) {
            throw new Error("Can not use native " + stringify(fnOrArray) + " as constructor");
        }
        if (isFunction(fnOrArray)) {
            return fnOrArray;
        }
        else if (fnOrArray instanceof Array) {
            var annotations = fnOrArray;
            var fn = fnOrArray[fnOrArray.length - 1];
            if (!isFunction(fn)) {
                throw new Error("Last position of Class method array must be Function in key " + key + " was '" + stringify(fn) + "'");
            }
            var annoLength = annotations.length - 1;
            if (annoLength != fn.length) {
                throw new Error("Number of annotations (" + annoLength + ") does not match number of arguments (" + fn.length + ") in the function: " + stringify(fn));
            }
            var paramsAnnotations = [];
            for (var i = 0, ii = annotations.length - 1; i < ii; i++) {
                var paramAnnotations = [];
                paramsAnnotations.push(paramAnnotations);
                var annotation = annotations[i];
                if (annotation instanceof Array) {
                    for (var j = 0; j < annotation.length; j++) {
                        paramAnnotations.push(extractAnnotation(annotation[j]));
                    }
                }
                else if (isFunction(annotation)) {
                    paramAnnotations.push(extractAnnotation(annotation));
                }
                else {
                    paramAnnotations.push(annotation);
                }
            }
            Reflect.defineMetadata('parameters', paramsAnnotations, fn);
            return fn;
        }
        else {
            throw new Error("Only Function or Array is supported in Class definition for key '" + key + "' is '" + stringify(fnOrArray) + "'");
        }
    }
    /**
     * Provides a way for expressing ES6 classes with parameter annotations in ES5.
     *
     * ## Basic Example
     *
     * ```
     * var Greeter = ng.Class({
     *   constructor: function(name) {
     *     this.name = name;
     *   },
     *
     *   greet: function() {
     *     alert('Hello ' + this.name + '!');
     *   }
     * });
     * ```
     *
     * is equivalent to ES6:
     *
     * ```
     * class Greeter {
     *   constructor(name) {
     *     this.name = name;
     *   }
     *
     *   greet() {
     *     alert('Hello ' + this.name + '!');
     *   }
     * }
     * ```
     *
     * or equivalent to ES5:
     *
     * ```
     * var Greeter = function (name) {
     *   this.name = name;
     * }
     *
     * Greeter.prototype.greet = function () {
     *   alert('Hello ' + this.name + '!');
     * }
     * ```
     *
     * ### Example with parameter annotations
     *
     * ```
     * var MyService = ng.Class({
     *   constructor: [String, [new Query(), QueryList], function(name, queryList) {
     *     ...
     *   }]
     * });
     * ```
     *
     * is equivalent to ES6:
     *
     * ```
     * class MyService {
     *   constructor(name: string, @Query() queryList: QueryList) {
     *     ...
     *   }
     * }
     * ```
     *
     * ### Example with inheritance
     *
     * ```
     * var Shape = ng.Class({
     *   constructor: (color) {
     *     this.color = color;
     *   }
     * });
     *
     * var Square = ng.Class({
     *   extends: Shape,
     *   constructor: function(color, size) {
     *     Shape.call(this, color);
     *     this.size = size;
     *   }
     * });
     * ```
     */
    function Class(clsDef) {
        var constructor = applyParams(clsDef.hasOwnProperty('constructor') ? clsDef.constructor : undefined, 'constructor');
        var proto = constructor.prototype;
        if (clsDef.hasOwnProperty('extends')) {
            if (isFunction(clsDef.extends)) {
                constructor.prototype = proto =
                    Object.create(clsDef.extends.prototype);
            }
            else {
                throw new Error("Class definition 'extends' property must be a constructor function was: " + stringify(clsDef.extends));
            }
        }
        for (var key in clsDef) {
            if (key != 'extends' && key != 'prototype' && clsDef.hasOwnProperty(key)) {
                proto[key] = applyParams(clsDef[key], key);
            }
        }
        if (this && this.annotations instanceof Array) {
            Reflect.defineMetadata('annotations', this.annotations, constructor);
        }
        if (!constructor['name']) {
            constructor['overriddenName'] = "class" + _nextClassId++;
        }
        return constructor;
    }
    var Reflect = global$1.Reflect;
    function makeDecorator(annotationCls, chainFn) {
        if (chainFn === void 0) { chainFn = null; }
        function DecoratorFactory(objOrType) {
            var annotationInstance = new annotationCls(objOrType);
            if (this instanceof annotationCls) {
                return annotationInstance;
            }
            else {
                var chainAnnotation = isFunction(this) && this.annotations instanceof Array ? this.annotations : [];
                chainAnnotation.push(annotationInstance);
                var TypeDecorator = function TypeDecorator(cls) {
                    var annotations = Reflect.getOwnMetadata('annotations', cls);
                    annotations = annotations || [];
                    annotations.push(annotationInstance);
                    Reflect.defineMetadata('annotations', annotations, cls);
                    return cls;
                };
                TypeDecorator.annotations = chainAnnotation;
                TypeDecorator.Class = Class;
                if (chainFn)
                    chainFn(TypeDecorator);
                return TypeDecorator;
            }
        }
        DecoratorFactory.prototype = Object.create(annotationCls.prototype);
        DecoratorFactory.annotationCls = annotationCls;
        return DecoratorFactory;
    }
    function makeParamDecorator(annotationCls) {
        function ParamDecoratorFactory() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var annotationInstance = Object.create(annotationCls.prototype);
            annotationCls.apply(annotationInstance, args);
            if (this instanceof annotationCls) {
                return annotationInstance;
            }
            else {
                ParamDecorator.annotation = annotationInstance;
                return ParamDecorator;
            }
            function ParamDecorator(cls, unusedKey, index) {
                var parameters = Reflect.getMetadata('parameters', cls);
                parameters = parameters || [];
                // there might be gaps if some in between parameters do not have annotations.
                // we pad with nulls.
                while (parameters.length <= index) {
                    parameters.push(null);
                }
                parameters[index] = parameters[index] || [];
                var annotationsForParam = parameters[index];
                annotationsForParam.push(annotationInstance);
                Reflect.defineMetadata('parameters', parameters, cls);
                return cls;
            }
        }
        ParamDecoratorFactory.prototype = Object.create(annotationCls.prototype);
        ParamDecoratorFactory.annotationCls = annotationCls;
        return ParamDecoratorFactory;
    }
    function makePropDecorator(annotationCls) {
        function PropDecoratorFactory() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var decoratorInstance = Object.create(annotationCls.prototype);
            annotationCls.apply(decoratorInstance, args);
            if (this instanceof annotationCls) {
                return decoratorInstance;
            }
            else {
                return function PropDecorator(target, name) {
                    var meta = Reflect.getOwnMetadata('propMetadata', target.constructor);
                    meta = meta || {};
                    meta[name] = meta[name] || [];
                    meta[name].unshift(decoratorInstance);
                    Reflect.defineMetadata('propMetadata', meta, target.constructor);
                };
            }
        }
        PropDecoratorFactory.prototype = Object.create(annotationCls.prototype);
        PropDecoratorFactory.annotationCls = annotationCls;
        return PropDecoratorFactory;
    }
    // TODO(alexeagle): remove the duplication of this doc. It is copied from ComponentMetadata.
    /**
     * Declare reusable UI building blocks for an application.
     *
     * Each Angular component requires a single `@Component` annotation. The `@Component`
     * annotation specifies when a component is instantiated, and which properties and hostListeners it
     * binds to.
     *
     * When a component is instantiated, Angular
     * - creates a shadow DOM for the component.
     * - loads the selected template into the shadow DOM.
     * - creates all the injectable objects configured with `providers` and `viewProviders`.
     *
     * All template expressions and statements are then evaluated against the component instance.
     *
     * ## Lifecycle hooks
     *
     * When the component class implements some {@link ../../guide/lifecycle-hooks.html} the callbacks
     * are called by the change detection at defined points in time during the life of the component.
     *
     * ### Example
     *
     * {@example core/ts/metadata/metadata.ts region='component'}
     */
    var Component = makeDecorator(ComponentMetadata, function (fn) { return fn.View = View; });
    // TODO(alexeagle): remove the duplication of this doc. It is copied from DirectiveMetadata.
    /**
     * Directives allow you to attach behavior to elements in the DOM.
     *
     * {@link DirectiveMetadata}s with an embedded view are called {@link ComponentMetadata}s.
     *
     * A directive consists of a single directive annotation and a controller class. When the
     * directive's `selector` matches
     * elements in the DOM, the following steps occur:
     *
     * 1. For each directive, the `ElementInjector` attempts to resolve the directive's constructor
     * arguments.
     * 2. Angular instantiates directives for each matched element using `ElementInjector` in a
     * depth-first order,
     *    as declared in the HTML.
     *
     * ## Understanding How Injection Works
     *
     * There are three stages of injection resolution.
     * - *Pre-existing Injectors*:
     *   - The terminal {@link Injector} cannot resolve dependencies. It either throws an error or, if
     * the dependency was
     *     specified as `@Optional`, returns `null`.
     *   - The platform injector resolves browser singleton resources, such as: cookies, title,
     * location, and others.
     * - *Component Injectors*: Each component instance has its own {@link Injector}, and they follow
     * the same parent-child hierarchy
     *     as the component instances in the DOM.
     * - *Element Injectors*: Each component instance has a Shadow DOM. Within the Shadow DOM each
     * element has an `ElementInjector`
     *     which follow the same parent-child hierarchy as the DOM elements themselves.
     *
     * When a template is instantiated, it also must instantiate the corresponding directives in a
     * depth-first order. The
     * current `ElementInjector` resolves the constructor dependencies for each directive.
     *
     * Angular then resolves dependencies as follows, according to the order in which they appear in the
     * {@link ViewMetadata}:
     *
     * 1. Dependencies on the current element
     * 2. Dependencies on element injectors and their parents until it encounters a Shadow DOM boundary
     * 3. Dependencies on component injectors and their parents until it encounters the root component
     * 4. Dependencies on pre-existing injectors
     *
     *
     * The `ElementInjector` can inject other directives, element-specific special objects, or it can
     * delegate to the parent
     * injector.
     *
     * To inject other directives, declare the constructor parameter as:
     * - `directive:DirectiveType`: a directive on the current element only
     * - `@Host() directive:DirectiveType`: any directive that matches the type between the current
     * element and the
     *    Shadow DOM root.
     * - `@Query(DirectiveType) query:QueryList<DirectiveType>`: A live collection of direct child
     * directives.
     * - `@QueryDescendants(DirectiveType) query:QueryList<DirectiveType>`: A live collection of any
     * child directives.
     *
     * To inject element-specific special objects, declare the constructor parameter as:
     * - `element: ElementRef` to obtain a reference to logical element in the view.
     * - `viewContainer: ViewContainerRef` to control child template instantiation, for
     * {@link DirectiveMetadata} directives only
     * - `bindingPropagation: BindingPropagation` to control change detection in a more granular way.
     *
     * ### Example
     *
     * The following example demonstrates how dependency injection resolves constructor arguments in
     * practice.
     *
     *
     * Assume this HTML template:
     *
     * ```
     * <div dependency="1">
     *   <div dependency="2">
     *     <div dependency="3" my-directive>
     *       <div dependency="4">
     *         <div dependency="5"></div>
     *       </div>
     *       <div dependency="6"></div>
     *     </div>
     *   </div>
     * </div>
     * ```
     *
     * With the following `dependency` decorator and `SomeService` injectable class.
     *
     * ```
     * @Injectable()
     * class SomeService {
     * }
     *
     * @Directive({
     *   selector: '[dependency]',
     *   inputs: [
     *     'id: dependency'
     *   ]
     * })
     * class Dependency {
     *   id:string;
     * }
     * ```
     *
     * Let's step through the different ways in which `MyDirective` could be declared...
     *
     *
     * ### No injection
     *
     * Here the constructor is declared with no arguments, therefore nothing is injected into
     * `MyDirective`.
     *
     * ```
     * @Directive({ selector: '[my-directive]' })
     * class MyDirective {
     *   constructor() {
     *   }
     * }
     * ```
     *
     * This directive would be instantiated with no dependencies.
     *
     *
     * ### Component-level injection
     *
     * Directives can inject any injectable instance from the closest component injector or any of its
     * parents.
     *
     * Here, the constructor declares a parameter, `someService`, and injects the `SomeService` type
     * from the parent
     * component's injector.
     * ```
     * @Directive({ selector: '[my-directive]' })
     * class MyDirective {
     *   constructor(someService: SomeService) {
     *   }
     * }
     * ```
     *
     * This directive would be instantiated with a dependency on `SomeService`.
     *
     *
     * ### Injecting a directive from the current element
     *
     * Directives can inject other directives declared on the current element.
     *
     * ```
     * @Directive({ selector: '[my-directive]' })
     * class MyDirective {
     *   constructor(dependency: Dependency) {
     *     expect(dependency.id).toEqual(3);
     *   }
     * }
     * ```
     * This directive would be instantiated with `Dependency` declared at the same element, in this case
     * `dependency="3"`.
     *
     * ### Injecting a directive from any ancestor elements
     *
     * Directives can inject other directives declared on any ancestor element (in the current Shadow
     * DOM), i.e. on the current element, the
     * parent element, or its parents.
     * ```
     * @Directive({ selector: '[my-directive]' })
     * class MyDirective {
     *   constructor(@Host() dependency: Dependency) {
     *     expect(dependency.id).toEqual(2);
     *   }
     * }
     * ```
     *
     * `@Host` checks the current element, the parent, as well as its parents recursively. If
     * `dependency="2"` didn't
     * exist on the direct parent, this injection would
     * have returned
     * `dependency="1"`.
     *
     *
     * ### Injecting a live collection of direct child directives
     *
     *
     * A directive can also query for other child directives. Since parent directives are instantiated
     * before child directives, a directive can't simply inject the list of child directives. Instead,
     * the directive injects a {@link QueryList}, which updates its contents as children are added,
     * removed, or moved by a directive that uses a {@link ViewContainerRef} such as a `ngFor`, an
     * `ngIf`, or an `ngSwitch`.
     *
     * ```
     * @Directive({ selector: '[my-directive]' })
     * class MyDirective {
     *   constructor(@Query(Dependency) dependencies:QueryList<Dependency>) {
     *   }
     * }
     * ```
     *
     * This directive would be instantiated with a {@link QueryList} which contains `Dependency` 4 and
     * 6. Here, `Dependency` 5 would not be included, because it is not a direct child.
     *
     * ### Injecting a live collection of descendant directives
     *
     * By passing the descendant flag to `@Query` above, we can include the children of the child
     * elements.
     *
     * ```
     * @Directive({ selector: '[my-directive]' })
     * class MyDirective {
     *   constructor(@Query(Dependency, {descendants: true}) dependencies:QueryList<Dependency>) {
     *   }
     * }
     * ```
     *
     * This directive would be instantiated with a Query which would contain `Dependency` 4, 5 and 6.
     *
     * ### Optional injection
     *
     * The normal behavior of directives is to return an error when a specified dependency cannot be
     * resolved. If you
     * would like to inject `null` on unresolved dependency instead, you can annotate that dependency
     * with `@Optional()`.
     * This explicitly permits the author of a template to treat some of the surrounding directives as
     * optional.
     *
     * ```
     * @Directive({ selector: '[my-directive]' })
     * class MyDirective {
     *   constructor(@Optional() dependency:Dependency) {
     *   }
     * }
     * ```
     *
     * This directive would be instantiated with a `Dependency` directive found on the current element.
     * If none can be
     * found, the injector supplies `null` instead of throwing an error.
     *
     * ### Example
     *
     * Here we use a decorator directive to simply define basic tool-tip behavior.
     *
     * ```
     * @Directive({
     *   selector: '[tooltip]',
     *   inputs: [
     *     'text: tooltip'
     *   ],
     *   host: {
     *     '(mouseenter)': 'onMouseEnter()',
     *     '(mouseleave)': 'onMouseLeave()'
     *   }
     * })
     * class Tooltip{
     *   text:string;
     *   overlay:Overlay; // NOT YET IMPLEMENTED
     *   overlayManager:OverlayManager; // NOT YET IMPLEMENTED
     *
     *   constructor(overlayManager:OverlayManager) {
     *     this.overlay = overlay;
     *   }
     *
     *   onMouseEnter() {
     *     // exact signature to be determined
     *     this.overlay = this.overlayManager.open(text, ...);
     *   }
     *
     *   onMouseLeave() {
     *     this.overlay.close();
     *     this.overlay = null;
     *   }
     * }
     * ```
     * In our HTML template, we can then add this behavior to a `<div>` or any other element with the
     * `tooltip` selector,
     * like so:
     *
     * ```
     * <div tooltip="some text here"></div>
     * ```
     *
     * Directives can also control the instantiation, destruction, and positioning of inline template
     * elements:
     *
     * A directive uses a {@link ViewContainerRef} to instantiate, insert, move, and destroy views at
     * runtime.
     * The {@link ViewContainerRef} is created as a result of `<template>` element, and represents a
     * location in the current view
     * where these actions are performed.
     *
     * Views are always created as children of the current {@link ViewMetadata}, and as siblings of the
     * `<template>` element. Thus a
     * directive in a child view cannot inject the directive that created it.
     *
     * Since directives that create views via ViewContainers are common in Angular, and using the full
     * `<template>` element syntax is wordy, Angular
     * also supports a shorthand notation: `<li *foo="bar">` and `<li template="foo: bar">` are
     * equivalent.
     *
     * Thus,
     *
     * ```
     * <ul>
     *   <li *foo="bar" title="text"></li>
     * </ul>
     * ```
     *
     * Expands in use to:
     *
     * ```
     * <ul>
     *   <template [foo]="bar">
     *     <li title="text"></li>
     *   </template>
     * </ul>
     * ```
     *
     * Notice that although the shorthand places `*foo="bar"` within the `<li>` element, the binding for
     * the directive
     * controller is correctly instantiated on the `<template>` element rather than the `<li>` element.
     *
     * ## Lifecycle hooks
     *
     * When the directive class implements some {@link ../../guide/lifecycle-hooks.html} the callbacks
     * are called by the change detection at defined points in time during the life of the directive.
     *
     * ### Example
     *
     * Let's suppose we want to implement the `unless` behavior, to conditionally include a template.
     *
     * Here is a simple directive that triggers on an `unless` selector:
     *
     * ```
     * @Directive({
     *   selector: '[unless]',
     *   inputs: ['unless']
     * })
     * export class Unless {
     *   viewContainer: ViewContainerRef;
     *   templateRef: TemplateRef;
     *   prevCondition: boolean;
     *
     *   constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef) {
     *     this.viewContainer = viewContainer;
     *     this.templateRef = templateRef;
     *     this.prevCondition = null;
     *   }
     *
     *   set unless(newCondition) {
     *     if (newCondition && (isBlank(this.prevCondition) || !this.prevCondition)) {
     *       this.prevCondition = true;
     *       this.viewContainer.clear();
     *     } else if (!newCondition && (isBlank(this.prevCondition) || this.prevCondition)) {
     *       this.prevCondition = false;
     *       this.viewContainer.create(this.templateRef);
     *     }
     *   }
     * }
     * ```
     *
     * We can then use this `unless` selector in a template:
     * ```
     * <ul>
     *   <li *unless="expr"></li>
     * </ul>
     * ```
     *
     * Once the directive instantiates the child view, the shorthand notation for the template expands
     * and the result is:
     *
     * ```
     * <ul>
     *   <template [unless]="exp">
     *     <li></li>
     *   </template>
     *   <li></li>
     * </ul>
     * ```
     *
     * Note also that although the `<li></li>` template still exists inside the `<template></template>`,
     * the instantiated
     * view occurs on the second `<li></li>` which is a sibling to the `<template>` element.
     */
    var Directive = makeDecorator(DirectiveMetadata);
    // TODO(alexeagle): remove the duplication of this doc. It is copied from ViewMetadata.
    /**
     * Metadata properties available for configuring Views.
     *
     * Each Angular component requires a single `@Component` and at least one `@View` annotation. The
     * `@View` annotation specifies the HTML template to use, and lists the directives that are active
     * within the template.
     *
     * When a component is instantiated, the template is loaded into the component's shadow root, and
     * the expressions and statements in the template are evaluated against the component.
     *
     * For details on the `@Component` annotation, see {@link ComponentMetadata}.
     *
     * ### Example
     *
     * ```
     * @Component({
     *   selector: 'greet',
     *   template: 'Hello {{name}}!',
     *   directives: [GreetUser, Bold]
     * })
     * class Greet {
     *   name: string;
     *
     *   constructor() {
     *     this.name = 'World';
     *   }
     * }
     * ```
     */
    var View = makeDecorator(ViewMetadata, function (fn) { return fn.View = View; });
    /**
     * Specifies that a constant attribute value should be injected.
     *
     * The directive can inject constant string literals of host element attributes.
     *
     * ### Example
     *
     * Suppose we have an `<input>` element and want to know its `type`.
     *
     * ```html
     * <input type="text">
     * ```
     *
     * A decorator can inject string literal `text` like so:
     *
     * {@example core/ts/metadata/metadata.ts region='attributeMetadata'}
     */
    var Attribute = makeParamDecorator(AttributeMetadata);
    // TODO(alexeagle): remove the duplication of this doc. It is copied from ContentChildrenMetadata.
    /**
     * Configures a content query.
     *
     * Content queries are set before the `ngAfterContentInit` callback is called.
     *
     * ### Example
     *
     * ```
     * @Directive({
     *   selector: 'someDir'
     * })
     * class SomeDir {
     *   @ContentChildren(ChildDirective) contentChildren: QueryList<ChildDirective>;
     *
     *   ngAfterContentInit() {
     *     // contentChildren is set
     *   }
     * }
     * ```
     */
    var ContentChildren = makePropDecorator(ContentChildrenMetadata);
    // TODO(alexeagle): remove the duplication of this doc. It is copied from PipeMetadata.
    /**
     * Declare reusable pipe function.
     *
     * ### Example
     *
     * {@example core/ts/metadata/metadata.ts region='pipe'}
     */
    var Pipe = makeDecorator(PipeMetadata);
    // TODO(alexeagle): remove the duplication of this doc. It is copied from InputMetadata.
    /**
     * Declares a data-bound input property.
     *
     * Angular automatically updates data-bound properties during change detection.
     *
     * `InputMetadata` takes an optional parameter that specifies the name
     * used when instantiating a component in the template. When not provided,
     * the name of the decorated property is used.
     *
     * ### Example
     *
     * The following example creates a component with two input properties.
     *
     * ```typescript
     * @Component({
     *   selector: 'bank-account',
     *   template: `
     *     Bank Name: {{bankName}}
     *     Account Id: {{id}}
     *   `
     * })
     * class BankAccount {
     *   @Input() bankName: string;
     *   @Input('account-id') id: string;
     *
     *   // this property is not bound, and won't be automatically updated by Angular
     *   normalizedBankName: string;
     * }
     *
     * @Component({
     *   selector: 'app',
     *   template: `
     *     <bank-account bank-name="RBC" account-id="4747"></bank-account>
     *   `,
     *   directives: [BankAccount]
     * })
     * class App {}
     *
     * bootstrap(App);
     * ```
     */
    var Input = makePropDecorator(InputMetadata);
    /**
     * Factory for creating {@link InjectMetadata}.
     */
    var Inject = makeParamDecorator(InjectMetadata);
    /**
     * Factory for creating {@link OptionalMetadata}.
     */
    var Optional = makeParamDecorator(OptionalMetadata);
    /**
     * Factory for creating {@link InjectableMetadata}.
     */
    var Injectable = makeDecorator(InjectableMetadata);
    /**
     * Factory for creating {@link SelfMetadata}.
     */
    var Self = makeParamDecorator(SelfMetadata);
    /**
     * Factory for creating {@link HostMetadata}.
     */
    var Host = makeParamDecorator(HostMetadata);
    /**
     * Factory for creating {@link SkipSelfMetadata}.
     */
    var SkipSelf = makeParamDecorator(SkipSelfMetadata);
    /**
     * A base class for the WrappedException that can be used to identify
     * a WrappedException from ExceptionHandler without adding circular
     * dependency.
     */
    var BaseWrappedException = (function (_super) {
        __extends(BaseWrappedException, _super);
        function BaseWrappedException(message) {
            _super.call(this, message);
        }
        Object.defineProperty(BaseWrappedException.prototype, "wrapperMessage", {
            get: function () { return ''; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseWrappedException.prototype, "wrapperStack", {
            get: function () { return null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseWrappedException.prototype, "originalException", {
            get: function () { return null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseWrappedException.prototype, "originalStack", {
            get: function () { return null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseWrappedException.prototype, "context", {
            get: function () { return null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseWrappedException.prototype, "message", {
            get: function () { return ''; },
            enumerable: true,
            configurable: true
        });
        return BaseWrappedException;
    }(Error));
    var Map$1 = global$1.Map;
    var Set$1 = global$1.Set;
    // Safari and Internet Explorer do not support the iterable parameter to the
    // Map constructor.  We work around that by manually adding the items.
    var createMapFromPairs = (function () {
        try {
            if (new Map$1([[1, 2]]).size === 1) {
                return function createMapFromPairs(pairs) { return new Map$1(pairs); };
            }
        }
        catch (e) {
        }
        return function createMapAndPopulateFromPairs(pairs) {
            var map = new Map$1();
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                map.set(pair[0], pair[1]);
            }
            return map;
        };
    })();
    var createMapFromMap = (function () {
        try {
            if (new Map$1(new Map$1())) {
                return function createMapFromMap(m) { return new Map$1(m); };
            }
        }
        catch (e) {
        }
        return function createMapAndPopulateFromMap(m) {
            var map = new Map$1();
            m.forEach(function (v, k) { map.set(k, v); });
            return map;
        };
    })();
    var _clearValues = (function () {
        if ((new Map$1()).keys().next) {
            return function _clearValues(m) {
                var keyIterator = m.keys();
                var k;
                while (!((k = keyIterator.next()).done)) {
                    m.set(k.value, null);
                }
            };
        }
        else {
            return function _clearValuesWithForeEach(m) {
                m.forEach(function (v, k) { m.set(k, null); });
            };
        }
    })();
    // Safari doesn't implement MapIterator.next(), which is used is Traceur's polyfill of Array.from
    // TODO(mlaval): remove the work around once we have a working polyfill of Array.from
    var _arrayFromMap = (function () {
        try {
            if ((new Map$1()).values().next) {
                return function createArrayFromMap(m, getValues) {
                    return getValues ? Array.from(m.values()) : Array.from(m.keys());
                };
            }
        }
        catch (e) {
        }
        return function createArrayFromMapWithForeach(m, getValues) {
            var res = ListWrapper.createFixedSize(m.size), i = 0;
            m.forEach(function (v, k) {
                res[i] = getValues ? v : k;
                i++;
            });
            return res;
        };
    })();
    var MapWrapper = (function () {
        function MapWrapper() {
        }
        MapWrapper.clone = function (m) { return createMapFromMap(m); };
        MapWrapper.createFromStringMap = function (stringMap) {
            var result = new Map$1();
            for (var prop in stringMap) {
                result.set(prop, stringMap[prop]);
            }
            return result;
        };
        MapWrapper.toStringMap = function (m) {
            var r = {};
            m.forEach(function (v, k) { return r[k] = v; });
            return r;
        };
        MapWrapper.createFromPairs = function (pairs) { return createMapFromPairs(pairs); };
        MapWrapper.clearValues = function (m) { _clearValues(m); };
        MapWrapper.iterable = function (m) { return m; };
        MapWrapper.keys = function (m) { return _arrayFromMap(m, false); };
        MapWrapper.values = function (m) { return _arrayFromMap(m, true); };
        return MapWrapper;
    }());
    /**
     * Wraps Javascript Objects
     */
    var StringMapWrapper = (function () {
        function StringMapWrapper() {
        }
        StringMapWrapper.create = function () {
            // Note: We are not using Object.create(null) here due to
            // performance!
            // http://jsperf.com/ng2-object-create-null
            return {};
        };
        StringMapWrapper.contains = function (map, key) {
            return map.hasOwnProperty(key);
        };
        StringMapWrapper.get = function (map, key) {
            return map.hasOwnProperty(key) ? map[key] : undefined;
        };
        StringMapWrapper.set = function (map, key, value) { map[key] = value; };
        StringMapWrapper.keys = function (map) { return Object.keys(map); };
        StringMapWrapper.values = function (map) {
            return Object.keys(map).reduce(function (r, a) {
                r.push(map[a]);
                return r;
            }, []);
        };
        StringMapWrapper.isEmpty = function (map) {
            for (var prop in map) {
                return false;
            }
            return true;
        };
        StringMapWrapper.delete = function (map, key) { delete map[key]; };
        StringMapWrapper.forEach = function (map, callback) {
            for (var prop in map) {
                if (map.hasOwnProperty(prop)) {
                    callback(map[prop], prop);
                }
            }
        };
        StringMapWrapper.merge = function (m1, m2) {
            var m = {};
            for (var attr in m1) {
                if (m1.hasOwnProperty(attr)) {
                    m[attr] = m1[attr];
                }
            }
            for (var attr in m2) {
                if (m2.hasOwnProperty(attr)) {
                    m[attr] = m2[attr];
                }
            }
            return m;
        };
        StringMapWrapper.equals = function (m1, m2) {
            var k1 = Object.keys(m1);
            var k2 = Object.keys(m2);
            if (k1.length != k2.length) {
                return false;
            }
            var key;
            for (var i = 0; i < k1.length; i++) {
                key = k1[i];
                if (m1[key] !== m2[key]) {
                    return false;
                }
            }
            return true;
        };
        return StringMapWrapper;
    }());
    var ListWrapper = (function () {
        function ListWrapper() {
        }
        // JS has no way to express a statically fixed size list, but dart does so we
        // keep both methods.
        ListWrapper.createFixedSize = function (size) { return new Array(size); };
        ListWrapper.createGrowableSize = function (size) { return new Array(size); };
        ListWrapper.clone = function (array) { return array.slice(0); };
        ListWrapper.forEachWithIndex = function (array, fn) {
            for (var i = 0; i < array.length; i++) {
                fn(array[i], i);
            }
        };
        ListWrapper.first = function (array) {
            if (!array)
                return null;
            return array[0];
        };
        ListWrapper.last = function (array) {
            if (!array || array.length == 0)
                return null;
            return array[array.length - 1];
        };
        ListWrapper.indexOf = function (array, value, startIndex) {
            if (startIndex === void 0) { startIndex = 0; }
            return array.indexOf(value, startIndex);
        };
        ListWrapper.contains = function (list, el) { return list.indexOf(el) !== -1; };
        ListWrapper.reversed = function (array) {
            var a = ListWrapper.clone(array);
            return a.reverse();
        };
        ListWrapper.concat = function (a, b) { return a.concat(b); };
        ListWrapper.insert = function (list, index, value) { list.splice(index, 0, value); };
        ListWrapper.removeAt = function (list, index) {
            var res = list[index];
            list.splice(index, 1);
            return res;
        };
        ListWrapper.removeAll = function (list, items) {
            for (var i = 0; i < items.length; ++i) {
                var index = list.indexOf(items[i]);
                list.splice(index, 1);
            }
        };
        ListWrapper.remove = function (list, el) {
            var index = list.indexOf(el);
            if (index > -1) {
                list.splice(index, 1);
                return true;
            }
            return false;
        };
        ListWrapper.clear = function (list) { list.length = 0; };
        ListWrapper.isEmpty = function (list) { return list.length == 0; };
        ListWrapper.fill = function (list, value, start, end) {
            if (start === void 0) { start = 0; }
            if (end === void 0) { end = null; }
            list.fill(value, start, end === null ? list.length : end);
        };
        ListWrapper.equals = function (a, b) {
            if (a.length != b.length)
                return false;
            for (var i = 0; i < a.length; ++i) {
                if (a[i] !== b[i])
                    return false;
            }
            return true;
        };
        ListWrapper.slice = function (l, from, to) {
            if (from === void 0) { from = 0; }
            if (to === void 0) { to = null; }
            return l.slice(from, to === null ? undefined : to);
        };
        ListWrapper.splice = function (l, from, length) { return l.splice(from, length); };
        ListWrapper.sort = function (l, compareFn) {
            if (isPresent(compareFn)) {
                l.sort(compareFn);
            }
            else {
                l.sort();
            }
        };
        ListWrapper.toString = function (l) { return l.toString(); };
        ListWrapper.toJSON = function (l) { return JSON.stringify(l); };
        ListWrapper.maximum = function (list, predicate) {
            if (list.length == 0) {
                return null;
            }
            var solution = null;
            var maxValue = -Infinity;
            for (var index = 0; index < list.length; index++) {
                var candidate = list[index];
                if (isBlank(candidate)) {
                    continue;
                }
                var candidateValue = predicate(candidate);
                if (candidateValue > maxValue) {
                    solution = candidate;
                    maxValue = candidateValue;
                }
            }
            return solution;
        };
        ListWrapper.flatten = function (list) {
            var target = [];
            _flattenArray(list, target);
            return target;
        };
        ListWrapper.addAll = function (list, source) {
            for (var i = 0; i < source.length; i++) {
                list.push(source[i]);
            }
        };
        return ListWrapper;
    }());
    function _flattenArray(source, target) {
        if (isPresent(source)) {
            for (var i = 0; i < source.length; i++) {
                var item = source[i];
                if (isArray(item)) {
                    _flattenArray(item, target);
                }
                else {
                    target.push(item);
                }
            }
        }
        return target;
    }
    function isListLikeIterable(obj) {
        if (!isJsObject(obj))
            return false;
        return isArray(obj) ||
            (!(obj instanceof Map$1) &&
                getSymbolIterator() in obj); // JS Iterable have a Symbol.iterator prop
    }
    function areIterablesEqual(a, b, comparator) {
        var iterator1 = a[getSymbolIterator()]();
        var iterator2 = b[getSymbolIterator()]();
        while (true) {
            var item1 = iterator1.next();
            var item2 = iterator2.next();
            if (item1.done && item2.done)
                return true;
            if (item1.done || item2.done)
                return false;
            if (!comparator(item1.value, item2.value))
                return false;
        }
    }
    function iterateListLike(obj, fn) {
        if (isArray(obj)) {
            for (var i = 0; i < obj.length; i++) {
                fn(obj[i]);
            }
        }
        else {
            var iterator = obj[getSymbolIterator()]();
            var item;
            while (!((item = iterator.next()).done)) {
                fn(item.value);
            }
        }
    }
    // Safari and Internet Explorer do not support the iterable parameter to the
    // Set constructor.  We work around that by manually adding the items.
    var createSetFromList = (function () {
        var test = new Set$1([1, 2, 3]);
        if (test.size === 3) {
            return function createSetFromList(lst) { return new Set$1(lst); };
        }
        else {
            return function createSetAndPopulateFromList(lst) {
                var res = new Set$1(lst);
                if (res.size !== lst.length) {
                    for (var i = 0; i < lst.length; i++) {
                        res.add(lst[i]);
                    }
                }
                return res;
            };
        }
    })();
    var SetWrapper = (function () {
        function SetWrapper() {
        }
        SetWrapper.createFromList = function (lst) { return createSetFromList(lst); };
        SetWrapper.has = function (s, key) { return s.has(key); };
        SetWrapper.delete = function (m, k) { m.delete(k); };
        return SetWrapper;
    }());
    var _ArrayLogger = (function () {
        function _ArrayLogger() {
            this.res = [];
        }
        _ArrayLogger.prototype.log = function (s) { this.res.push(s); };
        _ArrayLogger.prototype.logError = function (s) { this.res.push(s); };
        _ArrayLogger.prototype.logGroup = function (s) { this.res.push(s); };
        _ArrayLogger.prototype.logGroupEnd = function () { };
        ;
        return _ArrayLogger;
    }());
    /**
     * Provides a hook for centralized exception handling.
     *
     * The default implementation of `ExceptionHandler` prints error messages to the `Console`. To
     * intercept error handling,
     * write a custom exception handler that replaces this default as appropriate for your app.
     *
     * ### Example
     *
     * ```javascript
     *
     * class MyExceptionHandler implements ExceptionHandler {
     *   call(error, stackTrace = null, reason = null) {
     *     // do something with the exception
     *   }
     * }
     *
     * bootstrap(MyApp, [provide(ExceptionHandler, {useClass: MyExceptionHandler})])
     *
     * ```
     */
    var ExceptionHandler = (function () {
        function ExceptionHandler(_logger, _rethrowException) {
            if (_rethrowException === void 0) { _rethrowException = true; }
            this._logger = _logger;
            this._rethrowException = _rethrowException;
        }
        ExceptionHandler.exceptionToString = function (exception, stackTrace, reason) {
            if (stackTrace === void 0) { stackTrace = null; }
            if (reason === void 0) { reason = null; }
            var l = new _ArrayLogger();
            var e = new ExceptionHandler(l, false);
            e.call(exception, stackTrace, reason);
            return l.res.join("\n");
        };
        ExceptionHandler.prototype.call = function (exception, stackTrace, reason) {
            if (stackTrace === void 0) { stackTrace = null; }
            if (reason === void 0) { reason = null; }
            var originalException = this._findOriginalException(exception);
            var originalStack = this._findOriginalStack(exception);
            var context = this._findContext(exception);
            this._logger.logGroup("EXCEPTION: " + this._extractMessage(exception));
            if (isPresent(stackTrace) && isBlank(originalStack)) {
                this._logger.logError("STACKTRACE:");
                this._logger.logError(this._longStackTrace(stackTrace));
            }
            if (isPresent(reason)) {
                this._logger.logError("REASON: " + reason);
            }
            if (isPresent(originalException)) {
                this._logger.logError("ORIGINAL EXCEPTION: " + this._extractMessage(originalException));
            }
            if (isPresent(originalStack)) {
                this._logger.logError("ORIGINAL STACKTRACE:");
                this._logger.logError(this._longStackTrace(originalStack));
            }
            if (isPresent(context)) {
                this._logger.logError("ERROR CONTEXT:");
                this._logger.logError(context);
            }
            this._logger.logGroupEnd();
            // We rethrow exceptions, so operations like 'bootstrap' will result in an error
            // when an exception happens. If we do not rethrow, bootstrap will always succeed.
            if (this._rethrowException)
                throw exception;
        };
        /** @internal */
        ExceptionHandler.prototype._extractMessage = function (exception) {
            return exception instanceof BaseWrappedException ? exception.wrapperMessage :
                exception.toString();
        };
        /** @internal */
        ExceptionHandler.prototype._longStackTrace = function (stackTrace) {
            return isListLikeIterable(stackTrace) ? stackTrace.join("\n\n-----async gap-----\n") :
                stackTrace.toString();
        };
        /** @internal */
        ExceptionHandler.prototype._findContext = function (exception) {
            try {
                if (!(exception instanceof BaseWrappedException))
                    return null;
                return isPresent(exception.context) ? exception.context :
                    this._findContext(exception.originalException);
            }
            catch (e) {
                // exception.context can throw an exception. if it happens, we ignore the context.
                return null;
            }
        };
        /** @internal */
        ExceptionHandler.prototype._findOriginalException = function (exception) {
            if (!(exception instanceof BaseWrappedException))
                return null;
            var e = exception.originalException;
            while (e instanceof BaseWrappedException && isPresent(e.originalException)) {
                e = e.originalException;
            }
            return e;
        };
        /** @internal */
        ExceptionHandler.prototype._findOriginalStack = function (exception) {
            if (!(exception instanceof BaseWrappedException))
                return null;
            var e = exception;
            var stack = exception.originalStack;
            while (e instanceof BaseWrappedException && isPresent(e.originalException)) {
                e = e.originalException;
                if (e instanceof BaseWrappedException && isPresent(e.originalException)) {
                    stack = e.originalStack;
                }
            }
            return stack;
        };
        return ExceptionHandler;
    }());
    var BaseException = (function (_super) {
        __extends(BaseException, _super);
        function BaseException(message) {
            if (message === void 0) { message = "--"; }
            _super.call(this, message);
            this.message = message;
            this.stack = (new Error(message)).stack;
        }
        BaseException.prototype.toString = function () { return this.message; };
        return BaseException;
    }(Error));
    /**
     * Wraps an exception and provides additional context or information.
     */
    var WrappedException = (function (_super) {
        __extends(WrappedException, _super);
        function WrappedException(_wrapperMessage, _originalException, _originalStack, _context) {
            _super.call(this, _wrapperMessage);
            this._wrapperMessage = _wrapperMessage;
            this._originalException = _originalException;
            this._originalStack = _originalStack;
            this._context = _context;
            this._wrapperStack = (new Error(_wrapperMessage)).stack;
        }
        Object.defineProperty(WrappedException.prototype, "wrapperMessage", {
            get: function () { return this._wrapperMessage; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WrappedException.prototype, "wrapperStack", {
            get: function () { return this._wrapperStack; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WrappedException.prototype, "originalException", {
            get: function () { return this._originalException; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WrappedException.prototype, "originalStack", {
            get: function () { return this._originalStack; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WrappedException.prototype, "context", {
            get: function () { return this._context; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WrappedException.prototype, "message", {
            get: function () { return ExceptionHandler.exceptionToString(this); },
            enumerable: true,
            configurable: true
        });
        WrappedException.prototype.toString = function () { return this.message; };
        return WrappedException;
    }(BaseWrappedException));
    function unimplemented() {
        throw new BaseException('unimplemented');
    }
    var _THROW_IF_NOT_FOUND = new Object();
    var THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
    var Injector = (function () {
        function Injector() {
        }
        /**
         * Retrieves an instance from the injector based on the provided token.
         * If not found:
         * - Throws {@link NoProviderError} if no `notFoundValue` that is not equal to
         * Injector.THROW_IF_NOT_FOUND is given
         * - Returns the `notFoundValue` otherwise
         *
         * ### Example ([live demo](http://plnkr.co/edit/HeXSHg?p=preview))
         *
         * ```typescript
         * var injector = ReflectiveInjector.resolveAndCreate([
         *   provide("validToken", {useValue: "Value"})
         * ]);
         * expect(injector.get("validToken")).toEqual("Value");
         * expect(() => injector.get("invalidToken")).toThrowError();
         * ```
         *
         * `Injector` returns itself when given `Injector` as a token.
         *
         * ```typescript
         * var injector = ReflectiveInjector.resolveAndCreate([]);
         * expect(injector.get(Injector)).toBe(injector);
         * ```
         */
        Injector.prototype.get = function (token, notFoundValue) { return unimplemented(); };
        return Injector;
    }());
    Injector.THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
    /**
     * Provides read-only access to reflection data about symbols. Used internally by Angular
     * to power dependency injection and compilation.
     */
    var ReflectorReader = (function () {
        function ReflectorReader() {
        }
        return ReflectorReader;
    }());
    /**
     * Provides access to reflection data about symbols. Used internally by Angular
     * to power dependency injection and compilation.
     */
    var Reflector = (function (_super) {
        __extends(Reflector, _super);
        function Reflector(reflectionCapabilities) {
            _super.call(this);
            /** @internal */
            this._injectableInfo = new Map$1();
            /** @internal */
            this._getters = new Map$1();
            /** @internal */
            this._setters = new Map$1();
            /** @internal */
            this._methods = new Map$1();
            this._usedKeys = null;
            this.reflectionCapabilities = reflectionCapabilities;
        }
        Reflector.prototype.updateCapabilities = function (caps) { this.reflectionCapabilities = caps; };
        Reflector.prototype.isReflectionEnabled = function () { return this.reflectionCapabilities.isReflectionEnabled(); };
        /**
         * Causes `this` reflector to track keys used to access
         * {@link ReflectionInfo} objects.
         */
        Reflector.prototype.trackUsage = function () { this._usedKeys = new Set$1(); };
        /**
         * Lists types for which reflection information was not requested since
         * {@link #trackUsage} was called. This list could later be audited as
         * potential dead code.
         */
        Reflector.prototype.listUnusedKeys = function () {
            var _this = this;
            if (this._usedKeys == null) {
                throw new BaseException('Usage tracking is disabled');
            }
            var allTypes = MapWrapper.keys(this._injectableInfo);
            return allTypes.filter(function (key) { return !SetWrapper.has(_this._usedKeys, key); });
        };
        Reflector.prototype.registerFunction = function (func, funcInfo) {
            this._injectableInfo.set(func, funcInfo);
        };
        Reflector.prototype.registerType = function (type, typeInfo) {
            this._injectableInfo.set(type, typeInfo);
        };
        Reflector.prototype.registerGetters = function (getters) { _mergeMaps(this._getters, getters); };
        Reflector.prototype.registerSetters = function (setters) { _mergeMaps(this._setters, setters); };
        Reflector.prototype.registerMethods = function (methods) { _mergeMaps(this._methods, methods); };
        Reflector.prototype.factory = function (type) {
            if (this._containsReflectionInfo(type)) {
                var res = this._getReflectionInfo(type).factory;
                return isPresent(res) ? res : null;
            }
            else {
                return this.reflectionCapabilities.factory(type);
            }
        };
        Reflector.prototype.parameters = function (typeOrFunc) {
            if (this._injectableInfo.has(typeOrFunc)) {
                var res = this._getReflectionInfo(typeOrFunc).parameters;
                return isPresent(res) ? res : [];
            }
            else {
                return this.reflectionCapabilities.parameters(typeOrFunc);
            }
        };
        Reflector.prototype.annotations = function (typeOrFunc) {
            if (this._injectableInfo.has(typeOrFunc)) {
                var res = this._getReflectionInfo(typeOrFunc).annotations;
                return isPresent(res) ? res : [];
            }
            else {
                return this.reflectionCapabilities.annotations(typeOrFunc);
            }
        };
        Reflector.prototype.propMetadata = function (typeOrFunc) {
            if (this._injectableInfo.has(typeOrFunc)) {
                var res = this._getReflectionInfo(typeOrFunc).propMetadata;
                return isPresent(res) ? res : {};
            }
            else {
                return this.reflectionCapabilities.propMetadata(typeOrFunc);
            }
        };
        Reflector.prototype.interfaces = function (type) {
            if (this._injectableInfo.has(type)) {
                var res = this._getReflectionInfo(type).interfaces;
                return isPresent(res) ? res : [];
            }
            else {
                return this.reflectionCapabilities.interfaces(type);
            }
        };
        Reflector.prototype.hasLifecycleHook = function (type, lcInterface, lcProperty) {
            var interfaces = this.interfaces(type);
            if (interfaces.indexOf(lcInterface) !== -1) {
                return true;
            }
            else {
                return this.reflectionCapabilities.hasLifecycleHook(type, lcInterface, lcProperty);
            }
        };
        Reflector.prototype.getter = function (name) {
            if (this._getters.has(name)) {
                return this._getters.get(name);
            }
            else {
                return this.reflectionCapabilities.getter(name);
            }
        };
        Reflector.prototype.setter = function (name) {
            if (this._setters.has(name)) {
                return this._setters.get(name);
            }
            else {
                return this.reflectionCapabilities.setter(name);
            }
        };
        Reflector.prototype.method = function (name) {
            if (this._methods.has(name)) {
                return this._methods.get(name);
            }
            else {
                return this.reflectionCapabilities.method(name);
            }
        };
        /** @internal */
        Reflector.prototype._getReflectionInfo = function (typeOrFunc) {
            if (isPresent(this._usedKeys)) {
                this._usedKeys.add(typeOrFunc);
            }
            return this._injectableInfo.get(typeOrFunc);
        };
        /** @internal */
        Reflector.prototype._containsReflectionInfo = function (typeOrFunc) { return this._injectableInfo.has(typeOrFunc); };
        Reflector.prototype.importUri = function (type) { return this.reflectionCapabilities.importUri(type); };
        return Reflector;
    }(ReflectorReader));
    function _mergeMaps(target, config) {
        StringMapWrapper.forEach(config, function (v, k) { return target.set(k, v); });
    }
    var ReflectionCapabilities = (function () {
        function ReflectionCapabilities(reflect) {
            this._reflect = isPresent(reflect) ? reflect : global$1.Reflect;
        }
        ReflectionCapabilities.prototype.isReflectionEnabled = function () { return true; };
        ReflectionCapabilities.prototype.factory = function (t) {
            switch (t.length) {
                case 0:
                    return function () { return new t(); };
                case 1:
                    return function (a1) { return new t(a1); };
                case 2:
                    return function (a1, a2) { return new t(a1, a2); };
                case 3:
                    return function (a1, a2, a3) { return new t(a1, a2, a3); };
                case 4:
                    return function (a1, a2, a3, a4) { return new t(a1, a2, a3, a4); };
                case 5:
                    return function (a1, a2, a3, a4, a5) { return new t(a1, a2, a3, a4, a5); };
                case 6:
                    return function (a1, a2, a3, a4, a5, a6) { return new t(a1, a2, a3, a4, a5, a6); };
                case 7:
                    return function (a1, a2, a3, a4, a5, a6, a7) { return new t(a1, a2, a3, a4, a5, a6, a7); };
                case 8:
                    return function (a1, a2, a3, a4, a5, a6, a7, a8) { return new t(a1, a2, a3, a4, a5, a6, a7, a8); };
                case 9:
                    return function (a1, a2, a3, a4, a5, a6, a7, a8, a9) { return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9); };
                case 10:
                    return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) { return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10); };
                case 11:
                    return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) { return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11); };
                case 12:
                    return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) { return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12); };
                case 13:
                    return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) { return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13); };
                case 14:
                    return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14) { return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14); };
                case 15:
                    return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) { return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15); };
                case 16:
                    return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) { return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16); };
                case 17:
                    return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17) { return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17); };
                case 18:
                    return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18) { return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18); };
                case 19:
                    return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19) { return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19); };
                case 20:
                    return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20) { return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20); };
            }
            ;
            throw new Error("Cannot create a factory for '" + stringify(t) + "' because its constructor has more than 20 arguments");
        };
        /** @internal */
        ReflectionCapabilities.prototype._zipTypesAndAnnotations = function (paramTypes, paramAnnotations) {
            var result;
            if (typeof paramTypes === 'undefined') {
                result = new Array(paramAnnotations.length);
            }
            else {
                result = new Array(paramTypes.length);
            }
            for (var i = 0; i < result.length; i++) {
                // TS outputs Object for parameters without types, while Traceur omits
                // the annotations. For now we preserve the Traceur behavior to aid
                // migration, but this can be revisited.
                if (typeof paramTypes === 'undefined') {
                    result[i] = [];
                }
                else if (paramTypes[i] != Object) {
                    result[i] = [paramTypes[i]];
                }
                else {
                    result[i] = [];
                }
                if (isPresent(paramAnnotations) && isPresent(paramAnnotations[i])) {
                    result[i] = result[i].concat(paramAnnotations[i]);
                }
            }
            return result;
        };
        ReflectionCapabilities.prototype.parameters = function (typeOrFunc) {
            // Prefer the direct API.
            if (isPresent(typeOrFunc.parameters)) {
                return typeOrFunc.parameters;
            }
            // API of tsickle for lowering decorators to properties on the class.
            if (isPresent(typeOrFunc.ctorParameters)) {
                var ctorParameters = typeOrFunc.ctorParameters;
                var paramTypes_1 = ctorParameters.map(function (ctorParam) { return ctorParam && ctorParam.type; });
                var paramAnnotations_1 = ctorParameters.map(function (ctorParam) { return ctorParam && convertTsickleDecoratorIntoMetadata(ctorParam.decorators); });
                return this._zipTypesAndAnnotations(paramTypes_1, paramAnnotations_1);
            }
            // API for metadata created by invoking the decorators.
            if (isPresent(this._reflect) && isPresent(this._reflect.getMetadata)) {
                var paramAnnotations = this._reflect.getMetadata('parameters', typeOrFunc);
                var paramTypes = this._reflect.getMetadata('design:paramtypes', typeOrFunc);
                if (isPresent(paramTypes) || isPresent(paramAnnotations)) {
                    return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
                }
            }
            // The array has to be filled with `undefined` because holes would be skipped by `some`
            var parameters = new Array(typeOrFunc.length);
            parameters.fill(undefined);
            return parameters;
        };
        ReflectionCapabilities.prototype.annotations = function (typeOrFunc) {
            // Prefer the direct API.
            if (isPresent(typeOrFunc.annotations)) {
                var annotations = typeOrFunc.annotations;
                if (isFunction(annotations) && annotations.annotations) {
                    annotations = annotations.annotations;
                }
                return annotations;
            }
            // API of tsickle for lowering decorators to properties on the class.
            if (isPresent(typeOrFunc.decorators)) {
                return convertTsickleDecoratorIntoMetadata(typeOrFunc.decorators);
            }
            // API for metadata created by invoking the decorators.
            if (isPresent(this._reflect) && isPresent(this._reflect.getMetadata)) {
                var annotations = this._reflect.getMetadata('annotations', typeOrFunc);
                if (isPresent(annotations))
                    return annotations;
            }
            return [];
        };
        ReflectionCapabilities.prototype.propMetadata = function (typeOrFunc) {
            // Prefer the direct API.
            if (isPresent(typeOrFunc.propMetadata)) {
                var propMetadata = typeOrFunc.propMetadata;
                if (isFunction(propMetadata) && propMetadata.propMetadata) {
                    propMetadata = propMetadata.propMetadata;
                }
                return propMetadata;
            }
            // API of tsickle for lowering decorators to properties on the class.
            if (isPresent(typeOrFunc.propDecorators)) {
                var propDecorators_1 = typeOrFunc.propDecorators;
                var propMetadata_1 = {};
                Object.keys(propDecorators_1)
                    .forEach(function (prop) {
                    propMetadata_1[prop] = convertTsickleDecoratorIntoMetadata(propDecorators_1[prop]);
                });
                return propMetadata_1;
            }
            // API for metadata created by invoking the decorators.
            if (isPresent(this._reflect) && isPresent(this._reflect.getMetadata)) {
                var propMetadata = this._reflect.getMetadata('propMetadata', typeOrFunc);
                if (isPresent(propMetadata))
                    return propMetadata;
            }
            return {};
        };
        // Note: JavaScript does not support to query for interfaces during runtime.
        // However, we can't throw here as the reflector will always call this method
        // when asked for a lifecycle interface as this is what we check in Dart.
        ReflectionCapabilities.prototype.interfaces = function (type) { return []; };
        ReflectionCapabilities.prototype.hasLifecycleHook = function (type, lcInterface, lcProperty) {
            if (!(type instanceof Type))
                return false;
            var proto = type.prototype;
            return !!proto[lcProperty];
        };
        ReflectionCapabilities.prototype.getter = function (name) { return new Function('o', 'return o.' + name + ';'); };
        ReflectionCapabilities.prototype.setter = function (name) {
            return new Function('o', 'v', 'return o.' + name + ' = v;');
        };
        ReflectionCapabilities.prototype.method = function (name) {
            var functionBody = "if (!o." + name + ") throw new Error('\"" + name + "\" is undefined');\n        return o." + name + ".apply(o, args);";
            return new Function('o', 'args', functionBody);
        };
        // There is not a concept of import uri in Js, but this is useful in developing Dart applications.
        ReflectionCapabilities.prototype.importUri = function (type) {
            // StaticSymbol
            if (typeof type === 'object' && type['filePath']) {
                return type['filePath'];
            }
            // Runtime type
            return "./" + stringify(type);
        };
        return ReflectionCapabilities;
    }());
    function convertTsickleDecoratorIntoMetadata(decoratorInvocations) {
        if (!decoratorInvocations) {
            return [];
        }
        return decoratorInvocations.map(function (decoratorInvocation) {
            var decoratorType = decoratorInvocation.type;
            var annotationCls = decoratorType.annotationCls;
            var annotationArgs = decoratorInvocation.args ? decoratorInvocation.args : [];
            var annotation = Object.create(annotationCls.prototype);
            annotationCls.apply(annotation, annotationArgs);
            return annotation;
        });
    }
    /**
     * The {@link Reflector} used internally in Angular to access metadata
     * about symbols.
     */
    var reflector = new Reflector(new ReflectionCapabilities());
    /**
     * A unique object used for retrieving items from the {@link ReflectiveInjector}.
     *
     * Keys have:
     * - a system-wide unique `id`.
     * - a `token`.
     *
     * `Key` is used internally by {@link ReflectiveInjector} because its system-wide unique `id` allows
     * the
     * injector to store created objects in a more efficient way.
     *
     * `Key` should not be created directly. {@link ReflectiveInjector} creates keys automatically when
     * resolving
     * providers.
     */
    var ReflectiveKey = (function () {
        /**
         * Private
         */
        function ReflectiveKey(token, id) {
            this.token = token;
            this.id = id;
            if (isBlank(token)) {
                throw new BaseException('Token must be defined!');
            }
        }
        Object.defineProperty(ReflectiveKey.prototype, "displayName", {
            /**
             * Returns a stringified token.
             */
            get: function () { return stringify(this.token); },
            enumerable: true,
            configurable: true
        });
        /**
         * Retrieves a `Key` for a token.
         */
        ReflectiveKey.get = function (token) {
            return _globalKeyRegistry.get(resolveForwardRef(token));
        };
        Object.defineProperty(ReflectiveKey, "numberOfKeys", {
            /**
             * @returns the number of keys registered in the system.
             */
            get: function () { return _globalKeyRegistry.numberOfKeys; },
            enumerable: true,
            configurable: true
        });
        return ReflectiveKey;
    }());
    /**
     * @internal
     */
    var KeyRegistry = (function () {
        function KeyRegistry() {
            this._allKeys = new Map();
        }
        KeyRegistry.prototype.get = function (token) {
            if (token instanceof ReflectiveKey)
                return token;
            if (this._allKeys.has(token)) {
                return this._allKeys.get(token);
            }
            var newKey = new ReflectiveKey(token, ReflectiveKey.numberOfKeys);
            this._allKeys.set(token, newKey);
            return newKey;
        };
        Object.defineProperty(KeyRegistry.prototype, "numberOfKeys", {
            get: function () { return this._allKeys.size; },
            enumerable: true,
            configurable: true
        });
        return KeyRegistry;
    }());
    var _globalKeyRegistry = new KeyRegistry();
    function findFirstClosedCycle(keys) {
        var res = [];
        for (var i = 0; i < keys.length; ++i) {
            if (ListWrapper.contains(res, keys[i])) {
                res.push(keys[i]);
                return res;
            }
            else {
                res.push(keys[i]);
            }
        }
        return res;
    }
    function constructResolvingPath(keys) {
        if (keys.length > 1) {
            var reversed = findFirstClosedCycle(ListWrapper.reversed(keys));
            var tokenStrs = reversed.map(function (k) { return stringify(k.token); });
            return " (" + tokenStrs.join(' -> ') + ")";
        }
        else {
            return "";
        }
    }
    /**
     * Base class for all errors arising from misconfigured providers.
     */
    var AbstractProviderError = (function (_super) {
        __extends(AbstractProviderError, _super);
        function AbstractProviderError(injector, key, constructResolvingMessage) {
            _super.call(this, "DI Exception");
            this.keys = [key];
            this.injectors = [injector];
            this.constructResolvingMessage = constructResolvingMessage;
            this.message = this.constructResolvingMessage(this.keys);
        }
        AbstractProviderError.prototype.addKey = function (injector, key) {
            this.injectors.push(injector);
            this.keys.push(key);
            this.message = this.constructResolvingMessage(this.keys);
        };
        Object.defineProperty(AbstractProviderError.prototype, "context", {
            get: function () { return this.injectors[this.injectors.length - 1].debugContext(); },
            enumerable: true,
            configurable: true
        });
        return AbstractProviderError;
    }(BaseException));
    /**
     * Thrown when trying to retrieve a dependency by `Key` from {@link Injector}, but the
     * {@link Injector} does not have a {@link Provider} for {@link Key}.
     *
     * ### Example ([live demo](http://plnkr.co/edit/vq8D3FRB9aGbnWJqtEPE?p=preview))
     *
     * ```typescript
     * class A {
     *   constructor(b:B) {}
     * }
     *
     * expect(() => Injector.resolveAndCreate([A])).toThrowError();
     * ```
     */
    var NoProviderError = (function (_super) {
        __extends(NoProviderError, _super);
        function NoProviderError(injector, key) {
            _super.call(this, injector, key, function (keys) {
                var first = stringify(ListWrapper.first(keys).token);
                return "No provider for " + first + "!" + constructResolvingPath(keys);
            });
        }
        return NoProviderError;
    }(AbstractProviderError));
    /**
     * Thrown when dependencies form a cycle.
     *
     * ### Example ([live demo](http://plnkr.co/edit/wYQdNos0Tzql3ei1EV9j?p=info))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide("one", {useFactory: (two) => "two", deps: [[new Inject("two")]]}),
     *   provide("two", {useFactory: (one) => "one", deps: [[new Inject("one")]]})
     * ]);
     *
     * expect(() => injector.get("one")).toThrowError();
     * ```
     *
     * Retrieving `A` or `B` throws a `CyclicDependencyError` as the graph above cannot be constructed.
     */
    var CyclicDependencyError = (function (_super) {
        __extends(CyclicDependencyError, _super);
        function CyclicDependencyError(injector, key) {
            _super.call(this, injector, key, function (keys) {
                return "Cannot instantiate cyclic dependency!" + constructResolvingPath(keys);
            });
        }
        return CyclicDependencyError;
    }(AbstractProviderError));
    /**
     * Thrown when a constructing type returns with an Error.
     *
     * The `InstantiationError` class contains the original error plus the dependency graph which caused
     * this object to be instantiated.
     *
     * ### Example ([live demo](http://plnkr.co/edit/7aWYdcqTQsP0eNqEdUAf?p=preview))
     *
     * ```typescript
     * class A {
     *   constructor() {
     *     throw new Error('message');
     *   }
     * }
     *
     * var injector = Injector.resolveAndCreate([A]);
  
     * try {
     *   injector.get(A);
     * } catch (e) {
     *   expect(e instanceof InstantiationError).toBe(true);
     *   expect(e.originalException.message).toEqual("message");
     *   expect(e.originalStack).toBeDefined();
     * }
     * ```
     */
    var InstantiationError = (function (_super) {
        __extends(InstantiationError, _super);
        function InstantiationError(injector, originalException, originalStack, key) {
            _super.call(this, "DI Exception", originalException, originalStack, null);
            this.keys = [key];
            this.injectors = [injector];
        }
        InstantiationError.prototype.addKey = function (injector, key) {
            this.injectors.push(injector);
            this.keys.push(key);
        };
        Object.defineProperty(InstantiationError.prototype, "wrapperMessage", {
            get: function () {
                var first = stringify(ListWrapper.first(this.keys).token);
                return "Error during instantiation of " + first + "!" + constructResolvingPath(this.keys) + ".";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InstantiationError.prototype, "causeKey", {
            get: function () { return this.keys[0]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InstantiationError.prototype, "context", {
            get: function () { return this.injectors[this.injectors.length - 1].debugContext(); },
            enumerable: true,
            configurable: true
        });
        return InstantiationError;
    }(WrappedException));
    /**
     * Thrown when an object other then {@link Provider} (or `Type`) is passed to {@link Injector}
     * creation.
     *
     * ### Example ([live demo](http://plnkr.co/edit/YatCFbPAMCL0JSSQ4mvH?p=preview))
     *
     * ```typescript
     * expect(() => Injector.resolveAndCreate(["not a type"])).toThrowError();
     * ```
     */
    var InvalidProviderError = (function (_super) {
        __extends(InvalidProviderError, _super);
        function InvalidProviderError(provider) {
            _super.call(this, "Invalid provider - only instances of Provider and Type are allowed, got: " +
                provider.toString());
        }
        return InvalidProviderError;
    }(BaseException));
    /**
     * Thrown when the class has no annotation information.
     *
     * Lack of annotation information prevents the {@link Injector} from determining which dependencies
     * need to be injected into the constructor.
     *
     * ### Example ([live demo](http://plnkr.co/edit/rHnZtlNS7vJOPQ6pcVkm?p=preview))
     *
     * ```typescript
     * class A {
     *   constructor(b) {}
     * }
     *
     * expect(() => Injector.resolveAndCreate([A])).toThrowError();
     * ```
     *
     * This error is also thrown when the class not marked with {@link Injectable} has parameter types.
     *
     * ```typescript
     * class B {}
     *
     * class A {
     *   constructor(b:B) {} // no information about the parameter types of A is available at runtime.
     * }
     *
     * expect(() => Injector.resolveAndCreate([A,B])).toThrowError();
     * ```
     */
    var NoAnnotationError = (function (_super) {
        __extends(NoAnnotationError, _super);
        function NoAnnotationError(typeOrFunc, params) {
            _super.call(this, NoAnnotationError._genMessage(typeOrFunc, params));
        }
        NoAnnotationError._genMessage = function (typeOrFunc, params) {
            var signature = [];
            for (var i = 0, ii = params.length; i < ii; i++) {
                var parameter = params[i];
                if (isBlank(parameter) || parameter.length == 0) {
                    signature.push('?');
                }
                else {
                    signature.push(parameter.map(stringify).join(' '));
                }
            }
            return "Cannot resolve all parameters for '" + stringify(typeOrFunc) + "'(" +
                signature.join(', ') + "). " +
                "Make sure that all the parameters are decorated with Inject or have valid type annotations and that '" +
                stringify(typeOrFunc) + "' is decorated with Injectable.";
        };
        return NoAnnotationError;
    }(BaseException));
    /**
     * Thrown when getting an object by index.
     *
     * ### Example ([live demo](http://plnkr.co/edit/bRs0SX2OTQiJzqvjgl8P?p=preview))
     *
     * ```typescript
     * class A {}
     *
     * var injector = Injector.resolveAndCreate([A]);
     *
     * expect(() => injector.getAt(100)).toThrowError();
     * ```
     */
    var OutOfBoundsError = (function (_super) {
        __extends(OutOfBoundsError, _super);
        function OutOfBoundsError(index) {
            _super.call(this, "Index " + index + " is out-of-bounds.");
        }
        return OutOfBoundsError;
    }(BaseException));
    // TODO: add a working example after alpha38 is released
    /**
     * Thrown when a multi provider and a regular provider are bound to the same token.
     *
     * ### Example
     *
     * ```typescript
     * expect(() => Injector.resolveAndCreate([
     *   new Provider("Strings", {useValue: "string1", multi: true}),
     *   new Provider("Strings", {useValue: "string2", multi: false})
     * ])).toThrowError();
     * ```
     */
    var MixingMultiProvidersWithRegularProvidersError = (function (_super) {
        __extends(MixingMultiProvidersWithRegularProvidersError, _super);
        function MixingMultiProvidersWithRegularProvidersError(provider1, provider2) {
            _super.call(this, "Cannot mix multi providers and regular providers, got: " + provider1.toString() + " " +
                provider2.toString());
        }
        return MixingMultiProvidersWithRegularProvidersError;
    }(BaseException));
    /**
     * Describes how the {@link Injector} should instantiate a given token.
     *
     * See {@link provide}.
     *
     * ### Example ([live demo](http://plnkr.co/edit/GNAyj6K6PfYg2NBzgwZ5?p%3Dpreview&p=preview))
     *
     * ```javascript
     * var injector = Injector.resolveAndCreate([
     *   new Provider("message", { useValue: 'Hello' })
     * ]);
     *
     * expect(injector.get("message")).toEqual('Hello');
     * ```
     * @ts2dart_const
     */
    var Provider = (function () {
        function Provider(token, _a) {
            var useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps, multi = _a.multi;
            this.token = token;
            this.useClass = useClass;
            this.useValue = useValue;
            this.useExisting = useExisting;
            this.useFactory = useFactory;
            this.dependencies = deps;
            this._multi = multi;
        }
        Object.defineProperty(Provider.prototype, "multi", {
            // TODO: Provide a full working example after alpha38 is released.
            /**
             * Creates multiple providers matching the same token (a multi-provider).
             *
             * Multi-providers are used for creating pluggable service, where the system comes
             * with some default providers, and the user can register additional providers.
             * The combination of the default providers and the additional providers will be
             * used to drive the behavior of the system.
             *
             * ### Example
             *
             * ```typescript
             * var injector = Injector.resolveAndCreate([
             *   new Provider("Strings", { useValue: "String1", multi: true}),
             *   new Provider("Strings", { useValue: "String2", multi: true})
             * ]);
             *
             * expect(injector.get("Strings")).toEqual(["String1", "String2"]);
             * ```
             *
             * Multi-providers and regular providers cannot be mixed. The following
             * will throw an exception:
             *
             * ```typescript
             * var injector = Injector.resolveAndCreate([
             *   new Provider("Strings", { useValue: "String1", multi: true }),
             *   new Provider("Strings", { useValue: "String2"})
             * ]);
             * ```
             */
            get: function () { return normalizeBool(this._multi); },
            enumerable: true,
            configurable: true
        });
        return Provider;
    }());
    /**
     * Helper class for the {@link bind} function.
     */
    var ProviderBuilder = (function () {
        function ProviderBuilder(token) {
            this.token = token;
        }
        /**
         * Binds a DI token to a class.
         *
         * ### Example ([live demo](http://plnkr.co/edit/ZpBCSYqv6e2ud5KXLdxQ?p=preview))
         *
         * Because `toAlias` and `toClass` are often confused, the example contains
         * both use cases for easy comparison.
         *
         * ```typescript
         * class Vehicle {}
         *
         * class Car extends Vehicle {}
         *
         * var injectorClass = Injector.resolveAndCreate([
         *   Car,
         *   provide(Vehicle, {useClass: Car})
         * ]);
         * var injectorAlias = Injector.resolveAndCreate([
         *   Car,
         *   provide(Vehicle, {useExisting: Car})
         * ]);
         *
         * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
         * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
         *
         * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
         * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
         * ```
         */
        ProviderBuilder.prototype.toClass = function (type) {
            if (!isType(type)) {
                throw new BaseException("Trying to create a class provider but \"" + stringify(type) + "\" is not a class!");
            }
            return new Provider(this.token, { useClass: type });
        };
        /**
         * Binds a DI token to a value.
         *
         * ### Example ([live demo](http://plnkr.co/edit/G024PFHmDL0cJFgfZK8O?p=preview))
         *
         * ```typescript
         * var injector = Injector.resolveAndCreate([
         *   provide('message', {useValue: 'Hello'})
         * ]);
         *
         * expect(injector.get('message')).toEqual('Hello');
         * ```
         */
        ProviderBuilder.prototype.toValue = function (value) { return new Provider(this.token, { useValue: value }); };
        /**
         * Binds a DI token to an existing token.
         *
         * Angular will return the same instance as if the provided token was used. (This is
         * in contrast to `useClass` where a separate instance of `useClass` will be returned.)
         *
         * ### Example ([live demo](http://plnkr.co/edit/uBaoF2pN5cfc5AfZapNw?p=preview))
         *
         * Because `toAlias` and `toClass` are often confused, the example contains
         * both use cases for easy comparison.
         *
         * ```typescript
         * class Vehicle {}
         *
         * class Car extends Vehicle {}
         *
         * var injectorAlias = Injector.resolveAndCreate([
         *   Car,
         *   provide(Vehicle, {useExisting: Car})
         * ]);
         * var injectorClass = Injector.resolveAndCreate([
         *   Car,
         *   provide(Vehicle, {useClass: Car})
         * ]);
         *
         * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
         * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
         *
         * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
         * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
         * ```
         */
        ProviderBuilder.prototype.toAlias = function (aliasToken) {
            if (isBlank(aliasToken)) {
                throw new BaseException("Can not alias " + stringify(this.token) + " to a blank value!");
            }
            return new Provider(this.token, { useExisting: aliasToken });
        };
        /**
         * Binds a DI token to a function which computes the value.
         *
         * ### Example ([live demo](http://plnkr.co/edit/OejNIfTT3zb1iBxaIYOb?p=preview))
         *
         * ```typescript
         * var injector = Injector.resolveAndCreate([
         *   provide(Number, {useFactory: () => { return 1+2; }}),
         *   provide(String, {useFactory: (v) => { return "Value: " + v; }, deps: [Number]})
         * ]);
         *
         * expect(injector.get(Number)).toEqual(3);
         * expect(injector.get(String)).toEqual('Value: 3');
         * ```
         */
        ProviderBuilder.prototype.toFactory = function (factory, dependencies) {
            if (!isFunction(factory)) {
                throw new BaseException("Trying to create a factory provider but \"" + stringify(factory) + "\" is not a function!");
            }
            return new Provider(this.token, { useFactory: factory, deps: dependencies });
        };
        return ProviderBuilder;
    }());
    /**
     * Creates a {@link Provider}.
     *
     * See {@link Provider} for more details.
     *
     * <!-- TODO: improve the docs -->
     */
    function provide(token, _a) {
        var useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps, multi = _a.multi;
        return new Provider(token, {
            useClass: useClass,
            useValue: useValue,
            useExisting: useExisting,
            useFactory: useFactory,
            deps: deps,
            multi: multi
        });
    }
    function isProviderLiteral(obj) {
        return obj && typeof obj == 'object' && obj.provide;
    }
    function createProvider(obj) {
        return new Provider(obj.provide, obj);
    }
    /**
     * `Dependency` is used by the framework to extend DI.
     * This is internal to Angular and should not be used directly.
     */
    var ReflectiveDependency = (function () {
        function ReflectiveDependency(key, optional, lowerBoundVisibility, upperBoundVisibility, properties) {
            this.key = key;
            this.optional = optional;
            this.lowerBoundVisibility = lowerBoundVisibility;
            this.upperBoundVisibility = upperBoundVisibility;
            this.properties = properties;
        }
        ReflectiveDependency.fromKey = function (key) {
            return new ReflectiveDependency(key, false, null, null, []);
        };
        return ReflectiveDependency;
    }());
    var _EMPTY_LIST = [];
    var ResolvedReflectiveProvider_ = (function () {
        function ResolvedReflectiveProvider_(key, resolvedFactories, multiProvider) {
            this.key = key;
            this.resolvedFactories = resolvedFactories;
            this.multiProvider = multiProvider;
        }
        Object.defineProperty(ResolvedReflectiveProvider_.prototype, "resolvedFactory", {
            get: function () { return this.resolvedFactories[0]; },
            enumerable: true,
            configurable: true
        });
        return ResolvedReflectiveProvider_;
    }());
    /**
     * An internal resolved representation of a factory function created by resolving {@link Provider}.
     */
    var ResolvedReflectiveFactory = (function () {
        function ResolvedReflectiveFactory(
            /**
             * Factory function which can return an instance of an object represented by a key.
             */
            factory, 
            /**
             * Arguments (dependencies) to the `factory` function.
             */
            dependencies) {
            this.factory = factory;
            this.dependencies = dependencies;
        }
        return ResolvedReflectiveFactory;
    }());
    /**
     * Resolve a single provider.
     */
    function resolveReflectiveFactory(provider) {
        var factoryFn;
        var resolvedDeps;
        if (isPresent(provider.useClass)) {
            var useClass = resolveForwardRef(provider.useClass);
            factoryFn = reflector.factory(useClass);
            resolvedDeps = _dependenciesFor(useClass);
        }
        else if (isPresent(provider.useExisting)) {
            factoryFn = function (aliasInstance) { return aliasInstance; };
            resolvedDeps = [ReflectiveDependency.fromKey(ReflectiveKey.get(provider.useExisting))];
        }
        else if (isPresent(provider.useFactory)) {
            factoryFn = provider.useFactory;
            resolvedDeps = constructDependencies(provider.useFactory, provider.dependencies);
        }
        else {
            factoryFn = function () { return provider.useValue; };
            resolvedDeps = _EMPTY_LIST;
        }
        return new ResolvedReflectiveFactory(factoryFn, resolvedDeps);
    }
    /**
     * Converts the {@link Provider} into {@link ResolvedProvider}.
     *
     * {@link Injector} internally only uses {@link ResolvedProvider}, {@link Provider} contains
     * convenience provider syntax.
     */
    function resolveReflectiveProvider(provider) {
        return new ResolvedReflectiveProvider_(ReflectiveKey.get(provider.token), [resolveReflectiveFactory(provider)], provider.multi);
    }
    /**
     * Resolve a list of Providers.
     */
    function resolveReflectiveProviders(providers) {
        var normalized = _normalizeProviders(providers, []);
        var resolved = normalized.map(resolveReflectiveProvider);
        return MapWrapper.values(mergeResolvedReflectiveProviders(resolved, new Map()));
    }
    /**
     * Merges a list of ResolvedProviders into a list where
     * each key is contained exactly once and multi providers
     * have been merged.
     */
    function mergeResolvedReflectiveProviders(providers, normalizedProvidersMap) {
        for (var i = 0; i < providers.length; i++) {
            var provider = providers[i];
            var existing = normalizedProvidersMap.get(provider.key.id);
            if (isPresent(existing)) {
                if (provider.multiProvider !== existing.multiProvider) {
                    throw new MixingMultiProvidersWithRegularProvidersError(existing, provider);
                }
                if (provider.multiProvider) {
                    for (var j = 0; j < provider.resolvedFactories.length; j++) {
                        existing.resolvedFactories.push(provider.resolvedFactories[j]);
                    }
                }
                else {
                    normalizedProvidersMap.set(provider.key.id, provider);
                }
            }
            else {
                var resolvedProvider;
                if (provider.multiProvider) {
                    resolvedProvider = new ResolvedReflectiveProvider_(provider.key, ListWrapper.clone(provider.resolvedFactories), provider.multiProvider);
                }
                else {
                    resolvedProvider = provider;
                }
                normalizedProvidersMap.set(provider.key.id, resolvedProvider);
            }
        }
        return normalizedProvidersMap;
    }
    function _normalizeProviders(providers, res) {
        providers.forEach(function (b) {
            if (b instanceof Type) {
                res.push(provide(b, { useClass: b }));
            }
            else if (b instanceof Provider) {
                res.push(b);
            }
            else if (isProviderLiteral(b)) {
                res.push(createProvider(b));
            }
            else if (b instanceof Array) {
                _normalizeProviders(b, res);
            }
            else if (b instanceof ProviderBuilder) {
                throw new InvalidProviderError(b.token);
            }
            else {
                throw new InvalidProviderError(b);
            }
        });
        return res;
    }
    function constructDependencies(typeOrFunc, dependencies) {
        if (isBlank(dependencies)) {
            return _dependenciesFor(typeOrFunc);
        }
        else {
            var params = dependencies.map(function (t) { return [t]; });
            return dependencies.map(function (t) { return _extractToken(typeOrFunc, t, params); });
        }
    }
    function _dependenciesFor(typeOrFunc) {
        var params = reflector.parameters(typeOrFunc);
        if (isBlank(params))
            return [];
        if (params.some(isBlank)) {
            throw new NoAnnotationError(typeOrFunc, params);
        }
        return params.map(function (p) { return _extractToken(typeOrFunc, p, params); });
    }
    function _extractToken(typeOrFunc, metadata /*any[] | any*/, params) {
        var depProps = [];
        var token = null;
        var optional = false;
        if (!isArray(metadata)) {
            if (metadata instanceof InjectMetadata) {
                return _createDependency(metadata.token, optional, null, null, depProps);
            }
            else {
                return _createDependency(metadata, optional, null, null, depProps);
            }
        }
        var lowerBoundVisibility = null;
        var upperBoundVisibility = null;
        for (var i = 0; i < metadata.length; ++i) {
            var paramMetadata = metadata[i];
            if (paramMetadata instanceof Type) {
                token = paramMetadata;
            }
            else if (paramMetadata instanceof InjectMetadata) {
                token = paramMetadata.token;
            }
            else if (paramMetadata instanceof OptionalMetadata) {
                optional = true;
            }
            else if (paramMetadata instanceof SelfMetadata) {
                upperBoundVisibility = paramMetadata;
            }
            else if (paramMetadata instanceof HostMetadata) {
                upperBoundVisibility = paramMetadata;
            }
            else if (paramMetadata instanceof SkipSelfMetadata) {
                lowerBoundVisibility = paramMetadata;
            }
            else if (paramMetadata instanceof DependencyMetadata) {
                if (isPresent(paramMetadata.token)) {
                    token = paramMetadata.token;
                }
                depProps.push(paramMetadata);
            }
        }
        token = resolveForwardRef(token);
        if (isPresent(token)) {
            return _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps);
        }
        else {
            throw new NoAnnotationError(typeOrFunc, params);
        }
    }
    function _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps) {
        return new ReflectiveDependency(ReflectiveKey.get(token), optional, lowerBoundVisibility, upperBoundVisibility, depProps);
    }
    // avoid unused import when Type union types are erased
    // Threshold for the dynamic version
    var _MAX_CONSTRUCTION_COUNTER = 10;
    var UNDEFINED = new Object();
    var ReflectiveProtoInjectorInlineStrategy = (function () {
        function ReflectiveProtoInjectorInlineStrategy(protoEI, providers) {
            this.provider0 = null;
            this.provider1 = null;
            this.provider2 = null;
            this.provider3 = null;
            this.provider4 = null;
            this.provider5 = null;
            this.provider6 = null;
            this.provider7 = null;
            this.provider8 = null;
            this.provider9 = null;
            this.keyId0 = null;
            this.keyId1 = null;
            this.keyId2 = null;
            this.keyId3 = null;
            this.keyId4 = null;
            this.keyId5 = null;
            this.keyId6 = null;
            this.keyId7 = null;
            this.keyId8 = null;
            this.keyId9 = null;
            var length = providers.length;
            if (length > 0) {
                this.provider0 = providers[0];
                this.keyId0 = providers[0].key.id;
            }
            if (length > 1) {
                this.provider1 = providers[1];
                this.keyId1 = providers[1].key.id;
            }
            if (length > 2) {
                this.provider2 = providers[2];
                this.keyId2 = providers[2].key.id;
            }
            if (length > 3) {
                this.provider3 = providers[3];
                this.keyId3 = providers[3].key.id;
            }
            if (length > 4) {
                this.provider4 = providers[4];
                this.keyId4 = providers[4].key.id;
            }
            if (length > 5) {
                this.provider5 = providers[5];
                this.keyId5 = providers[5].key.id;
            }
            if (length > 6) {
                this.provider6 = providers[6];
                this.keyId6 = providers[6].key.id;
            }
            if (length > 7) {
                this.provider7 = providers[7];
                this.keyId7 = providers[7].key.id;
            }
            if (length > 8) {
                this.provider8 = providers[8];
                this.keyId8 = providers[8].key.id;
            }
            if (length > 9) {
                this.provider9 = providers[9];
                this.keyId9 = providers[9].key.id;
            }
        }
        ReflectiveProtoInjectorInlineStrategy.prototype.getProviderAtIndex = function (index) {
            if (index == 0)
                return this.provider0;
            if (index == 1)
                return this.provider1;
            if (index == 2)
                return this.provider2;
            if (index == 3)
                return this.provider3;
            if (index == 4)
                return this.provider4;
            if (index == 5)
                return this.provider5;
            if (index == 6)
                return this.provider6;
            if (index == 7)
                return this.provider7;
            if (index == 8)
                return this.provider8;
            if (index == 9)
                return this.provider9;
            throw new OutOfBoundsError(index);
        };
        ReflectiveProtoInjectorInlineStrategy.prototype.createInjectorStrategy = function (injector) {
            return new ReflectiveInjectorInlineStrategy(injector, this);
        };
        return ReflectiveProtoInjectorInlineStrategy;
    }());
    var ReflectiveProtoInjectorDynamicStrategy = (function () {
        function ReflectiveProtoInjectorDynamicStrategy(protoInj, providers) {
            this.providers = providers;
            var len = providers.length;
            this.keyIds = ListWrapper.createFixedSize(len);
            for (var i = 0; i < len; i++) {
                this.keyIds[i] = providers[i].key.id;
            }
        }
        ReflectiveProtoInjectorDynamicStrategy.prototype.getProviderAtIndex = function (index) {
            if (index < 0 || index >= this.providers.length) {
                throw new OutOfBoundsError(index);
            }
            return this.providers[index];
        };
        ReflectiveProtoInjectorDynamicStrategy.prototype.createInjectorStrategy = function (ei) {
            return new ReflectiveInjectorDynamicStrategy(this, ei);
        };
        return ReflectiveProtoInjectorDynamicStrategy;
    }());
    var ReflectiveProtoInjector = (function () {
        function ReflectiveProtoInjector(providers) {
            this.numberOfProviders = providers.length;
            this._strategy = providers.length > _MAX_CONSTRUCTION_COUNTER ?
                new ReflectiveProtoInjectorDynamicStrategy(this, providers) :
                new ReflectiveProtoInjectorInlineStrategy(this, providers);
        }
        ReflectiveProtoInjector.fromResolvedProviders = function (providers) {
            return new ReflectiveProtoInjector(providers);
        };
        ReflectiveProtoInjector.prototype.getProviderAtIndex = function (index) {
            return this._strategy.getProviderAtIndex(index);
        };
        return ReflectiveProtoInjector;
    }());
    var ReflectiveInjectorInlineStrategy = (function () {
        function ReflectiveInjectorInlineStrategy(injector, protoStrategy) {
            this.injector = injector;
            this.protoStrategy = protoStrategy;
            this.obj0 = UNDEFINED;
            this.obj1 = UNDEFINED;
            this.obj2 = UNDEFINED;
            this.obj3 = UNDEFINED;
            this.obj4 = UNDEFINED;
            this.obj5 = UNDEFINED;
            this.obj6 = UNDEFINED;
            this.obj7 = UNDEFINED;
            this.obj8 = UNDEFINED;
            this.obj9 = UNDEFINED;
        }
        ReflectiveInjectorInlineStrategy.prototype.resetConstructionCounter = function () { this.injector._constructionCounter = 0; };
        ReflectiveInjectorInlineStrategy.prototype.instantiateProvider = function (provider) {
            return this.injector._new(provider);
        };
        ReflectiveInjectorInlineStrategy.prototype.getObjByKeyId = function (keyId) {
            var p = this.protoStrategy;
            var inj = this.injector;
            if (p.keyId0 === keyId) {
                if (this.obj0 === UNDEFINED) {
                    this.obj0 = inj._new(p.provider0);
                }
                return this.obj0;
            }
            if (p.keyId1 === keyId) {
                if (this.obj1 === UNDEFINED) {
                    this.obj1 = inj._new(p.provider1);
                }
                return this.obj1;
            }
            if (p.keyId2 === keyId) {
                if (this.obj2 === UNDEFINED) {
                    this.obj2 = inj._new(p.provider2);
                }
                return this.obj2;
            }
            if (p.keyId3 === keyId) {
                if (this.obj3 === UNDEFINED) {
                    this.obj3 = inj._new(p.provider3);
                }
                return this.obj3;
            }
            if (p.keyId4 === keyId) {
                if (this.obj4 === UNDEFINED) {
                    this.obj4 = inj._new(p.provider4);
                }
                return this.obj4;
            }
            if (p.keyId5 === keyId) {
                if (this.obj5 === UNDEFINED) {
                    this.obj5 = inj._new(p.provider5);
                }
                return this.obj5;
            }
            if (p.keyId6 === keyId) {
                if (this.obj6 === UNDEFINED) {
                    this.obj6 = inj._new(p.provider6);
                }
                return this.obj6;
            }
            if (p.keyId7 === keyId) {
                if (this.obj7 === UNDEFINED) {
                    this.obj7 = inj._new(p.provider7);
                }
                return this.obj7;
            }
            if (p.keyId8 === keyId) {
                if (this.obj8 === UNDEFINED) {
                    this.obj8 = inj._new(p.provider8);
                }
                return this.obj8;
            }
            if (p.keyId9 === keyId) {
                if (this.obj9 === UNDEFINED) {
                    this.obj9 = inj._new(p.provider9);
                }
                return this.obj9;
            }
            return UNDEFINED;
        };
        ReflectiveInjectorInlineStrategy.prototype.getObjAtIndex = function (index) {
            if (index == 0)
                return this.obj0;
            if (index == 1)
                return this.obj1;
            if (index == 2)
                return this.obj2;
            if (index == 3)
                return this.obj3;
            if (index == 4)
                return this.obj4;
            if (index == 5)
                return this.obj5;
            if (index == 6)
                return this.obj6;
            if (index == 7)
                return this.obj7;
            if (index == 8)
                return this.obj8;
            if (index == 9)
                return this.obj9;
            throw new OutOfBoundsError(index);
        };
        ReflectiveInjectorInlineStrategy.prototype.getMaxNumberOfObjects = function () { return _MAX_CONSTRUCTION_COUNTER; };
        return ReflectiveInjectorInlineStrategy;
    }());
    var ReflectiveInjectorDynamicStrategy = (function () {
        function ReflectiveInjectorDynamicStrategy(protoStrategy, injector) {
            this.protoStrategy = protoStrategy;
            this.injector = injector;
            this.objs = ListWrapper.createFixedSize(protoStrategy.providers.length);
            ListWrapper.fill(this.objs, UNDEFINED);
        }
        ReflectiveInjectorDynamicStrategy.prototype.resetConstructionCounter = function () { this.injector._constructionCounter = 0; };
        ReflectiveInjectorDynamicStrategy.prototype.instantiateProvider = function (provider) {
            return this.injector._new(provider);
        };
        ReflectiveInjectorDynamicStrategy.prototype.getObjByKeyId = function (keyId) {
            var p = this.protoStrategy;
            for (var i = 0; i < p.keyIds.length; i++) {
                if (p.keyIds[i] === keyId) {
                    if (this.objs[i] === UNDEFINED) {
                        this.objs[i] = this.injector._new(p.providers[i]);
                    }
                    return this.objs[i];
                }
            }
            return UNDEFINED;
        };
        ReflectiveInjectorDynamicStrategy.prototype.getObjAtIndex = function (index) {
            if (index < 0 || index >= this.objs.length) {
                throw new OutOfBoundsError(index);
            }
            return this.objs[index];
        };
        ReflectiveInjectorDynamicStrategy.prototype.getMaxNumberOfObjects = function () { return this.objs.length; };
        return ReflectiveInjectorDynamicStrategy;
    }());
    /**
     * A ReflectiveDependency injection container used for instantiating objects and resolving
     * dependencies.
     *
     * An `Injector` is a replacement for a `new` operator, which can automatically resolve the
     * constructor dependencies.
     *
     * In typical use, application code asks for the dependencies in the constructor and they are
     * resolved by the `Injector`.
     *
     * ### Example ([live demo](http://plnkr.co/edit/jzjec0?p=preview))
     *
     * The following example creates an `Injector` configured to create `Engine` and `Car`.
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var injector = ReflectiveInjector.resolveAndCreate([Car, Engine]);
     * var car = injector.get(Car);
     * expect(car instanceof Car).toBe(true);
     * expect(car.engine instanceof Engine).toBe(true);
     * ```
     *
     * Notice, we don't use the `new` operator because we explicitly want to have the `Injector`
     * resolve all of the object's dependencies automatically.
     */
    var ReflectiveInjector = (function () {
        function ReflectiveInjector() {
        }
        /**
         * Turns an array of provider definitions into an array of resolved providers.
         *
         * A resolution is a process of flattening multiple nested arrays and converting individual
         * providers into an array of {@link ResolvedReflectiveProvider}s.
         *
         * ### Example ([live demo](http://plnkr.co/edit/AiXTHi?p=preview))
         *
         * ```typescript
         * @Injectable()
         * class Engine {
         * }
         *
         * @Injectable()
         * class Car {
         *   constructor(public engine:Engine) {}
         * }
         *
         * var providers = ReflectiveInjector.resolve([Car, [[Engine]]]);
         *
         * expect(providers.length).toEqual(2);
         *
         * expect(providers[0] instanceof ResolvedReflectiveProvider).toBe(true);
         * expect(providers[0].key.displayName).toBe("Car");
         * expect(providers[0].dependencies.length).toEqual(1);
         * expect(providers[0].factory).toBeDefined();
         *
         * expect(providers[1].key.displayName).toBe("Engine");
         * });
         * ```
         *
         * See {@link ReflectiveInjector#fromResolvedProviders} for more info.
         */
        ReflectiveInjector.resolve = function (providers) {
            return resolveReflectiveProviders(providers);
        };
        /**
         * Resolves an array of providers and creates an injector from those providers.
         *
         * The passed-in providers can be an array of `Type`, {@link Provider},
         * or a recursive array of more providers.
         *
         * ### Example ([live demo](http://plnkr.co/edit/ePOccA?p=preview))
         *
         * ```typescript
         * @Injectable()
         * class Engine {
         * }
         *
         * @Injectable()
         * class Car {
         *   constructor(public engine:Engine) {}
         * }
         *
         * var injector = ReflectiveInjector.resolveAndCreate([Car, Engine]);
         * expect(injector.get(Car) instanceof Car).toBe(true);
         * ```
         *
         * This function is slower than the corresponding `fromResolvedProviders`
         * because it needs to resolve the passed-in providers first.
         * See {@link Injector#resolve} and {@link Injector#fromResolvedProviders}.
         */
        ReflectiveInjector.resolveAndCreate = function (providers, parent) {
            if (parent === void 0) { parent = null; }
            var ResolvedReflectiveProviders = ReflectiveInjector.resolve(providers);
            return ReflectiveInjector.fromResolvedProviders(ResolvedReflectiveProviders, parent);
        };
        /**
         * Creates an injector from previously resolved providers.
         *
         * This API is the recommended way to construct injectors in performance-sensitive parts.
         *
         * ### Example ([live demo](http://plnkr.co/edit/KrSMci?p=preview))
         *
         * ```typescript
         * @Injectable()
         * class Engine {
         * }
         *
         * @Injectable()
         * class Car {
         *   constructor(public engine:Engine) {}
         * }
         *
         * var providers = ReflectiveInjector.resolve([Car, Engine]);
         * var injector = ReflectiveInjector.fromResolvedProviders(providers);
         * expect(injector.get(Car) instanceof Car).toBe(true);
         * ```
         */
        ReflectiveInjector.fromResolvedProviders = function (providers, parent) {
            if (parent === void 0) { parent = null; }
            return new ReflectiveInjector_(ReflectiveProtoInjector.fromResolvedProviders(providers), parent);
        };
        /**
         * @deprecated
         */
        ReflectiveInjector.fromResolvedBindings = function (providers) {
            return ReflectiveInjector.fromResolvedProviders(providers);
        };
        Object.defineProperty(ReflectiveInjector.prototype, "parent", {
            /**
             * Parent of this injector.
             *
             * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
             * -->
             *
             * ### Example ([live demo](http://plnkr.co/edit/eosMGo?p=preview))
             *
             * ```typescript
             * var parent = ReflectiveInjector.resolveAndCreate([]);
             * var child = parent.resolveAndCreateChild([]);
             * expect(child.parent).toBe(parent);
             * ```
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        /**
         * @internal
         */
        ReflectiveInjector.prototype.debugContext = function () { return null; };
        /**
         * Resolves an array of providers and creates a child injector from those providers.
         *
         * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
         * -->
         *
         * The passed-in providers can be an array of `Type`, {@link Provider},
         * or a recursive array of more providers.
         *
         * ### Example ([live demo](http://plnkr.co/edit/opB3T4?p=preview))
         *
         * ```typescript
         * class ParentProvider {}
         * class ChildProvider {}
         *
         * var parent = ReflectiveInjector.resolveAndCreate([ParentProvider]);
         * var child = parent.resolveAndCreateChild([ChildProvider]);
         *
         * expect(child.get(ParentProvider) instanceof ParentProvider).toBe(true);
         * expect(child.get(ChildProvider) instanceof ChildProvider).toBe(true);
         * expect(child.get(ParentProvider)).toBe(parent.get(ParentProvider));
         * ```
         *
         * This function is slower than the corresponding `createChildFromResolved`
         * because it needs to resolve the passed-in providers first.
         * See {@link Injector#resolve} and {@link Injector#createChildFromResolved}.
         */
        ReflectiveInjector.prototype.resolveAndCreateChild = function (providers) {
            return unimplemented();
        };
        /**
         * Creates a child injector from previously resolved providers.
         *
         * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
         * -->
         *
         * This API is the recommended way to construct injectors in performance-sensitive parts.
         *
         * ### Example ([live demo](http://plnkr.co/edit/VhyfjN?p=preview))
         *
         * ```typescript
         * class ParentProvider {}
         * class ChildProvider {}
         *
         * var parentProviders = ReflectiveInjector.resolve([ParentProvider]);
         * var childProviders = ReflectiveInjector.resolve([ChildProvider]);
         *
         * var parent = ReflectiveInjector.fromResolvedProviders(parentProviders);
         * var child = parent.createChildFromResolved(childProviders);
         *
         * expect(child.get(ParentProvider) instanceof ParentProvider).toBe(true);
         * expect(child.get(ChildProvider) instanceof ChildProvider).toBe(true);
         * expect(child.get(ParentProvider)).toBe(parent.get(ParentProvider));
         * ```
         */
        ReflectiveInjector.prototype.createChildFromResolved = function (providers) {
            return unimplemented();
        };
        /**
         * Resolves a provider and instantiates an object in the context of the injector.
         *
         * The created object does not get cached by the injector.
         *
         * ### Example ([live demo](http://plnkr.co/edit/yvVXoB?p=preview))
         *
         * ```typescript
         * @Injectable()
         * class Engine {
         * }
         *
         * @Injectable()
         * class Car {
         *   constructor(public engine:Engine) {}
         * }
         *
         * var injector = ReflectiveInjector.resolveAndCreate([Engine]);
         *
         * var car = injector.resolveAndInstantiate(Car);
         * expect(car.engine).toBe(injector.get(Engine));
         * expect(car).not.toBe(injector.resolveAndInstantiate(Car));
         * ```
         */
        ReflectiveInjector.prototype.resolveAndInstantiate = function (provider) { return unimplemented(); };
        /**
         * Instantiates an object using a resolved provider in the context of the injector.
         *
         * The created object does not get cached by the injector.
         *
         * ### Example ([live demo](http://plnkr.co/edit/ptCImQ?p=preview))
         *
         * ```typescript
         * @Injectable()
         * class Engine {
         * }
         *
         * @Injectable()
         * class Car {
         *   constructor(public engine:Engine) {}
         * }
         *
         * var injector = ReflectiveInjector.resolveAndCreate([Engine]);
         * var carProvider = ReflectiveInjector.resolve([Car])[0];
         * var car = injector.instantiateResolved(carProvider);
         * expect(car.engine).toBe(injector.get(Engine));
         * expect(car).not.toBe(injector.instantiateResolved(carProvider));
         * ```
         */
        ReflectiveInjector.prototype.instantiateResolved = function (provider) { return unimplemented(); };
        return ReflectiveInjector;
    }());
    var ReflectiveInjector_ = (function () {
        /**
         * Private
         */
        function ReflectiveInjector_(_proto /* ProtoInjector */, _parent, _debugContext) {
            if (_parent === void 0) { _parent = null; }
            if (_debugContext === void 0) { _debugContext = null; }
            this._debugContext = _debugContext;
            /** @internal */
            this._constructionCounter = 0;
            this._proto = _proto;
            this._parent = _parent;
            this._strategy = _proto._strategy.createInjectorStrategy(this);
        }
        /**
         * @internal
         */
        ReflectiveInjector_.prototype.debugContext = function () { return this._debugContext(); };
        ReflectiveInjector_.prototype.get = function (token, notFoundValue) {
            if (notFoundValue === void 0) { notFoundValue = THROW_IF_NOT_FOUND; }
            return this._getByKey(ReflectiveKey.get(token), null, null, notFoundValue);
        };
        ReflectiveInjector_.prototype.getAt = function (index) { return this._strategy.getObjAtIndex(index); };
        Object.defineProperty(ReflectiveInjector_.prototype, "parent", {
            get: function () { return this._parent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReflectiveInjector_.prototype, "internalStrategy", {
            /**
             * @internal
             * Internal. Do not use.
             * We return `any` not to export the InjectorStrategy type.
             */
            get: function () { return this._strategy; },
            enumerable: true,
            configurable: true
        });
        ReflectiveInjector_.prototype.resolveAndCreateChild = function (providers) {
            var ResolvedReflectiveProviders = ReflectiveInjector.resolve(providers);
            return this.createChildFromResolved(ResolvedReflectiveProviders);
        };
        ReflectiveInjector_.prototype.createChildFromResolved = function (providers) {
            var proto = new ReflectiveProtoInjector(providers);
            var inj = new ReflectiveInjector_(proto);
            inj._parent = this;
            return inj;
        };
        ReflectiveInjector_.prototype.resolveAndInstantiate = function (provider) {
            return this.instantiateResolved(ReflectiveInjector.resolve([provider])[0]);
        };
        ReflectiveInjector_.prototype.instantiateResolved = function (provider) {
            return this._instantiateProvider(provider);
        };
        /** @internal */
        ReflectiveInjector_.prototype._new = function (provider) {
            if (this._constructionCounter++ > this._strategy.getMaxNumberOfObjects()) {
                throw new CyclicDependencyError(this, provider.key);
            }
            return this._instantiateProvider(provider);
        };
        ReflectiveInjector_.prototype._instantiateProvider = function (provider) {
            if (provider.multiProvider) {
                var res = ListWrapper.createFixedSize(provider.resolvedFactories.length);
                for (var i = 0; i < provider.resolvedFactories.length; ++i) {
                    res[i] = this._instantiate(provider, provider.resolvedFactories[i]);
                }
                return res;
            }
            else {
                return this._instantiate(provider, provider.resolvedFactories[0]);
            }
        };
        ReflectiveInjector_.prototype._instantiate = function (provider, ResolvedReflectiveFactory) {
            var factory = ResolvedReflectiveFactory.factory;
            var deps = ResolvedReflectiveFactory.dependencies;
            var length = deps.length;
            var d0;
            var d1;
            var d2;
            var d3;
            var d4;
            var d5;
            var d6;
            var d7;
            var d8;
            var d9;
            var d10;
            var d11;
            var d12;
            var d13;
            var d14;
            var d15;
            var d16;
            var d17;
            var d18;
            var d19;
            try {
                d0 = length > 0 ? this._getByReflectiveDependency(provider, deps[0]) : null;
                d1 = length > 1 ? this._getByReflectiveDependency(provider, deps[1]) : null;
                d2 = length > 2 ? this._getByReflectiveDependency(provider, deps[2]) : null;
                d3 = length > 3 ? this._getByReflectiveDependency(provider, deps[3]) : null;
                d4 = length > 4 ? this._getByReflectiveDependency(provider, deps[4]) : null;
                d5 = length > 5 ? this._getByReflectiveDependency(provider, deps[5]) : null;
                d6 = length > 6 ? this._getByReflectiveDependency(provider, deps[6]) : null;
                d7 = length > 7 ? this._getByReflectiveDependency(provider, deps[7]) : null;
                d8 = length > 8 ? this._getByReflectiveDependency(provider, deps[8]) : null;
                d9 = length > 9 ? this._getByReflectiveDependency(provider, deps[9]) : null;
                d10 = length > 10 ? this._getByReflectiveDependency(provider, deps[10]) : null;
                d11 = length > 11 ? this._getByReflectiveDependency(provider, deps[11]) : null;
                d12 = length > 12 ? this._getByReflectiveDependency(provider, deps[12]) : null;
                d13 = length > 13 ? this._getByReflectiveDependency(provider, deps[13]) : null;
                d14 = length > 14 ? this._getByReflectiveDependency(provider, deps[14]) : null;
                d15 = length > 15 ? this._getByReflectiveDependency(provider, deps[15]) : null;
                d16 = length > 16 ? this._getByReflectiveDependency(provider, deps[16]) : null;
                d17 = length > 17 ? this._getByReflectiveDependency(provider, deps[17]) : null;
                d18 = length > 18 ? this._getByReflectiveDependency(provider, deps[18]) : null;
                d19 = length > 19 ? this._getByReflectiveDependency(provider, deps[19]) : null;
            }
            catch (e) {
                if (e instanceof AbstractProviderError || e instanceof InstantiationError) {
                    e.addKey(this, provider.key);
                }
                throw e;
            }
            var obj;
            try {
                switch (length) {
                    case 0:
                        obj = factory();
                        break;
                    case 1:
                        obj = factory(d0);
                        break;
                    case 2:
                        obj = factory(d0, d1);
                        break;
                    case 3:
                        obj = factory(d0, d1, d2);
                        break;
                    case 4:
                        obj = factory(d0, d1, d2, d3);
                        break;
                    case 5:
                        obj = factory(d0, d1, d2, d3, d4);
                        break;
                    case 6:
                        obj = factory(d0, d1, d2, d3, d4, d5);
                        break;
                    case 7:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6);
                        break;
                    case 8:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7);
                        break;
                    case 9:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8);
                        break;
                    case 10:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9);
                        break;
                    case 11:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10);
                        break;
                    case 12:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11);
                        break;
                    case 13:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12);
                        break;
                    case 14:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13);
                        break;
                    case 15:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14);
                        break;
                    case 16:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15);
                        break;
                    case 17:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16);
                        break;
                    case 18:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17);
                        break;
                    case 19:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18);
                        break;
                    case 20:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19);
                        break;
                    default:
                        throw new BaseException("Cannot instantiate '" + provider.key.displayName + "' because it has more than 20 dependencies");
                }
            }
            catch (e) {
                throw new InstantiationError(this, e, e.stack, provider.key);
            }
            return obj;
        };
        ReflectiveInjector_.prototype._getByReflectiveDependency = function (provider, dep) {
            return this._getByKey(dep.key, dep.lowerBoundVisibility, dep.upperBoundVisibility, dep.optional ? null : THROW_IF_NOT_FOUND);
        };
        ReflectiveInjector_.prototype._getByKey = function (key, lowerBoundVisibility, upperBoundVisibility, notFoundValue) {
            if (key === INJECTOR_KEY) {
                return this;
            }
            if (upperBoundVisibility instanceof SelfMetadata) {
                return this._getByKeySelf(key, notFoundValue);
            }
            else {
                return this._getByKeyDefault(key, notFoundValue, lowerBoundVisibility);
            }
        };
        /** @internal */
        ReflectiveInjector_.prototype._throwOrNull = function (key, notFoundValue) {
            if (notFoundValue !== THROW_IF_NOT_FOUND) {
                return notFoundValue;
            }
            else {
                throw new NoProviderError(this, key);
            }
        };
        /** @internal */
        ReflectiveInjector_.prototype._getByKeySelf = function (key, notFoundValue) {
            var obj = this._strategy.getObjByKeyId(key.id);
            return (obj !== UNDEFINED) ? obj : this._throwOrNull(key, notFoundValue);
        };
        /** @internal */
        ReflectiveInjector_.prototype._getByKeyDefault = function (key, notFoundValue, lowerBoundVisibility) {
            var inj;
            if (lowerBoundVisibility instanceof SkipSelfMetadata) {
                inj = this._parent;
            }
            else {
                inj = this;
            }
            while (inj instanceof ReflectiveInjector_) {
                var inj_ = inj;
                var obj = inj_._strategy.getObjByKeyId(key.id);
                if (obj !== UNDEFINED)
                    return obj;
                inj = inj_._parent;
            }
            if (inj !== null) {
                return inj.get(key.token, notFoundValue);
            }
            else {
                return this._throwOrNull(key, notFoundValue);
            }
        };
        Object.defineProperty(ReflectiveInjector_.prototype, "displayName", {
            get: function () {
                return "ReflectiveInjector(providers: [" + _mapProviders(this, function (b) { return (" \"" + b.key.displayName + "\" "); }).join(", ") + "])";
            },
            enumerable: true,
            configurable: true
        });
        ReflectiveInjector_.prototype.toString = function () { return this.displayName; };
        return ReflectiveInjector_;
    }());
    var INJECTOR_KEY = ReflectiveKey.get(Injector);
    function _mapProviders(injector, fn) {
        var res = [];
        for (var i = 0; i < injector._proto.numberOfProviders; ++i) {
            res.push(fn(injector._proto.getProviderAtIndex(i)));
        }
        return res;
    }
    /**
     * Creates a token that can be used in a DI Provider.
     *
     * ### Example ([live demo](http://plnkr.co/edit/Ys9ezXpj2Mnoy3Uc8KBp?p=preview))
     *
     * ```typescript
     * var t = new OpaqueToken("value");
     *
     * var injector = Injector.resolveAndCreate([
     *   provide(t, {useValue: "bindingValue"})
     * ]);
     *
     * expect(injector.get(t)).toEqual("bindingValue");
     * ```
     *
     * Using an `OpaqueToken` is preferable to using strings as tokens because of possible collisions
     * caused by multiple providers using the same string as two different tokens.
     *
     * Using an `OpaqueToken` is preferable to using an `Object` as tokens because it provides better
     * error messages.
     * @ts2dart_const
     */
    var OpaqueToken = (function () {
        function OpaqueToken(_desc) {
            this._desc = _desc;
        }
        OpaqueToken.prototype.toString = function () { return "Token " + this._desc; };
        return OpaqueToken;
    }());
    var PromiseCompleter = (function () {
        function PromiseCompleter() {
            var _this = this;
            this.promise = new Promise(function (res, rej) {
                _this.resolve = res;
                _this.reject = rej;
            });
        }
        return PromiseCompleter;
    }());
    var PromiseWrapper = (function () {
        function PromiseWrapper() {
        }
        PromiseWrapper.resolve = function (obj) { return Promise.resolve(obj); };
        PromiseWrapper.reject = function (obj, _) { return Promise.reject(obj); };
        // Note: We can't rename this method into `catch`, as this is not a valid
        // method name in Dart.
        PromiseWrapper.catchError = function (promise, onError) {
            return promise.catch(onError);
        };
        PromiseWrapper.all = function (promises) {
            if (promises.length == 0)
                return Promise.resolve([]);
            return Promise.all(promises);
        };
        PromiseWrapper.then = function (promise, success, rejection) {
            return promise.then(success, rejection);
        };
        PromiseWrapper.wrap = function (computation) {
            return new Promise(function (res, rej) {
                try {
                    res(computation());
                }
                catch (e) {
                    rej(e);
                }
            });
        };
        PromiseWrapper.scheduleMicrotask = function (computation) {
            PromiseWrapper.then(PromiseWrapper.resolve(null), computation, function (_) { });
        };
        PromiseWrapper.isPromise = function (obj) { return obj instanceof Promise; };
        PromiseWrapper.completer = function () { return new PromiseCompleter(); };
        return PromiseWrapper;
    }());
    var objectTypes = {
        'boolean': false,
        'function': true,
        'object': true,
        'number': false,
        'string': false,
        'undefined': false
    };
    var root = (objectTypes[typeof self] && self) || (objectTypes[typeof window] && window);
    /* tslint:disable:no-unused-variable */
    var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
    var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
    var freeGlobal = objectTypes[typeof global] && global;
    if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
        root = freeGlobal;
    }
    var Symbol$1 = root.Symbol;
    var $$observable;
    if (typeof Symbol$1 === 'function') {
        if (Symbol$1.observable) {
            $$observable = Symbol$1.observable;
        }
        else {
            if (typeof Symbol$1.for === 'function') {
                $$observable = Symbol$1.for('observable');
            }
            else {
                $$observable = Symbol$1('observable');
            }
            Symbol$1.observable = $$observable;
        }
    }
    else {
        $$observable = '@@observable';
    }
    function isFunction$1(x) {
        return typeof x === 'function';
    }
    var isArray$1 = Array.isArray || (function (x) { return x && typeof x.length === 'number'; });
    function isObject(x) {
        return x != null && typeof x === 'object';
    }
    // typeof any so that it we don't have to cast when comparing a result to the error object
    var errorObject = { e: {} };
    var tryCatchTarget;
    function tryCatcher() {
        try {
            return tryCatchTarget.apply(this, arguments);
        }
        catch (e) {
            errorObject.e = e;
            return errorObject;
        }
    }
    function tryCatch(fn) {
        tryCatchTarget = fn;
        return tryCatcher;
    }
    ;
    /**
     * An error thrown when one or more errors have occurred during the
     * `unsubscribe` of a {@link Subscription}.
     */
    var UnsubscriptionError = (function (_super) {
        __extends(UnsubscriptionError, _super);
        function UnsubscriptionError(errors) {
            _super.call(this);
            this.errors = errors;
            this.name = 'UnsubscriptionError';
            this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return ((i + 1) + ") " + err.toString()); }).join('\n') : '';
        }
        return UnsubscriptionError;
    }(Error));
    /**
     * Represents a disposable resource, such as the execution of an Observable. A
     * Subscription has one important method, `unsubscribe`, that takes no argument
     * and just disposes the resource held by the subscription.
     *
     * Additionally, subscriptions may be grouped together through the `add()`
     * method, which will attach a child Subscription to the current Subscription.
     * When a Subscription is unsubscribed, all its children (and its grandchildren)
     * will be unsubscribed as well.
     *
     * @class Subscription
     */
    var Subscription = (function () {
        /**
         * @param {function(): void} [unsubscribe] A function describing how to
         * perform the disposal of resources when the `unsubscribe` method is called.
         */
        function Subscription(unsubscribe) {
            /**
             * A flag to indicate whether this Subscription has already been unsubscribed.
             * @type {boolean}
             */
            this.isUnsubscribed = false;
            if (unsubscribe) {
                this._unsubscribe = unsubscribe;
            }
        }
        /**
         * Disposes the resources held by the subscription. May, for instance, cancel
         * an ongoing Observable execution or cancel any other type of work that
         * started when the Subscription was created.
         * @return {void}
         */
        Subscription.prototype.unsubscribe = function () {
            var hasErrors = false;
            var errors;
            if (this.isUnsubscribed) {
                return;
            }
            this.isUnsubscribed = true;
            var _a = this, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
            this._subscriptions = null;
            if (isFunction$1(_unsubscribe)) {
                var trial = tryCatch(_unsubscribe).call(this);
                if (trial === errorObject) {
                    hasErrors = true;
                    (errors = errors || []).push(errorObject.e);
                }
            }
            if (isArray$1(_subscriptions)) {
                var index = -1;
                var len = _subscriptions.length;
                while (++index < len) {
                    var sub = _subscriptions[index];
                    if (isObject(sub)) {
                        var trial = tryCatch(sub.unsubscribe).call(sub);
                        if (trial === errorObject) {
                            hasErrors = true;
                            errors = errors || [];
                            var err = errorObject.e;
                            if (err instanceof UnsubscriptionError) {
                                errors = errors.concat(err.errors);
                            }
                            else {
                                errors.push(err);
                            }
                        }
                    }
                }
            }
            if (hasErrors) {
                throw new UnsubscriptionError(errors);
            }
        };
        /**
         * Adds a tear down to be called during the unsubscribe() of this
         * Subscription.
         *
         * If the tear down being added is a subscription that is already
         * unsubscribed, is the same reference `add` is being called on, or is
         * `Subscription.EMPTY`, it will not be added.
         *
         * If this subscription is already in an `isUnsubscribed` state, the passed
         * tear down logic will be executed immediately.
         *
         * @param {TeardownLogic} teardown The additional logic to execute on
         * teardown.
         * @return {Subscription} Returns the Subscription used or created to be
         * added to the inner subscriptions list. This Subscription can be used with
         * `remove()` to remove the passed teardown logic from the inner subscriptions
         * list.
         */
        Subscription.prototype.add = function (teardown) {
            if (!teardown || (teardown === this) || (teardown === Subscription.EMPTY)) {
                return;
            }
            var sub = teardown;
            switch (typeof teardown) {
                case 'function':
                    sub = new Subscription(teardown);
                case 'object':
                    if (sub.isUnsubscribed || typeof sub.unsubscribe !== 'function') {
                        break;
                    }
                    else if (this.isUnsubscribed) {
                        sub.unsubscribe();
                    }
                    else {
                        (this._subscriptions || (this._subscriptions = [])).push(sub);
                    }
                    break;
                default:
                    throw new Error('Unrecognized teardown ' + teardown + ' added to Subscription.');
            }
            return sub;
        };
        /**
         * Removes a Subscription from the internal list of subscriptions that will
         * unsubscribe during the unsubscribe process of this Subscription.
         * @param {Subscription} subscription The subscription to remove.
         * @return {void}
         */
        Subscription.prototype.remove = function (subscription) {
            // HACK: This might be redundant because of the logic in `add()`
            if (subscription == null || (subscription === this) || (subscription === Subscription.EMPTY)) {
                return;
            }
            var subscriptions = this._subscriptions;
            if (subscriptions) {
                var subscriptionIndex = subscriptions.indexOf(subscription);
                if (subscriptionIndex !== -1) {
                    subscriptions.splice(subscriptionIndex, 1);
                }
            }
        };
        return Subscription;
    }());
    Subscription.EMPTY = (function (empty) {
        empty.isUnsubscribed = true;
        return empty;
    }(new Subscription()));
    var Symbol$2 = root.Symbol;
    var $$rxSubscriber = (typeof Symbol$2 === 'function' && typeof Symbol$2.for === 'function') ?
        Symbol$2.for('rxSubscriber') : '@@rxSubscriber';
    var empty = {
        isUnsubscribed: true,
        next: function (value) { },
        error: function (err) { throw err; },
        complete: function () { }
    };
    /**
     * Implements the {@link Observer} interface and extends the
     * {@link Subscription} class. While the {@link Observer} is the public API for
     * consuming the values of an {@link Observable}, all Observers get converted to
     * a Subscriber, in order to provide Subscription-like capabilities such as
     * `unsubscribe`. Subscriber is a common type in RxJS, and crucial for
     * implementing operators, but it is rarely used as a public API.
     *
     * @class Subscriber<T>
     */
    var Subscriber = (function (_super) {
        __extends(Subscriber, _super);
        /**
         * @param {Observer|function(value: T): void} [destinationOrNext] A partially
         * defined Observer or a `next` callback function.
         * @param {function(e: ?any): void} [error] The `error` callback of an
         * Observer.
         * @param {function(): void} [complete] The `complete` callback of an
         * Observer.
         */
        function Subscriber(destinationOrNext, error, complete) {
            _super.call(this);
            this.syncErrorValue = null;
            this.syncErrorThrown = false;
            this.syncErrorThrowable = false;
            this.isStopped = false;
            switch (arguments.length) {
                case 0:
                    this.destination = empty;
                    break;
                case 1:
                    if (!destinationOrNext) {
                        this.destination = empty;
                        break;
                    }
                    if (typeof destinationOrNext === 'object') {
                        if (destinationOrNext instanceof Subscriber) {
                            this.destination = destinationOrNext;
                            this.destination.add(this);
                        }
                        else {
                            this.syncErrorThrowable = true;
                            this.destination = new SafeSubscriber(this, destinationOrNext);
                        }
                        break;
                    }
                default:
                    this.syncErrorThrowable = true;
                    this.destination = new SafeSubscriber(this, destinationOrNext, error, complete);
                    break;
            }
        }
        /**
         * A static factory for a Subscriber, given a (potentially partial) definition
         * of an Observer.
         * @param {function(x: ?T): void} [next] The `next` callback of an Observer.
         * @param {function(e: ?any): void} [error] The `error` callback of an
         * Observer.
         * @param {function(): void} [complete] The `complete` callback of an
         * Observer.
         * @return {Subscriber<T>} A Subscriber wrapping the (partially defined)
         * Observer represented by the given arguments.
         */
        Subscriber.create = function (next, error, complete) {
            var subscriber = new Subscriber(next, error, complete);
            subscriber.syncErrorThrowable = false;
            return subscriber;
        };
        /**
         * The {@link Observer} callback to receive notifications of type `next` from
         * the Observable, with a value. The Observable may call this method 0 or more
         * times.
         * @param {T} [value] The `next` value.
         * @return {void}
         */
        Subscriber.prototype.next = function (value) {
            if (!this.isStopped) {
                this._next(value);
            }
        };
        /**
         * The {@link Observer} callback to receive notifications of type `error` from
         * the Observable, with an attached {@link Error}. Notifies the Observer that
         * the Observable has experienced an error condition.
         * @param {any} [err] The `error` exception.
         * @return {void}
         */
        Subscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                this.isStopped = true;
                this._error(err);
            }
        };
        /**
         * The {@link Observer} callback to receive a valueless notification of type
         * `complete` from the Observable. Notifies the Observer that the Observable
         * has finished sending push-based notifications.
         * @return {void}
         */
        Subscriber.prototype.complete = function () {
            if (!this.isStopped) {
                this.isStopped = true;
                this._complete();
            }
        };
        Subscriber.prototype.unsubscribe = function () {
            if (this.isUnsubscribed) {
                return;
            }
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
        };
        Subscriber.prototype._next = function (value) {
            this.destination.next(value);
        };
        Subscriber.prototype._error = function (err) {
            this.destination.error(err);
            this.unsubscribe();
        };
        Subscriber.prototype._complete = function () {
            this.destination.complete();
            this.unsubscribe();
        };
        Subscriber.prototype[$$rxSubscriber] = function () {
            return this;
        };
        return Subscriber;
    }(Subscription));
    /**
     * We need this JSDoc comment for affecting ESDoc.
     * @ignore
     * @extends {Ignored}
     */
    var SafeSubscriber = (function (_super) {
        __extends(SafeSubscriber, _super);
        function SafeSubscriber(_parent, observerOrNext, error, complete) {
            _super.call(this);
            this._parent = _parent;
            var next;
            var context = this;
            if (isFunction$1(observerOrNext)) {
                next = observerOrNext;
            }
            else if (observerOrNext) {
                context = observerOrNext;
                next = observerOrNext.next;
                error = observerOrNext.error;
                complete = observerOrNext.complete;
                if (isFunction$1(context.unsubscribe)) {
                    this.add(context.unsubscribe.bind(context));
                }
                context.unsubscribe = this.unsubscribe.bind(this);
            }
            this._context = context;
            this._next = next;
            this._error = error;
            this._complete = complete;
        }
        SafeSubscriber.prototype.next = function (value) {
            if (!this.isStopped && this._next) {
                var _parent = this._parent;
                if (!_parent.syncErrorThrowable) {
                    this.__tryOrUnsub(this._next, value);
                }
                else if (this.__tryOrSetError(_parent, this._next, value)) {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                var _parent = this._parent;
                if (this._error) {
                    if (!_parent.syncErrorThrowable) {
                        this.__tryOrUnsub(this._error, err);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parent, this._error, err);
                        this.unsubscribe();
                    }
                }
                else if (!_parent.syncErrorThrowable) {
                    this.unsubscribe();
                    throw err;
                }
                else {
                    _parent.syncErrorValue = err;
                    _parent.syncErrorThrown = true;
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.complete = function () {
            if (!this.isStopped) {
                var _parent = this._parent;
                if (this._complete) {
                    if (!_parent.syncErrorThrowable) {
                        this.__tryOrUnsub(this._complete);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parent, this._complete);
                        this.unsubscribe();
                    }
                }
                else {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                this.unsubscribe();
                throw err;
            }
        };
        SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                parent.syncErrorValue = err;
                parent.syncErrorThrown = true;
                return true;
            }
            return false;
        };
        SafeSubscriber.prototype._unsubscribe = function () {
            var _parent = this._parent;
            this._context = null;
            this._parent = null;
            _parent.unsubscribe();
        };
        return SafeSubscriber;
    }(Subscriber));
    function toSubscriber(nextOrObserver, error, complete) {
        if (nextOrObserver && typeof nextOrObserver === 'object') {
            if (nextOrObserver instanceof Subscriber) {
                return nextOrObserver;
            }
            else if (typeof nextOrObserver[$$rxSubscriber] === 'function') {
                return nextOrObserver[$$rxSubscriber]();
            }
        }
        return new Subscriber(nextOrObserver, error, complete);
    }
    /**
     * A representation of any set of values over any amount of time. This the most basic building block
     * of RxJS.
     *
     * @class Observable<T>
     */
    var Observable = (function () {
        /**
         * @constructor
         * @param {Function} subscribe the function that is  called when the Observable is
         * initially subscribed to. This function is given a Subscriber, to which new values
         * can be `next`ed, or an `error` method can be called to raise an error, or
         * `complete` can be called to notify of a successful completion.
         */
        function Observable(subscribe) {
            this._isScalar = false;
            if (subscribe) {
                this._subscribe = subscribe;
            }
        }
        /**
         * Creates a new Observable, with this Observable as the source, and the passed
         * operator defined as the new observable's operator.
         * @method lift
         * @param {Operator} operator the operator defining the operation to take on the observable
         * @return {Observable} a new observable with the Operator applied
         */
        Observable.prototype.lift = function (operator) {
            var observable = new Observable();
            observable.source = this;
            observable.operator = operator;
            return observable;
        };
        /**
         * Registers handlers for handling emitted values, error and completions from the observable, and
         *  executes the observable's subscriber function, which will take action to set up the underlying data stream
         * @method subscribe
         * @param {PartialObserver|Function} observerOrNext (optional) either an observer defining all functions to be called,
         *  or the first of three possible handlers, which is the handler for each value emitted from the observable.
         * @param {Function} error (optional) a handler for a terminal event resulting from an error. If no error handler is provided,
         *  the error will be thrown as unhandled
         * @param {Function} complete (optional) a handler for a terminal event resulting from successful completion.
         * @return {ISubscription} a subscription reference to the registered handlers
         */
        Observable.prototype.subscribe = function (observerOrNext, error, complete) {
            var operator = this.operator;
            var sink = toSubscriber(observerOrNext, error, complete);
            sink.add(operator ? operator.call(sink, this) : this._subscribe(sink));
            if (sink.syncErrorThrowable) {
                sink.syncErrorThrowable = false;
                if (sink.syncErrorThrown) {
                    throw sink.syncErrorValue;
                }
            }
            return sink;
        };
        /**
         * @method forEach
         * @param {Function} next a handler for each value emitted by the observable
         * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise
         * @return {Promise} a promise that either resolves on observable completion or
         *  rejects with the handled error
         */
        Observable.prototype.forEach = function (next, PromiseCtor) {
            var _this = this;
            if (!PromiseCtor) {
                if (root.Rx && root.Rx.config && root.Rx.config.Promise) {
                    PromiseCtor = root.Rx.config.Promise;
                }
                else if (root.Promise) {
                    PromiseCtor = root.Promise;
                }
            }
            if (!PromiseCtor) {
                throw new Error('no Promise impl found');
            }
            return new PromiseCtor(function (resolve, reject) {
                var subscription = _this.subscribe(function (value) {
                    if (subscription) {
                        // if there is a subscription, then we can surmise
                        // the next handling is asynchronous. Any errors thrown
                        // need to be rejected explicitly and unsubscribe must be
                        // called manually
                        try {
                            next(value);
                        }
                        catch (err) {
                            reject(err);
                            subscription.unsubscribe();
                        }
                    }
                    else {
                        // if there is NO subscription, then we're getting a nexted
                        // value synchronously during subscription. We can just call it.
                        // If it errors, Observable's `subscribe` imple will ensure the
                        // unsubscription logic is called, then synchronously rethrow the error.
                        // After that, Promise will trap the error and send it
                        // down the rejection path.
                        next(value);
                    }
                }, reject, resolve);
            });
        };
        Observable.prototype._subscribe = function (subscriber) {
            return this.source.subscribe(subscriber);
        };
        /**
         * An interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
         * @method Symbol.observable
         * @return {Observable} this instance of the observable
         */
        Observable.prototype[$$observable] = function () {
            return this;
        };
        return Observable;
    }());
    // HACK: Since TypeScript inherits static properties too, we have to
    // fight against TypeScript here so Subject can have a different static create signature
    /**
     * Creates a new cold Observable by calling the Observable constructor
     * @static true
     * @owner Observable
     * @method create
     * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
     * @return {Observable} a new cold observable
     */
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    /**
     * We need this JSDoc comment for affecting ESDoc.
     * @ignore
     * @extends {Ignored}
     */
    var SubjectSubscription = (function (_super) {
        __extends(SubjectSubscription, _super);
        function SubjectSubscription(subject, observer) {
            _super.call(this);
            this.subject = subject;
            this.observer = observer;
            this.isUnsubscribed = false;
        }
        SubjectSubscription.prototype.unsubscribe = function () {
            if (this.isUnsubscribed) {
                return;
            }
            this.isUnsubscribed = true;
            var subject = this.subject;
            var observers = subject.observers;
            this.subject = null;
            if (!observers || observers.length === 0 || subject.isUnsubscribed) {
                return;
            }
            var subscriberIndex = observers.indexOf(this.observer);
            if (subscriberIndex !== -1) {
                observers.splice(subscriberIndex, 1);
            }
        };
        return SubjectSubscription;
    }(Subscription));
    function throwError(e) { throw e; }
    /**
     * An error thrown when an action is invalid because the object has been
     * unsubscribed.
     *
     * @see {@link Subject}
     * @see {@link BehaviorSubject}
     *
     * @class ObjectUnsubscribedError
     */
    var ObjectUnsubscribedError = (function (_super) {
        __extends(ObjectUnsubscribedError, _super);
        function ObjectUnsubscribedError() {
            _super.call(this, 'object unsubscribed');
            this.name = 'ObjectUnsubscribedError';
        }
        return ObjectUnsubscribedError;
    }(Error));
    /**
     * @class Subject<T>
     */
    var Subject = (function (_super) {
        __extends(Subject, _super);
        function Subject(destination, source) {
            _super.call(this);
            this.destination = destination;
            this.source = source;
            this.observers = [];
            this.isUnsubscribed = false;
            this.isStopped = false;
            this.hasErrored = false;
            this.dispatching = false;
            this.hasCompleted = false;
            this.source = source;
        }
        Subject.prototype.lift = function (operator) {
            var subject = new Subject(this.destination || this, this);
            subject.operator = operator;
            return subject;
        };
        Subject.prototype.add = function (subscription) {
            return Subscription.prototype.add.call(this, subscription);
        };
        Subject.prototype.remove = function (subscription) {
            Subscription.prototype.remove.call(this, subscription);
        };
        Subject.prototype.unsubscribe = function () {
            Subscription.prototype.unsubscribe.call(this);
        };
        Subject.prototype._subscribe = function (subscriber) {
            if (this.source) {
                return this.source.subscribe(subscriber);
            }
            else {
                if (subscriber.isUnsubscribed) {
                    return;
                }
                else if (this.hasErrored) {
                    return subscriber.error(this.errorValue);
                }
                else if (this.hasCompleted) {
                    return subscriber.complete();
                }
                this.throwIfUnsubscribed();
                var subscription = new SubjectSubscription(this, subscriber);
                this.observers.push(subscriber);
                return subscription;
            }
        };
        Subject.prototype._unsubscribe = function () {
            this.source = null;
            this.isStopped = true;
            this.observers = null;
            this.destination = null;
        };
        Subject.prototype.next = function (value) {
            this.throwIfUnsubscribed();
            if (this.isStopped) {
                return;
            }
            this.dispatching = true;
            this._next(value);
            this.dispatching = false;
            if (this.hasErrored) {
                this._error(this.errorValue);
            }
            else if (this.hasCompleted) {
                this._complete();
            }
        };
        Subject.prototype.error = function (err) {
            this.throwIfUnsubscribed();
            if (this.isStopped) {
                return;
            }
            this.isStopped = true;
            this.hasErrored = true;
            this.errorValue = err;
            if (this.dispatching) {
                return;
            }
            this._error(err);
        };
        Subject.prototype.complete = function () {
            this.throwIfUnsubscribed();
            if (this.isStopped) {
                return;
            }
            this.isStopped = true;
            this.hasCompleted = true;
            if (this.dispatching) {
                return;
            }
            this._complete();
        };
        Subject.prototype.asObservable = function () {
            var observable = new SubjectObservable(this);
            return observable;
        };
        Subject.prototype._next = function (value) {
            if (this.destination) {
                this.destination.next(value);
            }
            else {
                this._finalNext(value);
            }
        };
        Subject.prototype._finalNext = function (value) {
            var index = -1;
            var observers = this.observers.slice(0);
            var len = observers.length;
            while (++index < len) {
                observers[index].next(value);
            }
        };
        Subject.prototype._error = function (err) {
            if (this.destination) {
                this.destination.error(err);
            }
            else {
                this._finalError(err);
            }
        };
        Subject.prototype._finalError = function (err) {
            var index = -1;
            var observers = this.observers;
            // optimization to block our SubjectSubscriptions from
            // splicing themselves out of the observers list one by one.
            this.observers = null;
            this.isUnsubscribed = true;
            if (observers) {
                var len = observers.length;
                while (++index < len) {
                    observers[index].error(err);
                }
            }
            this.isUnsubscribed = false;
            this.unsubscribe();
        };
        Subject.prototype._complete = function () {
            if (this.destination) {
                this.destination.complete();
            }
            else {
                this._finalComplete();
            }
        };
        Subject.prototype._finalComplete = function () {
            var index = -1;
            var observers = this.observers;
            // optimization to block our SubjectSubscriptions from
            // splicing themselves out of the observers list one by one.
            this.observers = null;
            this.isUnsubscribed = true;
            if (observers) {
                var len = observers.length;
                while (++index < len) {
                    observers[index].complete();
                }
            }
            this.isUnsubscribed = false;
            this.unsubscribe();
        };
        Subject.prototype.throwIfUnsubscribed = function () {
            if (this.isUnsubscribed) {
                throwError(new ObjectUnsubscribedError());
            }
        };
        Subject.prototype[$$rxSubscriber] = function () {
            return new Subscriber(this);
        };
        return Subject;
    }(Observable));
    Subject.create = function (destination, source) {
        return new Subject(destination, source);
    };
    /**
     * We need this JSDoc comment for affecting ESDoc.
     * @ignore
     * @extends {Ignored}
     */
    var SubjectObservable = (function (_super) {
        __extends(SubjectObservable, _super);
        function SubjectObservable(source) {
            _super.call(this);
            this.source = source;
        }
        return SubjectObservable;
    }(Observable));
    /**
     * We need this JSDoc comment for affecting ESDoc.
     * @extends {Ignored}
     * @hide true
     */
    var PromiseObservable = (function (_super) {
        __extends(PromiseObservable, _super);
        function PromiseObservable(promise, scheduler) {
            if (scheduler === void 0) { scheduler = null; }
            _super.call(this);
            this.promise = promise;
            this.scheduler = scheduler;
        }
        /**
         * @param promise
         * @param scheduler
         * @return {PromiseObservable}
         * @static true
         * @name fromPromise
         * @owner Observable
         */
        PromiseObservable.create = function (promise, scheduler) {
            if (scheduler === void 0) { scheduler = null; }
            return new PromiseObservable(promise, scheduler);
        };
        PromiseObservable.prototype._subscribe = function (subscriber) {
            var _this = this;
            var promise = this.promise;
            var scheduler = this.scheduler;
            if (scheduler == null) {
                if (this._isScalar) {
                    if (!subscriber.isUnsubscribed) {
                        subscriber.next(this.value);
                        subscriber.complete();
                    }
                }
                else {
                    promise.then(function (value) {
                        _this.value = value;
                        _this._isScalar = true;
                        if (!subscriber.isUnsubscribed) {
                            subscriber.next(value);
                            subscriber.complete();
                        }
                    }, function (err) {
                        if (!subscriber.isUnsubscribed) {
                            subscriber.error(err);
                        }
                    })
                        .then(null, function (err) {
                        // escape the promise trap, throw unhandled errors
                        root.setTimeout(function () { throw err; });
                    });
                }
            }
            else {
                if (this._isScalar) {
                    if (!subscriber.isUnsubscribed) {
                        return scheduler.schedule(dispatchNext, 0, { value: this.value, subscriber: subscriber });
                    }
                }
                else {
                    promise.then(function (value) {
                        _this.value = value;
                        _this._isScalar = true;
                        if (!subscriber.isUnsubscribed) {
                            subscriber.add(scheduler.schedule(dispatchNext, 0, { value: value, subscriber: subscriber }));
                        }
                    }, function (err) {
                        if (!subscriber.isUnsubscribed) {
                            subscriber.add(scheduler.schedule(dispatchError, 0, { err: err, subscriber: subscriber }));
                        }
                    })
                        .then(null, function (err) {
                        // escape the promise trap, throw unhandled errors
                        root.setTimeout(function () { throw err; });
                    });
                }
            }
        };
        return PromiseObservable;
    }(Observable));
    function dispatchNext(arg) {
        var value = arg.value, subscriber = arg.subscriber;
        if (!subscriber.isUnsubscribed) {
            subscriber.next(value);
            subscriber.complete();
        }
    }
    function dispatchError(arg) {
        var err = arg.err, subscriber = arg.subscriber;
        if (!subscriber.isUnsubscribed) {
            subscriber.error(err);
        }
    }
    /**
     * @param PromiseCtor
     * @return {Promise<T>}
     * @method toPromise
     * @owner Observable
     */
    function toPromise(PromiseCtor) {
        var _this = this;
        if (!PromiseCtor) {
            if (root.Rx && root.Rx.config && root.Rx.config.Promise) {
                PromiseCtor = root.Rx.config.Promise;
            }
            else if (root.Promise) {
                PromiseCtor = root.Promise;
            }
        }
        if (!PromiseCtor) {
            throw new Error('no Promise impl found');
        }
        return new PromiseCtor(function (resolve, reject) {
            var value;
            _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
        });
    }
    var ObservableWrapper = (function () {
        function ObservableWrapper() {
        }
        // TODO(vsavkin): when we use rxnext, try inferring the generic type from the first arg
        ObservableWrapper.subscribe = function (emitter, onNext, onError, onComplete) {
            if (onComplete === void 0) { onComplete = function () { }; }
            onError = (typeof onError === "function") && onError || noop;
            onComplete = (typeof onComplete === "function") && onComplete || noop;
            return emitter.subscribe({ next: onNext, error: onError, complete: onComplete });
        };
        ObservableWrapper.isObservable = function (obs) { return !!obs.subscribe; };
        /**
         * Returns whether `obs` has any subscribers listening to events.
         */
        ObservableWrapper.hasSubscribers = function (obs) { return obs.observers.length > 0; };
        ObservableWrapper.dispose = function (subscription) { subscription.unsubscribe(); };
        /**
         * @deprecated - use callEmit() instead
         */
        ObservableWrapper.callNext = function (emitter, value) { emitter.next(value); };
        ObservableWrapper.callEmit = function (emitter, value) { emitter.emit(value); };
        ObservableWrapper.callError = function (emitter, error) { emitter.error(error); };
        ObservableWrapper.callComplete = function (emitter) { emitter.complete(); };
        ObservableWrapper.fromPromise = function (promise) {
            return PromiseObservable.create(promise);
        };
        ObservableWrapper.toPromise = function (obj) { return toPromise.call(obj); };
        return ObservableWrapper;
    }());
    /**
     * Use by directives and components to emit custom Events.
     *
     * ### Examples
     *
     * In the following example, `Zippy` alternatively emits `open` and `close` events when its
     * title gets clicked:
     *
     * ```
     * @Component({
     *   selector: 'zippy',
     *   template: `
     *   <div class="zippy">
     *     <div (click)="toggle()">Toggle</div>
     *     <div [hidden]="!visible">
     *       <ng-content></ng-content>
     *     </div>
     *  </div>`})
     * export class Zippy {
     *   visible: boolean = true;
     *   @Output() open: EventEmitter<any> = new EventEmitter();
     *   @Output() close: EventEmitter<any> = new EventEmitter();
     *
     *   toggle() {
     *     this.visible = !this.visible;
     *     if (this.visible) {
     *       this.open.emit(null);
     *     } else {
     *       this.close.emit(null);
     *     }
     *   }
     * }
     * ```
     *
     * Use Rx.Observable but provides an adapter to make it work as specified here:
     * https://github.com/jhusain/observable-spec
     *
     * Once a reference implementation of the spec is available, switch to it.
     */
    var EventEmitter = (function (_super) {
        __extends(EventEmitter, _super);
        /**
         * Creates an instance of [EventEmitter], which depending on [isAsync],
         * delivers events synchronously or asynchronously.
         */
        function EventEmitter(isAsync) {
            if (isAsync === void 0) { isAsync = true; }
            _super.call(this);
            this._isAsync = isAsync;
        }
        EventEmitter.prototype.emit = function (value) { _super.prototype.next.call(this, value); };
        /**
         * @deprecated - use .emit(value) instead
         */
        EventEmitter.prototype.next = function (value) { _super.prototype.next.call(this, value); };
        EventEmitter.prototype.subscribe = function (generatorOrNext, error, complete) {
            var schedulerFn;
            var errorFn = function (err) { return null; };
            var completeFn = function () { return null; };
            if (generatorOrNext && typeof generatorOrNext === 'object') {
                schedulerFn = this._isAsync ? function (value) { setTimeout(function () { return generatorOrNext.next(value); }); } :
                    function (value) { generatorOrNext.next(value); };
                if (generatorOrNext.error) {
                    errorFn = this._isAsync ? function (err) { setTimeout(function () { return generatorOrNext.error(err); }); } :
                        function (err) { generatorOrNext.error(err); };
                }
                if (generatorOrNext.complete) {
                    completeFn = this._isAsync ? function () { setTimeout(function () { return generatorOrNext.complete(); }); } :
                        function () { generatorOrNext.complete(); };
                }
            }
            else {
                schedulerFn = this._isAsync ? function (value) { setTimeout(function () { return generatorOrNext(value); }); } :
                    function (value) { generatorOrNext(value); };
                if (error) {
                    errorFn =
                        this._isAsync ? function (err) { setTimeout(function () { return error(err); }); } : function (err) { error(err); };
                }
                if (complete) {
                    completeFn =
                        this._isAsync ? function () { setTimeout(function () { return complete(); }); } : function () { complete(); };
                }
            }
            return _super.prototype.subscribe.call(this, schedulerFn, errorFn, completeFn);
        };
        return EventEmitter;
    }(Subject));
    /**
     * Stores error information; delivered via [NgZone.onError] stream.
     */
    var NgZoneError = (function () {
        function NgZoneError(error, stackTrace) {
            this.error = error;
            this.stackTrace = stackTrace;
        }
        return NgZoneError;
    }());
    var NgZoneImpl = (function () {
        function NgZoneImpl(_a) {
            var _this = this;
            var trace = _a.trace, onEnter = _a.onEnter, onLeave = _a.onLeave, setMicrotask = _a.setMicrotask, setMacrotask = _a.setMacrotask, onError = _a.onError;
            this.onEnter = onEnter;
            this.onLeave = onLeave;
            this.setMicrotask = setMicrotask;
            this.setMacrotask = setMacrotask;
            this.onError = onError;
            if (Zone) {
                this.outer = this.inner = Zone.current;
                if (Zone['wtfZoneSpec']) {
                    this.inner = this.inner.fork(Zone['wtfZoneSpec']);
                }
                if (trace && Zone['longStackTraceZoneSpec']) {
                    this.inner = this.inner.fork(Zone['longStackTraceZoneSpec']);
                }
                this.inner = this.inner.fork({
                    name: 'angular',
                    properties: { 'isAngularZone': true },
                    onInvokeTask: function (delegate, current, target, task, applyThis, applyArgs) {
                        try {
                            _this.onEnter();
                            return delegate.invokeTask(target, task, applyThis, applyArgs);
                        }
                        finally {
                            _this.onLeave();
                        }
                    },
                    onInvoke: function (delegate, current, target, callback, applyThis, applyArgs, source) {
                        try {
                            _this.onEnter();
                            return delegate.invoke(target, callback, applyThis, applyArgs, source);
                        }
                        finally {
                            _this.onLeave();
                        }
                    },
                    onHasTask: function (delegate, current, target, hasTaskState) {
                        delegate.hasTask(target, hasTaskState);
                        if (current == target) {
                            // We are only interested in hasTask events which originate from our zone
                            // (A child hasTask event is not interesting to us)
                            if (hasTaskState.change == 'microTask') {
                                _this.setMicrotask(hasTaskState.microTask);
                            }
                            else if (hasTaskState.change == 'macroTask') {
                                _this.setMacrotask(hasTaskState.macroTask);
                            }
                        }
                    },
                    onHandleError: function (delegate, current, target, error) {
                        delegate.handleError(target, error);
                        _this.onError(new NgZoneError(error, error.stack));
                        return false;
                    }
                });
            }
            else {
                throw new Error('Angular requires Zone.js polyfill.');
            }
        }
        NgZoneImpl.isInAngularZone = function () { return Zone.current.get('isAngularZone') === true; };
        NgZoneImpl.prototype.runInner = function (fn) { return this.inner.run(fn); };
        ;
        NgZoneImpl.prototype.runInnerGuarded = function (fn) { return this.inner.runGuarded(fn); };
        ;
        NgZoneImpl.prototype.runOuter = function (fn) { return this.outer.run(fn); };
        ;
        return NgZoneImpl;
    }());
    /**
     * An injectable service for executing work inside or outside of the Angular zone.
     *
     * The most common use of this service is to optimize performance when starting a work consisting of
     * one or more asynchronous tasks that don't require UI updates or error handling to be handled by
     * Angular. Such tasks can be kicked off via {@link #runOutsideAngular} and if needed, these tasks
     * can reenter the Angular zone via {@link #run}.
     *
     * <!-- TODO: add/fix links to:
     *   - docs explaining zones and the use of zones in Angular and change-detection
     *   - link to runOutsideAngular/run (throughout this file!)
     *   -->
     *
     * ### Example ([live demo](http://plnkr.co/edit/lY9m8HLy7z06vDoUaSN2?p=preview))
     * ```
     * import {Component, View, NgZone} from '@angular/core';
     * import {NgIf} from '@angular/common';
     *
     * @Component({
     *   selector: 'ng-zone-demo'.
     *   template: `
     *     <h2>Demo: NgZone</h2>
     *
     *     <p>Progress: {{progress}}%</p>
     *     <p *ngIf="progress >= 100">Done processing {{label}} of Angular zone!</p>
     *
     *     <button (click)="processWithinAngularZone()">Process within Angular zone</button>
     *     <button (click)="processOutsideOfAngularZone()">Process outside of Angular zone</button>
     *   `,
     *   directives: [NgIf]
     * })
     * export class NgZoneDemo {
     *   progress: number = 0;
     *   label: string;
     *
     *   constructor(private _ngZone: NgZone) {}
     *
     *   // Loop inside the Angular zone
     *   // so the UI DOES refresh after each setTimeout cycle
     *   processWithinAngularZone() {
     *     this.label = 'inside';
     *     this.progress = 0;
     *     this._increaseProgress(() => console.log('Inside Done!'));
     *   }
     *
     *   // Loop outside of the Angular zone
     *   // so the UI DOES NOT refresh after each setTimeout cycle
     *   processOutsideOfAngularZone() {
     *     this.label = 'outside';
     *     this.progress = 0;
     *     this._ngZone.runOutsideAngular(() => {
     *       this._increaseProgress(() => {
     *       // reenter the Angular zone and display done
     *       this._ngZone.run(() => {console.log('Outside Done!') });
     *     }}));
     *   }
     *
     *
     *   _increaseProgress(doneCallback: () => void) {
     *     this.progress += 1;
     *     console.log(`Current progress: ${this.progress}%`);
     *
     *     if (this.progress < 100) {
     *       window.setTimeout(() => this._increaseProgress(doneCallback)), 10)
     *     } else {
     *       doneCallback();
     *     }
     *   }
     * }
     * ```
     */
    var NgZone = (function () {
        function NgZone(_a) {
            var _this = this;
            var _b = _a.enableLongStackTrace, enableLongStackTrace = _b === void 0 ? false : _b;
            this._hasPendingMicrotasks = false;
            this._hasPendingMacrotasks = false;
            /** @internal */
            this._isStable = true;
            /** @internal */
            this._nesting = 0;
            /** @internal */
            this._onUnstable = new EventEmitter(false);
            /** @internal */
            this._onMicrotaskEmpty = new EventEmitter(false);
            /** @internal */
            this._onStable = new EventEmitter(false);
            /** @internal */
            this._onErrorEvents = new EventEmitter(false);
            this._zoneImpl = new NgZoneImpl({
                trace: enableLongStackTrace,
                onEnter: function () {
                    // console.log('ZONE.enter', this._nesting, this._isStable);
                    _this._nesting++;
                    if (_this._isStable) {
                        _this._isStable = false;
                        _this._onUnstable.emit(null);
                    }
                },
                onLeave: function () {
                    _this._nesting--;
                    // console.log('ZONE.leave', this._nesting, this._isStable);
                    _this._checkStable();
                },
                setMicrotask: function (hasMicrotasks) {
                    _this._hasPendingMicrotasks = hasMicrotasks;
                    _this._checkStable();
                },
                setMacrotask: function (hasMacrotasks) { _this._hasPendingMacrotasks = hasMacrotasks; },
                onError: function (error) { return _this._onErrorEvents.emit(error); }
            });
        }
        NgZone.isInAngularZone = function () { return NgZoneImpl.isInAngularZone(); };
        NgZone.assertInAngularZone = function () {
            if (!NgZoneImpl.isInAngularZone()) {
                throw new BaseException('Expected to be in Angular Zone, but it is not!');
            }
        };
        NgZone.assertNotInAngularZone = function () {
            if (NgZoneImpl.isInAngularZone()) {
                throw new BaseException('Expected to not be in Angular Zone, but it is!');
            }
        };
        NgZone.prototype._checkStable = function () {
            var _this = this;
            if (this._nesting == 0) {
                if (!this._hasPendingMicrotasks && !this._isStable) {
                    try {
                        // console.log('ZONE.microtaskEmpty');
                        this._nesting++;
                        this._onMicrotaskEmpty.emit(null);
                    }
                    finally {
                        this._nesting--;
                        if (!this._hasPendingMicrotasks) {
                            try {
                                // console.log('ZONE.stable', this._nesting, this._isStable);
                                this.runOutsideAngular(function () { return _this._onStable.emit(null); });
                            }
                            finally {
                                this._isStable = true;
                            }
                        }
                    }
                }
            }
        };
        ;
        Object.defineProperty(NgZone.prototype, "onUnstable", {
            /**
             * Notifies when code enters Angular Zone. This gets fired first on VM Turn.
             */
            get: function () { return this._onUnstable; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgZone.prototype, "onMicrotaskEmpty", {
            /**
             * Notifies when there is no more microtasks enqueue in the current VM Turn.
             * This is a hint for Angular to do change detection, which may enqueue more microtasks.
             * For this reason this event can fire multiple times per VM Turn.
             */
            get: function () { return this._onMicrotaskEmpty; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgZone.prototype, "onStable", {
            /**
             * Notifies when the last `onMicrotaskEmpty` has run and there are no more microtasks, which
             * implies we are about to relinquish VM turn.
             * This event gets called just once.
             */
            get: function () { return this._onStable; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgZone.prototype, "onError", {
            /**
             * Notify that an error has been delivered.
             */
            get: function () { return this._onErrorEvents; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgZone.prototype, "hasPendingMicrotasks", {
            /**
             * Whether there are any outstanding microtasks.
             */
            get: function () { return this._hasPendingMicrotasks; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgZone.prototype, "hasPendingMacrotasks", {
            /**
             * Whether there are any outstanding microtasks.
             */
            get: function () { return this._hasPendingMacrotasks; },
            enumerable: true,
            configurable: true
        });
        /**
         * Executes the `fn` function synchronously within the Angular zone and returns value returned by
         * the function.
         *
         * Running functions via `run` allows you to reenter Angular zone from a task that was executed
         * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
         *
         * Any future tasks or microtasks scheduled from within this function will continue executing from
         * within the Angular zone.
         *
         * If a synchronous error happens it will be rethrown and not reported via `onError`.
         */
        NgZone.prototype.run = function (fn) { return this._zoneImpl.runInner(fn); };
        /**
         * Same as #run, except that synchronous errors are caught and forwarded
         * via `onError` and not rethrown.
         */
        NgZone.prototype.runGuarded = function (fn) { return this._zoneImpl.runInnerGuarded(fn); };
        /**
         * Executes the `fn` function synchronously in Angular's parent zone and returns value returned by
         * the function.
         *
         * Running functions via `runOutsideAngular` allows you to escape Angular's zone and do work that
         * doesn't trigger Angular change-detection or is subject to Angular's error handling.
         *
         * Any future tasks or microtasks scheduled from within this function will continue executing from
         * outside of the Angular zone.
         *
         * Use {@link #run} to reenter the Angular zone and do work that updates the application model.
         */
        NgZone.prototype.runOutsideAngular = function (fn) { return this._zoneImpl.runOuter(fn); };
        return NgZone;
    }());
    /**
     * A DI Token representing a unique string id assigned to the application by Angular and used
     * primarily for prefixing application attributes and CSS styles when
     * {@link ViewEncapsulation#Emulated} is being used.
     *
     * If you need to avoid randomly generated value to be used as an application id, you can provide
     * a custom value via a DI provider <!-- TODO: provider --> configuring the root {@link Injector}
     * using this token.
     */
    var APP_ID = new OpaqueToken('AppId');
    function _appIdRandomProviderFactory() {
        return "" + _randomChar() + _randomChar() + _randomChar();
    }
    /**
     * Providers that will generate a random APP_ID_TOKEN.
     */
    var APP_ID_RANDOM_PROVIDER = 
    /*@ts2dart_const*/ /* @ts2dart_Provider */ {
        provide: APP_ID,
        useFactory: _appIdRandomProviderFactory,
        deps: []
    };
    function _randomChar() {
        return StringWrapper.fromCharCode(97 + Math.floor(Math.random() * 25));
    }
    /**
     * A function that will be executed when a platform is initialized.
     */
    var PLATFORM_INITIALIZER = 
    /*@ts2dart_const*/ new OpaqueToken("Platform Initializer");
    /**
     * A function that will be executed when an application is initialized.
     */
    var APP_INITIALIZER = 
    /*@ts2dart_const*/ new OpaqueToken("Application Initializer");
    /**
     * A token which indicates the root directory of the application
     */
    var PACKAGE_ROOT_URL = 
    /*@ts2dart_const*/ new OpaqueToken("Application Packages Root URL");
    var Testability = (function () {
        function Testability(_ngZone) {
            this._ngZone = _ngZone;
            /** @internal */
            this._pendingCount = 0;
            /** @internal */
            this._isZoneStable = true;
            /**
             * Whether any work was done since the last 'whenStable' callback. This is
             * useful to detect if this could have potentially destabilized another
             * component while it is stabilizing.
             * @internal
             */
            this._didWork = false;
            /** @internal */
            this._callbacks = [];
            this._watchAngularEvents();
        }
        /** @internal */
        Testability.prototype._watchAngularEvents = function () {
            var _this = this;
            ObservableWrapper.subscribe(this._ngZone.onUnstable, function (_) {
                _this._didWork = true;
                _this._isZoneStable = false;
            });
            this._ngZone.runOutsideAngular(function () {
                ObservableWrapper.subscribe(_this._ngZone.onStable, function (_) {
                    NgZone.assertNotInAngularZone();
                    scheduleMicroTask(function () {
                        _this._isZoneStable = true;
                        _this._runCallbacksIfReady();
                    });
                });
            });
        };
        Testability.prototype.increasePendingRequestCount = function () {
            this._pendingCount += 1;
            this._didWork = true;
            return this._pendingCount;
        };
        Testability.prototype.decreasePendingRequestCount = function () {
            this._pendingCount -= 1;
            if (this._pendingCount < 0) {
                throw new BaseException('pending async requests below zero');
            }
            this._runCallbacksIfReady();
            return this._pendingCount;
        };
        Testability.prototype.isStable = function () {
            return this._isZoneStable && this._pendingCount == 0 && !this._ngZone.hasPendingMacrotasks;
        };
        /** @internal */
        Testability.prototype._runCallbacksIfReady = function () {
            var _this = this;
            if (this.isStable()) {
                // Schedules the call backs in a new frame so that it is always async.
                scheduleMicroTask(function () {
                    while (_this._callbacks.length !== 0) {
                        (_this._callbacks.pop())(_this._didWork);
                    }
                    _this._didWork = false;
                });
            }
            else {
                // Not Ready
                this._didWork = true;
            }
        };
        Testability.prototype.whenStable = function (callback) {
            this._callbacks.push(callback);
            this._runCallbacksIfReady();
        };
        Testability.prototype.getPendingRequestCount = function () { return this._pendingCount; };
        Testability.prototype.findBindings = function (using, provider, exactMatch) {
            // TODO(juliemr): implement.
            return [];
        };
        Testability.prototype.findProviders = function (using, provider, exactMatch) {
            // TODO(juliemr): implement.
            return [];
        };
        return Testability;
    }());
    Testability.decorators = [
        { type: Injectable },
    ];
    Testability.ctorParameters = [
        { type: NgZone, },
    ];
    var TestabilityRegistry = (function () {
        function TestabilityRegistry() {
            /** @internal */
            this._applications = new Map$1();
            _testabilityGetter.addToWindow(this);
        }
        TestabilityRegistry.prototype.registerApplication = function (token, testability) {
            this._applications.set(token, testability);
        };
        TestabilityRegistry.prototype.getTestability = function (elem) { return this._applications.get(elem); };
        TestabilityRegistry.prototype.getAllTestabilities = function () { return MapWrapper.values(this._applications); };
        TestabilityRegistry.prototype.getAllRootElements = function () { return MapWrapper.keys(this._applications); };
        TestabilityRegistry.prototype.findTestabilityInTree = function (elem, findInAncestors) {
            if (findInAncestors === void 0) { findInAncestors = true; }
            return _testabilityGetter.findTestabilityInTree(this, elem, findInAncestors);
        };
        return TestabilityRegistry;
    }());
    TestabilityRegistry.decorators = [
        { type: Injectable },
    ];
    TestabilityRegistry.ctorParameters = [];
    /* @ts2dart_const */
    var _NoopGetTestability = (function () {
        function _NoopGetTestability() {
        }
        _NoopGetTestability.prototype.addToWindow = function (registry) { };
        _NoopGetTestability.prototype.findTestabilityInTree = function (registry, elem, findInAncestors) {
            return null;
        };
        return _NoopGetTestability;
    }());
    /**
     * Set the {@link GetTestability} implementation used by the Angular testing framework.
     */
    function setTestabilityGetter(getter) {
        _testabilityGetter = getter;
    }
    var _testabilityGetter = new _NoopGetTestability();
    /**
     * A SecurityContext marks a location that has dangerous security implications, e.g. a DOM property
     * like `innerHTML` that could cause Cross Site Scripting (XSS) security bugs when improperly
     * handled.
     *
     * See DomSanitizationService for more details on security in Angular applications.
     */
    var SecurityContext;
    (function (SecurityContext) {
        SecurityContext[SecurityContext["NONE"] = 0] = "NONE";
        SecurityContext[SecurityContext["HTML"] = 1] = "HTML";
        SecurityContext[SecurityContext["STYLE"] = 2] = "STYLE";
        SecurityContext[SecurityContext["SCRIPT"] = 3] = "SCRIPT";
        SecurityContext[SecurityContext["URL"] = 4] = "URL";
        SecurityContext[SecurityContext["RESOURCE_URL"] = 5] = "RESOURCE_URL";
    })(SecurityContext || (SecurityContext = {}));
    /**
     * SanitizationService is used by the views to sanitize potentially dangerous values. This is a
     * private API, use code should only refer to DomSanitizationService.
     */
    var SanitizationService = (function () {
        function SanitizationService() {
        }
        return SanitizationService;
    }());
    var ViewType;
    (function (ViewType) {
        // A view that contains the host element with bound component directive.
        // Contains a COMPONENT view
        ViewType[ViewType["HOST"] = 0] = "HOST";
        // The view of the component
        // Can contain 0 to n EMBEDDED views
        ViewType[ViewType["COMPONENT"] = 1] = "COMPONENT";
        // A view that is embedded into another View via a <template> element
        // inside of a COMPONENT view
        ViewType[ViewType["EMBEDDED"] = 2] = "EMBEDDED";
    })(ViewType || (ViewType = {}));
    /**
     * A wrapper around a native element inside of a View.
     *
     * An `ElementRef` is backed by a render-specific element. In the browser, this is usually a DOM
     * element.
     */
    // Note: We don't expose things like `Injector`, `ViewContainer`, ... here,
    // i.e. users have to ask for what they need. With that, we can build better analysis tools
    // and could do better codegen in the future.
    var ElementRef = (function () {
        function ElementRef(nativeElement) {
            this.nativeElement = nativeElement;
        }
        return ElementRef;
    }());
    var trace;
    var events;
    function detectWTF() {
        var wtf = global$1['wtf'];
        if (wtf) {
            trace = wtf['trace'];
            if (trace) {
                events = trace['events'];
                return true;
            }
        }
        return false;
    }
    function createScope(signature, flags) {
        if (flags === void 0) { flags = null; }
        return events.createScope(signature, flags);
    }
    function leave(scope, returnValue) {
        trace.leaveScope(scope, returnValue);
        return returnValue;
    }
    // Change exports to const once https://github.com/angular/ts2dart/issues/150
    /**
     * True if WTF is enabled.
     */
    var wtfEnabled = detectWTF();
    function noopScope(arg0, arg1) {
        return null;
    }
    /**
     * Create trace scope.
     *
     * Scopes must be strictly nested and are analogous to stack frames, but
     * do not have to follow the stack frames. Instead it is recommended that they follow logical
     * nesting. You may want to use
     * [Event
     * Signatures](http://google.github.io/tracing-framework/instrumenting-code.html#custom-events)
     * as they are defined in WTF.
     *
     * Used to mark scope entry. The return value is used to leave the scope.
     *
     *     var myScope = wtfCreateScope('MyClass#myMethod(ascii someVal)');
     *
     *     someMethod() {
     *        var s = myScope('Foo'); // 'Foo' gets stored in tracing UI
     *        // DO SOME WORK HERE
     *        return wtfLeave(s, 123); // Return value 123
     *     }
     *
     * Note, adding try-finally block around the work to ensure that `wtfLeave` gets called can
     * negatively impact the performance of your application. For this reason we recommend that
     * you don't add them to ensure that `wtfLeave` gets called. In production `wtfLeave` is a noop and
     * so try-finally block has no value. When debugging perf issues, skipping `wtfLeave`, do to
     * exception, will produce incorrect trace, but presence of exception signifies logic error which
     * needs to be fixed before the app should be profiled. Add try-finally only when you expect that
     * an exception is expected during normal execution while profiling.
     *
     */
    var wtfCreateScope = wtfEnabled ? createScope : function (signature, flags) { return noopScope; };
    /**
     * Used to mark end of Scope.
     *
     * - `scope` to end.
     * - `returnValue` (optional) to be passed to the WTF.
     *
     * Returns the `returnValue for easy chaining.
     */
    var wtfLeave = wtfEnabled ? leave : function (s, r) { return r; };
    /**
     * Represents a container where one or more Views can be attached.
     *
     * The container can contain two kinds of Views. Host Views, created by instantiating a
     * {@link Component} via {@link #createComponent}, and Embedded Views, created by instantiating an
     * {@link TemplateRef Embedded Template} via {@link #createEmbeddedView}.
     *
     * The location of the View Container within the containing View is specified by the Anchor
     * `element`. Each View Container can have only one Anchor Element and each Anchor Element can only
     * have a single View Container.
     *
     * Root elements of Views attached to this container become siblings of the Anchor Element in
     * the Rendered View.
     *
     * To access a `ViewContainerRef` of an Element, you can either place a {@link Directive} injected
     * with `ViewContainerRef` on the Element, or you obtain it via a {@link ViewChild} query.
     */
    var ViewContainerRef = (function () {
        function ViewContainerRef() {
        }
        Object.defineProperty(ViewContainerRef.prototype, "element", {
            /**
             * Anchor element that specifies the location of this container in the containing View.
             * <!-- TODO: rename to anchorElement -->
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewContainerRef.prototype, "injector", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewContainerRef.prototype, "parentInjector", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewContainerRef.prototype, "length", {
            /**
             * Returns the number of Views currently attached to this container.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        ;
        return ViewContainerRef;
    }());
    var ViewContainerRef_ = (function () {
        function ViewContainerRef_(_element) {
            this._element = _element;
            /** @internal */
            this._createComponentInContainerScope = wtfCreateScope('ViewContainerRef#createComponent()');
            /** @internal */
            this._insertScope = wtfCreateScope('ViewContainerRef#insert()');
            /** @internal */
            this._removeScope = wtfCreateScope('ViewContainerRef#remove()');
            /** @internal */
            this._detachScope = wtfCreateScope('ViewContainerRef#detach()');
        }
        ViewContainerRef_.prototype.get = function (index) { return this._element.nestedViews[index].ref; };
        Object.defineProperty(ViewContainerRef_.prototype, "length", {
            get: function () {
                var views = this._element.nestedViews;
                return isPresent(views) ? views.length : 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewContainerRef_.prototype, "element", {
            get: function () { return this._element.elementRef; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewContainerRef_.prototype, "injector", {
            get: function () { return this._element.injector; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewContainerRef_.prototype, "parentInjector", {
            get: function () { return this._element.parentInjector; },
            enumerable: true,
            configurable: true
        });
        // TODO(rado): profile and decide whether bounds checks should be added
        // to the methods below.
        ViewContainerRef_.prototype.createEmbeddedView = function (templateRef, context, index) {
            if (context === void 0) { context = null; }
            if (index === void 0) { index = -1; }
            var viewRef = templateRef.createEmbeddedView(context);
            this.insert(viewRef, index);
            return viewRef;
        };
        ViewContainerRef_.prototype.createComponent = function (componentFactory, index, injector, projectableNodes) {
            if (index === void 0) { index = -1; }
            if (injector === void 0) { injector = null; }
            if (projectableNodes === void 0) { projectableNodes = null; }
            var s = this._createComponentInContainerScope();
            var contextInjector = isPresent(injector) ? injector : this._element.parentInjector;
            var componentRef = componentFactory.create(contextInjector, projectableNodes);
            this.insert(componentRef.hostView, index);
            return wtfLeave(s, componentRef);
        };
        // TODO(i): refactor insert+remove into move
        ViewContainerRef_.prototype.insert = function (viewRef, index) {
            if (index === void 0) { index = -1; }
            var s = this._insertScope();
            if (index == -1)
                index = this.length;
            var viewRef_ = viewRef;
            this._element.attachView(viewRef_.internalView, index);
            return wtfLeave(s, viewRef_);
        };
        ViewContainerRef_.prototype.indexOf = function (viewRef) {
            return ListWrapper.indexOf(this._element.nestedViews, viewRef.internalView);
        };
        // TODO(i): rename to destroy
        ViewContainerRef_.prototype.remove = function (index) {
            if (index === void 0) { index = -1; }
            var s = this._removeScope();
            if (index == -1)
                index = this.length - 1;
            var view = this._element.detachView(index);
            view.destroy();
            // view is intentionally not returned to the client.
            wtfLeave(s);
        };
        // TODO(i): refactor insert+remove into move
        ViewContainerRef_.prototype.detach = function (index) {
            if (index === void 0) { index = -1; }
            var s = this._detachScope();
            if (index == -1)
                index = this.length - 1;
            var view = this._element.detachView(index);
            return wtfLeave(s, view.ref);
        };
        ViewContainerRef_.prototype.clear = function () {
            for (var i = this.length - 1; i >= 0; i--) {
                this.remove(i);
            }
        };
        return ViewContainerRef_;
    }());
    /**
     * An AppElement is created for elements that have a ViewContainerRef,
     * a nested component or a <template> element to keep data around
     * that is needed for later instantiations.
     */
    var AppElement = (function () {
        function AppElement(index, parentIndex, parentView, nativeElement) {
            this.index = index;
            this.parentIndex = parentIndex;
            this.parentView = parentView;
            this.nativeElement = nativeElement;
            this.nestedViews = null;
            this.componentView = null;
        }
        Object.defineProperty(AppElement.prototype, "elementRef", {
            get: function () { return new ElementRef(this.nativeElement); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppElement.prototype, "vcRef", {
            get: function () { return new ViewContainerRef_(this); },
            enumerable: true,
            configurable: true
        });
        AppElement.prototype.initComponent = function (component, componentConstructorViewQueries, view) {
            this.component = component;
            this.componentConstructorViewQueries = componentConstructorViewQueries;
            this.componentView = view;
        };
        Object.defineProperty(AppElement.prototype, "parentInjector", {
            get: function () { return this.parentView.injector(this.parentIndex); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppElement.prototype, "injector", {
            get: function () { return this.parentView.injector(this.index); },
            enumerable: true,
            configurable: true
        });
        AppElement.prototype.mapNestedViews = function (nestedViewClass, callback) {
            var result = [];
            if (isPresent(this.nestedViews)) {
                this.nestedViews.forEach(function (nestedView) {
                    if (nestedView.clazz === nestedViewClass) {
                        result.push(callback(nestedView));
                    }
                });
            }
            return result;
        };
        AppElement.prototype.attachView = function (view, viewIndex) {
            if (view.type === ViewType.COMPONENT) {
                throw new BaseException("Component views can't be moved!");
            }
            var nestedViews = this.nestedViews;
            if (nestedViews == null) {
                nestedViews = [];
                this.nestedViews = nestedViews;
            }
            ListWrapper.insert(nestedViews, viewIndex, view);
            var refRenderNode;
            if (viewIndex > 0) {
                var prevView = nestedViews[viewIndex - 1];
                refRenderNode = prevView.lastRootNode;
            }
            else {
                refRenderNode = this.nativeElement;
            }
            if (isPresent(refRenderNode)) {
                view.renderer.attachViewAfter(refRenderNode, view.flatRootNodes);
            }
            view.addToContentChildren(this);
        };
        AppElement.prototype.detachView = function (viewIndex) {
            var view = ListWrapper.removeAt(this.nestedViews, viewIndex);
            if (view.type === ViewType.COMPONENT) {
                throw new BaseException("Component views can't be moved!");
            }
            view.renderer.detachView(view.flatRootNodes);
            view.removeFromContentChildren(this);
            return view;
        };
        return AppElement;
    }());
    /**
     * An error thrown if application changes model breaking the top-down data flow.
     *
     * This exception is only thrown in dev mode.
     *
     * <!-- TODO: Add a link once the dev mode option is configurable -->
     *
     * ### Example
     *
     * ```typescript
     * @Component({
     *   selector: 'parent',
     *   template: `
     *     <child [prop]="parentProp"></child>
     *   `,
     *   directives: [forwardRef(() => Child)]
     * })
     * class Parent {
     *   parentProp = "init";
     * }
     *
     * @Directive({selector: 'child', inputs: ['prop']})
     * class Child {
     *   constructor(public parent: Parent) {}
     *
     *   set prop(v) {
     *     // this updates the parent property, which is disallowed during change detection
     *     // this will result in ExpressionChangedAfterItHasBeenCheckedException
     *     this.parent.parentProp = "updated";
     *   }
     * }
     * ```
     */
    var ExpressionChangedAfterItHasBeenCheckedException = (function (_super) {
        __extends(ExpressionChangedAfterItHasBeenCheckedException, _super);
        function ExpressionChangedAfterItHasBeenCheckedException(oldValue, currValue, context) {
            _super.call(this, "Expression has changed after it was checked. " +
                ("Previous value: '" + oldValue + "'. Current value: '" + currValue + "'"));
        }
        return ExpressionChangedAfterItHasBeenCheckedException;
    }(BaseException));
    /**
     * Thrown when an exception was raised during view creation, change detection or destruction.
     *
     * This error wraps the original exception to attach additional contextual information that can
     * be useful for debugging.
     */
    var ViewWrappedException = (function (_super) {
        __extends(ViewWrappedException, _super);
        function ViewWrappedException(originalException, originalStack, context) {
            _super.call(this, "Error in " + context.source, originalException, originalStack, context);
        }
        return ViewWrappedException;
    }(WrappedException));
    /**
     * Thrown when a destroyed view is used.
     *
     * This error indicates a bug in the framework.
     *
     * This is an internal Angular error.
     */
    var ViewDestroyedException = (function (_super) {
        __extends(ViewDestroyedException, _super);
        function ViewDestroyedException(details) {
            _super.call(this, "Attempt to use a destroyed view: " + details);
        }
        return ViewDestroyedException;
    }(BaseException));
    /**
     * A repository of different iterable diffing strategies used by NgFor, NgClass, and others.
     * @ts2dart_const
     */
    var IterableDiffers = (function () {
        /*@ts2dart_const*/
        function IterableDiffers(factories) {
            this.factories = factories;
        }
        IterableDiffers.create = function (factories, parent) {
            if (isPresent(parent)) {
                var copied = ListWrapper.clone(parent.factories);
                factories = factories.concat(copied);
                return new IterableDiffers(factories);
            }
            else {
                return new IterableDiffers(factories);
            }
        };
        /**
         * Takes an array of {@link IterableDifferFactory} and returns a provider used to extend the
         * inherited {@link IterableDiffers} instance with the provided factories and return a new
         * {@link IterableDiffers} instance.
         *
         * The following example shows how to extend an existing list of factories,
               * which will only be applied to the injector for this component and its children.
               * This step is all that's required to make a new {@link IterableDiffer} available.
         *
         * ### Example
         *
         * ```
         * @Component({
         *   viewProviders: [
         *     IterableDiffers.extend([new ImmutableListDiffer()])
         *   ]
         * })
         * ```
         */
        IterableDiffers.extend = function (factories) {
            return new Provider(IterableDiffers, {
                useFactory: function (parent) {
                    if (isBlank(parent)) {
                        // Typically would occur when calling IterableDiffers.extend inside of dependencies passed
                        // to
                        // bootstrap(), which would override default pipes instead of extending them.
                        throw new BaseException('Cannot extend IterableDiffers without a parent injector');
                    }
                    return IterableDiffers.create(factories, parent);
                },
                // Dependency technically isn't optional, but we can provide a better error message this way.
                deps: [[IterableDiffers, new SkipSelfMetadata(), new OptionalMetadata()]]
            });
        };
        IterableDiffers.prototype.find = function (iterable) {
            var factory = this.factories.find(function (f) { return f.supports(iterable); });
            if (isPresent(factory)) {
                return factory;
            }
            else {
                throw new BaseException("Cannot find a differ supporting object '" + iterable + "' of type '" + getTypeNameForDebugging(iterable) + "'");
            }
        };
        return IterableDiffers;
    }());
    /* @ts2dart_const */
    var DefaultIterableDifferFactory = (function () {
        function DefaultIterableDifferFactory() {
        }
        DefaultIterableDifferFactory.prototype.supports = function (obj) { return isListLikeIterable(obj); };
        DefaultIterableDifferFactory.prototype.create = function (cdRef, trackByFn) {
            return new DefaultIterableDiffer(trackByFn);
        };
        return DefaultIterableDifferFactory;
    }());
    var trackByIdentity = function (index, item) { return item; };
    var DefaultIterableDiffer = (function () {
        function DefaultIterableDiffer(_trackByFn) {
            this._trackByFn = _trackByFn;
            this._length = null;
            this._collection = null;
            // Keeps track of the used records at any point in time (during & across `_check()` calls)
            this._linkedRecords = null;
            // Keeps track of the removed records at any point in time during `_check()` calls.
            this._unlinkedRecords = null;
            this._previousItHead = null;
            this._itHead = null;
            this._itTail = null;
            this._additionsHead = null;
            this._additionsTail = null;
            this._movesHead = null;
            this._movesTail = null;
            this._removalsHead = null;
            this._removalsTail = null;
            // Keeps track of records where custom track by is the same, but item identity has changed
            this._identityChangesHead = null;
            this._identityChangesTail = null;
            this._trackByFn = isPresent(this._trackByFn) ? this._trackByFn : trackByIdentity;
        }
        Object.defineProperty(DefaultIterableDiffer.prototype, "collection", {
            get: function () { return this._collection; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DefaultIterableDiffer.prototype, "length", {
            get: function () { return this._length; },
            enumerable: true,
            configurable: true
        });
        DefaultIterableDiffer.prototype.forEachItem = function (fn) {
            var record;
            for (record = this._itHead; record !== null; record = record._next) {
                fn(record);
            }
        };
        DefaultIterableDiffer.prototype.forEachPreviousItem = function (fn) {
            var record;
            for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
                fn(record);
            }
        };
        DefaultIterableDiffer.prototype.forEachAddedItem = function (fn) {
            var record;
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
                fn(record);
            }
        };
        DefaultIterableDiffer.prototype.forEachMovedItem = function (fn) {
            var record;
            for (record = this._movesHead; record !== null; record = record._nextMoved) {
                fn(record);
            }
        };
        DefaultIterableDiffer.prototype.forEachRemovedItem = function (fn) {
            var record;
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
                fn(record);
            }
        };
        DefaultIterableDiffer.prototype.forEachIdentityChange = function (fn) {
            var record;
            for (record = this._identityChangesHead; record !== null; record = record._nextIdentityChange) {
                fn(record);
            }
        };
        DefaultIterableDiffer.prototype.diff = function (collection) {
            if (isBlank(collection))
                collection = [];
            if (!isListLikeIterable(collection)) {
                throw new BaseException("Error trying to diff '" + collection + "'");
            }
            if (this.check(collection)) {
                return this;
            }
            else {
                return null;
            }
        };
        DefaultIterableDiffer.prototype.onDestroy = function () { };
        // todo(vicb): optim for UnmodifiableListView (frozen arrays)
        DefaultIterableDiffer.prototype.check = function (collection) {
            var _this = this;
            this._reset();
            var record = this._itHead;
            var mayBeDirty = false;
            var index;
            var item;
            var itemTrackBy;
            if (isArray(collection)) {
                var list = collection;
                this._length = collection.length;
                for (index = 0; index < this._length; index++) {
                    item = list[index];
                    itemTrackBy = this._trackByFn(index, item);
                    if (record === null || !looseIdentical(record.trackById, itemTrackBy)) {
                        record = this._mismatch(record, item, itemTrackBy, index);
                        mayBeDirty = true;
                    }
                    else {
                        if (mayBeDirty) {
                            // TODO(misko): can we limit this to duplicates only?
                            record = this._verifyReinsertion(record, item, itemTrackBy, index);
                        }
                        if (!looseIdentical(record.item, item))
                            this._addIdentityChange(record, item);
                    }
                    record = record._next;
                }
            }
            else {
                index = 0;
                iterateListLike(collection, function (item) {
                    itemTrackBy = _this._trackByFn(index, item);
                    if (record === null || !looseIdentical(record.trackById, itemTrackBy)) {
                        record = _this._mismatch(record, item, itemTrackBy, index);
                        mayBeDirty = true;
                    }
                    else {
                        if (mayBeDirty) {
                            // TODO(misko): can we limit this to duplicates only?
                            record = _this._verifyReinsertion(record, item, itemTrackBy, index);
                        }
                        if (!looseIdentical(record.item, item))
                            _this._addIdentityChange(record, item);
                    }
                    record = record._next;
                    index++;
                });
                this._length = index;
            }
            this._truncate(record);
            this._collection = collection;
            return this.isDirty;
        };
        Object.defineProperty(DefaultIterableDiffer.prototype, "isDirty", {
            /* CollectionChanges is considered dirty if it has any additions, moves, removals, or identity
             * changes.
             */
            get: function () {
                return this._additionsHead !== null || this._movesHead !== null ||
                    this._removalsHead !== null || this._identityChangesHead !== null;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Reset the state of the change objects to show no changes. This means set previousKey to
         * currentKey, and clear all of the queues (additions, moves, removals).
         * Set the previousIndexes of moved and added items to their currentIndexes
         * Reset the list of additions, moves and removals
         *
         * @internal
         */
        DefaultIterableDiffer.prototype._reset = function () {
            if (this.isDirty) {
                var record;
                var nextRecord;
                for (record = this._previousItHead = this._itHead; record !== null; record = record._next) {
                    record._nextPrevious = record._next;
                }
                for (record = this._additionsHead; record !== null; record = record._nextAdded) {
                    record.previousIndex = record.currentIndex;
                }
                this._additionsHead = this._additionsTail = null;
                for (record = this._movesHead; record !== null; record = nextRecord) {
                    record.previousIndex = record.currentIndex;
                    nextRecord = record._nextMoved;
                }
                this._movesHead = this._movesTail = null;
                this._removalsHead = this._removalsTail = null;
                this._identityChangesHead = this._identityChangesTail = null;
            }
        };
        /**
         * This is the core function which handles differences between collections.
         *
         * - `record` is the record which we saw at this position last time. If null then it is a new
         *   item.
         * - `item` is the current item in the collection
         * - `index` is the position of the item in the collection
         *
         * @internal
         */
        DefaultIterableDiffer.prototype._mismatch = function (record, item, itemTrackBy, index) {
            // The previous record after which we will append the current one.
            var previousRecord;
            if (record === null) {
                previousRecord = this._itTail;
            }
            else {
                previousRecord = record._prev;
                // Remove the record from the collection since we know it does not match the item.
                this._remove(record);
            }
            // Attempt to see if we have seen the item before.
            record = this._linkedRecords === null ? null : this._linkedRecords.get(itemTrackBy, index);
            if (record !== null) {
                // We have seen this before, we need to move it forward in the collection.
                // But first we need to check if identity changed, so we can update in view if necessary
                if (!looseIdentical(record.item, item))
                    this._addIdentityChange(record, item);
                this._moveAfter(record, previousRecord, index);
            }
            else {
                // Never seen it, check evicted list.
                record = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy);
                if (record !== null) {
                    // It is an item which we have evicted earlier: reinsert it back into the list.
                    // But first we need to check if identity changed, so we can update in view if necessary
                    if (!looseIdentical(record.item, item))
                        this._addIdentityChange(record, item);
                    this._reinsertAfter(record, previousRecord, index);
                }
                else {
                    // It is a new item: add it.
                    record =
                        this._addAfter(new CollectionChangeRecord(item, itemTrackBy), previousRecord, index);
                }
            }
            return record;
        };
        /**
         * This check is only needed if an array contains duplicates. (Short circuit of nothing dirty)
         *
         * Use case: `[a, a]` => `[b, a, a]`
         *
         * If we did not have this check then the insertion of `b` would:
         *   1) evict first `a`
         *   2) insert `b` at `0` index.
         *   3) leave `a` at index `1` as is. <-- this is wrong!
         *   3) reinsert `a` at index 2. <-- this is wrong!
         *
         * The correct behavior is:
         *   1) evict first `a`
         *   2) insert `b` at `0` index.
         *   3) reinsert `a` at index 1.
         *   3) move `a` at from `1` to `2`.
         *
         *
         * Double check that we have not evicted a duplicate item. We need to check if the item type may
         * have already been removed:
         * The insertion of b will evict the first 'a'. If we don't reinsert it now it will be reinserted
         * at the end. Which will show up as the two 'a's switching position. This is incorrect, since a
         * better way to think of it is as insert of 'b' rather then switch 'a' with 'b' and then add 'a'
         * at the end.
         *
         * @internal
         */
        DefaultIterableDiffer.prototype._verifyReinsertion = function (record, item, itemTrackBy, index) {
            var reinsertRecord = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy);
            if (reinsertRecord !== null) {
                record = this._reinsertAfter(reinsertRecord, record._prev, index);
            }
            else if (record.currentIndex != index) {
                record.currentIndex = index;
                this._addToMoves(record, index);
            }
            return record;
        };
        /**
         * Get rid of any excess {@link CollectionChangeRecord}s from the previous collection
         *
         * - `record` The first excess {@link CollectionChangeRecord}.
         *
         * @internal
         */
        DefaultIterableDiffer.prototype._truncate = function (record) {
            // Anything after that needs to be removed;
            while (record !== null) {
                var nextRecord = record._next;
                this._addToRemovals(this._unlink(record));
                record = nextRecord;
            }
            if (this._unlinkedRecords !== null) {
                this._unlinkedRecords.clear();
            }
            if (this._additionsTail !== null) {
                this._additionsTail._nextAdded = null;
            }
            if (this._movesTail !== null) {
                this._movesTail._nextMoved = null;
            }
            if (this._itTail !== null) {
                this._itTail._next = null;
            }
            if (this._removalsTail !== null) {
                this._removalsTail._nextRemoved = null;
            }
            if (this._identityChangesTail !== null) {
                this._identityChangesTail._nextIdentityChange = null;
            }
        };
        /** @internal */
        DefaultIterableDiffer.prototype._reinsertAfter = function (record, prevRecord, index) {
            if (this._unlinkedRecords !== null) {
                this._unlinkedRecords.remove(record);
            }
            var prev = record._prevRemoved;
            var next = record._nextRemoved;
            if (prev === null) {
                this._removalsHead = next;
            }
            else {
                prev._nextRemoved = next;
            }
            if (next === null) {
                this._removalsTail = prev;
            }
            else {
                next._prevRemoved = prev;
            }
            this._insertAfter(record, prevRecord, index);
            this._addToMoves(record, index);
            return record;
        };
        /** @internal */
        DefaultIterableDiffer.prototype._moveAfter = function (record, prevRecord, index) {
            this._unlink(record);
            this._insertAfter(record, prevRecord, index);
            this._addToMoves(record, index);
            return record;
        };
        /** @internal */
        DefaultIterableDiffer.prototype._addAfter = function (record, prevRecord, index) {
            this._insertAfter(record, prevRecord, index);
            if (this._additionsTail === null) {
                // todo(vicb)
                // assert(this._additionsHead === null);
                this._additionsTail = this._additionsHead = record;
            }
            else {
                // todo(vicb)
                // assert(_additionsTail._nextAdded === null);
                // assert(record._nextAdded === null);
                this._additionsTail = this._additionsTail._nextAdded = record;
            }
            return record;
        };
        /** @internal */
        DefaultIterableDiffer.prototype._insertAfter = function (record, prevRecord, index) {
            // todo(vicb)
            // assert(record != prevRecord);
            // assert(record._next === null);
            // assert(record._prev === null);
            var next = prevRecord === null ? this._itHead : prevRecord._next;
            // todo(vicb)
            // assert(next != record);
            // assert(prevRecord != record);
            record._next = next;
            record._prev = prevRecord;
            if (next === null) {
                this._itTail = record;
            }
            else {
                next._prev = record;
            }
            if (prevRecord === null) {
                this._itHead = record;
            }
            else {
                prevRecord._next = record;
            }
            if (this._linkedRecords === null) {
                this._linkedRecords = new _DuplicateMap();
            }
            this._linkedRecords.put(record);
            record.currentIndex = index;
            return record;
        };
        /** @internal */
        DefaultIterableDiffer.prototype._remove = function (record) {
            return this._addToRemovals(this._unlink(record));
        };
        /** @internal */
        DefaultIterableDiffer.prototype._unlink = function (record) {
            if (this._linkedRecords !== null) {
                this._linkedRecords.remove(record);
            }
            var prev = record._prev;
            var next = record._next;
            // todo(vicb)
            // assert((record._prev = null) === null);
            // assert((record._next = null) === null);
            if (prev === null) {
                this._itHead = next;
            }
            else {
                prev._next = next;
            }
            if (next === null) {
                this._itTail = prev;
            }
            else {
                next._prev = prev;
            }
            return record;
        };
        /** @internal */
        DefaultIterableDiffer.prototype._addToMoves = function (record, toIndex) {
            // todo(vicb)
            // assert(record._nextMoved === null);
            if (record.previousIndex === toIndex) {
                return record;
            }
            if (this._movesTail === null) {
                // todo(vicb)
                // assert(_movesHead === null);
                this._movesTail = this._movesHead = record;
            }
            else {
                // todo(vicb)
                // assert(_movesTail._nextMoved === null);
                this._movesTail = this._movesTail._nextMoved = record;
            }
            return record;
        };
        /** @internal */
        DefaultIterableDiffer.prototype._addToRemovals = function (record) {
            if (this._unlinkedRecords === null) {
                this._unlinkedRecords = new _DuplicateMap();
            }
            this._unlinkedRecords.put(record);
            record.currentIndex = null;
            record._nextRemoved = null;
            if (this._removalsTail === null) {
                // todo(vicb)
                // assert(_removalsHead === null);
                this._removalsTail = this._removalsHead = record;
                record._prevRemoved = null;
            }
            else {
                // todo(vicb)
                // assert(_removalsTail._nextRemoved === null);
                // assert(record._nextRemoved === null);
                record._prevRemoved = this._removalsTail;
                this._removalsTail = this._removalsTail._nextRemoved = record;
            }
            return record;
        };
        /** @internal */
        DefaultIterableDiffer.prototype._addIdentityChange = function (record, item) {
            record.item = item;
            if (this._identityChangesTail === null) {
                this._identityChangesTail = this._identityChangesHead = record;
            }
            else {
                this._identityChangesTail = this._identityChangesTail._nextIdentityChange = record;
            }
            return record;
        };
        DefaultIterableDiffer.prototype.toString = function () {
            var list = [];
            this.forEachItem(function (record) { return list.push(record); });
            var previous = [];
            this.forEachPreviousItem(function (record) { return previous.push(record); });
            var additions = [];
            this.forEachAddedItem(function (record) { return additions.push(record); });
            var moves = [];
            this.forEachMovedItem(function (record) { return moves.push(record); });
            var removals = [];
            this.forEachRemovedItem(function (record) { return removals.push(record); });
            var identityChanges = [];
            this.forEachIdentityChange(function (record) { return identityChanges.push(record); });
            return "collection: " + list.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" +
                "additions: " + additions.join(', ') + "\n" + "moves: " + moves.join(', ') + "\n" +
                "removals: " + removals.join(', ') + "\n" + "identityChanges: " +
                identityChanges.join(', ') + "\n";
        };
        return DefaultIterableDiffer;
    }());
    var CollectionChangeRecord = (function () {
        function CollectionChangeRecord(item, trackById) {
            this.item = item;
            this.trackById = trackById;
            this.currentIndex = null;
            this.previousIndex = null;
            /** @internal */
            this._nextPrevious = null;
            /** @internal */
            this._prev = null;
            /** @internal */
            this._next = null;
            /** @internal */
            this._prevDup = null;
            /** @internal */
            this._nextDup = null;
            /** @internal */
            this._prevRemoved = null;
            /** @internal */
            this._nextRemoved = null;
            /** @internal */
            this._nextAdded = null;
            /** @internal */
            this._nextMoved = null;
            /** @internal */
            this._nextIdentityChange = null;
        }
        CollectionChangeRecord.prototype.toString = function () {
            return this.previousIndex === this.currentIndex ?
                stringify(this.item) :
                stringify(this.item) + '[' + stringify(this.previousIndex) + '->' +
                    stringify(this.currentIndex) + ']';
        };
        return CollectionChangeRecord;
    }());
    // A linked list of CollectionChangeRecords with the same CollectionChangeRecord.item
    var _DuplicateItemRecordList = (function () {
        function _DuplicateItemRecordList() {
            /** @internal */
            this._head = null;
            /** @internal */
            this._tail = null;
        }
        /**
         * Append the record to the list of duplicates.
         *
         * Note: by design all records in the list of duplicates hold the same value in record.item.
         */
        _DuplicateItemRecordList.prototype.add = function (record) {
            if (this._head === null) {
                this._head = this._tail = record;
                record._nextDup = null;
                record._prevDup = null;
            }
            else {
                // todo(vicb)
                // assert(record.item ==  _head.item ||
                //       record.item is num && record.item.isNaN && _head.item is num && _head.item.isNaN);
                this._tail._nextDup = record;
                record._prevDup = this._tail;
                record._nextDup = null;
                this._tail = record;
            }
        };
        // Returns a CollectionChangeRecord having CollectionChangeRecord.trackById == trackById and
        // CollectionChangeRecord.currentIndex >= afterIndex
        _DuplicateItemRecordList.prototype.get = function (trackById, afterIndex) {
            var record;
            for (record = this._head; record !== null; record = record._nextDup) {
                if ((afterIndex === null || afterIndex < record.currentIndex) &&
                    looseIdentical(record.trackById, trackById)) {
                    return record;
                }
            }
            return null;
        };
        /**
         * Remove one {@link CollectionChangeRecord} from the list of duplicates.
         *
         * Returns whether the list of duplicates is empty.
         */
        _DuplicateItemRecordList.prototype.remove = function (record) {
            // todo(vicb)
            // assert(() {
            //  // verify that the record being removed is in the list.
            //  for (CollectionChangeRecord cursor = _head; cursor != null; cursor = cursor._nextDup) {
            //    if (identical(cursor, record)) return true;
            //  }
            //  return false;
            //});
            var prev = record._prevDup;
            var next = record._nextDup;
            if (prev === null) {
                this._head = next;
            }
            else {
                prev._nextDup = next;
            }
            if (next === null) {
                this._tail = prev;
            }
            else {
                next._prevDup = prev;
            }
            return this._head === null;
        };
        return _DuplicateItemRecordList;
    }());
    var _DuplicateMap = (function () {
        function _DuplicateMap() {
            this.map = new Map();
        }
        _DuplicateMap.prototype.put = function (record) {
            // todo(vicb) handle corner cases
            var key = getMapKey(record.trackById);
            var duplicates = this.map.get(key);
            if (!isPresent(duplicates)) {
                duplicates = new _DuplicateItemRecordList();
                this.map.set(key, duplicates);
            }
            duplicates.add(record);
        };
        /**
         * Retrieve the `value` using key. Because the CollectionChangeRecord value may be one which we
         * have already iterated over, we use the afterIndex to pretend it is not there.
         *
         * Use case: `[a, b, c, a, a]` if we are at index `3` which is the second `a` then asking if we
         * have any more `a`s needs to return the last `a` not the first or second.
         */
        _DuplicateMap.prototype.get = function (trackById, afterIndex) {
            if (afterIndex === void 0) { afterIndex = null; }
            var key = getMapKey(trackById);
            var recordList = this.map.get(key);
            return isBlank(recordList) ? null : recordList.get(trackById, afterIndex);
        };
        /**
         * Removes a {@link CollectionChangeRecord} from the list of duplicates.
         *
         * The list of duplicates also is removed from the map if it gets empty.
         */
        _DuplicateMap.prototype.remove = function (record) {
            var key = getMapKey(record.trackById);
            // todo(vicb)
            // assert(this.map.containsKey(key));
            var recordList = this.map.get(key);
            // Remove the list of duplicates when it gets empty
            if (recordList.remove(record)) {
                this.map.delete(key);
            }
            return record;
        };
        Object.defineProperty(_DuplicateMap.prototype, "isEmpty", {
            get: function () { return this.map.size === 0; },
            enumerable: true,
            configurable: true
        });
        _DuplicateMap.prototype.clear = function () { this.map.clear(); };
        _DuplicateMap.prototype.toString = function () { return '_DuplicateMap(' + stringify(this.map) + ')'; };
        return _DuplicateMap;
    }());
    /**
     * A repository of different Map diffing strategies used by NgClass, NgStyle, and others.
     * @ts2dart_const
     */
    var KeyValueDiffers = (function () {
        /*@ts2dart_const*/
        function KeyValueDiffers(factories) {
            this.factories = factories;
        }
        KeyValueDiffers.create = function (factories, parent) {
            if (isPresent(parent)) {
                var copied = ListWrapper.clone(parent.factories);
                factories = factories.concat(copied);
                return new KeyValueDiffers(factories);
            }
            else {
                return new KeyValueDiffers(factories);
            }
        };
        /**
         * Takes an array of {@link KeyValueDifferFactory} and returns a provider used to extend the
         * inherited {@link KeyValueDiffers} instance with the provided factories and return a new
         * {@link KeyValueDiffers} instance.
         *
         * The following example shows how to extend an existing list of factories,
               * which will only be applied to the injector for this component and its children.
               * This step is all that's required to make a new {@link KeyValueDiffer} available.
         *
         * ### Example
         *
         * ```
         * @Component({
         *   viewProviders: [
         *     KeyValueDiffers.extend([new ImmutableMapDiffer()])
         *   ]
         * })
         * ```
         */
        KeyValueDiffers.extend = function (factories) {
            return new Provider(KeyValueDiffers, {
                useFactory: function (parent) {
                    if (isBlank(parent)) {
                        // Typically would occur when calling KeyValueDiffers.extend inside of dependencies passed
                        // to
                        // bootstrap(), which would override default pipes instead of extending them.
                        throw new BaseException('Cannot extend KeyValueDiffers without a parent injector');
                    }
                    return KeyValueDiffers.create(factories, parent);
                },
                // Dependency technically isn't optional, but we can provide a better error message this way.
                deps: [[KeyValueDiffers, new SkipSelfMetadata(), new OptionalMetadata()]]
            });
        };
        KeyValueDiffers.prototype.find = function (kv) {
            var factory = this.factories.find(function (f) { return f.supports(kv); });
            if (isPresent(factory)) {
                return factory;
            }
            else {
                throw new BaseException("Cannot find a differ supporting object '" + kv + "'");
            }
        };
        return KeyValueDiffers;
    }());
    /* @ts2dart_const */
    var DefaultKeyValueDifferFactory = (function () {
        function DefaultKeyValueDifferFactory() {
        }
        DefaultKeyValueDifferFactory.prototype.supports = function (obj) { return obj instanceof Map || isJsObject(obj); };
        DefaultKeyValueDifferFactory.prototype.create = function (cdRef) { return new DefaultKeyValueDiffer(); };
        return DefaultKeyValueDifferFactory;
    }());
    var DefaultKeyValueDiffer = (function () {
        function DefaultKeyValueDiffer() {
            this._records = new Map();
            this._mapHead = null;
            this._previousMapHead = null;
            this._changesHead = null;
            this._changesTail = null;
            this._additionsHead = null;
            this._additionsTail = null;
            this._removalsHead = null;
            this._removalsTail = null;
        }
        Object.defineProperty(DefaultKeyValueDiffer.prototype, "isDirty", {
            get: function () {
                return this._additionsHead !== null || this._changesHead !== null ||
                    this._removalsHead !== null;
            },
            enumerable: true,
            configurable: true
        });
        DefaultKeyValueDiffer.prototype.forEachItem = function (fn) {
            var record;
            for (record = this._mapHead; record !== null; record = record._next) {
                fn(record);
            }
        };
        DefaultKeyValueDiffer.prototype.forEachPreviousItem = function (fn) {
            var record;
            for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
                fn(record);
            }
        };
        DefaultKeyValueDiffer.prototype.forEachChangedItem = function (fn) {
            var record;
            for (record = this._changesHead; record !== null; record = record._nextChanged) {
                fn(record);
            }
        };
        DefaultKeyValueDiffer.prototype.forEachAddedItem = function (fn) {
            var record;
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
                fn(record);
            }
        };
        DefaultKeyValueDiffer.prototype.forEachRemovedItem = function (fn) {
            var record;
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
                fn(record);
            }
        };
        DefaultKeyValueDiffer.prototype.diff = function (map) {
            if (isBlank(map))
                map = MapWrapper.createFromPairs([]);
            if (!(map instanceof Map || isJsObject(map))) {
                throw new BaseException("Error trying to diff '" + map + "'");
            }
            if (this.check(map)) {
                return this;
            }
            else {
                return null;
            }
        };
        DefaultKeyValueDiffer.prototype.onDestroy = function () { };
        DefaultKeyValueDiffer.prototype.check = function (map) {
            var _this = this;
            this._reset();
            var records = this._records;
            var oldSeqRecord = this._mapHead;
            var lastOldSeqRecord = null;
            var lastNewSeqRecord = null;
            var seqChanged = false;
            this._forEach(map, function (value, key) {
                var newSeqRecord;
                if (oldSeqRecord !== null && key === oldSeqRecord.key) {
                    newSeqRecord = oldSeqRecord;
                    if (!looseIdentical(value, oldSeqRecord.currentValue)) {
                        oldSeqRecord.previousValue = oldSeqRecord.currentValue;
                        oldSeqRecord.currentValue = value;
                        _this._addToChanges(oldSeqRecord);
                    }
                }
                else {
                    seqChanged = true;
                    if (oldSeqRecord !== null) {
                        oldSeqRecord._next = null;
                        _this._removeFromSeq(lastOldSeqRecord, oldSeqRecord);
                        _this._addToRemovals(oldSeqRecord);
                    }
                    if (records.has(key)) {
                        newSeqRecord = records.get(key);
                    }
                    else {
                        newSeqRecord = new KeyValueChangeRecord(key);
                        records.set(key, newSeqRecord);
                        newSeqRecord.currentValue = value;
                        _this._addToAdditions(newSeqRecord);
                    }
                }
                if (seqChanged) {
                    if (_this._isInRemovals(newSeqRecord)) {
                        _this._removeFromRemovals(newSeqRecord);
                    }
                    if (lastNewSeqRecord == null) {
                        _this._mapHead = newSeqRecord;
                    }
                    else {
                        lastNewSeqRecord._next = newSeqRecord;
                    }
                }
                lastOldSeqRecord = oldSeqRecord;
                lastNewSeqRecord = newSeqRecord;
                oldSeqRecord = oldSeqRecord === null ? null : oldSeqRecord._next;
            });
            this._truncate(lastOldSeqRecord, oldSeqRecord);
            return this.isDirty;
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._reset = function () {
            if (this.isDirty) {
                var record;
                // Record the state of the mapping
                for (record = this._previousMapHead = this._mapHead; record !== null; record = record._next) {
                    record._nextPrevious = record._next;
                }
                for (record = this._changesHead; record !== null; record = record._nextChanged) {
                    record.previousValue = record.currentValue;
                }
                for (record = this._additionsHead; record != null; record = record._nextAdded) {
                    record.previousValue = record.currentValue;
                }
                // todo(vicb) once assert is supported
                // assert(() {
                //  var r = _changesHead;
                //  while (r != null) {
                //    var nextRecord = r._nextChanged;
                //    r._nextChanged = null;
                //    r = nextRecord;
                //  }
                //
                //  r = _additionsHead;
                //  while (r != null) {
                //    var nextRecord = r._nextAdded;
                //    r._nextAdded = null;
                //    r = nextRecord;
                //  }
                //
                //  r = _removalsHead;
                //  while (r != null) {
                //    var nextRecord = r._nextRemoved;
                //    r._nextRemoved = null;
                //    r = nextRecord;
                //  }
                //
                //  return true;
                //});
                this._changesHead = this._changesTail = null;
                this._additionsHead = this._additionsTail = null;
                this._removalsHead = this._removalsTail = null;
            }
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._truncate = function (lastRecord, record) {
            while (record !== null) {
                if (lastRecord === null) {
                    this._mapHead = null;
                }
                else {
                    lastRecord._next = null;
                }
                var nextRecord = record._next;
                // todo(vicb) assert
                // assert((() {
                //  record._next = null;
                //  return true;
                //}));
                this._addToRemovals(record);
                lastRecord = record;
                record = nextRecord;
            }
            for (var rec = this._removalsHead; rec !== null; rec = rec._nextRemoved) {
                rec.previousValue = rec.currentValue;
                rec.currentValue = null;
                this._records.delete(rec.key);
            }
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._isInRemovals = function (record) {
            return record === this._removalsHead || record._nextRemoved !== null ||
                record._prevRemoved !== null;
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._addToRemovals = function (record) {
            // todo(vicb) assert
            // assert(record._next == null);
            // assert(record._nextAdded == null);
            // assert(record._nextChanged == null);
            // assert(record._nextRemoved == null);
            // assert(record._prevRemoved == null);
            if (this._removalsHead === null) {
                this._removalsHead = this._removalsTail = record;
            }
            else {
                this._removalsTail._nextRemoved = record;
                record._prevRemoved = this._removalsTail;
                this._removalsTail = record;
            }
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._removeFromSeq = function (prev, record) {
            var next = record._next;
            if (prev === null) {
                this._mapHead = next;
            }
            else {
                prev._next = next;
            }
            // todo(vicb) assert
            // assert((() {
            //  record._next = null;
            //  return true;
            //})());
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._removeFromRemovals = function (record) {
            // todo(vicb) assert
            // assert(record._next == null);
            // assert(record._nextAdded == null);
            // assert(record._nextChanged == null);
            var prev = record._prevRemoved;
            var next = record._nextRemoved;
            if (prev === null) {
                this._removalsHead = next;
            }
            else {
                prev._nextRemoved = next;
            }
            if (next === null) {
                this._removalsTail = prev;
            }
            else {
                next._prevRemoved = prev;
            }
            record._prevRemoved = record._nextRemoved = null;
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._addToAdditions = function (record) {
            // todo(vicb): assert
            // assert(record._next == null);
            // assert(record._nextAdded == null);
            // assert(record._nextChanged == null);
            // assert(record._nextRemoved == null);
            // assert(record._prevRemoved == null);
            if (this._additionsHead === null) {
                this._additionsHead = this._additionsTail = record;
            }
            else {
                this._additionsTail._nextAdded = record;
                this._additionsTail = record;
            }
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._addToChanges = function (record) {
            // todo(vicb) assert
            // assert(record._nextAdded == null);
            // assert(record._nextChanged == null);
            // assert(record._nextRemoved == null);
            // assert(record._prevRemoved == null);
            if (this._changesHead === null) {
                this._changesHead = this._changesTail = record;
            }
            else {
                this._changesTail._nextChanged = record;
                this._changesTail = record;
            }
        };
        DefaultKeyValueDiffer.prototype.toString = function () {
            var items = [];
            var previous = [];
            var changes = [];
            var additions = [];
            var removals = [];
            var record;
            for (record = this._mapHead; record !== null; record = record._next) {
                items.push(stringify(record));
            }
            for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
                previous.push(stringify(record));
            }
            for (record = this._changesHead; record !== null; record = record._nextChanged) {
                changes.push(stringify(record));
            }
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
                additions.push(stringify(record));
            }
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
                removals.push(stringify(record));
            }
            return "map: " + items.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" +
                "additions: " + additions.join(', ') + "\n" + "changes: " + changes.join(', ') + "\n" +
                "removals: " + removals.join(', ') + "\n";
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._forEach = function (obj, fn) {
            if (obj instanceof Map) {
                obj.forEach(fn);
            }
            else {
                StringMapWrapper.forEach(obj, fn);
            }
        };
        return DefaultKeyValueDiffer;
    }());
    var KeyValueChangeRecord = (function () {
        function KeyValueChangeRecord(key) {
            this.key = key;
            this.previousValue = null;
            this.currentValue = null;
            /** @internal */
            this._nextPrevious = null;
            /** @internal */
            this._next = null;
            /** @internal */
            this._nextAdded = null;
            /** @internal */
            this._nextRemoved = null;
            /** @internal */
            this._prevRemoved = null;
            /** @internal */
            this._nextChanged = null;
        }
        KeyValueChangeRecord.prototype.toString = function () {
            return looseIdentical(this.previousValue, this.currentValue) ?
                stringify(this.key) :
                (stringify(this.key) + '[' + stringify(this.previousValue) + '->' +
                    stringify(this.currentValue) + ']');
        };
        return KeyValueChangeRecord;
    }());
    var ChangeDetectorRef = (function () {
        function ChangeDetectorRef() {
        }
        return ChangeDetectorRef;
    }());
    var uninitialized = new Object();
    function devModeEqual(a, b) {
        if (isListLikeIterable(a) && isListLikeIterable(b)) {
            return areIterablesEqual(a, b, devModeEqual);
        }
        else if (!isListLikeIterable(a) && !isPrimitive(a) && !isListLikeIterable(b) &&
            !isPrimitive(b)) {
            return true;
        }
        else {
            return looseIdentical(a, b);
        }
    }
    /**
     * Indicates that the result of a {@link PipeMetadata} transformation has changed even though the
     * reference
     * has not changed.
     *
     * The wrapped value will be unwrapped by change detection, and the unwrapped value will be stored.
     *
     * Example:
     *
     * ```
     * if (this._latestValue === this._latestReturnedValue) {
     *    return this._latestReturnedValue;
     *  } else {
     *    this._latestReturnedValue = this._latestValue;
     *    return WrappedValue.wrap(this._latestValue); // this will force update
     *  }
     * ```
     */
    var WrappedValue = (function () {
        function WrappedValue(wrapped) {
            this.wrapped = wrapped;
        }
        WrappedValue.wrap = function (value) { return new WrappedValue(value); };
        return WrappedValue;
    }());
    /**
     * Helper class for unwrapping WrappedValue s
     */
    var ValueUnwrapper = (function () {
        function ValueUnwrapper() {
            this.hasWrappedValue = false;
        }
        ValueUnwrapper.prototype.unwrap = function (value) {
            if (value instanceof WrappedValue) {
                this.hasWrappedValue = true;
                return value.wrapped;
            }
            return value;
        };
        ValueUnwrapper.prototype.reset = function () { this.hasWrappedValue = false; };
        return ValueUnwrapper;
    }());
    /**
     * Structural diffing for `Object`s and `Map`s.
     */
    var keyValDiff = 
    /*@ts2dart_const*/ [new DefaultKeyValueDifferFactory()];
    /**
     * Structural diffing for `Iterable` types such as `Array`s.
     */
    var iterableDiff = 
    /*@ts2dart_const*/ [new DefaultIterableDifferFactory()];
    var defaultIterableDiffers = new IterableDiffers(iterableDiff);
    var defaultKeyValueDiffers = new KeyValueDiffers(keyValDiff);
    var RenderComponentType = (function () {
        function RenderComponentType(id, templateUrl, slotCount, encapsulation, styles) {
            this.id = id;
            this.templateUrl = templateUrl;
            this.slotCount = slotCount;
            this.encapsulation = encapsulation;
            this.styles = styles;
        }
        return RenderComponentType;
    }());
    var RenderDebugInfo = (function () {
        function RenderDebugInfo() {
        }
        Object.defineProperty(RenderDebugInfo.prototype, "injector", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RenderDebugInfo.prototype, "component", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RenderDebugInfo.prototype, "providerTokens", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RenderDebugInfo.prototype, "references", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RenderDebugInfo.prototype, "context", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RenderDebugInfo.prototype, "source", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        return RenderDebugInfo;
    }());
    var Renderer = (function () {
        function Renderer() {
        }
        return Renderer;
    }());
    /**
     * Injectable service that provides a low-level interface for modifying the UI.
     *
     * Use this service to bypass Angular's templating and make custom UI changes that can't be
     * expressed declaratively. For example if you need to set a property or an attribute whose name is
     * not statically known, use {@link #setElementProperty} or {@link #setElementAttribute}
     * respectively.
     *
     * If you are implementing a custom renderer, you must implement this interface.
     *
     * The default Renderer implementation is `DomRenderer`. Also available is `WebWorkerRenderer`.
     */
    var RootRenderer = (function () {
        function RootRenderer() {
        }
        return RootRenderer;
    }());
    var ViewUtils = (function () {
        function ViewUtils(_renderer, _appId, sanitizer) {
            this._renderer = _renderer;
            this._appId = _appId;
            this._nextCompTypeId = 0;
            this.sanitizer = sanitizer;
        }
        /**
         * Used by the generated code
         */
        ViewUtils.prototype.createRenderComponentType = function (templateUrl, slotCount, encapsulation, styles) {
            return new RenderComponentType(this._appId + "-" + this._nextCompTypeId++, templateUrl, slotCount, encapsulation, styles);
        };
        /** @internal */
        ViewUtils.prototype.renderComponent = function (renderComponentType) {
            return this._renderer.renderComponent(renderComponentType);
        };
        return ViewUtils;
    }());
    ViewUtils.decorators = [
        { type: Injectable },
    ];
    ViewUtils.ctorParameters = [
        { type: RootRenderer, },
        { type: undefined, decorators: [{ type: Inject, args: [APP_ID,] },] },
        { type: SanitizationService, },
    ];
    function flattenNestedViewRenderNodes(nodes) {
        return _flattenNestedViewRenderNodes(nodes, []);
    }
    function _flattenNestedViewRenderNodes(nodes, renderNodes) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node instanceof AppElement) {
                var appEl = node;
                renderNodes.push(appEl.nativeElement);
                if (isPresent(appEl.nestedViews)) {
                    for (var k = 0; k < appEl.nestedViews.length; k++) {
                        _flattenNestedViewRenderNodes(appEl.nestedViews[k].rootNodesOrAppElements, renderNodes);
                    }
                }
            }
            else {
                renderNodes.push(node);
            }
        }
        return renderNodes;
    }
    var EMPTY_ARR = [];
    function ensureSlotCount(projectableNodes, expectedSlotCount) {
        var res;
        if (isBlank(projectableNodes)) {
            res = EMPTY_ARR;
        }
        else if (projectableNodes.length < expectedSlotCount) {
            var givenSlotCount = projectableNodes.length;
            res = ListWrapper.createFixedSize(expectedSlotCount);
            for (var i = 0; i < expectedSlotCount; i++) {
                res[i] = (i < givenSlotCount) ? projectableNodes[i] : EMPTY_ARR;
            }
        }
        else {
            res = projectableNodes;
        }
        return res;
    }
    var MAX_INTERPOLATION_VALUES = 9;
    function interpolate(valueCount, c0, a1, c1, a2, c2, a3, c3, a4, c4, a5, c5, a6, c6, a7, c7, a8, c8, a9, c9) {
        switch (valueCount) {
            case 1:
                return c0 + _toStringWithNull(a1) + c1;
            case 2:
                return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2;
            case 3:
                return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                    c3;
            case 4:
                return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                    c3 + _toStringWithNull(a4) + c4;
            case 5:
                return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                    c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5;
            case 6:
                return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                    c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
                    c6;
            case 7:
                return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                    c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
                    c6 + _toStringWithNull(a7) + c7;
            case 8:
                return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                    c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
                    c6 + _toStringWithNull(a7) + c7 + _toStringWithNull(a8) + c8;
            case 9:
                return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                    c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
                    c6 + _toStringWithNull(a7) + c7 + _toStringWithNull(a8) + c8 + _toStringWithNull(a9) +
                    c9;
            default:
                throw new BaseException("Does not support more than 9 expressions");
        }
    }
    function _toStringWithNull(v) {
        return v != null ? v.toString() : '';
    }
    function checkBinding(throwOnChange, oldValue, newValue) {
        if (throwOnChange) {
            if (!devModeEqual(oldValue, newValue)) {
                throw new ExpressionChangedAfterItHasBeenCheckedException(oldValue, newValue, null);
            }
            return false;
        }
        else {
            return !looseIdentical(oldValue, newValue);
        }
    }
    function castByValue(input, value) {
        return input;
    }
    var EMPTY_ARRAY = [];
    var EMPTY_MAP = {};
    function pureProxy1(fn) {
        var result;
        var v0;
        v0 = uninitialized;
        return function (p0) {
            if (!looseIdentical(v0, p0)) {
                v0 = p0;
                result = fn(p0);
            }
            return result;
        };
    }
    function pureProxy2(fn) {
        var result;
        var v0, v1;
        v0 = v1 = uninitialized;
        return function (p0, p1) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1)) {
                v0 = p0;
                v1 = p1;
                result = fn(p0, p1);
            }
            return result;
        };
    }
    function pureProxy3(fn) {
        var result;
        var v0, v1, v2;
        v0 = v1 = v2 = uninitialized;
        return function (p0, p1, p2) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2)) {
                v0 = p0;
                v1 = p1;
                v2 = p2;
                result = fn(p0, p1, p2);
            }
            return result;
        };
    }
    function pureProxy4(fn) {
        var result;
        var v0, v1, v2, v3;
        v0 = v1 = v2 = v3 = uninitialized;
        return function (p0, p1, p2, p3) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
                !looseIdentical(v3, p3)) {
                v0 = p0;
                v1 = p1;
                v2 = p2;
                v3 = p3;
                result = fn(p0, p1, p2, p3);
            }
            return result;
        };
    }
    function pureProxy5(fn) {
        var result;
        var v0, v1, v2, v3, v4;
        v0 = v1 = v2 = v3 = v4 = uninitialized;
        return function (p0, p1, p2, p3, p4) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
                !looseIdentical(v3, p3) || !looseIdentical(v4, p4)) {
                v0 = p0;
                v1 = p1;
                v2 = p2;
                v3 = p3;
                v4 = p4;
                result = fn(p0, p1, p2, p3, p4);
            }
            return result;
        };
    }
    function pureProxy6(fn) {
        var result;
        var v0, v1, v2, v3, v4, v5;
        v0 = v1 = v2 = v3 = v4 = v5 = uninitialized;
        return function (p0, p1, p2, p3, p4, p5) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
                !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5)) {
                v0 = p0;
                v1 = p1;
                v2 = p2;
                v3 = p3;
                v4 = p4;
                v5 = p5;
                result = fn(p0, p1, p2, p3, p4, p5);
            }
            return result;
        };
    }
    function pureProxy7(fn) {
        var result;
        var v0, v1, v2, v3, v4, v5, v6;
        v0 = v1 = v2 = v3 = v4 = v5 = v6 = uninitialized;
        return function (p0, p1, p2, p3, p4, p5, p6) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
                !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5) ||
                !looseIdentical(v6, p6)) {
                v0 = p0;
                v1 = p1;
                v2 = p2;
                v3 = p3;
                v4 = p4;
                v5 = p5;
                v6 = p6;
                result = fn(p0, p1, p2, p3, p4, p5, p6);
            }
            return result;
        };
    }
    function pureProxy8(fn) {
        var result;
        var v0, v1, v2, v3, v4, v5, v6, v7;
        v0 = v1 = v2 = v3 = v4 = v5 = v6 = v7 = uninitialized;
        return function (p0, p1, p2, p3, p4, p5, p6, p7) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
                !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5) ||
                !looseIdentical(v6, p6) || !looseIdentical(v7, p7)) {
                v0 = p0;
                v1 = p1;
                v2 = p2;
                v3 = p3;
                v4 = p4;
                v5 = p5;
                v6 = p6;
                v7 = p7;
                result = fn(p0, p1, p2, p3, p4, p5, p6, p7);
            }
            return result;
        };
    }
    function pureProxy9(fn) {
        var result;
        var v0, v1, v2, v3, v4, v5, v6, v7, v8;
        v0 = v1 = v2 = v3 = v4 = v5 = v6 = v7 = v8 = uninitialized;
        return function (p0, p1, p2, p3, p4, p5, p6, p7, p8) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
                !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5) ||
                !looseIdentical(v6, p6) || !looseIdentical(v7, p7) || !looseIdentical(v8, p8)) {
                v0 = p0;
                v1 = p1;
                v2 = p2;
                v3 = p3;
                v4 = p4;
                v5 = p5;
                v6 = p6;
                v7 = p7;
                v8 = p8;
                result = fn(p0, p1, p2, p3, p4, p5, p6, p7, p8);
            }
            return result;
        };
    }
    function pureProxy10(fn) {
        var result;
        var v0, v1, v2, v3, v4, v5, v6, v7, v8, v9;
        v0 = v1 = v2 = v3 = v4 = v5 = v6 = v7 = v8 = v9 = uninitialized;
        return function (p0, p1, p2, p3, p4, p5, p6, p7, p8, p9) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
                !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5) ||
                !looseIdentical(v6, p6) || !looseIdentical(v7, p7) || !looseIdentical(v8, p8) ||
                !looseIdentical(v9, p9)) {
                v0 = p0;
                v1 = p1;
                v2 = p2;
                v3 = p3;
                v4 = p4;
                v5 = p5;
                v6 = p6;
                v7 = p7;
                v8 = p8;
                v9 = p9;
                result = fn(p0, p1, p2, p3, p4, p5, p6, p7, p8, p9);
            }
            return result;
        };
    }
    /**
     * Represents an instance of a Component created via a {@link ComponentFactory}.
     *
     * `ComponentRef` provides access to the Component Instance as well other objects related to this
     * Component Instance and allows you to destroy the Component Instance via the {@link #destroy}
     * method.
     */
    var ComponentRef = (function () {
        function ComponentRef() {
        }
        Object.defineProperty(ComponentRef.prototype, "location", {
            /**
             * Location of the Host Element of this Component Instance.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentRef.prototype, "injector", {
            /**
             * The injector on which the component instance exists.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentRef.prototype, "instance", {
            /**
             * The instance of the Component.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ComponentRef.prototype, "hostView", {
            /**
             * The {@link ViewRef} of the Host View of this Component instance.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ComponentRef.prototype, "changeDetectorRef", {
            /**
             * The {@link ChangeDetectorRef} of the Component instance.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentRef.prototype, "componentType", {
            /**
             * The component type.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        return ComponentRef;
    }());
    var ComponentRef_ = (function (_super) {
        __extends(ComponentRef_, _super);
        function ComponentRef_(_hostElement, _componentType) {
            _super.call(this);
            this._hostElement = _hostElement;
            this._componentType = _componentType;
        }
        Object.defineProperty(ComponentRef_.prototype, "location", {
            get: function () { return this._hostElement.elementRef; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentRef_.prototype, "injector", {
            get: function () { return this._hostElement.injector; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentRef_.prototype, "instance", {
            get: function () { return this._hostElement.component; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ComponentRef_.prototype, "hostView", {
            get: function () { return this._hostElement.parentView.ref; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ComponentRef_.prototype, "changeDetectorRef", {
            get: function () { return this._hostElement.parentView.ref; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ComponentRef_.prototype, "componentType", {
            get: function () { return this._componentType; },
            enumerable: true,
            configurable: true
        });
        ComponentRef_.prototype.destroy = function () { this._hostElement.parentView.destroy(); };
        ComponentRef_.prototype.onDestroy = function (callback) { this.hostView.onDestroy(callback); };
        return ComponentRef_;
    }(ComponentRef));
    var EMPTY_CONTEXT = new Object();
    /*@ts2dart_const*/
    var ComponentFactory = (function () {
        function ComponentFactory(selector, _viewFactory, _componentType) {
            this.selector = selector;
            this._viewFactory = _viewFactory;
            this._componentType = _componentType;
        }
        Object.defineProperty(ComponentFactory.prototype, "componentType", {
            get: function () { return this._componentType; },
            enumerable: true,
            configurable: true
        });
        /**
         * Creates a new component.
         */
        ComponentFactory.prototype.create = function (injector, projectableNodes, rootSelectorOrNode) {
            if (projectableNodes === void 0) { projectableNodes = null; }
            if (rootSelectorOrNode === void 0) { rootSelectorOrNode = null; }
            var vu = injector.get(ViewUtils);
            if (isBlank(projectableNodes)) {
                projectableNodes = [];
            }
            // Note: Host views don't need a declarationAppElement!
            var hostView = this._viewFactory(vu, injector, null);
            var hostElement = hostView.create(EMPTY_CONTEXT, projectableNodes, rootSelectorOrNode);
            return new ComponentRef_(hostElement, this._componentType);
        };
        return ComponentFactory;
    }());
    /**
     * Low-level service for loading {@link ComponentFactory}s, which
     * can later be used to create and render a Component instance.
     */
    var ComponentResolver = (function () {
        function ComponentResolver() {
        }
        return ComponentResolver;
    }());
    function _isComponentFactory(type) {
        return type instanceof ComponentFactory;
    }
    var ReflectorComponentResolver = (function (_super) {
        __extends(ReflectorComponentResolver, _super);
        function ReflectorComponentResolver() {
            _super.apply(this, arguments);
        }
        ReflectorComponentResolver.prototype.resolveComponent = function (component) {
            if (isString(component)) {
                return PromiseWrapper.reject(new BaseException("Cannot resolve component using '" + component + "'."), null);
            }
            var metadatas = reflector.annotations(component);
            var componentFactory = metadatas.find(_isComponentFactory);
            if (isBlank(componentFactory)) {
                throw new BaseException("No precompiled component " + stringify(component) + " found");
            }
            return PromiseWrapper.resolve(componentFactory);
        };
        ReflectorComponentResolver.prototype.clearCache = function () { };
        return ReflectorComponentResolver;
    }(ComponentResolver));
    ReflectorComponentResolver.decorators = [
        { type: Injectable },
    ];
    // Note: Need to rename warn as in Dart
    // class members and imports can't use the same name.
    var _warnImpl = warn;
    var Console = (function () {
        function Console() {
        }
        Console.prototype.log = function (message) { print(message); };
        // Note: for reporting errors use `DOM.logError()` as it is platform specific
        Console.prototype.warn = function (message) { _warnImpl(message); };
        return Console;
    }());
    Console.decorators = [
        { type: Injectable },
    ];
    /**
     * Create an Angular zone.
     */
    function createNgZone() {
        return new NgZone({ enableLongStackTrace: assertionsEnabled() });
    }
    var _platform;
    var _inPlatformCreate = false;
    /**
     * Creates a platform.
     * Platforms have to be eagerly created via this function.
     */
    function createPlatform(injector) {
        if (_inPlatformCreate) {
            throw new BaseException('Already creating a platform...');
        }
        if (isPresent(_platform) && !_platform.disposed) {
            throw new BaseException("There can be only one platform. Destroy the previous one to create a new one.");
        }
        lockMode();
        _inPlatformCreate = true;
        try {
            _platform = injector.get(PlatformRef);
        }
        finally {
            _inPlatformCreate = false;
        }
        return _platform;
    }
    /**
     * Checks that there currently is a platform
     * which contains the given token as a provider.
     */
    function assertPlatform(requiredToken) {
        var platform = getPlatform();
        if (isBlank(platform)) {
            throw new BaseException('Not platform exists!');
        }
        if (isPresent(platform) && isBlank(platform.injector.get(requiredToken, null))) {
            throw new BaseException('A platform with a different configuration has been created. Please destroy it first.');
        }
        return platform;
    }
    /**
     * Returns the current platform.
     */
    function getPlatform() {
        return isPresent(_platform) && !_platform.disposed ? _platform : null;
    }
    /**
     * Shortcut for ApplicationRef.bootstrap.
     * Requires a platform the be created first.
     */
    function coreBootstrap(injector, componentFactory) {
        var appRef = injector.get(ApplicationRef);
        return appRef.bootstrap(componentFactory);
    }
    /**
     * The Angular platform is the entry point for Angular on a web page. Each page
     * has exactly one platform, and services (such as reflection) which are common
     * to every Angular application running on the page are bound in its scope.
     *
     * A page's platform is initialized implicitly when {@link bootstrap}() is called, or
     * explicitly by calling {@link createPlatform}().
     */
    var PlatformRef = (function () {
        function PlatformRef() {
        }
        Object.defineProperty(PlatformRef.prototype, "injector", {
            /**
             * Retrieve the platform {@link Injector}, which is the parent injector for
             * every Angular application on the page and provides singleton providers.
             */
            get: function () { throw unimplemented(); },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(PlatformRef.prototype, "disposed", {
            get: function () { throw unimplemented(); },
            enumerable: true,
            configurable: true
        });
        return PlatformRef;
    }());
    var PlatformRef_ = (function (_super) {
        __extends(PlatformRef_, _super);
        function PlatformRef_(_injector) {
            _super.call(this);
            this._injector = _injector;
            /** @internal */
            this._applications = [];
            /** @internal */
            this._disposeListeners = [];
            this._disposed = false;
            if (!_inPlatformCreate) {
                throw new BaseException('Platforms have to be created via `createPlatform`!');
            }
            var inits = _injector.get(PLATFORM_INITIALIZER, null);
            if (isPresent(inits))
                inits.forEach(function (init) { return init(); });
        }
        PlatformRef_.prototype.registerDisposeListener = function (dispose) { this._disposeListeners.push(dispose); };
        Object.defineProperty(PlatformRef_.prototype, "injector", {
            get: function () { return this._injector; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PlatformRef_.prototype, "disposed", {
            get: function () { return this._disposed; },
            enumerable: true,
            configurable: true
        });
        PlatformRef_.prototype.addApplication = function (appRef) { this._applications.push(appRef); };
        PlatformRef_.prototype.dispose = function () {
            ListWrapper.clone(this._applications).forEach(function (app) { return app.dispose(); });
            this._disposeListeners.forEach(function (dispose) { return dispose(); });
            this._disposed = true;
        };
        /** @internal */
        PlatformRef_.prototype._applicationDisposed = function (app) { ListWrapper.remove(this._applications, app); };
        return PlatformRef_;
    }(PlatformRef));
    PlatformRef_.decorators = [
        { type: Injectable },
    ];
    PlatformRef_.ctorParameters = [
        { type: Injector, },
    ];
    /**
     * A reference to an Angular application running on a page.
     *
     * For more about Angular applications, see the documentation for {@link bootstrap}.
     */
    var ApplicationRef = (function () {
        function ApplicationRef() {
        }
        Object.defineProperty(ApplicationRef.prototype, "injector", {
            /**
             * Retrieve the application {@link Injector}.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ApplicationRef.prototype, "zone", {
            /**
             * Retrieve the application {@link NgZone}.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ApplicationRef.prototype, "componentTypes", {
            /**
             * Get a list of component types registered to this application.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        ;
        return ApplicationRef;
    }());
    var ApplicationRef_ = (function (_super) {
        __extends(ApplicationRef_, _super);
        function ApplicationRef_(_platform, _zone, _injector) {
            var _this = this;
            _super.call(this);
            this._platform = _platform;
            this._zone = _zone;
            this._injector = _injector;
            /** @internal */
            this._bootstrapListeners = [];
            /** @internal */
            this._disposeListeners = [];
            /** @internal */
            this._rootComponents = [];
            /** @internal */
            this._rootComponentTypes = [];
            /** @internal */
            this._changeDetectorRefs = [];
            /** @internal */
            this._runningTick = false;
            /** @internal */
            this._enforceNoNewChanges = false;
            var zone = _injector.get(NgZone);
            this._enforceNoNewChanges = assertionsEnabled();
            zone.run(function () { _this._exceptionHandler = _injector.get(ExceptionHandler); });
            this._asyncInitDonePromise = this.run(function () {
                var inits = _injector.get(APP_INITIALIZER, null);
                var asyncInitResults = [];
                var asyncInitDonePromise;
                if (isPresent(inits)) {
                    for (var i = 0; i < inits.length; i++) {
                        var initResult = inits[i]();
                        if (isPromise(initResult)) {
                            asyncInitResults.push(initResult);
                        }
                    }
                }
                if (asyncInitResults.length > 0) {
                    asyncInitDonePromise =
                        PromiseWrapper.all(asyncInitResults).then(function (_) { return _this._asyncInitDone = true; });
                    _this._asyncInitDone = false;
                }
                else {
                    _this._asyncInitDone = true;
                    asyncInitDonePromise = PromiseWrapper.resolve(true);
                }
                return asyncInitDonePromise;
            });
            ObservableWrapper.subscribe(zone.onError, function (error) {
                _this._exceptionHandler.call(error.error, error.stackTrace);
            });
            ObservableWrapper.subscribe(this._zone.onMicrotaskEmpty, function (_) { _this._zone.run(function () { _this.tick(); }); });
        }
        ApplicationRef_.prototype.registerBootstrapListener = function (listener) {
            this._bootstrapListeners.push(listener);
        };
        ApplicationRef_.prototype.registerDisposeListener = function (dispose) { this._disposeListeners.push(dispose); };
        ApplicationRef_.prototype.registerChangeDetector = function (changeDetector) {
            this._changeDetectorRefs.push(changeDetector);
        };
        ApplicationRef_.prototype.unregisterChangeDetector = function (changeDetector) {
            ListWrapper.remove(this._changeDetectorRefs, changeDetector);
        };
        ApplicationRef_.prototype.waitForAsyncInitializers = function () { return this._asyncInitDonePromise; };
        ApplicationRef_.prototype.run = function (callback) {
            var _this = this;
            var zone = this.injector.get(NgZone);
            var result;
            // Note: Don't use zone.runGuarded as we want to know about
            // the thrown exception!
            // Note: the completer needs to be created outside
            // of `zone.run` as Dart swallows rejected promises
            // via the onError callback of the promise.
            var completer = PromiseWrapper.completer();
            zone.run(function () {
                try {
                    result = callback();
                    if (isPromise(result)) {
                        PromiseWrapper.then(result, function (ref) { completer.resolve(ref); }, function (err, stackTrace) {
                            completer.reject(err, stackTrace);
                            _this._exceptionHandler.call(err, stackTrace);
                        });
                    }
                }
                catch (e) {
                    _this._exceptionHandler.call(e, e.stack);
                    throw e;
                }
            });
            return isPromise(result) ? completer.promise : result;
        };
        ApplicationRef_.prototype.bootstrap = function (componentFactory) {
            var _this = this;
            if (!this._asyncInitDone) {
                throw new BaseException('Cannot bootstrap as there are still asynchronous initializers running. Wait for them using waitForAsyncInitializers().');
            }
            return this.run(function () {
                _this._rootComponentTypes.push(componentFactory.componentType);
                var compRef = componentFactory.create(_this._injector, [], componentFactory.selector);
                compRef.onDestroy(function () { _this._unloadComponent(compRef); });
                var testability = compRef.injector.get(Testability, null);
                if (isPresent(testability)) {
                    compRef.injector.get(TestabilityRegistry)
                        .registerApplication(compRef.location.nativeElement, testability);
                }
                _this._loadComponent(compRef);
                var c = _this._injector.get(Console);
                if (assertionsEnabled()) {
                    c.log("Angular 2 is running in the development mode. Call enableProdMode() to enable the production mode.");
                }
                return compRef;
            });
        };
        /** @internal */
        ApplicationRef_.prototype._loadComponent = function (componentRef) {
            this._changeDetectorRefs.push(componentRef.changeDetectorRef);
            this.tick();
            this._rootComponents.push(componentRef);
            this._bootstrapListeners.forEach(function (listener) { return listener(componentRef); });
        };
        /** @internal */
        ApplicationRef_.prototype._unloadComponent = function (componentRef) {
            if (!ListWrapper.contains(this._rootComponents, componentRef)) {
                return;
            }
            this.unregisterChangeDetector(componentRef.changeDetectorRef);
            ListWrapper.remove(this._rootComponents, componentRef);
        };
        Object.defineProperty(ApplicationRef_.prototype, "injector", {
            get: function () { return this._injector; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ApplicationRef_.prototype, "zone", {
            get: function () { return this._zone; },
            enumerable: true,
            configurable: true
        });
        ApplicationRef_.prototype.tick = function () {
            if (this._runningTick) {
                throw new BaseException("ApplicationRef.tick is called recursively");
            }
            var s = ApplicationRef_._tickScope();
            try {
                this._runningTick = true;
                this._changeDetectorRefs.forEach(function (detector) { return detector.detectChanges(); });
                if (this._enforceNoNewChanges) {
                    this._changeDetectorRefs.forEach(function (detector) { return detector.checkNoChanges(); });
                }
            }
            finally {
                this._runningTick = false;
                wtfLeave(s);
            }
        };
        ApplicationRef_.prototype.dispose = function () {
            // TODO(alxhub): Dispose of the NgZone.
            ListWrapper.clone(this._rootComponents).forEach(function (ref) { return ref.destroy(); });
            this._disposeListeners.forEach(function (dispose) { return dispose(); });
            this._platform._applicationDisposed(this);
        };
        Object.defineProperty(ApplicationRef_.prototype, "componentTypes", {
            get: function () { return this._rootComponentTypes; },
            enumerable: true,
            configurable: true
        });
        return ApplicationRef_;
    }(ApplicationRef));
    /** @internal */
    ApplicationRef_._tickScope = wtfCreateScope('ApplicationRef#tick()');
    ApplicationRef_.decorators = [
        { type: Injectable },
    ];
    ApplicationRef_.ctorParameters = [
        { type: PlatformRef_, },
        { type: NgZone, },
        { type: Injector, },
    ];
    /**
     * @internal
     */
    var PLATFORM_CORE_PROVIDERS = 
    /*@ts2dart_const*/ [
        PlatformRef_,
        /*@ts2dart_const*/ (
        /* @ts2dart_Provider */ { provide: PlatformRef, useExisting: PlatformRef_ })
    ];
    /**
     * @internal
     */
    var APPLICATION_CORE_PROVIDERS = [
        /* @ts2dart_Provider */ { provide: NgZone, useFactory: createNgZone, deps: [] },
        ApplicationRef_,
        /* @ts2dart_Provider */ { provide: ApplicationRef, useExisting: ApplicationRef_ }
    ];
    /**
     * An unmodifiable list of items that Angular keeps up to date when the state
     * of the application changes.
     *
     * The type of object that {@link QueryMetadata} and {@link ViewQueryMetadata} provide.
     *
     * Implements an iterable interface, therefore it can be used in both ES6
     * javascript `for (var i of items)` loops as well as in Angular templates with
     * `*ngFor="let i of myList"`.
     *
     * Changes can be observed by subscribing to the changes `Observable`.
     *
     * NOTE: In the future this class will implement an `Observable` interface.
     *
     * ### Example ([live demo](http://plnkr.co/edit/RX8sJnQYl9FWuSCWme5z?p=preview))
     * ```typescript
     * @Component({...})
     * class Container {
     *   constructor(@Query(Item) items: QueryList<Item>) {
     *     items.changes.subscribe(_ => console.log(items.length));
     *   }
     * }
     * ```
     */
    var QueryList = (function () {
        function QueryList() {
            this._dirty = true;
            this._results = [];
            this._emitter = new EventEmitter();
        }
        Object.defineProperty(QueryList.prototype, "changes", {
            get: function () { return this._emitter; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QueryList.prototype, "length", {
            get: function () { return this._results.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QueryList.prototype, "first", {
            get: function () { return ListWrapper.first(this._results); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QueryList.prototype, "last", {
            get: function () { return ListWrapper.last(this._results); },
            enumerable: true,
            configurable: true
        });
        /**
         * returns a new array with the passed in function applied to each element.
         */
        QueryList.prototype.map = function (fn) { return this._results.map(fn); };
        /**
         * returns a filtered array.
         */
        QueryList.prototype.filter = function (fn) { return this._results.filter(fn); };
        /**
         * returns a reduced value.
         */
        QueryList.prototype.reduce = function (fn, init) { return this._results.reduce(fn, init); };
        /**
         * executes function for each element in a query.
         */
        QueryList.prototype.forEach = function (fn) { this._results.forEach(fn); };
        /**
         * converts QueryList into an array
         */
        QueryList.prototype.toArray = function () { return ListWrapper.clone(this._results); };
        QueryList.prototype[getSymbolIterator()] = function () { return this._results[getSymbolIterator()](); };
        QueryList.prototype.toString = function () { return this._results.toString(); };
        /**
         * @internal
         */
        QueryList.prototype.reset = function (res) {
            this._results = ListWrapper.flatten(res);
            this._dirty = false;
        };
        /** @internal */
        QueryList.prototype.notifyOnChanges = function () { this._emitter.emit(this); };
        /** internal */
        QueryList.prototype.setDirty = function () { this._dirty = true; };
        Object.defineProperty(QueryList.prototype, "dirty", {
            /** internal */
            get: function () { return this._dirty; },
            enumerable: true,
            configurable: true
        });
        return QueryList;
    }());
    /**
     * Use ComponentResolver and ViewContainerRef directly.
     *
     * @deprecated
     */
    var DynamicComponentLoader = (function () {
        function DynamicComponentLoader() {
        }
        return DynamicComponentLoader;
    }());
    var DynamicComponentLoader_ = (function (_super) {
        __extends(DynamicComponentLoader_, _super);
        function DynamicComponentLoader_(_compiler) {
            _super.call(this);
            this._compiler = _compiler;
        }
        DynamicComponentLoader_.prototype.loadAsRoot = function (type, overrideSelectorOrNode, injector, onDispose, projectableNodes) {
            return this._compiler.resolveComponent(type).then(function (componentFactory) {
                var componentRef = componentFactory.create(injector, projectableNodes, isPresent(overrideSelectorOrNode) ? overrideSelectorOrNode : componentFactory.selector);
                if (isPresent(onDispose)) {
                    componentRef.onDestroy(onDispose);
                }
                return componentRef;
            });
        };
        DynamicComponentLoader_.prototype.loadNextToLocation = function (type, location, providers, projectableNodes) {
            if (providers === void 0) { providers = null; }
            if (projectableNodes === void 0) { projectableNodes = null; }
            return this._compiler.resolveComponent(type).then(function (componentFactory) {
                var contextInjector = location.parentInjector;
                var childInjector = isPresent(providers) && providers.length > 0 ?
                    ReflectiveInjector.fromResolvedProviders(providers, contextInjector) :
                    contextInjector;
                return location.createComponent(componentFactory, location.length, childInjector, projectableNodes);
            });
        };
        return DynamicComponentLoader_;
    }(DynamicComponentLoader));
    DynamicComponentLoader_.decorators = [
        { type: Injectable },
    ];
    DynamicComponentLoader_.ctorParameters = [
        { type: ComponentResolver, },
    ];
    var EMPTY_CONTEXT$1 = new Object();
    /**
     * Represents an Embedded Template that can be used to instantiate Embedded Views.
     *
     * You can access a `TemplateRef`, in two ways. Via a directive placed on a `<template>` element (or
     * directive prefixed with `*`) and have the `TemplateRef` for this Embedded View injected into the
     * constructor of the directive using the `TemplateRef` Token. Alternatively you can query for the
     * `TemplateRef` from a Component or a Directive via {@link Query}.
     *
     * To instantiate Embedded Views based on a Template, use
     * {@link ViewContainerRef#createEmbeddedView}, which will create the View and attach it to the
     * View Container.
     */
    var TemplateRef = (function () {
        function TemplateRef() {
        }
        Object.defineProperty(TemplateRef.prototype, "elementRef", {
            /**
             * The location in the View where the Embedded View logically belongs to.
             *
             * The data-binding and injection contexts of Embedded Views created from this `TemplateRef`
             * inherit from the contexts of this location.
             *
             * Typically new Embedded Views are attached to the View Container of this location, but in
             * advanced use-cases, the View can be attached to a different container while keeping the
             * data-binding and injection context from the original location.
             *
             */
            // TODO(i): rename to anchor or location
            get: function () { return null; },
            enumerable: true,
            configurable: true
        });
        return TemplateRef;
    }());
    var TemplateRef_ = (function (_super) {
        __extends(TemplateRef_, _super);
        function TemplateRef_(_appElement, _viewFactory) {
            _super.call(this);
            this._appElement = _appElement;
            this._viewFactory = _viewFactory;
        }
        TemplateRef_.prototype.createEmbeddedView = function (context) {
            var view = this._viewFactory(this._appElement.parentView.viewUtils, this._appElement.parentInjector, this._appElement);
            if (isBlank(context)) {
                context = EMPTY_CONTEXT$1;
            }
            view.create(context, null, null);
            return view.ref;
        };
        Object.defineProperty(TemplateRef_.prototype, "elementRef", {
            get: function () { return this._appElement.elementRef; },
            enumerable: true,
            configurable: true
        });
        return TemplateRef_;
    }(TemplateRef));
    var ViewRef_ = (function () {
        function ViewRef_(_view) {
            this._view = _view;
            this._view = _view;
        }
        Object.defineProperty(ViewRef_.prototype, "internalView", {
            get: function () { return this._view; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewRef_.prototype, "rootNodes", {
            get: function () { return this._view.flatRootNodes; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewRef_.prototype, "context", {
            get: function () { return this._view.context; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewRef_.prototype, "destroyed", {
            get: function () { return this._view.destroyed; },
            enumerable: true,
            configurable: true
        });
        ViewRef_.prototype.markForCheck = function () { this._view.markPathToRootAsCheckOnce(); };
        ViewRef_.prototype.detach = function () { this._view.cdMode = ChangeDetectionStrategy.Detached; };
        ViewRef_.prototype.detectChanges = function () { this._view.detectChanges(false); };
        ViewRef_.prototype.checkNoChanges = function () { this._view.detectChanges(true); };
        ViewRef_.prototype.reattach = function () {
            this._view.cdMode = ChangeDetectionStrategy.CheckAlways;
            this.markForCheck();
        };
        ViewRef_.prototype.onDestroy = function (callback) { this._view.disposables.push(callback); };
        ViewRef_.prototype.destroy = function () { this._view.destroy(); };
        return ViewRef_;
    }());
    var EventListener = (function () {
        function EventListener(name, callback) {
            this.name = name;
            this.callback = callback;
        }
        ;
        return EventListener;
    }());
    var DebugNode = (function () {
        function DebugNode(nativeNode, parent, _debugInfo) {
            this._debugInfo = _debugInfo;
            this.nativeNode = nativeNode;
            if (isPresent(parent) && parent instanceof DebugElement) {
                parent.addChild(this);
            }
            else {
                this.parent = null;
            }
            this.listeners = [];
        }
        Object.defineProperty(DebugNode.prototype, "injector", {
            get: function () { return isPresent(this._debugInfo) ? this._debugInfo.injector : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugNode.prototype, "componentInstance", {
            get: function () {
                return isPresent(this._debugInfo) ? this._debugInfo.component : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugNode.prototype, "context", {
            get: function () { return isPresent(this._debugInfo) ? this._debugInfo.context : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugNode.prototype, "references", {
            get: function () {
                return isPresent(this._debugInfo) ? this._debugInfo.references : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugNode.prototype, "providerTokens", {
            get: function () {
                return isPresent(this._debugInfo) ? this._debugInfo.providerTokens : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugNode.prototype, "source", {
            get: function () { return isPresent(this._debugInfo) ? this._debugInfo.source : null; },
            enumerable: true,
            configurable: true
        });
        /**
         * Use injector.get(token) instead.
         *
         * @deprecated
         */
        DebugNode.prototype.inject = function (token) { return this.injector.get(token); };
        return DebugNode;
    }());
    var DebugElement = (function (_super) {
        __extends(DebugElement, _super);
        function DebugElement(nativeNode, parent, _debugInfo) {
            _super.call(this, nativeNode, parent, _debugInfo);
            this.properties = {};
            this.attributes = {};
            this.childNodes = [];
            this.nativeElement = nativeNode;
        }
        DebugElement.prototype.addChild = function (child) {
            if (isPresent(child)) {
                this.childNodes.push(child);
                child.parent = this;
            }
        };
        DebugElement.prototype.removeChild = function (child) {
            var childIndex = this.childNodes.indexOf(child);
            if (childIndex !== -1) {
                child.parent = null;
                this.childNodes.splice(childIndex, 1);
            }
        };
        DebugElement.prototype.insertChildrenAfter = function (child, newChildren) {
            var siblingIndex = this.childNodes.indexOf(child);
            if (siblingIndex !== -1) {
                var previousChildren = this.childNodes.slice(0, siblingIndex + 1);
                var nextChildren = this.childNodes.slice(siblingIndex + 1);
                this.childNodes =
                    ListWrapper.concat(ListWrapper.concat(previousChildren, newChildren), nextChildren);
                for (var i = 0; i < newChildren.length; ++i) {
                    var newChild = newChildren[i];
                    if (isPresent(newChild.parent)) {
                        newChild.parent.removeChild(newChild);
                    }
                    newChild.parent = this;
                }
            }
        };
        DebugElement.prototype.query = function (predicate) {
            var results = this.queryAll(predicate);
            return results.length > 0 ? results[0] : null;
        };
        DebugElement.prototype.queryAll = function (predicate) {
            var matches = [];
            _queryElementChildren(this, predicate, matches);
            return matches;
        };
        DebugElement.prototype.queryAllNodes = function (predicate) {
            var matches = [];
            _queryNodeChildren(this, predicate, matches);
            return matches;
        };
        Object.defineProperty(DebugElement.prototype, "children", {
            get: function () {
                var children = [];
                this.childNodes.forEach(function (node) {
                    if (node instanceof DebugElement) {
                        children.push(node);
                    }
                });
                return children;
            },
            enumerable: true,
            configurable: true
        });
        DebugElement.prototype.triggerEventHandler = function (eventName, eventObj) {
            this.listeners.forEach(function (listener) {
                if (listener.name == eventName) {
                    listener.callback(eventObj);
                }
            });
        };
        return DebugElement;
    }(DebugNode));
    function _queryElementChildren(element, predicate, matches) {
        element.childNodes.forEach(function (node) {
            if (node instanceof DebugElement) {
                if (predicate(node)) {
                    matches.push(node);
                }
                _queryElementChildren(node, predicate, matches);
            }
        });
    }
    function _queryNodeChildren(parentNode, predicate, matches) {
        if (parentNode instanceof DebugElement) {
            parentNode.childNodes.forEach(function (node) {
                if (predicate(node)) {
                    matches.push(node);
                }
                if (node instanceof DebugElement) {
                    _queryNodeChildren(node, predicate, matches);
                }
            });
        }
    }
    // Need to keep the nodes in a global Map so that multiple angular apps are supported.
    var _nativeNodeToDebugNode = new Map();
    function getDebugNode(nativeNode) {
        return _nativeNodeToDebugNode.get(nativeNode);
    }
    function indexDebugNode(node) {
        _nativeNodeToDebugNode.set(node.nativeNode, node);
    }
    function removeDebugNodeFromIndex(node) {
        _nativeNodeToDebugNode.delete(node.nativeNode);
    }
    /**
     * A token that can be provided when bootstraping an application to make an array of directives
     * available in every component of the application.
     *
     * ### Example
     *
     * ```typescript
     * import {PLATFORM_DIRECTIVES} from '@angular/core';
     * import {OtherDirective} from './myDirectives';
     *
     * @Component({
     *   selector: 'my-component',
     *   template: `
     *     <!-- can use other directive even though the component does not list it in `directives` -->
     *     <other-directive></other-directive>
     *   `
     * })
     * export class MyComponent {
     *   ...
     * }
     *
     * bootstrap(MyComponent, [provide(PLATFORM_DIRECTIVES, {useValue: [OtherDirective], multi:true})]);
     * ```
     */
    var PLATFORM_DIRECTIVES = 
    /*@ts2dart_const*/ new OpaqueToken("Platform Directives");
    /**
     * A token that can be provided when bootstraping an application to make an array of pipes
     * available in every component of the application.
     *
     * ### Example
     *
     * ```typescript
     * import {PLATFORM_PIPES} from '@angular/core';
     * import {OtherPipe} from './myPipe';
     *
     * @Component({
     *   selector: 'my-component',
     *   template: `
     *     {{123 | other-pipe}}
     *   `
     * })
     * export class MyComponent {
     *   ...
     * }
     *
     * bootstrap(MyComponent, [provide(PLATFORM_PIPES, {useValue: [OtherPipe], multi:true})]);
     * ```
     */
    var PLATFORM_PIPES = new OpaqueToken("Platform Pipes");
    function _reflector() {
        return reflector;
    }
    // prevent missing use Dart warning.
    /**
     * A default set of providers which should be included in any Angular platform.
     */
    var PLATFORM_COMMON_PROVIDERS = [
        PLATFORM_CORE_PROVIDERS,
        /*@ts2dart_Provider*/ { provide: Reflector, useFactory: _reflector, deps: [] },
        /*@ts2dart_Provider*/ { provide: ReflectorReader, useExisting: Reflector },
        TestabilityRegistry,
        Console
    ];
    // avoid unused import when Type union types are erased
    /**
     * A default set of providers which should be included in any Angular
     * application, regardless of the platform it runs onto.
     */
    var APPLICATION_COMMON_PROVIDERS = 
    /*@ts2dart_const*/ [
        APPLICATION_CORE_PROVIDERS,
        /* @ts2dart_Provider */ { provide: ComponentResolver, useClass: ReflectorComponentResolver },
        APP_ID_RANDOM_PROVIDER,
        ViewUtils,
        /* @ts2dart_Provider */ { provide: IterableDiffers, useValue: defaultIterableDiffers },
        /* @ts2dart_Provider */ { provide: KeyValueDiffers, useValue: defaultKeyValueDiffers },
        /* @ts2dart_Provider */ { provide: DynamicComponentLoader, useClass: DynamicComponentLoader_ }
    ];
    /* @ts2dart_const */
    var StaticNodeDebugInfo = (function () {
        function StaticNodeDebugInfo(providerTokens, componentToken, refTokens) {
            this.providerTokens = providerTokens;
            this.componentToken = componentToken;
            this.refTokens = refTokens;
        }
        return StaticNodeDebugInfo;
    }());
    var DebugContext = (function () {
        function DebugContext(_view, _nodeIndex, _tplRow, _tplCol) {
            this._view = _view;
            this._nodeIndex = _nodeIndex;
            this._tplRow = _tplRow;
            this._tplCol = _tplCol;
        }
        Object.defineProperty(DebugContext.prototype, "_staticNodeInfo", {
            get: function () {
                return isPresent(this._nodeIndex) ? this._view.staticNodeDebugInfos[this._nodeIndex] : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "context", {
            get: function () { return this._view.context; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "component", {
            get: function () {
                var staticNodeInfo = this._staticNodeInfo;
                if (isPresent(staticNodeInfo) && isPresent(staticNodeInfo.componentToken)) {
                    return this.injector.get(staticNodeInfo.componentToken);
                }
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "componentRenderElement", {
            get: function () {
                var componentView = this._view;
                while (isPresent(componentView.declarationAppElement) &&
                    componentView.type !== ViewType.COMPONENT) {
                    componentView = componentView.declarationAppElement.parentView;
                }
                return isPresent(componentView.declarationAppElement) ?
                    componentView.declarationAppElement.nativeElement :
                    null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "injector", {
            get: function () { return this._view.injector(this._nodeIndex); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "renderNode", {
            get: function () {
                if (isPresent(this._nodeIndex) && isPresent(this._view.allNodes)) {
                    return this._view.allNodes[this._nodeIndex];
                }
                else {
                    return null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "providerTokens", {
            get: function () {
                var staticNodeInfo = this._staticNodeInfo;
                return isPresent(staticNodeInfo) ? staticNodeInfo.providerTokens : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "source", {
            get: function () {
                return this._view.componentType.templateUrl + ":" + this._tplRow + ":" + this._tplCol;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "references", {
            get: function () {
                var _this = this;
                var varValues = {};
                var staticNodeInfo = this._staticNodeInfo;
                if (isPresent(staticNodeInfo)) {
                    var refs = staticNodeInfo.refTokens;
                    StringMapWrapper.forEach(refs, function (refToken, refName) {
                        var varValue;
                        if (isBlank(refToken)) {
                            varValue = isPresent(_this._view.allNodes) ? _this._view.allNodes[_this._nodeIndex] : null;
                        }
                        else {
                            varValue = _this._view.injectorGet(refToken, _this._nodeIndex, null);
                        }
                        varValues[refName] = varValue;
                    });
                }
                return varValues;
            },
            enumerable: true,
            configurable: true
        });
        return DebugContext;
    }());
    var _UNDEFINED = new Object();
    var ElementInjector = (function (_super) {
        __extends(ElementInjector, _super);
        function ElementInjector(_view, _nodeIndex) {
            _super.call(this);
            this._view = _view;
            this._nodeIndex = _nodeIndex;
        }
        ElementInjector.prototype.get = function (token, notFoundValue) {
            if (notFoundValue === void 0) { notFoundValue = THROW_IF_NOT_FOUND; }
            var result = _UNDEFINED;
            if (result === _UNDEFINED) {
                result = this._view.injectorGet(token, this._nodeIndex, _UNDEFINED);
            }
            if (result === _UNDEFINED) {
                result = this._view.parentInjector.get(token, notFoundValue);
            }
            return result;
        };
        return ElementInjector;
    }(Injector));
    var _scope_check = wtfCreateScope("AppView#check(ascii id)");
    /**
     * Cost of making objects: http://jsperf.com/instantiate-size-of-object
     *
     */
    var AppView = (function () {
        function AppView(clazz, componentType, type, viewUtils, parentInjector, declarationAppElement, cdMode) {
            this.clazz = clazz;
            this.componentType = componentType;
            this.type = type;
            this.viewUtils = viewUtils;
            this.parentInjector = parentInjector;
            this.declarationAppElement = declarationAppElement;
            this.cdMode = cdMode;
            this.contentChildren = [];
            this.viewChildren = [];
            this.viewContainerElement = null;
            // The names of the below fields must be kept in sync with codegen_name_util.ts or
            // change detection will fail.
            this.cdState = ChangeDetectorState.NeverChecked;
            this.destroyed = false;
            this.ref = new ViewRef_(this);
            if (type === ViewType.COMPONENT || type === ViewType.HOST) {
                this.renderer = viewUtils.renderComponent(componentType);
            }
            else {
                this.renderer = declarationAppElement.parentView.renderer;
            }
        }
        AppView.prototype.create = function (context, givenProjectableNodes, rootSelectorOrNode) {
            this.context = context;
            var projectableNodes;
            switch (this.type) {
                case ViewType.COMPONENT:
                    projectableNodes = ensureSlotCount(givenProjectableNodes, this.componentType.slotCount);
                    break;
                case ViewType.EMBEDDED:
                    projectableNodes = this.declarationAppElement.parentView.projectableNodes;
                    break;
                case ViewType.HOST:
                    // Note: Don't ensure the slot count for the projectableNodes as we store
                    // them only for the contained component view (which will later check the slot count...)
                    projectableNodes = givenProjectableNodes;
                    break;
            }
            this._hasExternalHostElement = isPresent(rootSelectorOrNode);
            this.projectableNodes = projectableNodes;
            return this.createInternal(rootSelectorOrNode);
        };
        /**
         * Overwritten by implementations.
         * Returns the AppElement for the host element for ViewType.HOST.
         */
        AppView.prototype.createInternal = function (rootSelectorOrNode) { return null; };
        AppView.prototype.init = function (rootNodesOrAppElements, allNodes, disposables, subscriptions) {
            this.rootNodesOrAppElements = rootNodesOrAppElements;
            this.allNodes = allNodes;
            this.disposables = disposables;
            this.subscriptions = subscriptions;
            if (this.type === ViewType.COMPONENT) {
                // Note: the render nodes have been attached to their host element
                // in the ViewFactory already.
                this.declarationAppElement.parentView.viewChildren.push(this);
                this.dirtyParentQueriesInternal();
            }
        };
        AppView.prototype.selectOrCreateHostElement = function (elementName, rootSelectorOrNode, debugInfo) {
            var hostElement;
            if (isPresent(rootSelectorOrNode)) {
                hostElement = this.renderer.selectRootElement(rootSelectorOrNode, debugInfo);
            }
            else {
                hostElement = this.renderer.createElement(null, elementName, debugInfo);
            }
            return hostElement;
        };
        AppView.prototype.injectorGet = function (token, nodeIndex, notFoundResult) {
            return this.injectorGetInternal(token, nodeIndex, notFoundResult);
        };
        /**
         * Overwritten by implementations
         */
        AppView.prototype.injectorGetInternal = function (token, nodeIndex, notFoundResult) {
            return notFoundResult;
        };
        AppView.prototype.injector = function (nodeIndex) {
            if (isPresent(nodeIndex)) {
                return new ElementInjector(this, nodeIndex);
            }
            else {
                return this.parentInjector;
            }
        };
        AppView.prototype.destroy = function () {
            if (this._hasExternalHostElement) {
                this.renderer.detachView(this.flatRootNodes);
            }
            else if (isPresent(this.viewContainerElement)) {
                this.viewContainerElement.detachView(this.viewContainerElement.nestedViews.indexOf(this));
            }
            this._destroyRecurse();
        };
        AppView.prototype._destroyRecurse = function () {
            if (this.destroyed) {
                return;
            }
            var children = this.contentChildren;
            for (var i = 0; i < children.length; i++) {
                children[i]._destroyRecurse();
            }
            children = this.viewChildren;
            for (var i = 0; i < children.length; i++) {
                children[i]._destroyRecurse();
            }
            this.destroyLocal();
            this.destroyed = true;
        };
        AppView.prototype.destroyLocal = function () {
            var hostElement = this.type === ViewType.COMPONENT ? this.declarationAppElement.nativeElement : null;
            for (var i = 0; i < this.disposables.length; i++) {
                this.disposables[i]();
            }
            for (var i = 0; i < this.subscriptions.length; i++) {
                ObservableWrapper.dispose(this.subscriptions[i]);
            }
            this.destroyInternal();
            this.dirtyParentQueriesInternal();
            this.renderer.destroyView(hostElement, this.allNodes);
        };
        /**
         * Overwritten by implementations
         */
        AppView.prototype.destroyInternal = function () { };
        Object.defineProperty(AppView.prototype, "changeDetectorRef", {
            get: function () { return this.ref; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppView.prototype, "parent", {
            get: function () {
                return isPresent(this.declarationAppElement) ? this.declarationAppElement.parentView : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppView.prototype, "flatRootNodes", {
            get: function () { return flattenNestedViewRenderNodes(this.rootNodesOrAppElements); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppView.prototype, "lastRootNode", {
            get: function () {
                var lastNode = this.rootNodesOrAppElements.length > 0 ?
                    this.rootNodesOrAppElements[this.rootNodesOrAppElements.length - 1] :
                    null;
                return _findLastRenderNode(lastNode);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Overwritten by implementations
         */
        AppView.prototype.dirtyParentQueriesInternal = function () { };
        AppView.prototype.detectChanges = function (throwOnChange) {
            var s = _scope_check(this.clazz);
            if (this.cdMode === ChangeDetectionStrategy.Detached ||
                this.cdMode === ChangeDetectionStrategy.Checked ||
                this.cdState === ChangeDetectorState.Errored)
                return;
            if (this.destroyed) {
                this.throwDestroyedError('detectChanges');
            }
            this.detectChangesInternal(throwOnChange);
            if (this.cdMode === ChangeDetectionStrategy.CheckOnce)
                this.cdMode = ChangeDetectionStrategy.Checked;
            this.cdState = ChangeDetectorState.CheckedBefore;
            wtfLeave(s);
        };
        /**
         * Overwritten by implementations
         */
        AppView.prototype.detectChangesInternal = function (throwOnChange) {
            this.detectContentChildrenChanges(throwOnChange);
            this.detectViewChildrenChanges(throwOnChange);
        };
        AppView.prototype.detectContentChildrenChanges = function (throwOnChange) {
            for (var i = 0; i < this.contentChildren.length; ++i) {
                this.contentChildren[i].detectChanges(throwOnChange);
            }
        };
        AppView.prototype.detectViewChildrenChanges = function (throwOnChange) {
            for (var i = 0; i < this.viewChildren.length; ++i) {
                this.viewChildren[i].detectChanges(throwOnChange);
            }
        };
        AppView.prototype.addToContentChildren = function (renderAppElement) {
            renderAppElement.parentView.contentChildren.push(this);
            this.viewContainerElement = renderAppElement;
            this.dirtyParentQueriesInternal();
        };
        AppView.prototype.removeFromContentChildren = function (renderAppElement) {
            ListWrapper.remove(renderAppElement.parentView.contentChildren, this);
            this.dirtyParentQueriesInternal();
            this.viewContainerElement = null;
        };
        AppView.prototype.markAsCheckOnce = function () { this.cdMode = ChangeDetectionStrategy.CheckOnce; };
        AppView.prototype.markPathToRootAsCheckOnce = function () {
            var c = this;
            while (isPresent(c) && c.cdMode !== ChangeDetectionStrategy.Detached) {
                if (c.cdMode === ChangeDetectionStrategy.Checked) {
                    c.cdMode = ChangeDetectionStrategy.CheckOnce;
                }
                var parentEl = c.type === ViewType.COMPONENT ? c.declarationAppElement : c.viewContainerElement;
                c = isPresent(parentEl) ? parentEl.parentView : null;
            }
        };
        AppView.prototype.eventHandler = function (cb) { return cb; };
        AppView.prototype.throwDestroyedError = function (details) { throw new ViewDestroyedException(details); };
        return AppView;
    }());
    var DebugAppView = (function (_super) {
        __extends(DebugAppView, _super);
        function DebugAppView(clazz, componentType, type, viewUtils, parentInjector, declarationAppElement, cdMode, staticNodeDebugInfos) {
            _super.call(this, clazz, componentType, type, viewUtils, parentInjector, declarationAppElement, cdMode);
            this.staticNodeDebugInfos = staticNodeDebugInfos;
            this._currentDebugContext = null;
        }
        DebugAppView.prototype.create = function (context, givenProjectableNodes, rootSelectorOrNode) {
            this._resetDebug();
            try {
                return _super.prototype.create.call(this, context, givenProjectableNodes, rootSelectorOrNode);
            }
            catch (e) {
                this._rethrowWithContext(e, e.stack);
                throw e;
            }
        };
        DebugAppView.prototype.injectorGet = function (token, nodeIndex, notFoundResult) {
            this._resetDebug();
            try {
                return _super.prototype.injectorGet.call(this, token, nodeIndex, notFoundResult);
            }
            catch (e) {
                this._rethrowWithContext(e, e.stack);
                throw e;
            }
        };
        DebugAppView.prototype.destroyLocal = function () {
            this._resetDebug();
            try {
                _super.prototype.destroyLocal.call(this);
            }
            catch (e) {
                this._rethrowWithContext(e, e.stack);
                throw e;
            }
        };
        DebugAppView.prototype.detectChanges = function (throwOnChange) {
            this._resetDebug();
            try {
                _super.prototype.detectChanges.call(this, throwOnChange);
            }
            catch (e) {
                this._rethrowWithContext(e, e.stack);
                throw e;
            }
        };
        DebugAppView.prototype._resetDebug = function () { this._currentDebugContext = null; };
        DebugAppView.prototype.debug = function (nodeIndex, rowNum, colNum) {
            return this._currentDebugContext = new DebugContext(this, nodeIndex, rowNum, colNum);
        };
        DebugAppView.prototype._rethrowWithContext = function (e, stack) {
            if (!(e instanceof ViewWrappedException)) {
                if (!(e instanceof ExpressionChangedAfterItHasBeenCheckedException)) {
                    this.cdState = ChangeDetectorState.Errored;
                }
                if (isPresent(this._currentDebugContext)) {
                    throw new ViewWrappedException(e, stack, this._currentDebugContext);
                }
            }
        };
        DebugAppView.prototype.eventHandler = function (cb) {
            var _this = this;
            var superHandler = _super.prototype.eventHandler.call(this, cb);
            return function (event) {
                _this._resetDebug();
                try {
                    return superHandler(event);
                }
                catch (e) {
                    _this._rethrowWithContext(e, e.stack);
                    throw e;
                }
            };
        };
        return DebugAppView;
    }(AppView));
    function _findLastRenderNode(node) {
        var lastNode;
        if (node instanceof AppElement) {
            var appEl = node;
            lastNode = appEl.nativeElement;
            if (isPresent(appEl.nestedViews)) {
                // Note: Views might have no root nodes at all!
                for (var i = appEl.nestedViews.length - 1; i >= 0; i--) {
                    var nestedView = appEl.nestedViews[i];
                    if (nestedView.rootNodesOrAppElements.length > 0) {
                        lastNode = _findLastRenderNode(nestedView.rootNodesOrAppElements[nestedView.rootNodesOrAppElements.length - 1]);
                    }
                }
            }
        }
        else {
            lastNode = node;
        }
        return lastNode;
    }
    /**
     * This is here because DART requires it. It is noop in JS.
     */
    function wtfInit() { }
    var DebugDomRootRenderer = (function () {
        function DebugDomRootRenderer(_delegate) {
            this._delegate = _delegate;
        }
        DebugDomRootRenderer.prototype.renderComponent = function (componentProto) {
            return new DebugDomRenderer(this._delegate.renderComponent(componentProto));
        };
        return DebugDomRootRenderer;
    }());
    var DebugDomRenderer = (function () {
        function DebugDomRenderer(_delegate) {
            this._delegate = _delegate;
        }
        DebugDomRenderer.prototype.selectRootElement = function (selectorOrNode, debugInfo) {
            var nativeEl = this._delegate.selectRootElement(selectorOrNode, debugInfo);
            var debugEl = new DebugElement(nativeEl, null, debugInfo);
            indexDebugNode(debugEl);
            return nativeEl;
        };
        DebugDomRenderer.prototype.createElement = function (parentElement, name, debugInfo) {
            var nativeEl = this._delegate.createElement(parentElement, name, debugInfo);
            var debugEl = new DebugElement(nativeEl, getDebugNode(parentElement), debugInfo);
            debugEl.name = name;
            indexDebugNode(debugEl);
            return nativeEl;
        };
        DebugDomRenderer.prototype.createViewRoot = function (hostElement) { return this._delegate.createViewRoot(hostElement); };
        DebugDomRenderer.prototype.createTemplateAnchor = function (parentElement, debugInfo) {
            var comment = this._delegate.createTemplateAnchor(parentElement, debugInfo);
            var debugEl = new DebugNode(comment, getDebugNode(parentElement), debugInfo);
            indexDebugNode(debugEl);
            return comment;
        };
        DebugDomRenderer.prototype.createText = function (parentElement, value, debugInfo) {
            var text = this._delegate.createText(parentElement, value, debugInfo);
            var debugEl = new DebugNode(text, getDebugNode(parentElement), debugInfo);
            indexDebugNode(debugEl);
            return text;
        };
        DebugDomRenderer.prototype.projectNodes = function (parentElement, nodes) {
            var debugParent = getDebugNode(parentElement);
            if (isPresent(debugParent) && debugParent instanceof DebugElement) {
                var debugElement_1 = debugParent;
                nodes.forEach(function (node) { debugElement_1.addChild(getDebugNode(node)); });
            }
            this._delegate.projectNodes(parentElement, nodes);
        };
        DebugDomRenderer.prototype.attachViewAfter = function (node, viewRootNodes) {
            var debugNode = getDebugNode(node);
            if (isPresent(debugNode)) {
                var debugParent = debugNode.parent;
                if (viewRootNodes.length > 0 && isPresent(debugParent)) {
                    var debugViewRootNodes = [];
                    viewRootNodes.forEach(function (rootNode) { return debugViewRootNodes.push(getDebugNode(rootNode)); });
                    debugParent.insertChildrenAfter(debugNode, debugViewRootNodes);
                }
            }
            this._delegate.attachViewAfter(node, viewRootNodes);
        };
        DebugDomRenderer.prototype.detachView = function (viewRootNodes) {
            viewRootNodes.forEach(function (node) {
                var debugNode = getDebugNode(node);
                if (isPresent(debugNode) && isPresent(debugNode.parent)) {
                    debugNode.parent.removeChild(debugNode);
                }
            });
            this._delegate.detachView(viewRootNodes);
        };
        DebugDomRenderer.prototype.destroyView = function (hostElement, viewAllNodes) {
            viewAllNodes.forEach(function (node) { removeDebugNodeFromIndex(getDebugNode(node)); });
            this._delegate.destroyView(hostElement, viewAllNodes);
        };
        DebugDomRenderer.prototype.listen = function (renderElement, name, callback) {
            var debugEl = getDebugNode(renderElement);
            if (isPresent(debugEl)) {
                debugEl.listeners.push(new EventListener(name, callback));
            }
            return this._delegate.listen(renderElement, name, callback);
        };
        DebugDomRenderer.prototype.listenGlobal = function (target, name, callback) {
            return this._delegate.listenGlobal(target, name, callback);
        };
        DebugDomRenderer.prototype.setElementProperty = function (renderElement, propertyName, propertyValue) {
            var debugEl = getDebugNode(renderElement);
            if (isPresent(debugEl) && debugEl instanceof DebugElement) {
                debugEl.properties[propertyName] = propertyValue;
            }
            this._delegate.setElementProperty(renderElement, propertyName, propertyValue);
        };
        DebugDomRenderer.prototype.setElementAttribute = function (renderElement, attributeName, attributeValue) {
            var debugEl = getDebugNode(renderElement);
            if (isPresent(debugEl) && debugEl instanceof DebugElement) {
                debugEl.attributes[attributeName] = attributeValue;
            }
            this._delegate.setElementAttribute(renderElement, attributeName, attributeValue);
        };
        DebugDomRenderer.prototype.setBindingDebugInfo = function (renderElement, propertyName, propertyValue) {
            this._delegate.setBindingDebugInfo(renderElement, propertyName, propertyValue);
        };
        DebugDomRenderer.prototype.setElementClass = function (renderElement, className, isAdd) {
            this._delegate.setElementClass(renderElement, className, isAdd);
        };
        DebugDomRenderer.prototype.setElementStyle = function (renderElement, styleName, styleValue) {
            this._delegate.setElementStyle(renderElement, styleName, styleValue);
        };
        DebugDomRenderer.prototype.invokeElementMethod = function (renderElement, methodName, args) {
            this._delegate.invokeElementMethod(renderElement, methodName, args);
        };
        DebugDomRenderer.prototype.setText = function (renderNode, text) { this._delegate.setText(renderNode, text); };
        return DebugDomRenderer;
    }());
    var r = {
        isDefaultChangeDetectionStrategy: isDefaultChangeDetectionStrategy,
        ChangeDetectorState: ChangeDetectorState,
        CHANGE_DETECTION_STRATEGY_VALUES: CHANGE_DETECTION_STRATEGY_VALUES,
        constructDependencies: constructDependencies,
        LifecycleHooks: LifecycleHooks,
        LIFECYCLE_HOOKS_VALUES: LIFECYCLE_HOOKS_VALUES,
        ReflectorReader: ReflectorReader,
        ReflectorComponentResolver: ReflectorComponentResolver,
        AppElement: AppElement,
        AppView: AppView,
        DebugAppView: DebugAppView,
        ViewType: ViewType,
        MAX_INTERPOLATION_VALUES: MAX_INTERPOLATION_VALUES,
        checkBinding: checkBinding,
        flattenNestedViewRenderNodes: flattenNestedViewRenderNodes,
        interpolate: interpolate,
        ViewUtils: ViewUtils,
        VIEW_ENCAPSULATION_VALUES: VIEW_ENCAPSULATION_VALUES,
        DebugContext: DebugContext,
        StaticNodeDebugInfo: StaticNodeDebugInfo,
        devModeEqual: devModeEqual,
        uninitialized: uninitialized,
        ValueUnwrapper: ValueUnwrapper,
        RenderDebugInfo: RenderDebugInfo,
        SecurityContext: SecurityContext,
        SanitizationService: SanitizationService,
        TemplateRef_: TemplateRef_,
        wtfInit: wtfInit,
        ReflectionCapabilities: ReflectionCapabilities,
        makeDecorator: makeDecorator,
        DebugDomRootRenderer: DebugDomRootRenderer,
        createProvider: createProvider,
        isProviderLiteral: isProviderLiteral,
        EMPTY_ARRAY: EMPTY_ARRAY,
        EMPTY_MAP: EMPTY_MAP,
        pureProxy1: pureProxy1,
        pureProxy2: pureProxy2,
        pureProxy3: pureProxy3,
        pureProxy4: pureProxy4,
        pureProxy5: pureProxy5,
        pureProxy6: pureProxy6,
        pureProxy7: pureProxy7,
        pureProxy8: pureProxy8,
        pureProxy9: pureProxy9,
        pureProxy10: pureProxy10,
        castByValue: castByValue,
        Console: Console,
    };
    var globalScope$1;
    if (typeof window === 'undefined') {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            // TODO: Replace any with WorkerGlobalScope from lib.webworker.d.ts #3492
            globalScope$1 = self;
        }
        else {
            globalScope$1 = global;
        }
    }
    else {
        globalScope$1 = window;
    }
    var IS_DART$1 = false;
    // Need to declare a new variable for global here since TypeScript
    // exports the original value of the symbol.
    var global$2 = globalScope$1;
    var Date$1 = global$2.Date;
    var _devMode$1 = true;
    function assertionsEnabled$1() {
        return _devMode$1;
    }
    // TODO: remove calls to assert in production environment
    // Note: Can't just export this and import in in other files
    // as `assert` is a reserved keyword in Dart
    global$2.assert = function assert(condition) {
        // TODO: to be fixed properly via #2830, noop for now
    };
    function isPresent$1(obj) {
        return obj !== undefined && obj !== null;
    }
    function isBlank$1(obj) {
        return obj === undefined || obj === null;
    }
    function isString$1(obj) {
        return typeof obj === "string";
    }
    function isFunction$2(obj) {
        return typeof obj === "function";
    }
    function isArray$2(obj) {
        return Array.isArray(obj);
    }
    function stringify$1(token) {
        if (typeof token === 'string') {
            return token;
        }
        if (token === undefined || token === null) {
            return '' + token;
        }
        if (token.name) {
            return token.name;
        }
        if (token.overriddenName) {
            return token.overriddenName;
        }
        var res = token.toString();
        var newLineIndex = res.indexOf("\n");
        return (newLineIndex === -1) ? res : res.substring(0, newLineIndex);
    }
    var StringWrapper$1 = (function () {
        function StringWrapper$1() {
        }
        StringWrapper$1.fromCharCode = function (code) { return String.fromCharCode(code); };
        StringWrapper$1.charCodeAt = function (s, index) { return s.charCodeAt(index); };
        StringWrapper$1.split = function (s, regExp) { return s.split(regExp); };
        StringWrapper$1.equals = function (s, s2) { return s === s2; };
        StringWrapper$1.stripLeft = function (s, charVal) {
            if (s && s.length) {
                var pos = 0;
                for (var i = 0; i < s.length; i++) {
                    if (s[i] != charVal)
                        break;
                    pos++;
                }
                s = s.substring(pos);
            }
            return s;
        };
        StringWrapper$1.stripRight = function (s, charVal) {
            if (s && s.length) {
                var pos = s.length;
                for (var i = s.length - 1; i >= 0; i--) {
                    if (s[i] != charVal)
                        break;
                    pos--;
                }
                s = s.substring(0, pos);
            }
            return s;
        };
        StringWrapper$1.replace = function (s, from, replace) {
            return s.replace(from, replace);
        };
        StringWrapper$1.replaceAll = function (s, from, replace) {
            return s.replace(from, replace);
        };
        StringWrapper$1.slice = function (s, from, to) {
            if (from === void 0) { from = 0; }
            if (to === void 0) { to = null; }
            return s.slice(from, to === null ? undefined : to);
        };
        StringWrapper$1.replaceAllMapped = function (s, from, cb) {
            return s.replace(from, function () {
                var matches = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    matches[_i - 0] = arguments[_i];
                }
                // Remove offset & string from the result array
                matches.splice(-2, 2);
                // The callback receives match, p1, ..., pn
                return cb(matches);
            });
        };
        StringWrapper$1.contains = function (s, substr) { return s.indexOf(substr) != -1; };
        StringWrapper$1.compare = function (a, b) {
            if (a < b) {
                return -1;
            }
            else if (a > b) {
                return 1;
            }
            else {
                return 0;
            }
        };
        return StringWrapper$1;
    }());
    var NumberParseError$1 = (function (_super) {
        __extends(NumberParseError$1, _super);
        function NumberParseError$1(message) {
            _super.call(this);
            this.message = message;
        }
        NumberParseError$1.prototype.toString = function () { return this.message; };
        return NumberParseError$1;
    }(Error));
    var NumberWrapper$1 = (function () {
        function NumberWrapper$1() {
        }
        NumberWrapper$1.toFixed = function (n, fractionDigits) { return n.toFixed(fractionDigits); };
        NumberWrapper$1.equal = function (a, b) { return a === b; };
        NumberWrapper$1.parseIntAutoRadix = function (text) {
            var result = parseInt(text);
            if (isNaN(result)) {
                throw new NumberParseError$1("Invalid integer literal when parsing " + text);
            }
            return result;
        };
        NumberWrapper$1.parseInt = function (text, radix) {
            if (radix == 10) {
                if (/^(\-|\+)?[0-9]+$/.test(text)) {
                    return parseInt(text, radix);
                }
            }
            else if (radix == 16) {
                if (/^(\-|\+)?[0-9ABCDEFabcdef]+$/.test(text)) {
                    return parseInt(text, radix);
                }
            }
            else {
                var result = parseInt(text, radix);
                if (!isNaN(result)) {
                    return result;
                }
            }
            throw new NumberParseError$1("Invalid integer literal when parsing " + text + " in base " +
                radix);
        };
        // TODO: NaN is a valid literal but is returned by parseFloat to indicate an error.
        NumberWrapper$1.parseFloat = function (text) { return parseFloat(text); };
        Object.defineProperty(NumberWrapper$1, "NaN", {
            get: function () { return NaN; },
            enumerable: true,
            configurable: true
        });
        NumberWrapper$1.isNaN = function (value) { return isNaN(value); };
        NumberWrapper$1.isInteger = function (value) { return Number.isInteger(value); };
        return NumberWrapper$1;
    }());
    var RegExpWrapper$1 = (function () {
        function RegExpWrapper$1() {
        }
        RegExpWrapper$1.create = function (regExpStr, flags) {
            if (flags === void 0) { flags = ''; }
            flags = flags.replace(/g/g, '');
            return new global$2.RegExp(regExpStr, flags + 'g');
        };
        RegExpWrapper$1.firstMatch = function (regExp, input) {
            // Reset multimatch regex state
            regExp.lastIndex = 0;
            return regExp.exec(input);
        };
        RegExpWrapper$1.test = function (regExp, input) {
            regExp.lastIndex = 0;
            return regExp.test(input);
        };
        RegExpWrapper$1.matcher = function (regExp, input) {
            // Reset regex state for the case
            // someone did not loop over all matches
            // last time.
            regExp.lastIndex = 0;
            return { re: regExp, input: input };
        };
        RegExpWrapper$1.replaceAll = function (regExp, input, replace) {
            var c = regExp.exec(input);
            var res = '';
            regExp.lastIndex = 0;
            var prev = 0;
            while (c) {
                res += input.substring(prev, c.index);
                res += replace(c);
                prev = c.index + c[0].length;
                regExp.lastIndex = prev;
                c = regExp.exec(input);
            }
            res += input.substring(prev);
            return res;
        };
        return RegExpWrapper$1;
    }());
    // Can't be all uppercase as our transpiler would think it is a special directive...
    var Json$1 = (function () {
        function Json$1() {
        }
        Json$1.parse = function (s) { return global$2.JSON.parse(s); };
        Json$1.stringify = function (data) {
            // Dart doesn't take 3 arguments
            return global$2.JSON.stringify(data, null, 2);
        };
        return Json$1;
    }());
    var DateWrapper$1 = (function () {
        function DateWrapper$1() {
        }
        DateWrapper$1.create = function (year, month, day, hour, minutes, seconds, milliseconds) {
            if (month === void 0) { month = 1; }
            if (day === void 0) { day = 1; }
            if (hour === void 0) { hour = 0; }
            if (minutes === void 0) { minutes = 0; }
            if (seconds === void 0) { seconds = 0; }
            if (milliseconds === void 0) { milliseconds = 0; }
            return new Date$1(year, month - 1, day, hour, minutes, seconds, milliseconds);
        };
        DateWrapper$1.fromISOString = function (str) { return new Date$1(str); };
        DateWrapper$1.fromMillis = function (ms) { return new Date$1(ms); };
        DateWrapper$1.toMillis = function (date) { return date.getTime(); };
        DateWrapper$1.now = function () { return new Date$1(); };
        DateWrapper$1.toJson = function (date) { return date.toJSON(); };
        return DateWrapper$1;
    }());
    function setValueOnPath$1(global, path, value) {
        var parts = path.split('.');
        var obj = global;
        while (parts.length > 1) {
            var name = parts.shift();
            if (obj.hasOwnProperty(name) && isPresent$1(obj[name])) {
                obj = obj[name];
            }
            else {
                obj = obj[name] = {};
            }
        }
        if (obj === undefined || obj === null) {
            obj = {};
        }
        obj[parts.shift()] = value;
    }
    var wtfInit$1 = r.wtfInit;
    var DebugDomRootRenderer$1 = r.DebugDomRootRenderer;
    var SecurityContext$1 = r.SecurityContext;
    var SanitizationService$1 = r.SanitizationService;
    var globalScope$2;
    if (typeof window === 'undefined') {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            // TODO: Replace any with WorkerGlobalScope from lib.webworker.d.ts #3492
            globalScope$2 = self;
        }
        else {
            globalScope$2 = global;
        }
    }
    else {
        globalScope$2 = window;
    }
    // Need to declare a new variable for global here since TypeScript
    // exports the original value of the symbol.
    var global$3 = globalScope$2;
    function getTypeNameForDebugging$2(type) {
        if (type['name']) {
            return type['name'];
        }
        return typeof type;
    }
    var Date$2 = global$3.Date;
    // TODO: remove calls to assert in production environment
    // Note: Can't just export this and import in in other files
    // as `assert` is a reserved keyword in Dart
    global$3.assert = function assert(condition) {
        // TODO: to be fixed properly via #2830, noop for now
    };
    function isPresent$2(obj) {
        return obj !== undefined && obj !== null;
    }
    function isBlank$2(obj) {
        return obj === undefined || obj === null;
    }
    function isNumber$2(obj) {
        return typeof obj === "number";
    }
    function isString$2(obj) {
        return typeof obj === "string";
    }
    function isFunction$3(obj) {
        return typeof obj === "function";
    }
    function isStringMap$2(obj) {
        return typeof obj === 'object' && obj !== null;
    }
    function isPromise$2(obj) {
        return obj instanceof global$3.Promise;
    }
    function isArray$3(obj) {
        return Array.isArray(obj);
    }
    function isDate$2(obj) {
        return obj instanceof Date$2 && !isNaN(obj.valueOf());
    }
    function noop$2() { }
    function stringify$2(token) {
        if (typeof token === 'string') {
            return token;
        }
        if (token === undefined || token === null) {
            return '' + token;
        }
        if (token.name) {
            return token.name;
        }
        if (token.overriddenName) {
            return token.overriddenName;
        }
        var res = token.toString();
        var newLineIndex = res.indexOf("\n");
        return (newLineIndex === -1) ? res : res.substring(0, newLineIndex);
    }
    var StringWrapper$2 = (function () {
        function StringWrapper$2() {
        }
        StringWrapper$2.fromCharCode = function (code) { return String.fromCharCode(code); };
        StringWrapper$2.charCodeAt = function (s, index) { return s.charCodeAt(index); };
        StringWrapper$2.split = function (s, regExp) { return s.split(regExp); };
        StringWrapper$2.equals = function (s, s2) { return s === s2; };
        StringWrapper$2.stripLeft = function (s, charVal) {
            if (s && s.length) {
                var pos = 0;
                for (var i = 0; i < s.length; i++) {
                    if (s[i] != charVal)
                        break;
                    pos++;
                }
                s = s.substring(pos);
            }
            return s;
        };
        StringWrapper$2.stripRight = function (s, charVal) {
            if (s && s.length) {
                var pos = s.length;
                for (var i = s.length - 1; i >= 0; i--) {
                    if (s[i] != charVal)
                        break;
                    pos--;
                }
                s = s.substring(0, pos);
            }
            return s;
        };
        StringWrapper$2.replace = function (s, from, replace) {
            return s.replace(from, replace);
        };
        StringWrapper$2.replaceAll = function (s, from, replace) {
            return s.replace(from, replace);
        };
        StringWrapper$2.slice = function (s, from, to) {
            if (from === void 0) { from = 0; }
            if (to === void 0) { to = null; }
            return s.slice(from, to === null ? undefined : to);
        };
        StringWrapper$2.replaceAllMapped = function (s, from, cb) {
            return s.replace(from, function () {
                var matches = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    matches[_i - 0] = arguments[_i];
                }
                // Remove offset & string from the result array
                matches.splice(-2, 2);
                // The callback receives match, p1, ..., pn
                return cb(matches);
            });
        };
        StringWrapper$2.contains = function (s, substr) { return s.indexOf(substr) != -1; };
        StringWrapper$2.compare = function (a, b) {
            if (a < b) {
                return -1;
            }
            else if (a > b) {
                return 1;
            }
            else {
                return 0;
            }
        };
        return StringWrapper$2;
    }());
    var NumberParseError$2 = (function (_super) {
        __extends(NumberParseError$2, _super);
        function NumberParseError$2(message) {
            _super.call(this);
            this.message = message;
        }
        NumberParseError$2.prototype.toString = function () { return this.message; };
        return NumberParseError$2;
    }(Error));
    var NumberWrapper$2 = (function () {
        function NumberWrapper$2() {
        }
        NumberWrapper$2.toFixed = function (n, fractionDigits) { return n.toFixed(fractionDigits); };
        NumberWrapper$2.equal = function (a, b) { return a === b; };
        NumberWrapper$2.parseIntAutoRadix = function (text) {
            var result = parseInt(text);
            if (isNaN(result)) {
                throw new NumberParseError$2("Invalid integer literal when parsing " + text);
            }
            return result;
        };
        NumberWrapper$2.parseInt = function (text, radix) {
            if (radix == 10) {
                if (/^(\-|\+)?[0-9]+$/.test(text)) {
                    return parseInt(text, radix);
                }
            }
            else if (radix == 16) {
                if (/^(\-|\+)?[0-9ABCDEFabcdef]+$/.test(text)) {
                    return parseInt(text, radix);
                }
            }
            else {
                var result = parseInt(text, radix);
                if (!isNaN(result)) {
                    return result;
                }
            }
            throw new NumberParseError$2("Invalid integer literal when parsing " + text + " in base " +
                radix);
        };
        // TODO: NaN is a valid literal but is returned by parseFloat to indicate an error.
        NumberWrapper$2.parseFloat = function (text) { return parseFloat(text); };
        Object.defineProperty(NumberWrapper$2, "NaN", {
            get: function () { return NaN; },
            enumerable: true,
            configurable: true
        });
        NumberWrapper$2.isNaN = function (value) { return isNaN(value); };
        NumberWrapper$2.isInteger = function (value) { return Number.isInteger(value); };
        return NumberWrapper$2;
    }());
    var RegExpWrapper$2 = (function () {
        function RegExpWrapper$2() {
        }
        RegExpWrapper$2.create = function (regExpStr, flags) {
            if (flags === void 0) { flags = ''; }
            flags = flags.replace(/g/g, '');
            return new global$3.RegExp(regExpStr, flags + 'g');
        };
        RegExpWrapper$2.firstMatch = function (regExp, input) {
            // Reset multimatch regex state
            regExp.lastIndex = 0;
            return regExp.exec(input);
        };
        RegExpWrapper$2.test = function (regExp, input) {
            regExp.lastIndex = 0;
            return regExp.test(input);
        };
        RegExpWrapper$2.matcher = function (regExp, input) {
            // Reset regex state for the case
            // someone did not loop over all matches
            // last time.
            regExp.lastIndex = 0;
            return { re: regExp, input: input };
        };
        RegExpWrapper$2.replaceAll = function (regExp, input, replace) {
            var c = regExp.exec(input);
            var res = '';
            regExp.lastIndex = 0;
            var prev = 0;
            while (c) {
                res += input.substring(prev, c.index);
                res += replace(c);
                prev = c.index + c[0].length;
                regExp.lastIndex = prev;
                c = regExp.exec(input);
            }
            res += input.substring(prev);
            return res;
        };
        return RegExpWrapper$2;
    }());
    // JS has NaN !== NaN
    function looseIdentical$2(a, b) {
        return a === b || typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b);
    }
    function normalizeBlank$2(obj) {
        return isBlank$2(obj) ? null : obj;
    }
    function normalizeBool$2(obj) {
        return isBlank$2(obj) ? false : obj;
    }
    function isJsObject$2(o) {
        return o !== null && (typeof o === "function" || typeof o === "object");
    }
    // Can't be all uppercase as our transpiler would think it is a special directive...
    var Json$2 = (function () {
        function Json$2() {
        }
        Json$2.parse = function (s) { return global$3.JSON.parse(s); };
        Json$2.stringify = function (data) {
            // Dart doesn't take 3 arguments
            return global$3.JSON.stringify(data, null, 2);
        };
        return Json$2;
    }());
    var DateWrapper$2 = (function () {
        function DateWrapper$2() {
        }
        DateWrapper$2.create = function (year, month, day, hour, minutes, seconds, milliseconds) {
            if (month === void 0) { month = 1; }
            if (day === void 0) { day = 1; }
            if (hour === void 0) { hour = 0; }
            if (minutes === void 0) { minutes = 0; }
            if (seconds === void 0) { seconds = 0; }
            if (milliseconds === void 0) { milliseconds = 0; }
            return new Date$2(year, month - 1, day, hour, minutes, seconds, milliseconds);
        };
        DateWrapper$2.fromISOString = function (str) { return new Date$2(str); };
        DateWrapper$2.fromMillis = function (ms) { return new Date$2(ms); };
        DateWrapper$2.toMillis = function (date) { return date.getTime(); };
        DateWrapper$2.now = function () { return new Date$2(); };
        DateWrapper$2.toJson = function (date) { return date.toJSON(); };
        return DateWrapper$2;
    }());
    var _symbolIterator$2 = null;
    function getSymbolIterator$2() {
        if (isBlank$2(_symbolIterator$2)) {
            if (isPresent$2(globalScope$2.Symbol) && isPresent$2(Symbol.iterator)) {
                _symbolIterator$2 = Symbol.iterator;
            }
            else {
                // es6-shim specific logic
                var keys = Object.getOwnPropertyNames(Map.prototype);
                for (var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    if (key !== 'entries' && key !== 'size' &&
                        Map.prototype[key] === Map.prototype['entries']) {
                        _symbolIterator$2 = key;
                    }
                }
            }
        }
        return _symbolIterator$2;
    }
    function isPrimitive$2(obj) {
        return !isJsObject$2(obj);
    }
    function hasConstructor$2(value, type) {
        return value.constructor === type;
    }
    var PromiseCompleter$1 = (function () {
        function PromiseCompleter$1() {
            var _this = this;
            this.promise = new Promise(function (res, rej) {
                _this.resolve = res;
                _this.reject = rej;
            });
        }
        return PromiseCompleter$1;
    }());
    var PromiseWrapper$1 = (function () {
        function PromiseWrapper$1() {
        }
        PromiseWrapper$1.resolve = function (obj) { return Promise.resolve(obj); };
        PromiseWrapper$1.reject = function (obj, _) { return Promise.reject(obj); };
        // Note: We can't rename this method into `catch`, as this is not a valid
        // method name in Dart.
        PromiseWrapper$1.catchError = function (promise, onError) {
            return promise.catch(onError);
        };
        PromiseWrapper$1.all = function (promises) {
            if (promises.length == 0)
                return Promise.resolve([]);
            return Promise.all(promises);
        };
        PromiseWrapper$1.then = function (promise, success, rejection) {
            return promise.then(success, rejection);
        };
        PromiseWrapper$1.wrap = function (computation) {
            return new Promise(function (res, rej) {
                try {
                    res(computation());
                }
                catch (e) {
                    rej(e);
                }
            });
        };
        PromiseWrapper$1.scheduleMicrotask = function (computation) {
            PromiseWrapper$1.then(PromiseWrapper$1.resolve(null), computation, function (_) { });
        };
        PromiseWrapper$1.isPromise = function (obj) { return obj instanceof Promise; };
        PromiseWrapper$1.completer = function () { return new PromiseCompleter$1(); };
        return PromiseWrapper$1;
    }());
    var ObservableWrapper$1 = (function () {
        function ObservableWrapper$1() {
        }
        // TODO(vsavkin): when we use rxnext, try inferring the generic type from the first arg
        ObservableWrapper$1.subscribe = function (emitter, onNext, onError, onComplete) {
            if (onComplete === void 0) { onComplete = function () { }; }
            onError = (typeof onError === "function") && onError || noop$2;
            onComplete = (typeof onComplete === "function") && onComplete || noop$2;
            return emitter.subscribe({ next: onNext, error: onError, complete: onComplete });
        };
        ObservableWrapper$1.isObservable = function (obs) { return !!obs.subscribe; };
        /**
         * Returns whether `obs` has any subscribers listening to events.
         */
        ObservableWrapper$1.hasSubscribers = function (obs) { return obs.observers.length > 0; };
        ObservableWrapper$1.dispose = function (subscription) { subscription.unsubscribe(); };
        /**
         * @deprecated - use callEmit() instead
         */
        ObservableWrapper$1.callNext = function (emitter, value) { emitter.next(value); };
        ObservableWrapper$1.callEmit = function (emitter, value) { emitter.emit(value); };
        ObservableWrapper$1.callError = function (emitter, error) { emitter.error(error); };
        ObservableWrapper$1.callComplete = function (emitter) { emitter.complete(); };
        ObservableWrapper$1.fromPromise = function (promise) {
            return PromiseObservable.create(promise);
        };
        ObservableWrapper$1.toPromise = function (obj) { return toPromise.call(obj); };
        return ObservableWrapper$1;
    }());
    /**
     * Use by directives and components to emit custom Events.
     *
     * ### Examples
     *
     * In the following example, `Zippy` alternatively emits `open` and `close` events when its
     * title gets clicked:
     *
     * ```
     * @Component({
     *   selector: 'zippy',
     *   template: `
     *   <div class="zippy">
     *     <div (click)="toggle()">Toggle</div>
     *     <div [hidden]="!visible">
     *       <ng-content></ng-content>
     *     </div>
     *  </div>`})
     * export class Zippy {
     *   visible: boolean = true;
     *   @Output() open: EventEmitter<any> = new EventEmitter();
     *   @Output() close: EventEmitter<any> = new EventEmitter();
     *
     *   toggle() {
     *     this.visible = !this.visible;
     *     if (this.visible) {
     *       this.open.emit(null);
     *     } else {
     *       this.close.emit(null);
     *     }
     *   }
     * }
     * ```
     *
     * Use Rx.Observable but provides an adapter to make it work as specified here:
     * https://github.com/jhusain/observable-spec
     *
     * Once a reference implementation of the spec is available, switch to it.
     */
    var EventEmitter$1 = (function (_super) {
        __extends(EventEmitter$1, _super);
        /**
         * Creates an instance of [EventEmitter], which depending on [isAsync],
         * delivers events synchronously or asynchronously.
         */
        function EventEmitter$1(isAsync) {
            if (isAsync === void 0) { isAsync = true; }
            _super.call(this);
            this._isAsync = isAsync;
        }
        EventEmitter$1.prototype.emit = function (value) { _super.prototype.next.call(this, value); };
        /**
         * @deprecated - use .emit(value) instead
         */
        EventEmitter$1.prototype.next = function (value) { _super.prototype.next.call(this, value); };
        EventEmitter$1.prototype.subscribe = function (generatorOrNext, error, complete) {
            var schedulerFn;
            var errorFn = function (err) { return null; };
            var completeFn = function () { return null; };
            if (generatorOrNext && typeof generatorOrNext === 'object') {
                schedulerFn = this._isAsync ? function (value) { setTimeout(function () { return generatorOrNext.next(value); }); } :
                    function (value) { generatorOrNext.next(value); };
                if (generatorOrNext.error) {
                    errorFn = this._isAsync ? function (err) { setTimeout(function () { return generatorOrNext.error(err); }); } :
                        function (err) { generatorOrNext.error(err); };
                }
                if (generatorOrNext.complete) {
                    completeFn = this._isAsync ? function () { setTimeout(function () { return generatorOrNext.complete(); }); } :
                        function () { generatorOrNext.complete(); };
                }
            }
            else {
                schedulerFn = this._isAsync ? function (value) { setTimeout(function () { return generatorOrNext(value); }); } :
                    function (value) { generatorOrNext(value); };
                if (error) {
                    errorFn =
                        this._isAsync ? function (err) { setTimeout(function () { return error(err); }); } : function (err) { error(err); };
                }
                if (complete) {
                    completeFn =
                        this._isAsync ? function () { setTimeout(function () { return complete(); }); } : function () { complete(); };
                }
            }
            return _super.prototype.subscribe.call(this, schedulerFn, errorFn, completeFn);
        };
        return EventEmitter$1;
    }(Subject));
    var Map$2 = global$3.Map;
    var Set$2 = global$3.Set;
    // Safari and Internet Explorer do not support the iterable parameter to the
    // Map constructor.  We work around that by manually adding the items.
    var createMapFromPairs$1 = (function () {
        try {
            if (new Map$2([[1, 2]]).size === 1) {
                return function createMapFromPairs(pairs) { return new Map$2(pairs); };
            }
        }
        catch (e) {
        }
        return function createMapAndPopulateFromPairs(pairs) {
            var map = new Map$2();
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                map.set(pair[0], pair[1]);
            }
            return map;
        };
    })();
    var createMapFromMap$1 = (function () {
        try {
            if (new Map$2(new Map$2())) {
                return function createMapFromMap(m) { return new Map$2(m); };
            }
        }
        catch (e) {
        }
        return function createMapAndPopulateFromMap(m) {
            var map = new Map$2();
            m.forEach(function (v, k) { map.set(k, v); });
            return map;
        };
    })();
    var _clearValues$1 = (function () {
        if ((new Map$2()).keys().next) {
            return function _clearValues(m) {
                var keyIterator = m.keys();
                var k;
                while (!((k = keyIterator.next()).done)) {
                    m.set(k.value, null);
                }
            };
        }
        else {
            return function _clearValuesWithForeEach(m) {
                m.forEach(function (v, k) { m.set(k, null); });
            };
        }
    })();
    // Safari doesn't implement MapIterator.next(), which is used is Traceur's polyfill of Array.from
    // TODO(mlaval): remove the work around once we have a working polyfill of Array.from
    var _arrayFromMap$1 = (function () {
        try {
            if ((new Map$2()).values().next) {
                return function createArrayFromMap(m, getValues) {
                    return getValues ? Array.from(m.values()) : Array.from(m.keys());
                };
            }
        }
        catch (e) {
        }
        return function createArrayFromMapWithForeach(m, getValues) {
            var res = ListWrapper$1.createFixedSize(m.size), i = 0;
            m.forEach(function (v, k) {
                res[i] = getValues ? v : k;
                i++;
            });
            return res;
        };
    })();
    var MapWrapper$1 = (function () {
        function MapWrapper$1() {
        }
        MapWrapper$1.clone = function (m) { return createMapFromMap$1(m); };
        MapWrapper$1.createFromStringMap = function (stringMap) {
            var result = new Map$2();
            for (var prop in stringMap) {
                result.set(prop, stringMap[prop]);
            }
            return result;
        };
        MapWrapper$1.toStringMap = function (m) {
            var r = {};
            m.forEach(function (v, k) { return r[k] = v; });
            return r;
        };
        MapWrapper$1.createFromPairs = function (pairs) { return createMapFromPairs$1(pairs); };
        MapWrapper$1.clearValues = function (m) { _clearValues$1(m); };
        MapWrapper$1.iterable = function (m) { return m; };
        MapWrapper$1.keys = function (m) { return _arrayFromMap$1(m, false); };
        MapWrapper$1.values = function (m) { return _arrayFromMap$1(m, true); };
        return MapWrapper$1;
    }());
    /**
     * Wraps Javascript Objects
     */
    var StringMapWrapper$1 = (function () {
        function StringMapWrapper$1() {
        }
        StringMapWrapper$1.create = function () {
            // Note: We are not using Object.create(null) here due to
            // performance!
            // http://jsperf.com/ng2-object-create-null
            return {};
        };
        StringMapWrapper$1.contains = function (map, key) {
            return map.hasOwnProperty(key);
        };
        StringMapWrapper$1.get = function (map, key) {
            return map.hasOwnProperty(key) ? map[key] : undefined;
        };
        StringMapWrapper$1.set = function (map, key, value) { map[key] = value; };
        StringMapWrapper$1.keys = function (map) { return Object.keys(map); };
        StringMapWrapper$1.values = function (map) {
            return Object.keys(map).reduce(function (r, a) {
                r.push(map[a]);
                return r;
            }, []);
        };
        StringMapWrapper$1.isEmpty = function (map) {
            for (var prop in map) {
                return false;
            }
            return true;
        };
        StringMapWrapper$1.delete = function (map, key) { delete map[key]; };
        StringMapWrapper$1.forEach = function (map, callback) {
            for (var prop in map) {
                if (map.hasOwnProperty(prop)) {
                    callback(map[prop], prop);
                }
            }
        };
        StringMapWrapper$1.merge = function (m1, m2) {
            var m = {};
            for (var attr in m1) {
                if (m1.hasOwnProperty(attr)) {
                    m[attr] = m1[attr];
                }
            }
            for (var attr in m2) {
                if (m2.hasOwnProperty(attr)) {
                    m[attr] = m2[attr];
                }
            }
            return m;
        };
        StringMapWrapper$1.equals = function (m1, m2) {
            var k1 = Object.keys(m1);
            var k2 = Object.keys(m2);
            if (k1.length != k2.length) {
                return false;
            }
            var key;
            for (var i = 0; i < k1.length; i++) {
                key = k1[i];
                if (m1[key] !== m2[key]) {
                    return false;
                }
            }
            return true;
        };
        return StringMapWrapper$1;
    }());
    var ListWrapper$1 = (function () {
        function ListWrapper$1() {
        }
        // JS has no way to express a statically fixed size list, but dart does so we
        // keep both methods.
        ListWrapper$1.createFixedSize = function (size) { return new Array(size); };
        ListWrapper$1.createGrowableSize = function (size) { return new Array(size); };
        ListWrapper$1.clone = function (array) { return array.slice(0); };
        ListWrapper$1.forEachWithIndex = function (array, fn) {
            for (var i = 0; i < array.length; i++) {
                fn(array[i], i);
            }
        };
        ListWrapper$1.first = function (array) {
            if (!array)
                return null;
            return array[0];
        };
        ListWrapper$1.last = function (array) {
            if (!array || array.length == 0)
                return null;
            return array[array.length - 1];
        };
        ListWrapper$1.indexOf = function (array, value, startIndex) {
            if (startIndex === void 0) { startIndex = 0; }
            return array.indexOf(value, startIndex);
        };
        ListWrapper$1.contains = function (list, el) { return list.indexOf(el) !== -1; };
        ListWrapper$1.reversed = function (array) {
            var a = ListWrapper$1.clone(array);
            return a.reverse();
        };
        ListWrapper$1.concat = function (a, b) { return a.concat(b); };
        ListWrapper$1.insert = function (list, index, value) { list.splice(index, 0, value); };
        ListWrapper$1.removeAt = function (list, index) {
            var res = list[index];
            list.splice(index, 1);
            return res;
        };
        ListWrapper$1.removeAll = function (list, items) {
            for (var i = 0; i < items.length; ++i) {
                var index = list.indexOf(items[i]);
                list.splice(index, 1);
            }
        };
        ListWrapper$1.remove = function (list, el) {
            var index = list.indexOf(el);
            if (index > -1) {
                list.splice(index, 1);
                return true;
            }
            return false;
        };
        ListWrapper$1.clear = function (list) { list.length = 0; };
        ListWrapper$1.isEmpty = function (list) { return list.length == 0; };
        ListWrapper$1.fill = function (list, value, start, end) {
            if (start === void 0) { start = 0; }
            if (end === void 0) { end = null; }
            list.fill(value, start, end === null ? list.length : end);
        };
        ListWrapper$1.equals = function (a, b) {
            if (a.length != b.length)
                return false;
            for (var i = 0; i < a.length; ++i) {
                if (a[i] !== b[i])
                    return false;
            }
            return true;
        };
        ListWrapper$1.slice = function (l, from, to) {
            if (from === void 0) { from = 0; }
            if (to === void 0) { to = null; }
            return l.slice(from, to === null ? undefined : to);
        };
        ListWrapper$1.splice = function (l, from, length) { return l.splice(from, length); };
        ListWrapper$1.sort = function (l, compareFn) {
            if (isPresent$2(compareFn)) {
                l.sort(compareFn);
            }
            else {
                l.sort();
            }
        };
        ListWrapper$1.toString = function (l) { return l.toString(); };
        ListWrapper$1.toJSON = function (l) { return JSON.stringify(l); };
        ListWrapper$1.maximum = function (list, predicate) {
            if (list.length == 0) {
                return null;
            }
            var solution = null;
            var maxValue = -Infinity;
            for (var index = 0; index < list.length; index++) {
                var candidate = list[index];
                if (isBlank$2(candidate)) {
                    continue;
                }
                var candidateValue = predicate(candidate);
                if (candidateValue > maxValue) {
                    solution = candidate;
                    maxValue = candidateValue;
                }
            }
            return solution;
        };
        ListWrapper$1.flatten = function (list) {
            var target = [];
            _flattenArray$1(list, target);
            return target;
        };
        ListWrapper$1.addAll = function (list, source) {
            for (var i = 0; i < source.length; i++) {
                list.push(source[i]);
            }
        };
        return ListWrapper$1;
    }());
    function _flattenArray$1(source, target) {
        if (isPresent$2(source)) {
            for (var i = 0; i < source.length; i++) {
                var item = source[i];
                if (isArray$3(item)) {
                    _flattenArray$1(item, target);
                }
                else {
                    target.push(item);
                }
            }
        }
        return target;
    }
    function isListLikeIterable$1(obj) {
        if (!isJsObject$2(obj))
            return false;
        return isArray$3(obj) ||
            (!(obj instanceof Map$2) &&
                getSymbolIterator$2() in obj); // JS Iterable have a Symbol.iterator prop
    }
    // Safari and Internet Explorer do not support the iterable parameter to the
    // Set constructor.  We work around that by manually adding the items.
    var createSetFromList$1 = (function () {
        var test = new Set$2([1, 2, 3]);
        if (test.size === 3) {
            return function createSetFromList(lst) { return new Set$2(lst); };
        }
        else {
            return function createSetAndPopulateFromList(lst) {
                var res = new Set$2(lst);
                if (res.size !== lst.length) {
                    for (var i = 0; i < lst.length; i++) {
                        res.add(lst[i]);
                    }
                }
                return res;
            };
        }
    })();
    var BaseException$1 = (function (_super) {
        __extends(BaseException$1, _super);
        function BaseException$1(message) {
            if (message === void 0) { message = "--"; }
            _super.call(this, message);
            this.message = message;
            this.stack = (new Error(message)).stack;
        }
        BaseException$1.prototype.toString = function () { return this.message; };
        return BaseException$1;
    }(Error));
    function unimplemented$1() {
        throw new BaseException$1('unimplemented');
    }
    var InvalidPipeArgumentException = (function (_super) {
        __extends(InvalidPipeArgumentException, _super);
        function InvalidPipeArgumentException(type, value) {
            _super.call(this, "Invalid argument '" + value + "' for pipe '" + stringify$2(type) + "'");
        }
        return InvalidPipeArgumentException;
    }(BaseException$1));
    var ObservableStrategy = (function () {
        function ObservableStrategy() {
        }
        ObservableStrategy.prototype.createSubscription = function (async, updateLatestValue) {
            return ObservableWrapper$1.subscribe(async, updateLatestValue, function (e) { throw e; });
        };
        ObservableStrategy.prototype.dispose = function (subscription) { ObservableWrapper$1.dispose(subscription); };
        ObservableStrategy.prototype.onDestroy = function (subscription) { ObservableWrapper$1.dispose(subscription); };
        return ObservableStrategy;
    }());
    var PromiseStrategy = (function () {
        function PromiseStrategy() {
        }
        PromiseStrategy.prototype.createSubscription = function (async, updateLatestValue) {
            return async.then(updateLatestValue);
        };
        PromiseStrategy.prototype.dispose = function (subscription) { };
        PromiseStrategy.prototype.onDestroy = function (subscription) { };
        return PromiseStrategy;
    }());
    var _promiseStrategy = new PromiseStrategy();
    var _observableStrategy = new ObservableStrategy();
    var AsyncPipe = (function () {
        function AsyncPipe(_ref) {
            /** @internal */
            this._latestValue = null;
            /** @internal */
            this._latestReturnedValue = null;
            /** @internal */
            this._subscription = null;
            /** @internal */
            this._obj = null;
            this._strategy = null;
            this._ref = _ref;
        }
        AsyncPipe.prototype.ngOnDestroy = function () {
            if (isPresent$2(this._subscription)) {
                this._dispose();
            }
        };
        AsyncPipe.prototype.transform = function (obj) {
            if (isBlank$2(this._obj)) {
                if (isPresent$2(obj)) {
                    this._subscribe(obj);
                }
                this._latestReturnedValue = this._latestValue;
                return this._latestValue;
            }
            if (obj !== this._obj) {
                this._dispose();
                return this.transform(obj);
            }
            if (this._latestValue === this._latestReturnedValue) {
                return this._latestReturnedValue;
            }
            else {
                this._latestReturnedValue = this._latestValue;
                return WrappedValue.wrap(this._latestValue);
            }
        };
        /** @internal */
        AsyncPipe.prototype._subscribe = function (obj) {
            var _this = this;
            this._obj = obj;
            this._strategy = this._selectStrategy(obj);
            this._subscription = this._strategy.createSubscription(obj, function (value) { return _this._updateLatestValue(obj, value); });
        };
        /** @internal */
        AsyncPipe.prototype._selectStrategy = function (obj) {
            if (isPromise$2(obj)) {
                return _promiseStrategy;
            }
            else if (ObservableWrapper$1.isObservable(obj)) {
                return _observableStrategy;
            }
            else {
                throw new InvalidPipeArgumentException(AsyncPipe, obj);
            }
        };
        /** @internal */
        AsyncPipe.prototype._dispose = function () {
            this._strategy.dispose(this._subscription);
            this._latestValue = null;
            this._latestReturnedValue = null;
            this._subscription = null;
            this._obj = null;
        };
        /** @internal */
        AsyncPipe.prototype._updateLatestValue = function (async, value) {
            if (async === this._obj) {
                this._latestValue = value;
                this._ref.markForCheck();
            }
        };
        return AsyncPipe;
    }());
    AsyncPipe.decorators = [
        { type: Pipe, args: [{ name: 'async', pure: false },] },
        { type: Injectable },
    ];
    AsyncPipe.ctorParameters = [
        { type: ChangeDetectorRef, },
    ];
    var NumberFormatStyle;
    (function (NumberFormatStyle) {
        NumberFormatStyle[NumberFormatStyle["Decimal"] = 0] = "Decimal";
        NumberFormatStyle[NumberFormatStyle["Percent"] = 1] = "Percent";
        NumberFormatStyle[NumberFormatStyle["Currency"] = 2] = "Currency";
    })(NumberFormatStyle || (NumberFormatStyle = {}));
    var NumberFormatter = (function () {
        function NumberFormatter() {
        }
        NumberFormatter.format = function (num, locale, style, _a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.minimumIntegerDigits, minimumIntegerDigits = _c === void 0 ? 1 : _c, _d = _b.minimumFractionDigits, minimumFractionDigits = _d === void 0 ? 0 : _d, _e = _b.maximumFractionDigits, maximumFractionDigits = _e === void 0 ? 3 : _e, currency = _b.currency, _f = _b.currencyAsSymbol, currencyAsSymbol = _f === void 0 ? false : _f;
            var intlOptions = {
                minimumIntegerDigits: minimumIntegerDigits,
                minimumFractionDigits: minimumFractionDigits,
                maximumFractionDigits: maximumFractionDigits
            };
            intlOptions.style = NumberFormatStyle[style].toLowerCase();
            if (style == NumberFormatStyle.Currency) {
                intlOptions.currency = currency;
                intlOptions.currencyDisplay = currencyAsSymbol ? 'symbol' : 'code';
            }
            return new Intl.NumberFormat(locale, intlOptions).format(num);
        };
        return NumberFormatter;
    }());
    function digitCondition(len) {
        return len == 2 ? '2-digit' : 'numeric';
    }
    function nameCondition(len) {
        return len < 4 ? 'short' : 'long';
    }
    function extractComponents(pattern) {
        var ret = {};
        var i = 0, j;
        while (i < pattern.length) {
            j = i;
            while (j < pattern.length && pattern[j] == pattern[i])
                j++;
            var len = j - i;
            switch (pattern[i]) {
                case 'G':
                    ret.era = nameCondition(len);
                    break;
                case 'y':
                    ret.year = digitCondition(len);
                    break;
                case 'M':
                    if (len >= 3)
                        ret.month = nameCondition(len);
                    else
                        ret.month = digitCondition(len);
                    break;
                case 'd':
                    ret.day = digitCondition(len);
                    break;
                case 'E':
                    ret.weekday = nameCondition(len);
                    break;
                case 'j':
                    ret.hour = digitCondition(len);
                    break;
                case 'h':
                    ret.hour = digitCondition(len);
                    ret.hour12 = true;
                    break;
                case 'H':
                    ret.hour = digitCondition(len);
                    ret.hour12 = false;
                    break;
                case 'm':
                    ret.minute = digitCondition(len);
                    break;
                case 's':
                    ret.second = digitCondition(len);
                    break;
                case 'z':
                    ret.timeZoneName = 'long';
                    break;
                case 'Z':
                    ret.timeZoneName = 'short';
                    break;
            }
            i = j;
        }
        return ret;
    }
    var dateFormatterCache = new Map();
    var DateFormatter = (function () {
        function DateFormatter() {
        }
        DateFormatter.format = function (date, locale, pattern) {
            var key = locale + pattern;
            if (dateFormatterCache.has(key)) {
                return dateFormatterCache.get(key).format(date);
            }
            var formatter = new Intl.DateTimeFormat(locale, extractComponents(pattern));
            dateFormatterCache.set(key, formatter);
            return formatter.format(date);
        };
        return DateFormatter;
    }());
    // TODO: move to a global configurable location along with other i18n components.
    var defaultLocale = 'en-US';
    var DatePipe = (function () {
        function DatePipe() {
        }
        DatePipe.prototype.transform = function (value, pattern) {
            if (pattern === void 0) { pattern = 'mediumDate'; }
            if (isBlank$2(value))
                return null;
            if (!this.supports(value)) {
                throw new InvalidPipeArgumentException(DatePipe, value);
            }
            if (isNumber$2(value)) {
                value = DateWrapper$2.fromMillis(value);
            }
            if (StringMapWrapper$1.contains(DatePipe._ALIASES, pattern)) {
                pattern = StringMapWrapper$1.get(DatePipe._ALIASES, pattern);
            }
            return DateFormatter.format(value, defaultLocale, pattern);
        };
        DatePipe.prototype.supports = function (obj) { return isDate$2(obj) || isNumber$2(obj); };
        return DatePipe;
    }());
    /** @internal */
    DatePipe._ALIASES = {
        'medium': 'yMMMdjms',
        'short': 'yMdjm',
        'fullDate': 'yMMMMEEEEd',
        'longDate': 'yMMMMd',
        'mediumDate': 'yMMMd',
        'shortDate': 'yMd',
        'mediumTime': 'jms',
        'shortTime': 'jm'
    };
    DatePipe.decorators = [
        { type: Pipe, args: [{ name: 'date', pure: true },] },
        { type: Injectable },
    ];
    var JsonPipe = (function () {
        function JsonPipe() {
        }
        JsonPipe.prototype.transform = function (value) { return Json$2.stringify(value); };
        return JsonPipe;
    }());
    JsonPipe.decorators = [
        { type: Pipe, args: [{ name: 'json', pure: false },] },
        { type: Injectable },
    ];
    var SlicePipe = (function () {
        function SlicePipe() {
        }
        SlicePipe.prototype.transform = function (value, start, end) {
            if (end === void 0) { end = null; }
            if (!this.supports(value)) {
                throw new InvalidPipeArgumentException(SlicePipe, value);
            }
            if (isBlank$2(value))
                return value;
            if (isString$2(value)) {
                return StringWrapper$2.slice(value, start, end);
            }
            return ListWrapper$1.slice(value, start, end);
        };
        SlicePipe.prototype.supports = function (obj) { return isString$2(obj) || isArray$3(obj); };
        return SlicePipe;
    }());
    SlicePipe.decorators = [
        { type: Pipe, args: [{ name: 'slice', pure: false },] },
        { type: Injectable },
    ];
    var LowerCasePipe = (function () {
        function LowerCasePipe() {
        }
        LowerCasePipe.prototype.transform = function (value) {
            if (isBlank$2(value))
                return value;
            if (!isString$2(value)) {
                throw new InvalidPipeArgumentException(LowerCasePipe, value);
            }
            return value.toLowerCase();
        };
        return LowerCasePipe;
    }());
    LowerCasePipe.decorators = [
        { type: Pipe, args: [{ name: 'lowercase' },] },
        { type: Injectable },
    ];
    var defaultLocale$1 = 'en-US';
    var _re = RegExpWrapper$2.create('^(\\d+)?\\.((\\d+)(\\-(\\d+))?)?$');
    var NumberPipe = (function () {
        function NumberPipe() {
        }
        /** @internal */
        NumberPipe._format = function (value, style, digits, currency, currencyAsSymbol) {
            if (currency === void 0) { currency = null; }
            if (currencyAsSymbol === void 0) { currencyAsSymbol = false; }
            if (isBlank$2(value))
                return null;
            if (!isNumber$2(value)) {
                throw new InvalidPipeArgumentException(NumberPipe, value);
            }
            var minInt = 1, minFraction = 0, maxFraction = 3;
            if (isPresent$2(digits)) {
                var parts = RegExpWrapper$2.firstMatch(_re, digits);
                if (isBlank$2(parts)) {
                    throw new BaseException$1(digits + " is not a valid digit info for number pipes");
                }
                if (isPresent$2(parts[1])) {
                    minInt = NumberWrapper$2.parseIntAutoRadix(parts[1]);
                }
                if (isPresent$2(parts[3])) {
                    minFraction = NumberWrapper$2.parseIntAutoRadix(parts[3]);
                }
                if (isPresent$2(parts[5])) {
                    maxFraction = NumberWrapper$2.parseIntAutoRadix(parts[5]);
                }
            }
            return NumberFormatter.format(value, defaultLocale$1, style, {
                minimumIntegerDigits: minInt,
                minimumFractionDigits: minFraction,
                maximumFractionDigits: maxFraction,
                currency: currency,
                currencyAsSymbol: currencyAsSymbol
            });
        };
        return NumberPipe;
    }());
    NumberPipe.decorators = [
        { type: Injectable },
    ];
    var DecimalPipe = (function (_super) {
        __extends(DecimalPipe, _super);
        function DecimalPipe() {
            _super.apply(this, arguments);
        }
        DecimalPipe.prototype.transform = function (value, digits) {
            if (digits === void 0) { digits = null; }
            return NumberPipe._format(value, NumberFormatStyle.Decimal, digits);
        };
        return DecimalPipe;
    }(NumberPipe));
    DecimalPipe.decorators = [
        { type: Pipe, args: [{ name: 'number' },] },
        { type: Injectable },
    ];
    var PercentPipe = (function (_super) {
        __extends(PercentPipe, _super);
        function PercentPipe() {
            _super.apply(this, arguments);
        }
        PercentPipe.prototype.transform = function (value, digits) {
            if (digits === void 0) { digits = null; }
            return NumberPipe._format(value, NumberFormatStyle.Percent, digits);
        };
        return PercentPipe;
    }(NumberPipe));
    PercentPipe.decorators = [
        { type: Pipe, args: [{ name: 'percent' },] },
        { type: Injectable },
    ];
    var CurrencyPipe = (function (_super) {
        __extends(CurrencyPipe, _super);
        function CurrencyPipe() {
            _super.apply(this, arguments);
        }
        CurrencyPipe.prototype.transform = function (value, currencyCode, symbolDisplay, digits) {
            if (currencyCode === void 0) { currencyCode = 'USD'; }
            if (symbolDisplay === void 0) { symbolDisplay = false; }
            if (digits === void 0) { digits = null; }
            return NumberPipe._format(value, NumberFormatStyle.Currency, digits, currencyCode, symbolDisplay);
        };
        return CurrencyPipe;
    }(NumberPipe));
    CurrencyPipe.decorators = [
        { type: Pipe, args: [{ name: 'currency' },] },
        { type: Injectable },
    ];
    var UpperCasePipe = (function () {
        function UpperCasePipe() {
        }
        UpperCasePipe.prototype.transform = function (value) {
            if (isBlank$2(value))
                return value;
            if (!isString$2(value)) {
                throw new InvalidPipeArgumentException(UpperCasePipe, value);
            }
            return value.toUpperCase();
        };
        return UpperCasePipe;
    }());
    UpperCasePipe.decorators = [
        { type: Pipe, args: [{ name: 'uppercase' },] },
        { type: Injectable },
    ];
    var ReplacePipe = (function () {
        function ReplacePipe() {
        }
        ReplacePipe.prototype.transform = function (value, pattern, replacement) {
            if (isBlank$2(value)) {
                return value;
            }
            if (!this._supportedInput(value)) {
                throw new InvalidPipeArgumentException(ReplacePipe, value);
            }
            var input = value.toString();
            if (!this._supportedPattern(pattern)) {
                throw new InvalidPipeArgumentException(ReplacePipe, pattern);
            }
            if (!this._supportedReplacement(replacement)) {
                throw new InvalidPipeArgumentException(ReplacePipe, replacement);
            }
            // template fails with literal RegExp e.g /pattern/igm
            // var rgx = pattern instanceof RegExp ? pattern : RegExpWrapper.create(pattern);
            if (isFunction$3(replacement)) {
                var rgxPattern = isString$2(pattern) ? RegExpWrapper$2.create(pattern) : pattern;
                return StringWrapper$2.replaceAllMapped(input, rgxPattern, replacement);
            }
            if (pattern instanceof RegExp) {
                // use the replaceAll variant
                return StringWrapper$2.replaceAll(input, pattern, replacement);
            }
            return StringWrapper$2.replace(input, pattern, replacement);
        };
        ReplacePipe.prototype._supportedInput = function (input) { return isString$2(input) || isNumber$2(input); };
        ReplacePipe.prototype._supportedPattern = function (pattern) {
            return isString$2(pattern) || pattern instanceof RegExp;
        };
        ReplacePipe.prototype._supportedReplacement = function (replacement) {
            return isString$2(replacement) || isFunction$3(replacement);
        };
        return ReplacePipe;
    }());
    ReplacePipe.decorators = [
        { type: Pipe, args: [{ name: 'replace' },] },
        { type: Injectable },
    ];
    var interpolationExp = RegExpWrapper$2.create('#');
    var I18nPluralPipe = (function () {
        function I18nPluralPipe() {
        }
        I18nPluralPipe.prototype.transform = function (value, pluralMap) {
            var key;
            var valueStr;
            if (!isStringMap$2(pluralMap)) {
                throw new InvalidPipeArgumentException(I18nPluralPipe, pluralMap);
            }
            key = value === 0 || value === 1 ? "=" + value : 'other';
            valueStr = isPresent$2(value) ? value.toString() : '';
            return StringWrapper$2.replaceAll(pluralMap[key], interpolationExp, valueStr);
        };
        return I18nPluralPipe;
    }());
    I18nPluralPipe.decorators = [
        { type: Pipe, args: [{ name: 'i18nPlural', pure: true },] },
        { type: Injectable },
    ];
    var I18nSelectPipe = (function () {
        function I18nSelectPipe() {
        }
        I18nSelectPipe.prototype.transform = function (value, mapping) {
            if (!isStringMap$2(mapping)) {
                throw new InvalidPipeArgumentException(I18nSelectPipe, mapping);
            }
            return StringMapWrapper$1.contains(mapping, value) ? mapping[value] : mapping['other'];
        };
        return I18nSelectPipe;
    }());
    I18nSelectPipe.decorators = [
        { type: Pipe, args: [{ name: 'i18nSelect', pure: true },] },
        { type: Injectable },
    ];
    /**
     * A collection of Angular core pipes that are likely to be used in each and every
     * application.
     *
     * This collection can be used to quickly enumerate all the built-in pipes in the `pipes`
     * property of the `@Component` decorator.
     */
    var COMMON_PIPES = [
        AsyncPipe,
        UpperCasePipe,
        LowerCasePipe,
        JsonPipe,
        SlicePipe,
        DecimalPipe,
        PercentPipe,
        CurrencyPipe,
        DatePipe,
        ReplacePipe,
        I18nPluralPipe,
        I18nSelectPipe
    ];
    var NgClass = (function () {
        function NgClass(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer) {
            this._iterableDiffers = _iterableDiffers;
            this._keyValueDiffers = _keyValueDiffers;
            this._ngEl = _ngEl;
            this._renderer = _renderer;
            this._initialClasses = [];
        }
        Object.defineProperty(NgClass.prototype, "initialClasses", {
            set: function (v) {
                this._applyInitialClasses(true);
                this._initialClasses = isPresent$2(v) && isString$2(v) ? v.split(' ') : [];
                this._applyInitialClasses(false);
                this._applyClasses(this._rawClass, false);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgClass.prototype, "rawClass", {
            set: function (v) {
                this._cleanupClasses(this._rawClass);
                if (isString$2(v)) {
                    v = v.split(' ');
                }
                this._rawClass = v;
                this._iterableDiffer = null;
                this._keyValueDiffer = null;
                if (isPresent$2(v)) {
                    if (isListLikeIterable$1(v)) {
                        this._iterableDiffer = this._iterableDiffers.find(v).create(null);
                    }
                    else {
                        this._keyValueDiffer = this._keyValueDiffers.find(v).create(null);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        NgClass.prototype.ngDoCheck = function () {
            if (isPresent$2(this._iterableDiffer)) {
                var changes = this._iterableDiffer.diff(this._rawClass);
                if (isPresent$2(changes)) {
                    this._applyIterableChanges(changes);
                }
            }
            if (isPresent$2(this._keyValueDiffer)) {
                var changes = this._keyValueDiffer.diff(this._rawClass);
                if (isPresent$2(changes)) {
                    this._applyKeyValueChanges(changes);
                }
            }
        };
        NgClass.prototype.ngOnDestroy = function () { this._cleanupClasses(this._rawClass); };
        NgClass.prototype._cleanupClasses = function (rawClassVal) {
            this._applyClasses(rawClassVal, true);
            this._applyInitialClasses(false);
        };
        NgClass.prototype._applyKeyValueChanges = function (changes) {
            var _this = this;
            changes.forEachAddedItem(function (record) { _this._toggleClass(record.key, record.currentValue); });
            changes.forEachChangedItem(function (record) { _this._toggleClass(record.key, record.currentValue); });
            changes.forEachRemovedItem(function (record) {
                if (record.previousValue) {
                    _this._toggleClass(record.key, false);
                }
            });
        };
        NgClass.prototype._applyIterableChanges = function (changes) {
            var _this = this;
            changes.forEachAddedItem(function (record) { _this._toggleClass(record.item, true); });
            changes.forEachRemovedItem(function (record) { _this._toggleClass(record.item, false); });
        };
        NgClass.prototype._applyInitialClasses = function (isCleanup) {
            var _this = this;
            this._initialClasses.forEach(function (className) { return _this._toggleClass(className, !isCleanup); });
        };
        NgClass.prototype._applyClasses = function (rawClassVal, isCleanup) {
            var _this = this;
            if (isPresent$2(rawClassVal)) {
                if (isArray$3(rawClassVal)) {
                    rawClassVal.forEach(function (className) { return _this._toggleClass(className, !isCleanup); });
                }
                else if (rawClassVal instanceof Set) {
                    rawClassVal.forEach(function (className) { return _this._toggleClass(className, !isCleanup); });
                }
                else {
                    StringMapWrapper$1.forEach(rawClassVal, function (expVal, className) {
                        if (isPresent$2(expVal))
                            _this._toggleClass(className, !isCleanup);
                    });
                }
            }
        };
        NgClass.prototype._toggleClass = function (className, enabled) {
            className = className.trim();
            if (className.length > 0) {
                if (className.indexOf(' ') > -1) {
                    var classes = className.split(/\s+/g);
                    for (var i = 0, len = classes.length; i < len; i++) {
                        this._renderer.setElementClass(this._ngEl.nativeElement, classes[i], enabled);
                    }
                }
                else {
                    this._renderer.setElementClass(this._ngEl.nativeElement, className, enabled);
                }
            }
        };
        return NgClass;
    }());
    NgClass.decorators = [
        { type: Directive, args: [{ selector: '[ngClass]', inputs: ['rawClass: ngClass', 'initialClasses: class'] },] },
    ];
    NgClass.ctorParameters = [
        { type: IterableDiffers, },
        { type: KeyValueDiffers, },
        { type: ElementRef, },
        { type: Renderer, },
    ];
    var NgForRow = (function () {
        function NgForRow($implicit, index, count) {
            this.$implicit = $implicit;
            this.index = index;
            this.count = count;
        }
        Object.defineProperty(NgForRow.prototype, "first", {
            get: function () { return this.index === 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgForRow.prototype, "last", {
            get: function () { return this.index === this.count - 1; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgForRow.prototype, "even", {
            get: function () { return this.index % 2 === 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgForRow.prototype, "odd", {
            get: function () { return !this.even; },
            enumerable: true,
            configurable: true
        });
        return NgForRow;
    }());
    var NgFor = (function () {
        function NgFor(_viewContainer, _templateRef, _iterableDiffers, _cdr) {
            this._viewContainer = _viewContainer;
            this._templateRef = _templateRef;
            this._iterableDiffers = _iterableDiffers;
            this._cdr = _cdr;
        }
        Object.defineProperty(NgFor.prototype, "ngForOf", {
            set: function (value) {
                this._ngForOf = value;
                if (isBlank$2(this._differ) && isPresent$2(value)) {
                    try {
                        this._differ = this._iterableDiffers.find(value).create(this._cdr, this._ngForTrackBy);
                    }
                    catch (e) {
                        throw new BaseException$1("Cannot find a differ supporting object '" + value + "' of type '" + getTypeNameForDebugging$2(value) + "'. NgFor only supports binding to Iterables such as Arrays.");
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgFor.prototype, "ngForTemplate", {
            set: function (value) {
                if (isPresent$2(value)) {
                    this._templateRef = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgFor.prototype, "ngForTrackBy", {
            set: function (value) { this._ngForTrackBy = value; },
            enumerable: true,
            configurable: true
        });
        NgFor.prototype.ngDoCheck = function () {
            if (isPresent$2(this._differ)) {
                var changes = this._differ.diff(this._ngForOf);
                if (isPresent$2(changes))
                    this._applyChanges(changes);
            }
        };
        NgFor.prototype._applyChanges = function (changes) {
            var _this = this;
            // TODO(rado): check if change detection can produce a change record that is
            // easier to consume than current.
            var recordViewTuples = [];
            changes.forEachRemovedItem(function (removedRecord) { return recordViewTuples.push(new RecordViewTuple(removedRecord, null)); });
            changes.forEachMovedItem(function (movedRecord) { return recordViewTuples.push(new RecordViewTuple(movedRecord, null)); });
            var insertTuples = this._bulkRemove(recordViewTuples);
            changes.forEachAddedItem(function (addedRecord) { return insertTuples.push(new RecordViewTuple(addedRecord, null)); });
            this._bulkInsert(insertTuples);
            for (var i = 0; i < insertTuples.length; i++) {
                this._perViewChange(insertTuples[i].view, insertTuples[i].record);
            }
            for (var i = 0, ilen = this._viewContainer.length; i < ilen; i++) {
                var viewRef = this._viewContainer.get(i);
                viewRef.context.index = i;
                viewRef.context.count = ilen;
            }
            changes.forEachIdentityChange(function (record) {
                var viewRef = _this._viewContainer.get(record.currentIndex);
                viewRef.context.$implicit = record.item;
            });
        };
        NgFor.prototype._perViewChange = function (view, record) {
            view.context.$implicit = record.item;
        };
        NgFor.prototype._bulkRemove = function (tuples) {
            tuples.sort(function (a, b) { return a.record.previousIndex - b.record.previousIndex; });
            var movedTuples = [];
            for (var i = tuples.length - 1; i >= 0; i--) {
                var tuple = tuples[i];
                // separate moved views from removed views.
                if (isPresent$2(tuple.record.currentIndex)) {
                    tuple.view =
                        this._viewContainer.detach(tuple.record.previousIndex);
                    movedTuples.push(tuple);
                }
                else {
                    this._viewContainer.remove(tuple.record.previousIndex);
                }
            }
            return movedTuples;
        };
        NgFor.prototype._bulkInsert = function (tuples) {
            tuples.sort(function (a, b) { return a.record.currentIndex - b.record.currentIndex; });
            for (var i = 0; i < tuples.length; i++) {
                var tuple = tuples[i];
                if (isPresent$2(tuple.view)) {
                    this._viewContainer.insert(tuple.view, tuple.record.currentIndex);
                }
                else {
                    tuple.view = this._viewContainer.createEmbeddedView(this._templateRef, new NgForRow(null, null, null), tuple.record.currentIndex);
                }
            }
            return tuples;
        };
        return NgFor;
    }());
    NgFor.decorators = [
        { type: Directive, args: [{ selector: '[ngFor][ngForOf]', inputs: ['ngForTrackBy', 'ngForOf', 'ngForTemplate'] },] },
    ];
    NgFor.ctorParameters = [
        { type: ViewContainerRef, },
        { type: TemplateRef, },
        { type: IterableDiffers, },
        { type: ChangeDetectorRef, },
    ];
    var RecordViewTuple = (function () {
        function RecordViewTuple(record, view) {
            this.record = record;
            this.view = view;
        }
        return RecordViewTuple;
    }());
    var NgIf = (function () {
        function NgIf(_viewContainer, _templateRef) {
            this._viewContainer = _viewContainer;
            this._templateRef = _templateRef;
            this._prevCondition = null;
        }
        Object.defineProperty(NgIf.prototype, "ngIf", {
            set: function (newCondition /* boolean */) {
                if (newCondition && (isBlank$2(this._prevCondition) || !this._prevCondition)) {
                    this._prevCondition = true;
                    this._viewContainer.createEmbeddedView(this._templateRef);
                }
                else if (!newCondition && (isBlank$2(this._prevCondition) || this._prevCondition)) {
                    this._prevCondition = false;
                    this._viewContainer.clear();
                }
            },
            enumerable: true,
            configurable: true
        });
        return NgIf;
    }());
    NgIf.decorators = [
        { type: Directive, args: [{ selector: '[ngIf]', inputs: ['ngIf'] },] },
    ];
    NgIf.ctorParameters = [
        { type: ViewContainerRef, },
        { type: TemplateRef, },
    ];
    var NgTemplateOutlet = (function () {
        function NgTemplateOutlet(_viewContainerRef) {
            this._viewContainerRef = _viewContainerRef;
        }
        Object.defineProperty(NgTemplateOutlet.prototype, "ngTemplateOutlet", {
            set: function (templateRef) {
                if (isPresent$2(this._insertedViewRef)) {
                    this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._insertedViewRef));
                }
                if (isPresent$2(templateRef)) {
                    this._insertedViewRef = this._viewContainerRef.createEmbeddedView(templateRef);
                }
            },
            enumerable: true,
            configurable: true
        });
        return NgTemplateOutlet;
    }());
    NgTemplateOutlet.decorators = [
        { type: Directive, args: [{ selector: '[ngTemplateOutlet]' },] },
    ];
    NgTemplateOutlet.ctorParameters = [
        { type: ViewContainerRef, },
    ];
    NgTemplateOutlet.propDecorators = {
        'ngTemplateOutlet': [{ type: Input },],
    };
    var NgStyle = (function () {
        function NgStyle(_differs, _ngEl, _renderer) {
            this._differs = _differs;
            this._ngEl = _ngEl;
            this._renderer = _renderer;
        }
        Object.defineProperty(NgStyle.prototype, "rawStyle", {
            set: function (v) {
                this._rawStyle = v;
                if (isBlank$2(this._differ) && isPresent$2(v)) {
                    this._differ = this._differs.find(this._rawStyle).create(null);
                }
            },
            enumerable: true,
            configurable: true
        });
        NgStyle.prototype.ngDoCheck = function () {
            if (isPresent$2(this._differ)) {
                var changes = this._differ.diff(this._rawStyle);
                if (isPresent$2(changes)) {
                    this._applyChanges(changes);
                }
            }
        };
        NgStyle.prototype._applyChanges = function (changes) {
            var _this = this;
            changes.forEachAddedItem(function (record) { _this._setStyle(record.key, record.currentValue); });
            changes.forEachChangedItem(function (record) { _this._setStyle(record.key, record.currentValue); });
            changes.forEachRemovedItem(function (record) { _this._setStyle(record.key, null); });
        };
        NgStyle.prototype._setStyle = function (name, val) {
            this._renderer.setElementStyle(this._ngEl.nativeElement, name, val);
        };
        return NgStyle;
    }());
    NgStyle.decorators = [
        { type: Directive, args: [{ selector: '[ngStyle]', inputs: ['rawStyle: ngStyle'] },] },
    ];
    NgStyle.ctorParameters = [
        { type: KeyValueDiffers, },
        { type: ElementRef, },
        { type: Renderer, },
    ];
    var _WHEN_DEFAULT = new Object();
    var SwitchView = (function () {
        function SwitchView(_viewContainerRef, _templateRef) {
            this._viewContainerRef = _viewContainerRef;
            this._templateRef = _templateRef;
        }
        SwitchView.prototype.create = function () { this._viewContainerRef.createEmbeddedView(this._templateRef); };
        SwitchView.prototype.destroy = function () { this._viewContainerRef.clear(); };
        return SwitchView;
    }());
    var NgSwitch = (function () {
        function NgSwitch() {
            this._useDefault = false;
            this._valueViews = new Map$2();
            this._activeViews = [];
        }
        Object.defineProperty(NgSwitch.prototype, "ngSwitch", {
            set: function (value) {
                // Empty the currently active ViewContainers
                this._emptyAllActiveViews();
                // Add the ViewContainers matching the value (with a fallback to default)
                this._useDefault = false;
                var views = this._valueViews.get(value);
                if (isBlank$2(views)) {
                    this._useDefault = true;
                    views = normalizeBlank$2(this._valueViews.get(_WHEN_DEFAULT));
                }
                this._activateViews(views);
                this._switchValue = value;
            },
            enumerable: true,
            configurable: true
        });
        /** @internal */
        NgSwitch.prototype._onWhenValueChanged = function (oldWhen, newWhen, view) {
            this._deregisterView(oldWhen, view);
            this._registerView(newWhen, view);
            if (oldWhen === this._switchValue) {
                view.destroy();
                ListWrapper$1.remove(this._activeViews, view);
            }
            else if (newWhen === this._switchValue) {
                if (this._useDefault) {
                    this._useDefault = false;
                    this._emptyAllActiveViews();
                }
                view.create();
                this._activeViews.push(view);
            }
            // Switch to default when there is no more active ViewContainers
            if (this._activeViews.length === 0 && !this._useDefault) {
                this._useDefault = true;
                this._activateViews(this._valueViews.get(_WHEN_DEFAULT));
            }
        };
        /** @internal */
        NgSwitch.prototype._emptyAllActiveViews = function () {
            var activeContainers = this._activeViews;
            for (var i = 0; i < activeContainers.length; i++) {
                activeContainers[i].destroy();
            }
            this._activeViews = [];
        };
        /** @internal */
        NgSwitch.prototype._activateViews = function (views) {
            // TODO(vicb): assert(this._activeViews.length === 0);
            if (isPresent$2(views)) {
                for (var i = 0; i < views.length; i++) {
                    views[i].create();
                }
                this._activeViews = views;
            }
        };
        /** @internal */
        NgSwitch.prototype._registerView = function (value, view) {
            var views = this._valueViews.get(value);
            if (isBlank$2(views)) {
                views = [];
                this._valueViews.set(value, views);
            }
            views.push(view);
        };
        /** @internal */
        NgSwitch.prototype._deregisterView = function (value, view) {
            // `_WHEN_DEFAULT` is used a marker for non-registered whens
            if (value === _WHEN_DEFAULT)
                return;
            var views = this._valueViews.get(value);
            if (views.length == 1) {
                this._valueViews.delete(value);
            }
            else {
                ListWrapper$1.remove(views, view);
            }
        };
        return NgSwitch;
    }());
    NgSwitch.decorators = [
        { type: Directive, args: [{ selector: '[ngSwitch]', inputs: ['ngSwitch'] },] },
    ];
    var NgSwitchWhen = (function () {
        function NgSwitchWhen(viewContainer, templateRef, ngSwitch) {
            // `_WHEN_DEFAULT` is used as a marker for a not yet initialized value
            /** @internal */
            this._value = _WHEN_DEFAULT;
            this._switch = ngSwitch;
            this._view = new SwitchView(viewContainer, templateRef);
        }
        Object.defineProperty(NgSwitchWhen.prototype, "ngSwitchWhen", {
            set: function (value) {
                this._switch._onWhenValueChanged(this._value, value, this._view);
                this._value = value;
            },
            enumerable: true,
            configurable: true
        });
        return NgSwitchWhen;
    }());
    NgSwitchWhen.decorators = [
        { type: Directive, args: [{ selector: '[ngSwitchWhen]', inputs: ['ngSwitchWhen'] },] },
    ];
    NgSwitchWhen.ctorParameters = [
        { type: ViewContainerRef, },
        { type: TemplateRef, },
        { type: NgSwitch, decorators: [{ type: Host },] },
    ];
    var NgSwitchDefault = (function () {
        function NgSwitchDefault(viewContainer, templateRef, sswitch) {
            sswitch._registerView(_WHEN_DEFAULT, new SwitchView(viewContainer, templateRef));
        }
        return NgSwitchDefault;
    }());
    NgSwitchDefault.decorators = [
        { type: Directive, args: [{ selector: '[ngSwitchDefault]' },] },
    ];
    NgSwitchDefault.ctorParameters = [
        { type: ViewContainerRef, },
        { type: TemplateRef, },
        { type: NgSwitch, decorators: [{ type: Host },] },
    ];
    var _CATEGORY_DEFAULT = 'other';
    var NgLocalization = (function () {
        function NgLocalization() {
        }
        return NgLocalization;
    }());
    var NgPluralCase = (function () {
        function NgPluralCase(value, template, viewContainer) {
            this.value = value;
            this._view = new SwitchView(viewContainer, template);
        }
        return NgPluralCase;
    }());
    NgPluralCase.decorators = [
        { type: Directive, args: [{ selector: '[ngPluralCase]' },] },
    ];
    NgPluralCase.ctorParameters = [
        { type: undefined, decorators: [{ type: Attribute, args: ['ngPluralCase',] },] },
        { type: TemplateRef, },
        { type: ViewContainerRef, },
    ];
    var NgPlural = (function () {
        function NgPlural(_localization) {
            this._localization = _localization;
            this._caseViews = new Map$2();
            this.cases = null;
        }
        Object.defineProperty(NgPlural.prototype, "ngPlural", {
            set: function (value) {
                this._switchValue = value;
                this._updateView();
            },
            enumerable: true,
            configurable: true
        });
        NgPlural.prototype.ngAfterContentInit = function () {
            var _this = this;
            this.cases.forEach(function (pluralCase) {
                _this._caseViews.set(_this._formatValue(pluralCase), pluralCase._view);
            });
            this._updateView();
        };
        /** @internal */
        NgPlural.prototype._updateView = function () {
            this._clearViews();
            var view = this._caseViews.get(this._switchValue);
            if (!isPresent$2(view))
                view = this._getCategoryView(this._switchValue);
            this._activateView(view);
        };
        /** @internal */
        NgPlural.prototype._clearViews = function () {
            if (isPresent$2(this._activeView))
                this._activeView.destroy();
        };
        /** @internal */
        NgPlural.prototype._activateView = function (view) {
            if (!isPresent$2(view))
                return;
            this._activeView = view;
            this._activeView.create();
        };
        /** @internal */
        NgPlural.prototype._getCategoryView = function (value) {
            var category = this._localization.getPluralCategory(value);
            var categoryView = this._caseViews.get(category);
            return isPresent$2(categoryView) ? categoryView : this._caseViews.get(_CATEGORY_DEFAULT);
        };
        /** @internal */
        NgPlural.prototype._isValueView = function (pluralCase) { return pluralCase.value[0] === "="; };
        /** @internal */
        NgPlural.prototype._formatValue = function (pluralCase) {
            return this._isValueView(pluralCase) ? this._stripValue(pluralCase.value) : pluralCase.value;
        };
        /** @internal */
        NgPlural.prototype._stripValue = function (value) { return NumberWrapper$2.parseInt(value.substring(1), 10); };
        return NgPlural;
    }());
    NgPlural.decorators = [
        { type: Directive, args: [{ selector: '[ngPlural]' },] },
    ];
    NgPlural.ctorParameters = [
        { type: NgLocalization, },
    ];
    NgPlural.propDecorators = {
        'cases': [{ type: ContentChildren, args: [NgPluralCase,] },],
        'ngPlural': [{ type: Input },],
    };
    /**
     * A collection of Angular core directives that are likely to be used in each and every Angular
     * application.
     *
     * This collection can be used to quickly enumerate all the built-in directives in the `directives`
     * property of the `@Component` annotation.
     *
     * ### Example ([live demo](http://plnkr.co/edit/yakGwpCdUkg0qfzX5m8g?p=preview))
     *
     * Instead of writing:
     *
     * ```typescript
     * import {NgClass, NgIf, NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault} from '@angular/common';
     * import {OtherDirective} from './myDirectives';
     *
     * @Component({
     *   selector: 'my-component',
     *   templateUrl: 'myComponent.html',
     *   directives: [NgClass, NgIf, NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault, OtherDirective]
     * })
     * export class MyComponent {
     *   ...
     * }
     * ```
     * one could import all the core directives at once:
     *
     * ```typescript
     * import {CORE_DIRECTIVES} from '@angular/common';
     * import {OtherDirective} from './myDirectives';
     *
     * @Component({
     *   selector: 'my-component',
     *   templateUrl: 'myComponent.html',
     *   directives: [CORE_DIRECTIVES, OtherDirective]
     * })
     * export class MyComponent {
     *   ...
     * }
     * ```
     */
    var CORE_DIRECTIVES = [
        NgClass,
        NgFor,
        NgIf,
        NgTemplateOutlet,
        NgStyle,
        NgSwitch,
        NgSwitchWhen,
        NgSwitchDefault,
        NgPlural,
        NgPluralCase
    ];
    /**
     * Indicates that a Control is valid, i.e. that no errors exist in the input value.
     */
    var VALID = "VALID";
    /**
     * Indicates that a Control is invalid, i.e. that an error exists in the input value.
     */
    var INVALID = "INVALID";
    /**
     * Indicates that a Control is pending, i.e. that async validation is occurring and
     * errors are not yet available for the input value.
     */
    var PENDING = "PENDING";
    function _find(control, path) {
        if (isBlank$2(path))
            return null;
        if (!(path instanceof Array)) {
            path = path.split("/");
        }
        if (path instanceof Array && ListWrapper$1.isEmpty(path))
            return null;
        return path
            .reduce(function (v, name) {
            if (v instanceof ControlGroup) {
                return isPresent$2(v.controls[name]) ? v.controls[name] : null;
            }
            else if (v instanceof ControlArray) {
                var index = name;
                return isPresent$2(v.at(index)) ? v.at(index) : null;
            }
            else {
                return null;
            }
        }, control);
    }
    function toObservable(r) {
        return PromiseWrapper$1.isPromise(r) ? ObservableWrapper$1.fromPromise(r) : r;
    }
    /**
     *
     */
    var AbstractControl = (function () {
        function AbstractControl(validator, asyncValidator) {
            this.validator = validator;
            this.asyncValidator = asyncValidator;
            this._pristine = true;
            this._touched = false;
        }
        Object.defineProperty(AbstractControl.prototype, "value", {
            get: function () { return this._value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControl.prototype, "status", {
            get: function () { return this._status; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControl.prototype, "valid", {
            get: function () { return this._status === VALID; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControl.prototype, "errors", {
            /**
             * Returns the errors of this control.
             */
            get: function () { return this._errors; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControl.prototype, "pristine", {
            get: function () { return this._pristine; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControl.prototype, "dirty", {
            get: function () { return !this.pristine; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControl.prototype, "touched", {
            get: function () { return this._touched; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControl.prototype, "untouched", {
            get: function () { return !this._touched; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControl.prototype, "valueChanges", {
            get: function () { return this._valueChanges; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControl.prototype, "statusChanges", {
            get: function () { return this._statusChanges; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControl.prototype, "pending", {
            get: function () { return this._status == PENDING; },
            enumerable: true,
            configurable: true
        });
        AbstractControl.prototype.markAsTouched = function () { this._touched = true; };
        AbstractControl.prototype.markAsDirty = function (_a) {
            var onlySelf = (_a === void 0 ? {} : _a).onlySelf;
            onlySelf = normalizeBool$2(onlySelf);
            this._pristine = false;
            if (isPresent$2(this._parent) && !onlySelf) {
                this._parent.markAsDirty({ onlySelf: onlySelf });
            }
        };
        AbstractControl.prototype.markAsPending = function (_a) {
            var onlySelf = (_a === void 0 ? {} : _a).onlySelf;
            onlySelf = normalizeBool$2(onlySelf);
            this._status = PENDING;
            if (isPresent$2(this._parent) && !onlySelf) {
                this._parent.markAsPending({ onlySelf: onlySelf });
            }
        };
        AbstractControl.prototype.setParent = function (parent) { this._parent = parent; };
        AbstractControl.prototype.updateValueAndValidity = function (_a) {
            var _b = _a === void 0 ? {} : _a, onlySelf = _b.onlySelf, emitEvent = _b.emitEvent;
            onlySelf = normalizeBool$2(onlySelf);
            emitEvent = isPresent$2(emitEvent) ? emitEvent : true;
            this._updateValue();
            this._errors = this._runValidator();
            this._status = this._calculateStatus();
            if (this._status == VALID || this._status == PENDING) {
                this._runAsyncValidator(emitEvent);
            }
            if (emitEvent) {
                ObservableWrapper$1.callEmit(this._valueChanges, this._value);
                ObservableWrapper$1.callEmit(this._statusChanges, this._status);
            }
            if (isPresent$2(this._parent) && !onlySelf) {
                this._parent.updateValueAndValidity({ onlySelf: onlySelf, emitEvent: emitEvent });
            }
        };
        AbstractControl.prototype._runValidator = function () {
            return isPresent$2(this.validator) ? this.validator(this) : null;
        };
        AbstractControl.prototype._runAsyncValidator = function (emitEvent) {
            var _this = this;
            if (isPresent$2(this.asyncValidator)) {
                this._status = PENDING;
                this._cancelExistingSubscription();
                var obs = toObservable(this.asyncValidator(this));
                this._asyncValidationSubscription = ObservableWrapper$1.subscribe(obs, function (res) { return _this.setErrors(res, { emitEvent: emitEvent }); });
            }
        };
        AbstractControl.prototype._cancelExistingSubscription = function () {
            if (isPresent$2(this._asyncValidationSubscription)) {
                ObservableWrapper$1.dispose(this._asyncValidationSubscription);
            }
        };
        /**
         * Sets errors on a control.
         *
         * This is used when validations are run not automatically, but manually by the user.
         *
         * Calling `setErrors` will also update the validity of the parent control.
         *
         * ## Usage
         *
         * ```
         * var login = new Control("someLogin");
         * login.setErrors({
         *   "notUnique": true
         * });
         *
         * expect(login.valid).toEqual(false);
         * expect(login.errors).toEqual({"notUnique": true});
         *
         * login.updateValue("someOtherLogin");
         *
         * expect(login.valid).toEqual(true);
         * ```
         */
        AbstractControl.prototype.setErrors = function (errors, _a) {
            var emitEvent = (_a === void 0 ? {} : _a).emitEvent;
            emitEvent = isPresent$2(emitEvent) ? emitEvent : true;
            this._errors = errors;
            this._status = this._calculateStatus();
            if (emitEvent) {
                ObservableWrapper$1.callEmit(this._statusChanges, this._status);
            }
            if (isPresent$2(this._parent)) {
                this._parent._updateControlsErrors();
            }
        };
        AbstractControl.prototype.find = function (path) { return _find(this, path); };
        AbstractControl.prototype.getError = function (errorCode, path) {
            if (path === void 0) { path = null; }
            var control = isPresent$2(path) && !ListWrapper$1.isEmpty(path) ? this.find(path) : this;
            if (isPresent$2(control) && isPresent$2(control._errors)) {
                return StringMapWrapper$1.get(control._errors, errorCode);
            }
            else {
                return null;
            }
        };
        AbstractControl.prototype.hasError = function (errorCode, path) {
            if (path === void 0) { path = null; }
            return isPresent$2(this.getError(errorCode, path));
        };
        Object.defineProperty(AbstractControl.prototype, "root", {
            get: function () {
                var x = this;
                while (isPresent$2(x._parent)) {
                    x = x._parent;
                }
                return x;
            },
            enumerable: true,
            configurable: true
        });
        /** @internal */
        AbstractControl.prototype._updateControlsErrors = function () {
            this._status = this._calculateStatus();
            if (isPresent$2(this._parent)) {
                this._parent._updateControlsErrors();
            }
        };
        /** @internal */
        AbstractControl.prototype._initObservables = function () {
            this._valueChanges = new EventEmitter$1();
            this._statusChanges = new EventEmitter$1();
        };
        AbstractControl.prototype._calculateStatus = function () {
            if (isPresent$2(this._errors))
                return INVALID;
            if (this._anyControlsHaveStatus(PENDING))
                return PENDING;
            if (this._anyControlsHaveStatus(INVALID))
                return INVALID;
            return VALID;
        };
        return AbstractControl;
    }());
    /**
     * Defines a part of a form that cannot be divided into other controls. `Control`s have values and
     * validation state, which is determined by an optional validation function.
     *
     * `Control` is one of the three fundamental building blocks used to define forms in Angular, along
     * with {@link ControlGroup} and {@link ControlArray}.
     *
     * ## Usage
     *
     * By default, a `Control` is created for every `<input>` or other form component.
     * With {@link NgFormControl} or {@link NgFormModel} an existing {@link Control} can be
     * bound to a DOM element instead. This `Control` can be configured with a custom
     * validation function.
     *
     * ### Example ([live demo](http://plnkr.co/edit/23DESOpbNnBpBHZt1BR4?p=preview))
     */
    var Control = (function (_super) {
        __extends(Control, _super);
        function Control(value, validator, asyncValidator) {
            if (value === void 0) { value = null; }
            if (validator === void 0) { validator = null; }
            if (asyncValidator === void 0) { asyncValidator = null; }
            _super.call(this, validator, asyncValidator);
            this._value = value;
            this.updateValueAndValidity({ onlySelf: true, emitEvent: false });
            this._initObservables();
        }
        /**
         * Set the value of the control to `value`.
         *
         * If `onlySelf` is `true`, this change will only affect the validation of this `Control`
         * and not its parent component. If `emitEvent` is `true`, this change will cause a
         * `valueChanges` event on the `Control` to be emitted. Both of these options default to
         * `false`.
         *
         * If `emitModelToViewChange` is `true`, the view will be notified about the new value
         * via an `onChange` event. This is the default behavior if `emitModelToViewChange` is not
         * specified.
         */
        Control.prototype.updateValue = function (value, _a) {
            var _b = _a === void 0 ? {} : _a, onlySelf = _b.onlySelf, emitEvent = _b.emitEvent, emitModelToViewChange = _b.emitModelToViewChange;
            emitModelToViewChange = isPresent$2(emitModelToViewChange) ? emitModelToViewChange : true;
            this._value = value;
            if (isPresent$2(this._onChange) && emitModelToViewChange)
                this._onChange(this._value);
            this.updateValueAndValidity({ onlySelf: onlySelf, emitEvent: emitEvent });
        };
        /**
         * @internal
         */
        Control.prototype._updateValue = function () { };
        /**
         * @internal
         */
        Control.prototype._anyControlsHaveStatus = function (status) { return false; };
        /**
         * Register a listener for change events.
         */
        Control.prototype.registerOnChange = function (fn) { this._onChange = fn; };
        return Control;
    }(AbstractControl));
    /**
     * Defines a part of a form, of fixed length, that can contain other controls.
     *
     * A `ControlGroup` aggregates the values of each {@link Control} in the group.
     * The status of a `ControlGroup` depends on the status of its children.
     * If one of the controls in a group is invalid, the entire group is invalid.
     * Similarly, if a control changes its value, the entire group changes as well.
     *
     * `ControlGroup` is one of the three fundamental building blocks used to define forms in Angular,
     * along with {@link Control} and {@link ControlArray}. {@link ControlArray} can also contain other
     * controls, but is of variable length.
     *
     * ### Example ([live demo](http://plnkr.co/edit/23DESOpbNnBpBHZt1BR4?p=preview))
     */
    var ControlGroup = (function (_super) {
        __extends(ControlGroup, _super);
        function ControlGroup(controls, optionals, validator, asyncValidator) {
            if (optionals === void 0) { optionals = null; }
            if (validator === void 0) { validator = null; }
            if (asyncValidator === void 0) { asyncValidator = null; }
            _super.call(this, validator, asyncValidator);
            this.controls = controls;
            this._optionals = isPresent$2(optionals) ? optionals : {};
            this._initObservables();
            this._setParentForControls();
            this.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
        /**
         * Add a control to this group.
         */
        ControlGroup.prototype.addControl = function (name, control) {
            this.controls[name] = control;
            control.setParent(this);
        };
        /**
         * Remove a control from this group.
         */
        ControlGroup.prototype.removeControl = function (name) { StringMapWrapper$1.delete(this.controls, name); };
        /**
         * Mark the named control as non-optional.
         */
        ControlGroup.prototype.include = function (controlName) {
            StringMapWrapper$1.set(this._optionals, controlName, true);
            this.updateValueAndValidity();
        };
        /**
         * Mark the named control as optional.
         */
        ControlGroup.prototype.exclude = function (controlName) {
            StringMapWrapper$1.set(this._optionals, controlName, false);
            this.updateValueAndValidity();
        };
        /**
         * Check whether there is a control with the given name in the group.
         */
        ControlGroup.prototype.contains = function (controlName) {
            var c = StringMapWrapper$1.contains(this.controls, controlName);
            return c && this._included(controlName);
        };
        /** @internal */
        ControlGroup.prototype._setParentForControls = function () {
            var _this = this;
            StringMapWrapper$1.forEach(this.controls, function (control, name) { control.setParent(_this); });
        };
        /** @internal */
        ControlGroup.prototype._updateValue = function () { this._value = this._reduceValue(); };
        /** @internal */
        ControlGroup.prototype._anyControlsHaveStatus = function (status) {
            var _this = this;
            var res = false;
            StringMapWrapper$1.forEach(this.controls, function (control, name) {
                res = res || (_this.contains(name) && control.status == status);
            });
            return res;
        };
        /** @internal */
        ControlGroup.prototype._reduceValue = function () {
            return this._reduceChildren({}, function (acc, control, name) {
                acc[name] = control.value;
                return acc;
            });
        };
        /** @internal */
        ControlGroup.prototype._reduceChildren = function (initValue, fn) {
            var _this = this;
            var res = initValue;
            StringMapWrapper$1.forEach(this.controls, function (control, name) {
                if (_this._included(name)) {
                    res = fn(res, control, name);
                }
            });
            return res;
        };
        /** @internal */
        ControlGroup.prototype._included = function (controlName) {
            var isOptional = StringMapWrapper$1.contains(this._optionals, controlName);
            return !isOptional || StringMapWrapper$1.get(this._optionals, controlName);
        };
        return ControlGroup;
    }(AbstractControl));
    /**
     * Defines a part of a form, of variable length, that can contain other controls.
     *
     * A `ControlArray` aggregates the values of each {@link Control} in the group.
     * The status of a `ControlArray` depends on the status of its children.
     * If one of the controls in a group is invalid, the entire array is invalid.
     * Similarly, if a control changes its value, the entire array changes as well.
     *
     * `ControlArray` is one of the three fundamental building blocks used to define forms in Angular,
     * along with {@link Control} and {@link ControlGroup}. {@link ControlGroup} can also contain
     * other controls, but is of fixed length.
     *
     * ## Adding or removing controls
     *
     * To change the controls in the array, use the `push`, `insert`, or `removeAt` methods
     * in `ControlArray` itself. These methods ensure the controls are properly tracked in the
     * form's hierarchy. Do not modify the array of `AbstractControl`s used to instantiate
     * the `ControlArray` directly, as that will result in strange and unexpected behavior such
     * as broken change detection.
     *
     * ### Example ([live demo](http://plnkr.co/edit/23DESOpbNnBpBHZt1BR4?p=preview))
     */
    var ControlArray = (function (_super) {
        __extends(ControlArray, _super);
        function ControlArray(controls, validator, asyncValidator) {
            if (validator === void 0) { validator = null; }
            if (asyncValidator === void 0) { asyncValidator = null; }
            _super.call(this, validator, asyncValidator);
            this.controls = controls;
            this._initObservables();
            this._setParentForControls();
            this.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
        /**
         * Get the {@link AbstractControl} at the given `index` in the array.
         */
        ControlArray.prototype.at = function (index) { return this.controls[index]; };
        /**
         * Insert a new {@link AbstractControl} at the end of the array.
         */
        ControlArray.prototype.push = function (control) {
            this.controls.push(control);
            control.setParent(this);
            this.updateValueAndValidity();
        };
        /**
         * Insert a new {@link AbstractControl} at the given `index` in the array.
         */
        ControlArray.prototype.insert = function (index, control) {
            ListWrapper$1.insert(this.controls, index, control);
            control.setParent(this);
            this.updateValueAndValidity();
        };
        /**
         * Remove the control at the given `index` in the array.
         */
        ControlArray.prototype.removeAt = function (index) {
            ListWrapper$1.removeAt(this.controls, index);
            this.updateValueAndValidity();
        };
        Object.defineProperty(ControlArray.prototype, "length", {
            /**
             * Length of the control array.
             */
            get: function () { return this.controls.length; },
            enumerable: true,
            configurable: true
        });
        /** @internal */
        ControlArray.prototype._updateValue = function () { this._value = this.controls.map(function (control) { return control.value; }); };
        /** @internal */
        ControlArray.prototype._anyControlsHaveStatus = function (status) {
            return this.controls.some(function (c) { return c.status == status; });
        };
        /** @internal */
        ControlArray.prototype._setParentForControls = function () {
            var _this = this;
            this.controls.forEach(function (control) { control.setParent(_this); });
        };
        return ControlArray;
    }(AbstractControl));
    /**
     * Base class for control directives.
     *
     * Only used internally in the forms module.
     */
    var AbstractControlDirective = (function () {
        function AbstractControlDirective() {
        }
        Object.defineProperty(AbstractControlDirective.prototype, "control", {
            get: function () { return unimplemented$1(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControlDirective.prototype, "value", {
            get: function () { return isPresent$2(this.control) ? this.control.value : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControlDirective.prototype, "valid", {
            get: function () { return isPresent$2(this.control) ? this.control.valid : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControlDirective.prototype, "errors", {
            get: function () {
                return isPresent$2(this.control) ? this.control.errors : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControlDirective.prototype, "pristine", {
            get: function () { return isPresent$2(this.control) ? this.control.pristine : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControlDirective.prototype, "dirty", {
            get: function () { return isPresent$2(this.control) ? this.control.dirty : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControlDirective.prototype, "touched", {
            get: function () { return isPresent$2(this.control) ? this.control.touched : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControlDirective.prototype, "untouched", {
            get: function () { return isPresent$2(this.control) ? this.control.untouched : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractControlDirective.prototype, "path", {
            get: function () { return null; },
            enumerable: true,
            configurable: true
        });
        return AbstractControlDirective;
    }());
    /**
     * A directive that contains multiple {@link NgControl}s.
     *
     * Only used by the forms module.
     */
    var ControlContainer = (function (_super) {
        __extends(ControlContainer, _super);
        function ControlContainer() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(ControlContainer.prototype, "formDirective", {
            /**
             * Get the form to which this container belongs.
             */
            get: function () { return null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ControlContainer.prototype, "path", {
            /**
             * Get the path to this container.
             */
            get: function () { return null; },
            enumerable: true,
            configurable: true
        });
        return ControlContainer;
    }(AbstractControlDirective));
    /**
     * A base class that all control directive extend.
     * It binds a {@link Control} object to a DOM element.
     *
     * Used internally by Angular forms.
     */
    var NgControl = (function (_super) {
        __extends(NgControl, _super);
        function NgControl() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.apply(this, args);
            this.name = null;
            this.valueAccessor = null;
        }
        Object.defineProperty(NgControl.prototype, "validator", {
            get: function () { return unimplemented$1(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgControl.prototype, "asyncValidator", {
            get: function () { return unimplemented$1(); },
            enumerable: true,
            configurable: true
        });
        return NgControl;
    }(AbstractControlDirective));
    /**
     * Used to provide a {@link ControlValueAccessor} for form controls.
     *
     * See {@link DefaultValueAccessor} for how to implement one.
     */
    var NG_VALUE_ACCESSOR = 
    /*@ts2dart_const*/ new OpaqueToken("NgValueAccessor");
    /**
     * Providers for validators to be used for {@link Control}s in a form.
     *
     * Provide this using `multi: true` to add validators.
     *
     * ### Example
     *
     * {@example core/forms/ts/ng_validators/ng_validators.ts region='ng_validators'}
     */
    var NG_VALIDATORS = new OpaqueToken("NgValidators");
    /**
     * Providers for asynchronous validators to be used for {@link Control}s
     * in a form.
     *
     * Provide this using `multi: true` to add validators.
     *
     * See {@link NG_VALIDATORS} for more details.
     */
    var NG_ASYNC_VALIDATORS = 
    /*@ts2dart_const*/ new OpaqueToken("NgAsyncValidators");
    /**
     * Provides a set of validators used by form controls.
     *
     * A validator is a function that processes a {@link Control} or collection of
     * controls and returns a map of errors. A null map means that validation has passed.
     *
     * ### Example
     *
     * ```typescript
     * var loginControl = new Control("", Validators.required)
     * ```
     */
    var Validators = (function () {
        function Validators() {
        }
        /**
         * Validator that requires controls to have a non-empty value.
         */
        Validators.required = function (control) {
            return isBlank$2(control.value) || (isString$2(control.value) && control.value == "") ?
                { "required": true } :
                null;
        };
        /**
         * Validator that requires controls to have a value of a minimum length.
         */
        Validators.minLength = function (minLength) {
            return function (control) {
                if (isPresent$2(Validators.required(control)))
                    return null;
                var v = control.value;
                return v.length < minLength ?
                    { "minlength": { "requiredLength": minLength, "actualLength": v.length } } :
                    null;
            };
        };
        /**
         * Validator that requires controls to have a value of a maximum length.
         */
        Validators.maxLength = function (maxLength) {
            return function (control) {
                if (isPresent$2(Validators.required(control)))
                    return null;
                var v = control.value;
                return v.length > maxLength ?
                    { "maxlength": { "requiredLength": maxLength, "actualLength": v.length } } :
                    null;
            };
        };
        /**
         * Validator that requires a control to match a regex to its value.
         */
        Validators.pattern = function (pattern) {
            return function (control) {
                if (isPresent$2(Validators.required(control)))
                    return null;
                var regex = new RegExp("^" + pattern + "$");
                var v = control.value;
                return regex.test(v) ? null :
                    { "pattern": { "requiredPattern": "^" + pattern + "$", "actualValue": v } };
            };
        };
        /**
         * No-op validator.
         */
        Validators.nullValidator = function (c) { return null; };
        /**
         * Compose multiple validators into a single function that returns the union
         * of the individual error maps.
         */
        Validators.compose = function (validators) {
            if (isBlank$2(validators))
                return null;
            var presentValidators = validators.filter(isPresent$2);
            if (presentValidators.length == 0)
                return null;
            return function (control) {
                return _mergeErrors(_executeValidators(control, presentValidators));
            };
        };
        Validators.composeAsync = function (validators) {
            if (isBlank$2(validators))
                return null;
            var presentValidators = validators.filter(isPresent$2);
            if (presentValidators.length == 0)
                return null;
            return function (control) {
                var promises = _executeAsyncValidators(control, presentValidators).map(_convertToPromise);
                return PromiseWrapper$1.all(promises).then(_mergeErrors);
            };
        };
        return Validators;
    }());
    function _convertToPromise(obj) {
        return PromiseWrapper$1.isPromise(obj) ? obj : ObservableWrapper$1.toPromise(obj);
    }
    function _executeValidators(control, validators) {
        return validators.map(function (v) { return v(control); });
    }
    function _executeAsyncValidators(control, validators) {
        return validators.map(function (v) { return v(control); });
    }
    function _mergeErrors(arrayOfErrors) {
        var res = arrayOfErrors.reduce(function (res, errors) {
            return isPresent$2(errors) ? StringMapWrapper$1.merge(res, errors) : res;
        }, {});
        return StringMapWrapper$1.isEmpty(res) ? null : res;
    }
    var DEFAULT_VALUE_ACCESSOR = 
    /* @ts2dart_Provider */ {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(function () { return DefaultValueAccessor; }),
        multi: true
    };
    var DefaultValueAccessor = (function () {
        function DefaultValueAccessor(_renderer, _elementRef) {
            this._renderer = _renderer;
            this._elementRef = _elementRef;
            this.onChange = function (_) { };
            this.onTouched = function () { };
        }
        DefaultValueAccessor.prototype.writeValue = function (value) {
            var normalizedValue = isBlank$2(value) ? '' : value;
            this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', normalizedValue);
        };
        DefaultValueAccessor.prototype.registerOnChange = function (fn) { this.onChange = fn; };
        DefaultValueAccessor.prototype.registerOnTouched = function (fn) { this.onTouched = fn; };
        return DefaultValueAccessor;
    }());
    DefaultValueAccessor.decorators = [
        { type: Directive, args: [{
                    selector: 'input:not([type=checkbox])[ngControl],textarea[ngControl],input:not([type=checkbox])[ngFormControl],textarea[ngFormControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]',
                    // TODO: vsavkin replace the above selector with the one below it once
                    // https://github.com/angular/angular/issues/3011 is implemented
                    // selector: '[ngControl],[ngModel],[ngFormControl]',
                    host: { '(input)': 'onChange($event.target.value)', '(blur)': 'onTouched()' },
                    bindings: [DEFAULT_VALUE_ACCESSOR]
                },] },
    ];
    DefaultValueAccessor.ctorParameters = [
        { type: Renderer, },
        { type: ElementRef, },
    ];
    var NUMBER_VALUE_ACCESSOR = {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(function () { return NumberValueAccessor; }),
        multi: true
    };
    var NumberValueAccessor = (function () {
        function NumberValueAccessor(_renderer, _elementRef) {
            this._renderer = _renderer;
            this._elementRef = _elementRef;
            this.onChange = function (_) { };
            this.onTouched = function () { };
        }
        NumberValueAccessor.prototype.writeValue = function (value) {
            this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', value);
        };
        NumberValueAccessor.prototype.registerOnChange = function (fn) {
            this.onChange = function (value) { fn(value == '' ? null : NumberWrapper$2.parseFloat(value)); };
        };
        NumberValueAccessor.prototype.registerOnTouched = function (fn) { this.onTouched = fn; };
        return NumberValueAccessor;
    }());
    NumberValueAccessor.decorators = [
        { type: Directive, args: [{
                    selector: 'input[type=number][ngControl],input[type=number][ngFormControl],input[type=number][ngModel]',
                    host: {
                        '(change)': 'onChange($event.target.value)',
                        '(input)': 'onChange($event.target.value)',
                        '(blur)': 'onTouched()'
                    },
                    bindings: [NUMBER_VALUE_ACCESSOR]
                },] },
    ];
    NumberValueAccessor.ctorParameters = [
        { type: Renderer, },
        { type: ElementRef, },
    ];
    var CHECKBOX_VALUE_ACCESSOR = {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(function () { return CheckboxControlValueAccessor; }),
        multi: true
    };
    var CheckboxControlValueAccessor = (function () {
        function CheckboxControlValueAccessor(_renderer, _elementRef) {
            this._renderer = _renderer;
            this._elementRef = _elementRef;
            this.onChange = function (_) { };
            this.onTouched = function () { };
        }
        CheckboxControlValueAccessor.prototype.writeValue = function (value) {
            this._renderer.setElementProperty(this._elementRef.nativeElement, 'checked', value);
        };
        CheckboxControlValueAccessor.prototype.registerOnChange = function (fn) { this.onChange = fn; };
        CheckboxControlValueAccessor.prototype.registerOnTouched = function (fn) { this.onTouched = fn; };
        return CheckboxControlValueAccessor;
    }());
    CheckboxControlValueAccessor.decorators = [
        { type: Directive, args: [{
                    selector: 'input[type=checkbox][ngControl],input[type=checkbox][ngFormControl],input[type=checkbox][ngModel]',
                    host: { '(change)': 'onChange($event.target.checked)', '(blur)': 'onTouched()' },
                    providers: [CHECKBOX_VALUE_ACCESSOR]
                },] },
    ];
    CheckboxControlValueAccessor.ctorParameters = [
        { type: Renderer, },
        { type: ElementRef, },
    ];
    var SELECT_VALUE_ACCESSOR = {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(function () { return SelectControlValueAccessor; }),
        multi: true
    };
    function _buildValueString(id, value) {
        if (isBlank$2(id))
            return "" + value;
        if (!isPrimitive$2(value))
            value = "Object";
        return StringWrapper$2.slice(id + ": " + value, 0, 50);
    }
    function _extractId(valueString) {
        return valueString.split(":")[0];
    }
    var SelectControlValueAccessor = (function () {
        function SelectControlValueAccessor(_renderer, _elementRef) {
            this._renderer = _renderer;
            this._elementRef = _elementRef;
            /** @internal */
            this._optionMap = new Map();
            /** @internal */
            this._idCounter = 0;
            this.onChange = function (_) { };
            this.onTouched = function () { };
        }
        SelectControlValueAccessor.prototype.writeValue = function (value) {
            this.value = value;
            var valueString = _buildValueString(this._getOptionId(value), value);
            this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', valueString);
        };
        SelectControlValueAccessor.prototype.registerOnChange = function (fn) {
            var _this = this;
            this.onChange = function (valueString) { fn(_this._getOptionValue(valueString)); };
        };
        SelectControlValueAccessor.prototype.registerOnTouched = function (fn) { this.onTouched = fn; };
        /** @internal */
        SelectControlValueAccessor.prototype._registerOption = function () { return (this._idCounter++).toString(); };
        /** @internal */
        SelectControlValueAccessor.prototype._getOptionId = function (value) {
            for (var _i = 0, _a = MapWrapper$1.keys(this._optionMap); _i < _a.length; _i++) {
                var id = _a[_i];
                if (looseIdentical$2(this._optionMap.get(id), value))
                    return id;
            }
            return null;
        };
        /** @internal */
        SelectControlValueAccessor.prototype._getOptionValue = function (valueString) {
            var value = this._optionMap.get(_extractId(valueString));
            return isPresent$2(value) ? value : valueString;
        };
        return SelectControlValueAccessor;
    }());
    SelectControlValueAccessor.decorators = [
        { type: Directive, args: [{
                    selector: 'select[ngControl],select[ngFormControl],select[ngModel]',
                    host: { '(change)': 'onChange($event.target.value)', '(blur)': 'onTouched()' },
                    providers: [SELECT_VALUE_ACCESSOR]
                },] },
    ];
    SelectControlValueAccessor.ctorParameters = [
        { type: Renderer, },
        { type: ElementRef, },
    ];
    var NgSelectOption = (function () {
        function NgSelectOption(_element, _renderer, _select) {
            this._element = _element;
            this._renderer = _renderer;
            this._select = _select;
            if (isPresent$2(this._select))
                this.id = this._select._registerOption();
        }
        Object.defineProperty(NgSelectOption.prototype, "ngValue", {
            set: function (value) {
                if (this._select == null)
                    return;
                this._select._optionMap.set(this.id, value);
                this._setElementValue(_buildValueString(this.id, value));
                this._select.writeValue(this._select.value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgSelectOption.prototype, "value", {
            set: function (value) {
                this._setElementValue(value);
                if (isPresent$2(this._select))
                    this._select.writeValue(this._select.value);
            },
            enumerable: true,
            configurable: true
        });
        /** @internal */
        NgSelectOption.prototype._setElementValue = function (value) {
            this._renderer.setElementProperty(this._element.nativeElement, 'value', value);
        };
        NgSelectOption.prototype.ngOnDestroy = function () {
            if (isPresent$2(this._select)) {
                this._select._optionMap.delete(this.id);
                this._select.writeValue(this._select.value);
            }
        };
        return NgSelectOption;
    }());
    NgSelectOption.decorators = [
        { type: Directive, args: [{ selector: 'option' },] },
    ];
    NgSelectOption.ctorParameters = [
        { type: ElementRef, },
        { type: Renderer, },
        { type: SelectControlValueAccessor, decorators: [{ type: Optional }, { type: Host },] },
    ];
    NgSelectOption.propDecorators = {
        'ngValue': [{ type: Input, args: ['ngValue',] },],
        'value': [{ type: Input, args: ['value',] },],
    };
    var RADIO_VALUE_ACCESSOR = {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(function () { return RadioControlValueAccessor; }),
        multi: true
    };
    var RadioControlRegistry = (function () {
        function RadioControlRegistry() {
            this._accessors = [];
        }
        RadioControlRegistry.prototype.add = function (control, accessor) {
            this._accessors.push([control, accessor]);
        };
        RadioControlRegistry.prototype.remove = function (accessor) {
            var indexToRemove = -1;
            for (var i = 0; i < this._accessors.length; ++i) {
                if (this._accessors[i][1] === accessor) {
                    indexToRemove = i;
                }
            }
            ListWrapper$1.removeAt(this._accessors, indexToRemove);
        };
        RadioControlRegistry.prototype.select = function (accessor) {
            this._accessors.forEach(function (c) {
                if (c[0].control.root === accessor._control.control.root && c[1] !== accessor) {
                    c[1].fireUncheck();
                }
            });
        };
        return RadioControlRegistry;
    }());
    RadioControlRegistry.decorators = [
        { type: Injectable },
    ];
    /**
     * The value provided by the forms API for radio buttons.
     */
    var RadioButtonState = (function () {
        function RadioButtonState(checked, value) {
            this.checked = checked;
            this.value = value;
        }
        return RadioButtonState;
    }());
    var RadioControlValueAccessor = (function () {
        function RadioControlValueAccessor(_renderer, _elementRef, _registry, _injector) {
            this._renderer = _renderer;
            this._elementRef = _elementRef;
            this._registry = _registry;
            this._injector = _injector;
            this.onChange = function () { };
            this.onTouched = function () { };
        }
        RadioControlValueAccessor.prototype.ngOnInit = function () {
            this._control = this._injector.get(NgControl);
            this._registry.add(this._control, this);
        };
        RadioControlValueAccessor.prototype.ngOnDestroy = function () { this._registry.remove(this); };
        RadioControlValueAccessor.prototype.writeValue = function (value) {
            this._state = value;
            if (isPresent$2(value) && value.checked) {
                this._renderer.setElementProperty(this._elementRef.nativeElement, 'checked', true);
            }
        };
        RadioControlValueAccessor.prototype.registerOnChange = function (fn) {
            var _this = this;
            this._fn = fn;
            this.onChange = function () {
                fn(new RadioButtonState(true, _this._state.value));
                _this._registry.select(_this);
            };
        };
        RadioControlValueAccessor.prototype.fireUncheck = function () { this._fn(new RadioButtonState(false, this._state.value)); };
        RadioControlValueAccessor.prototype.registerOnTouched = function (fn) { this.onTouched = fn; };
        return RadioControlValueAccessor;
    }());
    RadioControlValueAccessor.decorators = [
        { type: Directive, args: [{
                    selector: 'input[type=radio][ngControl],input[type=radio][ngFormControl],input[type=radio][ngModel]',
                    host: { '(change)': 'onChange()', '(blur)': 'onTouched()' },
                    providers: [RADIO_VALUE_ACCESSOR]
                },] },
    ];
    RadioControlValueAccessor.ctorParameters = [
        { type: Renderer, },
        { type: ElementRef, },
        { type: RadioControlRegistry, },
        { type: Injector, },
    ];
    RadioControlValueAccessor.propDecorators = {
        'name': [{ type: Input },],
    };
    function normalizeValidator(validator) {
        if (validator.validate !== undefined) {
            return function (c) { return validator.validate(c); };
        }
        else {
            return validator;
        }
    }
    function normalizeAsyncValidator(validator) {
        if (validator.validate !== undefined) {
            return function (c) { return Promise.resolve(validator.validate(c)); };
        }
        else {
            return validator;
        }
    }
    function controlPath(name, parent) {
        var p = ListWrapper$1.clone(parent.path);
        p.push(name);
        return p;
    }
    function setUpControl(control, dir) {
        if (isBlank$2(control))
            _throwError(dir, "Cannot find control");
        if (isBlank$2(dir.valueAccessor))
            _throwError(dir, "No value accessor for");
        control.validator = Validators.compose([control.validator, dir.validator]);
        control.asyncValidator = Validators.composeAsync([control.asyncValidator, dir.asyncValidator]);
        dir.valueAccessor.writeValue(control.value);
        // view -> model
        dir.valueAccessor.registerOnChange(function (newValue) {
            dir.viewToModelUpdate(newValue);
            control.updateValue(newValue, { emitModelToViewChange: false });
            control.markAsDirty();
        });
        // model -> view
        control.registerOnChange(function (newValue) { return dir.valueAccessor.writeValue(newValue); });
        // touched
        dir.valueAccessor.registerOnTouched(function () { return control.markAsTouched(); });
    }
    function setUpControlGroup(control, dir) {
        if (isBlank$2(control))
            _throwError(dir, "Cannot find control");
        control.validator = Validators.compose([control.validator, dir.validator]);
        control.asyncValidator = Validators.composeAsync([control.asyncValidator, dir.asyncValidator]);
    }
    function _throwError(dir, message) {
        var path = dir.path.join(" -> ");
        throw new BaseException$1(message + " '" + path + "'");
    }
    function composeValidators(validators) {
        return isPresent$2(validators) ? Validators.compose(validators.map(normalizeValidator)) : null;
    }
    function composeAsyncValidators(validators) {
        return isPresent$2(validators) ? Validators.composeAsync(validators.map(normalizeAsyncValidator)) :
            null;
    }
    function isPropertyUpdated(changes, viewModel) {
        if (!StringMapWrapper$1.contains(changes, "model"))
            return false;
        var change = changes["model"];
        if (change.isFirstChange())
            return true;
        return !looseIdentical$2(viewModel, change.currentValue);
    }
    // TODO: vsavkin remove it once https://github.com/angular/angular/issues/3011 is implemented
    function selectValueAccessor(dir, valueAccessors) {
        if (isBlank$2(valueAccessors))
            return null;
        var defaultAccessor;
        var builtinAccessor;
        var customAccessor;
        valueAccessors.forEach(function (v) {
            if (hasConstructor$2(v, DefaultValueAccessor)) {
                defaultAccessor = v;
            }
            else if (hasConstructor$2(v, CheckboxControlValueAccessor) ||
                hasConstructor$2(v, NumberValueAccessor) ||
                hasConstructor$2(v, SelectControlValueAccessor) ||
                hasConstructor$2(v, RadioControlValueAccessor)) {
                if (isPresent$2(builtinAccessor))
                    _throwError(dir, "More than one built-in value accessor matches");
                builtinAccessor = v;
            }
            else {
                if (isPresent$2(customAccessor))
                    _throwError(dir, "More than one custom value accessor matches");
                customAccessor = v;
            }
        });
        if (isPresent$2(customAccessor))
            return customAccessor;
        if (isPresent$2(builtinAccessor))
            return builtinAccessor;
        if (isPresent$2(defaultAccessor))
            return defaultAccessor;
        _throwError(dir, "No valid value accessor for");
        return null;
    }
    var controlNameBinding = 
    /*@ts2dart_const*/ /* @ts2dart_Provider */ {
        provide: NgControl,
        useExisting: forwardRef(function () { return NgControlName; })
    };
    var NgControlName = (function (_super) {
        __extends(NgControlName, _super);
        function NgControlName(_parent, _validators, _asyncValidators, valueAccessors) {
            _super.call(this);
            this._parent = _parent;
            this._validators = _validators;
            this._asyncValidators = _asyncValidators;
            /** @internal */
            this.update = new EventEmitter$1();
            this._added = false;
            this.valueAccessor = selectValueAccessor(this, valueAccessors);
        }
        NgControlName.prototype.ngOnChanges = function (changes) {
            if (!this._added) {
                this.formDirective.addControl(this);
                this._added = true;
            }
            if (isPropertyUpdated(changes, this.viewModel)) {
                this.viewModel = this.model;
                this.formDirective.updateModel(this, this.model);
            }
        };
        NgControlName.prototype.ngOnDestroy = function () { this.formDirective.removeControl(this); };
        NgControlName.prototype.viewToModelUpdate = function (newValue) {
            this.viewModel = newValue;
            ObservableWrapper$1.callEmit(this.update, newValue);
        };
        Object.defineProperty(NgControlName.prototype, "path", {
            get: function () { return controlPath(this.name, this._parent); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgControlName.prototype, "formDirective", {
            get: function () { return this._parent.formDirective; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgControlName.prototype, "validator", {
            get: function () { return composeValidators(this._validators); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgControlName.prototype, "asyncValidator", {
            get: function () { return composeAsyncValidators(this._asyncValidators); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgControlName.prototype, "control", {
            get: function () { return this.formDirective.getControl(this); },
            enumerable: true,
            configurable: true
        });
        return NgControlName;
    }(NgControl));
    NgControlName.decorators = [
        { type: Directive, args: [{
                    selector: '[ngControl]',
                    bindings: [controlNameBinding],
                    inputs: ['name: ngControl', 'model: ngModel'],
                    outputs: ['update: ngModelChange'],
                    exportAs: 'ngForm'
                },] },
    ];
    NgControlName.ctorParameters = [
        { type: ControlContainer, decorators: [{ type: Host }, { type: SkipSelf },] },
        { type: undefined, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALIDATORS,] },] },
        { type: undefined, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_ASYNC_VALIDATORS,] },] },
        { type: undefined, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALUE_ACCESSOR,] },] },
    ];
    var formControlBinding = 
    /*@ts2dart_const*/ /* @ts2dart_Provider */ {
        provide: NgControl,
        useExisting: forwardRef(function () { return NgFormControl; })
    };
    var NgFormControl = (function (_super) {
        __extends(NgFormControl, _super);
        function NgFormControl(_validators, _asyncValidators, valueAccessors) {
            _super.call(this);
            this._validators = _validators;
            this._asyncValidators = _asyncValidators;
            this.update = new EventEmitter$1();
            this.valueAccessor = selectValueAccessor(this, valueAccessors);
        }
        NgFormControl.prototype.ngOnChanges = function (changes) {
            if (this._isControlChanged(changes)) {
                setUpControl(this.form, this);
                this.form.updateValueAndValidity({ emitEvent: false });
            }
            if (isPropertyUpdated(changes, this.viewModel)) {
                this.form.updateValue(this.model);
                this.viewModel = this.model;
            }
        };
        Object.defineProperty(NgFormControl.prototype, "path", {
            get: function () { return []; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgFormControl.prototype, "validator", {
            get: function () { return composeValidators(this._validators); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgFormControl.prototype, "asyncValidator", {
            get: function () { return composeAsyncValidators(this._asyncValidators); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgFormControl.prototype, "control", {
            get: function () { return this.form; },
            enumerable: true,
            configurable: true
        });
        NgFormControl.prototype.viewToModelUpdate = function (newValue) {
            this.viewModel = newValue;
            ObservableWrapper$1.callEmit(this.update, newValue);
        };
        NgFormControl.prototype._isControlChanged = function (changes) {
            return StringMapWrapper$1.contains(changes, "form");
        };
        return NgFormControl;
    }(NgControl));
    NgFormControl.decorators = [
        { type: Directive, args: [{
                    selector: '[ngFormControl]',
                    bindings: [formControlBinding],
                    inputs: ['form: ngFormControl', 'model: ngModel'],
                    outputs: ['update: ngModelChange'],
                    exportAs: 'ngForm'
                },] },
    ];
    NgFormControl.ctorParameters = [
        { type: undefined, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALIDATORS,] },] },
        { type: undefined, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_ASYNC_VALIDATORS,] },] },
        { type: undefined, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALUE_ACCESSOR,] },] },
    ];
    var formControlBinding$1 = 
    /*@ts2dart_const*/ /* @ts2dart_Provider */ {
        provide: NgControl,
        useExisting: forwardRef(function () { return NgModel; })
    };
    var NgModel = (function (_super) {
        __extends(NgModel, _super);
        function NgModel(_validators, _asyncValidators, valueAccessors) {
            _super.call(this);
            this._validators = _validators;
            this._asyncValidators = _asyncValidators;
            /** @internal */
            this._control = new Control();
            /** @internal */
            this._added = false;
            this.update = new EventEmitter$1();
            this.valueAccessor = selectValueAccessor(this, valueAccessors);
        }
        NgModel.prototype.ngOnChanges = function (changes) {
            if (!this._added) {
                setUpControl(this._control, this);
                this._control.updateValueAndValidity({ emitEvent: false });
                this._added = true;
            }
            if (isPropertyUpdated(changes, this.viewModel)) {
                this._control.updateValue(this.model);
                this.viewModel = this.model;
            }
        };
        Object.defineProperty(NgModel.prototype, "control", {
            get: function () { return this._control; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgModel.prototype, "path", {
            get: function () { return []; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgModel.prototype, "validator", {
            get: function () { return composeValidators(this._validators); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgModel.prototype, "asyncValidator", {
            get: function () { return composeAsyncValidators(this._asyncValidators); },
            enumerable: true,
            configurable: true
        });
        NgModel.prototype.viewToModelUpdate = function (newValue) {
            this.viewModel = newValue;
            ObservableWrapper$1.callEmit(this.update, newValue);
        };
        return NgModel;
    }(NgControl));
    NgModel.decorators = [
        { type: Directive, args: [{
                    selector: '[ngModel]:not([ngControl]):not([ngFormControl])',
                    bindings: [formControlBinding$1],
                    inputs: ['model: ngModel'],
                    outputs: ['update: ngModelChange'],
                    exportAs: 'ngForm'
                },] },
    ];
    NgModel.ctorParameters = [
        { type: undefined, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALIDATORS,] },] },
        { type: undefined, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_ASYNC_VALIDATORS,] },] },
        { type: undefined, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALUE_ACCESSOR,] },] },
    ];
    var controlGroupProvider = 
    /*@ts2dart_const*/ /* @ts2dart_Provider */ {
        provide: ControlContainer,
        useExisting: forwardRef(function () { return NgControlGroup; })
    };
    var NgControlGroup = (function (_super) {
        __extends(NgControlGroup, _super);
        function NgControlGroup(parent, _validators, _asyncValidators) {
            _super.call(this);
            this._validators = _validators;
            this._asyncValidators = _asyncValidators;
            this._parent = parent;
        }
        NgControlGroup.prototype.ngOnInit = function () { this.formDirective.addControlGroup(this); };
        NgControlGroup.prototype.ngOnDestroy = function () { this.formDirective.removeControlGroup(this); };
        Object.defineProperty(NgControlGroup.prototype, "control", {
            /**
             * Get the {@link ControlGroup} backing this binding.
             */
            get: function () { return this.formDirective.getControlGroup(this); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgControlGroup.prototype, "path", {
            /**
             * Get the path to this control group.
             */
            get: function () { return controlPath(this.name, this._parent); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgControlGroup.prototype, "formDirective", {
            /**
             * Get the {@link Form} to which this group belongs.
             */
            get: function () { return this._parent.formDirective; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgControlGroup.prototype, "validator", {
            get: function () { return composeValidators(this._validators); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgControlGroup.prototype, "asyncValidator", {
            get: function () { return composeAsyncValidators(this._asyncValidators); },
            enumerable: true,
            configurable: true
        });
        return NgControlGroup;
    }(ControlContainer));
    NgControlGroup.decorators = [
        { type: Directive, args: [{
                    selector: '[ngControlGroup]',
                    providers: [controlGroupProvider],
                    inputs: ['name: ngControlGroup'],
                    exportAs: 'ngForm'
                },] },
    ];
    NgControlGroup.ctorParameters = [
        { type: ControlContainer, decorators: [{ type: Host }, { type: SkipSelf },] },
        { type: undefined, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALIDATORS,] },] },
        { type: undefined, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_ASYNC_VALIDATORS,] },] },
    ];
    var formDirectiveProvider = 
    /*@ts2dart_const*/ /* @ts2dart_Provider */ {
        provide: ControlContainer,
        useExisting: forwardRef(function () { return NgFormModel; })
    };
    var NgFormModel = (function (_super) {
        __extends(NgFormModel, _super);
        function NgFormModel(_validators, _asyncValidators) {
            _super.call(this);
            this._validators = _validators;
            this._asyncValidators = _asyncValidators;
            this.form = null;
            this.directives = [];
            this.ngSubmit = new EventEmitter$1();
        }
        NgFormModel.prototype.ngOnChanges = function (changes) {
            this._checkFormPresent();
            if (StringMapWrapper$1.contains(changes, "form")) {
                var sync = composeValidators(this._validators);
                this.form.validator = Validators.compose([this.form.validator, sync]);
                var async = composeAsyncValidators(this._asyncValidators);
                this.form.asyncValidator = Validators.composeAsync([this.form.asyncValidator, async]);
                this.form.updateValueAndValidity({ onlySelf: true, emitEvent: false });
            }
            this._updateDomValue();
        };
        Object.defineProperty(NgFormModel.prototype, "formDirective", {
            get: function () { return this; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgFormModel.prototype, "control", {
            get: function () { return this.form; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgFormModel.prototype, "path", {
            get: function () { return []; },
            enumerable: true,
            configurable: true
        });
        NgFormModel.prototype.addControl = function (dir) {
            var ctrl = this.form.find(dir.path);
            setUpControl(ctrl, dir);
            ctrl.updateValueAndValidity({ emitEvent: false });
            this.directives.push(dir);
        };
        NgFormModel.prototype.getControl = function (dir) { return this.form.find(dir.path); };
        NgFormModel.prototype.removeControl = function (dir) { ListWrapper$1.remove(this.directives, dir); };
        NgFormModel.prototype.addControlGroup = function (dir) {
            var ctrl = this.form.find(dir.path);
            setUpControlGroup(ctrl, dir);
            ctrl.updateValueAndValidity({ emitEvent: false });
        };
        NgFormModel.prototype.removeControlGroup = function (dir) { };
        NgFormModel.prototype.getControlGroup = function (dir) {
            return this.form.find(dir.path);
        };
        NgFormModel.prototype.updateModel = function (dir, value) {
            var ctrl = this.form.find(dir.path);
            ctrl.updateValue(value);
        };
        NgFormModel.prototype.onSubmit = function () {
            ObservableWrapper$1.callEmit(this.ngSubmit, null);
            return false;
        };
        /** @internal */
        NgFormModel.prototype._updateDomValue = function () {
            var _this = this;
            this.directives.forEach(function (dir) {
                var ctrl = _this.form.find(dir.path);
                dir.valueAccessor.writeValue(ctrl.value);
            });
        };
        NgFormModel.prototype._checkFormPresent = function () {
            if (isBlank$2(this.form)) {
                throw new BaseException$1("ngFormModel expects a form. Please pass one in. Example: <form [ngFormModel]=\"myCoolForm\">");
            }
        };
        return NgFormModel;
    }(ControlContainer));
    NgFormModel.decorators = [
        { type: Directive, args: [{
                    selector: '[ngFormModel]',
                    bindings: [formDirectiveProvider],
                    inputs: ['form: ngFormModel'],
                    host: { '(submit)': 'onSubmit()' },
                    outputs: ['ngSubmit'],
                    exportAs: 'ngForm'
                },] },
    ];
    NgFormModel.ctorParameters = [
        { type: undefined, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALIDATORS,] },] },
        { type: undefined, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_ASYNC_VALIDATORS,] },] },
    ];
    var formDirectiveProvider$1 = 
    /*@ts2dart_const*/ { provide: ControlContainer, useExisting: forwardRef(function () { return NgForm; }) };
    var NgForm = (function (_super) {
        __extends(NgForm, _super);
        function NgForm(validators, asyncValidators) {
            _super.call(this);
            this.ngSubmit = new EventEmitter$1();
            this.form = new ControlGroup({}, null, composeValidators(validators), composeAsyncValidators(asyncValidators));
        }
        Object.defineProperty(NgForm.prototype, "formDirective", {
            get: function () { return this; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgForm.prototype, "control", {
            get: function () { return this.form; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgForm.prototype, "path", {
            get: function () { return []; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgForm.prototype, "controls", {
            get: function () { return this.form.controls; },
            enumerable: true,
            configurable: true
        });
        NgForm.prototype.addControl = function (dir) {
            var _this = this;
            PromiseWrapper$1.scheduleMicrotask(function () {
                var container = _this._findContainer(dir.path);
                var ctrl = new Control();
                setUpControl(ctrl, dir);
                container.addControl(dir.name, ctrl);
                ctrl.updateValueAndValidity({ emitEvent: false });
            });
        };
        NgForm.prototype.getControl = function (dir) { return this.form.find(dir.path); };
        NgForm.prototype.removeControl = function (dir) {
            var _this = this;
            PromiseWrapper$1.scheduleMicrotask(function () {
                var container = _this._findContainer(dir.path);
                if (isPresent$2(container)) {
                    container.removeControl(dir.name);
                    container.updateValueAndValidity({ emitEvent: false });
                }
            });
        };
        NgForm.prototype.addControlGroup = function (dir) {
            var _this = this;
            PromiseWrapper$1.scheduleMicrotask(function () {
                var container = _this._findContainer(dir.path);
                var group = new ControlGroup({});
                setUpControlGroup(group, dir);
                container.addControl(dir.name, group);
                group.updateValueAndValidity({ emitEvent: false });
            });
        };
        NgForm.prototype.removeControlGroup = function (dir) {
            var _this = this;
            PromiseWrapper$1.scheduleMicrotask(function () {
                var container = _this._findContainer(dir.path);
                if (isPresent$2(container)) {
                    container.removeControl(dir.name);
                    container.updateValueAndValidity({ emitEvent: false });
                }
            });
        };
        NgForm.prototype.getControlGroup = function (dir) {
            return this.form.find(dir.path);
        };
        NgForm.prototype.updateModel = function (dir, value) {
            var _this = this;
            PromiseWrapper$1.scheduleMicrotask(function () {
                var ctrl = _this.form.find(dir.path);
                ctrl.updateValue(value);
            });
        };
        NgForm.prototype.onSubmit = function () {
            ObservableWrapper$1.callEmit(this.ngSubmit, null);
            return false;
        };
        /** @internal */
        NgForm.prototype._findContainer = function (path) {
            path.pop();
            return ListWrapper$1.isEmpty(path) ? this.form : this.form.find(path);
        };
        return NgForm;
    }(ControlContainer));
    NgForm.decorators = [
        { type: Directive, args: [{
                    selector: 'form:not([ngNoForm]):not([ngFormModel]),ngForm,[ngForm]',
                    bindings: [formDirectiveProvider$1],
                    host: {
                        '(submit)': 'onSubmit()',
                    },
                    outputs: ['ngSubmit'],
                    exportAs: 'ngForm'
                },] },
    ];
    NgForm.ctorParameters = [
        { type: undefined, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALIDATORS,] },] },
        { type: undefined, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_ASYNC_VALIDATORS,] },] },
    ];
    var NgControlStatus = (function () {
        function NgControlStatus(cd) {
            this._cd = cd;
        }
        Object.defineProperty(NgControlStatus.prototype, "ngClassUntouched", {
            get: function () {
                return isPresent$2(this._cd.control) ? this._cd.control.untouched : false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgControlStatus.prototype, "ngClassTouched", {
            get: function () {
                return isPresent$2(this._cd.control) ? this._cd.control.touched : false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgControlStatus.prototype, "ngClassPristine", {
            get: function () {
                return isPresent$2(this._cd.control) ? this._cd.control.pristine : false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgControlStatus.prototype, "ngClassDirty", {
            get: function () {
                return isPresent$2(this._cd.control) ? this._cd.control.dirty : false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgControlStatus.prototype, "ngClassValid", {
            get: function () {
                return isPresent$2(this._cd.control) ? this._cd.control.valid : false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgControlStatus.prototype, "ngClassInvalid", {
            get: function () {
                return isPresent$2(this._cd.control) ? !this._cd.control.valid : false;
            },
            enumerable: true,
            configurable: true
        });
        return NgControlStatus;
    }());
    NgControlStatus.decorators = [
        { type: Directive, args: [{
                    selector: '[ngControl],[ngModel],[ngFormControl]',
                    host: {
                        '[class.ng-untouched]': 'ngClassUntouched',
                        '[class.ng-touched]': 'ngClassTouched',
                        '[class.ng-pristine]': 'ngClassPristine',
                        '[class.ng-dirty]': 'ngClassDirty',
                        '[class.ng-valid]': 'ngClassValid',
                        '[class.ng-invalid]': 'ngClassInvalid'
                    }
                },] },
    ];
    NgControlStatus.ctorParameters = [
        { type: NgControl, decorators: [{ type: Self },] },
    ];
    var REQUIRED = Validators.required;
    var REQUIRED_VALIDATOR = {
        provide: NG_VALIDATORS,
        useValue: REQUIRED,
        multi: true
    };
    var RequiredValidator = (function () {
        function RequiredValidator() {
        }
        return RequiredValidator;
    }());
    RequiredValidator.decorators = [
        { type: Directive, args: [{
                    selector: '[required][ngControl],[required][ngFormControl],[required][ngModel]',
                    providers: [REQUIRED_VALIDATOR]
                },] },
    ];
    /**
     * Provivder which adds {@link MinLengthValidator} to {@link NG_VALIDATORS}.
     *
     * ## Example:
     *
     * {@example common/forms/ts/validators/validators.ts region='min'}
     */
    var MIN_LENGTH_VALIDATOR = {
        provide: NG_VALIDATORS,
        useExisting: forwardRef(function () { return MinLengthValidator; }),
        multi: true
    };
    var MinLengthValidator = (function () {
        function MinLengthValidator(minLength) {
            this._validator = Validators.minLength(NumberWrapper$2.parseInt(minLength, 10));
        }
        MinLengthValidator.prototype.validate = function (c) { return this._validator(c); };
        return MinLengthValidator;
    }());
    MinLengthValidator.decorators = [
        { type: Directive, args: [{
                    selector: '[minlength][ngControl],[minlength][ngFormControl],[minlength][ngModel]',
                    providers: [MIN_LENGTH_VALIDATOR]
                },] },
    ];
    MinLengthValidator.ctorParameters = [
        { type: undefined, decorators: [{ type: Attribute, args: ["minlength",] },] },
    ];
    /**
     * Provider which adds {@link MaxLengthValidator} to {@link NG_VALIDATORS}.
     *
     * ## Example:
     *
     * {@example common/forms/ts/validators/validators.ts region='max'}
     */
    var MAX_LENGTH_VALIDATOR = {
        provide: NG_VALIDATORS,
        useExisting: forwardRef(function () { return MaxLengthValidator; }),
        multi: true
    };
    var MaxLengthValidator = (function () {
        function MaxLengthValidator(maxLength) {
            this._validator = Validators.maxLength(NumberWrapper$2.parseInt(maxLength, 10));
        }
        MaxLengthValidator.prototype.validate = function (c) { return this._validator(c); };
        return MaxLengthValidator;
    }());
    MaxLengthValidator.decorators = [
        { type: Directive, args: [{
                    selector: '[maxlength][ngControl],[maxlength][ngFormControl],[maxlength][ngModel]',
                    providers: [MAX_LENGTH_VALIDATOR]
                },] },
    ];
    MaxLengthValidator.ctorParameters = [
        { type: undefined, decorators: [{ type: Attribute, args: ["maxlength",] },] },
    ];
    /**
     * A Directive that adds the `pattern` validator to any controls marked with the
     * `pattern` attribute, via the {@link NG_VALIDATORS} binding. Uses attribute value
     * as the regex to validate Control value against.  Follows pattern attribute
     * semantics; i.e. regex must match entire Control value.
     *
     * ### Example
     *
     * ```
     * <input [ngControl]="fullName" pattern="[a-zA-Z ]*">
     * ```
     */
    var PATTERN_VALIDATOR = {
        provide: NG_VALIDATORS,
        useExisting: forwardRef(function () { return PatternValidator; }),
        multi: true
    };
    var PatternValidator = (function () {
        function PatternValidator(pattern) {
            this._validator = Validators.pattern(pattern);
        }
        PatternValidator.prototype.validate = function (c) { return this._validator(c); };
        return PatternValidator;
    }());
    PatternValidator.decorators = [
        { type: Directive, args: [{
                    selector: '[pattern][ngControl],[pattern][ngFormControl],[pattern][ngModel]',
                    providers: [PATTERN_VALIDATOR]
                },] },
    ];
    PatternValidator.ctorParameters = [
        { type: undefined, decorators: [{ type: Attribute, args: ["pattern",] },] },
    ];
    /**
     *
     * A list of all the form directives used as part of a `@Component` annotation.
     *
     *  This is a shorthand for importing them each individually.
     *
     * ### Example
     *
     * ```typescript
     * @Component({
     *   selector: 'my-app',
     *   directives: [FORM_DIRECTIVES]
     * })
     * class MyApp {}
     * ```
     */
    var FORM_DIRECTIVES = [
        NgControlName,
        NgControlGroup,
        NgFormControl,
        NgModel,
        NgFormModel,
        NgForm,
        NgSelectOption,
        DefaultValueAccessor,
        NumberValueAccessor,
        CheckboxControlValueAccessor,
        SelectControlValueAccessor,
        RadioControlValueAccessor,
        NgControlStatus,
        RequiredValidator,
        MinLengthValidator,
        MaxLengthValidator,
        PatternValidator
    ];
    var FormBuilder = (function () {
        function FormBuilder() {
        }
        /**
         * Construct a new {@link ControlGroup} with the given map of configuration.
         * Valid keys for the `extra` parameter map are `optionals` and `validator`.
         *
         * See the {@link ControlGroup} constructor for more details.
         */
        FormBuilder.prototype.group = function (controlsConfig, extra) {
            if (extra === void 0) { extra = null; }
            var controls = this._reduceControls(controlsConfig);
            var optionals = (isPresent$2(extra) ? StringMapWrapper$1.get(extra, "optionals") : null);
            var validator = isPresent$2(extra) ? StringMapWrapper$1.get(extra, "validator") : null;
            var asyncValidator = isPresent$2(extra) ? StringMapWrapper$1.get(extra, "asyncValidator") : null;
            return new ControlGroup(controls, optionals, validator, asyncValidator);
        };
        /**
         * Construct a new {@link Control} with the given `value`,`validator`, and `asyncValidator`.
         */
        FormBuilder.prototype.control = function (value, validator, asyncValidator) {
            if (validator === void 0) { validator = null; }
            if (asyncValidator === void 0) { asyncValidator = null; }
            return new Control(value, validator, asyncValidator);
        };
        /**
         * Construct an array of {@link Control}s from the given `controlsConfig` array of
         * configuration, with the given optional `validator` and `asyncValidator`.
         */
        FormBuilder.prototype.array = function (controlsConfig, validator, asyncValidator) {
            var _this = this;
            if (validator === void 0) { validator = null; }
            if (asyncValidator === void 0) { asyncValidator = null; }
            var controls = controlsConfig.map(function (c) { return _this._createControl(c); });
            return new ControlArray(controls, validator, asyncValidator);
        };
        /** @internal */
        FormBuilder.prototype._reduceControls = function (controlsConfig) {
            var _this = this;
            var controls = {};
            StringMapWrapper$1.forEach(controlsConfig, function (controlConfig, controlName) {
                controls[controlName] = _this._createControl(controlConfig);
            });
            return controls;
        };
        /** @internal */
        FormBuilder.prototype._createControl = function (controlConfig) {
            if (controlConfig instanceof Control ||
                controlConfig instanceof ControlGroup ||
                controlConfig instanceof ControlArray) {
                return controlConfig;
            }
            else if (isArray$3(controlConfig)) {
                var value = controlConfig[0];
                var validator = controlConfig.length > 1 ? controlConfig[1] : null;
                var asyncValidator = controlConfig.length > 2 ? controlConfig[2] : null;
                return this.control(value, validator, asyncValidator);
            }
            else {
                return this.control(controlConfig);
            }
        };
        return FormBuilder;
    }());
    FormBuilder.decorators = [
        { type: Injectable },
    ];
    /**
     * Shorthand set of providers used for building Angular forms.
     *
     * ### Example
     *
     * ```typescript
     * bootstrap(MyApp, [FORM_PROVIDERS]);
     * ```
     */
    var FORM_PROVIDERS = [FormBuilder, RadioControlRegistry];
    /**
     * A collection of Angular core directives that are likely to be used in each and every Angular
     * application. This includes core directives (e.g., NgIf and NgFor), and forms directives (e.g.,
     * NgModel).
     *
     * This collection can be used to quickly enumerate all the built-in directives in the `directives`
     * property of the `@Component` decorator.
     *
     * ### Example
     *
     * Instead of writing:
     *
     * ```typescript
     * import {NgClass, NgIf, NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault, NgModel, NgForm} from
     * '@angular/common';
     * import {OtherDirective} from './myDirectives';
     *
     * @Component({
     *   selector: 'my-component',
     *   templateUrl: 'myComponent.html',
     *   directives: [NgClass, NgIf, NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault, NgModel, NgForm,
     * OtherDirective]
     * })
     * export class MyComponent {
     *   ...
     * }
     * ```
     * one could import all the common directives at once:
     *
     * ```typescript
     * import {COMMON_DIRECTIVES} from '@angular/common';
     * import {OtherDirective} from './myDirectives';
     *
     * @Component({
     *   selector: 'my-component',
     *   templateUrl: 'myComponent.html',
     *   directives: [COMMON_DIRECTIVES, OtherDirective]
     * })
     * export class MyComponent {
     *   ...
     * }
     * ```
     */
    var COMMON_DIRECTIVES = [CORE_DIRECTIVES, FORM_DIRECTIVES];
    /**
     * The `APP_BASE_HREF` token represents the base href to be used with the
     * {@link PathLocationStrategy}.
     *
     * If you're using {@link PathLocationStrategy}, you must provide a provider to a string
     * representing the URL prefix that should be preserved when generating and recognizing
     * URLs.
     *
     * ### Example
     *
     * ```
     * import {Component} from '@angular/core';
     * import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from '@angular/router';
     * import {APP_BASE_HREF} from '@angular/common';
     *
     * @Component({directives: [ROUTER_DIRECTIVES]})
     * @RouteConfig([
     *  {...},
     * ])
     * class AppCmp {
     *   // ...
     * }
     *
     * bootstrap(AppCmp, [
     *   ROUTER_PROVIDERS,
     *   provide(APP_BASE_HREF, {useValue: '/my/app'})
     * ]);
     * ```
     */
    var APP_BASE_HREF = new OpaqueToken('appBaseHref');
    var _DOM = null;
    function getDOM() {
        return _DOM;
    }
    function setRootDomAdapter(adapter) {
        if (isBlank$1(_DOM)) {
            _DOM = adapter;
        }
    }
    /* tslint:disable:requireParameterType */
    /**
     * Provides DOM operations in an environment-agnostic way.
     */
    var DomAdapter = (function () {
        function DomAdapter() {
            this.xhrType = null;
        }
        /** @deprecated */
        DomAdapter.prototype.getXHR = function () { return this.xhrType; };
        Object.defineProperty(DomAdapter.prototype, "attrToPropMap", {
            /**
             * Maps attribute names to their corresponding property names for cases
             * where attribute name doesn't match property name.
             */
            get: function () { return this._attrToPropMap; },
            set: function (value) { this._attrToPropMap = value; },
            enumerable: true,
            configurable: true
        });
        ;
        ;
        return DomAdapter;
    }());
    /**
     * A pattern that recognizes a commonly useful subset of URLs that are safe.
     *
     * This regular expression matches a subset of URLs that will not cause script
     * execution if used in URL context within a HTML document. Specifically, this
     * regular expression matches if (comment from here on and regex copied from
     * Soy's EscapingConventions):
     * (1) Either a protocol in a whitelist (http, https, mailto or ftp).
     * (2) or no protocol.  A protocol must be followed by a colon. The below
     *     allows that by allowing colons only after one of the characters [/?#].
     *     A colon after a hash (#) must be in the fragment.
     *     Otherwise, a colon after a (?) must be in a query.
     *     Otherwise, a colon after a single solidus (/) must be in a path.
     *     Otherwise, a colon after a double solidus (//) must be in the authority
     *     (before port).
     *
     * The pattern disallows &, used in HTML entity declarations before
     * one of the characters in [/?#]. This disallows HTML entities used in the
     * protocol name, which should never happen, e.g. "h&#116;tp" for "http".
     * It also disallows HTML entities in the first path part of a relative path,
     * e.g. "foo&lt;bar/baz".  Our existing escaping functions should not produce
     * that. More importantly, it disallows masking of a colon,
     * e.g. "javascript&#58;...".
     *
     * This regular expression was taken from the Closure sanitization library.
     */
    var SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi;
    function sanitizeUrl(url) {
        url = String(url);
        if (url.match(SAFE_URL_PATTERN))
            return url;
        if (assertionsEnabled$1()) {
            getDOM().log('WARNING: sanitizing unsafe URL value ' + url);
        }
        return 'unsafe:' + url;
    }
    /** A <body> element that can be safely used to parse untrusted HTML. Lazily initialized below. */
    var inertElement = null;
    /** Lazily initialized to make sure the DOM adapter gets set before use. */
    var DOM = null;
    /** Returns an HTML element that is guaranteed to not execute code when creating elements in it. */
    function getInertElement() {
        if (inertElement)
            return inertElement;
        DOM = getDOM();
        // Prefer using <template> element if supported.
        var templateEl = DOM.createElement('template');
        if ('content' in templateEl)
            return templateEl;
        var doc = DOM.createHtmlDocument();
        inertElement = DOM.querySelector(doc, 'body');
        if (inertElement == null) {
            // usually there should be only one body element in the document, but IE doesn't have any, so we
            // need to create one.
            var html = DOM.createElement('html', doc);
            inertElement = DOM.createElement('body', doc);
            DOM.appendChild(html, inertElement);
            DOM.appendChild(doc, html);
        }
        return inertElement;
    }
    function tagSet(tags) {
        var res = {};
        for (var _i = 0, _a = tags.split(','); _i < _a.length; _i++) {
            var t = _a[_i];
            res[t.toLowerCase()] = true;
        }
        return res;
    }
    function merge() {
        var sets = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            sets[_i - 0] = arguments[_i];
        }
        var res = {};
        for (var _a = 0, sets_1 = sets; _a < sets_1.length; _a++) {
            var s = sets_1[_a];
            for (var v in s) {
                if (s.hasOwnProperty(v))
                    res[v] = true;
            }
        }
        return res;
    }
    // Good source of info about elements and attributes
    // http://dev.w3.org/html5/spec/Overview.html#semantics
    // http://simon.html5.org/html-elements
    // Safe Void Elements - HTML5
    // http://dev.w3.org/html5/spec/Overview.html#void-elements
    var VOID_ELEMENTS = tagSet('area,br,col,hr,img,wbr');
    // Elements that you can, intentionally, leave open (and which close themselves)
    // http://dev.w3.org/html5/spec/Overview.html#optional-tags
    var OPTIONAL_END_TAG_BLOCK_ELEMENTS = tagSet('colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr');
    var OPTIONAL_END_TAG_INLINE_ELEMENTS = tagSet('rp,rt');
    var OPTIONAL_END_TAG_ELEMENTS = merge(OPTIONAL_END_TAG_INLINE_ELEMENTS, OPTIONAL_END_TAG_BLOCK_ELEMENTS);
    // Safe Block Elements - HTML5
    var BLOCK_ELEMENTS = merge(OPTIONAL_END_TAG_BLOCK_ELEMENTS, tagSet('address,article,' +
        'aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,' +
        'h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,section,table,ul'));
    // Inline Elements - HTML5
    var INLINE_ELEMENTS = merge(OPTIONAL_END_TAG_INLINE_ELEMENTS, tagSet('a,abbr,acronym,b,' +
        'bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,' +
        'samp,small,span,strike,strong,sub,sup,time,tt,u,var'));
    var VALID_ELEMENTS = merge(VOID_ELEMENTS, BLOCK_ELEMENTS, INLINE_ELEMENTS, OPTIONAL_END_TAG_ELEMENTS);
    // Attributes that have href and hence need to be sanitized
    var URI_ATTRS = tagSet('background,cite,href,longdesc,src,xlink:href');
    var HTML_ATTRS = tagSet('abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,' +
        'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,' +
        'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,' +
        'scope,scrolling,shape,size,span,start,summary,tabindex,target,title,type,' +
        'valign,value,vspace,width');
    // NB: This currently conciously doesn't support SVG. SVG sanitization has had several security
    // issues in the past, so it seems safer to leave it out if possible. If support for binding SVG via
    // innerHTML is required, SVG attributes should be added here.
    // NB: Sanitization does not allow <form> elements or other active elements (<button> etc). Those
    // can be sanitized, but they increase security surface area without a legitimate use case, so they
    // are left out here.
    var VALID_ATTRS = merge(URI_ATTRS, HTML_ATTRS);
    /**
     * SanitizingHtmlSerializer serializes a DOM fragment, stripping out any unsafe elements and unsafe
     * attributes.
     */
    var SanitizingHtmlSerializer = (function () {
        function SanitizingHtmlSerializer() {
            this.buf = [];
        }
        SanitizingHtmlSerializer.prototype.sanitizeChildren = function (el) {
            // This cannot use a TreeWalker, as it has to run on Angular's various DOM adapters.
            // However this code never accesses properties off of `document` before deleting its contents
            // again, so it shouldn't be vulnerable to DOM clobbering.
            var current = el.firstChild;
            while (current) {
                if (DOM.isElementNode(current)) {
                    this.startElement(current);
                }
                else if (DOM.isTextNode(current)) {
                    this.chars(DOM.nodeValue(current));
                }
                if (DOM.firstChild(current)) {
                    current = DOM.firstChild(current);
                    continue;
                }
                while (current) {
                    // Leaving the element. Walk up and to the right, closing tags as we go.
                    if (DOM.isElementNode(current)) {
                        this.endElement(DOM.nodeName(current).toLowerCase());
                    }
                    if (DOM.nextSibling(current)) {
                        current = DOM.nextSibling(current);
                        break;
                    }
                    current = DOM.parentElement(current);
                }
            }
            return this.buf.join('');
        };
        SanitizingHtmlSerializer.prototype.startElement = function (element) {
            var _this = this;
            var tagName = DOM.nodeName(element).toLowerCase();
            tagName = tagName.toLowerCase();
            if (VALID_ELEMENTS.hasOwnProperty(tagName)) {
                this.buf.push('<');
                this.buf.push(tagName);
                DOM.attributeMap(element).forEach(function (value, attrName) {
                    var lower = attrName.toLowerCase();
                    if (!VALID_ATTRS.hasOwnProperty(lower))
                        return;
                    // TODO(martinprobst): Special case image URIs for data:image/...
                    if (URI_ATTRS[lower])
                        value = sanitizeUrl(value);
                    _this.buf.push(' ');
                    _this.buf.push(attrName);
                    _this.buf.push('="');
                    _this.buf.push(encodeEntities(value));
                    _this.buf.push('"');
                });
                this.buf.push('>');
            }
        };
        SanitizingHtmlSerializer.prototype.endElement = function (tagName) {
            tagName = tagName.toLowerCase();
            if (VALID_ELEMENTS.hasOwnProperty(tagName) && !VOID_ELEMENTS.hasOwnProperty(tagName)) {
                this.buf.push('</');
                this.buf.push(tagName);
                this.buf.push('>');
            }
        };
        SanitizingHtmlSerializer.prototype.chars = function (chars) { this.buf.push(encodeEntities(chars)); };
        return SanitizingHtmlSerializer;
    }());
    // Regular Expressions for parsing tags and attributes
    var SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    // ! to ~ is the ASCII range.
    var NON_ALPHANUMERIC_REGEXP = /([^\#-~ |!])/g;
    /**
     * Escapes all potentially dangerous characters, so that the
     * resulting string can be safely inserted into attribute or
     * element text.
     * @param value
     * @returns {string} escaped text
     */
    function encodeEntities(value) {
        return value.replace(/&/g, '&amp;')
            .replace(SURROGATE_PAIR_REGEXP, function (match) {
            var hi = match.charCodeAt(0);
            var low = match.charCodeAt(1);
            return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
        })
            .replace(NON_ALPHANUMERIC_REGEXP, function (match) { return '&#' + match.charCodeAt(0) + ';'; })
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    /**
     * When IE9-11 comes across an unknown namespaced attribute e.g. 'xlink:foo' it adds 'xmlns:ns1'
     * attribute to declare ns1 namespace and prefixes the attribute with 'ns1' (e.g. 'ns1:xlink:foo').
     *
     * This is undesirable since we don't want to allow any of these custom attributes. This method
     * strips them all.
     */
    function stripCustomNsAttrs(el) {
        DOM.attributeMap(el).forEach(function (_, attrName) {
            if (attrName === 'xmlns:ns1' || attrName.indexOf('ns1:') === 0) {
                DOM.removeAttribute(el, attrName);
            }
        });
        for (var _i = 0, _a = DOM.childNodesAsList(el); _i < _a.length; _i++) {
            var n = _a[_i];
            if (DOM.isElementNode(n))
                stripCustomNsAttrs(n);
        }
    }
    /**
     * Sanitizes the given unsafe, untrusted HTML fragment, and returns HTML text that is safe to add to
     * the DOM in a browser environment.
     */
    function sanitizeHtml(unsafeHtml) {
        try {
            var containerEl = getInertElement();
            // Make sure unsafeHtml is actually a string (TypeScript types are not enforced at runtime).
            unsafeHtml = unsafeHtml ? String(unsafeHtml) : '';
            // mXSS protection. Repeatedly parse the document to make sure it stabilizes, so that a browser
            // trying to auto-correct incorrect HTML cannot cause formerly inert HTML to become dangerous.
            var mXSSAttempts = 5;
            var parsedHtml = unsafeHtml;
            do {
                if (mXSSAttempts === 0) {
                    throw new Error('Failed to sanitize html because the input is unstable');
                }
                mXSSAttempts--;
                unsafeHtml = parsedHtml;
                DOM.setInnerHTML(containerEl, unsafeHtml);
                if (DOM.defaultDoc().documentMode) {
                    // strip custom-namespaced attributes on IE<=11
                    stripCustomNsAttrs(containerEl);
                }
                parsedHtml = DOM.getInnerHTML(containerEl);
            } while (unsafeHtml !== parsedHtml);
            var sanitizer = new SanitizingHtmlSerializer();
            var safeHtml = sanitizer.sanitizeChildren(DOM.getTemplateContent(containerEl) || containerEl);
            // Clear out the body element.
            var parent_1 = DOM.getTemplateContent(containerEl) || containerEl;
            for (var _i = 0, _a = DOM.childNodesAsList(parent_1); _i < _a.length; _i++) {
                var child = _a[_i];
                DOM.removeChild(parent_1, child);
            }
            if (assertionsEnabled$1() && safeHtml !== unsafeHtml) {
                DOM.log('WARNING: sanitizing HTML stripped some content.');
            }
            return safeHtml;
        }
        catch (e) {
            // In case anything goes wrong, clear out inertElement to reset the entire DOM structure.
            inertElement = null;
            throw e;
        }
    }
    /**
     * Regular expression for safe style values.
     *
     * Quotes (" and ') are allowed, but a check must be done elsewhere to ensure they're balanced.
     *
     * ',' allows multiple values to be assigned to the same property (e.g. background-attachment or
     * font-family) and hence could allow multiple values to get injected, but that should pose no risk
     * of XSS.
     *
     * The function expression checks only for XSS safety, not for CSS validity.
     *
     * This regular expression was taken from the Closure sanitization library, and augmented for
     * transformation values.
     */
    var VALUES = '[-,."\'%_!# a-zA-Z0-9]+';
    var TRANSFORMATION_FNS = '(?:matrix|translate|scale|rotate|skew|perspective)(?:X|Y|3d)?';
    var COLOR_FNS = '(?:rgb|hsl)a?';
    var FN_ARGS = '\\([-0-9.%, a-zA-Z]+\\)';
    var SAFE_STYLE_VALUE = new RegExp("^(" + VALUES + "|(?:" + TRANSFORMATION_FNS + "|" + COLOR_FNS + ")" + FN_ARGS + ")$", 'g');
    /**
     * Checks that quotes (" and ') are properly balanced inside a string. Assumes
     * that neither escape (\) nor any other character that could result in
     * breaking out of a string parsing context are allowed;
     * see http://www.w3.org/TR/css3-syntax/#string-token-diagram.
     *
     * This code was taken from the Closure sanitization library.
     */
    function hasBalancedQuotes(value) {
        var outsideSingle = true;
        var outsideDouble = true;
        for (var i = 0; i < value.length; i++) {
            var c = value.charAt(i);
            if (c === '\'' && outsideDouble) {
                outsideSingle = !outsideSingle;
            }
            else if (c === '"' && outsideSingle) {
                outsideDouble = !outsideDouble;
            }
        }
        return outsideSingle && outsideDouble;
    }
    /**
     * Sanitizes the given untrusted CSS style property value (i.e. not an entire object, just a single
     * value) and returns a value that is safe to use in a browser environment.
     */
    function sanitizeStyle(value) {
        value = String(value).trim(); // Make sure it's actually a string.
        if (value.match(SAFE_STYLE_VALUE) && hasBalancedQuotes(value))
            return value;
        if (assertionsEnabled$1()) {
            getDOM().log('WARNING: sanitizing unsafe style value ' + value);
        }
        return 'unsafe';
    }
    /**
     * DomSanitizationService helps preventing Cross Site Scripting Security bugs (XSS) by sanitizing
     * values to be safe to use in the different DOM contexts.
     *
     * For example, when binding a URL in an `<a [href]="someValue">` hyperlink, `someValue` will be
     * sanitized so that an attacker cannot inject e.g. a `javascript:` URL that would execute code on
     * the website.
     *
     * In specific situations, it might be necessary to disable sanitization, for example if the
     * application genuinely needs to produce a `javascript:` style link with a dynamic value in it.
     * Users can bypass security by constructing a value with one of the `bypassSecurityTrust...`
     * methods, and then binding to that value from the template.
     *
     * These situations should be very rare, and extraordinary care must be taken to avoid creating a
     * Cross Site Scripting (XSS) security bug!
     *
     * When using `bypassSecurityTrust...`, make sure to call the method as early as possible and as
     * close as possible to the source of the value, to make it easy to verify no security bug is
     * created by its use.
     *
     * It is not required (and not recommended) to bypass security if the value is safe, e.g. a URL that
     * does not start with a suspicious protocol, or an HTML snippet that does not contain dangerous
     * code. The sanitizer leaves safe values intact.
     */
    var DomSanitizationService = (function () {
        function DomSanitizationService() {
        }
        return DomSanitizationService;
    }());
    var DomSanitizationServiceImpl = (function (_super) {
        __extends(DomSanitizationServiceImpl, _super);
        function DomSanitizationServiceImpl() {
            _super.apply(this, arguments);
        }
        DomSanitizationServiceImpl.prototype.sanitize = function (ctx, value) {
            if (value == null)
                return null;
            switch (ctx) {
                case SecurityContext$1.NONE:
                    return value;
                case SecurityContext$1.HTML:
                    if (value instanceof SafeHtmlImpl)
                        return value.changingThisBreaksApplicationSecurity;
                    this.checkNotSafeValue(value, 'HTML');
                    return sanitizeHtml(String(value));
                case SecurityContext$1.STYLE:
                    if (value instanceof SafeStyleImpl)
                        return value.changingThisBreaksApplicationSecurity;
                    this.checkNotSafeValue(value, 'Style');
                    return sanitizeStyle(value);
                case SecurityContext$1.SCRIPT:
                    if (value instanceof SafeScriptImpl)
                        return value.changingThisBreaksApplicationSecurity;
                    this.checkNotSafeValue(value, 'Script');
                    throw new Error('unsafe value used in a script context');
                case SecurityContext$1.URL:
                    if (value instanceof SafeUrlImpl)
                        return value.changingThisBreaksApplicationSecurity;
                    this.checkNotSafeValue(value, 'URL');
                    return sanitizeUrl(String(value));
                case SecurityContext$1.RESOURCE_URL:
                    if (value instanceof SafeResourceUrlImpl) {
                        return value.changingThisBreaksApplicationSecurity;
                    }
                    this.checkNotSafeValue(value, 'ResourceURL');
                    throw new Error('unsafe value used in a resource URL context');
                default:
                    throw new Error("Unexpected SecurityContext " + ctx);
            }
        };
        DomSanitizationServiceImpl.prototype.checkNotSafeValue = function (value, expectedType) {
            if (value instanceof SafeValueImpl) {
                throw new Error('Required a safe ' + expectedType + ', got a ' + value.getTypeName());
            }
        };
        DomSanitizationServiceImpl.prototype.bypassSecurityTrustHtml = function (value) { return new SafeHtmlImpl(value); };
        DomSanitizationServiceImpl.prototype.bypassSecurityTrustStyle = function (value) { return new SafeStyleImpl(value); };
        DomSanitizationServiceImpl.prototype.bypassSecurityTrustScript = function (value) { return new SafeScriptImpl(value); };
        DomSanitizationServiceImpl.prototype.bypassSecurityTrustUrl = function (value) { return new SafeUrlImpl(value); };
        DomSanitizationServiceImpl.prototype.bypassSecurityTrustResourceUrl = function (value) {
            return new SafeResourceUrlImpl(value);
        };
        return DomSanitizationServiceImpl;
    }(DomSanitizationService));
    DomSanitizationServiceImpl.decorators = [
        { type: Injectable },
    ];
    var SafeValueImpl = (function () {
        function SafeValueImpl(changingThisBreaksApplicationSecurity) {
            this.changingThisBreaksApplicationSecurity = changingThisBreaksApplicationSecurity;
            // empty
        }
        return SafeValueImpl;
    }());
    var SafeHtmlImpl = (function (_super) {
        __extends(SafeHtmlImpl, _super);
        function SafeHtmlImpl() {
            _super.apply(this, arguments);
        }
        SafeHtmlImpl.prototype.getTypeName = function () { return 'HTML'; };
        return SafeHtmlImpl;
    }(SafeValueImpl));
    var SafeStyleImpl = (function (_super) {
        __extends(SafeStyleImpl, _super);
        function SafeStyleImpl() {
            _super.apply(this, arguments);
        }
        SafeStyleImpl.prototype.getTypeName = function () { return 'Style'; };
        return SafeStyleImpl;
    }(SafeValueImpl));
    var SafeScriptImpl = (function (_super) {
        __extends(SafeScriptImpl, _super);
        function SafeScriptImpl() {
            _super.apply(this, arguments);
        }
        SafeScriptImpl.prototype.getTypeName = function () { return 'Script'; };
        return SafeScriptImpl;
    }(SafeValueImpl));
    var SafeUrlImpl = (function (_super) {
        __extends(SafeUrlImpl, _super);
        function SafeUrlImpl() {
            _super.apply(this, arguments);
        }
        SafeUrlImpl.prototype.getTypeName = function () { return 'URL'; };
        return SafeUrlImpl;
    }(SafeValueImpl));
    var SafeResourceUrlImpl = (function (_super) {
        __extends(SafeResourceUrlImpl, _super);
        function SafeResourceUrlImpl() {
            _super.apply(this, arguments);
        }
        SafeResourceUrlImpl.prototype.getTypeName = function () { return 'ResourceURL'; };
        return SafeResourceUrlImpl;
    }(SafeValueImpl));
    var Map$3 = global$2.Map;
    var Set$3 = global$2.Set;
    // Safari and Internet Explorer do not support the iterable parameter to the
    // Map constructor.  We work around that by manually adding the items.
    var createMapFromPairs$2 = (function () {
        try {
            if (new Map$3([[1, 2]]).size === 1) {
                return function createMapFromPairs(pairs) { return new Map$3(pairs); };
            }
        }
        catch (e) {
        }
        return function createMapAndPopulateFromPairs(pairs) {
            var map = new Map$3();
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                map.set(pair[0], pair[1]);
            }
            return map;
        };
    })();
    var createMapFromMap$2 = (function () {
        try {
            if (new Map$3(new Map$3())) {
                return function createMapFromMap(m) { return new Map$3(m); };
            }
        }
        catch (e) {
        }
        return function createMapAndPopulateFromMap(m) {
            var map = new Map$3();
            m.forEach(function (v, k) { map.set(k, v); });
            return map;
        };
    })();
    var _clearValues$2 = (function () {
        if ((new Map$3()).keys().next) {
            return function _clearValues(m) {
                var keyIterator = m.keys();
                var k;
                while (!((k = keyIterator.next()).done)) {
                    m.set(k.value, null);
                }
            };
        }
        else {
            return function _clearValuesWithForeEach(m) {
                m.forEach(function (v, k) { m.set(k, null); });
            };
        }
    })();
    // Safari doesn't implement MapIterator.next(), which is used is Traceur's polyfill of Array.from
    // TODO(mlaval): remove the work around once we have a working polyfill of Array.from
    var _arrayFromMap$2 = (function () {
        try {
            if ((new Map$3()).values().next) {
                return function createArrayFromMap(m, getValues) {
                    return getValues ? Array.from(m.values()) : Array.from(m.keys());
                };
            }
        }
        catch (e) {
        }
        return function createArrayFromMapWithForeach(m, getValues) {
            var res = ListWrapper$2.createFixedSize(m.size), i = 0;
            m.forEach(function (v, k) {
                res[i] = getValues ? v : k;
                i++;
            });
            return res;
        };
    })();
    /**
     * Wraps Javascript Objects
     */
    var StringMapWrapper$2 = (function () {
        function StringMapWrapper$2() {
        }
        StringMapWrapper$2.create = function () {
            // Note: We are not using Object.create(null) here due to
            // performance!
            // http://jsperf.com/ng2-object-create-null
            return {};
        };
        StringMapWrapper$2.contains = function (map, key) {
            return map.hasOwnProperty(key);
        };
        StringMapWrapper$2.get = function (map, key) {
            return map.hasOwnProperty(key) ? map[key] : undefined;
        };
        StringMapWrapper$2.set = function (map, key, value) { map[key] = value; };
        StringMapWrapper$2.keys = function (map) { return Object.keys(map); };
        StringMapWrapper$2.values = function (map) {
            return Object.keys(map).reduce(function (r, a) {
                r.push(map[a]);
                return r;
            }, []);
        };
        StringMapWrapper$2.isEmpty = function (map) {
            for (var prop in map) {
                return false;
            }
            return true;
        };
        StringMapWrapper$2.delete = function (map, key) { delete map[key]; };
        StringMapWrapper$2.forEach = function (map, callback) {
            for (var prop in map) {
                if (map.hasOwnProperty(prop)) {
                    callback(map[prop], prop);
                }
            }
        };
        StringMapWrapper$2.merge = function (m1, m2) {
            var m = {};
            for (var attr in m1) {
                if (m1.hasOwnProperty(attr)) {
                    m[attr] = m1[attr];
                }
            }
            for (var attr in m2) {
                if (m2.hasOwnProperty(attr)) {
                    m[attr] = m2[attr];
                }
            }
            return m;
        };
        StringMapWrapper$2.equals = function (m1, m2) {
            var k1 = Object.keys(m1);
            var k2 = Object.keys(m2);
            if (k1.length != k2.length) {
                return false;
            }
            var key;
            for (var i = 0; i < k1.length; i++) {
                key = k1[i];
                if (m1[key] !== m2[key]) {
                    return false;
                }
            }
            return true;
        };
        return StringMapWrapper$2;
    }());
    var ListWrapper$2 = (function () {
        function ListWrapper$2() {
        }
        // JS has no way to express a statically fixed size list, but dart does so we
        // keep both methods.
        ListWrapper$2.createFixedSize = function (size) { return new Array(size); };
        ListWrapper$2.createGrowableSize = function (size) { return new Array(size); };
        ListWrapper$2.clone = function (array) { return array.slice(0); };
        ListWrapper$2.forEachWithIndex = function (array, fn) {
            for (var i = 0; i < array.length; i++) {
                fn(array[i], i);
            }
        };
        ListWrapper$2.first = function (array) {
            if (!array)
                return null;
            return array[0];
        };
        ListWrapper$2.last = function (array) {
            if (!array || array.length == 0)
                return null;
            return array[array.length - 1];
        };
        ListWrapper$2.indexOf = function (array, value, startIndex) {
            if (startIndex === void 0) { startIndex = 0; }
            return array.indexOf(value, startIndex);
        };
        ListWrapper$2.contains = function (list, el) { return list.indexOf(el) !== -1; };
        ListWrapper$2.reversed = function (array) {
            var a = ListWrapper$2.clone(array);
            return a.reverse();
        };
        ListWrapper$2.concat = function (a, b) { return a.concat(b); };
        ListWrapper$2.insert = function (list, index, value) { list.splice(index, 0, value); };
        ListWrapper$2.removeAt = function (list, index) {
            var res = list[index];
            list.splice(index, 1);
            return res;
        };
        ListWrapper$2.removeAll = function (list, items) {
            for (var i = 0; i < items.length; ++i) {
                var index = list.indexOf(items[i]);
                list.splice(index, 1);
            }
        };
        ListWrapper$2.remove = function (list, el) {
            var index = list.indexOf(el);
            if (index > -1) {
                list.splice(index, 1);
                return true;
            }
            return false;
        };
        ListWrapper$2.clear = function (list) { list.length = 0; };
        ListWrapper$2.isEmpty = function (list) { return list.length == 0; };
        ListWrapper$2.fill = function (list, value, start, end) {
            if (start === void 0) { start = 0; }
            if (end === void 0) { end = null; }
            list.fill(value, start, end === null ? list.length : end);
        };
        ListWrapper$2.equals = function (a, b) {
            if (a.length != b.length)
                return false;
            for (var i = 0; i < a.length; ++i) {
                if (a[i] !== b[i])
                    return false;
            }
            return true;
        };
        ListWrapper$2.slice = function (l, from, to) {
            if (from === void 0) { from = 0; }
            if (to === void 0) { to = null; }
            return l.slice(from, to === null ? undefined : to);
        };
        ListWrapper$2.splice = function (l, from, length) { return l.splice(from, length); };
        ListWrapper$2.sort = function (l, compareFn) {
            if (isPresent$1(compareFn)) {
                l.sort(compareFn);
            }
            else {
                l.sort();
            }
        };
        ListWrapper$2.toString = function (l) { return l.toString(); };
        ListWrapper$2.toJSON = function (l) { return JSON.stringify(l); };
        ListWrapper$2.maximum = function (list, predicate) {
            if (list.length == 0) {
                return null;
            }
            var solution = null;
            var maxValue = -Infinity;
            for (var index = 0; index < list.length; index++) {
                var candidate = list[index];
                if (isBlank$1(candidate)) {
                    continue;
                }
                var candidateValue = predicate(candidate);
                if (candidateValue > maxValue) {
                    solution = candidate;
                    maxValue = candidateValue;
                }
            }
            return solution;
        };
        ListWrapper$2.flatten = function (list) {
            var target = [];
            _flattenArray$2(list, target);
            return target;
        };
        ListWrapper$2.addAll = function (list, source) {
            for (var i = 0; i < source.length; i++) {
                list.push(source[i]);
            }
        };
        return ListWrapper$2;
    }());
    function _flattenArray$2(source, target) {
        if (isPresent$1(source)) {
            for (var i = 0; i < source.length; i++) {
                var item = source[i];
                if (isArray$2(item)) {
                    _flattenArray$2(item, target);
                }
                else {
                    target.push(item);
                }
            }
        }
        return target;
    }
    // Safari and Internet Explorer do not support the iterable parameter to the
    // Set constructor.  We work around that by manually adding the items.
    var createSetFromList$2 = (function () {
        var test = new Set$3([1, 2, 3]);
        if (test.size === 3) {
            return function createSetFromList(lst) { return new Set$3(lst); };
        }
        else {
            return function createSetAndPopulateFromList(lst) {
                var res = new Set$3(lst);
                if (res.size !== lst.length) {
                    for (var i = 0; i < lst.length; i++) {
                        res.add(lst[i]);
                    }
                }
                return res;
            };
        }
    })();
    var SetWrapper$2 = (function () {
        function SetWrapper$2() {
        }
        SetWrapper$2.createFromList = function (lst) { return createSetFromList$2(lst); };
        SetWrapper$2.has = function (s, key) { return s.has(key); };
        SetWrapper$2.delete = function (m, k) { m.delete(k); };
        return SetWrapper$2;
    }());
    /**
     * Provides DOM operations in any browser environment.
     */
    var GenericBrowserDomAdapter = (function (_super) {
        __extends(GenericBrowserDomAdapter, _super);
        function GenericBrowserDomAdapter() {
            var _this = this;
            _super.call(this);
            this._animationPrefix = null;
            this._transitionEnd = null;
            try {
                var element = this.createElement('div', this.defaultDoc());
                if (isPresent$1(this.getStyle(element, 'animationName'))) {
                    this._animationPrefix = '';
                }
                else {
                    var domPrefixes = ['Webkit', 'Moz', 'O', 'ms'];
                    for (var i = 0; i < domPrefixes.length; i++) {
                        if (isPresent$1(this.getStyle(element, domPrefixes[i] + 'AnimationName'))) {
                            this._animationPrefix = '-' + domPrefixes[i].toLowerCase() + '-';
                            break;
                        }
                    }
                }
                var transEndEventNames = {
                    WebkitTransition: 'webkitTransitionEnd',
                    MozTransition: 'transitionend',
                    OTransition: 'oTransitionEnd otransitionend',
                    transition: 'transitionend'
                };
                StringMapWrapper$2.forEach(transEndEventNames, function (value, key) {
                    if (isPresent$1(_this.getStyle(element, key))) {
                        _this._transitionEnd = value;
                    }
                });
            }
            catch (e) {
                this._animationPrefix = null;
                this._transitionEnd = null;
            }
        }
        GenericBrowserDomAdapter.prototype.getDistributedNodes = function (el) { return el.getDistributedNodes(); };
        GenericBrowserDomAdapter.prototype.resolveAndSetHref = function (el, baseUrl, href) {
            el.href = href == null ? baseUrl : baseUrl + '/../' + href;
        };
        GenericBrowserDomAdapter.prototype.supportsDOMEvents = function () { return true; };
        GenericBrowserDomAdapter.prototype.supportsNativeShadowDOM = function () {
            return isFunction$2(this.defaultDoc().body.createShadowRoot);
        };
        GenericBrowserDomAdapter.prototype.getAnimationPrefix = function () {
            return isPresent$1(this._animationPrefix) ? this._animationPrefix : "";
        };
        GenericBrowserDomAdapter.prototype.getTransitionEnd = function () { return isPresent$1(this._transitionEnd) ? this._transitionEnd : ""; };
        GenericBrowserDomAdapter.prototype.supportsAnimation = function () {
            return isPresent$1(this._animationPrefix) && isPresent$1(this._transitionEnd);
        };
        return GenericBrowserDomAdapter;
    }(DomAdapter));
    var _attrToPropMap = {
        'class': 'className',
        'innerHtml': 'innerHTML',
        'readonly': 'readOnly',
        'tabindex': 'tabIndex'
    };
    var DOM_KEY_LOCATION_NUMPAD = 3;
    // Map to convert some key or keyIdentifier values to what will be returned by getEventKey
    var _keyMap = {
        // The following values are here for cross-browser compatibility and to match the W3C standard
        // cf http://www.w3.org/TR/DOM-Level-3-Events-key/
        '\b': 'Backspace',
        '\t': 'Tab',
        '\x7F': 'Delete',
        '\x1B': 'Escape',
        'Del': 'Delete',
        'Esc': 'Escape',
        'Left': 'ArrowLeft',
        'Right': 'ArrowRight',
        'Up': 'ArrowUp',
        'Down': 'ArrowDown',
        'Menu': 'ContextMenu',
        'Scroll': 'ScrollLock',
        'Win': 'OS'
    };
    // There is a bug in Chrome for numeric keypad keys:
    // https://code.google.com/p/chromium/issues/detail?id=155654
    // 1, 2, 3 ... are reported as A, B, C ...
    var _chromeNumKeyPadMap = {
        'A': '1',
        'B': '2',
        'C': '3',
        'D': '4',
        'E': '5',
        'F': '6',
        'G': '7',
        'H': '8',
        'I': '9',
        'J': '*',
        'K': '+',
        'M': '-',
        'N': '.',
        'O': '/',
        '\x60': '0',
        '\x90': 'NumLock'
    };
    /**
     * A `DomAdapter` powered by full browser DOM APIs.
     */
    /* tslint:disable:requireParameterType */
    var BrowserDomAdapter = (function (_super) {
        __extends(BrowserDomAdapter, _super);
        function BrowserDomAdapter() {
            _super.apply(this, arguments);
        }
        BrowserDomAdapter.prototype.parse = function (templateHtml) { throw new Error("parse not implemented"); };
        BrowserDomAdapter.makeCurrent = function () { setRootDomAdapter(new BrowserDomAdapter()); };
        BrowserDomAdapter.prototype.hasProperty = function (element, name) { return name in element; };
        BrowserDomAdapter.prototype.setProperty = function (el, name, value) { el[name] = value; };
        BrowserDomAdapter.prototype.getProperty = function (el, name) { return el[name]; };
        BrowserDomAdapter.prototype.invoke = function (el, methodName, args) {
            el[methodName].apply(el, args);
        };
        // TODO(tbosch): move this into a separate environment class once we have it
        BrowserDomAdapter.prototype.logError = function (error) {
            if (window.console.error) {
                window.console.error(error);
            }
            else {
                window.console.log(error);
            }
        };
        BrowserDomAdapter.prototype.log = function (error) { window.console.log(error); };
        BrowserDomAdapter.prototype.logGroup = function (error) {
            if (window.console.group) {
                window.console.group(error);
                this.logError(error);
            }
            else {
                window.console.log(error);
            }
        };
        BrowserDomAdapter.prototype.logGroupEnd = function () {
            if (window.console.groupEnd) {
                window.console.groupEnd();
            }
        };
        Object.defineProperty(BrowserDomAdapter.prototype, "attrToPropMap", {
            get: function () { return _attrToPropMap; },
            enumerable: true,
            configurable: true
        });
        BrowserDomAdapter.prototype.query = function (selector) { return document.querySelector(selector); };
        BrowserDomAdapter.prototype.querySelector = function (el, selector) { return el.querySelector(selector); };
        BrowserDomAdapter.prototype.querySelectorAll = function (el, selector) { return el.querySelectorAll(selector); };
        BrowserDomAdapter.prototype.on = function (el, evt, listener) { el.addEventListener(evt, listener, false); };
        BrowserDomAdapter.prototype.onAndCancel = function (el, evt, listener) {
            el.addEventListener(evt, listener, false);
            // Needed to follow Dart's subscription semantic, until fix of
            // https://code.google.com/p/dart/issues/detail?id=17406
            return function () { el.removeEventListener(evt, listener, false); };
        };
        BrowserDomAdapter.prototype.dispatchEvent = function (el, evt) { el.dispatchEvent(evt); };
        BrowserDomAdapter.prototype.createMouseEvent = function (eventType) {
            var evt = document.createEvent('MouseEvent');
            evt.initEvent(eventType, true, true);
            return evt;
        };
        BrowserDomAdapter.prototype.createEvent = function (eventType) {
            var evt = document.createEvent('Event');
            evt.initEvent(eventType, true, true);
            return evt;
        };
        BrowserDomAdapter.prototype.preventDefault = function (evt) {
            evt.preventDefault();
            evt.returnValue = false;
        };
        BrowserDomAdapter.prototype.isPrevented = function (evt) {
            return evt.defaultPrevented || isPresent$1(evt.returnValue) && !evt.returnValue;
        };
        BrowserDomAdapter.prototype.getInnerHTML = function (el) { return el.innerHTML; };
        BrowserDomAdapter.prototype.getTemplateContent = function (el) {
            return 'content' in el && el instanceof HTMLTemplateElement ? el.content : null;
        };
        BrowserDomAdapter.prototype.getOuterHTML = function (el) { return el.outerHTML; };
        BrowserDomAdapter.prototype.nodeName = function (node) { return node.nodeName; };
        BrowserDomAdapter.prototype.nodeValue = function (node) { return node.nodeValue; };
        BrowserDomAdapter.prototype.type = function (node) { return node.type; };
        BrowserDomAdapter.prototype.content = function (node) {
            if (this.hasProperty(node, "content")) {
                return node.content;
            }
            else {
                return node;
            }
        };
        BrowserDomAdapter.prototype.firstChild = function (el) { return el.firstChild; };
        BrowserDomAdapter.prototype.nextSibling = function (el) { return el.nextSibling; };
        BrowserDomAdapter.prototype.parentElement = function (el) { return el.parentNode; };
        BrowserDomAdapter.prototype.childNodes = function (el) { return el.childNodes; };
        BrowserDomAdapter.prototype.childNodesAsList = function (el) {
            var childNodes = el.childNodes;
            var res = ListWrapper$2.createFixedSize(childNodes.length);
            for (var i = 0; i < childNodes.length; i++) {
                res[i] = childNodes[i];
            }
            return res;
        };
        BrowserDomAdapter.prototype.clearNodes = function (el) {
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }
        };
        BrowserDomAdapter.prototype.appendChild = function (el, node) { el.appendChild(node); };
        BrowserDomAdapter.prototype.removeChild = function (el, node) { el.removeChild(node); };
        BrowserDomAdapter.prototype.replaceChild = function (el, newChild, oldChild) { el.replaceChild(newChild, oldChild); };
        BrowserDomAdapter.prototype.remove = function (node) {
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
            return node;
        };
        BrowserDomAdapter.prototype.insertBefore = function (el, node) { el.parentNode.insertBefore(node, el); };
        BrowserDomAdapter.prototype.insertAllBefore = function (el, nodes) { nodes.forEach(function (n) { return el.parentNode.insertBefore(n, el); }); };
        BrowserDomAdapter.prototype.insertAfter = function (el, node) { el.parentNode.insertBefore(node, el.nextSibling); };
        BrowserDomAdapter.prototype.setInnerHTML = function (el, value) { el.innerHTML = value; };
        BrowserDomAdapter.prototype.getText = function (el) { return el.textContent; };
        // TODO(vicb): removed Element type because it does not support StyleElement
        BrowserDomAdapter.prototype.setText = function (el, value) { el.textContent = value; };
        BrowserDomAdapter.prototype.getValue = function (el) { return el.value; };
        BrowserDomAdapter.prototype.setValue = function (el, value) { el.value = value; };
        BrowserDomAdapter.prototype.getChecked = function (el) { return el.checked; };
        BrowserDomAdapter.prototype.setChecked = function (el, value) { el.checked = value; };
        BrowserDomAdapter.prototype.createComment = function (text) { return document.createComment(text); };
        BrowserDomAdapter.prototype.createTemplate = function (html) {
            var t = document.createElement('template');
            t.innerHTML = html;
            return t;
        };
        BrowserDomAdapter.prototype.createElement = function (tagName, doc) {
            if (doc === void 0) { doc = document; }
            return doc.createElement(tagName);
        };
        BrowserDomAdapter.prototype.createElementNS = function (ns, tagName, doc) {
            if (doc === void 0) { doc = document; }
            return doc.createElementNS(ns, tagName);
        };
        BrowserDomAdapter.prototype.createTextNode = function (text, doc) {
            if (doc === void 0) { doc = document; }
            return doc.createTextNode(text);
        };
        BrowserDomAdapter.prototype.createScriptTag = function (attrName, attrValue, doc) {
            if (doc === void 0) { doc = document; }
            var el = doc.createElement('SCRIPT');
            el.setAttribute(attrName, attrValue);
            return el;
        };
        BrowserDomAdapter.prototype.createStyleElement = function (css, doc) {
            if (doc === void 0) { doc = document; }
            var style = doc.createElement('style');
            this.appendChild(style, this.createTextNode(css));
            return style;
        };
        BrowserDomAdapter.prototype.createShadowRoot = function (el) { return el.createShadowRoot(); };
        BrowserDomAdapter.prototype.getShadowRoot = function (el) { return el.shadowRoot; };
        BrowserDomAdapter.prototype.getHost = function (el) { return el.host; };
        BrowserDomAdapter.prototype.clone = function (node) { return node.cloneNode(true); };
        BrowserDomAdapter.prototype.getElementsByClassName = function (element, name) {
            return element.getElementsByClassName(name);
        };
        BrowserDomAdapter.prototype.getElementsByTagName = function (element, name) {
            return element.getElementsByTagName(name);
        };
        BrowserDomAdapter.prototype.classList = function (element) { return Array.prototype.slice.call(element.classList, 0); };
        BrowserDomAdapter.prototype.addClass = function (element, className) { element.classList.add(className); };
        BrowserDomAdapter.prototype.removeClass = function (element, className) { element.classList.remove(className); };
        BrowserDomAdapter.prototype.hasClass = function (element, className) { return element.classList.contains(className); };
        BrowserDomAdapter.prototype.setStyle = function (element, styleName, styleValue) {
            element.style[styleName] = styleValue;
        };
        BrowserDomAdapter.prototype.removeStyle = function (element, stylename) { element.style[stylename] = null; };
        BrowserDomAdapter.prototype.getStyle = function (element, stylename) { return element.style[stylename]; };
        BrowserDomAdapter.prototype.hasStyle = function (element, styleName, styleValue) {
            if (styleValue === void 0) { styleValue = null; }
            var value = this.getStyle(element, styleName) || '';
            return styleValue ? value == styleValue : value.length > 0;
        };
        BrowserDomAdapter.prototype.tagName = function (element) { return element.tagName; };
        BrowserDomAdapter.prototype.attributeMap = function (element) {
            var res = new Map();
            var elAttrs = element.attributes;
            for (var i = 0; i < elAttrs.length; i++) {
                var attrib = elAttrs[i];
                res.set(attrib.name, attrib.value);
            }
            return res;
        };
        BrowserDomAdapter.prototype.hasAttribute = function (element, attribute) { return element.hasAttribute(attribute); };
        BrowserDomAdapter.prototype.hasAttributeNS = function (element, ns, attribute) {
            return element.hasAttributeNS(ns, attribute);
        };
        BrowserDomAdapter.prototype.getAttribute = function (element, attribute) { return element.getAttribute(attribute); };
        BrowserDomAdapter.prototype.getAttributeNS = function (element, ns, name) {
            return element.getAttributeNS(ns, name);
        };
        BrowserDomAdapter.prototype.setAttribute = function (element, name, value) { element.setAttribute(name, value); };
        BrowserDomAdapter.prototype.setAttributeNS = function (element, ns, name, value) {
            element.setAttributeNS(ns, name, value);
        };
        BrowserDomAdapter.prototype.removeAttribute = function (element, attribute) { element.removeAttribute(attribute); };
        BrowserDomAdapter.prototype.removeAttributeNS = function (element, ns, name) { element.removeAttributeNS(ns, name); };
        BrowserDomAdapter.prototype.templateAwareRoot = function (el) { return this.isTemplateElement(el) ? this.content(el) : el; };
        BrowserDomAdapter.prototype.createHtmlDocument = function () {
            return document.implementation.createHTMLDocument('fakeTitle');
        };
        BrowserDomAdapter.prototype.defaultDoc = function () { return document; };
        BrowserDomAdapter.prototype.getBoundingClientRect = function (el) {
            try {
                return el.getBoundingClientRect();
            }
            catch (e) {
                return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 };
            }
        };
        BrowserDomAdapter.prototype.getTitle = function () { return document.title; };
        BrowserDomAdapter.prototype.setTitle = function (newTitle) { document.title = newTitle || ''; };
        BrowserDomAdapter.prototype.elementMatches = function (n, selector) {
            var matches = false;
            if (n instanceof HTMLElement) {
                if (n.matches) {
                    matches = n.matches(selector);
                }
                else if (n.msMatchesSelector) {
                    matches = n.msMatchesSelector(selector);
                }
                else if (n.webkitMatchesSelector) {
                    matches = n.webkitMatchesSelector(selector);
                }
            }
            return matches;
        };
        BrowserDomAdapter.prototype.isTemplateElement = function (el) {
            return el instanceof HTMLElement && el.nodeName == "TEMPLATE";
        };
        BrowserDomAdapter.prototype.isTextNode = function (node) { return node.nodeType === Node.TEXT_NODE; };
        BrowserDomAdapter.prototype.isCommentNode = function (node) { return node.nodeType === Node.COMMENT_NODE; };
        BrowserDomAdapter.prototype.isElementNode = function (node) { return node.nodeType === Node.ELEMENT_NODE; };
        BrowserDomAdapter.prototype.hasShadowRoot = function (node) { return node instanceof HTMLElement && isPresent$1(node.shadowRoot); };
        BrowserDomAdapter.prototype.isShadowRoot = function (node) { return node instanceof DocumentFragment; };
        BrowserDomAdapter.prototype.importIntoDoc = function (node) {
            var toImport = node;
            if (this.isTemplateElement(node)) {
                toImport = this.content(node);
            }
            return document.importNode(toImport, true);
        };
        BrowserDomAdapter.prototype.adoptNode = function (node) { return document.adoptNode(node); };
        BrowserDomAdapter.prototype.getHref = function (el) { return el.href; };
        BrowserDomAdapter.prototype.getEventKey = function (event) {
            var key = event.key;
            if (isBlank$1(key)) {
                key = event.keyIdentifier;
                // keyIdentifier is defined in the old draft of DOM Level 3 Events implemented by Chrome and
                // Safari
                // cf
                // http://www.w3.org/TR/2007/WD-DOM-Level-3-Events-20071221/events.html#Events-KeyboardEvents-Interfaces
                if (isBlank$1(key)) {
                    return 'Unidentified';
                }
                if (key.startsWith('U+')) {
                    key = String.fromCharCode(parseInt(key.substring(2), 16));
                    if (event.location === DOM_KEY_LOCATION_NUMPAD && _chromeNumKeyPadMap.hasOwnProperty(key)) {
                        // There is a bug in Chrome for numeric keypad keys:
                        // https://code.google.com/p/chromium/issues/detail?id=155654
                        // 1, 2, 3 ... are reported as A, B, C ...
                        key = _chromeNumKeyPadMap[key];
                    }
                }
            }
            if (_keyMap.hasOwnProperty(key)) {
                key = _keyMap[key];
            }
            return key;
        };
        BrowserDomAdapter.prototype.getGlobalEventTarget = function (target) {
            if (target == "window") {
                return window;
            }
            else if (target == "document") {
                return document;
            }
            else if (target == "body") {
                return document.body;
            }
        };
        BrowserDomAdapter.prototype.getHistory = function () { return window.history; };
        BrowserDomAdapter.prototype.getLocation = function () { return window.location; };
        BrowserDomAdapter.prototype.getBaseHref = function () {
            var href = getBaseElementHref();
            if (isBlank$1(href)) {
                return null;
            }
            return relativePath(href);
        };
        BrowserDomAdapter.prototype.resetBaseElement = function () { baseElement = null; };
        BrowserDomAdapter.prototype.getUserAgent = function () { return window.navigator.userAgent; };
        BrowserDomAdapter.prototype.setData = function (element, name, value) {
            this.setAttribute(element, 'data-' + name, value);
        };
        BrowserDomAdapter.prototype.getData = function (element, name) { return this.getAttribute(element, 'data-' + name); };
        BrowserDomAdapter.prototype.getComputedStyle = function (element) { return getComputedStyle(element); };
        // TODO(tbosch): move this into a separate environment class once we have it
        BrowserDomAdapter.prototype.setGlobalVar = function (path, value) { setValueOnPath$1(global$2, path, value); };
        BrowserDomAdapter.prototype.requestAnimationFrame = function (callback) { return window.requestAnimationFrame(callback); };
        BrowserDomAdapter.prototype.cancelAnimationFrame = function (id) { window.cancelAnimationFrame(id); };
        BrowserDomAdapter.prototype.performanceNow = function () {
            // performance.now() is not available in all browsers, see
            // http://caniuse.com/#search=performance.now
            if (isPresent$1(window.performance) && isPresent$1(window.performance.now)) {
                return window.performance.now();
            }
            else {
                return DateWrapper$1.toMillis(DateWrapper$1.now());
            }
        };
        return BrowserDomAdapter;
    }(GenericBrowserDomAdapter));
    var baseElement = null;
    function getBaseElementHref() {
        if (isBlank$1(baseElement)) {
            baseElement = document.querySelector('base');
            if (isBlank$1(baseElement)) {
                return null;
            }
        }
        return baseElement.getAttribute('href');
    }
    // based on urlUtils.js in AngularJS 1
    var urlParsingNode = null;
    function relativePath(url) {
        if (isBlank$1(urlParsingNode)) {
            urlParsingNode = document.createElement("a");
        }
        urlParsingNode.setAttribute('href', url);
        return (urlParsingNode.pathname.charAt(0) === '/') ? urlParsingNode.pathname :
            '/' + urlParsingNode.pathname;
    }
    var PublicTestability = (function () {
        function PublicTestability(testability) {
            this._testability = testability;
        }
        PublicTestability.prototype.isStable = function () { return this._testability.isStable(); };
        PublicTestability.prototype.whenStable = function (callback) { this._testability.whenStable(callback); };
        PublicTestability.prototype.findBindings = function (using, provider, exactMatch) {
            return this.findProviders(using, provider, exactMatch);
        };
        PublicTestability.prototype.findProviders = function (using, provider, exactMatch) {
            return this._testability.findBindings(using, provider, exactMatch);
        };
        return PublicTestability;
    }());
    var BrowserGetTestability = (function () {
        function BrowserGetTestability() {
        }
        BrowserGetTestability.init = function () { setTestabilityGetter(new BrowserGetTestability()); };
        BrowserGetTestability.prototype.addToWindow = function (registry) {
            global$2.getAngularTestability = function (elem, findInAncestors) {
                if (findInAncestors === void 0) { findInAncestors = true; }
                var testability = registry.findTestabilityInTree(elem, findInAncestors);
                if (testability == null) {
                    throw new Error('Could not find testability for element.');
                }
                return new PublicTestability(testability);
            };
            global$2.getAllAngularTestabilities = function () {
                var testabilities = registry.getAllTestabilities();
                return testabilities.map(function (testability) { return new PublicTestability(testability); });
            };
            global$2.getAllAngularRootElements = function () { return registry.getAllRootElements(); };
            var whenAllStable = function (callback) {
                var testabilities = global$2.getAllAngularTestabilities();
                var count = testabilities.length;
                var didWork = false;
                var decrement = function (didWork_) {
                    didWork = didWork || didWork_;
                    count--;
                    if (count == 0) {
                        callback(didWork);
                    }
                };
                testabilities.forEach(function (testability) { testability.whenStable(decrement); });
            };
            if (!global$2.frameworkStabilizers) {
                global$2.frameworkStabilizers = ListWrapper$2.createGrowableSize(0);
            }
            global$2.frameworkStabilizers.push(whenAllStable);
        };
        BrowserGetTestability.prototype.findTestabilityInTree = function (registry, elem, findInAncestors) {
            if (elem == null) {
                return null;
            }
            var t = registry.getTestability(elem);
            if (isPresent$1(t)) {
                return t;
            }
            else if (!findInAncestors) {
                return null;
            }
            if (getDOM().isShadowRoot(elem)) {
                return this.findTestabilityInTree(registry, getDOM().getHost(elem), true);
            }
            return this.findTestabilityInTree(registry, getDOM().parentElement(elem), true);
        };
        return BrowserGetTestability;
    }());
    /**
     * A DI Token representing the main rendering context. In a browser this is the DOM Document.
     *
     * Note: Document might not be available in the Application Context when Application and Rendering
     * Contexts are not the same (e.g. when running the application into a Web Worker).
     */
    var DOCUMENT = new OpaqueToken('DocumentToken');
    var BaseException$2 = (function (_super) {
        __extends(BaseException$2, _super);
        function BaseException$2(message) {
            if (message === void 0) { message = "--"; }
            _super.call(this, message);
            this.message = message;
            this.stack = (new Error(message)).stack;
        }
        BaseException$2.prototype.toString = function () { return this.message; };
        return BaseException$2;
    }(Error));
    var EVENT_MANAGER_PLUGINS = 
    /*@ts2dart_const*/ new OpaqueToken("EventManagerPlugins");
    var EventManager = (function () {
        function EventManager(plugins, _zone) {
            var _this = this;
            this._zone = _zone;
            plugins.forEach(function (p) { return p.manager = _this; });
            this._plugins = ListWrapper$2.reversed(plugins);
        }
        EventManager.prototype.addEventListener = function (element, eventName, handler) {
            var plugin = this._findPluginFor(eventName);
            return plugin.addEventListener(element, eventName, handler);
        };
        EventManager.prototype.addGlobalEventListener = function (target, eventName, handler) {
            var plugin = this._findPluginFor(eventName);
            return plugin.addGlobalEventListener(target, eventName, handler);
        };
        EventManager.prototype.getZone = function () { return this._zone; };
        /** @internal */
        EventManager.prototype._findPluginFor = function (eventName) {
            var plugins = this._plugins;
            for (var i = 0; i < plugins.length; i++) {
                var plugin = plugins[i];
                if (plugin.supports(eventName)) {
                    return plugin;
                }
            }
            throw new BaseException$2("No event manager plugin found for event " + eventName);
        };
        return EventManager;
    }());
    EventManager.decorators = [
        { type: Injectable },
    ];
    EventManager.ctorParameters = [
        { type: undefined, decorators: [{ type: Inject, args: [EVENT_MANAGER_PLUGINS,] },] },
        { type: NgZone, },
    ];
    var EventManagerPlugin = (function () {
        function EventManagerPlugin() {
        }
        // That is equivalent to having supporting $event.target
        EventManagerPlugin.prototype.supports = function (eventName) { return false; };
        EventManagerPlugin.prototype.addEventListener = function (element, eventName, handler) {
            throw "not implemented";
        };
        EventManagerPlugin.prototype.addGlobalEventListener = function (element, eventName, handler) {
            throw "not implemented";
        };
        return EventManagerPlugin;
    }());
    var CssAnimationOptions = (function () {
        function CssAnimationOptions() {
            /** classes to be added to the element */
            this.classesToAdd = [];
            /** classes to be removed from the element */
            this.classesToRemove = [];
            /** classes to be added for the duration of the animation */
            this.animationClasses = [];
        }
        return CssAnimationOptions;
    }());
    var Math$3 = global$2.Math;
    var CAMEL_CASE_REGEXP = /([A-Z])/g;
    function camelCaseToDashCase(input) {
        return StringWrapper$1.replaceAllMapped(input, CAMEL_CASE_REGEXP, function (m) { return '-' + m[1].toLowerCase(); });
    }
    var Animation = (function () {
        /**
         * Stores the start time and starts the animation
         * @param element
         * @param data
         * @param browserDetails
         */
        function Animation(element, data, browserDetails) {
            var _this = this;
            this.element = element;
            this.data = data;
            this.browserDetails = browserDetails;
            /** functions to be called upon completion */
            this.callbacks = [];
            /** functions for removing event listeners */
            this.eventClearFunctions = [];
            /** flag used to track whether or not the animation has finished */
            this.completed = false;
            this._stringPrefix = '';
            this.startTime = DateWrapper$1.toMillis(DateWrapper$1.now());
            this._stringPrefix = getDOM().getAnimationPrefix();
            this.setup();
            this.wait(function (timestamp) { return _this.start(); });
        }
        Object.defineProperty(Animation.prototype, "totalTime", {
            /** total amount of time that the animation should take including delay */
            get: function () {
                var delay = this.computedDelay != null ? this.computedDelay : 0;
                var duration = this.computedDuration != null ? this.computedDuration : 0;
                return delay + duration;
            },
            enumerable: true,
            configurable: true
        });
        Animation.prototype.wait = function (callback) {
            // Firefox requires 2 frames for some reason
            this.browserDetails.raf(callback, 2);
        };
        /**
         * Sets up the initial styles before the animation is started
         */
        Animation.prototype.setup = function () {
            if (this.data.fromStyles != null)
                this.applyStyles(this.data.fromStyles);
            if (this.data.duration != null)
                this.applyStyles({ 'transitionDuration': this.data.duration.toString() + 'ms' });
            if (this.data.delay != null)
                this.applyStyles({ 'transitionDelay': this.data.delay.toString() + 'ms' });
        };
        /**
         * After the initial setup has occurred, this method adds the animation styles
         */
        Animation.prototype.start = function () {
            this.addClasses(this.data.classesToAdd);
            this.addClasses(this.data.animationClasses);
            this.removeClasses(this.data.classesToRemove);
            if (this.data.toStyles != null)
                this.applyStyles(this.data.toStyles);
            var computedStyles = getDOM().getComputedStyle(this.element);
            this.computedDelay =
                Math$3.max(this.parseDurationString(computedStyles.getPropertyValue(this._stringPrefix + 'transition-delay')), this.parseDurationString(this.element.style.getPropertyValue(this._stringPrefix + 'transition-delay')));
            this.computedDuration = Math$3.max(this.parseDurationString(computedStyles.getPropertyValue(this._stringPrefix + 'transition-duration')), this.parseDurationString(this.element.style.getPropertyValue(this._stringPrefix + 'transition-duration')));
            this.addEvents();
        };
        /**
         * Applies the provided styles to the element
         * @param styles
         */
        Animation.prototype.applyStyles = function (styles) {
            var _this = this;
            StringMapWrapper$2.forEach(styles, function (value, key) {
                var dashCaseKey = camelCaseToDashCase(key);
                if (isPresent$1(getDOM().getStyle(_this.element, dashCaseKey))) {
                    getDOM().setStyle(_this.element, dashCaseKey, value.toString());
                }
                else {
                    getDOM().setStyle(_this.element, _this._stringPrefix + dashCaseKey, value.toString());
                }
            });
        };
        /**
         * Adds the provided classes to the element
         * @param classes
         */
        Animation.prototype.addClasses = function (classes) {
            for (var i = 0, len = classes.length; i < len; i++)
                getDOM().addClass(this.element, classes[i]);
        };
        /**
         * Removes the provided classes from the element
         * @param classes
         */
        Animation.prototype.removeClasses = function (classes) {
            for (var i = 0, len = classes.length; i < len; i++)
                getDOM().removeClass(this.element, classes[i]);
        };
        /**
         * Adds events to track when animations have finished
         */
        Animation.prototype.addEvents = function () {
            var _this = this;
            if (this.totalTime > 0) {
                this.eventClearFunctions.push(getDOM().onAndCancel(this.element, getDOM().getTransitionEnd(), function (event) { return _this.handleAnimationEvent(event); }));
            }
            else {
                this.handleAnimationCompleted();
            }
        };
        Animation.prototype.handleAnimationEvent = function (event) {
            var elapsedTime = Math$3.round(event.elapsedTime * 1000);
            if (!this.browserDetails.elapsedTimeIncludesDelay)
                elapsedTime += this.computedDelay;
            event.stopPropagation();
            if (elapsedTime >= this.totalTime)
                this.handleAnimationCompleted();
        };
        /**
         * Runs all animation callbacks and removes temporary classes
         */
        Animation.prototype.handleAnimationCompleted = function () {
            this.removeClasses(this.data.animationClasses);
            this.callbacks.forEach(function (callback) { return callback(); });
            this.callbacks = [];
            this.eventClearFunctions.forEach(function (fn) { return fn(); });
            this.eventClearFunctions = [];
            this.completed = true;
        };
        /**
         * Adds animation callbacks to be called upon completion
         * @param callback
         * @returns {Animation}
         */
        Animation.prototype.onComplete = function (callback) {
            if (this.completed) {
                callback();
            }
            else {
                this.callbacks.push(callback);
            }
            return this;
        };
        /**
         * Converts the duration string to the number of milliseconds
         * @param duration
         * @returns {number}
         */
        Animation.prototype.parseDurationString = function (duration) {
            var maxValue = 0;
            // duration must have at least 2 characters to be valid. (number + type)
            if (duration == null || duration.length < 2) {
                return maxValue;
            }
            else if (duration.substring(duration.length - 2) == 'ms') {
                var value = NumberWrapper$1.parseInt(this.stripLetters(duration), 10);
                if (value > maxValue)
                    maxValue = value;
            }
            else if (duration.substring(duration.length - 1) == 's') {
                var ms = NumberWrapper$1.parseFloat(this.stripLetters(duration)) * 1000;
                var value = Math$3.floor(ms);
                if (value > maxValue)
                    maxValue = value;
            }
            return maxValue;
        };
        /**
         * Strips the letters from the duration string
         * @param str
         * @returns {string}
         */
        Animation.prototype.stripLetters = function (str) {
            return StringWrapper$1.replaceAll(str, RegExpWrapper$1.create('[^0-9]+$', ''), '');
        };
        return Animation;
    }());
    var CssAnimationBuilder = (function () {
        /**
         * Accepts public properties for CssAnimationBuilder
         */
        function CssAnimationBuilder(browserDetails) {
            this.browserDetails = browserDetails;
            /** @type {CssAnimationOptions} */
            this.data = new CssAnimationOptions();
        }
        /**
         * Adds a temporary class that will be removed at the end of the animation
         * @param className
         */
        CssAnimationBuilder.prototype.addAnimationClass = function (className) {
            this.data.animationClasses.push(className);
            return this;
        };
        /**
         * Adds a class that will remain on the element after the animation has finished
         * @param className
         */
        CssAnimationBuilder.prototype.addClass = function (className) {
            this.data.classesToAdd.push(className);
            return this;
        };
        /**
         * Removes a class from the element
         * @param className
         */
        CssAnimationBuilder.prototype.removeClass = function (className) {
            this.data.classesToRemove.push(className);
            return this;
        };
        /**
         * Sets the animation duration (and overrides any defined through CSS)
         * @param duration
         */
        CssAnimationBuilder.prototype.setDuration = function (duration) {
            this.data.duration = duration;
            return this;
        };
        /**
         * Sets the animation delay (and overrides any defined through CSS)
         * @param delay
         */
        CssAnimationBuilder.prototype.setDelay = function (delay) {
            this.data.delay = delay;
            return this;
        };
        /**
         * Sets styles for both the initial state and the destination state
         * @param from
         * @param to
         */
        CssAnimationBuilder.prototype.setStyles = function (from, to) {
            return this.setFromStyles(from).setToStyles(to);
        };
        /**
         * Sets the initial styles for the animation
         * @param from
         */
        CssAnimationBuilder.prototype.setFromStyles = function (from) {
            this.data.fromStyles = from;
            return this;
        };
        /**
         * Sets the destination styles for the animation
         * @param to
         */
        CssAnimationBuilder.prototype.setToStyles = function (to) {
            this.data.toStyles = to;
            return this;
        };
        /**
         * Starts the animation and returns a promise
         * @param element
         */
        CssAnimationBuilder.prototype.start = function (element) {
            return new Animation(element, this.data, this.browserDetails);
        };
        return CssAnimationBuilder;
    }());
    var BrowserDetails = (function () {
        function BrowserDetails() {
            this.elapsedTimeIncludesDelay = false;
            this.doesElapsedTimeIncludesDelay();
        }
        /**
         * Determines if `event.elapsedTime` includes transition delay in the current browser.  At this
         * time, Chrome and Opera seem to be the only browsers that include this.
         */
        BrowserDetails.prototype.doesElapsedTimeIncludesDelay = function () {
            var _this = this;
            var div = getDOM().createElement('div');
            getDOM().setAttribute(div, 'style', "position: absolute; top: -9999px; left: -9999px; width: 1px;\n      height: 1px; transition: all 1ms linear 1ms;");
            // Firefox requires that we wait for 2 frames for some reason
            this.raf(function (timestamp) {
                getDOM().on(div, 'transitionend', function (event) {
                    var elapsed = Math$3.round(event.elapsedTime * 1000);
                    _this.elapsedTimeIncludesDelay = elapsed == 2;
                    getDOM().remove(div);
                });
                getDOM().setStyle(div, 'width', '2px');
            }, 2);
        };
        BrowserDetails.prototype.raf = function (callback, frames) {
            if (frames === void 0) { frames = 1; }
            var queue = new RafQueue(callback, frames);
            return function () { return queue.cancel(); };
        };
        return BrowserDetails;
    }());
    BrowserDetails.decorators = [
        { type: Injectable },
    ];
    BrowserDetails.ctorParameters = [];
    var RafQueue = (function () {
        function RafQueue(callback, frames) {
            this.callback = callback;
            this.frames = frames;
            this._raf();
        }
        RafQueue.prototype._raf = function () {
            var _this = this;
            this.currentFrameId =
                getDOM().requestAnimationFrame(function (timestamp) { return _this._nextFrame(timestamp); });
        };
        RafQueue.prototype._nextFrame = function (timestamp) {
            this.frames--;
            if (this.frames > 0) {
                this._raf();
            }
            else {
                this.callback(timestamp);
            }
        };
        RafQueue.prototype.cancel = function () {
            getDOM().cancelAnimationFrame(this.currentFrameId);
            this.currentFrameId = null;
        };
        return RafQueue;
    }());
    var AnimationBuilder = (function () {
        /**
         * Used for DI
         * @param browserDetails
         */
        function AnimationBuilder(browserDetails) {
            this.browserDetails = browserDetails;
        }
        /**
         * Creates a new CSS Animation
         * @returns {CssAnimationBuilder}
         */
        AnimationBuilder.prototype.css = function () { return new CssAnimationBuilder(this.browserDetails); };
        return AnimationBuilder;
    }());
    AnimationBuilder.decorators = [
        { type: Injectable },
    ];
    AnimationBuilder.ctorParameters = [
        { type: BrowserDetails, },
    ];
    var SharedStylesHost = (function () {
        function SharedStylesHost() {
            /** @internal */
            this._styles = [];
            /** @internal */
            this._stylesSet = new Set();
        }
        SharedStylesHost.prototype.addStyles = function (styles) {
            var _this = this;
            var additions = [];
            styles.forEach(function (style) {
                if (!SetWrapper$2.has(_this._stylesSet, style)) {
                    _this._stylesSet.add(style);
                    _this._styles.push(style);
                    additions.push(style);
                }
            });
            this.onStylesAdded(additions);
        };
        SharedStylesHost.prototype.onStylesAdded = function (additions) { };
        SharedStylesHost.prototype.getAllStyles = function () { return this._styles; };
        return SharedStylesHost;
    }());
    SharedStylesHost.decorators = [
        { type: Injectable },
    ];
    SharedStylesHost.ctorParameters = [];
    var DomSharedStylesHost = (function (_super) {
        __extends(DomSharedStylesHost, _super);
        function DomSharedStylesHost(doc) {
            _super.call(this);
            this._hostNodes = new Set();
            this._hostNodes.add(doc.head);
        }
        /** @internal */
        DomSharedStylesHost.prototype._addStylesToHost = function (styles, host) {
            for (var i = 0; i < styles.length; i++) {
                var style = styles[i];
                getDOM().appendChild(host, getDOM().createStyleElement(style));
            }
        };
        DomSharedStylesHost.prototype.addHost = function (hostNode) {
            this._addStylesToHost(this._styles, hostNode);
            this._hostNodes.add(hostNode);
        };
        DomSharedStylesHost.prototype.removeHost = function (hostNode) { SetWrapper$2.delete(this._hostNodes, hostNode); };
        DomSharedStylesHost.prototype.onStylesAdded = function (additions) {
            var _this = this;
            this._hostNodes.forEach(function (hostNode) { _this._addStylesToHost(additions, hostNode); });
        };
        return DomSharedStylesHost;
    }(SharedStylesHost));
    DomSharedStylesHost.decorators = [
        { type: Injectable },
    ];
    DomSharedStylesHost.ctorParameters = [
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] },] },
    ];
    var NAMESPACE_URIS = 
    /*@ts2dart_const*/
    { 'xlink': 'http://www.w3.org/1999/xlink', 'svg': 'http://www.w3.org/2000/svg' };
    var TEMPLATE_COMMENT_TEXT = 'template bindings={}';
    var TEMPLATE_BINDINGS_EXP = /^template bindings=(.*)$/g;
    var DomRootRenderer = (function () {
        function DomRootRenderer(document, eventManager, sharedStylesHost, animate) {
            this.document = document;
            this.eventManager = eventManager;
            this.sharedStylesHost = sharedStylesHost;
            this.animate = animate;
            this._registeredComponents = new Map();
        }
        DomRootRenderer.prototype.renderComponent = function (componentProto) {
            var renderer = this._registeredComponents.get(componentProto.id);
            if (isBlank$1(renderer)) {
                renderer = new DomRenderer(this, componentProto);
                this._registeredComponents.set(componentProto.id, renderer);
            }
            return renderer;
        };
        return DomRootRenderer;
    }());
    var DomRootRenderer_ = (function (_super) {
        __extends(DomRootRenderer_, _super);
        function DomRootRenderer_(_document, _eventManager, sharedStylesHost, animate) {
            _super.call(this, _document, _eventManager, sharedStylesHost, animate);
        }
        return DomRootRenderer_;
    }(DomRootRenderer));
    DomRootRenderer_.decorators = [
        { type: Injectable },
    ];
    DomRootRenderer_.ctorParameters = [
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] },] },
        { type: EventManager, },
        { type: DomSharedStylesHost, },
        { type: AnimationBuilder, },
    ];
    var DomRenderer = (function () {
        function DomRenderer(_rootRenderer, componentProto) {
            this._rootRenderer = _rootRenderer;
            this.componentProto = componentProto;
            this._styles = _flattenStyles(componentProto.id, componentProto.styles, []);
            if (componentProto.encapsulation !== ViewEncapsulation.Native) {
                this._rootRenderer.sharedStylesHost.addStyles(this._styles);
            }
            if (this.componentProto.encapsulation === ViewEncapsulation.Emulated) {
                this._contentAttr = _shimContentAttribute(componentProto.id);
                this._hostAttr = _shimHostAttribute(componentProto.id);
            }
            else {
                this._contentAttr = null;
                this._hostAttr = null;
            }
        }
        DomRenderer.prototype.selectRootElement = function (selectorOrNode, debugInfo) {
            var el;
            if (isString$1(selectorOrNode)) {
                el = getDOM().querySelector(this._rootRenderer.document, selectorOrNode);
                if (isBlank$1(el)) {
                    throw new BaseException$2("The selector \"" + selectorOrNode + "\" did not match any elements");
                }
            }
            else {
                el = selectorOrNode;
            }
            getDOM().clearNodes(el);
            return el;
        };
        DomRenderer.prototype.createElement = function (parent, name, debugInfo) {
            var nsAndName = splitNamespace(name);
            var el = isPresent$1(nsAndName[0]) ?
                getDOM().createElementNS(NAMESPACE_URIS[nsAndName[0]], nsAndName[1]) :
                getDOM().createElement(nsAndName[1]);
            if (isPresent$1(this._contentAttr)) {
                getDOM().setAttribute(el, this._contentAttr, '');
            }
            if (isPresent$1(parent)) {
                getDOM().appendChild(parent, el);
            }
            return el;
        };
        DomRenderer.prototype.createViewRoot = function (hostElement) {
            var nodesParent;
            if (this.componentProto.encapsulation === ViewEncapsulation.Native) {
                nodesParent = getDOM().createShadowRoot(hostElement);
                this._rootRenderer.sharedStylesHost.addHost(nodesParent);
                for (var i = 0; i < this._styles.length; i++) {
                    getDOM().appendChild(nodesParent, getDOM().createStyleElement(this._styles[i]));
                }
            }
            else {
                if (isPresent$1(this._hostAttr)) {
                    getDOM().setAttribute(hostElement, this._hostAttr, '');
                }
                nodesParent = hostElement;
            }
            return nodesParent;
        };
        DomRenderer.prototype.createTemplateAnchor = function (parentElement, debugInfo) {
            var comment = getDOM().createComment(TEMPLATE_COMMENT_TEXT);
            if (isPresent$1(parentElement)) {
                getDOM().appendChild(parentElement, comment);
            }
            return comment;
        };
        DomRenderer.prototype.createText = function (parentElement, value, debugInfo) {
            var node = getDOM().createTextNode(value);
            if (isPresent$1(parentElement)) {
                getDOM().appendChild(parentElement, node);
            }
            return node;
        };
        DomRenderer.prototype.projectNodes = function (parentElement, nodes) {
            if (isBlank$1(parentElement))
                return;
            appendNodes(parentElement, nodes);
        };
        DomRenderer.prototype.attachViewAfter = function (node, viewRootNodes) {
            moveNodesAfterSibling(node, viewRootNodes);
            for (var i = 0; i < viewRootNodes.length; i++)
                this.animateNodeEnter(viewRootNodes[i]);
        };
        DomRenderer.prototype.detachView = function (viewRootNodes) {
            for (var i = 0; i < viewRootNodes.length; i++) {
                var node = viewRootNodes[i];
                getDOM().remove(node);
                this.animateNodeLeave(node);
            }
        };
        DomRenderer.prototype.destroyView = function (hostElement, viewAllNodes) {
            if (this.componentProto.encapsulation === ViewEncapsulation.Native && isPresent$1(hostElement)) {
                this._rootRenderer.sharedStylesHost.removeHost(getDOM().getShadowRoot(hostElement));
            }
        };
        DomRenderer.prototype.listen = function (renderElement, name, callback) {
            return this._rootRenderer.eventManager.addEventListener(renderElement, name, decoratePreventDefault(callback));
        };
        DomRenderer.prototype.listenGlobal = function (target, name, callback) {
            return this._rootRenderer.eventManager.addGlobalEventListener(target, name, decoratePreventDefault(callback));
        };
        DomRenderer.prototype.setElementProperty = function (renderElement, propertyName, propertyValue) {
            getDOM().setProperty(renderElement, propertyName, propertyValue);
        };
        DomRenderer.prototype.setElementAttribute = function (renderElement, attributeName, attributeValue) {
            var attrNs;
            var nsAndName = splitNamespace(attributeName);
            if (isPresent$1(nsAndName[0])) {
                attributeName = nsAndName[0] + ':' + nsAndName[1];
                attrNs = NAMESPACE_URIS[nsAndName[0]];
            }
            if (isPresent$1(attributeValue)) {
                if (isPresent$1(attrNs)) {
                    getDOM().setAttributeNS(renderElement, attrNs, attributeName, attributeValue);
                }
                else {
                    getDOM().setAttribute(renderElement, attributeName, attributeValue);
                }
            }
            else {
                if (isPresent$1(attrNs)) {
                    getDOM().removeAttributeNS(renderElement, attrNs, nsAndName[1]);
                }
                else {
                    getDOM().removeAttribute(renderElement, attributeName);
                }
            }
        };
        DomRenderer.prototype.setBindingDebugInfo = function (renderElement, propertyName, propertyValue) {
            var dashCasedPropertyName = camelCaseToDashCase(propertyName);
            if (getDOM().isCommentNode(renderElement)) {
                var existingBindings = RegExpWrapper$1.firstMatch(TEMPLATE_BINDINGS_EXP, StringWrapper$1.replaceAll(getDOM().getText(renderElement), /\n/g, ''));
                var parsedBindings = Json$1.parse(existingBindings[1]);
                parsedBindings[dashCasedPropertyName] = propertyValue;
                getDOM().setText(renderElement, StringWrapper$1.replace(TEMPLATE_COMMENT_TEXT, '{}', Json$1.stringify(parsedBindings)));
            }
            else {
                this.setElementAttribute(renderElement, propertyName, propertyValue);
            }
        };
        DomRenderer.prototype.setElementClass = function (renderElement, className, isAdd) {
            if (isAdd) {
                getDOM().addClass(renderElement, className);
            }
            else {
                getDOM().removeClass(renderElement, className);
            }
        };
        DomRenderer.prototype.setElementStyle = function (renderElement, styleName, styleValue) {
            if (isPresent$1(styleValue)) {
                getDOM().setStyle(renderElement, styleName, stringify$1(styleValue));
            }
            else {
                getDOM().removeStyle(renderElement, styleName);
            }
        };
        DomRenderer.prototype.invokeElementMethod = function (renderElement, methodName, args) {
            getDOM().invoke(renderElement, methodName, args);
        };
        DomRenderer.prototype.setText = function (renderNode, text) { getDOM().setText(renderNode, text); };
        /**
         * Performs animations if necessary
         * @param node
         */
        DomRenderer.prototype.animateNodeEnter = function (node) {
            if (getDOM().isElementNode(node) && getDOM().hasClass(node, 'ng-animate')) {
                getDOM().addClass(node, 'ng-enter');
                this._rootRenderer.animate.css()
                    .addAnimationClass('ng-enter-active')
                    .start(node)
                    .onComplete(function () { getDOM().removeClass(node, 'ng-enter'); });
            }
        };
        /**
         * If animations are necessary, performs animations then removes the element; otherwise, it just
         * removes the element.
         * @param node
         */
        DomRenderer.prototype.animateNodeLeave = function (node) {
            if (getDOM().isElementNode(node) && getDOM().hasClass(node, 'ng-animate')) {
                getDOM().addClass(node, 'ng-leave');
                this._rootRenderer.animate.css()
                    .addAnimationClass('ng-leave-active')
                    .start(node)
                    .onComplete(function () {
                    getDOM().removeClass(node, 'ng-leave');
                    getDOM().remove(node);
                });
            }
            else {
                getDOM().remove(node);
            }
        };
        return DomRenderer;
    }());
    function moveNodesAfterSibling(sibling, nodes) {
        var parent = getDOM().parentElement(sibling);
        if (nodes.length > 0 && isPresent$1(parent)) {
            var nextSibling = getDOM().nextSibling(sibling);
            if (isPresent$1(nextSibling)) {
                for (var i = 0; i < nodes.length; i++) {
                    getDOM().insertBefore(nextSibling, nodes[i]);
                }
            }
            else {
                for (var i = 0; i < nodes.length; i++) {
                    getDOM().appendChild(parent, nodes[i]);
                }
            }
        }
    }
    function appendNodes(parent, nodes) {
        for (var i = 0; i < nodes.length; i++) {
            getDOM().appendChild(parent, nodes[i]);
        }
    }
    function decoratePreventDefault(eventHandler) {
        return function (event) {
            var allowDefaultBehavior = eventHandler(event);
            if (allowDefaultBehavior === false) {
                // TODO(tbosch): move preventDefault into event plugins...
                getDOM().preventDefault(event);
            }
        };
    }
    var COMPONENT_REGEX = /%COMP%/g;
    var COMPONENT_VARIABLE = '%COMP%';
    var HOST_ATTR = "_nghost-" + COMPONENT_VARIABLE;
    var CONTENT_ATTR = "_ngcontent-" + COMPONENT_VARIABLE;
    function _shimContentAttribute(componentShortId) {
        return StringWrapper$1.replaceAll(CONTENT_ATTR, COMPONENT_REGEX, componentShortId);
    }
    function _shimHostAttribute(componentShortId) {
        return StringWrapper$1.replaceAll(HOST_ATTR, COMPONENT_REGEX, componentShortId);
    }
    function _flattenStyles(compId, styles, target) {
        for (var i = 0; i < styles.length; i++) {
            var style = styles[i];
            if (isArray$2(style)) {
                _flattenStyles(compId, style, target);
            }
            else {
                style = StringWrapper$1.replaceAll(style, COMPONENT_REGEX, compId);
                target.push(style);
            }
        }
        return target;
    }
    var NS_PREFIX_RE = /^:([^:]+):(.+)/g;
    function splitNamespace(name) {
        if (name[0] != ':') {
            return [null, name];
        }
        var match = RegExpWrapper$1.firstMatch(NS_PREFIX_RE, name);
        return [match[1], match[2]];
    }
    var modifierKeys = ['alt', 'control', 'meta', 'shift'];
    var modifierKeyGetters = {
        'alt': function (event) { return event.altKey; },
        'control': function (event) { return event.ctrlKey; },
        'meta': function (event) { return event.metaKey; },
        'shift': function (event) { return event.shiftKey; }
    };
    var KeyEventsPlugin = (function (_super) {
        __extends(KeyEventsPlugin, _super);
        function KeyEventsPlugin() {
            _super.call(this);
        }
        KeyEventsPlugin.prototype.supports = function (eventName) {
            return isPresent$1(KeyEventsPlugin.parseEventName(eventName));
        };
        KeyEventsPlugin.prototype.addEventListener = function (element, eventName, handler) {
            var parsedEvent = KeyEventsPlugin.parseEventName(eventName);
            var outsideHandler = KeyEventsPlugin.eventCallback(element, StringMapWrapper$2.get(parsedEvent, 'fullKey'), handler, this.manager.getZone());
            return this.manager.getZone().runOutsideAngular(function () {
                return getDOM().onAndCancel(element, StringMapWrapper$2.get(parsedEvent, 'domEventName'), outsideHandler);
            });
        };
        KeyEventsPlugin.parseEventName = function (eventName) {
            var parts = eventName.toLowerCase().split('.');
            var domEventName = parts.shift();
            if ((parts.length === 0) ||
                !(StringWrapper$1.equals(domEventName, 'keydown') ||
                    StringWrapper$1.equals(domEventName, 'keyup'))) {
                return null;
            }
            var key = KeyEventsPlugin._normalizeKey(parts.pop());
            var fullKey = '';
            modifierKeys.forEach(function (modifierName) {
                if (ListWrapper$2.contains(parts, modifierName)) {
                    ListWrapper$2.remove(parts, modifierName);
                    fullKey += modifierName + '.';
                }
            });
            fullKey += key;
            if (parts.length != 0 || key.length === 0) {
                // returning null instead of throwing to let another plugin process the event
                return null;
            }
            var result = StringMapWrapper$2.create();
            StringMapWrapper$2.set(result, 'domEventName', domEventName);
            StringMapWrapper$2.set(result, 'fullKey', fullKey);
            return result;
        };
        KeyEventsPlugin.getEventFullKey = function (event) {
            var fullKey = '';
            var key = getDOM().getEventKey(event);
            key = key.toLowerCase();
            if (StringWrapper$1.equals(key, ' ')) {
                key = 'space'; // for readability
            }
            else if (StringWrapper$1.equals(key, '.')) {
                key = 'dot'; // because '.' is used as a separator in event names
            }
            modifierKeys.forEach(function (modifierName) {
                if (modifierName != key) {
                    var modifierGetter = StringMapWrapper$2.get(modifierKeyGetters, modifierName);
                    if (modifierGetter(event)) {
                        fullKey += modifierName + '.';
                    }
                }
            });
            fullKey += key;
            return fullKey;
        };
        KeyEventsPlugin.eventCallback = function (element, fullKey, handler, zone) {
            return function (event) {
                if (StringWrapper$1.equals(KeyEventsPlugin.getEventFullKey(event), fullKey)) {
                    zone.runGuarded(function () { return handler(event); });
                }
            };
        };
        /** @internal */
        KeyEventsPlugin._normalizeKey = function (keyName) {
            // TODO: switch to a StringMap if the mapping grows too much
            switch (keyName) {
                case 'esc':
                    return 'escape';
                default:
                    return keyName;
            }
        };
        return KeyEventsPlugin;
    }(EventManagerPlugin));
    KeyEventsPlugin.decorators = [
        { type: Injectable },
    ];
    KeyEventsPlugin.ctorParameters = [];
    var CORE_TOKENS = { 'ApplicationRef': ApplicationRef, 'NgZone': NgZone };
    var INSPECT_GLOBAL_NAME = 'ng.probe';
    var CORE_TOKENS_GLOBAL_NAME = 'ng.coreTokens';
    /**
     * Returns a {@link DebugElement} for the given native DOM element, or
     * null if the given native element does not have an Angular view associated
     * with it.
     */
    function inspectNativeElement(element) {
        return getDebugNode(element);
    }
    function _createConditionalRootRenderer(rootRenderer) {
        if (assertionsEnabled$1()) {
            return _createRootRenderer(rootRenderer);
        }
        return rootRenderer;
    }
    function _createRootRenderer(rootRenderer) {
        getDOM().setGlobalVar(INSPECT_GLOBAL_NAME, inspectNativeElement);
        getDOM().setGlobalVar(CORE_TOKENS_GLOBAL_NAME, CORE_TOKENS);
        return new DebugDomRootRenderer$1(rootRenderer);
    }
    /**
     * Providers which support debugging Angular applications (e.g. via `ng.probe`).
     */
    var ELEMENT_PROBE_PROVIDERS = [
        /*@ts2dart_Provider*/ {
            provide: RootRenderer,
            useFactory: _createConditionalRootRenderer,
            deps: [DomRootRenderer]
        }
    ];
    var DomEventsPlugin = (function (_super) {
        __extends(DomEventsPlugin, _super);
        function DomEventsPlugin() {
            _super.apply(this, arguments);
        }
        // This plugin should come last in the list of plugins, because it accepts all
        // events.
        DomEventsPlugin.prototype.supports = function (eventName) { return true; };
        DomEventsPlugin.prototype.addEventListener = function (element, eventName, handler) {
            var zone = this.manager.getZone();
            var outsideHandler = function (event) { return zone.runGuarded(function () { return handler(event); }); };
            return this.manager.getZone().runOutsideAngular(function () { return getDOM().onAndCancel(element, eventName, outsideHandler); });
        };
        DomEventsPlugin.prototype.addGlobalEventListener = function (target, eventName, handler) {
            var element = getDOM().getGlobalEventTarget(target);
            var zone = this.manager.getZone();
            var outsideHandler = function (event) { return zone.runGuarded(function () { return handler(event); }); };
            return this.manager.getZone().runOutsideAngular(function () { return getDOM().onAndCancel(element, eventName, outsideHandler); });
        };
        return DomEventsPlugin;
    }(EventManagerPlugin));
    DomEventsPlugin.decorators = [
        { type: Injectable },
    ];
    var _eventNames = {
        // pan
        'pan': true,
        'panstart': true,
        'panmove': true,
        'panend': true,
        'pancancel': true,
        'panleft': true,
        'panright': true,
        'panup': true,
        'pandown': true,
        // pinch
        'pinch': true,
        'pinchstart': true,
        'pinchmove': true,
        'pinchend': true,
        'pinchcancel': true,
        'pinchin': true,
        'pinchout': true,
        // press
        'press': true,
        'pressup': true,
        // rotate
        'rotate': true,
        'rotatestart': true,
        'rotatemove': true,
        'rotateend': true,
        'rotatecancel': true,
        // swipe
        'swipe': true,
        'swipeleft': true,
        'swiperight': true,
        'swipeup': true,
        'swipedown': true,
        // tap
        'tap': true,
    };
    var HammerGesturesPluginCommon = (function (_super) {
        __extends(HammerGesturesPluginCommon, _super);
        function HammerGesturesPluginCommon() {
            _super.call(this);
        }
        HammerGesturesPluginCommon.prototype.supports = function (eventName) {
            eventName = eventName.toLowerCase();
            return StringMapWrapper$2.contains(_eventNames, eventName);
        };
        return HammerGesturesPluginCommon;
    }(EventManagerPlugin));
    var HAMMER_GESTURE_CONFIG = 
    /*@ts2dart_const*/ new OpaqueToken("HammerGestureConfig");
    var HammerGestureConfig = (function () {
        function HammerGestureConfig() {
            this.events = [];
            this.overrides = {};
        }
        HammerGestureConfig.prototype.buildHammer = function (element) {
            var mc = new Hammer(element);
            mc.get('pinch').set({ enable: true });
            mc.get('rotate').set({ enable: true });
            for (var eventName in this.overrides) {
                mc.get(eventName).set(this.overrides[eventName]);
            }
            return mc;
        };
        return HammerGestureConfig;
    }());
    HammerGestureConfig.decorators = [
        { type: Injectable },
    ];
    var HammerGesturesPlugin = (function (_super) {
        __extends(HammerGesturesPlugin, _super);
        function HammerGesturesPlugin(_config) {
            _super.call(this);
            this._config = _config;
        }
        HammerGesturesPlugin.prototype.supports = function (eventName) {
            if (!_super.prototype.supports.call(this, eventName) && !this.isCustomEvent(eventName))
                return false;
            if (!isPresent$1(window['Hammer'])) {
                throw new BaseException$2("Hammer.js is not loaded, can not bind " + eventName + " event");
            }
            return true;
        };
        HammerGesturesPlugin.prototype.addEventListener = function (element, eventName, handler) {
            var _this = this;
            var zone = this.manager.getZone();
            eventName = eventName.toLowerCase();
            return zone.runOutsideAngular(function () {
                // Creating the manager bind events, must be done outside of angular
                var mc = _this._config.buildHammer(element);
                var callback = function (eventObj) { zone.runGuarded(function () { handler(eventObj); }); };
                mc.on(eventName, callback);
                return function () { mc.off(eventName, callback); };
            });
        };
        HammerGesturesPlugin.prototype.isCustomEvent = function (eventName) { return this._config.events.indexOf(eventName) > -1; };
        return HammerGesturesPlugin;
    }(HammerGesturesPluginCommon));
    HammerGesturesPlugin.decorators = [
        { type: Injectable },
    ];
    HammerGesturesPlugin.ctorParameters = [
        { type: HammerGestureConfig, decorators: [{ type: Inject, args: [HAMMER_GESTURE_CONFIG,] },] },
    ];
    var context = global$2;
    var BROWSER_PLATFORM_MARKER = 
    /*@ts2dart_const*/ new OpaqueToken('BrowserPlatformMarker');
    /**
     * A set of providers to initialize the Angular platform in a web browser.
     *
     * Used automatically by `bootstrap`, or can be passed to {@link platform}.
     */
    var BROWSER_PROVIDERS = [
        /*@ts2dart_Provider*/ { provide: BROWSER_PLATFORM_MARKER, useValue: true },
        PLATFORM_COMMON_PROVIDERS,
        /*@ts2dart_Provider*/ { provide: PLATFORM_INITIALIZER, useValue: initDomAdapter, multi: true },
    ];
    function _exceptionHandler() {
        // !IS_DART is required because we must rethrow exceptions in JS,
        // but must not rethrow exceptions in Dart
        return new ExceptionHandler(getDOM(), !IS_DART$1);
    }
    function _document() {
        return getDOM().defaultDoc();
    }
    var BROWSER_SANITIZATION_PROVIDERS = [
        /* @ts2dart_Provider */ { provide: SanitizationService$1, useExisting: DomSanitizationService },
        /* @ts2dart_Provider */ { provide: DomSanitizationService, useClass: DomSanitizationServiceImpl },
    ];
    /**
     * A set of providers to initialize an Angular application in a web browser.
     *
     * Used automatically by `bootstrap`, or can be passed to {@link PlatformRef.application}.
     */
    var BROWSER_APP_COMMON_PROVIDERS = 
    /*@ts2dart_const*/ [
        APPLICATION_COMMON_PROVIDERS,
        FORM_PROVIDERS,
        BROWSER_SANITIZATION_PROVIDERS,
        /* @ts2dart_Provider */ { provide: PLATFORM_PIPES, useValue: COMMON_PIPES, multi: true },
        /* @ts2dart_Provider */ { provide: PLATFORM_DIRECTIVES, useValue: COMMON_DIRECTIVES, multi: true },
        /* @ts2dart_Provider */ { provide: ExceptionHandler, useFactory: _exceptionHandler, deps: [] },
        /* @ts2dart_Provider */ { provide: DOCUMENT, useFactory: _document, deps: [] },
        /* @ts2dart_Provider */ { provide: EVENT_MANAGER_PLUGINS, useClass: DomEventsPlugin, multi: true },
        /* @ts2dart_Provider */ { provide: EVENT_MANAGER_PLUGINS, useClass: KeyEventsPlugin, multi: true },
        /* @ts2dart_Provider */ { provide: EVENT_MANAGER_PLUGINS, useClass: HammerGesturesPlugin, multi: true },
        /* @ts2dart_Provider */ { provide: HAMMER_GESTURE_CONFIG, useClass: HammerGestureConfig },
        /* @ts2dart_Provider */ { provide: DomRootRenderer, useClass: DomRootRenderer_ },
        /* @ts2dart_Provider */ { provide: RootRenderer, useExisting: DomRootRenderer },
        /* @ts2dart_Provider */ { provide: SharedStylesHost, useExisting: DomSharedStylesHost },
        DomSharedStylesHost,
        Testability,
        BrowserDetails,
        AnimationBuilder,
        EventManager,
        ELEMENT_PROBE_PROVIDERS
    ];
    function initDomAdapter() {
        BrowserDomAdapter.makeCurrent();
        wtfInit$1();
        BrowserGetTestability.init();
    }
    function browserPlatform() {
        if (isBlank$1(getPlatform())) {
            createPlatform(ReflectiveInjector.resolveAndCreate(BROWSER_PROVIDERS));
        }
        return assertPlatform(BROWSER_PLATFORM_MARKER);
    }
    /**
     * This file is generated by the Angular 2 template compiler.
     * Do not edit.
     */
    var styles = ['.loader[_ngcontent-%COMP%] {\n  left: 50%;\n  top: 50%;\n  position: fixed;\n  -webkit-transform: translate(-50%, -50%);\n          transform: translate(-50%, -50%); }\n  .loader[_ngcontent-%COMP%] #spinner[_ngcontent-%COMP%] {\n    box-sizing: border-box;\n    stroke: #673AB7;\n    stroke-width: 3px;\n    -webkit-transform-origin: 50%;\n            transform-origin: 50%;\n    -webkit-animation: line 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite, rotate 1.6s linear infinite;\n            animation: line 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite, rotate 1.6s linear infinite; }\n\n@-webkit-keyframes rotate {\n  from {\n    -webkit-transform: rotate(0);\n            transform: rotate(0); }\n  to {\n    -webkit-transform: rotate(450deg);\n            transform: rotate(450deg); } }\n\n@keyframes rotate {\n  from {\n    -webkit-transform: rotate(0);\n            transform: rotate(0); }\n  to {\n    -webkit-transform: rotate(450deg);\n            transform: rotate(450deg); } }\n\n@-webkit-keyframes line {\n  0% {\n    stroke-dasharray: 2, 85.964;\n    -webkit-transform: rotate(0);\n            transform: rotate(0); }\n  50% {\n    stroke-dasharray: 65.973, 21.9911;\n    stroke-dashoffset: 0; }\n  100% {\n    stroke-dasharray: 2, 85.964;\n    stroke-dashoffset: -65.973;\n    -webkit-transform: rotate(90deg);\n            transform: rotate(90deg); } }\n\n@keyframes line {\n  0% {\n    stroke-dasharray: 2, 85.964;\n    -webkit-transform: rotate(0);\n            transform: rotate(0); }\n  50% {\n    stroke-dasharray: 65.973, 21.9911;\n    stroke-dashoffset: 0; }\n  100% {\n    stroke-dasharray: 2, 85.964;\n    stroke-dashoffset: -65.973;\n    -webkit-transform: rotate(90deg);\n            transform: rotate(90deg); } }\n\n.main[_ngcontent-%COMP%] {\n  padding-top: 60px;\n  -webkit-box-flex: 1;\n  -webkit-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  overflow-x: hidden;\n  overflow-y: auto;\n  -webkit-overflow-scrolling: touch; }\n\n\n.dialog-container[_ngcontent-%COMP%] {\n  background: rgba(0, 0, 0, 0.57);\n  position: fixed;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: 100%;\n  opacity: 0;\n  pointer-events: none;\n  will-change: opacity;\n  -webkit-transition: opacity 0.333s cubic-bezier(0, 0, 0.21, 1);\n  transition: opacity 0.333s cubic-bezier(0, 0, 0.21, 1); }\n\n.dialog-container--visible[_ngcontent-%COMP%] {\n  opacity: 1;\n  pointer-events: auto; }\n\n.mdl-button[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  border-radius: 2px;\n  color: black;\n  position: relative;\n  height: 36px;\n  margin: 0;\n  min-width: 64px;\n  padding: 0 16px;\n  display: inline-block;\n  font-family: "Roboto", "Helvetica", "Arial", sans-serif;\n  font-size: 14px;\n  font-weight: 500;\n  text-transform: uppercase;\n  line-height: 1;\n  letter-spacing: 0;\n  overflow: hidden;\n  will-change: box-shadow;\n  -webkit-transition: box-shadow 0.2s cubic-bezier(0.4, 0, 1, 1), background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n  transition: box-shadow 0.2s cubic-bezier(0.4, 0, 1, 1), background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n  outline: none;\n  cursor: pointer;\n  text-decoration: none;\n  text-align: center;\n  line-height: 36px;\n  vertical-align: middle; }\n  .mdl-button[_ngcontent-%COMP%]::-moz-focus-inner {\n    border: 0; }\n  .mdl-button[_ngcontent-%COMP%]:hover {\n    background-color: rgba(158, 158, 158, 0.2); }\n  .mdl-button[_ngcontent-%COMP%]:focus:not(:active) {\n    background-color: rgba(0, 0, 0, 0.12); }\n  .mdl-button[_ngcontent-%COMP%]:active {\n    background-color: rgba(158, 158, 158, 0.4); }\n  .mdl-button.mdl-button--colored[_ngcontent-%COMP%] {\n    color: #3f51b5; }\n    .mdl-button.mdl-button--colored[_ngcontent-%COMP%]:focus:not(:active) {\n      background-color: rgba(0, 0, 0, 0.12); }\n\n.mdl-button--primary.mdl-button--primary[_ngcontent-%COMP%] {\n  color: #3f51b5; }\n  .mdl-button--primary.mdl-button--primary[_ngcontent-%COMP%] .mdl-ripple[_ngcontent-%COMP%] {\n    background: white; }\n  .mdl-button--primary.mdl-button--primary.mdl-button--raised[_ngcontent-%COMP%], .mdl-button--primary.mdl-button--primary.mdl-button--fab[_ngcontent-%COMP%] {\n    color: white;\n    background-color: #3f51b5; }'];
    /* @ts2dart_const */
    var StaticNodeDebugInfo$1 = (function () {
        function StaticNodeDebugInfo$1(providerTokens, componentToken, refTokens) {
            this.providerTokens = providerTokens;
            this.componentToken = componentToken;
            this.refTokens = refTokens;
        }
        return StaticNodeDebugInfo$1;
    }());
    var EMPTY_CONTEXT$2 = new Object();
    /**
     * Represents an Embedded Template that can be used to instantiate Embedded Views.
     *
     * You can access a `TemplateRef`, in two ways. Via a directive placed on a `<template>` element (or
     * directive prefixed with `*`) and have the `TemplateRef` for this Embedded View injected into the
     * constructor of the directive using the `TemplateRef` Token. Alternatively you can query for the
     * `TemplateRef` from a Component or a Directive via {@link Query}.
     *
     * To instantiate Embedded Views based on a Template, use
     * {@link ViewContainerRef#createEmbeddedView}, which will create the View and attach it to the
     * View Container.
     */
    var TemplateRef$1 = (function () {
        function TemplateRef$1() {
        }
        Object.defineProperty(TemplateRef$1.prototype, "elementRef", {
            /**
             * The location in the View where the Embedded View logically belongs to.
             *
             * The data-binding and injection contexts of Embedded Views created from this `TemplateRef`
             * inherit from the contexts of this location.
             *
             * Typically new Embedded Views are attached to the View Container of this location, but in
             * advanced use-cases, the View can be attached to a different container while keeping the
             * data-binding and injection context from the original location.
             *
             */
            // TODO(i): rename to anchor or location
            get: function () { return null; },
            enumerable: true,
            configurable: true
        });
        return TemplateRef$1;
    }());
    var TemplateRef_$1 = (function (_super) {
        __extends(TemplateRef_$1, _super);
        function TemplateRef_$1(_appElement, _viewFactory) {
            _super.call(this);
            this._appElement = _appElement;
            this._viewFactory = _viewFactory;
        }
        TemplateRef_$1.prototype.createEmbeddedView = function (context) {
            var view = this._viewFactory(this._appElement.parentView.viewUtils, this._appElement.parentInjector, this._appElement);
            if (isBlank(context)) {
                context = EMPTY_CONTEXT$2;
            }
            view.create(context, null, null);
            return view.ref;
        };
        Object.defineProperty(TemplateRef_$1.prototype, "elementRef", {
            get: function () { return this._appElement.elementRef; },
            enumerable: true,
            configurable: true
        });
        return TemplateRef_$1;
    }(TemplateRef$1));
    var NgForRow$1 = (function () {
        function NgForRow$1($implicit, index, count) {
            this.$implicit = $implicit;
            this.index = index;
            this.count = count;
        }
        Object.defineProperty(NgForRow$1.prototype, "first", {
            get: function () { return this.index === 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgForRow$1.prototype, "last", {
            get: function () { return this.index === this.count - 1; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgForRow$1.prototype, "even", {
            get: function () { return this.index % 2 === 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgForRow$1.prototype, "odd", {
            get: function () { return !this.even; },
            enumerable: true,
            configurable: true
        });
        return NgForRow$1;
    }());
    var NgFor$1 = (function () {
        function NgFor$1(_viewContainer, _templateRef, _iterableDiffers, _cdr) {
            this._viewContainer = _viewContainer;
            this._templateRef = _templateRef;
            this._iterableDiffers = _iterableDiffers;
            this._cdr = _cdr;
        }
        Object.defineProperty(NgFor$1.prototype, "ngForOf", {
            set: function (value) {
                this._ngForOf = value;
                if (isBlank$2(this._differ) && isPresent$2(value)) {
                    try {
                        this._differ = this._iterableDiffers.find(value).create(this._cdr, this._ngForTrackBy);
                    }
                    catch (e) {
                        throw new BaseException$1("Cannot find a differ supporting object '" + value + "' of type '" + getTypeNameForDebugging$2(value) + "'. NgFor only supports binding to Iterables such as Arrays.");
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgFor$1.prototype, "ngForTemplate", {
            set: function (value) {
                if (isPresent$2(value)) {
                    this._templateRef = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgFor$1.prototype, "ngForTrackBy", {
            set: function (value) { this._ngForTrackBy = value; },
            enumerable: true,
            configurable: true
        });
        NgFor$1.prototype.ngDoCheck = function () {
            if (isPresent$2(this._differ)) {
                var changes = this._differ.diff(this._ngForOf);
                if (isPresent$2(changes))
                    this._applyChanges(changes);
            }
        };
        NgFor$1.prototype._applyChanges = function (changes) {
            var _this = this;
            // TODO(rado): check if change detection can produce a change record that is
            // easier to consume than current.
            var recordViewTuples = [];
            changes.forEachRemovedItem(function (removedRecord) { return recordViewTuples.push(new RecordViewTuple$1(removedRecord, null)); });
            changes.forEachMovedItem(function (movedRecord) { return recordViewTuples.push(new RecordViewTuple$1(movedRecord, null)); });
            var insertTuples = this._bulkRemove(recordViewTuples);
            changes.forEachAddedItem(function (addedRecord) { return insertTuples.push(new RecordViewTuple$1(addedRecord, null)); });
            this._bulkInsert(insertTuples);
            for (var i = 0; i < insertTuples.length; i++) {
                this._perViewChange(insertTuples[i].view, insertTuples[i].record);
            }
            for (var i = 0, ilen = this._viewContainer.length; i < ilen; i++) {
                var viewRef = this._viewContainer.get(i);
                viewRef.context.index = i;
                viewRef.context.count = ilen;
            }
            changes.forEachIdentityChange(function (record) {
                var viewRef = _this._viewContainer.get(record.currentIndex);
                viewRef.context.$implicit = record.item;
            });
        };
        NgFor$1.prototype._perViewChange = function (view, record) {
            view.context.$implicit = record.item;
        };
        NgFor$1.prototype._bulkRemove = function (tuples) {
            tuples.sort(function (a, b) { return a.record.previousIndex - b.record.previousIndex; });
            var movedTuples = [];
            for (var i = tuples.length - 1; i >= 0; i--) {
                var tuple = tuples[i];
                // separate moved views from removed views.
                if (isPresent$2(tuple.record.currentIndex)) {
                    tuple.view =
                        this._viewContainer.detach(tuple.record.previousIndex);
                    movedTuples.push(tuple);
                }
                else {
                    this._viewContainer.remove(tuple.record.previousIndex);
                }
            }
            return movedTuples;
        };
        NgFor$1.prototype._bulkInsert = function (tuples) {
            tuples.sort(function (a, b) { return a.record.currentIndex - b.record.currentIndex; });
            for (var i = 0; i < tuples.length; i++) {
                var tuple = tuples[i];
                if (isPresent$2(tuple.view)) {
                    this._viewContainer.insert(tuple.view, tuple.record.currentIndex);
                }
                else {
                    tuple.view = this._viewContainer.createEmbeddedView(this._templateRef, new NgForRow$1(null, null, null), tuple.record.currentIndex);
                }
            }
            return tuples;
        };
        return NgFor$1;
    }());
    NgFor$1.decorators = [
        { type: Directive, args: [{ selector: '[ngFor][ngForOf]', inputs: ['ngForTrackBy', 'ngForOf', 'ngForTemplate'] },] },
    ];
    NgFor$1.ctorParameters = [
        { type: ViewContainerRef, },
        { type: TemplateRef, },
        { type: IterableDiffers, },
        { type: ChangeDetectorRef, },
    ];
    var RecordViewTuple$1 = (function () {
        function RecordViewTuple$1(record, view) {
            this.record = record;
            this.view = view;
        }
        return RecordViewTuple$1;
    }());
    var CityPicker = (function () {
        function CityPicker() {
        }
        return CityPicker;
    }());
    CityPicker.decorators = [
        { type: Component, args: [{
                    selector: 'city-picker',
                    templateUrl: 'city-picker.html',
                    styleUrls: ['city-picker.css']
                },] },
    ];
    var _scope_check$1 = wtfCreateScope("AppView#check(ascii id)");
    /**
     * Cost of making objects: http://jsperf.com/instantiate-size-of-object
     *
     */
    var AppView$1 = (function () {
        function AppView$1(clazz, componentType, type, viewUtils, parentInjector, declarationAppElement, cdMode) {
            this.clazz = clazz;
            this.componentType = componentType;
            this.type = type;
            this.viewUtils = viewUtils;
            this.parentInjector = parentInjector;
            this.declarationAppElement = declarationAppElement;
            this.cdMode = cdMode;
            this.contentChildren = [];
            this.viewChildren = [];
            this.viewContainerElement = null;
            // The names of the below fields must be kept in sync with codegen_name_util.ts or
            // change detection will fail.
            this.cdState = ChangeDetectorState.NeverChecked;
            this.destroyed = false;
            this.ref = new ViewRef_(this);
            if (type === ViewType.COMPONENT || type === ViewType.HOST) {
                this.renderer = viewUtils.renderComponent(componentType);
            }
            else {
                this.renderer = declarationAppElement.parentView.renderer;
            }
        }
        AppView$1.prototype.create = function (context, givenProjectableNodes, rootSelectorOrNode) {
            this.context = context;
            var projectableNodes;
            switch (this.type) {
                case ViewType.COMPONENT:
                    projectableNodes = ensureSlotCount(givenProjectableNodes, this.componentType.slotCount);
                    break;
                case ViewType.EMBEDDED:
                    projectableNodes = this.declarationAppElement.parentView.projectableNodes;
                    break;
                case ViewType.HOST:
                    // Note: Don't ensure the slot count for the projectableNodes as we store
                    // them only for the contained component view (which will later check the slot count...)
                    projectableNodes = givenProjectableNodes;
                    break;
            }
            this._hasExternalHostElement = isPresent(rootSelectorOrNode);
            this.projectableNodes = projectableNodes;
            return this.createInternal(rootSelectorOrNode);
        };
        /**
         * Overwritten by implementations.
         * Returns the AppElement for the host element for ViewType.HOST.
         */
        AppView$1.prototype.createInternal = function (rootSelectorOrNode) { return null; };
        AppView$1.prototype.init = function (rootNodesOrAppElements, allNodes, disposables, subscriptions) {
            this.rootNodesOrAppElements = rootNodesOrAppElements;
            this.allNodes = allNodes;
            this.disposables = disposables;
            this.subscriptions = subscriptions;
            if (this.type === ViewType.COMPONENT) {
                // Note: the render nodes have been attached to their host element
                // in the ViewFactory already.
                this.declarationAppElement.parentView.viewChildren.push(this);
                this.dirtyParentQueriesInternal();
            }
        };
        AppView$1.prototype.selectOrCreateHostElement = function (elementName, rootSelectorOrNode, debugInfo) {
            var hostElement;
            if (isPresent(rootSelectorOrNode)) {
                hostElement = this.renderer.selectRootElement(rootSelectorOrNode, debugInfo);
            }
            else {
                hostElement = this.renderer.createElement(null, elementName, debugInfo);
            }
            return hostElement;
        };
        AppView$1.prototype.injectorGet = function (token, nodeIndex, notFoundResult) {
            return this.injectorGetInternal(token, nodeIndex, notFoundResult);
        };
        /**
         * Overwritten by implementations
         */
        AppView$1.prototype.injectorGetInternal = function (token, nodeIndex, notFoundResult) {
            return notFoundResult;
        };
        AppView$1.prototype.injector = function (nodeIndex) {
            if (isPresent(nodeIndex)) {
                return new ElementInjector(this, nodeIndex);
            }
            else {
                return this.parentInjector;
            }
        };
        AppView$1.prototype.destroy = function () {
            if (this._hasExternalHostElement) {
                this.renderer.detachView(this.flatRootNodes);
            }
            else if (isPresent(this.viewContainerElement)) {
                this.viewContainerElement.detachView(this.viewContainerElement.nestedViews.indexOf(this));
            }
            this._destroyRecurse();
        };
        AppView$1.prototype._destroyRecurse = function () {
            if (this.destroyed) {
                return;
            }
            var children = this.contentChildren;
            for (var i = 0; i < children.length; i++) {
                children[i]._destroyRecurse();
            }
            children = this.viewChildren;
            for (var i = 0; i < children.length; i++) {
                children[i]._destroyRecurse();
            }
            this.destroyLocal();
            this.destroyed = true;
        };
        AppView$1.prototype.destroyLocal = function () {
            var hostElement = this.type === ViewType.COMPONENT ? this.declarationAppElement.nativeElement : null;
            for (var i = 0; i < this.disposables.length; i++) {
                this.disposables[i]();
            }
            for (var i = 0; i < this.subscriptions.length; i++) {
                ObservableWrapper.dispose(this.subscriptions[i]);
            }
            this.destroyInternal();
            this.dirtyParentQueriesInternal();
            this.renderer.destroyView(hostElement, this.allNodes);
        };
        /**
         * Overwritten by implementations
         */
        AppView$1.prototype.destroyInternal = function () { };
        Object.defineProperty(AppView$1.prototype, "changeDetectorRef", {
            get: function () { return this.ref; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppView$1.prototype, "parent", {
            get: function () {
                return isPresent(this.declarationAppElement) ? this.declarationAppElement.parentView : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppView$1.prototype, "flatRootNodes", {
            get: function () { return flattenNestedViewRenderNodes(this.rootNodesOrAppElements); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppView$1.prototype, "lastRootNode", {
            get: function () {
                var lastNode = this.rootNodesOrAppElements.length > 0 ?
                    this.rootNodesOrAppElements[this.rootNodesOrAppElements.length - 1] :
                    null;
                return _findLastRenderNode$1(lastNode);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Overwritten by implementations
         */
        AppView$1.prototype.dirtyParentQueriesInternal = function () { };
        AppView$1.prototype.detectChanges = function (throwOnChange) {
            var s = _scope_check$1(this.clazz);
            if (this.cdMode === ChangeDetectionStrategy.Detached ||
                this.cdMode === ChangeDetectionStrategy.Checked ||
                this.cdState === ChangeDetectorState.Errored)
                return;
            if (this.destroyed) {
                this.throwDestroyedError('detectChanges');
            }
            this.detectChangesInternal(throwOnChange);
            if (this.cdMode === ChangeDetectionStrategy.CheckOnce)
                this.cdMode = ChangeDetectionStrategy.Checked;
            this.cdState = ChangeDetectorState.CheckedBefore;
            wtfLeave(s);
        };
        /**
         * Overwritten by implementations
         */
        AppView$1.prototype.detectChangesInternal = function (throwOnChange) {
            this.detectContentChildrenChanges(throwOnChange);
            this.detectViewChildrenChanges(throwOnChange);
        };
        AppView$1.prototype.detectContentChildrenChanges = function (throwOnChange) {
            for (var i = 0; i < this.contentChildren.length; ++i) {
                this.contentChildren[i].detectChanges(throwOnChange);
            }
        };
        AppView$1.prototype.detectViewChildrenChanges = function (throwOnChange) {
            for (var i = 0; i < this.viewChildren.length; ++i) {
                this.viewChildren[i].detectChanges(throwOnChange);
            }
        };
        AppView$1.prototype.addToContentChildren = function (renderAppElement) {
            renderAppElement.parentView.contentChildren.push(this);
            this.viewContainerElement = renderAppElement;
            this.dirtyParentQueriesInternal();
        };
        AppView$1.prototype.removeFromContentChildren = function (renderAppElement) {
            ListWrapper.remove(renderAppElement.parentView.contentChildren, this);
            this.dirtyParentQueriesInternal();
            this.viewContainerElement = null;
        };
        AppView$1.prototype.markAsCheckOnce = function () { this.cdMode = ChangeDetectionStrategy.CheckOnce; };
        AppView$1.prototype.markPathToRootAsCheckOnce = function () {
            var c = this;
            while (isPresent(c) && c.cdMode !== ChangeDetectionStrategy.Detached) {
                if (c.cdMode === ChangeDetectionStrategy.Checked) {
                    c.cdMode = ChangeDetectionStrategy.CheckOnce;
                }
                var parentEl = c.type === ViewType.COMPONENT ? c.declarationAppElement : c.viewContainerElement;
                c = isPresent(parentEl) ? parentEl.parentView : null;
            }
        };
        AppView$1.prototype.eventHandler = function (cb) { return cb; };
        AppView$1.prototype.throwDestroyedError = function (details) { throw new ViewDestroyedException(details); };
        return AppView$1;
    }());
    var DebugAppView$1 = (function (_super) {
        __extends(DebugAppView$1, _super);
        function DebugAppView$1(clazz, componentType, type, viewUtils, parentInjector, declarationAppElement, cdMode, staticNodeDebugInfos) {
            _super.call(this, clazz, componentType, type, viewUtils, parentInjector, declarationAppElement, cdMode);
            this.staticNodeDebugInfos = staticNodeDebugInfos;
            this._currentDebugContext = null;
        }
        DebugAppView$1.prototype.create = function (context, givenProjectableNodes, rootSelectorOrNode) {
            this._resetDebug();
            try {
                return _super.prototype.create.call(this, context, givenProjectableNodes, rootSelectorOrNode);
            }
            catch (e) {
                this._rethrowWithContext(e, e.stack);
                throw e;
            }
        };
        DebugAppView$1.prototype.injectorGet = function (token, nodeIndex, notFoundResult) {
            this._resetDebug();
            try {
                return _super.prototype.injectorGet.call(this, token, nodeIndex, notFoundResult);
            }
            catch (e) {
                this._rethrowWithContext(e, e.stack);
                throw e;
            }
        };
        DebugAppView$1.prototype.destroyLocal = function () {
            this._resetDebug();
            try {
                _super.prototype.destroyLocal.call(this);
            }
            catch (e) {
                this._rethrowWithContext(e, e.stack);
                throw e;
            }
        };
        DebugAppView$1.prototype.detectChanges = function (throwOnChange) {
            this._resetDebug();
            try {
                _super.prototype.detectChanges.call(this, throwOnChange);
            }
            catch (e) {
                this._rethrowWithContext(e, e.stack);
                throw e;
            }
        };
        DebugAppView$1.prototype._resetDebug = function () { this._currentDebugContext = null; };
        DebugAppView$1.prototype.debug = function (nodeIndex, rowNum, colNum) {
            return this._currentDebugContext = new DebugContext(this, nodeIndex, rowNum, colNum);
        };
        DebugAppView$1.prototype._rethrowWithContext = function (e, stack) {
            if (!(e instanceof ViewWrappedException)) {
                if (!(e instanceof ExpressionChangedAfterItHasBeenCheckedException)) {
                    this.cdState = ChangeDetectorState.Errored;
                }
                if (isPresent(this._currentDebugContext)) {
                    throw new ViewWrappedException(e, stack, this._currentDebugContext);
                }
            }
        };
        DebugAppView$1.prototype.eventHandler = function (cb) {
            var _this = this;
            var superHandler = _super.prototype.eventHandler.call(this, cb);
            return function (event) {
                _this._resetDebug();
                try {
                    return superHandler(event);
                }
                catch (e) {
                    _this._rethrowWithContext(e, e.stack);
                    throw e;
                }
            };
        };
        return DebugAppView$1;
    }(AppView$1));
    function _findLastRenderNode$1(node) {
        var lastNode;
        if (node instanceof AppElement) {
            var appEl = node;
            lastNode = appEl.nativeElement;
            if (isPresent(appEl.nestedViews)) {
                // Note: Views might have no root nodes at all!
                for (var i = appEl.nestedViews.length - 1; i >= 0; i--) {
                    var nestedView = appEl.nestedViews[i];
                    if (nestedView.rootNodesOrAppElements.length > 0) {
                        lastNode = _findLastRenderNode$1(nestedView.rootNodesOrAppElements[nestedView.rootNodesOrAppElements.length - 1]);
                    }
                }
            }
        }
        else {
            lastNode = node;
        }
        return lastNode;
    }
    var WeatherCard = (function () {
        function WeatherCard() {
        }
        return WeatherCard;
    }());
    WeatherCard.decorators = [
        { type: Component, args: [{
                    selector: 'weather-card',
                    templateUrl: 'weather-card.html',
                    styleUrls: ['weather-card.css']
                },] },
    ];
    var WEATHER_URL = function (path) {
        if (path === void 0) { path = ''; }
        return ("https://publicdata-weather.firebaseio.com/" + path + ".json");
    };
    var getJSON = function (url) {
        return new Observable(function (observer) {
            var xhr = new XMLHttpRequest();
            var onReadyStateChange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        observer.next(JSON.parse(xhr.response));
                        observer.complete();
                        return;
                    }
                    observer.error(xhr.response);
                }
            };
            var onError = function (err) { return observer.error(err); };
            xhr.addEventListener('readystatechange', onReadyStateChange);
            xhr.addEventListener('error', onError);
            xhr.open('GET', url);
            xhr.send();
            return function (_) {
                xhr.addEventListener('readystatechange', onReadyStateChange);
                xhr.addEventListener('error', onError);
                xhr.abort();
            };
        });
    };
    var WeatherAPI = (function () {
        function WeatherAPI() {
        }
        WeatherAPI.prototype.fetchCities = function () {
            return getJSON(WEATHER_URL() + "?sparse=true");
        };
        WeatherAPI.prototype.fetchCity = function (cityName) {
            return getJSON(WEATHER_URL(cityName));
        };
        return WeatherAPI;
    }());
    WeatherAPI.decorators = [
        { type: Injectable },
    ];
    var CITIES = [
        {
            "key": "austin",
            "name": "Austin"
        },
        {
            "key": "baltimore",
            "name": "Baltimore"
        },
        {
            "key": "boston",
            "name": "Boston"
        },
        {
            "key": "charlotte",
            "name": "Charlotte"
        },
        {
            "key": "chicago",
            "name": "Chicago"
        },
        {
            "key": "columbus",
            "name": "Columbus"
        },
        {
            "key": "dallas",
            "name": "Dallas"
        },
        {
            "key": "denver",
            "name": "Denver"
        },
        {
            "key": "detroit",
            "name": "Detroit"
        },
        {
            "key": "elpaso",
            "name": "El Paso"
        },
        {
            "key": "fortworth",
            "name": "Fort Worth"
        },
        {
            "key": "houston",
            "name": "Houston"
        },
        {
            "key": "indianapolis",
            "name": "Indianapolis"
        },
        {
            "key": "jacksonville",
            "name": "Jacksonville"
        },
        {
            "key": "lasvegas",
            "name": "Las Vegas"
        },
        {
            "key": "losangeles",
            "name": "Los Angeles"
        },
        {
            "key": "memphis",
            "name": "Memphis"
        },
        {
            "key": "milwaukee",
            "name": "Milwaukee"
        },
        {
            "key": "nashville",
            "name": "Nashville"
        },
        {
            "key": "newyork",
            "name": "New York"
        },
        {
            "key": "oklahomacity",
            "name": "Oklahoma City"
        },
        {
            "key": "philadelphia",
            "name": "Philadelphia"
        },
        {
            "key": "phoenix",
            "name": "Phoenix"
        },
        {
            "key": "portland",
            "name": "Portland"
        },
        {
            "key": "sanantonio",
            "name": "San Antonio"
        },
        {
            "key": "sandiego",
            "name": "San Diego"
        },
        {
            "key": "sanfrancisco",
            "name": "San Francisco"
        },
        {
            "key": "sanjose",
            "name": "San Jose"
        },
        {
            "key": "seattle",
            "name": "Seattle"
        },
        {
            "key": "tucson",
            "name": "Tucson"
        },
        {
            "key": "washington",
            "name": "Washington"
        }
    ];
    var WeatherData = (function () {
        function WeatherData() {
            this.cities = CITIES;
        }
        return WeatherData;
    }());
    WeatherData.decorators = [
        { type: Injectable },
    ];
    WeatherData.ctorParameters = [];
    var WeatherApp = (function () {
        function WeatherApp(weatherAPI, renderer, _zone) {
            this.weatherAPI = weatherAPI;
            this.renderer = renderer;
            this._zone = _zone;
            this.cities = [];
            window['Comp'] = this;
        }
        WeatherApp.prototype.ngAfterViewInit = function () {
        };
        WeatherApp.prototype.add = function () {
            var _this = this;
            this._zone.run(function () {
                _this.cities = [{ id: 1 }];
            });
            //this.renderer.setElementClass(this.cityPicker.nativeElement, 'dialog-container--visible', true)
        };
        WeatherApp.prototype.refresh = function () {
            console.log('refreshing...');
        };
        return WeatherApp;
    }());
    WeatherApp.decorators = [
        { type: Component, args: [{
                    selector: 'weather-app',
                    templateUrl: 'app.html',
                    styleUrls: ['app.css'],
                    directives: [NgFor, WeatherCard, CityPicker],
                    providers: [WeatherAPI, WeatherData]
                },] },
    ];
    WeatherApp.ctorParameters = [
        { type: WeatherAPI, },
        { type: Renderer, },
        { type: NgZone, },
    ];
    /**
     * An AppElement is created for elements that have a ViewContainerRef,
     * a nested component or a <template> element to keep data around
     * that is needed for later instantiations.
     */
    var AppElement$1 = (function () {
        function AppElement$1(index, parentIndex, parentView, nativeElement) {
            this.index = index;
            this.parentIndex = parentIndex;
            this.parentView = parentView;
            this.nativeElement = nativeElement;
            this.nestedViews = null;
            this.componentView = null;
        }
        Object.defineProperty(AppElement$1.prototype, "elementRef", {
            get: function () { return new ElementRef(this.nativeElement); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppElement$1.prototype, "vcRef", {
            get: function () { return new ViewContainerRef_(this); },
            enumerable: true,
            configurable: true
        });
        AppElement$1.prototype.initComponent = function (component, componentConstructorViewQueries, view) {
            this.component = component;
            this.componentConstructorViewQueries = componentConstructorViewQueries;
            this.componentView = view;
        };
        Object.defineProperty(AppElement$1.prototype, "parentInjector", {
            get: function () { return this.parentView.injector(this.parentIndex); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppElement$1.prototype, "injector", {
            get: function () { return this.parentView.injector(this.index); },
            enumerable: true,
            configurable: true
        });
        AppElement$1.prototype.mapNestedViews = function (nestedViewClass, callback) {
            var result = [];
            if (isPresent(this.nestedViews)) {
                this.nestedViews.forEach(function (nestedView) {
                    if (nestedView.clazz === nestedViewClass) {
                        result.push(callback(nestedView));
                    }
                });
            }
            return result;
        };
        AppElement$1.prototype.attachView = function (view, viewIndex) {
            if (view.type === ViewType.COMPONENT) {
                throw new BaseException("Component views can't be moved!");
            }
            var nestedViews = this.nestedViews;
            if (nestedViews == null) {
                nestedViews = [];
                this.nestedViews = nestedViews;
            }
            ListWrapper.insert(nestedViews, viewIndex, view);
            var refRenderNode;
            if (viewIndex > 0) {
                var prevView = nestedViews[viewIndex - 1];
                refRenderNode = prevView.lastRootNode;
            }
            else {
                refRenderNode = this.nativeElement;
            }
            if (isPresent(refRenderNode)) {
                view.renderer.attachViewAfter(refRenderNode, view.flatRootNodes);
            }
            view.addToContentChildren(this);
        };
        AppElement$1.prototype.detachView = function (viewIndex) {
            var view = ListWrapper.removeAt(this.nestedViews, viewIndex);
            if (view.type === ViewType.COMPONENT) {
                throw new BaseException("Component views can't be moved!");
            }
            view.renderer.detachView(view.flatRootNodes);
            view.removeFromContentChildren(this);
            return view;
        };
        return AppElement$1;
    }());
    function checkBinding$1(throwOnChange, oldValue, newValue) {
        if (throwOnChange) {
            if (!devModeEqual(oldValue, newValue)) {
                throw new ExpressionChangedAfterItHasBeenCheckedException(oldValue, newValue, null);
            }
            return false;
        }
        else {
            return !looseIdentical(oldValue, newValue);
        }
    }
    var ViewType$1;
    (function (ViewType) {
        // A view that contains the host element with bound component directive.
        // Contains a COMPONENT view
        ViewType[ViewType["HOST"] = 0] = "HOST";
        // The view of the component
        // Can contain 0 to n EMBEDDED views
        ViewType[ViewType["COMPONENT"] = 1] = "COMPONENT";
        // A view that is embedded into another View via a <template> element
        // inside of a COMPONENT view
        ViewType[ViewType["EMBEDDED"] = 2] = "EMBEDDED";
    })(ViewType$1 || (ViewType$1 = {}));
    /**
     * Structural diffing for `Object`s and `Map`s.
     */
    var keyValDiff$1 = 
    /*@ts2dart_const*/ [new DefaultKeyValueDifferFactory()];
    /**
     * Structural diffing for `Iterable` types such as `Array`s.
     */
    var iterableDiff$1 = 
    /*@ts2dart_const*/ [new DefaultIterableDifferFactory()];
    var defaultKeyValueDiffers$1 = new KeyValueDiffers(keyValDiff$1);
    /**
     * A repository of different iterable diffing strategies used by NgFor, NgClass, and others.
     * @ts2dart_const
     */
    /**
     * This file is generated by the Angular 2 template compiler.
     * Do not edit.
     */
    var styles$1 = ['.dialog[_ngcontent-%COMP%] {\n  background: #FFF;\n  border-radius: 2px;\n  box-shadow: 0 0 14px rgba(0, 0, 0, 0.24), 0 14px 28px rgba(0, 0, 0, 0.48);\n  min-width: 280px;\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  -webkit-transform: translate(-50%, -50%) translateY(30px);\n          transform: translate(-50%, -50%) translateY(30px);\n  -webkit-transition: -webkit-transform 0.333s cubic-bezier(0, 0, 0.21, 1) 0.05s;\n  transition: -webkit-transform 0.333s cubic-bezier(0, 0, 0.21, 1) 0.05s;\n  transition: transform 0.333s cubic-bezier(0, 0, 0.21, 1) 0.05s;\n  transition: transform 0.333s cubic-bezier(0, 0, 0.21, 1) 0.05s, -webkit-transform 0.333s cubic-bezier(0, 0, 0.21, 1) 0.05s; }\n\n.dialog[_ngcontent-%COMP%] > div[_ngcontent-%COMP%] {\n  padding-left: 24px;\n  padding-right: 24px; }\n\n.dialog-title[_ngcontent-%COMP%] {\n  padding-top: 20px;\n  font-size: 1.25em; }\n\n.dialog-body[_ngcontent-%COMP%] {\n  padding-top: 20px;\n  padding-bottom: 24px; }\n  .dialog-body[_ngcontent-%COMP%] select[_ngcontent-%COMP%] {\n    width: 100%;\n    font-size: 2em; }\n\n.dialog-buttons[_ngcontent-%COMP%] {\n  padding: 8px !important;\n  float: right; }'];
    /**
     * Defines template and style encapsulation options available for Component's {@link View}.
     *
     * See {@link ViewMetadata#encapsulation}.
     */
    var ViewEncapsulation$1;
    (function (ViewEncapsulation) {
        /**
         * Emulate `Native` scoping of styles by adding an attribute containing surrogate id to the Host
         * Element and pre-processing the style rules provided via
         * {@link ViewMetadata#styles} or {@link ViewMetadata#stylesUrls}, and adding the new Host Element
         * attribute to all selectors.
         *
         * This is the default option.
         */
        ViewEncapsulation[ViewEncapsulation["Emulated"] = 0] = "Emulated";
        /**
         * Use the native encapsulation mechanism of the renderer.
         *
         * For the DOM this means using [Shadow DOM](https://w3c.github.io/webcomponents/spec/shadow/) and
         * creating a ShadowRoot for Component's Host Element.
         */
        ViewEncapsulation[ViewEncapsulation["Native"] = 1] = "Native";
        /**
         * Don't provide any template or style encapsulation.
         */
        ViewEncapsulation[ViewEncapsulation["None"] = 2] = "None";
    })(ViewEncapsulation$1 || (ViewEncapsulation$1 = {}));
    /**
     * Represents an instance of a Component created via a {@link ComponentFactory}.
     *
     * `ComponentRef` provides access to the Component Instance as well other objects related to this
     * Component Instance and allows you to destroy the Component Instance via the {@link #destroy}
     * method.
     */
    var ComponentRef$1 = (function () {
        function ComponentRef$1() {
        }
        Object.defineProperty(ComponentRef$1.prototype, "location", {
            /**
             * Location of the Host Element of this Component Instance.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentRef$1.prototype, "injector", {
            /**
             * The injector on which the component instance exists.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentRef$1.prototype, "instance", {
            /**
             * The instance of the Component.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ComponentRef$1.prototype, "hostView", {
            /**
             * The {@link ViewRef} of the Host View of this Component instance.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ComponentRef$1.prototype, "changeDetectorRef", {
            /**
             * The {@link ChangeDetectorRef} of the Component instance.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentRef$1.prototype, "componentType", {
            /**
             * The component type.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        return ComponentRef$1;
    }());
    var ComponentRef_$1 = (function (_super) {
        __extends(ComponentRef_$1, _super);
        function ComponentRef_$1(_hostElement, _componentType) {
            _super.call(this);
            this._hostElement = _hostElement;
            this._componentType = _componentType;
        }
        Object.defineProperty(ComponentRef_$1.prototype, "location", {
            get: function () { return this._hostElement.elementRef; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentRef_$1.prototype, "injector", {
            get: function () { return this._hostElement.injector; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentRef_$1.prototype, "instance", {
            get: function () { return this._hostElement.component; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ComponentRef_$1.prototype, "hostView", {
            get: function () { return this._hostElement.parentView.ref; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ComponentRef_$1.prototype, "changeDetectorRef", {
            get: function () { return this._hostElement.parentView.ref; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ComponentRef_$1.prototype, "componentType", {
            get: function () { return this._componentType; },
            enumerable: true,
            configurable: true
        });
        ComponentRef_$1.prototype.destroy = function () { this._hostElement.parentView.destroy(); };
        ComponentRef_$1.prototype.onDestroy = function (callback) { this.hostView.onDestroy(callback); };
        return ComponentRef_$1;
    }(ComponentRef$1));
    var EMPTY_CONTEXT$3 = new Object();
    /*@ts2dart_const*/
    var ComponentFactory$1 = (function () {
        function ComponentFactory$1(selector, _viewFactory, _componentType) {
            this.selector = selector;
            this._viewFactory = _viewFactory;
            this._componentType = _componentType;
        }
        Object.defineProperty(ComponentFactory$1.prototype, "componentType", {
            get: function () { return this._componentType; },
            enumerable: true,
            configurable: true
        });
        /**
         * Creates a new component.
         */
        ComponentFactory$1.prototype.create = function (injector, projectableNodes, rootSelectorOrNode) {
            if (projectableNodes === void 0) { projectableNodes = null; }
            if (rootSelectorOrNode === void 0) { rootSelectorOrNode = null; }
            var vu = injector.get(ViewUtils);
            if (isBlank(projectableNodes)) {
                projectableNodes = [];
            }
            // Note: Host views don't need a declarationAppElement!
            var hostView = this._viewFactory(vu, injector, null);
            var hostElement = hostView.create(EMPTY_CONTEXT$3, projectableNodes, rootSelectorOrNode);
            return new ComponentRef_$1(hostElement, this._componentType);
        };
        return ComponentFactory$1;
    }());
    var styles_CityPicker = [styles$1];
    var nodeDebugInfos_CityPicker0 = [
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {})
    ];
    var renderType_CityPicker = null;
    var _View_CityPicker0 = (function (_super) {
        __extends(_View_CityPicker0, _super);
        function _View_CityPicker0(viewUtils, parentInjector, declarationEl) {
            _super.call(this, _View_CityPicker0, renderType_CityPicker, ViewType$1.COMPONENT, viewUtils, parentInjector, declarationEl, ChangeDetectionStrategy.CheckAlways, nodeDebugInfos_CityPicker0);
        }
        _View_CityPicker0.prototype.createInternal = function (rootSelector) {
            var parentRenderNode = this.renderer.createViewRoot(this.declarationAppElement.nativeElement);
            this._el_0 = this.renderer.createElement(parentRenderNode, 'div', this.debug(0, 0, 0));
            this.renderer.setElementAttribute(this._el_0, 'class', 'dialog');
            this._text_1 = this.renderer.createText(this._el_0, '\n  ', this.debug(1, 0, 20));
            this._el_2 = this.renderer.createElement(this._el_0, 'div', this.debug(2, 1, 2));
            this.renderer.setElementAttribute(this._el_2, 'class', 'dialog-title');
            this._text_3 = this.renderer.createText(this._el_2, 'Add new city', this.debug(3, 1, 28));
            this._text_4 = this.renderer.createText(this._el_0, '\n  ', this.debug(4, 1, 46));
            this._el_5 = this.renderer.createElement(this._el_0, 'div', this.debug(5, 2, 2));
            this.renderer.setElementAttribute(this._el_5, 'class', 'dialog-body');
            this._text_6 = this.renderer.createText(this._el_5, '\n    ', this.debug(6, 2, 27));
            this._el_7 = this.renderer.createElement(this._el_5, 'select', this.debug(7, 3, 4));
            this.renderer.setElementAttribute(this._el_7, 'id', 'selectCityToAdd');
            this._text_8 = this.renderer.createText(this._el_7, '\n          ', this.debug(8, 3, 33));
            this._el_9 = this.renderer.createElement(this._el_7, 'option', this.debug(9, 4, 10));
            this.renderer.setElementAttribute(this._el_9, 'value', 'austin');
            this._text_10 = this.renderer.createText(this._el_9, 'Austin, TX', this.debug(10, 4, 33));
            this._text_11 = this.renderer.createText(this._el_7, '\n          ', this.debug(11, 4, 52));
            this._el_12 = this.renderer.createElement(this._el_7, 'option', this.debug(12, 5, 10));
            this.renderer.setElementAttribute(this._el_12, 'value', 'boston');
            this._text_13 = this.renderer.createText(this._el_12, 'Boston, MA', this.debug(13, 5, 33));
            this._text_14 = this.renderer.createText(this._el_7, '\n          ', this.debug(14, 5, 52));
            this._el_15 = this.renderer.createElement(this._el_7, 'option', this.debug(15, 6, 10));
            this.renderer.setElementAttribute(this._el_15, 'value', 'chicago');
            this._text_16 = this.renderer.createText(this._el_15, 'Chicago, IL', this.debug(16, 6, 34));
            this._text_17 = this.renderer.createText(this._el_7, '\n          ', this.debug(17, 6, 54));
            this._el_18 = this.renderer.createElement(this._el_7, 'option', this.debug(18, 7, 10));
            this.renderer.setElementAttribute(this._el_18, 'value', 'portland');
            this._text_19 = this.renderer.createText(this._el_18, 'Portland, OR', this.debug(19, 7, 35));
            this._text_20 = this.renderer.createText(this._el_7, '\n          ', this.debug(20, 7, 56));
            this._el_21 = this.renderer.createElement(this._el_7, 'option', this.debug(21, 8, 10));
            this.renderer.setElementAttribute(this._el_21, 'value', 'sanfrancisco');
            this._text_22 = this.renderer.createText(this._el_21, 'San Francisco, CA', this.debug(22, 8, 39));
            this._text_23 = this.renderer.createText(this._el_7, '\n          ', this.debug(23, 8, 65));
            this._el_24 = this.renderer.createElement(this._el_7, 'option', this.debug(24, 9, 10));
            this.renderer.setElementAttribute(this._el_24, 'value', 'seattle');
            this._text_25 = this.renderer.createText(this._el_24, 'Seattle, WA', this.debug(25, 9, 34));
            this._text_26 = this.renderer.createText(this._el_7, '\n        ', this.debug(26, 9, 54));
            this._text_27 = this.renderer.createText(this._el_5, '\n  ', this.debug(27, 10, 17));
            this._text_28 = this.renderer.createText(this._el_0, '\n  ', this.debug(28, 11, 8));
            this._el_29 = this.renderer.createElement(this._el_0, 'div', this.debug(29, 12, 2));
            this.renderer.setElementAttribute(this._el_29, 'class', 'dialog-buttons');
            this._text_30 = this.renderer.createText(this._el_29, '\n    ', this.debug(30, 12, 30));
            this._el_31 = this.renderer.createElement(this._el_29, 'button', this.debug(31, 13, 4));
            this.renderer.setElementAttribute(this._el_31, 'class', 'button');
            this.renderer.setElementAttribute(this._el_31, 'id', 'butAddCity');
            this._text_32 = this.renderer.createText(this._el_31, 'Add', this.debug(32, 13, 43));
            this._text_33 = this.renderer.createText(this._el_29, '\n    ', this.debug(33, 13, 55));
            this._el_34 = this.renderer.createElement(this._el_29, 'button', this.debug(34, 14, 4));
            this.renderer.setElementAttribute(this._el_34, 'class', 'button');
            this.renderer.setElementAttribute(this._el_34, 'id', 'butAddCancel');
            this._text_35 = this.renderer.createText(this._el_34, 'Cancel', this.debug(35, 14, 45));
            this._text_36 = this.renderer.createText(this._el_29, '\n  ', this.debug(36, 14, 60));
            this._text_37 = this.renderer.createText(this._el_0, '\n', this.debug(37, 15, 8));
            this._text_38 = this.renderer.createText(parentRenderNode, '\n', this.debug(38, 16, 6));
            this.init([], [
                this._el_0,
                this._text_1,
                this._el_2,
                this._text_3,
                this._text_4,
                this._el_5,
                this._text_6,
                this._el_7,
                this._text_8,
                this._el_9,
                this._text_10,
                this._text_11,
                this._el_12,
                this._text_13,
                this._text_14,
                this._el_15,
                this._text_16,
                this._text_17,
                this._el_18,
                this._text_19,
                this._text_20,
                this._el_21,
                this._text_22,
                this._text_23,
                this._el_24,
                this._text_25,
                this._text_26,
                this._text_27,
                this._text_28,
                this._el_29,
                this._text_30,
                this._el_31,
                this._text_32,
                this._text_33,
                this._el_34,
                this._text_35,
                this._text_36,
                this._text_37,
                this._text_38
            ], [], []);
            return null;
        };
        return _View_CityPicker0;
    }(DebugAppView$1));
    function viewFactory_CityPicker0(viewUtils, parentInjector, declarationEl) {
        if ((renderType_CityPicker === null)) {
            (renderType_CityPicker = viewUtils.createRenderComponentType('/Users/robwormald/Dev/demos/ng2-pwa-demo/src/city-picker.html', 0, ViewEncapsulation$1.Emulated, styles_CityPicker));
        }
        return new _View_CityPicker0(viewUtils, parentInjector, declarationEl);
    }
    var styles_CityPicker_Host = [];
    var nodeDebugInfos_CityPicker_Host0 = [new StaticNodeDebugInfo$1([CityPicker], CityPicker, {})];
    var renderType_CityPicker_Host = null;
    var _View_CityPicker_Host0 = (function (_super) {
        __extends(_View_CityPicker_Host0, _super);
        function _View_CityPicker_Host0(viewUtils, parentInjector, declarationEl) {
            _super.call(this, _View_CityPicker_Host0, renderType_CityPicker_Host, ViewType$1.HOST, viewUtils, parentInjector, declarationEl, ChangeDetectionStrategy.CheckAlways, nodeDebugInfos_CityPicker_Host0);
        }
        _View_CityPicker_Host0.prototype.createInternal = function (rootSelector) {
            this._el_0 = this.selectOrCreateHostElement('city-picker', rootSelector, this.debug(0, 0, 0));
            this._appEl_0 = new AppElement$1(0, null, this, this._el_0);
            var compView_0 = viewFactory_CityPicker0(this.viewUtils, this.injector(0), this._appEl_0);
            this._CityPicker_0_4 = new CityPicker();
            this._appEl_0.initComponent(this._CityPicker_0_4, [], compView_0);
            compView_0.create(this._CityPicker_0_4, this.projectableNodes, null);
            this.init([].concat([this._el_0]), [this._el_0], [], []);
            return this._appEl_0;
        };
        _View_CityPicker_Host0.prototype.injectorGetInternal = function (token, requestNodeIndex, notFoundResult) {
            if (((token === CityPicker) && (0 === requestNodeIndex))) {
                return this._CityPicker_0_4;
            }
            return notFoundResult;
        };
        return _View_CityPicker_Host0;
    }(DebugAppView$1));
    function viewFactory_CityPicker_Host0(viewUtils, parentInjector, declarationEl) {
        if ((renderType_CityPicker_Host === null)) {
            (renderType_CityPicker_Host = viewUtils.createRenderComponentType('', 0, ViewEncapsulation$1.Emulated, styles_CityPicker_Host));
        }
        return new _View_CityPicker_Host0(viewUtils, parentInjector, declarationEl);
    }
    var CityPickerNgFactory = new ComponentFactory$1('city-picker', viewFactory_CityPicker_Host0, CityPicker);
    /**
     * This file is generated by the Angular 2 template compiler.
     * Do not edit.
     */
    var styles$2 = ['[_nghost-%COMP%] {\n  display: block;\n  padding: 16px;\n  position: relative;\n  box-sizing: border-box;\n  background: #fff;\n  border-radius: 2px;\n  margin: 16px;\n  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12); }\n\n.weather-forecast[_ngcontent-%COMP%] .location[_ngcontent-%COMP%] {\n  font-size: 1.75em; }\n\n.weather-forecast[_ngcontent-%COMP%] .date[_ngcontent-%COMP%], .weather-forecast[_ngcontent-%COMP%] .description[_ngcontent-%COMP%] {\n  font-size: 1.25em; }\n\n.weather-forecast[_ngcontent-%COMP%] .current[_ngcontent-%COMP%] {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex; }\n  .weather-forecast[_ngcontent-%COMP%] .current[_ngcontent-%COMP%] .icon[_ngcontent-%COMP%] {\n    width: 128px;\n    height: 128px; }\n  .weather-forecast[_ngcontent-%COMP%] .current[_ngcontent-%COMP%] .visual[_ngcontent-%COMP%] {\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -ms-flexbox;\n    display: flex;\n    font-size: 4em; }\n    .weather-forecast[_ngcontent-%COMP%] .current[_ngcontent-%COMP%] .visual[_ngcontent-%COMP%] .scale[_ngcontent-%COMP%] {\n      font-size: 0.5em;\n      vertical-align: super; }\n  .weather-forecast[_ngcontent-%COMP%] .current[_ngcontent-%COMP%] .visual[_ngcontent-%COMP%], .weather-forecast[_ngcontent-%COMP%] .current[_ngcontent-%COMP%] .description[_ngcontent-%COMP%] {\n    -webkit-box-flex: 1;\n    -webkit-flex-grow: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1; }\n  .weather-forecast[_ngcontent-%COMP%] .current[_ngcontent-%COMP%] .feels-like[_ngcontent-%COMP%]:before {\n    content: "Feels like: ";\n    color: #888; }\n  .weather-forecast[_ngcontent-%COMP%] .current[_ngcontent-%COMP%] .wind[_ngcontent-%COMP%]:before {\n    content: "Wind: ";\n    color: #888; }\n  .weather-forecast[_ngcontent-%COMP%] .current[_ngcontent-%COMP%] .precip[_ngcontent-%COMP%]:before {\n    content: "Precipitation: ";\n    color: #888; }\n  .weather-forecast[_ngcontent-%COMP%] .current[_ngcontent-%COMP%] .humidity[_ngcontent-%COMP%]:before {\n    content: "Humidity: ";\n    color: #888; }\n  .weather-forecast[_ngcontent-%COMP%] .current[_ngcontent-%COMP%] .pollen[_ngcontent-%COMP%]:before {\n    content: "Pollen Count: ";\n    color: #888; }\n  .weather-forecast[_ngcontent-%COMP%] .current[_ngcontent-%COMP%] .pcount[_ngcontent-%COMP%]:before {\n    content: "Pollen ";\n    color: #888; }\n\n.weather-forecast[_ngcontent-%COMP%] .future[_ngcontent-%COMP%] {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex; }\n  .weather-forecast[_ngcontent-%COMP%] .future[_ngcontent-%COMP%] .oneday[_ngcontent-%COMP%] {\n    -webkit-box-flex: 1;\n    -webkit-flex-grow: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    text-align: center; }\n    .weather-forecast[_ngcontent-%COMP%] .future[_ngcontent-%COMP%] .oneday[_ngcontent-%COMP%] .icon[_ngcontent-%COMP%] {\n      width: 64px;\n      height: 64px;\n      margin-left: auto;\n      margin-right: auto; }\n    .weather-forecast[_ngcontent-%COMP%] .future[_ngcontent-%COMP%] .oneday[_ngcontent-%COMP%] .temp-high[_ngcontent-%COMP%], .weather-forecast[_ngcontent-%COMP%] .future[_ngcontent-%COMP%] .oneday[_ngcontent-%COMP%] .temp-low[_ngcontent-%COMP%] {\n      display: inline-block; }\n    .weather-forecast[_ngcontent-%COMP%] .future[_ngcontent-%COMP%] .oneday[_ngcontent-%COMP%] .temp-low[_ngcontent-%COMP%] {\n      color: #888; }\n\n.weather-forecast[_ngcontent-%COMP%] .icon[_ngcontent-%COMP%] {\n  background-repeat: no-repeat;\n  background-size: contain; }\n  .weather-forecast[_ngcontent-%COMP%] .icon.clear-day[_ngcontent-%COMP%] {\n    background-image: url("/images/clear.png"); }\n  .weather-forecast[_ngcontent-%COMP%] .icon.clear-night[_ngcontent-%COMP%] {\n    background-image: url("/images/clear.png"); }\n  .weather-forecast[_ngcontent-%COMP%] .icon.rain[_ngcontent-%COMP%] {\n    background-image: url("/images/rain.png"); }\n  .weather-forecast[_ngcontent-%COMP%] .icon.snow[_ngcontent-%COMP%] {\n    background-image: url("/images/snow.png"); }\n  .weather-forecast[_ngcontent-%COMP%] .icon.sleet[_ngcontent-%COMP%] {\n    background-image: url("/images/sleet.png"); }\n  .weather-forecast[_ngcontent-%COMP%] .icon.wind[_ngcontent-%COMP%] {\n    background-image: url("/images/wind.png"); }\n  .weather-forecast[_ngcontent-%COMP%] .icon.fog[_ngcontent-%COMP%] {\n    background-image: url("/images/fog.png"); }\n  .weather-forecast[_ngcontent-%COMP%] .icon.cloudy[_ngcontent-%COMP%] {\n    background-image: url("/images/cloudy.png"); }\n  .weather-forecast[_ngcontent-%COMP%] .icon.partly-cloudy-day[_ngcontent-%COMP%] {\n    background-image: url("/images/partly-cloudy.png"); }\n  .weather-forecast[_ngcontent-%COMP%] .icon.partly-cloudy-night[_ngcontent-%COMP%] {\n    background-image: url("/images/partly-cloudy.png"); }\n  .weather-forecast[_ngcontent-%COMP%] .icon.thunderstorms[_ngcontent-%COMP%] {\n    background-image: url("/images/thunderstorms.png"); }\n\n@media (max-width: 450px) {\n  .weather-forecast[_ngcontent-%COMP%] .date[_ngcontent-%COMP%], .weather-forecast[_ngcontent-%COMP%] .description[_ngcontent-%COMP%] {\n    font-size: 0.9em; }\n  .weather-forecast[_ngcontent-%COMP%] .current[_ngcontent-%COMP%] .icon[_ngcontent-%COMP%] {\n    width: 96px;\n    height: 96px; }\n  .weather-forecast[_ngcontent-%COMP%] .current[_ngcontent-%COMP%] .visual[_ngcontent-%COMP%] {\n    font-size: 3em; }\n  .weather-forecast[_ngcontent-%COMP%] .future[_ngcontent-%COMP%] .oneday[_ngcontent-%COMP%] .icon[_ngcontent-%COMP%] {\n    width: 32px;\n    height: 32px; } }'];
    var styles_WeatherCard = [styles$2];
    var nodeDebugInfos_WeatherCard0 = [
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {})
    ];
    var renderType_WeatherCard = null;
    var _View_WeatherCard0 = (function (_super) {
        __extends(_View_WeatherCard0, _super);
        function _View_WeatherCard0(viewUtils, parentInjector, declarationEl) {
            _super.call(this, _View_WeatherCard0, renderType_WeatherCard, ViewType$1.COMPONENT, viewUtils, parentInjector, declarationEl, ChangeDetectionStrategy.CheckAlways, nodeDebugInfos_WeatherCard0);
        }
        _View_WeatherCard0.prototype.createInternal = function (rootSelector) {
            var parentRenderNode = this.renderer.createViewRoot(this.declarationAppElement.nativeElement);
            this._el_0 = this.renderer.createElement(parentRenderNode, 'div', this.debug(0, 0, 0));
            this.renderer.setElementAttribute(this._el_0, 'class', 'card cardTemplate weather-forecast');
            this._text_1 = this.renderer.createText(this._el_0, '\n    ', this.debug(1, 0, 48));
            this._el_2 = this.renderer.createElement(this._el_0, 'div', this.debug(2, 1, 4));
            this.renderer.setElementAttribute(this._el_2, 'class', 'city-key');
            this.renderer.setElementAttribute(this._el_2, 'hidden', '');
            this._text_3 = this.renderer.createText(this._el_0, '\n    ', this.debug(3, 1, 39));
            this._el_4 = this.renderer.createElement(this._el_0, 'div', this.debug(4, 2, 4));
            this.renderer.setElementAttribute(this._el_4, 'class', 'location');
            this._text_5 = this.renderer.createText(this._el_0, '\n    ', this.debug(5, 2, 32));
            this._el_6 = this.renderer.createElement(this._el_0, 'div', this.debug(6, 3, 4));
            this.renderer.setElementAttribute(this._el_6, 'class', 'date');
            this._text_7 = this.renderer.createText(this._el_0, '\n    ', this.debug(7, 3, 28));
            this._el_8 = this.renderer.createElement(this._el_0, 'div', this.debug(8, 4, 4));
            this.renderer.setElementAttribute(this._el_8, 'class', 'description');
            this._text_9 = this.renderer.createText(this._el_0, '\n    ', this.debug(9, 4, 35));
            this._el_10 = this.renderer.createElement(this._el_0, 'div', this.debug(10, 5, 4));
            this.renderer.setElementAttribute(this._el_10, 'class', 'current');
            this._text_11 = this.renderer.createText(this._el_10, '\n      ', this.debug(11, 5, 25));
            this._el_12 = this.renderer.createElement(this._el_10, 'div', this.debug(12, 6, 6));
            this.renderer.setElementAttribute(this._el_12, 'class', 'visual');
            this._text_13 = this.renderer.createText(this._el_12, '\n        ', this.debug(13, 6, 26));
            this._el_14 = this.renderer.createElement(this._el_12, 'div', this.debug(14, 7, 8));
            this.renderer.setElementAttribute(this._el_14, 'class', 'icon');
            this._text_15 = this.renderer.createText(this._el_12, '\n        ', this.debug(15, 7, 32));
            this._el_16 = this.renderer.createElement(this._el_12, 'div', this.debug(16, 8, 8));
            this.renderer.setElementAttribute(this._el_16, 'class', 'temperature');
            this._text_17 = this.renderer.createText(this._el_16, '\n          ', this.debug(17, 8, 33));
            this._el_18 = this.renderer.createElement(this._el_16, 'span', this.debug(18, 9, 10));
            this.renderer.setElementAttribute(this._el_18, 'class', 'value');
            this._el_19 = this.renderer.createElement(this._el_16, 'span', this.debug(19, 9, 37));
            this.renderer.setElementAttribute(this._el_19, 'class', 'scale');
            this._text_20 = this.renderer.createText(this._el_19, '°F', this.debug(20, 9, 57));
            this._text_21 = this.renderer.createText(this._el_16, '\n        ', this.debug(21, 9, 66));
            this._text_22 = this.renderer.createText(this._el_12, '\n      ', this.debug(22, 10, 14));
            this._text_23 = this.renderer.createText(this._el_10, '\n      ', this.debug(23, 11, 12));
            this._el_24 = this.renderer.createElement(this._el_10, 'div', this.debug(24, 12, 6));
            this.renderer.setElementAttribute(this._el_24, 'class', 'description');
            this._text_25 = this.renderer.createText(this._el_24, '\n        ', this.debug(25, 12, 31));
            this._el_26 = this.renderer.createElement(this._el_24, 'div', this.debug(26, 13, 8));
            this.renderer.setElementAttribute(this._el_26, 'class', 'feels-like');
            this._text_27 = this.renderer.createText(this._el_26, '\n          ', this.debug(27, 13, 32));
            this._el_28 = this.renderer.createElement(this._el_26, 'span', this.debug(28, 14, 10));
            this.renderer.setElementAttribute(this._el_28, 'class', 'value');
            this._el_29 = this.renderer.createElement(this._el_26, 'span', this.debug(29, 14, 37));
            this.renderer.setElementAttribute(this._el_29, 'class', 'scale');
            this._text_30 = this.renderer.createText(this._el_29, '°F', this.debug(30, 14, 57));
            this._text_31 = this.renderer.createText(this._el_26, '\n        ', this.debug(31, 14, 66));
            this._text_32 = this.renderer.createText(this._el_24, '\n        ', this.debug(32, 15, 14));
            this._el_33 = this.renderer.createElement(this._el_24, 'div', this.debug(33, 16, 8));
            this.renderer.setElementAttribute(this._el_33, 'class', 'precip');
            this._text_34 = this.renderer.createText(this._el_24, '\n        ', this.debug(34, 16, 34));
            this._el_35 = this.renderer.createElement(this._el_24, 'div', this.debug(35, 17, 8));
            this.renderer.setElementAttribute(this._el_35, 'class', 'humidity');
            this._text_36 = this.renderer.createText(this._el_24, '\n        ', this.debug(36, 17, 36));
            this._el_37 = this.renderer.createElement(this._el_24, 'div', this.debug(37, 18, 8));
            this.renderer.setElementAttribute(this._el_37, 'class', 'wind');
            this._text_38 = this.renderer.createText(this._el_37, '\n          ', this.debug(38, 18, 26));
            this._el_39 = this.renderer.createElement(this._el_37, 'span', this.debug(39, 19, 10));
            this.renderer.setElementAttribute(this._el_39, 'class', 'value');
            this._text_40 = this.renderer.createText(this._el_37, '\n          ', this.debug(40, 19, 37));
            this._el_41 = this.renderer.createElement(this._el_37, 'span', this.debug(41, 20, 10));
            this.renderer.setElementAttribute(this._el_41, 'class', 'scale');
            this._text_42 = this.renderer.createText(this._el_41, 'mph', this.debug(42, 20, 30));
            this._text_43 = this.renderer.createText(this._el_37, '\n          ', this.debug(43, 20, 40));
            this._el_44 = this.renderer.createElement(this._el_37, 'span', this.debug(44, 21, 10));
            this.renderer.setElementAttribute(this._el_44, 'class', 'direction');
            this._text_45 = this.renderer.createText(this._el_37, '°\n        ', this.debug(45, 21, 41));
            this._text_46 = this.renderer.createText(this._el_24, '\n      ', this.debug(46, 22, 14));
            this._text_47 = this.renderer.createText(this._el_10, '\n    ', this.debug(47, 23, 12));
            this._text_48 = this.renderer.createText(this._el_0, '\n    ', this.debug(48, 24, 10));
            this._el_49 = this.renderer.createElement(this._el_0, 'div', this.debug(49, 25, 4));
            this.renderer.setElementAttribute(this._el_49, 'class', 'future');
            this._text_50 = this.renderer.createText(this._el_49, '\n      ', this.debug(50, 25, 24));
            this._el_51 = this.renderer.createElement(this._el_49, 'div', this.debug(51, 26, 6));
            this.renderer.setElementAttribute(this._el_51, 'class', 'oneday');
            this._text_52 = this.renderer.createText(this._el_51, '\n        ', this.debug(52, 26, 26));
            this._el_53 = this.renderer.createElement(this._el_51, 'div', this.debug(53, 27, 8));
            this.renderer.setElementAttribute(this._el_53, 'class', 'date');
            this._text_54 = this.renderer.createText(this._el_51, '\n        ', this.debug(54, 27, 32));
            this._el_55 = this.renderer.createElement(this._el_51, 'div', this.debug(55, 28, 8));
            this.renderer.setElementAttribute(this._el_55, 'class', 'icon');
            this._text_56 = this.renderer.createText(this._el_51, '\n        ', this.debug(56, 28, 32));
            this._el_57 = this.renderer.createElement(this._el_51, 'div', this.debug(57, 29, 8));
            this.renderer.setElementAttribute(this._el_57, 'class', 'temp-high');
            this._text_58 = this.renderer.createText(this._el_57, '\n          ', this.debug(58, 29, 31));
            this._el_59 = this.renderer.createElement(this._el_57, 'span', this.debug(59, 30, 10));
            this.renderer.setElementAttribute(this._el_59, 'class', 'value');
            this._text_60 = this.renderer.createText(this._el_57, '°\n        ', this.debug(60, 30, 37));
            this._text_61 = this.renderer.createText(this._el_51, '\n        ', this.debug(61, 31, 14));
            this._el_62 = this.renderer.createElement(this._el_51, 'div', this.debug(62, 32, 8));
            this.renderer.setElementAttribute(this._el_62, 'class', 'temp-low');
            this._text_63 = this.renderer.createText(this._el_62, '\n          ', this.debug(63, 32, 30));
            this._el_64 = this.renderer.createElement(this._el_62, 'span', this.debug(64, 33, 10));
            this.renderer.setElementAttribute(this._el_64, 'class', 'value');
            this._text_65 = this.renderer.createText(this._el_62, '°\n        ', this.debug(65, 33, 37));
            this._text_66 = this.renderer.createText(this._el_51, '\n      ', this.debug(66, 34, 14));
            this._text_67 = this.renderer.createText(this._el_49, '\n      ', this.debug(67, 35, 12));
            this._el_68 = this.renderer.createElement(this._el_49, 'div', this.debug(68, 36, 6));
            this.renderer.setElementAttribute(this._el_68, 'class', 'oneday');
            this._text_69 = this.renderer.createText(this._el_68, '\n        ', this.debug(69, 36, 26));
            this._el_70 = this.renderer.createElement(this._el_68, 'div', this.debug(70, 37, 8));
            this.renderer.setElementAttribute(this._el_70, 'class', 'date');
            this._text_71 = this.renderer.createText(this._el_68, '\n        ', this.debug(71, 37, 32));
            this._el_72 = this.renderer.createElement(this._el_68, 'div', this.debug(72, 38, 8));
            this.renderer.setElementAttribute(this._el_72, 'class', 'icon');
            this._text_73 = this.renderer.createText(this._el_68, '\n        ', this.debug(73, 38, 32));
            this._el_74 = this.renderer.createElement(this._el_68, 'div', this.debug(74, 39, 8));
            this.renderer.setElementAttribute(this._el_74, 'class', 'temp-high');
            this._text_75 = this.renderer.createText(this._el_74, '\n          ', this.debug(75, 39, 31));
            this._el_76 = this.renderer.createElement(this._el_74, 'span', this.debug(76, 40, 10));
            this.renderer.setElementAttribute(this._el_76, 'class', 'value');
            this._text_77 = this.renderer.createText(this._el_74, '°\n        ', this.debug(77, 40, 37));
            this._text_78 = this.renderer.createText(this._el_68, '\n        ', this.debug(78, 41, 14));
            this._el_79 = this.renderer.createElement(this._el_68, 'div', this.debug(79, 42, 8));
            this.renderer.setElementAttribute(this._el_79, 'class', 'temp-low');
            this._text_80 = this.renderer.createText(this._el_79, '\n          ', this.debug(80, 42, 30));
            this._el_81 = this.renderer.createElement(this._el_79, 'span', this.debug(81, 43, 10));
            this.renderer.setElementAttribute(this._el_81, 'class', 'value');
            this._text_82 = this.renderer.createText(this._el_79, '°\n        ', this.debug(82, 43, 37));
            this._text_83 = this.renderer.createText(this._el_68, '\n      ', this.debug(83, 44, 14));
            this._text_84 = this.renderer.createText(this._el_49, '\n      ', this.debug(84, 45, 12));
            this._el_85 = this.renderer.createElement(this._el_49, 'div', this.debug(85, 46, 6));
            this.renderer.setElementAttribute(this._el_85, 'class', 'oneday');
            this._text_86 = this.renderer.createText(this._el_85, '\n        ', this.debug(86, 46, 26));
            this._el_87 = this.renderer.createElement(this._el_85, 'div', this.debug(87, 47, 8));
            this.renderer.setElementAttribute(this._el_87, 'class', 'date');
            this._text_88 = this.renderer.createText(this._el_85, '\n        ', this.debug(88, 47, 32));
            this._el_89 = this.renderer.createElement(this._el_85, 'div', this.debug(89, 48, 8));
            this.renderer.setElementAttribute(this._el_89, 'class', 'icon');
            this._text_90 = this.renderer.createText(this._el_85, '\n        ', this.debug(90, 48, 32));
            this._el_91 = this.renderer.createElement(this._el_85, 'div', this.debug(91, 49, 8));
            this.renderer.setElementAttribute(this._el_91, 'class', 'temp-high');
            this._text_92 = this.renderer.createText(this._el_91, '\n          ', this.debug(92, 49, 31));
            this._el_93 = this.renderer.createElement(this._el_91, 'span', this.debug(93, 50, 10));
            this.renderer.setElementAttribute(this._el_93, 'class', 'value');
            this._text_94 = this.renderer.createText(this._el_91, '°\n        ', this.debug(94, 50, 37));
            this._text_95 = this.renderer.createText(this._el_85, '\n        ', this.debug(95, 51, 14));
            this._el_96 = this.renderer.createElement(this._el_85, 'div', this.debug(96, 52, 8));
            this.renderer.setElementAttribute(this._el_96, 'class', 'temp-low');
            this._text_97 = this.renderer.createText(this._el_96, '\n          ', this.debug(97, 52, 30));
            this._el_98 = this.renderer.createElement(this._el_96, 'span', this.debug(98, 53, 10));
            this.renderer.setElementAttribute(this._el_98, 'class', 'value');
            this._text_99 = this.renderer.createText(this._el_96, '°\n        ', this.debug(99, 53, 37));
            this._text_100 = this.renderer.createText(this._el_85, '\n      ', this.debug(100, 54, 14));
            this._text_101 = this.renderer.createText(this._el_49, '\n      ', this.debug(101, 55, 12));
            this._el_102 = this.renderer.createElement(this._el_49, 'div', this.debug(102, 56, 6));
            this.renderer.setElementAttribute(this._el_102, 'class', 'oneday');
            this._text_103 = this.renderer.createText(this._el_102, '\n        ', this.debug(103, 56, 26));
            this._el_104 = this.renderer.createElement(this._el_102, 'div', this.debug(104, 57, 8));
            this.renderer.setElementAttribute(this._el_104, 'class', 'date');
            this._text_105 = this.renderer.createText(this._el_102, '\n        ', this.debug(105, 57, 32));
            this._el_106 = this.renderer.createElement(this._el_102, 'div', this.debug(106, 58, 8));
            this.renderer.setElementAttribute(this._el_106, 'class', 'icon');
            this._text_107 = this.renderer.createText(this._el_102, '\n        ', this.debug(107, 58, 32));
            this._el_108 = this.renderer.createElement(this._el_102, 'div', this.debug(108, 59, 8));
            this.renderer.setElementAttribute(this._el_108, 'class', 'temp-high');
            this._text_109 = this.renderer.createText(this._el_108, '\n          ', this.debug(109, 59, 31));
            this._el_110 = this.renderer.createElement(this._el_108, 'span', this.debug(110, 60, 10));
            this.renderer.setElementAttribute(this._el_110, 'class', 'value');
            this._text_111 = this.renderer.createText(this._el_108, '°\n        ', this.debug(111, 60, 37));
            this._text_112 = this.renderer.createText(this._el_102, '\n        ', this.debug(112, 61, 14));
            this._el_113 = this.renderer.createElement(this._el_102, 'div', this.debug(113, 62, 8));
            this.renderer.setElementAttribute(this._el_113, 'class', 'temp-low');
            this._text_114 = this.renderer.createText(this._el_113, '\n          ', this.debug(114, 62, 30));
            this._el_115 = this.renderer.createElement(this._el_113, 'span', this.debug(115, 63, 10));
            this.renderer.setElementAttribute(this._el_115, 'class', 'value');
            this._text_116 = this.renderer.createText(this._el_113, '°\n        ', this.debug(116, 63, 37));
            this._text_117 = this.renderer.createText(this._el_102, '\n      ', this.debug(117, 64, 14));
            this._text_118 = this.renderer.createText(this._el_49, '\n      ', this.debug(118, 65, 12));
            this._el_119 = this.renderer.createElement(this._el_49, 'div', this.debug(119, 66, 6));
            this.renderer.setElementAttribute(this._el_119, 'class', 'oneday');
            this._text_120 = this.renderer.createText(this._el_119, '\n        ', this.debug(120, 66, 26));
            this._el_121 = this.renderer.createElement(this._el_119, 'div', this.debug(121, 67, 8));
            this.renderer.setElementAttribute(this._el_121, 'class', 'date');
            this._text_122 = this.renderer.createText(this._el_119, '\n        ', this.debug(122, 67, 32));
            this._el_123 = this.renderer.createElement(this._el_119, 'div', this.debug(123, 68, 8));
            this.renderer.setElementAttribute(this._el_123, 'class', 'icon');
            this._text_124 = this.renderer.createText(this._el_119, '\n        ', this.debug(124, 68, 32));
            this._el_125 = this.renderer.createElement(this._el_119, 'div', this.debug(125, 69, 8));
            this.renderer.setElementAttribute(this._el_125, 'class', 'temp-high');
            this._text_126 = this.renderer.createText(this._el_125, '\n          ', this.debug(126, 69, 31));
            this._el_127 = this.renderer.createElement(this._el_125, 'span', this.debug(127, 70, 10));
            this.renderer.setElementAttribute(this._el_127, 'class', 'value');
            this._text_128 = this.renderer.createText(this._el_125, '°\n        ', this.debug(128, 70, 37));
            this._text_129 = this.renderer.createText(this._el_119, '\n        ', this.debug(129, 71, 14));
            this._el_130 = this.renderer.createElement(this._el_119, 'div', this.debug(130, 72, 8));
            this.renderer.setElementAttribute(this._el_130, 'class', 'temp-low');
            this._text_131 = this.renderer.createText(this._el_130, '\n          ', this.debug(131, 72, 30));
            this._el_132 = this.renderer.createElement(this._el_130, 'span', this.debug(132, 73, 10));
            this.renderer.setElementAttribute(this._el_132, 'class', 'value');
            this._text_133 = this.renderer.createText(this._el_130, '°\n        ', this.debug(133, 73, 37));
            this._text_134 = this.renderer.createText(this._el_119, '\n      ', this.debug(134, 74, 14));
            this._text_135 = this.renderer.createText(this._el_49, '\n      ', this.debug(135, 75, 12));
            this._el_136 = this.renderer.createElement(this._el_49, 'div', this.debug(136, 76, 6));
            this.renderer.setElementAttribute(this._el_136, 'class', 'oneday');
            this._text_137 = this.renderer.createText(this._el_136, '\n        ', this.debug(137, 76, 26));
            this._el_138 = this.renderer.createElement(this._el_136, 'div', this.debug(138, 77, 8));
            this.renderer.setElementAttribute(this._el_138, 'class', 'date');
            this._text_139 = this.renderer.createText(this._el_136, '\n        ', this.debug(139, 77, 32));
            this._el_140 = this.renderer.createElement(this._el_136, 'div', this.debug(140, 78, 8));
            this.renderer.setElementAttribute(this._el_140, 'class', 'icon');
            this._text_141 = this.renderer.createText(this._el_136, '\n        ', this.debug(141, 78, 32));
            this._el_142 = this.renderer.createElement(this._el_136, 'div', this.debug(142, 79, 8));
            this.renderer.setElementAttribute(this._el_142, 'class', 'temp-high');
            this._text_143 = this.renderer.createText(this._el_142, '\n          ', this.debug(143, 79, 31));
            this._el_144 = this.renderer.createElement(this._el_142, 'span', this.debug(144, 80, 10));
            this.renderer.setElementAttribute(this._el_144, 'class', 'value');
            this._text_145 = this.renderer.createText(this._el_142, '°\n        ', this.debug(145, 80, 37));
            this._text_146 = this.renderer.createText(this._el_136, '\n        ', this.debug(146, 81, 14));
            this._el_147 = this.renderer.createElement(this._el_136, 'div', this.debug(147, 82, 8));
            this.renderer.setElementAttribute(this._el_147, 'class', 'temp-low');
            this._text_148 = this.renderer.createText(this._el_147, '\n          ', this.debug(148, 82, 30));
            this._el_149 = this.renderer.createElement(this._el_147, 'span', this.debug(149, 83, 10));
            this.renderer.setElementAttribute(this._el_149, 'class', 'value');
            this._text_150 = this.renderer.createText(this._el_147, '°\n        ', this.debug(150, 83, 37));
            this._text_151 = this.renderer.createText(this._el_136, '\n      ', this.debug(151, 84, 14));
            this._text_152 = this.renderer.createText(this._el_49, '\n      ', this.debug(152, 85, 12));
            this._el_153 = this.renderer.createElement(this._el_49, 'div', this.debug(153, 86, 6));
            this.renderer.setElementAttribute(this._el_153, 'class', 'oneday');
            this._text_154 = this.renderer.createText(this._el_153, '\n        ', this.debug(154, 86, 26));
            this._el_155 = this.renderer.createElement(this._el_153, 'div', this.debug(155, 87, 8));
            this.renderer.setElementAttribute(this._el_155, 'class', 'date');
            this._text_156 = this.renderer.createText(this._el_153, '\n        ', this.debug(156, 87, 32));
            this._el_157 = this.renderer.createElement(this._el_153, 'div', this.debug(157, 88, 8));
            this.renderer.setElementAttribute(this._el_157, 'class', 'icon');
            this._text_158 = this.renderer.createText(this._el_153, '\n        ', this.debug(158, 88, 32));
            this._el_159 = this.renderer.createElement(this._el_153, 'div', this.debug(159, 89, 8));
            this.renderer.setElementAttribute(this._el_159, 'class', 'temp-high');
            this._text_160 = this.renderer.createText(this._el_159, '\n          ', this.debug(160, 89, 31));
            this._el_161 = this.renderer.createElement(this._el_159, 'span', this.debug(161, 90, 10));
            this.renderer.setElementAttribute(this._el_161, 'class', 'value');
            this._text_162 = this.renderer.createText(this._el_159, '°\n        ', this.debug(162, 90, 37));
            this._text_163 = this.renderer.createText(this._el_153, '\n        ', this.debug(163, 91, 14));
            this._el_164 = this.renderer.createElement(this._el_153, 'div', this.debug(164, 92, 8));
            this.renderer.setElementAttribute(this._el_164, 'class', 'temp-low');
            this._text_165 = this.renderer.createText(this._el_164, '\n          ', this.debug(165, 92, 30));
            this._el_166 = this.renderer.createElement(this._el_164, 'span', this.debug(166, 93, 10));
            this.renderer.setElementAttribute(this._el_166, 'class', 'value');
            this._text_167 = this.renderer.createText(this._el_164, '°\n        ', this.debug(167, 93, 37));
            this._text_168 = this.renderer.createText(this._el_153, '\n      ', this.debug(168, 94, 14));
            this._text_169 = this.renderer.createText(this._el_49, '\n    ', this.debug(169, 95, 12));
            this._text_170 = this.renderer.createText(this._el_0, '\n  ', this.debug(170, 96, 10));
            this._text_171 = this.renderer.createText(parentRenderNode, '\n', this.debug(171, 97, 8));
            this.init([], [
                this._el_0,
                this._text_1,
                this._el_2,
                this._text_3,
                this._el_4,
                this._text_5,
                this._el_6,
                this._text_7,
                this._el_8,
                this._text_9,
                this._el_10,
                this._text_11,
                this._el_12,
                this._text_13,
                this._el_14,
                this._text_15,
                this._el_16,
                this._text_17,
                this._el_18,
                this._el_19,
                this._text_20,
                this._text_21,
                this._text_22,
                this._text_23,
                this._el_24,
                this._text_25,
                this._el_26,
                this._text_27,
                this._el_28,
                this._el_29,
                this._text_30,
                this._text_31,
                this._text_32,
                this._el_33,
                this._text_34,
                this._el_35,
                this._text_36,
                this._el_37,
                this._text_38,
                this._el_39,
                this._text_40,
                this._el_41,
                this._text_42,
                this._text_43,
                this._el_44,
                this._text_45,
                this._text_46,
                this._text_47,
                this._text_48,
                this._el_49,
                this._text_50,
                this._el_51,
                this._text_52,
                this._el_53,
                this._text_54,
                this._el_55,
                this._text_56,
                this._el_57,
                this._text_58,
                this._el_59,
                this._text_60,
                this._text_61,
                this._el_62,
                this._text_63,
                this._el_64,
                this._text_65,
                this._text_66,
                this._text_67,
                this._el_68,
                this._text_69,
                this._el_70,
                this._text_71,
                this._el_72,
                this._text_73,
                this._el_74,
                this._text_75,
                this._el_76,
                this._text_77,
                this._text_78,
                this._el_79,
                this._text_80,
                this._el_81,
                this._text_82,
                this._text_83,
                this._text_84,
                this._el_85,
                this._text_86,
                this._el_87,
                this._text_88,
                this._el_89,
                this._text_90,
                this._el_91,
                this._text_92,
                this._el_93,
                this._text_94,
                this._text_95,
                this._el_96,
                this._text_97,
                this._el_98,
                this._text_99,
                this._text_100,
                this._text_101,
                this._el_102,
                this._text_103,
                this._el_104,
                this._text_105,
                this._el_106,
                this._text_107,
                this._el_108,
                this._text_109,
                this._el_110,
                this._text_111,
                this._text_112,
                this._el_113,
                this._text_114,
                this._el_115,
                this._text_116,
                this._text_117,
                this._text_118,
                this._el_119,
                this._text_120,
                this._el_121,
                this._text_122,
                this._el_123,
                this._text_124,
                this._el_125,
                this._text_126,
                this._el_127,
                this._text_128,
                this._text_129,
                this._el_130,
                this._text_131,
                this._el_132,
                this._text_133,
                this._text_134,
                this._text_135,
                this._el_136,
                this._text_137,
                this._el_138,
                this._text_139,
                this._el_140,
                this._text_141,
                this._el_142,
                this._text_143,
                this._el_144,
                this._text_145,
                this._text_146,
                this._el_147,
                this._text_148,
                this._el_149,
                this._text_150,
                this._text_151,
                this._text_152,
                this._el_153,
                this._text_154,
                this._el_155,
                this._text_156,
                this._el_157,
                this._text_158,
                this._el_159,
                this._text_160,
                this._el_161,
                this._text_162,
                this._text_163,
                this._el_164,
                this._text_165,
                this._el_166,
                this._text_167,
                this._text_168,
                this._text_169,
                this._text_170,
                this._text_171
            ], [], []);
            return null;
        };
        return _View_WeatherCard0;
    }(DebugAppView$1));
    function viewFactory_WeatherCard0(viewUtils, parentInjector, declarationEl) {
        if ((renderType_WeatherCard === null)) {
            (renderType_WeatherCard = viewUtils.createRenderComponentType('/Users/robwormald/Dev/demos/ng2-pwa-demo/src/weather-card.html', 0, ViewEncapsulation$1.Emulated, styles_WeatherCard));
        }
        return new _View_WeatherCard0(viewUtils, parentInjector, declarationEl);
    }
    var styles_WeatherCard_Host = [];
    var nodeDebugInfos_WeatherCard_Host0 = [new StaticNodeDebugInfo$1([WeatherCard], WeatherCard, {})];
    var renderType_WeatherCard_Host = null;
    var _View_WeatherCard_Host0 = (function (_super) {
        __extends(_View_WeatherCard_Host0, _super);
        function _View_WeatherCard_Host0(viewUtils, parentInjector, declarationEl) {
            _super.call(this, _View_WeatherCard_Host0, renderType_WeatherCard_Host, ViewType$1.HOST, viewUtils, parentInjector, declarationEl, ChangeDetectionStrategy.CheckAlways, nodeDebugInfos_WeatherCard_Host0);
        }
        _View_WeatherCard_Host0.prototype.createInternal = function (rootSelector) {
            this._el_0 = this.selectOrCreateHostElement('weather-card', rootSelector, this.debug(0, 0, 0));
            this._appEl_0 = new AppElement$1(0, null, this, this._el_0);
            var compView_0 = viewFactory_WeatherCard0(this.viewUtils, this.injector(0), this._appEl_0);
            this._WeatherCard_0_4 = new WeatherCard();
            this._appEl_0.initComponent(this._WeatherCard_0_4, [], compView_0);
            compView_0.create(this._WeatherCard_0_4, this.projectableNodes, null);
            this.init([].concat([this._el_0]), [this._el_0], [], []);
            return this._appEl_0;
        };
        _View_WeatherCard_Host0.prototype.injectorGetInternal = function (token, requestNodeIndex, notFoundResult) {
            if (((token === WeatherCard) && (0 === requestNodeIndex))) {
                return this._WeatherCard_0_4;
            }
            return notFoundResult;
        };
        return _View_WeatherCard_Host0;
    }(DebugAppView$1));
    function viewFactory_WeatherCard_Host0(viewUtils, parentInjector, declarationEl) {
        if ((renderType_WeatherCard_Host === null)) {
            (renderType_WeatherCard_Host = viewUtils.createRenderComponentType('', 0, ViewEncapsulation$1.Emulated, styles_WeatherCard_Host));
        }
        return new _View_WeatherCard_Host0(viewUtils, parentInjector, declarationEl);
    }
    var WeatherCardNgFactory = new ComponentFactory$1('weather-card', viewFactory_WeatherCard_Host0, WeatherCard);
    /**
     * An injectable service for executing work inside or outside of the Angular zone.
     *
     * The most common use of this service is to optimize performance when starting a work consisting of
     * one or more asynchronous tasks that don't require UI updates or error handling to be handled by
     * Angular. Such tasks can be kicked off via {@link #runOutsideAngular} and if needed, these tasks
     * can reenter the Angular zone via {@link #run}.
     *
     * <!-- TODO: add/fix links to:
     *   - docs explaining zones and the use of zones in Angular and change-detection
     *   - link to runOutsideAngular/run (throughout this file!)
     *   -->
     *
     * ### Example ([live demo](http://plnkr.co/edit/lY9m8HLy7z06vDoUaSN2?p=preview))
     * ```
     * import {Component, View, NgZone} from '@angular/core';
     * import {NgIf} from '@angular/common';
     *
     * @Component({
     *   selector: 'ng-zone-demo'.
     *   template: `
     *     <h2>Demo: NgZone</h2>
     *
     *     <p>Progress: {{progress}}%</p>
     *     <p *ngIf="progress >= 100">Done processing {{label}} of Angular zone!</p>
     *
     *     <button (click)="processWithinAngularZone()">Process within Angular zone</button>
     *     <button (click)="processOutsideOfAngularZone()">Process outside of Angular zone</button>
     *   `,
     *   directives: [NgIf]
     * })
     * export class NgZoneDemo {
     *   progress: number = 0;
     *   label: string;
     *
     *   constructor(private _ngZone: NgZone) {}
     *
     *   // Loop inside the Angular zone
     *   // so the UI DOES refresh after each setTimeout cycle
     *   processWithinAngularZone() {
     *     this.label = 'inside';
     *     this.progress = 0;
     *     this._increaseProgress(() => console.log('Inside Done!'));
     *   }
     *
     *   // Loop outside of the Angular zone
     *   // so the UI DOES NOT refresh after each setTimeout cycle
     *   processOutsideOfAngularZone() {
     *     this.label = 'outside';
     *     this.progress = 0;
     *     this._ngZone.runOutsideAngular(() => {
     *       this._increaseProgress(() => {
     *       // reenter the Angular zone and display done
     *       this._ngZone.run(() => {console.log('Outside Done!') });
     *     }}));
     *   }
     *
     *
     *   _increaseProgress(doneCallback: () => void) {
     *     this.progress += 1;
     *     console.log(`Current progress: ${this.progress}%`);
     *
     *     if (this.progress < 100) {
     *       window.setTimeout(() => this._increaseProgress(doneCallback)), 10)
     *     } else {
     *       doneCallback();
     *     }
     *   }
     * }
     * ```
     */
    var NgZone$1 = (function () {
        function NgZone$1(_a) {
            var _this = this;
            var _b = _a.enableLongStackTrace, enableLongStackTrace = _b === void 0 ? false : _b;
            this._hasPendingMicrotasks = false;
            this._hasPendingMacrotasks = false;
            /** @internal */
            this._isStable = true;
            /** @internal */
            this._nesting = 0;
            /** @internal */
            this._onUnstable = new EventEmitter(false);
            /** @internal */
            this._onMicrotaskEmpty = new EventEmitter(false);
            /** @internal */
            this._onStable = new EventEmitter(false);
            /** @internal */
            this._onErrorEvents = new EventEmitter(false);
            this._zoneImpl = new NgZoneImpl({
                trace: enableLongStackTrace,
                onEnter: function () {
                    // console.log('ZONE.enter', this._nesting, this._isStable);
                    _this._nesting++;
                    if (_this._isStable) {
                        _this._isStable = false;
                        _this._onUnstable.emit(null);
                    }
                },
                onLeave: function () {
                    _this._nesting--;
                    // console.log('ZONE.leave', this._nesting, this._isStable);
                    _this._checkStable();
                },
                setMicrotask: function (hasMicrotasks) {
                    _this._hasPendingMicrotasks = hasMicrotasks;
                    _this._checkStable();
                },
                setMacrotask: function (hasMacrotasks) { _this._hasPendingMacrotasks = hasMacrotasks; },
                onError: function (error) { return _this._onErrorEvents.emit(error); }
            });
        }
        NgZone$1.isInAngularZone = function () { return NgZoneImpl.isInAngularZone(); };
        NgZone$1.assertInAngularZone = function () {
            if (!NgZoneImpl.isInAngularZone()) {
                throw new BaseException('Expected to be in Angular Zone, but it is not!');
            }
        };
        NgZone$1.assertNotInAngularZone = function () {
            if (NgZoneImpl.isInAngularZone()) {
                throw new BaseException('Expected to not be in Angular Zone, but it is!');
            }
        };
        NgZone$1.prototype._checkStable = function () {
            var _this = this;
            if (this._nesting == 0) {
                if (!this._hasPendingMicrotasks && !this._isStable) {
                    try {
                        // console.log('ZONE.microtaskEmpty');
                        this._nesting++;
                        this._onMicrotaskEmpty.emit(null);
                    }
                    finally {
                        this._nesting--;
                        if (!this._hasPendingMicrotasks) {
                            try {
                                // console.log('ZONE.stable', this._nesting, this._isStable);
                                this.runOutsideAngular(function () { return _this._onStable.emit(null); });
                            }
                            finally {
                                this._isStable = true;
                            }
                        }
                    }
                }
            }
        };
        ;
        Object.defineProperty(NgZone$1.prototype, "onUnstable", {
            /**
             * Notifies when code enters Angular Zone. This gets fired first on VM Turn.
             */
            get: function () { return this._onUnstable; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgZone$1.prototype, "onMicrotaskEmpty", {
            /**
             * Notifies when there is no more microtasks enqueue in the current VM Turn.
             * This is a hint for Angular to do change detection, which may enqueue more microtasks.
             * For this reason this event can fire multiple times per VM Turn.
             */
            get: function () { return this._onMicrotaskEmpty; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgZone$1.prototype, "onStable", {
            /**
             * Notifies when the last `onMicrotaskEmpty` has run and there are no more microtasks, which
             * implies we are about to relinquish VM turn.
             * This event gets called just once.
             */
            get: function () { return this._onStable; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgZone$1.prototype, "onError", {
            /**
             * Notify that an error has been delivered.
             */
            get: function () { return this._onErrorEvents; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgZone$1.prototype, "hasPendingMicrotasks", {
            /**
             * Whether there are any outstanding microtasks.
             */
            get: function () { return this._hasPendingMicrotasks; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgZone$1.prototype, "hasPendingMacrotasks", {
            /**
             * Whether there are any outstanding microtasks.
             */
            get: function () { return this._hasPendingMacrotasks; },
            enumerable: true,
            configurable: true
        });
        /**
         * Executes the `fn` function synchronously within the Angular zone and returns value returned by
         * the function.
         *
         * Running functions via `run` allows you to reenter Angular zone from a task that was executed
         * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
         *
         * Any future tasks or microtasks scheduled from within this function will continue executing from
         * within the Angular zone.
         *
         * If a synchronous error happens it will be rethrown and not reported via `onError`.
         */
        NgZone$1.prototype.run = function (fn) { return this._zoneImpl.runInner(fn); };
        /**
         * Same as #run, except that synchronous errors are caught and forwarded
         * via `onError` and not rethrown.
         */
        NgZone$1.prototype.runGuarded = function (fn) { return this._zoneImpl.runInnerGuarded(fn); };
        /**
         * Executes the `fn` function synchronously in Angular's parent zone and returns value returned by
         * the function.
         *
         * Running functions via `runOutsideAngular` allows you to escape Angular's zone and do work that
         * doesn't trigger Angular change-detection or is subject to Angular's error handling.
         *
         * Any future tasks or microtasks scheduled from within this function will continue executing from
         * outside of the Angular zone.
         *
         * Use {@link #run} to reenter the Angular zone and do work that updates the application model.
         */
        NgZone$1.prototype.runOutsideAngular = function (fn) { return this._zoneImpl.runOuter(fn); };
        return NgZone$1;
    }());
    var styles_WeatherApp = [styles];
    var nodeDebugInfos_WeatherApp0 = [
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([
            TemplateRef$1,
            NgFor$1
        ], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([], null, {}),
        new StaticNodeDebugInfo$1([CityPicker], CityPicker, {}),
        new StaticNodeDebugInfo$1([], null, {})
    ];
    var renderType_WeatherApp = null;
    var _View_WeatherApp0 = (function (_super) {
        __extends(_View_WeatherApp0, _super);
        function _View_WeatherApp0(viewUtils, parentInjector, declarationEl) {
            _super.call(this, _View_WeatherApp0, renderType_WeatherApp, ViewType$1.COMPONENT, viewUtils, parentInjector, declarationEl, ChangeDetectionStrategy.CheckAlways, nodeDebugInfos_WeatherApp0);
        }
        _View_WeatherApp0.prototype.createInternal = function (rootSelector) {
            var parentRenderNode = this.renderer.createViewRoot(this.declarationAppElement.nativeElement);
            this._el_0 = this.renderer.createElement(parentRenderNode, 'header', this.debug(0, 0, 0));
            this.renderer.setElementAttribute(this._el_0, 'class', 'header');
            this._text_1 = this.renderer.createText(this._el_0, '\n  ', this.debug(1, 0, 23));
            this._el_2 = this.renderer.createElement(this._el_0, 'h1', this.debug(2, 1, 2));
            this.renderer.setElementAttribute(this._el_2, 'class', 'header__title');
            this._text_3 = this.renderer.createText(this._el_2, 'Weather PWA', this.debug(3, 1, 28));
            this._text_4 = this.renderer.createText(this._el_0, '\n  ', this.debug(4, 1, 44));
            this._el_5 = this.renderer.createElement(this._el_0, 'button', this.debug(5, 2, 2));
            this.renderer.setElementAttribute(this._el_5, 'aria-label', 'Refresh');
            this.renderer.setElementAttribute(this._el_5, 'class', 'headerButton');
            this.renderer.setElementAttribute(this._el_5, 'id', 'butRefresh');
            this._text_6 = this.renderer.createText(this._el_0, '\n  ', this.debug(6, 2, 97));
            this._el_7 = this.renderer.createElement(this._el_0, 'button', this.debug(7, 3, 2));
            this.renderer.setElementAttribute(this._el_7, 'aria-label', 'Add');
            this.renderer.setElementAttribute(this._el_7, 'class', 'headerButton');
            this.renderer.setElementAttribute(this._el_7, 'id', 'butAdd');
            this._text_8 = this.renderer.createText(this._el_0, '\n', this.debug(8, 3, 85));
            this._text_9 = this.renderer.createText(parentRenderNode, '\n\n', this.debug(9, 4, 9));
            this._el_10 = this.renderer.createElement(parentRenderNode, 'main', this.debug(10, 6, 0));
            this.renderer.setElementAttribute(this._el_10, 'class', 'main');
            this._text_11 = this.renderer.createText(this._el_10, '\n\n  ', this.debug(11, 6, 19));
            this._anchor_12 = this.renderer.createTemplateAnchor(this._el_10, this.debug(12, 8, 2));
            this._appEl_12 = new AppElement$1(12, 10, this, this._anchor_12);
            this._TemplateRef_12_5 = new TemplateRef_$1(this._appEl_12, viewFactory_WeatherApp1);
            this._NgFor_12_6 = new NgFor$1(this._appEl_12.vcRef, this._TemplateRef_12_5, this.parentInjector.get(IterableDiffers), this.ref);
            this._text_13 = this.renderer.createText(this._el_10, '\n', this.debug(13, 8, 59));
            this._text_14 = this.renderer.createText(parentRenderNode, '\n', this.debug(14, 9, 7));
            this._el_15 = this.renderer.createElement(parentRenderNode, 'city-picker', this.debug(15, 10, 0));
            this.renderer.setElementAttribute(this._el_15, 'class', 'dialog-container');
            this._appEl_15 = new AppElement$1(15, null, this, this._el_15);
            var compView_15 = viewFactory_CityPicker0(this.viewUtils, this.injector(15), this._appEl_15);
            this._CityPicker_15_4 = new CityPicker();
            this._appEl_15.initComponent(this._CityPicker_15_4, [], compView_15);
            compView_15.create(this._CityPicker_15_4, [], null);
            this._text_16 = this.renderer.createText(parentRenderNode, '\n', this.debug(16, 10, 52));
            var disposable_0 = this.renderer.listen(this._el_5, 'click', this.eventHandler(this._handle_click_5_0.bind(this)));
            var disposable_1 = this.renderer.listen(this._el_7, 'click', this.eventHandler(this._handle_click_7_0.bind(this)));
            this._expr_2 = uninitialized;
            this.init([], [
                this._el_0,
                this._text_1,
                this._el_2,
                this._text_3,
                this._text_4,
                this._el_5,
                this._text_6,
                this._el_7,
                this._text_8,
                this._text_9,
                this._el_10,
                this._text_11,
                this._anchor_12,
                this._text_13,
                this._text_14,
                this._el_15,
                this._text_16
            ], [
                disposable_0,
                disposable_1
            ], []);
            return null;
        };
        _View_WeatherApp0.prototype.injectorGetInternal = function (token, requestNodeIndex, notFoundResult) {
            if (((token === TemplateRef$1) && (12 === requestNodeIndex))) {
                return this._TemplateRef_12_5;
            }
            if (((token === NgFor$1) && (12 === requestNodeIndex))) {
                return this._NgFor_12_6;
            }
            if (((token === CityPicker) && (15 === requestNodeIndex))) {
                return this._CityPicker_15_4;
            }
            return notFoundResult;
        };
        _View_WeatherApp0.prototype.detectChangesInternal = function (throwOnChange) {
            this.debug(12, 8, 16);
            var currVal_2 = this.context.cities;
            if (checkBinding$1(throwOnChange, this._expr_2, currVal_2)) {
                this._NgFor_12_6.ngForOf = currVal_2;
                this.renderer.setBindingDebugInfo(this._anchor_12, 'ng-reflect-ng-for-of', ((currVal_2 == null) ? null : currVal_2.toString()));
                this._expr_2 = currVal_2;
            }
            if (!throwOnChange) {
                this._NgFor_12_6.ngDoCheck();
            }
            this.detectContentChildrenChanges(throwOnChange);
            this.detectViewChildrenChanges(throwOnChange);
        };
        _View_WeatherApp0.prototype._handle_click_5_0 = function ($event) {
            this.markPathToRootAsCheckOnce();
            this.debug(5, 2, 10);
            var pd_0 = (this.context.refresh() !== false);
            return (true && pd_0);
        };
        _View_WeatherApp0.prototype._handle_click_7_0 = function ($event) {
            this.markPathToRootAsCheckOnce();
            this.debug(7, 3, 10);
            var pd_0 = (this.context.add() !== false);
            return (true && pd_0);
        };
        return _View_WeatherApp0;
    }(DebugAppView$1));
    function viewFactory_WeatherApp0(viewUtils, parentInjector, declarationEl) {
        if ((renderType_WeatherApp === null)) {
            (renderType_WeatherApp = viewUtils.createRenderComponentType('/Users/robwormald/Dev/demos/ng2-pwa-demo/src/app.html', 0, ViewEncapsulation$1.Emulated, styles_WeatherApp));
        }
        return new _View_WeatherApp0(viewUtils, parentInjector, declarationEl);
    }
    var nodeDebugInfos_WeatherApp1 = [new StaticNodeDebugInfo$1([WeatherCard], WeatherCard, {})];
    var _View_WeatherApp1 = (function (_super) {
        __extends(_View_WeatherApp1, _super);
        function _View_WeatherApp1(viewUtils, parentInjector, declarationEl) {
            _super.call(this, _View_WeatherApp1, renderType_WeatherApp, ViewType$1.EMBEDDED, viewUtils, parentInjector, declarationEl, ChangeDetectionStrategy.CheckAlways, nodeDebugInfos_WeatherApp1);
        }
        _View_WeatherApp1.prototype.createInternal = function (rootSelector) {
            this._el_0 = this.renderer.createElement(null, 'weather-card', this.debug(0, 8, 2));
            this._appEl_0 = new AppElement$1(0, null, this, this._el_0);
            var compView_0 = viewFactory_WeatherCard0(this.viewUtils, this.injector(0), this._appEl_0);
            this._WeatherCard_0_4 = new WeatherCard();
            this._appEl_0.initComponent(this._WeatherCard_0_4, [], compView_0);
            compView_0.create(this._WeatherCard_0_4, [], null);
            this.init([].concat([this._el_0]), [this._el_0], [], []);
            return null;
        };
        _View_WeatherApp1.prototype.injectorGetInternal = function (token, requestNodeIndex, notFoundResult) {
            if (((token === WeatherCard) && (0 === requestNodeIndex))) {
                return this._WeatherCard_0_4;
            }
            return notFoundResult;
        };
        return _View_WeatherApp1;
    }(DebugAppView$1));
    function viewFactory_WeatherApp1(viewUtils, parentInjector, declarationEl) {
        return new _View_WeatherApp1(viewUtils, parentInjector, declarationEl);
    }
    var styles_WeatherApp_Host = [];
    var nodeDebugInfos_WeatherApp_Host0 = [new StaticNodeDebugInfo$1([
            WeatherAPI,
            WeatherApp,
            WeatherData
        ], WeatherApp, {})];
    var renderType_WeatherApp_Host = null;
    var _View_WeatherApp_Host0 = (function (_super) {
        __extends(_View_WeatherApp_Host0, _super);
        function _View_WeatherApp_Host0(viewUtils, parentInjector, declarationEl) {
            _super.call(this, _View_WeatherApp_Host0, renderType_WeatherApp_Host, ViewType$1.HOST, viewUtils, parentInjector, declarationEl, ChangeDetectionStrategy.CheckAlways, nodeDebugInfos_WeatherApp_Host0);
        }
        Object.defineProperty(_View_WeatherApp_Host0.prototype, "_WeatherData_0_6", {
            get: function () {
                this.debug(0, 0, 0);
                if ((this.__WeatherData_0_6 == null)) {
                    (this.__WeatherData_0_6 = new WeatherData());
                }
                return this.__WeatherData_0_6;
            },
            enumerable: true,
            configurable: true
        });
        _View_WeatherApp_Host0.prototype.createInternal = function (rootSelector) {
            this._el_0 = this.selectOrCreateHostElement('weather-app', rootSelector, this.debug(0, 0, 0));
            this._appEl_0 = new AppElement$1(0, null, this, this._el_0);
            var compView_0 = viewFactory_WeatherApp0(this.viewUtils, this.injector(0), this._appEl_0);
            this._WeatherAPI_0_4 = new WeatherAPI();
            this._WeatherApp_0_5 = new WeatherApp(this._WeatherAPI_0_4, this.renderer, this.parentInjector.get(NgZone$1));
            this._appEl_0.initComponent(this._WeatherApp_0_5, [], compView_0);
            compView_0.create(this._WeatherApp_0_5, this.projectableNodes, null);
            this.init([].concat([this._el_0]), [this._el_0], [], []);
            return this._appEl_0;
        };
        _View_WeatherApp_Host0.prototype.injectorGetInternal = function (token, requestNodeIndex, notFoundResult) {
            if (((token === WeatherAPI) && (0 === requestNodeIndex))) {
                return this._WeatherAPI_0_4;
            }
            if (((token === WeatherApp) && (0 === requestNodeIndex))) {
                return this._WeatherApp_0_5;
            }
            if (((token === WeatherData) && (0 === requestNodeIndex))) {
                return this._WeatherData_0_6;
            }
            return notFoundResult;
        };
        return _View_WeatherApp_Host0;
    }(DebugAppView$1));
    function viewFactory_WeatherApp_Host0(viewUtils, parentInjector, declarationEl) {
        if ((renderType_WeatherApp_Host === null)) {
            (renderType_WeatherApp_Host = viewUtils.createRenderComponentType('', 0, ViewEncapsulation$1.Emulated, styles_WeatherApp_Host));
        }
        return new _View_WeatherApp_Host0(viewUtils, parentInjector, declarationEl);
    }
    var WeatherAppNgFactory = new ComponentFactory$1('weather-app', viewFactory_WeatherApp_Host0, WeatherApp);
    var appInjector = ReflectiveInjector.resolveAndCreate(BROWSER_APP_COMMON_PROVIDERS, browserPlatform().injector);
    coreBootstrap(appInjector, WeatherAppNgFactory);
}());
//# sourceMappingURL=build.js.map
