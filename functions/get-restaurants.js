const ssm = require('@middy/ssm')
const DocumentClient = require('aws-sdk/clients/dynamodb').DocumentClient
const dynamodb = new DocumentClient()
const XRay = require('aws-xray-sdk-core')
XRay.captureAWSClient(dynamodb.service)
const Log = require('@dazn/lambda-powertools-logger')
const wrap = require('@dazn/lambda-powertools-pattern-basic')

const { serviceName, stage } = process.env
const tableName = process.env.restaurants_table

const getRestaurants = async (count) => {
  Log.debug('getting restaurants from DynamoDB...', {
    count,
    tableName
  })
  const req = {
    TableName: tableName,
    Limit: count
  }

  const resp = await dynamodb.scan(req).promise()
  Log.debug('found restaurants', {
    count: resp.Items.length
  })
  return resp.Items
}

module.exports.handler = wrap(async (event, context) => {
  const restaurants = await getRestaurants(context.config.defaultResults)
  const response = {
    statusCode: 200,
    body: JSON.stringify(restaurants)
  }
  return response
}).use(ssm({
  setToContext: true,
  fetchData: {
    config: `/${serviceName}/${stage}/get-restaurants/config`
  }
}))