// @flow
import { Iterable } from 'immutable'

import { isEqualWith, isNil } from 'lodash'

const isEmpty = (obj: any) => {
  return isNil(obj) || obj === '' || isNaN(obj)
}

// emptiesEqual: see structure/plain/deepEqual
const makeCustomizer = (emptiesEqual: boolean) => {
  const customizer = (obj: any, other: any) => {
    if (obj === other) return true
    if (!obj && !other) {
      return emptiesEqual ? isEmpty(obj) === isEmpty(other) : undefined
    }

    if (Iterable.isIterable(obj) && Iterable.isIterable(other)) {
      return (
        obj.count() === other.count() &&
        obj.every((value, key) => {
          return (
            other.has(key) && isEqualWith(value, other.get(key), customizer)
          )
        })
      )
    }

    return void 0
  }
  return customizer
}

const customizer = makeCustomizer(true)
const strictCustomizer = makeCustomizer(false)

const deepEqual = (a: any, b: any) => isEqualWith(a, b, customizer)
export const deepEqualStrict = (a: any, b: any) =>
  isEqualWith(a, b, strictCustomizer)

export default deepEqual
