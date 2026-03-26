-- Migración / Seed de datos iniciales para citasya (Contexto: Spa de Mujeres)
-- Limpiar los datos actuales si es necesario (Opcional, ten cuidado en producción):
-- TRUNCATE TABLE services_per_worker, appointment, services, workers, clients, specialties, center RESTART IDENTITY CASCADE;

-- 1. Insertar Centros / Sucursales del Spa
INSERT INTO "center" (id, name, phone, address, "social_media", "bussinesTime") VALUES
(1, 'Luminance Spa Principal', '123456789', 'Plaza Central 123', '{}', '{}'),
(2, 'Luminance Spa Express', '987654321', 'Centro Comercial Norte', '{}', '{}')
ON CONFLICT (id) DO NOTHING;

-- 2. Insertar Especialidades
INSERT INTO "specialties" (id, name, description, center_id) VALUES
(1, 'Cuidado de Uñas', 'Manicura, pedicura y diseño de uñas', 1),
(2, 'Cuidado Facial', 'Limpiezas, exfoliaciones y mascarillas', 1),
(3, 'Masajes y Relajación', 'Masajes descontracturantes y aromaterapia', 1)
ON CONFLICT (id) DO NOTHING;

-- 3. Insertar Clientes
INSERT INTO "clients" (id, name, "documentId", phone, notes, center_id) VALUES
(1, 'Valeria Rojas', 'DOC-C001', '555-0101', 'Cliente VIP. Prefiere tonos pastel', 1),
(2, 'Camila Soto', 'DOC-C002', '555-0202', 'Alergia a productos con sulfatos', 1),
(3, 'Andrea Medina', 'DOC-C003', '555-0303', '', 1)
ON CONFLICT (id) DO NOTHING;

-- 4. Insertar Trabajadoras (Estatus puede ser: 'Activo', 'Inactivo')
INSERT INTO "workers" (id, name, "documentId", phone, email, schedule, status, notas, center_id) VALUES
(1, 'Sofía M.', 'DOC-W001', '555-1001', 'sofia@spa.com', '{}', 'Activo', 'Especialista en Nail Art', 1),
(2, 'Laura G.', 'DOC-W002', '555-1002', 'laura@spa.com', '{}', 'Activo', 'Cosmetóloga Facial', 1),
(3, 'Elena P.', 'DOC-W003', '555-1003', 'elena@spa.com', '{}', 'Activo', 'Especialista en masajes relajantes', 1)
ON CONFLICT (id) DO NOTHING;

-- 5. Insertar Servicios (Estatus puede ser: 'Activo', 'Inactivo')
INSERT INTO "services" (id, name, description, minutes_duration, price, status, specialty_id) VALUES
(1, 'Manicura Semipermanente', 'Esmaltado de larga duración con refuerzo', 60, 25.00, 'Activo', 1),
(2, 'Pedicura Spa', 'Exfoliación profunda, masajes e hidratación', 45, 30.00, 'Activo', 1),
(3, 'Limpieza Facial Profunda', 'Extracción, peeling e hidratación con ácido hialurónico', 90, 50.00, 'Activo', 2),
(4, 'Masaje Aromaterapia', 'Masaje corporal completo con aceites esenciales', 60, 60.00, 'Activo', 3)
ON CONFLICT (id) DO NOTHING;

-- 6. Relacionar Servicios y Trabajadoras (Tabla intermedia ManyToMany)
INSERT INTO "services_per_worker" (worker_id, service_id) VALUES
(1, 1), -- Sofía hace Manicura
(1, 2), -- Sofía también hace Pedicura
(2, 3), -- Laura hace Limpieza Facial
(3, 4)  -- Elena hace Masajes
ON CONFLICT DO NOTHING;

-- Nota: Como estamos forzando los IDs (1, 2, 3), es importante resetear las secuencias
-- para que al crear nuevos desde tu front/postman, el ID automático no de error (Unique Violation)
SELECT setval('center_id_seq', (SELECT MAX(id) FROM "center"));
SELECT setval('specialties_id_seq', (SELECT MAX(id) FROM "specialties"));
SELECT setval('clients_id_seq', (SELECT MAX(id) FROM "clients"));
SELECT setval('workers_id_seq', (SELECT MAX(id) FROM "workers"));
SELECT setval('services_id_seq', (SELECT MAX(id) FROM "services"));
