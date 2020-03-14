describe 'opted', ->
  Given -> @options =
    a: true
    b: 'b'
    on: true
    off: false
    long: 'baz'
    'name=': 'Andrew'
    list: ['rope', 'jelly']
    X: true
  Given -> @opted = require '../lib/opted'

  context 'singleDash false', ->
    When -> @args = @opted(@options)
    Then -> @args.should.eql [
      '-a',
      '-b',
      'b',
      '--on',
      '--no-off',
      '--long',
      'baz',
      '--name=Andrew',
      '--list',
      'rope',
      '--list',
      'jelly',
      '-X'
    ]

  context 'singleDash true', ->
    When -> @args = @opted(@options, true)
    Then -> @args.should.eql [
      '-a',
      '-b',
      'b',
      '-on',
      '-no-off',
      '-long',
      'baz',
      '-name=Andrew',
      '-list',
      'rope',
      '-list',
      'jelly',
      '-X'
    ]
