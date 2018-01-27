import { python } from '../core/callables'
import { OverflowError, TypeError, ValueError, ZeroDivisionError } from '../core/exceptions'
import { create_pyclass, type_name, PyObject, PyNone } from '../core/types'
import * as version from '../core/version'

import * as types from '../types'

/*************************************************************************
 * A Python float type
 *************************************************************************/

function python_modulo(n, m) {
    return ((n % m) + m) % m
}

export default class PyFloat extends PyObject {
    @python({
        default_args: ['x']
    })
    __init__(x = 0.0) {
        if (typeof x === 'number') {
            this.val = x
        } else if (types.isinstance(x, types.PyStr)) {
            if (x.length === 0) {
                throw new ValueError('could not convert string to float: ')
            } else if (x.search(/[^-0-9.]/g) === -1) {
                this.val = parseFloat(x)
            } else {
                if (x === 'nan' || x === '+nan' || x === '-nan') {
                    this.val = NaN
                } else if (x === 'inf' || x === '+inf') {
                    this.val = Infinity
                } else if (x === '-inf') {
                    this.val = -Infinity
                }
                throw new ValueError("could not convert string to float: '" + x + "'")
            }
        } else if (types.isinstance(x, [types.PyInt, types.PyBool, types.PyFloat])) {
            this.val = x.__float__().val
        } else {
            throw new TypeError(
                "float() argument must be a string, a bytes-like object or a number, not '" + type_name(x) + "'")
        }
    }

    /**************************************************
     * Javascript compatibility methods
     **************************************************/

    toString() {
        return this.__str__()
    }

    valueOf() {
        return this.val
    }

    /**************************************************
     * Type conversions
     **************************************************/

    __bool__() {
        return this.val !== 0.0
    }

    __int__() {
        return new types.PyInt(Math.trunc(this.val))
    }

    __repr__() {
        return this.__str__()
    }

    __str__() {
        if (!isFinite(this.val)) {
            if (isNaN(this.val)) {
                return 'nan'
            }
            if (this.val < 0) {
                return '-inf'
            }
            return 'inf'
        }
        if (this.val === 0) {
            if (1 / this.val === Infinity) {
                return '0.0'
            } else {
                return '-0.0'
            }
        } else if (this.val === Math.round(this.val)) {
            var s = this.val.toString()
            if (s.length >= 19) {
                // force conversion to scientific
                return this.val.toExponential()
            }
            if (s.indexOf('.') < 0) {
                return s + '.0'
            }
            return s
        } else {
            return this.val.toString()
        }
    }

    __float__() {
        return this
    }

    /**************************************************
     * Comparison operators
     **************************************************/

    __lt__(other) {
        if (other !== PyNone) {
            if (types.isinstance(other, [
                types.PyDict, types.PyList, types.PyTuple,
                types.PyNoneType, types.PyStr, types.PyNotImplementedType,
                types.PyRange, types.PySet, types.PySlice,
                types.PyBytes, types.PyBytearray
            ])) {
                if (version.earlier('3.6')) {
                    throw new TypeError(
                        'unorderable types: float() < ' + type_name(other) + '()'
                    )
                } else {
                    throw new TypeError(
                        "'<' not supported between instances of 'float' and '" +
                        type_name(other) + "'"
                    )
                }
            } else {
                return this.valueOf() < other.valueOf()
            }
        } else {
            if (version.earlier('3.6')) {
                throw new TypeError(
                    'unorderable types: float() < NoneType()'
                )
            } else {
                throw new TypeError(
                    "'<' not supported between instances of 'float' and 'NoneType'"
                )
            }
        }
    }

    __le__(other) {
        if (other !== PyNone) {
            if (types.isinstance(other, [
                types.PyDict, types.PyList, types.PyTuple,
                types.PyNoneType, types.PyStr, types.PyNotImplementedType,
                types.PyRange, types.PySet, types.PySlice
            ])) {
                if (version.earlier('3.6')) {
                    throw new TypeError(
                        'unorderable types: float() <= ' + type_name(other) + '()'
                    )
                } else {
                    throw new TypeError(
                        "'<=' not supported between instances of 'float' and '" +
                        type_name(other) + "'"
                    )
                }
            } else {
                return this.valueOf() <= other.valueOf()
            }
        } else {
            if (version.earlier('3.6')) {
                throw new TypeError(
                    'unorderable types: float() <= NoneType()'
                )
            } else {
                throw new TypeError(
                    "'<=' not supported between instances of 'float' and 'NoneType'"
                )
            }
        }
    }

