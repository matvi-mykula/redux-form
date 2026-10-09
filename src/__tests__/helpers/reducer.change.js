import actions from '../../actions'
const { change } = actions

const describeChange = (reducer, expect, { fromJS, getIn }) => () => {
  it('should set value on change with empty state', () => {
    const state = reducer(undefined, change('foo', 'myField', 'myValue'))
    expect(state).toEqualMap({
      foo: {
        values: {
          myField: 'myValue'
        }
      }
    })
  })

  it('should set value on change and touch with empty state', () => {
    const state = reducer(undefined, change('foo', 'myField', 'myValue', true))
    expect(state).toEqualMap({
      foo: {
        anyTouched: true,
        values: {
          myField: 'myValue'
        },
        fields: {
          myField: {
            touched: true
          }
        }
      }
    })
  })

  it('should set value on change and touch with initial value', () => {
    const state = reducer(
      fromJS({
        foo: {
          values: {
            myField: 'initialValue'
          },
          initial: {
            myField: 'initialValue'
          }
        }
      }),
      change('foo', 'myField', 'myValue', true)
    )
    expect(state).toEqualMap({
      foo: {
        anyTouched: true,
        values: {
          myField: 'myValue'
        },
        initial: {
          myField: 'initialValue'
        },
        fields: {
          myField: {
            touched: true
          }
        }
      }
    })
  })

  it("should allow setting an initialized field to ''", () => {
    const state = reducer(
      fromJS({
        foo: {
          values: {
            myField: 'initialValue'
          },
          initial: {
            myField: 'initialValue'
          }
        }
      }),
      change('foo', 'myField', '', true)
    )
    expect(state).toEqualMap({
      foo: {
        anyTouched: true,
        values: {
          myField: ''
        },
        initial: {
          myField: 'initialValue'
        },
        fields: {
          myField: {
            touched: true
          }
        }
      }
    })
  })

  it("should remove a value if on change is set with ''", () => {
    const state = reducer(
      fromJS({
        foo: {
          values: {
            myField: 'initialValue'
          }
        }
      }),
      change('foo', 'myField', '', true)
    )
    expect(state).toEqualMap({
      foo: {
        anyTouched: true,
        fields: {
          myField: {
            touched: true
          }
        }
      }
    })
  })

  it("should NOT remove a value if on change is set with '' if it's an array field", () => {
    const state = reducer(
      fromJS({
        foo: {
          values: {
            myField: ['initialValue']
          }
        }
      }),
      change('foo', 'myField[0]', '', true)
    )
    expect(state).toEqualMap({
      foo: {
        anyTouched: true,
        values: {
          myField: [undefined]
        },
        fields: {
          myField: [
            {
              touched: true
            }
          ]
        }
      }
    })
  })

  it('should remove nested value container if on change clears all values', () => {
    const state = reducer(
      fromJS({
        foo: {
          values: {
            nested: {
              myField: 'initialValue'
            }
          }
        }
      }),
      change('foo', 'nested.myField', '', true)
    )
    expect(state).toEqualMap({
      foo: {
        anyTouched: true,
        fields: {
          nested: {
            myField: {
              touched: true
            }
          }
        }
      }
    })
  })

  it('should modify a value if called with undefined', () => {
    const state = reducer(
      fromJS({
        foo: {
          values: {
            myField: 'initialValue'
          }
        }
      }),
      change('foo', 'myField', undefined, true)
    )
    expect(state).toEqualMap({
      foo: {
        anyTouched: true,
        fields: {
          myField: {
            touched: true
          }
        }
      }
    })
  })

  it('should set value on change and remove field-level submit and async errors', () => {
    const state = reducer(
      fromJS({
        foo: {
          values: {
            myField: 'initial'
          },
          asyncErrors: {
            myField: 'async error'
          },
          submitErrors: {
            myField: 'submit error'
          },
          error: 'some global error'
        }
      }),
      change('foo', 'myField', 'different', false)
    )
    expect(state).toEqualMap({
      foo: {
        values: {
          myField: 'different'
        },
        error: 'some global error'
      }
    })
  })

  it("shouldn't fail on submitError for array", () => {
    const plainJs = {
      foo: {
        values: {
          myField: 'initial'
        },
        asyncErrors: {
          myField: 'async error'
        },
        submitErrors: {
          fieldArray: []
        },
        error: 'some global error'
      }
    }
    plainJs.foo.submitErrors.fieldArray._error = 'submit error'
    const state = reducer(
      fromJS(plainJs),
      change('foo', 'fieldArray[0].Text', 'different', false)
    )
    expect(state).toEqualMap({
      foo: {
        asyncErrors: {
          myField: 'async error'
        },
        error: 'some global error',
        submitErrors: {
          fieldArray: []
        },
        values: {
          fieldArray: [
            {
              Text: 'different'
            }
          ],
          myField: 'initial'
        }
      }
    })
  })

  it('should NOT remove field-level submit errors and global errors if persistentSubmitErrors is enabled', () => {
    const state = reducer(
      fromJS({
        foo: {
          values: {
            myField: 'initial'
          },
          asyncErrors: {
            myField: 'async error' // only this will be removed
          },
          submitErrors: {
            myField: 'submit error'
          },
          error: 'some global error'
        }
      }),
      change('foo', 'myField', 'different', false, true)
    )
    expect(state).toEqualMap({
      foo: {
        values: {
          myField: 'different'
        },
        submitErrors: {
          myField: 'submit error'
        },
        error: 'some global error'
      }
    })
  })

  it('should keep values reference identity on change with an unchanged value', () => {
    const initialState = fromJS({
      foo: {
        values: {
          myField: 'myValue'
        },
        initial: {
          myField: 'initialValue'
        }
      }
    })
    const state = reducer(initialState, change('foo', 'myField', 'myValue'))
    expect(getIn(state, 'foo.values')).toBe(getIn(initialState, 'foo.values'))
  })

  it('should keep values reference identity on change with a deep-equal (but not reference-equal) value', () => {
    const initialState = fromJS({
      foo: {
        values: {
          myObjectField: { mySubField: ['a', 'b'] }
        },
        initial: {
          myObjectField: { mySubField: ['x'] }
        }
      }
    })
    const state = reducer(
      initialState,
      change('foo', 'myObjectField', fromJS({ mySubField: ['a', 'b'] }))
    )
    expect(getIn(state, 'foo.values')).toBe(getIn(initialState, 'foo.values'))
  })

  it('should keep values reference identity on change when a function payload returns the current value', () => {
    const initialState = fromJS({
      foo: {
        values: {
          myField: 'myValue'
        },
        initial: {
          myField: 'initialValue'
        }
      }
    })
    const state = reducer(
      initialState,
      change('foo', 'myField', () => 'myValue')
    )
    expect(getIn(state, 'foo.values')).toBe(getIn(initialState, 'foo.values'))
  })

  it('should set nested value on change with empty state', () => {
    const state = reducer(
      undefined,
      change('foo', 'myField.mySubField', 'myValue', false)
    )
    expect(state).toEqualMap({
      foo: {
        values: {
          myField: {
            mySubField: 'myValue'
          }
        }
      }
    })
  })

  it('should write null over a missing value on change', () => {
    const state = reducer(
      fromJS({ foo: { values: {}, initial: {} } }),
      change('foo', 'myField', null)
    )
    expect(getIn(state, 'foo.values.myField')).toBe(null)
  })

  it('should write null over an empty string on change', () => {
    const state = reducer(
      fromJS({
        foo: { values: { myField: '' }, initial: { myField: 'initialValue' } }
      }),
      change('foo', 'myField', null)
    )
    expect(getIn(state, 'foo.values.myField')).toBe(null)
  })

  it('should write null over a missing value when a function payload returns null', () => {
    const state = reducer(
      fromJS({ foo: { values: {}, initial: {} } }),
      change('foo', 'myField', () => null)
    )
    expect(getIn(state, 'foo.values.myField')).toBe(null)
  })

  it('should write a nested null that replaces undefined on change', () => {
    const initialState = fromJS({
      foo: { values: { myObject: { a: undefined, b: 1 } }, initial: {} }
    })
    const state = reducer(
      initialState,
      change('foo', 'myObject', fromJS({ a: null, b: 1 }))
    )
    expect(getIn(state, 'foo.values')).not.toBe(
      getIn(initialState, 'foo.values')
    )
    expect(getIn(state, 'foo.values.myObject.a')).toBe(null)
  })
}

export default describeChange
