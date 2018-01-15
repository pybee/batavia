// Set up VM constants
export const TEXT_ENCODINGS = {
    'ascii': [
        'ascii', '646', 'us-ascii'
    ],
    'latin_1': [
        'latin_1', 'latin-1', 'iso-8859-1', 'iso8859-1',
        '8859', 'cp819', 'latin', 'latin1', 'L1'
    ],
    'utf_8': [
        'utf_8', 'utf-8', 'utf8', 'u8', 'UTF'
    ]
}

export var BATAVIA_MAGIC = null

// set in PYCFile while parsing python bytecode
export const BATAVIA_MAGIC_34 = String.fromCharCode(238, 12, 13, 10)
export const BATAVIA_MAGIC_35a0 = String.fromCharCode(248, 12, 13, 10)
export const BATAVIA_MAGIC_35 = String.fromCharCode(22, 13, 13, 10)
export const BATAVIA_MAGIC_353 = String.fromCharCode(23, 13, 13, 10)
export const BATAVIA_MAGIC_36 = String.fromCharCode(51, 13, 13, 10)

export function set_magic(magic) {
    BATAVIA_MAGIC = String.fromCharCode(magic[0], magic[1], magic[2], magic[3])
}