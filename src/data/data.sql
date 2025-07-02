-- Drop database if it exists to start clean
DROP DATABASE IF EXISTS `airbnblite-db`;

-- Create the database
CREATE DATABASE `airbnblite-db`;

-- Use the database
USE `airbnblite-db`;

-- Create Users table with INT primary key
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    isHost BOOLEAN DEFAULT FALSE
);

-- Create Properties table with INT primary key and foreign key
CREATE TABLE properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hostId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    pricePerNight DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    thumbnail VARCHAR(1024),
    images TEXT,
    description TEXT,
    amenities TEXT,
    propertyInfo TEXT,
    data_ai_hint VARCHAR(255),
    FOREIGN KEY (hostId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Insurance Plans table
CREATE TABLE insurance_plans (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    pricePercent DECIMAL(5, 2) NOT NULL,
    minTripValue DECIMAL(10, 2) NOT NULL,
    maxTripValue DECIMAL(10, 2) NOT NULL,
    benefits TEXT,
    termsUrl VARCHAR(1024)
);

-- Create Bookings table with INT primary key and foreign keys
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    propertyId INT NOT NULL,
    checkIn DATE NOT NULL,
    checkOut DATE NOT NULL,
    totalCost DECIMAL(10, 2) NOT NULL,
    insurancePlanId VARCHAR(255),
    guests INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
    cancellationReason TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (insurancePlanId) REFERENCES insurance_plans(id)
);


