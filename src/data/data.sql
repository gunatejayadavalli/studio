-- Complete schema and mock data for AirbnbLite

-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS insurance_plans;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    isHost BOOLEAN DEFAULT FALSE
);

-- Properties table
CREATE TABLE properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hostId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    pricePerNight DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 2) NOT NULL,
    thumbnail VARCHAR(255),
    images TEXT,
    description TEXT,
    amenities TEXT,
    propertyInfo TEXT,
    data_ai_hint VARCHAR(255),
    FOREIGN KEY (hostId) REFERENCES users(id)
);

-- Insurance Plans table
CREATE TABLE insurance_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    pricePercent DECIMAL(5, 2) NOT NULL,
    minTripValue DECIMAL(10, 2) NOT NULL,
    maxTripValue DECIMAL(10, 2) NOT NULL,
    benefits TEXT,
    termsUrl VARCHAR(255)
);

-- Bookings table with cost breakdown
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    propertyId INT NOT NULL,
    checkIn DATE NOT NULL,
    checkOut DATE NOT NULL,
    totalCost DECIMAL(10, 2) NOT NULL,
    insurancePlanId VARCHAR(50),
    guests INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    cancellationReason TEXT,
    reservationCost DECIMAL(10, 2) NOT NULL,
    serviceFee DECIMAL(10, 2) NOT NULL,
    insuranceCost DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (propertyId) REFERENCES properties(id),
    FOREIGN KEY (insurancePlanId) REFERENCES insurance_plans(id)
);

-- Mock Data Insertion

-- Insert Users
INSERT INTO users (id, name, email, password, avatar, isHost) VALUES
(1, 'Alex Johnson', 'alex@gmail.com', 'password123', 'https://i.pravatar.cc/150?u=alex', TRUE),
(2, 'Maria Garcia', 'maria@gmail.com', 'password456', 'https://i.pravatar.cc/150?u=maria', TRUE),
(3, 'Sam Taylor', 'sam@gmail.com', 'password789', 'https://i.pravatar.cc/150?u=sam', FALSE);

-- Insert Properties
INSERT INTO properties (id, hostId, title, location, pricePerNight, rating, thumbnail, images, description, amenities, propertyInfo, data_ai_hint) VALUES
(1, 1, 'Cozy Downtown Loft', 'New York, NY', 250.00, 4.8, 'https://placehold.co/600x400.png', 'https://placehold.co/1200x800.png|https://placehold.co/1200x800.png', 'A beautiful and modern loft in the heart of the city.', 'WiFi,Air Conditioning,Kitchen', 'WiFi: aabbcc, Door code: 1234', 'apartment city'),
(2, 1, 'Oceanview Villa with Pool', 'Malibu, CA', 320.00, 4.9, 'https://placehold.co/600x400.png', 'https://placehold.co/1200x800.png|https://placehold.co/1200x800.png', 'Stunning villa with breathtaking ocean views and a private pool.', 'WiFi,Kitchen,Pool', 'Pool is heated. Grill is available for use.', 'villa ocean'),
(3, 2, 'Rustic Mountain Cabin', 'Aspen, CO', 295.00, 4.7, 'https://placehold.co/600x400.png', 'https://placehold.co/1200x800.png|https://placehold.co/1200x800.png', 'Charming cabin perfect for a mountain getaway.', 'WiFi,Fireplace', 'Firewood is stocked on the porch.', 'cabin mountain'),
(4, 2, 'Chic Urban Apartment', 'Paris, France', 180.00, 4.6, 'https://placehold.co/600x400.png', 'https://placehold.co/1200x800.png|https://placehold.co/1200x800.png', 'Elegant apartment in a historic Parisian building.', 'WiFi,Kitchen,Elevator', 'Metro station is a 2-minute walk away.', 'apartment paris');

-- Insert Insurance Plans
INSERT INTO insurance_plans (id, name, pricePercent, minTripValue, maxTripValue, benefits, termsUrl) VALUES
('basic-plan', 'Standard Protection', 4.0, 0, 5000, 'Trip Cancellation|Medical Emergency|Lost Baggage', 'https://example.com/basic-terms.pdf'),
('premium-plan', 'Premium Coverage', 6.5, 5000, 20000, 'Trip Cancellation|Medical Emergency|Lost Baggage|Rental Car Damage', 'https://example.com/premium-terms.pdf');

-- Insert Bookings (with calculated cost breakdown)
-- Booking 1: Prop 3, 5 nights. reservation=295*5=1475. service=147.5. insurance=0. total=1622.5
INSERT INTO bookings (id, userId, propertyId, checkIn, checkOut, totalCost, insurancePlanId, guests, status, cancellationReason, reservationCost, serviceFee, insuranceCost) VALUES
(1, 3, 3, '2025-08-10', '2025-08-15', 1622.50, NULL, 2, 'confirmed', NULL, 1475.00, 147.50, 0.00);

-- Booking 2: Prop 4, 5 nights. reservation=180*5=900. service=90. insurance=0. total=990
INSERT INTO bookings (id, userId, propertyId, checkIn, checkOut, totalCost, insurancePlanId, guests, status, cancellationReason, reservationCost, serviceFee, insuranceCost) VALUES
(2, 1, 4, '2025-09-01', '2025-09-06', 990.00, NULL, 1, 'confirmed', NULL, 900.00, 90.00, 0.00);

-- Booking 3: Prop 2, 10 nights. reservation=320*10=3200. service=320. insurance=3200*0.04=128. total=3648
INSERT INTO bookings (id, userId, propertyId, checkIn, checkOut, totalCost, insurancePlanId, guests, status, cancellationReason, reservationCost, serviceFee, insuranceCost) VALUES
(3, 3, 2, '2025-07-20', '2025-07-30', 3648.00, 'basic-plan', 4, 'confirmed', NULL, 3200.00, 320.00, 128.00);

-- Booking 4: Same as booking 1 but cancelled
INSERT INTO bookings (id, userId, propertyId, checkIn, checkOut, totalCost, insurancePlanId, guests, status, cancellationReason, reservationCost, serviceFee, insuranceCost) VALUES
(4, 3, 1, '2025-10-01', '2025-10-05', 1375.00, NULL, 2, 'cancelled-by-guest', 'Change of plans', 1250.00, 125.00, 0.00);
