import { pyPolyglotError } from '../core/exceptions'

export default function id(object) {
    throw pyPolyglotError("'id' has no meaning here. See docs/internals/limitations#id")
}

id.__name__ = 'id'
id.__doc__ = 'Return the identity of an object.  This is guaranteed to be unique among simultaneously existing objects.  (Hint: it\'s the object\'s memory address.)'
id.$pyargs = {
    args: ['object']
}
