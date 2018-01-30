'use strict';

const AWS = require('aws-sdk');
const SQS = new AWS.SQS({ apiVersion: '2012-11-05' });
const Lambda = new AWS.Lambda({ apiVersion: '2015-03-31' });
const sns = new AWS.SNS({apiVersion: '2010-03-31'});


// these come from environment vars 
const queueUrl = process.env.QUEUE_URL;
const funcName = process.env.FUNC_NAME;
const topicArn = process.env.TOPIC_ARN;

function handleMessage (msg) {
  console.log(`Handling message: ${msg.Body} - message ID [${msg.MessageId}]`);

  sns.publish({
    Message: msg.Body,
    TopicArn: topicArn
    }, function(err, data) {
        if (err) {
            console.log(`Message ID [${msg.MessageId}]`, err, err.stack)
            return;
        }
        console.log(`Message ID [${msg.MessageId}] published`);
    });

  let delParams = {
    QueueUrl: queueUrl,
    ReceiptHandle: msg.ReceiptHandle
  };
  
  return SQS
    .deleteMessage(delParams)
    .promise()
    .then(() => console.log(`Message ID [${msg.MessageId}] deleted`))
    .catch(err => console.log(`Message ID [${msg.MessageId}]`, err, err.stack));
}

function recurse () {
  let params = { 
    FunctionName: funcName,
    InvokeArgs: "{}"
  };
    
  return Lambda
    .invokeAsync(params)
    .promise()
    .then((data) => console.log("Lambda Function recursed"));
}

module.exports.handler = function(event, context) {
  let params = {
    QueueUrl            : queueUrl,
    MaxNumberOfMessages : 10,
    VisibilityTimeout   : 6,
    WaitTimeSeconds     : 20
  };
  
  SQS
    .receiveMessage(params)
    .promise()
    .then(res => {
      if (res.Messages) {
        return Promise.all(res.Messages.map(handleMessage));
      }
    })
    // handle any errors and restore the chain so we always get
    // to the next step - which is to recurse
    .catch(err => console.log(err, err.stack))
    .then(() => recurse())
    .then(() => context.succeed())
    // only fail the function if we couldn't recurse, which we
    // can then monitor via CloudWatch and trigger 
    .catch(err => context.fail(err, err.stack));
};