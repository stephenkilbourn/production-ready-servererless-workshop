const AWS = require('aws-sdk');
const chance  = require('chance').Chance()
const  restaurants = require('../../restaurants')

const tableName = process.env.restaurants_table
const DocumentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });
// needs number, special char, upper and lower case
const random_password = () => `${chance.string({ length: 8})}B!gM0uth`;



const an_authenticated_user = async () => {
  const cognito = new AWS.CognitoIdentityServiceProvider()

  const userpoolId = process.env.cognito_user_pool_id
  const clientId = process.env.cognito_server_client_id

  const firstName = chance.first({ nationality: "en" })
  const lastName  = chance.last({ nationality: "en" })
  const suffix    = chance.string({length: 8, pool: "abcdefghijklmnopqrstuvwxyz"})
  const username  = `test-${firstName}-${lastName}-${suffix}`
  const password  = random_password()
  const email     = `${firstName}-${lastName}@big-mouth.com`

  const createReq = {
    UserPoolId        : userpoolId,
    Username          : username,
    MessageAction     : 'SUPPRESS',
    TemporaryPassword : password,
    UserAttributes    : [
      { Name: "given_name",  Value: firstName },
      { Name: "family_name", Value: lastName },
      { Name: "email",       Value: email }
    ]
  }
  await cognito.adminCreateUser(createReq).promise()

  console.log(`[${username}] - user is created`)

  const req = {
    AuthFlow        : 'ADMIN_NO_SRP_AUTH',
    UserPoolId      : userpoolId,
    ClientId        : clientId,
    AuthParameters  : {
      USERNAME: username,
      PASSWORD: password
    }
  }
  const resp = await cognito.adminInitiateAuth(req).promise()

  console.log(`[${username}] - initialised auth flow`)

  const challengeReq = {
    UserPoolId          : userpoolId,
    ClientId            : clientId,
    ChallengeName       : resp.ChallengeName,
    Session             : resp.Session,
    ChallengeResponses  : {
      USERNAME: username,
      NEW_PASSWORD: random_password()
    }
  }
  const challengeResp = await cognito.adminRespondToAuthChallenge(challengeReq).promise()
  
  console.log(`[${username}] - responded to auth challenge`)

  return {
    username,
    firstName,
    lastName,
    idToken: challengeResp.AuthenticationResult.IdToken
  }
}

const restaurant_added_to_dynamodb = async (restaurant) => {

  await DocumentClient.put({
    TableName: tableName,
    Item: restaurant
  }).promise()
  console.log(`adding ${restaurant.name} to ${tableName} table`)
  return restaurant
}

const restaurants_seeded_in_dynamodb = async() => {

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

module.exports = {
  an_authenticated_user,
  restaurant_added_to_dynamodb,
  restaurants_seeded_in_dynamodb,
}