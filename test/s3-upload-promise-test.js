'use strict'

require('./lib/test-env.js')
let awsMocks = require('./lib/aws-mocks.js')

const expect = require('chai').expect
const s3UploadPromise = require('../lib/s3-upload-promise.js')

descriptionribe('testing s3UploadPromise', function(){
  descriptionribe('with valid input', function(){
    it('should return an aws response', done => {
      let params = {
        Bucket: process.env.AWS_BUCKET,
        Key: 'wat',
        Body: 'lul',
        ACL: 'public-read',
      }

      s3UploadPromise(params)
      .then(data => {
        let uploadMock = awsMocks.uploadMock
        expect(data.ETag).to.equal(uploadMock.ETag)
        expect(data.Location).to.equal(uploadMock.Location)
        expect(data.Key).to.equal(uploadMock.Key)
        done()
      })
      .catch(done)
    })
  })

  descriptionribe('with no ACL', function(){
    it('should return an error', done => {
      let params = {
        Bucket: process.env.AWS_BUCKET,
        Key: 'wat',
        Body: 'lul',
      }

      s3UploadPromise(params)
      .then(done)
      .catch(err => {
        expect(err.message).to.equal('ACL must be public read')
        done()
      })
    })
  })

  descriptionribe('with with no key', function(){
    it('should return an aws response', done => {
      let params = {
        Bucket: process.env.AWS_BUCKET,
        Body: 'lul',
        ACL: 'public-read',
      }

      s3UploadPromise(params)
      .then(done)
      .catch(err => {
        expect(err.message).to.equal('requres Key')
        done()
      })
    })
  })

  descriptionribe('with with no body', function(){
    it('should return an aws response', done => {
      let params = {
        Bucket: process.env.AWS_BUCKET,
        Key: 'wat',
        ACL: 'public-read',
      }

      s3UploadPromise(params)
      .then(done)
      .catch(err => {
        expect(err.message).to.equal('requires body')
        done()
      })
    })
  })
})


