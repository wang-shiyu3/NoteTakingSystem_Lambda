const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const ses = new AWS.SES({ apiVersion: "2010-12-01" });
const dynamoDB = new AWS.DynamoDB();
const uuidv1 = require('uuid/v1');
const DOMAIN_NAME = process.env.DOMAIN_NAME;

exports.handler = async (event, context) => {
  let email = event.Records[0].Sns.Message;
  const param = {
    TableName: "csye6225",
    Key: {
      id: { S: email }
    }
  };

  const item = await dynamoDB.getItem(param).promise();
  let uuid = uuidv1();
  if (!item.Item) {
    dynamoDB.putItem({
      TableName: "csye6225",
      Item: {
        id: { S: email },
        token: { S: uuid },
        // ttl: { N: (Math.floor(Date.now() / 1000) + 60).toString() }
      }
    });
  }
  console.log(email);
  console.log(item);

  const token = (item.Item && item.Item.token.S) || uuid;

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
  try {
    const sendPromise = await ses.sendEmail(emailObj).promise();
    console.log(sendPromise);
  } catch (err) {
    console.log(err, err.stack);
  }
};
