FROM node:20-bookworm-slim

RUN apt update -y && apt upgrade -y && apt install git gcc build-essential python3 -y 

COPY script.sh .

ENTRYPOINT ["sh", "script.sh"]