import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

// Configura el exportador para enviar trazas a Grafana Tempo
const traceExporter = new OTLPTraceExporter({
    // La URL de Tempo. 'tempo' es el nombre del servicio en docker-compose
    url: 'http://tempo:4318/v1/traces',
});

const sdk = new NodeSDK({
    traceExporter,
    // ¡La magia! Esto instrumenta automáticamente librerías populares
    instrumentations: [
        getNodeAutoInstrumentations({
            // Deshabilita instrumentaciones que no necesites para mejorar el rendimiento
            '@opentelemetry/instrumentation-fs': {
                enabled: false,
            },
        }),
    ],
});

// Inicia el SDK y maneja el cierre elegante
sdk.start();
process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.error('Error terminating tracing', error))
        .finally(() => process.exit(0));
});
