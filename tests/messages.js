const SQS = require('aws-sdk/clients/sqs')
const { ReplaySubject } = require("rxjs")
const {take, filter} = require("rxjs/operators")

const messages = new ReplaySubject(100)
const messageIds = new Set()
let pollingLoop
let stopIt = false

const startListening = () => {
  stopIt = false

  if (pollingLoop) {
    return
  }

  const sqs = new SQS()
  const queueUrl = process.env.E2eTestQueueUrl
  const loop = async () => {
    if (stopIt) {
      return
    }

    const resp = await sqs.receiveMessage({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20
    }).promise()

    if (!resp.Messages) {
      return await loop()
    }

    resp.Messages.forEach(msg => {
      if (messageIds.has(msg.MessageId)) {
        // seen this message already, ignore
        return
      }
    
      messageIds.add(msg.MessageId)
    
      const body = JSON.parse(msg.Body)
      if (body.TopicArn) {
        messages.next({
          sourceType: 'sns',
          source: body.TopicArn,
          message: body.Message
        })
      } else if (body.eventBusName) {
        messages.next({
          sourceType: 'eventbridge',
          source: body.eventBusName,
          message: JSON.stringify(body.event)
        })
      }
    })

    await loop()
  }

  pollingLoop = loop()
}

const stopListening = () => {
  stopIt = true
}

const waitForMessage = (sourceType, source, message) => {
  return messages
    .pipe(
        filter(incomingMessage => incomingMessage.sourceType === sourceType),
        filter(incomingMessage => incomingMessage.source === source),
        filter(incomingMessage => incomingMessage.message === message),
        take(1)
    ).toPromise()
}

module.exports = {
  startListening,
  stopListening,
  waitForMessage
}