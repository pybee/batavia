import { PyStopIteration } from '../core/exceptions'
import { create_pyclass, PyObject } from '../core/types'

import * as types from '../types'

/**************************************************
 * Bytes Iterator
 **************************************************/

export default class PyBytesIterator extends PyObject {
    constructor(data) {
        super()
        this.index = 0
        this.data = data
    }

    __iter__() {
        return this
    }

    __next__() {
        if (this.index >= this.data.length) {
            throw new PyStopIteration()
        }
        var retval = this.data[this.index]
        this.index++
        return new types.PyInt(retval)
    }

    __str__() {
        return '<bytes_iterator object at 0x99999999>'
    }
}
create_pyclass(PyBytesIterator, 'bytes_iterator')
