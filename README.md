# production-ready-servererless-workshop

work done as part of Yan Cui's [Production Ready Serverless Workshop](https://productionreadyserverless.com/)

## Week 1 work

- Lambda API endpoint to return a list of restaurants,
- Restaurant data seeded and stored in DynamoDB
- Server-side rendering of webpage for users to search restaurants by theme
- Cognito User Pool to register users
- API Gateway secured with IAM to limit calls to /search endpoint

### Week 1 Optional extra work

- Implement caching at the CloudFront level
- Configure throttling via the serverless-api-gateway-throttling 
- Configure request validation via API Gateway for the POST /search endpoint
- Enable detailed CloudWatch metrics
- Record custom CloudWatch metrics via aws-embedded-metrics to generate with EMF (Embedded Metric Format)
- Set Up custom Cloudwatch dashboard

<img width=50% height=50% alt="Cloudwatch Dashboard with custom metrics" src="https://user-images.githubusercontent.com/7388976/212335705-bb6c55bc-9d86-4241-be6b-56309dbfdca4.png">

## Week 2 work

- Add integration tests that test handlers directly
- Add given.an_authenticated_user method to generate unique user for acceptance tests 
- Add teardown to delete authenticated users from cognito after tests
- Add end-to-end acceptance tests that test functions via http
- Configure GitHub Action to run integration tests, deploy, and then acceptance test deployed environment
- Configure functions to pull dynamic paramters from Parameter Store
- Configure app to pull KMS encrypted Parameters

### Week 2 Optional extra work

- Seed dynamoDB before tests
- run GitHub Action tests in temporary `ci-dev` stack, then deploy to `dev`
- Add test for more than 8 items in DB
- Add test for unauthenticated search
- Add test for search item not found

## Week 3 work

- Add place-order function to publish order_placed to Event Bridge
- add notify-restaurant function to publish a message to the RestaurantNotificationTopic SNS topic to notify the restaurant of a new order
- add integration tests for each endpoint
- update `viaHandler` to check _.get(response, 'body') before parsing because `notify-restaurant` function does not
- Add conditionally deployed SQS queue for acceptance tests deployed when ${sls:stage} equals "dev"
- Subscribe Conditional SQS queue to SNS the RestaurantNotificationTopic
- use serverless-export-outputs plugin to capture E2eTestQueueUrl and CognitoUserPoolServerClientId to `.env-outputs`
- Check SNS messages in the acceptance tests
- Add conditionally deployed EventBridge rule
- Check EventBridge messages in the acceptance tests