    __eq__(other) {
        if (other !== null && !types.isinstance(other, types.PyStr)) {
            var val
            if (types.isinstance(other, types.PyBool)) {
                if (other.valueOf()) {
                    val = 1.0
                } else {
                    val = 0.0
                }
            } else if (types.isinstance(other, types.PyInt)) {
                val = parseFloat(other.val)
            } else {
                val = other.valueOf()
            }
            return this.valueOf() === val
        }
        return false
    }

    __ne__(other) {
        return !this.__eq__(other)
    }

    __gt__(other) {
        if (other !== PyNone) {
            if (types.isinstance(other, [
                types.PyDict, types.PyList, types.PyTuple,
                types.PyNoneType, types.PyStr, types.PyNotImplementedType,
                types.PyRange, types.PySet, types.PySlice
            ])) {
                if (version.earlier('3.6')) {
                    throw new TypeError(
                        'unorderable types: float() > ' + type_name(other) + '()'
                    )
                } else {
                    throw new TypeError(
                        "'>' not supported between instances of 'float' and '" +
                        type_name(other) + "'"
                    )
                }
            } else {
                return this.valueOf() > other.valueOf()
            }
        } else {
            if (version.earlier('3.6')) {
                throw new TypeError(
                    'unorderable types: float() > NoneType()'
                )
            } else {
                throw new TypeError(
                    "'>' not supported between instances of 'float' and 'NoneType'"
                )
            }
        }
    }

    __ge__(other) {
        if (other !== PyNone) {
            if (types.isinstance(other, [
                types.PyDict, types.PyList, types.PyTuple,
                types.PyNoneType, types.PyStr, types.PyNotImplementedType,
                types.PyRange, types.PySet, types.PySlice,
                types.PyBytes, types.PyBytearray
            ])) {
                if (version.earlier('3.6')) {
                    throw new TypeError(
                        'unorderable types: float() >= ' + type_name(other) + '()'
                    )
                } else {
                    throw new TypeError(
                        "'>=' not supported between instances of 'float' and '" +
                        type_name(other) + "'"
                    )
                }
            } else {
                return this.valueOf() >= other.valueOf()
            }
        } else {
            if (version.earlier('3.6')) {
                throw new TypeError(
                    'unorderable types: float() >= NoneType()'
                )
            } else {
                throw new TypeError(
                    "'>=' not supported between instances of 'float' and 'NoneType'"
                )
            }
        }
    }

    __contains__(other) {
        return false
    }

    /**************************************************
     * Unary operators
     **************************************************/

    __pos__() {
        return new PyFloat(+this.valueOf())
    }

    __neg__() {
        return new PyFloat(-this.valueOf())
    }

    __not__() {
        return new types.PyBool(!this.valueOf())
    }

    __invert__() {
        throw new TypeError("bad operand type for unary ~: 'float'")
    }

    __abs__() {
        return new PyFloat(Math.abs(this.valueOf()))
    }

    /**************************************************
     * Binary operators
     **************************************************/

    __pow__(other) {
        if (types.isinstance(other, types.PyBool)) {
            if (other.valueOf()) {
                return new PyFloat(Math.pow(this.valueOf(), 1))
            } else {
                return new PyFloat(Math.pow(this.valueOf(), 0))
            }
        } else if (types.isinstance(other, [PyFloat, types.PyInt])) {
            if (this.valueOf() === 0 && other.valueOf() < 0) {
                throw new ZeroDivisionError('0.0 cannot be raised to a negative power')
            } else {
                return new PyFloat(Math.pow(this.valueOf(), other.valueOf()))
            }
        } else {
            throw new TypeError("unsupported operand type(s) for ** or pow(): 'float' and '" + type_name(other) + "'")
        }
    }

    __div__(other) {
        return this.__truediv__(other)
    }

    __floordiv__(other) {
        if (types.isinstance(other, types.PyInt)) {
            if (!other.val.isZero()) {
                return new PyFloat(Math.floor(this.valueOf() / other.valueOf()))
            } else {
                throw new ZeroDivisionError('float divmod()')
            }
        } else if (types.isinstance(other, PyFloat)) {
            if (other.valueOf()) {
                return new PyFloat(Math.floor(this.valueOf() / other.valueOf()))
            } else {
                throw new ZeroDivisionError('float divmod()')
            }
        } else if (types.isinstance(other, types.PyBool)) {
            if (other.valueOf()) {
                return new PyFloat(Math.floor(this.valueOf()))
            } else {
                throw new ZeroDivisionError('float divmod()')
            }
        } else {
            throw new TypeError("unsupported operand type(s) for //: 'float' and '" + type_name(other) + "'")
        }
    }

