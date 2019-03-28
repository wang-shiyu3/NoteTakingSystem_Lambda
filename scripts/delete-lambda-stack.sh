#!/bin/bash
aws cloudformation delete-stack --stack-name csye-lambda
i=1
sp="/-\|"
while true
do
  printf "\b${sp:i++%${#sp}:1}"
done &
trap "kill $!" EXIT
aws cloudformation wait stack-delete-complete --stack-name csye-lambda
if [ $? -eq 0 ];then
  echo "Stack ${stack} was deleted successfully!"
else
  echo "Stack ${stack} deleted failed!"
fi
kill $! && trap " " EXIT