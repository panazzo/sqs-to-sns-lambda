# SQS-TO-SNS-LAMBDA

![sqs-to-sns-lambda](https://raw.githubusercontent.com/panazzo/sqs-to-sns-lambda/master/img/lambda-sqs-to-sns.png)

Simple Node.js app designed to run on [Amazon Lambda](http://aws.amazon.com/lambda/) that polls [Amazon SQS](https://aws.amazon.com/sqs/) and publish its messages to [Amazon SNS](https://aws.amazon.com/sns/).

## Configure

There are 3 environment variables that need to be configured in the lambda environment prior to the first execution

```
QUEUE_URL # SQS Queue URL to poll messages
FUNC_NAME # Lambda function name to recurse
TOPIC_ARN # SNS topic to publish messages
```

In order to enable lambda to access the spicified resources, don't forget to create a IAM role and attach to it. Attach the `Lambda`, `SQS` and `SNS` policies

It is recomended to create a `Cloud Watch Events` scheduled trigger, that fires every minute: `rate(1 minute)`   