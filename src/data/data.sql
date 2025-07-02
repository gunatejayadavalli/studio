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
    reservationCost DECIMAL(10, 2) NOT NULL,
    serviceFee DECIMAL(10, 2) NOT NULL,
    insuranceCost DECIMAL(10, 2) NOT NULL,
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
('Alex Doe', 'alex@gmail.com', 'password123', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', TRUE),
('Sam Smith', 'sam@gmail.com', 'password123', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop', FALSE),
('Casey Jones', 'casey@gmail.com', 'password123', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', TRUE),
('Riley Brown', 'riley@gmail.com', 'password123', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', FALSE),
('Jordan Lee', 'jordan@gmail.com', 'password123', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', FALSE),
('Morgan Taylor', 'morgan@gmail.com', 'password123', 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop', TRUE),
('Taylor Green', 'taylor@gmail.com', 'password123', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop', TRUE),
('Chris Pine', 'chris@gmail.com', 'password123', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', FALSE),
('Pat River', 'pat@gmail.com', 'password123', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', TRUE),
('Jamie Blue', 'jamie@gmail.com', 'password123', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop', FALSE);

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
('GTI-01', 'Basic Guard', 5.00, 0.00, 499.00, 'Trip Cancellation: Up to $500|Trip Interruption: Up to $500|Medical Emergency: Up to $10,000', 'https://docs.google.com/gview?url=https://raw.githubusercontent.com/gunatejayadavalli/airbotdocs/master/GTI-01_tnc.pdf'),
('GTI-02', 'Standard Shield', 6.00, 500.00, 1499.00, 'Trip Cancellation: Up to $1,500|Trip Interruption: Up to $1,500|Medical Emergency: Up to $25,000|Baggage Loss/Delay: Up to $500', 'https://docs.google.com/gview?url=https://raw.githubusercontent.com/gunatejayadavalli/airbotdocs/master/GTI-02_tnc.pdf'),
('GTI-03', 'Flexi-Plus', 7.00, 1500.00, 2999.00, 'Trip Cancellation: Up to $3,000|Trip Interruption: Up to $3,000|Medical Emergency: Up to $50,000|Baggage Loss/Delay: Up to $1,000|Cancel for Any Reason: 75% refund (optional add-on)', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
('GTI-04', 'Premium Protect', 8.00, 3000.00, 5999.00, 'Trip Cancellation: Up to $6,000|Trip Interruption: Up to $6,000|Medical Emergency: Up to $100,000|Baggage Loss/Delay: Up to $2,000|Rental Car Damage: Included|Cancel for Any Reason: 75% refund', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
('GTI-05', 'Ultimate Voyager', 10.00, 6000.00, 999999.00, 'Trip Cancellation: Up to $10,000|Trip Interruption: Up to $10,000|Medical Emergency: Up to $500,000|Baggage Loss/Delay: Up to $2,500|Rental Car Damage: Included|Cancel for Any Reason: 100% refund|24/7 Concierge Service', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

-- Insert data into bookings table
INSERT INTO bookings (userId, propertyId, checkIn, checkOut, reservationCost, serviceFee, insuranceCost, totalCost, insurancePlanId, guests, status, cancellationReason) VALUES
(2, 1, '2025-07-01', '2025-07-05', 1400.00, 140.00, 84.00, 1624.00, 'GTI-02', 2, 'confirmed', NULL),
(4, 2, '2025-07-03', '2025-07-07', 880.00, 88.00, 52.80, 1020.80, 'GTI-02', 4, 'cancelled-by-guest', 'Plans changed, no longer traveling.'),
(5, 3, '2025-07-02', '2025-07-05', 840.00, 84.00, 50.40, 974.40, 'GTI-02', 1, 'confirmed', NULL),
(10, 5, '2025-07-10', '2025-07-15', 1050.00, 105.00, 63.00, 1218.00, 'GTI-02', 3, 'cancelled-by-host', 'Property maintenance issue.'),
(8, 10, '2025-07-06', '2025-07-09', 840.00, 84.00, 50.40, 974.40, 'GTI-02', 2, 'confirmed', NULL),
(6, 11, '2025-07-05', '2025-07-12', 2170.00, 217.00, 151.90, 2538.90, 'GTI-03', 4, 'cancelled-by-guest', 'Emergency at home, unable to travel.'),
(4, 12, '2025-07-01', '2025-07-06', 1550.00, 155.00, 108.50, 1813.50, 'GTI-03', 2, 'confirmed', NULL),
(5, 13, '2025-07-04', '2025-07-09', 1900.00, 190.00, 133.00, 2223.00, 'GTI-03', 3, 'cancelled-by-host', 'Double booking error.'),
(2, 14, '2025-07-08', '2025-07-11', 1260.00, 126.00, 88.20, 1474.20, 'GTI-02', 1, 'confirmed', NULL),
(7, 15, '2025-07-03', '2025-07-08', 1550.00, 155.00, 108.50, 1813.50, 'GTI-03', 5, 'confirmed', NULL),
(6, 6, '2025-07-10', '2025-07-14', 720.00, 72.00, 43.20, 835.20, 'GTI-02', 3, 'confirmed', NULL),
(9, 7, '2025-07-12', '2025-07-16', 1000.00, 100.00, 60.00, 1160.00, 'GTI-02', 2, 'cancelled-by-guest', 'Visa issue; cannot travel.'),
(3, 8, '2025-07-14', '2025-07-19', 1150.00, 115.00, 69.00, 1334.00, 'GTI-02', 2, 'confirmed', NULL),
(2, 9, '2025-07-18', '2025-07-21', 840.00, 84.00, 50.40, 974.40, 'GTI-02', 1, 'confirmed', NULL),
(1, 10, '2025-07-19', '2025-07-23', 1120.00, 112.00, 67.20, 1299.20, 'GTI-02', 4, 'cancelled-by-host', 'Owner had emergency travel.'),
(7, 11, '2025-07-22', '2025-07-25', 1260.00, 126.00, 88.20, 1474.20, 'GTI-02', 2, 'confirmed', NULL),
(3, 12, '2025-07-25', '2025-07-28', 1550.00, 155.00, 108.50, 1813.50, 'GTI-03', 2, 'confirmed', NULL),
(9, 13, '2025-07-27', '2025-08-01', 2500.00, 250.00, 175.00, 2925.00, 'GTI-03', 5, 'cancelled-by-guest', 'Family emergency back home.'),
(8, 14, '2025-07-30', '2025-08-03', 1680.00, 168.00, 117.60, 1965.60, 'GTI-03', 3, 'confirmed', NULL),
(5, 15, '2025-08-01', '2025-08-05', 1680.00, 168.00, 117.60, 1965.60, 'GTI-03', 1, 'confirmed', NULL),
(4, 16, '2025-08-03', '2025-08-07', 1520.00, 152.00, 106.40, 1778.40, 'GTI-03', 2, 'cancelled-by-host', 'Severe weather conditions.'),
(6, 17, '2025-08-05', '2025-08-10', 2100.00, 210.00, 147.00, 2457.00, 'GTI-03', 4, 'confirmed', NULL),
(7, 18, '2025-08-09', '2025-08-14', 2750.00, 275.00, 192.50, 3217.50, 'GTI-03', 3, 'confirmed', NULL),
(2, 19, '2025-08-10', '2025-08-14', 1240.00, 124.00, 74.40, 1438.40, 'GTI-02', 2, 'confirmed', NULL),
(10, 20, '2025-08-13', '2025-08-18', 1550.00, 155.00, 108.50, 1813.50, 'GTI-03', 3, 'cancelled-by-guest', 'Flight was canceled by airline.'),
(9, 1, '2025-08-15', '2025-08-19', 1400.00, 140.00, 84.00, 1624.00, 'GTI-02', 2, 'confirmed', NULL),
(3, 2, '2025-08-17', '2025-08-20', 660.00, 66.00, 39.60, 765.60, 'GTI-02', 1, 'confirmed', NULL),
(4, 3, '2025-08-20', '2025-08-24', 1120.00, 112.00, 67.20, 1299.20, 'GTI-02', 2, 'confirmed', NULL),
(7, 4, '2025-08-25', '2025-08-28', 570.00, 57.00, 34.20, 661.20, 'GTI-01', 1, 'confirmed', NULL),
(5, 5, '2025-08-26', '2025-08-31', 1050.00, 105.00, 63.00, 1218.00, 'GTI-02', 3, 'cancelled-by-host', 'Plumbing issue in the property.');