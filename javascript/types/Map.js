/* eslint-disable no-extend-native */
import { TypeError } from '../core/exceptions'
import * as callables from '../core/callables'
import { create_pyclass, type_name, PyObject } from '../core/types'

import * as builtins from '../builtins'

/*************************************************************************
 * A Python map builtin is a type
 *************************************************************************/

export default class Map extends PyObject {
    constructor(args, kwargs) {
        super()

        if (args.length < 2) {
            throw new TypeError('map expected 2 arguments, got ' + args.length)
        }
        this._func = args[0]
        this._sequence = args[1]
    }

    /**************************************************
     * Javascript compatibility methods
     **************************************************/

    toString() {
        return this.__str__()
    }

    /**************************************************
     * Type conversions
     **************************************************/

    __iter__() {
        return this
    }

    __next__() {
        if (!this._iter) {
            this._iter = builtins.iter(this._sequence)
        }
        if (!builtins.callable(this._func)) {
            throw new TypeError(
                type_name(this._func) + "' object is not callable")
        }

        var val = callables.call_method(this._iter, '__next__', [])
        return callables.call_function(this._func, [val], null)
    }

    __str__() {
        return '<map object at 0x99999999>'
    }
}
create_pyclass(Map, 'map')