-- Insert data into Users table
INSERT INTO users (name, email, password, avatar, isHost) VALUES
('Alex Doe', 'alex@example.com', 'password123', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', TRUE),
('Sam Smith', 'sam@example.com', 'password123', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop', FALSE),
('Casey Jones', 'casey@example.com', 'password123', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', TRUE),
('Riley Brown', 'riley@example.com', 'password123', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', FALSE),
('Jordan Lee', 'jordan@example.com', 'password123', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', FALSE),
('Morgan Taylor', 'morgan@example.com', 'password123', 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop', TRUE),
('Taylor Green', 'taylor@example.com', 'password123', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop', TRUE),
('Chris Pine', 'chris@example.com', 'password123', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', FALSE),
('Pat River', 'pat@example.com', 'password123', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', TRUE),
('Jamie Blue', 'jamie@example.com', 'password123', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop', FALSE);

-- Insert data into Properties table
INSERT INTO properties (hostId, title, location, pricePerNight, rating, thumbnail, images, description, amenities, propertyInfo, data_ai_hint) VALUES
(1, 'Sunny Beachside Villa', 'Malibu, California', 350.00, 4.90, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200&h=800&auto=format&fit=crop', 'Experience the best of Malibu in this stunning villa with direct beach access and panoramic ocean views. Perfect for a relaxing getaway.', 'WiFi,Pool,Kitchen,Free Parking,Air Conditioning', 'WiFi Network: VillaGuest\nWiFi Password: beachlife123\n\nCheck-in: Check-in is via a lockbox. The code will be sent to you on the morning of your arrival.', 'beach villa'),
(1, 'Cozy Mountain Cabin', 'Aspen, Colorado', 220.00, 4.80, 'https://images.unsplash.com/photo-1551524164-687a55dd1126?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1551524164-687a55dd1126?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1616047006789-b7af52574028?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&h=800&auto=format&fit=crop', 'A charming and cozy cabin nestled in the mountains. Ideal for ski trips and hiking adventures. Features a large stone fireplace.', 'WiFi,Kitchen,Fireplace,Heating', 'Directions: From the main highway, take exit 42 onto Mountain Rd. and follow it for 3 miles. The cabin will be on your left, marked with a wooden sign.', 'mountain cabin'),
(3, 'Modern Downtown Loft', 'New York, New York', 280.00, 4.70, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&h=800&auto=format&fit=crop', 'Stylish and modern loft in the heart of the city. Close to all major attractions, restaurants, and nightlife. Exposed brick walls and high ceilings.', 'WiFi,Kitchen,Air Conditioning,Elevator', 'WiFi Network: NYCLoft\nWiFi Password: citydreams', 'downtown loft'),
(1, 'Rustic Lakeside Retreat', 'Lake Tahoe, California', 190.00, 4.85, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=1200&h=800&auto=format&fit=crop', 'Escape to this peaceful lakeside retreat. Enjoy beautiful sunsets from the private dock, go for a swim, or take a kayak out on the water.', 'WiFi,Kitchen,Waterfront,Patio', 'Kayaks and life vests are available for guest use in the boathouse.', 'lakeside retreat'),
(6, 'Chic Parisian Apartment', 'Paris, France', 210.00, 4.92, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1564076634554-ce3f96118320?q=80&w=1200&h=800&auto=format&fit=crop', 'Live like a local in this chic apartment in Le Marais. Beautifully decorated with a mix of modern and vintage furniture. Includes a lovely balcony.', 'WiFi,Kitchen,Air Conditioning,Balcony', 'The nearest metro station is Saint-Paul (Line 1), about a 5-minute walk from the apartment.', 'paris apartment'),
(3, 'Urban Chic Studio', 'Chicago, Illinois', 180.00, 4.80, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&h=800&auto=format&fit=crop', 'A stylish and modern studio in the heart of Chicago. Perfect for solo travelers or couples looking to explore the city.', 'WiFi,Kitchen,Air Conditioning,Gym Access', 'Guests have full access to the building''s gym on the ground floor and the rooftop deck.', 'urban studio'),
(1, 'Tropical Treehouse', 'Bali, Indonesia', 250.00, 4.95, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200&h=800&auto=format&fit=crop', 'An unforgettable experience in a unique bamboo treehouse. Enjoy breathtaking views of the jungle and rice paddies from your private deck.', 'WiFi,Pool,Outdoor Shower,Breakfast Included', 'A complimentary tropical breakfast is served daily from 7 AM to 10 AM on your private deck.', 'tropical treehouse'),
(6, 'Historic Townhouse', 'Boston, Massachusetts', 230.00, 4.75, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1564076634554-ce3f96118320?q=80&w=1200&h=800&auto=format&fit=crop', 'Stay in a beautifully preserved historic townhouse in the charming Beacon Hill neighborhood. Full of character with modern amenities.', 'WiFi,Kitchen,Fireplace,Air Conditioning', 'Street parking is available, but it can be limited. We recommend using public transport or ride-sharing services as the streets are very narrow.', 'historic townhouse'),
(6, 'Desert Oasis with Pool', 'Scottsdale, Arizona', 400.00, 4.90, 'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1569348218683-e991410712f2?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1600585152225-357ea66c7e20?q=80&w=1200&h=800&auto=format&fit=crop', 'A luxurious desert oasis perfect for relaxation. This spacious home features a large pool, hot tub, and stunning mountain views.', 'WiFi,Pool,Hot Tub,Kitchen,Air Conditioning', 'The pool is professionally serviced every Tuesday and Friday morning.', 'desert oasis'),
(7, 'Santorini Cave House', 'Oia, Greece', 550.00, 4.98, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=1200&h=800&auto=format&fit=crop', 'A traditional cave house carved into the caldera cliff, offering breathtaking views of the Aegean Sea and the famous Santorini sunset.', 'WiFi,Plunge Pool,Kitchenette,Air Conditioning', 'We recommend arranging a transfer from the port or airport. Taxis are available, and the ride takes about 25 minutes. We can also help arrange a private transfer for you.', 'santorini house'),
(9, 'Kyoto Traditional Machiya', 'Kyoto, Japan', 280.00, 4.88, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&h=800&auto=format&fit=crop', 'Experience authentic Japanese living in a beautifully restored machiya (traditional wooden townhouse). Features tatami rooms and a private garden.', 'WiFi,Kitchen,Heating,Garden', 'The small tsubo-niwa (courtyard garden) is completely private for your enjoyment. Please remove your shoes at the entrance.', 'kyoto house'),
(3, 'Seattle Floating Houseboat', 'Seattle, Washington', 260.00, 4.70, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&h=800&auto=format&fit=crop', 'Live like a local on one of Seattle''s famous houseboats on Lake Union. Enjoy the gentle rock of the water and views of the city skyline.', 'WiFi,Kitchenette,Heating,Kayak Access', '', 'seattle houseboat'),
(7, 'Swiss Alps Chalet', 'Grindelwald, Switzerland', 420.00, 4.95, 'https://images.unsplash.com/photo-1551524164-687a55dd1126?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1551524164-687a55dd1126?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1616047006789-b7af52574028?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&h=800&auto=format&fit=crop', 'A cozy, traditional Swiss chalet with modern amenities and spectacular views of the Eiger north face. Ski-in, ski-out access in winter.', 'WiFi,Kitchen,Fireplace,Sauna,Ski Storage', '', 'alps chalet'),
(9, 'Austin Modern Home', 'Austin, Texas', 310.00, 4.81, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&h=800&auto=format&fit=crop', 'A stunning modern home in a quiet Austin neighborhood, just minutes from downtown. Features a pool and a large outdoor patio.', 'WiFi,Pool,Kitchen,Air Conditioning,Free Parking', '', 'austin home'),
(1, 'Charleston Historic Inn', 'Charleston, South Carolina', 240.00, 4.90, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&h=800&auto=format&fit=crop', 'Stay in a beautifully restored room in a historic inn, located in the heart of Charleston''s French Quarter. Walk to everything!', 'WiFi,Air Conditioning,Breakfast Included', '', 'charleston inn'),
(6, 'Icelandic Glass Cabin', 'Reykjavik, Iceland', 380.00, 4.97, 'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1569348218683-e991410712f2?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1600585152225-357ea66c7e20?q=80&w=1200&h=800&auto=format&fit=crop', 'A remote glass cabin perfect for viewing the Northern Lights. A truly unique and magical experience in the Icelandic wilderness.', 'WiFi,Kitchenette,Heating,Hot Tub', 'The best chances of seeing the Northern Lights are from September to April on clear nights. The cabin''s remote location away from city lights provides an excellent viewing opportunity, but sightings are not guaranteed.', 'iceland cabin'),
(3, 'Joshua Tree Dome', 'Joshua Tree, California', 220.00, 4.85, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1594488939444-3c0041285437?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1600585152225-357ea66c7e20?q=80&w=1200&h=800&auto=format&fit=crop', 'A unique geodesic dome house in the desert. Perfect for stargazing and exploring Joshua Tree National Park.', 'WiFi,Kitchen,Air Conditioning,Fire Pit', '', 'joshua tree dome'),
(7, 'Savannah Garden Apartment', 'Savannah, Georgia', 160.00, 4.79, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&h=800&auto=format&fit=crop', 'A charming garden-level apartment in a historic Savannah home. Features a private courtyard entrance and is close to Forsyth Park.', 'WiFi,Kitchenette,Air Conditioning,Patio', '', 'savannah apartment'),
(9, 'Miami Art Deco Condo', 'Miami Beach, Florida', 290.00, 4.60, 'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1594488939444-3c0041285437?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1600585152225-357ea66c7e20?q=80&w=1200&h=800&auto=format&fit=crop', 'A stylish condo in a classic Art Deco building, just steps from South Beach. Enjoy the sun, sand, and vibrant nightlife.', 'WiFi,Pool,Kitchen,Air Conditioning', '', 'miami condo'),
(1, 'Nashville Music Loft', 'Nashville, Tennessee', 200.00, 4.83, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&h=800&auto=format&fit=crop', 'A cool, music-themed loft in downtown Nashville. Close to Broadway and all the famous honky-tonks. Includes a record player and a collection of vinyl.', 'WiFi,Kitchen,Air Conditioning,Record Player', 'We are about a 15-minute walk or a 5-minute ride-share from the Ryman Auditorium and other downtown attractions.', 'nashville loft');

-- Insert data into Insurance Plans table
INSERT INTO insurance_plans (id, name, pricePercent, minTripValue, maxTripValue, benefits, termsUrl) VALUES
('GTI-01', 'Basic Guard', 5.00, 0.00, 499.00, 'Trip Cancellation: Up to $500|Trip Interruption: Up to $500|Medical Emergency: Up to $10,000', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
('GTI-02', 'Standard Shield', 6.00, 500.00, 1499.00, 'Trip Cancellation: Up to $1,500|Trip Interruption: Up to $1,500|Medical Emergency: Up to $25,000|Baggage Loss/Delay: Up to $500', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
('GTI-03', 'Flexi-Plus', 7.00, 1500.00, 2999.00, 'Trip Cancellation: Up to $3,000|Trip Interruption: Up to $3,000|Medical Emergency: Up to $50,000|Baggage Loss/Delay: Up to $1,000|Cancel for Any Reason: 75% refund (optional add-on)', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
('GTI-04', 'Premium Protect', 8.00, 3000.00, 5999.00, 'Trip Cancellation: Up to $6,000|Trip Interruption: Up to $6,000|Medical Emergency: Up to $100,000|Baggage Loss/Delay: Up to $2,000|Rental Car Damage: Included|Cancel for Any Reason: 75% refund', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
('GTI-05', 'Ultimate Voyager', 10.00, 6000.00, 999999.00, 'Trip Cancellation: Up to $10,000|Trip Interruption: Up to $10,000|Medical Emergency: Up to $500,000|Baggage Loss/Delay: Up to $2,500|Rental Car Damage: Included|Cancel for Any Reason: 100% refund|24/7 Concierge Service', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

-- Insert data into Bookings table
INSERT INTO bookings (userId, propertyId, checkIn, checkOut, totalCost, insurancePlanId, guests, status, cancellationReason) VALUES
(10, 3, '2024-08-10', '2024-08-15', 1568.00, 'GTI-02', 2, 'confirmed', NULL),
(2, 7, '2024-09-05', '2024-09-10', 1100.00, NULL, 3, 'cancelled-by-guest', 'Change of plans'),
(4, 1, '2024-10-01', '2024-10-07', 2450.00, NULL, 4, 'cancelled-by-host', 'Property is undergoing unexpected maintenance.'),
(5, 13, '2024-11-12', '2024-11-18', 3024.00, 'GTI-03', 2, 'confirmed', NULL),
(8, 10, '2025-05-20', '2025-05-27', 4578.50, 'GTI-04', 2, 'confirmed', NULL),
(2, 13, '2025-02-10', '2025-02-17', 3234.00, 'GTI-03', 4, 'confirmed', NULL),
(1, 5, '2024-07-20', '2024-07-25', 1207.50, NULL, 2, 'cancelled-by-host', 'Host had a family emergency.'),
(1, 8, '2024-12-01', '2024-12-05', 920.00, NULL, 1, 'confirmed', NULL);
