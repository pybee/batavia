from .. utils import TranspileTestCase, BuiltinFunctionTestCase


class BinTests(TranspileTestCase):
    pass


class BuiltinBinFunctionTests(BuiltinFunctionTestCase, TranspileTestCase):
    functions = ["bin"]

    not_implemented = [
        'test_bool',
        'test_bytearray',
        'test_complex',
        'test_dict',
        'test_frozenset',
        'test_int',
        'test_set',
    ]
