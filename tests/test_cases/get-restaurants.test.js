const { init } = require('../steps/init')

const given = require('../steps/given')
const when = require('../steps/when')
const teardown = require('../steps/teardown')
const chance = require('chance').Chance()


describe('Given 8 restaurants seeded in the database', () => {
  const restaurant = {
      name: chance.company(),
      image: chance.avatar(),
      themes: [chance.pickone(["cartoon", "rick and morty", "movie", "netflix"])]
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
  
  describe('Given another restaurant is added to the DB', () => {
    beforeAll(async () => {
      await given.restaurant_added_to_dynamodb(restaurant)
    })

    afterAll(async () => {
      await teardown.restaurant_removed_from_dynamodb(restaurant)
    })

    it('Should return an array of 8 restaurants', async () => {
      const res = await when.we_invoke_get_restaurants()
  
      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveLength(8)
  
      for (let restaurant of res.body) {
        expect(restaurant).toHaveProperty('name')
        expect(restaurant).toHaveProperty('image')
      }
    });
  });

})