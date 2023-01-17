# production-ready-servererless-workshop
work done as part of Yan Cui's [Production Ready Serverless Workshop](https://productionreadyserverless.com/)

Week 1 work:
- Lambda API endpoint to return a list of restaurants,
- Restaurant data seeded and stored in DynamoDB
- Server-side rendering of webpage for users to search restaurants by theme
- Cognito User Pool to register users
- API Gateway secured with IAM to limit calls to /search endpoint

Optional extra work:
- Implement caching at the CloudFront level
- Configure throttling via the serverless-api-gateway-throttling 
- Configure request validation via API Gateway for the POST /search endpoint
- Enable detailed CloudWatch metrics
- Record custom CloudWatch metrics via aws-embedded-metrics to generate with EMF (Embedded Metric Format)
- Set Up custom Cloudwatch dashboard

<img width="1738" alt="Cloudwatch Dashboard with custom metrics" src="https://user-images.githubusercontent.com/7388976/212335705-bb6c55bc-9d86-4241-be6b-56309dbfdca4.png">
