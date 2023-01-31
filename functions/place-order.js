const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')
const XRay = require('aws-xray-sdk-core')
const EventBridge = require('aws-sdk/clients/eventbridge')

const testEventBridge = XRay.captureAWSClient(new EventBridge())
const eventBridge = XRay.captureAWSClient(require('@dazn/lambda-powertools-eventbridge-client'))
const activeEventBridge = process.env.stage === "dev" || process.env.stage === "ci-dev" ? testEventBridge : eventBridge

const chance = require('chance').Chance()
const Log = require('@dazn/lambda-powertools-logger')
const wrap = require('@dazn/lambda-powertools-pattern-basic')

const busName = process.env.bus_name

module.exports.handler = wrap(async (event, context) => {
  const restaurantName = JSON.parse(event.body).restaurantName

  const orderId = chance.guid()
  const userId = event.requestContext.authorizer.claims.sub
  CorrelationIds.set('userId', userId)
  CorrelationIds.set('orderId', orderId)
  CorrelationIds.set('restaurantName', restaurantName)
  Log.debug('placing order...')
  
  await activeEventBridge.putEvents({
    Entries: [{
      Source: 'big-mouth',
      DetailType: 'order_placed',
      Detail: JSON.stringify({
        orderId,
        restaurantName,
      }),
      EventBusName: busName
    }]
  }).promise()

  Log.debug(`published event into EventBridge`, {
    eventType: 'order_placed',
    busName
  })

  const response = {
    statusCode: 200,
    body: JSON.stringify({ orderId })
  }

  return response
})
