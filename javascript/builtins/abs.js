import { call_method } from '../core/callables'
import { TypeError } from '../core/exceptions'
import { type_name } from '../core/types'

import * as types from '../types'

export default function abs(x) {
    if (types.isinstance(x, types.PyBool)) {
        return new types.PyInt(Math.abs(x.valueOf()))
    } else if (types.isinstance(x, [types.PyInt, types.PyFloat, types.PyComplex])) {
        return call_method(x, '__abs__')
    } else {
        throw new TypeError("bad operand type for abs(): '" + type_name(x) + "'")
    }
}

abs.__name__ = 'name'
abs.__doc__ = 'Return the absolute value of the argument.'
abs.$pyargs = {
    args: ['x']
}
