const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');                      // Traces
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');                     // Span processor
const { Resource } = require('@opentelemetry/resources');                                     // Traces exporter
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');        // Semantic Conventions - define a common set of (semantic) attributes which provide meaning to data when collecting, producing and consuming it. Specify common names for different kinds of operations and data
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');               // API allows to specify which TracerProvider and/or MeterProvider to use by the given options object.
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');         // Auto instrum for express module
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');               // Auto instrum for http and https modules
const { AmqplibInstrumentation } = require('@opentelemetry/instrumentation-amqplib');         // Auto instrum for RabbitMQ module
const { MongooseInstrumentation } = require('@opentelemetry/instrumentation-mongoose');       // Auto instrum for Mongoose module

const init = (serviceName) => {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName
    })
  });
  const traceExporter = new OTLPTraceExporter({});
  provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));

  provider.register();
  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),      
      new AmqplibInstrumentation(),
      new MongooseInstrumentation(),
    ]
  });
  const tracer = provider.getTracer(serviceName);
  return { tracer }
}

module.exports = { init };
