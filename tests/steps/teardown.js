const AWS = require('aws-sdk')

const tableName = process.env.restaurants_table
const DocumentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

const an_authenticated_user = async (user) => {
  const cognito = new AWS.CognitoIdentityServiceProvider()
  
  let req = {
    UserPoolId: process.env.cognito_user_pool_id,
    Username: user.username
  }
  await cognito.adminDeleteUser(req).promise()
  
  console.log(`[${user.username}] - user deleted`)
}

const restaurant_removed_from_dynamodb = async (restaurant) => {

  await DocumentClient.delete({
    TableName: tableName,
    Key: {name: restaurant.name}
  }).promise()
  console.log(`removing ${restaurant.name} to ${tableName} table`)
  return restaurant
}

module.exports = {
  an_authenticated_user,
  restaurant_removed_from_dynamodb
}