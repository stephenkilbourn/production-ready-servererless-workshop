const { init } = require('../steps/init')
const given = require('../steps/given')

const when = require('../steps/when')
const chance = require('chance').Chance()


describe('Given at least one restaurant is in the database', () => {
  const restaurant = {
    id: chance.guid(),
    name: chance.string({ length: 16 })
  }  
  beforeAll(async () => {
    await init()
  })

  it(`Should return an array of 8 restaurants`, async () => {
    const res = await when.we_invoke_get_restaurants()

    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveLength(8)

    for (let restaurant of res.body) {
      expect(restaurant).toHaveProperty('name')
      expect(restaurant).toHaveProperty('image')
    }
  })
})