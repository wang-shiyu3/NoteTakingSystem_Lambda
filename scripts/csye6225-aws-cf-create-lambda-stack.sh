#!/usr/bin/env bash


aws cloudformation create-stack --stack-name ${stack} --template-body file://../cloudformation/csye6225-cf-lambda.yaml  --parameters ParameterKey=S3bucketName,ParameterValue=${S3bucketName} ParameterKey=DomainName,ParameterValue=${DomainName} --capabilities CAPABILITY_NAMED_IAM

i=1
sp="/-\|"
while true
do
  printf "\b${sp:i++%${#sp}:1}"
done &
trap "kill $!" EXIT
aws cloudformation wait stack-create-complete --stack-name ${stack}
if [ $? -eq 0 ];then
  echo "Stack ${stack} was created successfully!"
else
  echo "Stack ${stack} create failed!"
fi
kill $! && trap " " EXIT