    __truediv__(other) {
        if (types.isinstance(other, types.PyInt)) {
            if (!other.val.isZero()) {
                return new PyFloat(this.valueOf() / other.valueOf())
            } else {
                throw new ZeroDivisionError('float division by zero')
            }
        } else if (types.isinstance(other, PyFloat)) {
            if (other.valueOf()) {
                return new PyFloat(this.valueOf() / other.valueOf())
            } else {
                throw new ZeroDivisionError('float division by zero')
            }
        } else if (types.isinstance(other, types.PyBool)) {
            if (other.valueOf()) {
                return new PyFloat(this.valueOf())
            } else {
                throw new ZeroDivisionError('float division by zero')
            }
        } else {
            throw new TypeError("unsupported operand type(s) for /: 'float' and '" + type_name(other) + "'")
        }
    }

    __mul__(other) {
        if (other === null) {
            throw new TypeError("unsupported operand type(s) for *: 'float' and 'NoneType'")
        } else if (types.isinstance(other, types.PyBool)) {
            if (other.valueOf()) {
                return new PyFloat(this.valueOf() * 1)
            } else {
                return new PyFloat(this.valueOf() * 0)
            }
        } else if (types.isinstance(other, [PyFloat, types.PyInt])) {
            return new PyFloat(this.valueOf() * other.valueOf())
        } else if (types.isinstance(other, [types.PyList, types.PyStr, types.PyTuple, types.PyBytes, types.PyBytearray])) {
            throw new TypeError("can't multiply sequence by non-int of type 'float'")
        } else {
            throw new TypeError("unsupported operand type(s) for *: 'float' and '" + type_name(other) + "'")
        }
    }

    __mod__(other) {
        if (types.isinstance(other, types.PyInt)) {
            if (other.val.isZero()) {
                throw new ZeroDivisionError('float modulo')
            } else {
                var thisNum = this.valueOf()
                var otherNum = parseFloat(other.val)
                var result = new PyFloat(python_modulo(thisNum, otherNum))
                if (otherNum > PyFloat.MAX_FLOAT || otherNum < PyFloat.MIN_FLOAT || result.toString() === 'nan' || result.toString() === 'inf' || result.toString() === '-inf') {
                    throw new OverflowError(
                        'int too large to convert to float'
                    )
                }
                if ((otherNum > thisNum && thisNum > 0) || (thisNum > otherNum && thisNum < 0) || thisNum === 0) {
                    return new PyFloat(thisNum)
                }
                if (result.valueOf() === 0 && (thisNum % otherNum) + otherNum === otherNum) {
                    return new PyFloat(otherNum)
                }
                return result
            }
        } else if (types.isinstance(other, PyFloat)) {
            if (other.valueOf() === 0) {
                throw new ZeroDivisionError('float modulo')
            } else {
                return new PyFloat(python_modulo(this.valueOf(), other.valueOf()))
            }
        } else if (types.isinstance(other, types.PyBool)) {
            if (other.valueOf()) {
                return new PyFloat(python_modulo(this.valueOf(), other.valueOf()))
            } else {
                throw new ZeroDivisionError('float modulo')
            }
        } else {
            throw new TypeError(
                "unsupported operand type(s) for %: 'float' and '" + type_name(other) + "'"
            )
        }
    }

    __add__(other) {
        if (types.isinstance(other, [types.PyInt, PyFloat])) {
            var value = new PyFloat(this.valueOf() + parseFloat(other.valueOf()))
            if (value.toString() === 'inf' || value.toString() === '-inf') {
                throw new OverflowError(
                    'int too large to convert to float'
                )
            }
            return value
        } else if (types.isinstance(other, types.PyBool)) {
            if (other.valueOf()) {
                return new PyFloat(this.valueOf() + 1.0)
            } else {
                return new PyFloat(this.valueOf())
            }
        } else if (types.isinstance(other, types.PyComplex)) {
            var real = new PyFloat(this.valueOf() + other.real)
            return new types.PyComplex(real.valueOf(), other.imag.valueOf())
        } else {
            throw new TypeError("unsupported operand type(s) for +: 'float' and '" + type_name(other) + "'")
        }
    }

