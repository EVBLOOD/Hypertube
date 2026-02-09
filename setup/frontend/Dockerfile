FROM node:20-bullseye-slim

RUN apt update -y && apt upgrade -y && apt install git -y 

COPY script.sh .

ENTRYPOINT ["sh", "script.sh"]