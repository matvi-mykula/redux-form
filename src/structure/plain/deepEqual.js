// @flow
import React from 'react'
import { isEqualWith, isNil } from 'lodash'

const isEmpty = (obj: any) => {
  return isNil(obj) || obj === '' || isNaN(obj)
}

// emptiesEqual: undefined, null, '' and NaN compare equal, and so do 0 and false. Right for a
// dirty check; a strict comparison keeps them apart so a write of one over another is not lost.
const makeCustomizer = (emptiesEqual: boolean) => (obj: any, other: any) => {
  if (obj === other) return true

  if (!obj && !other) {
    return emptiesEqual ? isEmpty(obj) === isEmpty(other) : undefined
  }

  if (obj && other && obj._error !== other._error) return false
  if (obj && other && obj._warning !== other._warning) return false
  if (React.isValidElement(obj) || React.isValidElement(other)) return false
}

const customizer = makeCustomizer(true)
const strictCustomizer = makeCustomizer(false)

const deepEqual = (a: any, b: any) => isEqualWith(a, b, customizer)
export const deepEqualStrict = (a: any, b: any) =>
  isEqualWith(a, b, strictCustomizer)

export default deepEqual
