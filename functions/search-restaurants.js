const middy = require('@middy/core')
const ssm = require('@middy/ssm')
const { metricScope, Unit } = require('aws-embedded-metrics')
const DocumentClient = require('aws-sdk/clients/dynamodb').DocumentClient

const dynamodb = new DocumentClient()

const { serviceName, stage } = process.env
const tableName = process.env.restaurants_table

const findRestaurantsByTheme = async (theme, count) => {
  console.log(`finding (up to ${count}) restaurants with the theme ${theme}...`)
  const req = {
    TableName: tableName,
    Limit: count,
    FilterExpression: "contains(themes, :theme)",
    ExpressionAttributeValues: { ":theme": theme }
  }

  const resp = await dynamodb.scan(req).promise()
  console.log(`found ${resp.Items.length} restaurants`)
  return resp.Items
}

module.exports.handler = middy(
  metricScope(metrics =>
    async (event, context) => {
      metrics.setNamespace('prod-serverless-workshop')
      metrics.putDimensions({ Service: "lambda-emf-demo" })
      const start = Date.now()
      const req = JSON.parse(event.body)
      const theme = req.theme
      const restaurants = await findRestaurantsByTheme(theme, context.config.defaultResults)
      const response = {
        statusCode: 200,
        body: JSON.stringify(restaurants)
      }
      const end = Date.now()

      metrics.putMetric("latency", end - start, Unit.Milliseconds)
      metrics.setProperty("RequestId", context?.awsRequestId)
      metrics.setProperty("ApiGatewayRequestId", event.requestContext?.requestId)

      return response
  })).use(ssm({
    setToContext: true,
    fetchData: {
      config: `/${serviceName}/${stage}/search-restaurants/config`
    }
  }))