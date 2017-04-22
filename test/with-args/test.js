import test from 'ava'
import macro from '../util'

test('with args', macro, __dirname, { removePath: 'test/' })
