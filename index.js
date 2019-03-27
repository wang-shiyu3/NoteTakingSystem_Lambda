const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const ses = new AWS.SES();
const dynamoDB = new AWS.DynamoDB();

const DOMAIN_NAME = process.env.DOMAIN_NAME;

exports.handler = async (event, context) => {
  const email = event.Records[0].Sns.Message;

  const param = {
    TableName: "csye6225",
    Key: {
      id: { S: email }
    }
  };

  const item = await dynamoDB.getItem(param).promise();
  if (!item.Item) {
    dynamoDB.putItem({
      TableName: "csye6225",
      Item: {
        id: { S: email },
        token: { S: context.awsRequestId },
        ttl: { N: (Math.floor(Date.now() / 1000) + 60).toString() }
      }
    });
  }
  console.log(email);
  console.log(item);

  const token = (item.Item && item.Item.token.S) || context.awsRequestId;

  const body = `http://${DOMAIN_NAME}/reset?email=${email}&token=${token}`;
  console.log(body);
  const emailObj = {
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: body
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Reset password"
      }
    },
    Source: `reset-password@${DOMAIN_NAME}`
  };
  console.log(emailObj);
  const sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
    .sendEmail(emailObj)
    .promise();
  sendPromise
    .then(function(data) {
      console.log(data.MessageId);
    })
    .catch(function(err) {
      console.log(err, err.stack);
    });
};
