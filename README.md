## Microservice architecture observed with Otel
Architecture where three independent microservices, `inventory-service` (running on port 3000), `bar-service` (running on port 3001), and `brewery-service` (running on port 3002) communicate with each other through message broker. The interaction between the services is observed using an OpenTelemetry tracer via Jaeger UI.

### Brief explanation of the pipeline
`brewery-service` fetches new beer items from an external API and send it to the `inventory-service` to be stored in a database. `bar-service` ask `inventory-service` for the full list of available beers in the database to show it the bar costumers. The communication from `brewery-service` and `bar-service` with the `inventory-service` happens through RabbitMQ message queues.

### Project structure
- bar-service
  - routes
    - bar-api
  - index.js
  - package.json
- brewery-service
  - routes
    - brewery-api
  - index.js
  - package.json
- inventory-service
  - Models
    - DataAccess
      - InventoryRepository.js
    - BeerModel.js
  - index.js
  - package.json
- package.json
- tracer.js      

### Prerequisites
Before running the application, make sure you have the following installed:

1. NodeJS (v18.13.0)
2. NPM (v8.19.3)
3. Running instances of RabbitMQ messages broker and Jaeger tracing platform (+info on 'installation' section)
4. MongoDB database instance (or MongoDB Atlas cluster). Create a `.env` file and add a `MONGODB_URI` variable that references your MongoDB database connection string, including your databse username and password.

### Installation
1. Clone the repository with `git clone https://github.com/AlonsoLobato/beer_microservice_observability`
2. Open three separate terminal sessions and `cd` into each service directory (`bar`, `brewery` and `inventory`)
3. Install the dependencies in each service with `npm install`
4. Run each service with `npm run dev` to run in dev mode (uses nodemon) or `npm start` to run in production mode
5. Deploy a local instance of RabbitMQ, using a Docker image, with the command `docker run --rm -p 5672:5672 -p 15672:15672 -d --name rabbit rabbitmq:3-management`. 
  *[Requires Docker desktop installed](https://docs.docker.com/desktop/install/mac-install/)
6. Run a Jaeger tracing tool instance; can be run as Docker image, with the following command:
  ```
  docker run --rm --name jaeger \
    -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
    -p 6831:6831/udp \
    -p 6832:6832/udp \
    -p 5778:5778 \
    -p 16686:16686 \
    -p 4317:4317 \
    -p 4318:4318 \
    -p 14250:14250 \
    -p 14268:14268 \
    -p 14269:14269 \
    -p 9411:9411 \
    jaegertracing/all-in-one:1.53
  ```
6. Using an API client of your choice (e.g. Postman) send a `GET` API call to `http://localhost:3001/barMenu` to fetch the whole list of beers stored in the database menu or a `GET` API call to `http://localhost:3002/newBeer` to create a new random beer and add it to the database. 

### Observability
- Each service has installed the OTel node sdk and autoinstrumentation for amqplib, http and express. In addition, the inventory-service has autoinstrumentation for mongoose too.
- A tracer.js file allows to instrument traces
  - note that the tracer is required in each of the services and it's run before any other code runs (see top of each service's server file).
- Traces are exported to the Jaeger tracing platform. 
  - to view the traces in the Jaeger UI visit `http://localhost:16686/` 
