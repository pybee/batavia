/* eslint-disable no-extend-native */
import { iter_for_each, pyargs } from '../core/callables'
import { pyIndexError, pyNotImplementedError, pyStopIteration, pyTypeError } from '../core/exceptions'
import { jstype, type_name, PyObject } from '../core/types'
import * as version from '../core/version'

import * as builtins from '../builtins'
import * as types from '../types'

/**************************************************
 * Set Iterator
 **************************************************/

class PySetIterator extends PyObject {
    __init__(data) {
        this.$index = 0
        this.$keys = []
        for (let i = 0; i < data.$data_keys.length; i++) {
            let key = data.$data_keys[i]
            // ignore deleted or empty
            if (data.$isEmpty(key) || data.$isDeleted(key)) {
                continue
            }
            this.$keys.push(key)
        }
    }

    __iter__() {
        return this
    }

    __next__() {
        var key = this.$keys[this.$index]
        if (key === undefined) {
            throw pyStopIteration()
        }
        this.$index++
        return key
    }

    __str__() {
        return '<set_iterator object at 0x99999999>'
    }
}
const set_iterator = jstype(PySetIterator, 'set_iterator', [], null)

/*************************************************************************
 * A Python Set type
 *************************************************************************/

/*
 * Implementation details: we use closed hashing, open addressing,
 * with linear probing and a max load factor of 0.75.
 */

var MAX_LOAD_FACTOR = 0.75
var INITIAL_SIZE = 8 // after size 0

/**
 * Sentinel keys for empty and deleted.
 */
var EMPTY = {
    __hash__: function() {
        return types.pyint(0)
    },
    __eq__: function(other) {
        return types.pybool(this === other)
    }
}

var DELETED = {
    __hash__: function() {
        return types.pyint(0)
    },
    __eq__: function(other) {
        return types.pybool(this === other)
    }
}

class PySet extends PyObject {
    @pyargs({
        default_args: ['iterable']
    })
    __init__(iterable) {
        this.$data_keys = []
        this.$size = 0
        this.$mask = 0

        if (iterable !== undefined) {
            this.update(iterable)
        }
    }

    $increase_size() {
        // increase the table size and rehash
        if (this.$data_keys.length === 0) {
            this.$mask = INITIAL_SIZE - 1
            this.$data_keys = new Array(INITIAL_SIZE)

            for (let i = 0; i < INITIAL_SIZE; i++) {
                this.$data_keys[i] = EMPTY
            }
            return
        }

        let new_keys = new Array(this.$data_keys.length * 2)
        let new_mask = this.$data_keys.length * 2 - 1 // assumes power of two
        for (let i = 0; i < new_keys.length; i++) {
            new_keys[i] = EMPTY
        }

        for (let i = 0; i < this.$data_keys.length; i++) {
            let key = this.$data_keys[i]
            if (this.$isEmpty(key) || this.$isDeleted(key)) {
                continue
            }

            var hash = builtins.hash(key).int32()
            var h = hash & new_mask
            while (!this.$isEmpty(new_keys[h])) {
                h = (h + 1) & new_mask
            }
            new_keys[h] = key
        }
        this.$data_keys = new_keys
        this.$mask = new_mask
    }

    $deleteAt(index) {
        this.$data_keys[index] = DELETED
        this.$size--
    }

    $isDeleted(x) {
        return x !== null &&
            builtins.hash(x).int32() === 0 &&
            x.__eq__(DELETED).valueOf()
    }

    $isEmpty(x) {
        return x !== null &&
            builtins.hash(x).int32() === 0 &&
            x.__eq__(EMPTY).valueOf()
    }

