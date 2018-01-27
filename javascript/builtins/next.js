import { call_method } from '../core/callables'
import { StopIteration, TypeError } from '../core/exceptions'
import { type_name } from '../core/types'

export default function next(iterator, default_val) {
    try {
        return call_method(iterator, '__next__', [])
    } catch (e) {
        if (e instanceof StopIteration) {
            if (default_val !== undefined) {
                return default_val
            } else {
                throw e
            }
        } else {
            throw new TypeError("'" + type_name(iterator) + "' object is not an iterator")
        }
    }
}

next.__name__ = 'next'
next.__doc__ = `next(iterator[, default])

Return the next item from the iterator. If default is given and the iterator
is exhausted, it is returned instead of raising StopIteration.`
next.$pyargs = {
    args: ['iterator'],
    default_args: ['default_val'],
    missing_args_error: (e) => `next expected at least ${e.nargs} arguments, got ${e.given}`
}