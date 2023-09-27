FROM node:lts-alpine
COPY / /app/
WORKDIR "/app"
RUN npm ci
EXPOSE 8080
CMD ["npm", "run", "start"]
