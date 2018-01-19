import { call_method } from '../core/callables'
import { TypeError } from '../core/exceptions'
import { type_name } from '../core/types'

import * as types from '../types'

export default function str(object='') {
    if (object === null) {
        return 'None'
    } else if (object.__str__) {
        return object.__str__()
    } else {
        return object.toString()
    }
}
str.__doc__ = 'str(object) -> string\n\nReturn the canonical string representation of the object.\nFor most object types, eval(repr(object)) === object.'
str.$pyargs = {
    default_args: ['object']
}
