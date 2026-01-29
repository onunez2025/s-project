
-- Script SQL para S-Project
-- Generado para PostgreSQL/MySQL

CREATE TABLE Areas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE Usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    rol ENUM('ADMIN', 'USUARIO') NOT NULL,
    sub_rol ENUM('GERENTE', 'JEFE', 'ASISTENTE') NULL, -- Solo si es Usuario
    area_id INT,
    reporta_a INT NULL, -- Jerarquía (El Jefe reporta al Gerente)
    FOREIGN KEY (area_id) REFERENCES Areas(id),
    FOREIGN KEY (reporta_a) REFERENCES Usuarios(id)
);

CREATE TABLE Proyectos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    -- area_id y lider_id ELIMINADOS, ahora están en tabla intermedia
    presupuesto DECIMAL(15, 2) NOT NULL,
    moneda ENUM('PEN', 'USD') NOT NULL,
    fecha_inicio DATE, -- Planificada
    fecha_fin DATE,    -- Planificada
    fecha_inicio_real DATE NULL, -- Calculada por la primera actividad iniciada
    fecha_fin_real DATE NULL,    -- Establecida al finalizar proyecto
    estado ENUM('PLANIFICACION', 'EN_PROGRESO', 'FINALIZADO') DEFAULT 'PLANIFICACION',
    progress INT DEFAULT 0
);

-- NUEVA TABLA: Relación N:M Proyectos <-> Áreas (con Líder específico por área)
CREATE TABLE Proyecto_Areas_Lideres (
    proyecto_id INT,
    area_id INT,
    lider_id INT, -- El líder encargado de esta área en este proyecto
    PRIMARY KEY (proyecto_id, area_id),
    FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id),
    FOREIGN KEY (area_id) REFERENCES Areas(id),
    FOREIGN KEY (lider_id) REFERENCES Usuarios(id)
);

CREATE TABLE EquipoProyecto (
    proyecto_id INT,
    usuario_id INT,
    rol_en_proyecto VARCHAR(50) DEFAULT 'MIEMBRO',
    PRIMARY KEY (proyecto_id, usuario_id),
    FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);

CREATE TABLE Actividades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proyecto_id INT NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    responsable_id INT NOT NULL,
    fecha_inicio DATE NOT NULL,             -- Planificada
    fecha_fin_estimada DATE NOT NULL,       -- Planificada
    fecha_inicio_real DATE NULL,            -- NUEVA: Real Start
    fecha_fin_real DATE NULL,               -- Real End
    estado ENUM('PENDIENTE', 'EN_PROGRESO', 'REALIZADA') DEFAULT 'PENDIENTE',
    FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id),
    FOREIGN KEY (responsable_id) REFERENCES Usuarios(id)
);

CREATE TABLE Gastos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proyecto_id INT NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    monto DECIMAL(15, 2) NOT NULL,
    moneda ENUM('PEN', 'USD') NOT NULL,
    categoria ENUM('MATERIALES', 'MANO_OBRA', 'TRANSPORTE', 'OTROS') NOT NULL,
    fecha_gasto DATE NOT NULL,
    usuario_id INT NOT NULL, -- Quién registró
    FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);

CREATE TABLE Archivos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proyecto_id INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_archivo ENUM('PDF', 'IMG', 'EXCEL', 'OTRO') NOT NULL,
    ruta_acceso TEXT NOT NULL, 
    fecha_subida DATE DEFAULT CURRENT_DATE,
    subido_por INT NOT NULL,
    FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id),
    FOREIGN KEY (subido_por) REFERENCES Usuarios(id)
);
