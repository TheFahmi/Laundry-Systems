-- Script untuk membuat tabel dan data dummy untuk aplikasi laundry

-- Drop tables jika sudah ada (untuk fresh install)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Tabel Users (untuk authentikasi dan pengguna sistem)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'manager')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Customers (pelanggan)
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    email VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Services (jasa layanan laundry)
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    estimated_duration INTEGER NOT NULL, -- dalam jam
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Transactions (transaksi laundry)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    service_id INTEGER REFERENCES services(id),
    user_id INTEGER REFERENCES users(id),
    weight DECIMAL(5, 2), -- dalam kg
    quantity INTEGER,
    price_total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
    notes TEXT,
    received_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estimated_completion_date TIMESTAMP,
    completed_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert data dummy untuk tabel Users
INSERT INTO users (username, password, name, email, role) VALUES
-- Password default: password123 (diasumsikan sudah di-hash)
('admin', '$2a$10$8KzaNdKIMyOkASCH4QvSBuN7eUF3umZ.h.xQZD2Q5vZqzZo4jJz9.', 'Admin Utama', 'admin@laundry.com', 'admin'),
('manager', '$2a$10$8KzaNdKIMyOkASCH4QvSBuN7eUF3umZ.h.xQZD2Q5vZqzZo4jJz9.', 'Manager Toko', 'manager@laundry.com', 'manager'),
('staff1', '$2a$10$8KzaNdKIMyOkASCH4QvSBuN7eUF3umZ.h.xQZD2Q5vZqzZo4jJz9.', 'Staff Satu', 'staff1@laundry.com', 'staff'),
('staff2', '$2a$10$8KzaNdKIMyOkASCH4QvSBuN7eUF3umZ.h.xQZD2Q5vZqzZo4jJz9.', 'Staff Dua', 'staff2@laundry.com', 'staff');

-- Insert data dummy untuk tabel Customers
INSERT INTO customers (name, phone, address, email, notes) VALUES
('Budi Santoso', '081234567890', 'Jl. Sudirman No. 123, Jakarta', 'budi@email.com', 'Pelanggan tetap'),
('Ani Wijaya', '082345678901', 'Jl. Thamrin No. 45, Jakarta', 'ani@email.com', 'Alergi deterjen kuat'),
('Citra Lestari', '083456789012', 'Jl. Gatot Subroto No. 67, Jakarta', 'citra@email.com', NULL),
('Dodi Permana', '084567890123', 'Jl. Kuningan No. 89, Jakarta', 'dodi@email.com', 'Preferensi pewangi lavender'),
('Eka Sari', '085678901234', 'Jl. Rasuna Said No. 12, Jakarta', 'eka@email.com', NULL),
('Fandi Ahmad', '086789012345', 'Jl. Casablanca No. 34, Jakarta', 'fandi@email.com', 'Butuh cepat biasanya'),
('Gina Putri', '087890123456', 'Jl. Tebet No. 56, Jakarta', 'gina@email.com', NULL),
('Hadi Wibowo', '088901234567', 'Jl. Pancoran No. 78, Jakarta', 'hadi@email.com', NULL),
('Indah Safitri', '089012345678', 'Jl. Mampang No. 90, Jakarta', 'indah@email.com', 'Preferensi lipat rapi'),
('Joko Susilo', '089123456789', 'Jl. Tendean No. 21, Jakarta', 'joko@email.com', NULL);