    __sub__(other) {
        if (types.isinstance(other, [types.PyInt, PyFloat])) {
            var value = new PyFloat(this.valueOf() - other.valueOf())
            if (value.toString() === 'inf' || value.toString() === '-inf') {
                throw new OverflowError(
                    'int too large to convert to float'
                )
            }
            return value
        } else if (types.isinstance(other, types.PyBool)) {
            if (other.valueOf()) {
                return new PyFloat(this.valueOf() - 1.0)
            } else {
                return new PyFloat(this.valueOf())
            }
        } else if (types.isinstance(other, types.PyComplex)) {
            var real = new PyFloat(this.valueOf() - other.real)
            return new types.PyComplex(real.valueOf(), -other.imag.valueOf())
        } else {
            throw new TypeError("unsupported operand type(s) for -: 'float' and '" + type_name(other) + "'")
        }
    }

    __getitem__(other) {
        throw new TypeError("'float' object is not subscriptable")
    }

    __lshift__(other) {
        throw new TypeError(
            "unsupported operand type(s) for <<: 'float' and '" + type_name(other) + "'"
        )
    }

    __rshift__(other) {
        throw new TypeError(
            "unsupported operand type(s) for >>: 'float' and '" + type_name(other) + "'"
        )
    }

    __and__(other) {
        throw new TypeError(
            "unsupported operand type(s) for &: 'float' and '" + type_name(other) + "'"
        )
    }

    __xor__(other) {
        throw new TypeError(
            "unsupported operand type(s) for ^: 'float' and '" + type_name(other) + "'"
        )
    }

    __or__(other) {
        throw new TypeError(
            "unsupported operand type(s) for |: 'float' and '" + type_name(other) + "'"
        )
    }

    /**************************************************
     * Inplace operators
     **************************************************/

    // Call the method named "f" with argument "other"; if a type error is raised, throw a different type error
    __call_binary_operator__(f, operator_str, other) {
        try {
            return this[f](other)
        } catch (error) {
            if (error instanceof TypeError) {
                throw new TypeError(
                    'unsupported operand type(s) for ' + operator_str + ": 'float' and '" + type_name(other) + "'")
            } else {
                throw error
            }
        }
    }

    __ifloordiv__(other) {
        return this.__call_binary_operator__('__floordiv__', '//=', other)
    }

    __itruediv__(other) {
        return this.__call_binary_operator__('__truediv__', '/=', other)
    }

    __iadd__(other) {
        return this.__call_binary_operator__('__add__', '+=', other)
    }

    __isub__(other) {
        return this.__call_binary_operator__('__sub__', '-=', other)
    }

    __imul__(other) {
        if (types.isinstance(other, [types.PyList, types.PyStr, types.PyTuple])) {
            throw new TypeError("can't multiply sequence by non-int of type 'float'")
        } else {
            return this.__call_binary_operator__('__mul__', '*=', other)
        }
    }

    __imod__(other) {
        return this.__call_binary_operator__('__mod__', '%=', other)
    }

    __ipow__(other) {
        return this.__pow__(other)
    }

    __ilshift__(other) {
        return this.__call_binary_operator__('__lshift__', '<<=', other)
    }

    __irshift__(other) {
        return this.__call_binary_operator__('__rshift__', '>>=', other)
    }

    __iand__(other) {
        return this.__call_binary_operator__('__and__', '&=', other)
    }

    __ixor__(other) {
        return this.__call_binary_operator__('__xor__', '^=', other)
    }

    __ior__(other) {
        return this.__call_binary_operator__('__or__', '|=', other)
    }

    /**************************************************
     * Methods
     **************************************************/

    copy() {
        return new PyFloat(this.valueOf())
    }

    is_integer() {
        return new types.PyBool(Number.isInteger(this.valueOf()))
    }

    __trunc__() {
        return new types.PyInt(Math.trunc(this.valueOf()))
    }
}
create_pyclass(PyFloat, 'float')

PyFloat.MAX_FLOAT = new PyFloat('179769313486231580793728971405303415079934132710037826936173778980444968292764750946649017977587207096330286416692887910946555547851940402630657488671505820681908902000708383676273854845817711531764475730270069855571366959622842914819860834936475292719074168444365510704342711559699508093042880177904174497791')
PyFloat.MIN_FLOAT = new PyFloat('-179769313486231580793728971405303415079934132710037826936173778980444968292764750946649017977587207096330286416692887910946555547851940402630657488671505820681908902000708383676273854845817711531764475730270069855571366959622842914819860834936475292719074168444365510704342711559699508093042880177904174497791')