const { init } = require('../steps/init')
const when = require('../steps/when')
const chance = require('chance').Chance()
const messages = require('../messages')

describe(`When we invoke the notify-restaurant function`, () => {
  const event = {
    source: 'big-mouth',
    'detail-type': 'order_placed',
    detail: {
      orderId: chance.guid(),
      restaurantName: 'Fangtasia'
    }
  }

  beforeAll(async () => {
    await init()
    messages.startListening()
    await when.we_invoke_notify_restaurant(event)
  })

  afterAll(async () => {
    messages.stopListening()
  })

  it(`Should publish message to SNS`, async () => {
    await messages.waitForMessage(
      'sns',
      process.env.restaurant_notification_topic,
      JSON.stringify(event.detail)
    )
  }, 10000)

  it(`Should publish "restaurant_notified" event to EventBridge`, async () => {
    await messages.waitForMessage(
      'eventbridge',
      process.env.bus_name,
      JSON.stringify({
        ...event,
        'detail-type': 'restaurant_notified'
      })
    )
  }, 10000)
})