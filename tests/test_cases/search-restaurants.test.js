const { init } = require('../steps/init')
const given = require('../steps/given')
const when = require('../steps/when')
const teardown = require('../steps/teardown')

const mode = process.env.TEST_MODE

describe('Given an authenticated user', () => {
  beforeAll(async () => {
    await init()
    user = await given.an_authenticated_user()
  })

  afterAll(async () => {
    await teardown.an_authenticated_user(user)
  })

  describe(`When we invoke the POST /restaurants/search endpoint with theme 'cartoon'`, () => {  
    it(`Should return an array of 4 restaurants`, async () => {
      let res = await when.we_invoke_search_restaurants('cartoon', user)
  
      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveLength(4)
  
      for (let restaurant of res.body) {
        expect(restaurant).toHaveProperty('name')
        expect(restaurant).toHaveProperty('image')
      }
    })
  })

  describe(`When we invoke the POST /restaurants/search endpoint with theme not found in DB`, () => {  
    it(`Should return an array of 0 restaurants`, async () => {
      let res = await when.we_invoke_search_restaurants('no-match-theme', user)
  
      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveLength(0)
  
    })
  })
});

if (mode === 'http') {
  describe('Given an unauthenticated user', () => {
    beforeAll(async () => {
      await init()
    })
  
    describe(`When we invoke the POST /restaurants/search endpoint with theme 'cartoon'`, () => {  
      it(`Should return a 401 error`, async () => {
  
        let res = await when.we_invoke_search_restaurants('cartoon', null)
    
        expect(res.statusCode).toEqual(401)
      })
    })
  
  });
}

