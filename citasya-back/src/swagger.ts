import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express, RequestHandler } from 'express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CitasYa API',
            version: '1.0.0',
            description: 'API para el CRM de CitasYa con agente conversacional de WhatsApp',
        },
        servers: [
            {
                url: '/',
                description: 'Servidor Actual',
            },
            {
                url: 'http://localhost:3000',
                description: 'Servidor con Docker',
            },
            {
                url: 'http://localhost:4000',
                description: 'Servidor de desarrollo',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Specialty: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'ID único de la especialidad' },
                        name: { type: 'string', description: 'Nombre de la especialidad' },
                        description: { type: 'string', nullable: true, description: 'Descripción de la especialidad' },
                        center_id: { type: 'integer', nullable: true, description: 'ID del centro asociado' },
                    },
                    required: ['name'],
                },
                SpecialtyInput: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Nombre de la especialidad' },
                        description: { type: 'string', description: 'Descripción de la especialidad' },
                        center_id: { type: 'integer', description: 'ID del centro asociado' },
                    },
                    required: ['name'],
                },
                Service: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'ID único del servicio' },
                        name: { type: 'string', description: 'Nombre del servicio' },
                        description: { type: 'string', nullable: true, description: 'Descripción del servicio' },
                        minutes_duration: { type: 'integer', nullable: true, description: 'Duración en minutos' },
                        price: { type: 'number', format: 'decimal', nullable: true, description: 'Precio del servicio' },
                        status: { type: 'string', enum: ['Activo', 'Inactivo'], description: 'Estado del servicio' },
                        specialty_id: { type: 'integer', nullable: true, description: 'ID de la especialidad asociada' },
                    },
                    required: ['name', 'status'],
                },
                ServiceInput: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Nombre del servicio' },
                        description: { type: 'string', description: 'Descripción del servicio' },
                        minutes_duration: { type: 'integer', description: 'Duración en minutos' },
                        price: { type: 'number', description: 'Precio del servicio' },
                        status: { type: 'string', enum: ['Activo', 'Inactivo'], description: 'Estado del servicio' },
                        specialty_id: { type: 'integer', description: 'ID de la especialidad asociada' },
                    },
                    required: ['name', 'status'],
                },
                Client: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'ID único del cliente' },
                        name: { type: 'string', description: 'Nombre del cliente' },
                        documentId: { type: 'string', nullable: true, description: 'Documento de identidad' },
                        phone: { type: 'string', nullable: true, description: 'Teléfono del cliente' },
                        notes: { type: 'string', nullable: true, description: 'Notas adicionales' },
                        center_id: { type: 'integer', nullable: true, description: 'ID del centro asociado' },
                    },
                    required: ['name'],
                },
                ClientInput: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Nombre del cliente' },
                        documentId: { type: 'string', description: 'Documento de identidad' },
                        phone: { type: 'string', description: 'Teléfono del cliente' },
                        notes: { type: 'string', description: 'Notas adicionales' },
                        center_id: { type: 'integer', description: 'ID del centro asociado' },
                    },
                    required: ['name'],
                },
                Appointment: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'ID único de la cita' },
                        date: { type: 'string', format: 'date', description: 'Fecha de la cita' },
                        end_date: { type: 'string', format: 'date', nullable: true, description: 'Fecha de fin' },
                        hour: { type: 'string', description: 'Hora de la cita (HH:mm)' },
                        status: { type: 'string', enum: ['Pendiente', 'Confirmado', 'Cancelado', 'Concluida'], description: 'Estado de la cita' },
                        service_id: { type: 'integer', nullable: true, description: 'ID del servicio' },
                        client_id: { type: 'integer', nullable: true, description: 'ID del cliente' },
                        worker_id: { type: 'integer', nullable: true, description: 'ID del trabajador' },
                    },
                    required: ['date', 'hour', 'status'],
                },
                Worker: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'ID único del trabajador' },
                        name: { type: 'string', description: 'Nombre del trabajador' },
                        documentId: { type: 'string', nullable: true, description: 'Documento de identidad' },
                        phone: { type: 'string', nullable: true, description: 'Teléfono del trabajador' },
                        email: { type: 'string', nullable: true, description: 'Correo electrónico' },
                        schedule: { type: 'object', nullable: true, description: 'Horario del trabajador' },
                        status: { type: 'string', enum: ['Activo', 'Inactivo'], description: 'Estado del trabajador' },
                        notas: { type: 'string', nullable: true, description: 'Notas adicionales' },
                        center_id: { type: 'integer', nullable: true, description: 'ID del centro asociado' },
                    },
                    required: ['name', 'status'],
                },
                WorkerInput: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Nombre del trabajador' },
                        documentId: { type: 'string', nullable: true, description: 'Documento de identidad' },
                        phone: { type: 'string', nullable: true, description: 'Teléfono del trabajador' },
                        email: { type: 'string', nullable: true, description: 'Correo electrónico' },
                        schedule: { type: 'object', nullable: true, description: 'Horario del trabajador' },
                        status: { type: 'string', enum: ['Activo', 'Inactivo'], description: 'Estado del trabajador' },
                        notas: { type: 'string', nullable: true, description: 'Notas adicionales' },
                        center_id: { type: 'integer', nullable: true, description: 'ID del centro asociado' },
                        servicesIds: { type: 'array', items: { type: 'integer' }, nullable: true, description: 'IDs de servicios asociados' },
                    },
                    required: ['name', 'status'],
                },
                WhatsAppWebhook: {
                    type: 'object',
                    properties: {
                        Body: { type: 'string', description: 'Contenido del mensaje entrante' },
                        From: { type: 'string', description: 'Número de teléfono del remitente (formato: whatsapp:+XXXXXXXXXXX)' },
                    },
                    required: ['Body', 'From'],
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', description: 'Mensaje de error' },
                        error: { type: 'string', description: 'Detalle del error' },
                    },
                },
            },
        },
        tags: [
            { name: 'Auth', description: 'Autenticación y tokens JWT' },
            { name: 'Users', description: 'Gestión de usuarios y administradores' },
            { name: 'WhatsApp', description: 'Endpoints del webhook de WhatsApp' },
            { name: 'Specialties', description: 'Gestión de especialidades' },
            { name: 'Services', description: 'Gestión de servicios' },
            { name: 'Clients', description: 'Gestión de clientes' },
            { name: 'Appointments', description: 'Gestión de citas' },
            { name: 'Workers', description: 'Gestión de trabajadores' },
            { name: 'Reports', description: 'Reportes y métricas del Dashboard' },
        ],
    },
    apis: ['./src/**/*.routes.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
    app.use('/api-docs', swaggerUi.serve as unknown as RequestHandler[], swaggerUi.setup(swaggerSpec) as unknown as RequestHandler);
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
}
