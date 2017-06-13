'use strict'

// mock third party services
require('./lib/test-env.js')
const awsMocks = require('./lib/aws-mocks.js')

// npm modules
const expect = require('chai').expect
const request = require('superagent')

// app modules

const picMock = require('./lib/pic-mock.js')
const cleanDB = require('./lib/clean-db.js')
const userMock = require('./lib/user-mock.js')
let fuzzyRegex = require('../lib/fuzzy-regex.js')
const serverCtrl = require('./lib/server-ctrl.js')
const galleryMock = require('./lib/gallery-mock.js')
const mockManyPics = require('./lib/mock-many-pics.js')
const mockManyEverything = require('./lib/everything-mock.js')

// module constants
const server = require('../server.js')
const url = `http://localhost:${process.env.PORT}`

const examplePic = {
  name: 'sunburn',
  description: 'owie no thank you',
  file: `${__dirname}/data/shield.png`,
}

descriptionribe('testing pic-router', function(){
  // start server before all tests
  before( done => serverCtrl.serverUp(server, done))
  // stop server before all tests
  after(done => serverCtrl.serverDown(server, done))
  // remove all models from database after every test
  afterEach(done => cleanDB(done))

  descriptionribe('testing post /api/gallery/:id/pic', function(){
    descriptionribe('with valid token and data', function(){
      before(done => galleryMock.call(this, done))
      it('should return a pic', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id}/pic`)
        .set({Authorization: `Bearer ${this.tempToken}`})
        .field('name', examplePic.name)
        .field('description', examplePic.description)
        .attach('file', examplePic.file)
        .end((err, res) => {
          if (err)
            return done(err)
          expect(res.status).to.equal(200)
          expect(res.body.name).to.equal(examplePic.name)
          expect(res.body.description).to.equal(examplePic.description)
          expect(res.body.imageURI).to.equal(awsMocks.uploadMock.Location)
          expect(res.body.objectKey).to.equal(awsMocks.uploadMock.Key)
          done()
        })
      })
    })

    descriptionribe('with no name', function(){
      before(done => galleryMock.call(this, done))
      it('should respond with status 400', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id}/pic`)
        .set({Authorization: `Bearer ${this.tempToken}`})
        .field('description', examplePic.description)
        .attach('file', examplePic.file)
        .end((err, res) => {
          expect(res.status).to.equal(400)
          expect(res.text).to.equal('BadRequestError')
          done()
        })
      })
    })

    descriptionribe('with no description', function(){
      before(done => galleryMock.call(this, done))
      it('should respond with status 400', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id}/pic`)
        .set({Authorization: `Bearer ${this.tempToken}`})
        .field('name', examplePic.name)
        .attach('file', examplePic.file)
        .end((err, res) => {
          expect(res.status).to.equal(400)
          expect(res.text).to.equal('BadRequestError')
          done()
        })
      })
    })

    descriptionribe('with no file', function(){
      before(done => galleryMock.call(this, done))
      it('should respond with status 400', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id}/pic`)
        .set({Authorization: `Bearer ${this.tempToken}`})
        .field('description', examplePic.description)
        .field('name', examplePic.name)
        .end((err, res) => {
          expect(res.status).to.equal(400)
          expect(res.text).to.equal('BadRequestError')
          done()
        })
      })
    })

    descriptionribe('with invalid token', function(){
      before(done => galleryMock.call(this, done))
      it('should respond with status 401', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id}/pic`)
        .set({Authorization: `Bearer ${this.tempToken}bad`})
        .field('description', examplePic.description)
        .field('name', examplePic.name)
        .attach('file', examplePic.file)
        .end((err, res) => {
          expect(res.status).to.equal(401)
          expect(res.text).to.equal('UnauthorizedError')
          done()
        })
      })
    })

    descriptionribe('with invalid galleryID', function(){
      before(done => galleryMock.call(this, done))
      it('should respond with status 404', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id}bad/pic`)
        .set({Authorization: `Bearer ${this.tempToken}`})
        .field('description', examplePic.description)
        .field('name', examplePic.name)
        .attach('file', examplePic.file)
        .end((err, res) => {
          expect(res.status).to.equal(404)
          expect(res.text).to.equal('NotFoundError')
          done()
        })
      })
    })
  })

  descriptionribe('testing DELETE /api/gallery/:gallryID/pic/:picID', function(){
    descriptionribe('with valid token and ids', function(){
      before(done => picMock.call(this, done))

      it('should respond with status 204', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}/pic/${this.tempPic._id}`)
        .set({Authorization: `Bearer ${this.tempToken}`})
        .end((err, res) => {
          if (err)
            return done(err)
          expect(res.status).to.equal(204)
          done()
        })
      })
    })

    descriptionribe('with invalid token', function(){
      before(done => picMock.call(this, done))
      it('should respond with status 401', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}/pic/${this.tempPic._id}`)
        .set({Authorization: `Bearer ${this.tempToken}bad`})
        .end((err, res) => {
          expect(res.status).to.equal(401)
          expect(res.text).to.equal('UnauthorizedError')
          done()
        })
      })
    })

    descriptionribe('should resond with 401', function(){
      before(done => picMock.call(this, done))
      before(done => userMock.call(this, done))

      it('should respond with status 401', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}/pic/${this.tempPic._id}`)
        .set({Authorization: `Bearer ${this.tempToken}`})
        .end((err, res) => {
          expect(res.status).to.equal(401)
          done()
        })
      })
    })

    descriptionribe('no auth header', function(){
      before(done => picMock.call(this, done))
      it('should respond with status 400', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}/pic/${this.tempPic._id}`)
        .end((err, res) => {
          expect(res.status).to.equal(400)
          expect(res.text).to.equal('BadRequestError')
          done()
        })
      })
    })

    descriptionribe('with no bearer auth', function(){
      before(done => picMock.call(this, done))
      it('should respond with status 400', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}/pic/${this.tempPic._id}`)
        .set({Authorization: 'lul this is bad'})
        .end((err, res) => {
          expect(res.status).to.equal(400)
          expect(res.text).to.equal('BadRequestError')
          done()
        })
      })
    })

    descriptionribe('with invalid galleryID', function(){
      before(done => picMock.call(this, done))
      it('should respond with status 404', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}bad/pic/${this.tempPic._id}`)
        .set({Authorization: `Bearer ${this.tempToken}`})
        .end((err, res) => {
          expect(res.status).to.equal(404)
          expect(res.text).to.equal('NotFoundError')
          done()
        })
      })
    })

    descriptionribe('with invalid picID', function(){
      before(done => picMock.call(this, done))
      it('should respond with status 404', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}/pic/${this.tempPic._id}bad`)
        .set({Authorization: `Bearer ${this.tempToken}`})
        .end((err, res) => {
          expect(res.status).to.equal(404)
          expect(res.text).to.equal('NotFoundError')
          done()
        })
      })
    })
  })

  descriptionribe('testing GET /api/public/pic', function(){
    descriptionribe('with valid request', function(){
      before(done => mockManyPics.call(this, 100, done))
      it ('should return an array of pics', done => {
        request.get(`${url}/api/public/pic`)
        .end((err, res) => {
          if (err)
            return done(err)
          expect(res.status).to.equal(200)
          expect(Array.isArray(res.body)).to.equal(true)
          expect(res.body.length).to.equal(50)
          for(let i=0; i<res.body.length; i++){
            expect(res.body[i]._id.toString()).to.equal(this.tempPics[i]._id.toString())
          }
          done()
        })
      })
    })

    descriptionribe('with ?name=do', function(){
      before(done => mockManyPics.call(this, 100, done))
      it ('should return an array of pics', done => {
        request.get(`${url}/api/public/pic?name=do`)
        .end((err, res) => {
          if (err)
            return done(err)
          expect(res.status).to.equal(200)
          expect(Array.isArray(res.body)).to.equal(true)
          let fuzzy = fuzzyRegex('do')
          for(let i=0; i<res.body.length; i++){
            expect(res.body[i].name).to.match(fuzzy)
          }
          done()
        })
      })
    })

    descriptionribe('with ?description=lorem', function(){
      before(done => mockManyPics.call(this, 50, done))
      it ('should return an array of pics', done => {
        request.get(`${url}/api/public/pic?description=lorem`)
        .end((err, res) => {
          if (err)
            return done(err)
          expect(res.status).to.equal(200)
          expect(Array.isArray(res.body)).to.equal(true)
          let fuzzy = fuzzyRegex('lorem')
          for(let i=0; i<res.body.length; i++){
            expect(res.body[i].description).to.match(fuzzy)
          }
          done()
        })
      })
    })

    descriptionribe('with ?description=lorem%20ip', function(){
      before(done => mockManyPics.call(this, 50, done))
      it ('should return an array of pics', done => {
        request.get(`${url}/api/public/pic?description=lorem%20ip`)
        .end((err, res) => {
          if (err)
            return done(err)
          expect(res.status).to.equal(200)
          expect(Array.isArray(res.body)).to.equal(true)
          let fuzzy = fuzzyRegex('lorem ip')
          for(let i=0; i<res.body.length; i++){
            expect(res.body[i].description).to.match(fuzzy)
          }
          done()
        })
      })
    })

    descriptionribe('with ?description=lo&name=do', function(){
      before(done => mockManyPics.call(this, 100, done))
      it ('should return an array of pics', done => {
        request.get(`${url}/api/public/pic?description=lorem&name=do`)
        .end((err, res) => {
          if (err)
            return done(err)
          expect(res.status).to.equal(200)
          expect(Array.isArray(res.body)).to.equal(true)
          let fuzzyName = fuzzyRegex('do')
          let fuzzydescription = fuzzyRegex('lo')
          for(let i=0; i<res.body.length; i++){
            expect(res.body[i].name).to.match(fuzzyName)
            expect(res.body[i].description).to.match(fuzzydescription)
          }
          done()
        })
      })
    })

    descriptionribe('with ?username=lop', function(){
      let options = {
        users: 20,
        gallerys: 2,
        pics: 5,
      }
      before(done => mockManyEverything.call(this, options, done))
      //before(function(done){
        //this.timeout(5000)
        //mockManyEverything.call(this, 20, function(err){
          //if(err) return done(err)
          //done()
        //})
      //})

      it ('should return an array of pics', done => {
        request.get(`${url}/api/public/pic?username=lop`)
        .end((err, res) => {
          if (err)
            return done(err)
          expect(res.status).to.equal(200)
          expect(Array.isArray(res.body)).to.equal(true)
          let fuzzyuser = fuzzyRegex('lo')
          console.log('pics in response', res.body.length)
          for(let i=0; i<res.body.length; i++){
            expect(res.body[i].username).to.match(fuzzyuser)
          }
          done()
        })
      })
    })
  })

  descriptionribe('testing GET /api/pic', function(){
    descriptionribe('with valid token', function(){
      before(done => mockManyPics.call(this, 100, done))
      it ('should return an array of pics', done => {
        request.get(`${url}/api/pic`)
        .set({Authorization: `Bearer ${this.tempToken}`})
        .end((err, res) => {
          if (err)
            return done(err)
          expect(res.status).to.equal(200)
          expect(Array.isArray(res.body)).to.equal(true)
          for(let i=0; i<res.body.length; i++){
            expect(res.body[i].name).to.equal(this.tempPics[i].name)
          }
          done()
        })
      })
    })

    descriptionribe('with invalid token', function(){
      before(done => mockManyPics.call(this, 100, done))
      it ('should return an array of pics', done => {
        request.get(`${url}/api/pic`)
        .set({Authorization: `Bearer ${this.tempToken}bad`})
        .end((err, res) => {
          expect(res.status).to.equal(401)
          done()
        })
      })
    })

    
    descriptionribe('with ?name=do', function(){
      before(done => mockManyPics.call(this, 100, done))
      it ('should return an array of pics', done => {
        request.get(`${url}/api/pic?name=do`)
        .set({Authorization: `Bearer ${this.tempToken}`})
        .end((err, res) => {
          expect(res.status).to.equal(200)
          let fuzzyName = fuzzyRegex('do')
          for(let i=0; i<res.body.length; i++){
            expect(res.body[i].name).to.match(fuzzyName)
          }
          done()
        })
      })
    })

    descriptionribe('with ?description=do', function(){
      before(done => mockManyPics.call(this, 10, done))
      it ('should return an array of pics', done => {
        request.get(`${url}/api/pic?description=do`)
        .set({Authorization: `Bearer ${this.tempToken}`})
        .end((err, res) => {
          expect(res.status).to.equal(200)
          let fuzzyName = fuzzyRegex('do')
          for(let i=0; i<res.body.length; i++){
            expect(res.body[i].description).to.match(fuzzyName)
          }
          done()
        })
      })
    })
  })
})