-- Insert data dummy untuk tabel Services
INSERT INTO services (name, description, price, estimated_duration, is_active) VALUES
('Cuci Kering Reguler', 'Layanan cuci dan kering standar', 10000.00, 24, TRUE),
('Cuci Kering Express', 'Layanan cuci dan kering cepat (6 jam)', 15000.00, 6, TRUE),
('Cuci Setrika Reguler', 'Layanan cuci dan setrika standar', 15000.00, 48, TRUE),
('Cuci Setrika Express', 'Layanan cuci dan setrika cepat (12 jam)', 20000.00, 12, TRUE),
('Setrika Saja', 'Layanan setrika untuk pakaian yang sudah bersih', 8000.00, 24, TRUE),
('Dry Cleaning', 'Layanan pembersihan khusus untuk pakaian formal', 25000.00, 72, TRUE),
('Cuci Sepatu', 'Layanan cuci untuk semua jenis sepatu', 35000.00, 72, TRUE),
('Cuci Karpet', 'Layanan cuci karpet per meter persegi', 40000.00, 96, TRUE),
('Cuci Bed Cover', 'Layanan cuci khusus untuk bed cover', 30000.00, 48, TRUE),
('Cuci Sprei', 'Layanan cuci khusus untuk sprei', 20000.00, 24, TRUE);

-- Insert data dummy untuk tabel Transactions
INSERT INTO transactions (customer_id, service_id, user_id, weight, quantity, price_total, status, payment_status, notes, received_date, estimated_completion_date, completed_date) VALUES
(1, 1, 3, 3.5, 1, 35000.00, 'completed', 'paid', 'Pakaian sehari-hari', '2023-10-01 10:00:00', '2023-10-02 10:00:00', '2023-10-02 09:30:00'),
(2, 3, 4, 2.0, 1, 30000.00, 'completed', 'paid', NULL, '2023-10-02 11:30:00', '2023-10-04 11:30:00', '2023-10-04 10:00:00'),
(3, 2, 3, 1.5, 1, 22500.00, 'completed', 'paid', 'Butuh cepat', '2023-10-03 09:15:00', '2023-10-03 15:15:00', '2023-10-03 15:00:00'),
(4, 4, 4, 2.8, 1, 56000.00, 'completed', 'paid', NULL, '2023-10-04 14:00:00', '2023-10-05 02:00:00', '2023-10-05 01:30:00'),
(5, 5, 3, NULL, 10, 80000.00, 'completed', 'paid', 'Pakaian kantor', '2023-10-05 10:30:00', '2023-10-06 10:30:00', '2023-10-06 11:00:00'),
(6, 6, 4, NULL, 2, 50000.00, 'completed', 'paid', 'Jas untuk acara', '2023-10-06 16:00:00', '2023-10-09 16:00:00', '2023-10-09 15:00:00'),
(7, 3, 3, 4.0, 1, 60000.00, 'processing', 'paid', NULL, '2023-10-10 11:45:00', '2023-10-12 11:45:00', NULL),
(8, 1, 4, 2.5, 1, 25000.00, 'processing', 'paid', NULL, '2023-10-10 13:20:00', '2023-10-11 13:20:00', NULL),
(9, 8, 3, NULL, 1, 40000.00, 'pending', 'unpaid', 'Karpet ruang tamu 2x3m', '2023-10-11 09:00:00', '2023-10-15 09:00:00', NULL),
(10, 9, 4, NULL, 2, 60000.00, 'pending', 'partial', 'DP 30000', '2023-10-11 14:30:00', '2023-10-13 14:30:00', NULL),
(1, 10, 3, NULL, 3, 60000.00, 'pending', 'unpaid', NULL, '2023-10-12 10:15:00', '2023-10-13 10:15:00', NULL),
(3, 7, 4, NULL, 1, 35000.00, 'pending', 'unpaid', 'Sepatu olahraga', '2023-10-12 16:45:00', '2023-10-15 16:45:00', NULL);

-- Tambahan view untuk laporan
CREATE OR REPLACE VIEW transaction_report AS
SELECT 
    t.id as transaction_id, 
    c.name as customer_name, 
    s.name as service_name, 
    u.name as staff_name,
    t.weight, 
    t.quantity, 
    t.price_total, 
    t.status, 
    t.payment_status,
    t.received_date, 
    t.estimated_completion_date, 
    t.completed_date
FROM 
    transactions t
JOIN 
    customers c ON t.customer_id = c.id
JOIN 
    services s ON t.service_id = s.id
JOIN 
    users u ON t.user_id = u.id
ORDER BY 
    t.received_date DESC; 