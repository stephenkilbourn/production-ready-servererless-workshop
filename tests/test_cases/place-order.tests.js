const when = require('../steps/when')
const given = require('../steps/given')
const teardown = require('../steps/teardown')
const { init } = require('../steps/init')
const AWS = require('aws-sdk')

const mockPutEvents = jest.fn()
AWS.EventBridge.prototype.putEvents = mockPutEvents

describe('Given an authenticated user', () => {
  let user

  beforeAll(async () => {
    await init()
    user = await given.an_authenticated_user()
  })

  afterAll(async () => {
    await teardown.an_authenticated_user(user)
  })

  describe(`When we invoke the POST /orders endpoint`, () => {
    let resp

    beforeAll(async () => {
      mockPutEvents.mockClear()
      mockPutEvents.mockReturnValue({
        promise: async () => {}
      })

      resp = await when.we_invoke_place_order(user, 'Fangtasia')
    })

    it(`Should return 200`, async () => {
      expect(resp.statusCode).toEqual(200)
    })

    if (process.env.TEST_MODE === 'handler') {
      it(`Should publish a message to EventBridge bus`, async () => {
        expect(mockPutEvents).toBeCalledWith({
          Entries: [
            expect.objectContaining({
              Source: 'big-mouth',
              DetailType: 'order_placed',
              Detail: expect.stringContaining(`"restaurantName":"Fangtasia"`),
              EventBusName: expect.stringMatching(process.env.bus_name)
            })
          ]
        })
      })
    }
  })
})