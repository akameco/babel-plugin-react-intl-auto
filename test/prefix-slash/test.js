import test from 'ava'
import macro from '../util'

test('prefix slash', macro, __dirname, { removePrefix: 'test' })