    $find_index(other) {
        if (this.$size === 0) {
            return null
        }
        var hash = builtins.hash(other).int32()
        var h = hash & this.$mask
        while (true) {
            var key = this.$data_keys[h]
            if (this.$isDeleted(key)) {
                h = (h + 1) & this.$mask
                continue
            }
            if (this.$isEmpty(key)) {
                return null
            }
            if (key === null && other === null) {
                return h
            }
            if (builtins.hash(key).int32() === hash &&
                ((key === null && other === null) || key.__eq__(other).valueOf())) {
                return h
            }
            h = (h + 1) & this.$mask

            if (h === (hash & this.$mask)) {
                // we have looped, definitely not here
                return null
            }
        }
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

    __len__() {
        return types.pyint(this.$size)
    }

    __bool__() {
        return this.$size > 0
    }

    __iter__() {
        return set_iterator(this)
    }

    __repr__() {
        return this.__str__()
    }

    __str__() {
        let result
        if (this.$size === 0) {
            result = 'set()'
        } else {
            result = '{'
            let strings = []
            for (let i = 0; i < this.$data_keys.length; i++) {
                let key = this.$data_keys[i]
                // ignore deleted or empty
                if (this.$isEmpty(key) || this.$isDeleted(key)) {
                    continue
                }
                strings.push(builtins.repr(key))
            }
            result += strings.join(', ')
            result += '}'
        }
        return result
    }

    /**************************************************
     * Comparison operators
     **************************************************/

    __lt__(other) {
        if (types.isinstance(other, [types.pyset, types.pyfrozenset])) {
            return types.pybool(this.$size < other.$size)
        }
        if (version.earlier('3.6')) {
            throw pyTypeError(
                'unorderable types: ' + this.__class__.__name__ + '() < ' + type_name(other) + '()'
            )
        } else {
            throw pyTypeError(
                "'<' not supported between instances of '" + this.__class__.__name__ + "' and '" + type_name(other) + "'"
            )
        }
    }

    __le__(other) {
        if (types.isinstance(other, [types.pyset, types.pyfrozenset])) {
            return types.pybool(this.$size <= other.$size)
        }
        if (version.earlier('3.6')) {
            throw pyTypeError(
                'unorderable types: ' + this.__class__.__name__ + '() <= ' + type_name(other) + '()'
            )
        } else {
            throw pyTypeError(
                "'<=' not supported between instances of '" + this.__class__.__name__ + "' and '" + type_name(other) + "'"
            )
        }
    }

    __eq__(other) {
        if (!types.isinstance(other, [types.pyfrozenset, types.pyset])) {
            return types.pybool(false)
        }
        if (this.$size !== other.$size) {
            return types.pybool(false)
        }
        var iterobj = builtins.iter(this)
        var equal = true
        iter_for_each(iterobj, function(val) {
            equal = equal && other.__contains__(val).valueOf()
        })

        return types.pybool(equal)
    }

    __ne__(other) {
        return this.__eq__(other).__not__()
    }

    __gt__(other) {
        if (types.isinstance(other, [types.pyset, types.pyfrozenset])) {
            return types.pybool(this.$size > other.$size)
        }
        if (version.earlier('3.6')) {
            throw pyTypeError(
                'unorderable types: ' + this.__class__.__name__ + '() > ' + type_name(other) + '()'
            )
        } else {
            throw pyTypeError(
                "'>' not supported between instances of '" + this.__class__.__name__ + "' and '" + type_name(other) + "'"
            )
        }
    }

    __ge__(other) {
        if (types.isinstance(other, [types.pyset, types.pyfrozenset])) {
            return types.pybool(this.$size >= other.$size)
        }
        if (version.earlier('3.6')) {
            throw pyTypeError(
                'unorderable types: ' + this.__class__.__name__ + '() >= ' + type_name(other) + '()'
            )
        } else {
            throw pyTypeError(
                "'>=' not supported between instances of '" + this.__class__.__name__ + "' and '" + type_name(other) + "'"
            )
        }
    }

    __contains__(value) {
        return types.pybool(this.$find_index(value) !== null)
    }

    /**************************************************
     * Unary operators
     **************************************************/
    __pos__() {
        throw pyTypeError("bad operand type for unary +: '" + this.__class__.__name__ + "'")
    }

    __neg__() {
        throw pyTypeError("bad operand type for unary -: '" + this.__class__.__name__ + "'")
    }

    __not__() {
        return this.__bool__().__not__()
    }

    __invert__() {
        throw pyTypeError("bad operand type for unary ~: '" + this.__class__.__name__ + "'")
    }

    /**************************************************
     * Binary operators
     **************************************************/

    __pow__(other) {
        throw pyTypeError("unsupported operand type(s) for ** or pow(): '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __div__(other) {
        throw pyTypeError("unsupported operand type(s) for /: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __floordiv__(other) {
        if (types.isinstance(other, types.pycomplex)) {
            throw pyTypeError("can't take floor of complex number.")
        } else {
            throw pyTypeError("unsupported operand type(s) for //: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
        }
    }

    __truediv__(other) {
        throw pyTypeError("unsupported operand type(s) for /: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __mul__(other) {
        if (types.isinstance(other, [
            types.pybytearray, types.pybytes, types.pylist,
            types.pystr, types.pytuple
        ])) {
            throw pyTypeError("can't multiply sequence by non-int of type '" + this.__class__.__name__ + "'")
        } else {
            throw pyTypeError("unsupported operand type(s) for *: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
        }
    }

    __mod__(other) {
        if (types.isinstance(other, types.pycomplex)) {
            throw pyTypeError("can't mod complex numbers.")
        } else {
            throw pyTypeError("unsupported operand type(s) for %: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
        }
    }

    __add__(other) {
        throw pyTypeError("unsupported operand type(s) for +: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __sub__(other) {
        if (types.isinstance(other, [types.pyfrozenset, types.pyset])) {
            var both = []
            var iterobj1 = builtins.iter(this)
            iter_for_each(iterobj1, function(val) {
                if (!(other.__contains__(val).valueOf())) {
                    both.push(val)
                }
            })
            return pyset(both)
        }
        throw pyTypeError("unsupported operand type(s) for -: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __getitem__(other) {
        if (types.isinstance(other, [types.pybool])) {
            throw pyTypeError("'" + this.__class__.__name__ + "' object does not support indexing")
        } else if (types.isinstance(other, [types.pyint])) {
            if (other.val.gt(types.pyint.MAX_INT.val) || other.val.lt(types.pyint.MIN_INT.val)) {
                throw pyIndexError("cannot fit 'int' into an index-sized integer")
            } else {
                throw pyTypeError("'" + this.__class__.__name__ + "' object does not support indexing")
            }
        }
        throw pyTypeError("'" + this.__class__.__name__ + "' object is not subscriptable")
    }

    __lshift__(other) {
        throw pyTypeError("unsupported operand type(s) for <<: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __rshift__(other) {
        throw pyTypeError("unsupported operand type(s) for >>: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __and__(other) {
        if (types.isinstance(other, [types.pyfrozenset, types.pyset])) {
            var both = []
            var iterobj = builtins.iter(this)
            iter_for_each(iterobj, function(val) {
                if (other.__contains__(val).valueOf()) {
                    both.push(val)
                }
            })
            return pyset(both)
        }
        throw pyTypeError("unsupported operand type(s) for &: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __xor__(other) {
        if (types.isinstance(other, [types.pyfrozenset, types.pyset])) {
            var both = []
            var iterobj1 = builtins.iter(this)
            iter_for_each(iterobj1, function(val) {
                if (!(other.__contains__(val).valueOf())) {
                    both.push(val)
                }
            })
            var iterobj2 = builtins.iter(other)
            iter_for_each(iterobj2, function(val) {
                if (!(this.__contains__(val).valueOf())) {
                    both.push(val)
                }
            }.bind(this))
            return pyset(both)
        }
        throw pyTypeError("unsupported operand type(s) for ^: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __or__(other) {
        if (types.isinstance(other, [types.pyfrozenset, types.pyset])) {
            var both = []
            var iterobj1 = builtins.iter(this)
            iter_for_each(iterobj1, function(val) {
                both.push(val)
            })
            var iterobj2 = builtins.iter(other)
            iter_for_each(iterobj2, function(val) {
                both.push(val)
            })
            return pyset(both)
        }
        throw pyTypeError("unsupported operand type(s) for |: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    /**************************************************
     * Inplace operators
     **************************************************/

    __ifloordiv__(other) {
        if (types.isinstance(other, types.pycomplex)) {
            throw pyTypeError("can't take floor of complex number.")
        } else {
            throw pyTypeError("unsupported operand type(s) for //=: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
        }
    }

    __itruediv__(other) {
        throw pyTypeError("unsupported operand type(s) for /=: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __iadd__(other) {
        throw pyTypeError("unsupported operand type(s) for +=: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __isub__(other) {
        if (types.isinstance(other, [types.pyfrozenset, types.pyset])) {
            var both = []
            var iterobj1 = builtins.iter(this)
            iter_for_each(iterobj1, function(val) {
                if (!(other.__contains__(val).valueOf())) {
                    both.push(val)
                }
            })
            this.update(both)
            return pyset(both)
        }
        throw pyTypeError("unsupported operand type(s) for -=: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __imul__(other) {
        throw pyTypeError("unsupported operand type(s) for *=: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __imod__(other) {
        if (types.isinstance(other, types.pycomplex)) {
            throw pyTypeError("can't mod complex numbers.")
        } else {
            throw pyTypeError("unsupported operand type(s) for %=: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
        }
    }

    __ipow__(other) {
        throw pyTypeError("unsupported operand type(s) for ** or pow(): '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __ilshift__(other) {
        throw pyTypeError("unsupported operand type(s) for <<=: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __irshift__(other) {
        throw pyTypeError("unsupported operand type(s) for >>=: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __iand__(other) {
        if (types.isinstance(other, [types.pyfrozenset, types.pyset])) {
            var intersection = pyset()
            var iterobj = builtins.iter(this)
            iter_for_each(iterobj, function(val) {
                if (other.__contains__(val).valueOf()) {
                    intersection.add(val)
                }
            })
            return intersection
        }
        throw pyTypeError("unsupported operand type(s) for &=: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __ixor__(other) {
        if (types.isinstance(other, [types.pyfrozenset, types.pyset])) {
            var both = []
            var iterobj1 = builtins.iter(this)
            iter_for_each(iterobj1, function(val) {
                if (!(other.__contains__(val).valueOf())) {
                    both.push(val)
                }
            })
            var iterobj2 = builtins.iter(other)
            iter_for_each(iterobj2, function(val) {
                if (!(this.__contains__(val).valueOf())) {
                    both.push(val)
                }
            }.bind(this))
            this.update(both)
            return pyset(both)
        }
        throw pyTypeError("unsupported operand type(s) for ^=: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    __ior__(other) {
        if (types.isinstance(other, [types.pyfrozenset, types.pyset])) {
            var both = []
            var iterobj1 = builtins.iter(this)
            iter_for_each(iterobj1, function(val) {
                both.push(val)
            })
            var iterobj2 = builtins.iter(other)
            iter_for_each(iterobj2, function(val) {
                both.push(val)
            })
            this.update(both)
            return pyset(both)
        }
        throw pyTypeError("unsupported operand type(s) for |=: '" + this.__class__.__name__ + "' and '" + type_name(other) + "'")
    }

    /**************************************************
     * Methods
     **************************************************/

    add(val) {
        if (this.$size + 1 > this.$data_keys.length * MAX_LOAD_FACTOR) {
            this.$increase_size()
        }
        var hash = builtins.hash(val).int32()
        var h = hash & this.$mask

        while (true) {
            var current_key = this.$data_keys[h]
            if (this.$isEmpty(current_key) || this.$isDeleted(current_key)) {
                this.$data_keys[h] = val
                this.$size++
                return
            } else if (current_key === null && val === null) {
                this.$data_keys[h] = val
                return
            } else if (builtins.hash(current_key).int32() === hash &&
                       current_key.__eq__(val).valueOf()) {
                this.$data_keys[h] = val
                return
            }

            h = (h + 1) & this.$mask
            if (h === (hash & this.$mask)) {
                // we have looped, we'll rehash (should be impossible)
                this.$increase_size()
                h = hash & this.$mask
            }
        }
    }

    clear() {
        throw pyNotImplementedError()
    }

    copy() {
        return pyset(this)
    }

    difference() {
        throw pyNotImplementedError()
    }

    difference_update() {
        throw pyNotImplementedError()
    }

    discard() {
        throw pyNotImplementedError()
    }

    intersection() {
        throw pyNotImplementedError()
    }

    intersection_update() {
        throw pyNotImplementedError()
    }

    isdisjoint() {
        throw pyNotImplementedError()
    }

    issubset() {
        throw pyNotImplementedError()
    }

    issuperset() {
        throw pyNotImplementedError()
    }

    pop() {
        throw pyNotImplementedError()
    }

    remove(v) {
        this.data.__delitem__(v)
    }

    symmetric_difference() {
        throw pyNotImplementedError()
    }

    symmetric_difference_update() {
        throw pyNotImplementedError()
    }

    union() {
        throw pyNotImplementedError()
    }

    update(args) {
        var new_args = types.js2py(args)
        var iterobj = builtins.iter(new_args)
        var self = this
        iter_for_each(iterobj, function(val) {
            self.add(val)
        })
    }
}
PySet.prototype.__doc__ = `set() -> new empty set object
set(iterable) -> new set object

Build an unordered collection of unique elements.`

const pyset = jstype(PySet, 'set', [], null)
export default pyset
