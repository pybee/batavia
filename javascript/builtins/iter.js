import { pyStopIteration, pyTypeError } from '../core/exceptions'
import { jstype, type_name, PyObject } from '../core/types'

/**************************************************
 * Callable Iterator
 **************************************************/

class PyCallableIterator extends PyObject {
    __init__(callable, sentinel) {
        this.$callable = callable
        this.$sentinel = sentinel
        this.$exhausted = false
    }

    __next__() {
        if (this.$exhausted) {
            throw pyStopIteration()
        }

        var item = this.$callable()
        if (item.__eq__(this.$sentinel)) {
            this.$exhausted = true
            throw pyStopIteration()
        }
        return item
    }

    __iter__() {
        return this
    }

    __str__() {
        return '<callable_iterator object at 0x99999999>'
    }
}
const callable_iterator = jstype(PyCallableIterator, 'callable_iterator')

export default function iter(iterable, sentinel) {
    if (sentinel !== undefined) {
        return callable_iterator(iterable, sentinel)
    } else {
        try {
            return iterable.__iter__()
        } catch (e) {
            throw pyTypeError(`'${type_name(iterable)}' object is not iterable`)
        }
    }
}

iter.__name__ = 'iter'
iter.__doc__ = `iter(iterable) -> iterator
iter(callable, sentinel) -> iterator

Get an iterator from an object.  In the first form, the argument must
supply its own iterator, or be a sequence.
In the second form, the callable is called until it returns the sentinel.`
iter.$pyargs = {
    args: ['iterable'],
    default_args: ['sentinel']
}
