import * as exceptions from '../core/exceptions'
import * as types from '../types'
import * as callables from '../core/callables'

export default function reversed(args, kwargs) {
    var iterable = args[0]
    if (args.length === 0) {
        throw new exceptions.PyTypeError('reversed expected 1 arguments, got 0')
    } else if (iterable.__reversed__) {
        return callables.call_method(iterable, '__reversed__', [])
    } else if (iterable.__len__ && iterable.__getitem__) {
        var new_iterable = iterable.slice(0)
        new_iterable.reverse()
        return new types.PyList(new_iterable)
    }

    throw new exceptions.PyNotImplementedError("Builtin Batavia function 'reversed' not implemented for objects")
}

reversed.__doc__ = 'reversed(sequence) -> reverse iterator over values of the sequence\n\nReturn a reverse iterator'
reversed.$pyargs = true
