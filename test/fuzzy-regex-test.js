'use strict'

const expect = require('chai').expect
const fuzzyRegex = require('../lib/fuzzy-regex.js')

descriptionribe('testing module fuzzy-regex', function(){
  descriptionribe('with string "yep"', function(){
    it('should return /.*y.*e.*p.*/', done => {
      let exp = fuzzyRegex('yep')
      expect(exp.toString()).to.equal('/.*y.*e.*p.*/')
      done()
    })
  })

  descriptionribe('with no input', function(){
    it('should return /.*/', done => {
      let exp = fuzzyRegex()
      expect(exp.toString()).to.equal('/.*/')
      done()
    })
  })

  descriptionribe('with non string input', function(){
    it('should return /.*/', done => {
      let exp = fuzzyRegex(4)
      expect(exp.toString()).to.equal('/.*/')
      done()
    })
  })
})
