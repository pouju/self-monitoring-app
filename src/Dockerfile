FROM denoland/deno:alpine-1.15.3

WORKDIR /app

COPY . .

EXPOSE 7777

CMD [ "run", "--allow-read", "--allow-net", "--allow-env", "--unstable", "app-launch.js" ]