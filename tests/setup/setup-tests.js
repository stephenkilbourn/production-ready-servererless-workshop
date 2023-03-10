const dotenv = require('dotenv')
dotenv.config({ path: '.env' })
dotenv.config({ path: './.test.env' })

const AWS = require('aws-sdk');

const  restaurants = require('../../restaurants')
const tableName = process.env.restaurants_table
const DocumentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });


module.exports = async() => {

  console.log(`seeding table ${tableName}`)

  const seedItems = restaurants.map(x => ({
    PutRequest: {
      Item: x
    }
  }))

  DocumentClient.batchWrite({
    RequestItems: {
      [tableName]: seedItems
    }
  }).promise()
  .then(() => console.log("all done"))
  .catch(err => console.error(err))
}