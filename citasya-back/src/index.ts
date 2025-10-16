import "reflect-metadata"; 

import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppDataSource } from './data-source.js';

// Routers modulares
import whatsappRoutes from './whatsapp.routes.js';
import specialtyRoutes from './modules/specialties/specialty.routes.js';
import serviceRoutes from './modules/services/service.routes.js';
import appointmentRoutes from './modules/appointments/appointment.routes.js';
import clientRoutes from './modules/clients/client.routes.js';
import userRoutes from './modules/users/user.routes.js';
import workerRoutes from './modules/workers/worker.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('¡Backend del agente de WhatsApp funcionando!');
});

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
    .then(() => {

        app.use('/whatsapp', whatsappRoutes);
        app.use('/admin/specialties', specialtyRoutes);
        app.use('/admin/services', serviceRoutes);
        app.use('/admin/appointments', appointmentRoutes);
        app.use('/admin/clients', clientRoutes);
        app.use('/admin/workers', workerRoutes);
        app.use('/admin/users', userRoutes);
        app.use('/admin/dashboard', dashboardRoutes);
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            
        });
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
