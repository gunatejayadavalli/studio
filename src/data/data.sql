-- SQL Dump for AirbnbLite

-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `properties`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `insurance_plans`;

--
-- Table structure for table `users`
--
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` text NOT NULL,
  `isHost` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--
INSERT INTO `users` (`id`, `name`, `email`, `password`, `avatar`, `isHost`) VALUES
('1', 'Alex Doe', 'alex@example.com', 'password123', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', 1),
('10', 'Jamie Blue', 'jamie@example.com', 'password123', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop', 0),
('2', 'Sam Smith', 'sam@example.com', 'password123', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop', 0),
('3', 'Casey Jones', 'casey@example.com', 'password123', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', 1),
('4', 'Riley Brown', 'riley@example.com', 'password123', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', 0),
('5', 'Jordan Lee', 'jordan@example.com', 'password123', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', 0),
('6', 'Morgan Taylor', 'morgan@example.com', 'password123', 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop', 1),
('7', 'Taylor Green', 'taylor@example.com', 'password123', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop', 1),
('8', 'Chris Pine', 'chris@example.com', 'password123', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', 0),
('9', 'Pat River', 'pat@example.com', 'password123', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', 1);

--
-- Table structure for table `properties`
--
CREATE TABLE `properties` (
  `id` varchar(255) NOT NULL,
  `hostId` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `pricePerNight` int NOT NULL,
  `rating` decimal(3,2) NOT NULL,
  `thumbnail` text NOT NULL,
  `images` text NOT NULL,
  `description` text NOT NULL,
  `amenities` text NOT NULL,
  `propertyInfo` text,
  `data_ai_hint` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hostId` (`hostId`),
  CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`hostId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `properties`
--
INSERT INTO `properties` (`id`, `hostId`, `title`, `location`, `pricePerNight`, `rating`, `thumbnail`, `images`, `description`, `amenities`, `propertyInfo`, `data_ai_hint`) VALUES
('1', '1', 'Sunny Beachside Villa', 'Malibu, California', 350, 4.90, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200&h=800&auto=format&fit=crop', 'Experience the best of Malibu in this stunning villa with direct beach access and panoramic ocean views. Perfect for a relaxing getaway.', 'WiFi|Pool|Kitchen|Free Parking|Air Conditioning', 'WiFi Network: VillaGuest\nWiFi Password: beachlife123\n\nCheck-in: Check-in is via a lockbox. The code will be sent to you on the morning of your arrival.', 'beach villa'),
('2', '1', 'Cozy Mountain Cabin', 'Aspen, Colorado', 220, 4.80, 'https://images.unsplash.com/photo-1551524164-687a55dd1126?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1551524164-687a55dd1126?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1616047006789-b7af52574028?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&h=800&auto=format&fit=crop', 'A charming and cozy cabin nestled in the mountains. Ideal for ski trips and hiking adventures. Features a large stone fireplace.', 'WiFi|Kitchen|Fireplace|Heating', 'Directions: From the main highway, take exit 42 onto Mountain Rd. and follow it for 3 miles. The cabin will be on your left, marked with a wooden sign.', 'mountain cabin'),
('3', '3', 'Modern Downtown Loft', 'New York, New York', 280, 4.70, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&h=800&auto=format&fit=crop', 'Stylish and modern loft in the heart of the city. Close to all major attractions, restaurants, and nightlife. Exposed brick walls and high ceilings.', 'WiFi|Kitchen|Air Conditioning|Elevator', 'WiFi Network: NYCLoft\nWiFi Password: citydreams', 'downtown loft'),
('4', '1', 'Rustic Lakeside Retreat', 'Lake Tahoe, California', 190, 4.85, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=1200&h=800&auto=format&fit=crop', 'Escape to this peaceful lakeside retreat. Enjoy beautiful sunsets from the private dock, go for a swim, or take a kayak out on the water.', 'WiFi|Kitchen|Waterfront|Patio', 'Kayaks and life vests are available for guest use in the boathouse.', 'lakeside retreat'),
('5', '6', 'Chic Parisian Apartment', 'Paris, France', 210, 4.92, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1564076634554-ce3f96118320?q=80&w=1200&h=800&auto=format&fit=crop', 'Live like a local in this chic apartment in Le Marais. Beautifully decorated with a mix of modern and vintage furniture. Includes a lovely balcony.', 'WiFi|Kitchen|Air Conditioning|Balcony', 'The nearest metro station is Saint-Paul (Line 1), about a 5-minute walk from the apartment.', 'paris apartment'),
('6', '3', 'Urban Chic Studio', 'Chicago, Illinois', 180, 4.80, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&h=800&auto=format&fit=crop', 'A stylish and modern studio in the heart of Chicago. Perfect for solo travelers or couples looking to explore the city.', 'WiFi|Kitchen|Air Conditioning|Gym Access', 'Guests have full access to the building''s gym on the ground floor and the rooftop deck.', 'urban studio'),
('7', '1', 'Tropical Treehouse', 'Bali, Indonesia', 250, 4.95, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200&h=800&auto=format&fit=crop', 'An unforgettable experience in a unique bamboo treehouse. Enjoy breathtaking views of the jungle and rice paddies from your private deck.', 'WiFi|Pool|Outdoor Shower|Breakfast Included', 'A complimentary tropical breakfast is served daily from 7 AM to 10 AM on your private deck.', 'tropical treehouse'),
('8', '6', 'Historic Townhouse', 'Boston, Massachusetts', 230, 4.75, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1564076634554-ce3f96118320?q=80&w=1200&h=800&auto=format&fit=crop', 'Stay in a beautifully preserved historic townhouse in the charming Beacon Hill neighborhood. Full of character with modern amenities.', 'WiFi|Kitchen|Fireplace|Air Conditioning', 'Street parking is available, but it can be limited. We recommend using public transport or ride-sharing services as the streets are very narrow.', 'historic townhouse'),
('9', '6', 'Desert Oasis with Pool', 'Scottsdale, Arizona', 400, 4.90, 'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1569348218683-e991410712f2?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1600585152225-357ea66c7e20?q=80&w=1200&h=800&auto=format&fit=crop', 'A luxurious desert oasis perfect for relaxation. This spacious home features a large pool, hot tub, and stunning mountain views.', 'WiFi|Pool|Hot Tub|Kitchen|Air Conditioning', 'The pool is professionally serviced every Tuesday and Friday morning.', 'desert oasis'),
('10', '7', 'Santorini Cave House', 'Oia, Greece', 550, 4.98, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=1200&h=800&auto=format&fit=crop', 'A traditional cave house carved into the caldera cliff, offering breathtaking views of the Aegean Sea and the famous Santorini sunset.', 'WiFi|Plunge Pool|Kitchenette|Air Conditioning', 'We recommend arranging a transfer from the port or airport. Taxis are available, and the ride takes about 25 minutes. We can also help arrange a private transfer for you.', 'santorini house'),
('11', '9', 'Kyoto Traditional Machiya', 'Kyoto, Japan', 280, 4.88, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&h=800&auto=format&fit=crop', 'Experience authentic Japanese living in a beautifully restored machiya (traditional wooden townhouse). Features tatami rooms and a private garden.', 'WiFi|Kitchen|Heating|Garden', 'The small tsubo-niwa (courtyard garden) is completely private for your enjoyment. Please remove your shoes at the entrance.', 'kyoto house'),
('12', '3', 'Seattle Floating Houseboat', 'Seattle, Washington', 260, 4.70, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&h=800&auto=format&fit=crop', 'Live like a local on one of Seattle''s famous houseboats on Lake Union. Enjoy the gentle rock of the water and views of the city skyline.', 'WiFi|Kitchenette|Heating|Kayak Access', '', 'seattle houseboat'),
('13', '7', 'Swiss Alps Chalet', 'Grindelwald, Switzerland', 420, 4.95, 'https://images.unsplash.com/photo-1551524164-687a55dd1126?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1551524164-687a55dd1126?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1616047006789-b7af52574028?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&h=800&auto=format&fit=crop', 'A cozy, traditional Swiss chalet with modern amenities and spectacular views of the Eiger north face. Ski-in, ski-out access in winter.', 'WiFi|Kitchen|Fireplace|Sauna|Ski Storage', '', 'alps chalet'),
('14', '9', 'Austin Modern Home', 'Austin, Texas', 310, 4.81, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&h=800&auto=format&fit=crop', 'A stunning modern home in a quiet Austin neighborhood, just minutes from downtown. Features a pool and a large outdoor patio.', 'WiFi|Pool|Kitchen|Air Conditioning|Free Parking', '', 'austin home'),
('15', '1', 'Charleston Historic Inn', 'Charleston, South Carolina', 240, 4.90, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&h=800&auto=format&fit=crop', 'Stay in a beautifully restored room in a historic inn, located in the heart of Charleston''s French Quarter. Walk to everything!', 'WiFi|Air Conditioning|Breakfast Included', '', 'charleston inn'),
('16', '6', 'Icelandic Glass Cabin', 'Reykjavik, Iceland', 380, 4.97, 'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1569348218683-e991410712f2?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1600585152225-357ea66c7e20?q=80&w=1200&h=800&auto=format&fit=crop', 'A remote glass cabin perfect for viewing the Northern Lights. A truly unique and magical experience in the Icelandic wilderness.', 'WiFi|Kitchenette|Heating|Hot Tub', 'The best chances of seeing the Northern Lights are from September to April on clear nights. The cabin''s remote location away from city lights provides an excellent viewing opportunity, but sightings are not guaranteed.', 'iceland cabin'),
('17', '3', 'Joshua Tree Dome', 'Joshua Tree, California', 220, 4.85, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1594488939444-3c0041285437?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1600585152225-357ea66c7e20?q=80&w=1200&h=800&auto=format&fit=crop', 'A unique geodesic dome house in the desert. Perfect for stargazing and exploring Joshua Tree National Park.', 'WiFi|Kitchen|Air Conditioning|Fire Pit', '', 'joshua tree dome'),
('18', '7', 'Savannah Garden Apartment', 'Savannah, Georgia', 160, 4.79, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&h=800&auto=format&fit=crop', 'A charming garden-level apartment in a historic Savannah home. Features a private courtyard entrance and is close to Forsyth Park.', 'WiFi|Kitchenette|Air Conditioning|Patio', '', 'savannah apartment'),
('19', '9', 'Miami Art Deco Condo', 'Miami Beach, Florida', 290, 4.60, 'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1594488939444-3c0041285437?q=80&w=1200&h=800&auto=format&fit=crop|https://images.unsplash.com/photo-1600585152225-357ea66c7e20?q=80&w=1200&h=800&auto=format&fit=crop', 'A stylish condo in a classic Art Deco building, just steps from South Beach. Enjoy the sun, sand, and vibrant nightlife.', 'WiFi|Pool|Kitchen|Air Conditioning', '', 'miami condo'),
('20', '1', 'Nashville Music Loft', 'Nashville, Tennessee', 200, 4.83, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&h=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&h=800&auto=format&fit=crop', 'A cool, music-themed loft in downtown Nashville. Close to Broadway and all the famous honky-tonks. Includes a record player and a collection of vinyl.', 'WiFi|Kitchen|Air Conditioning|Record Player', 'We are about a 15-minute walk or a 5-minute ride-share from the Ryman Auditorium and other downtown attractions.', 'nashville loft');

--
-- Table structure for table `insurance_plans`
--
CREATE TABLE `insurance_plans` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `pricePercent` int NOT NULL,
  `minTripValue` int NOT NULL,
  `maxTripValue` int NOT NULL,
  `benefits` text NOT NULL,
  `termsUrl` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `insurance_plans`
--
INSERT INTO `insurance_plans` (`id`, `name`, `pricePercent`, `minTripValue`, `maxTripValue`, `benefits`, `termsUrl`) VALUES
('GTI-01', 'Basic Guard', 5, 0, 499, 'Trip Cancellation: Up to $500|Trip Interruption: Up to $500|Medical Emergency: Up to $10,000', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
('GTI-02', 'Standard Shield', 6, 500, 1499, 'Trip Cancellation: Up to $1,500|Trip Interruption: Up to $1,500|Medical Emergency: Up to $25,000|Baggage Loss/Delay: Up to $500', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
('GTI-03', 'Flexi-Plus', 7, 1500, 2999, 'Trip Cancellation: Up to $3,000|Trip Interruption: Up to $3,000|Medical Emergency: Up to $50,000|Baggage Loss/Delay: Up to $1,000|Cancel for Any Reason: 75% refund (optional add-on)', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
('GTI-04', 'Premium Protect', 8, 3000, 5999, 'Trip Cancellation: Up to $6,000|Trip Interruption: Up to $6,000|Medical Emergency: Up to $100,000|Baggage Loss/Delay: Up to $2,000|Rental Car Damage: Included|Cancel for Any Reason: 75% refund', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
('GTI-05', 'Ultimate Voyager', 10, 6000, 999999, 'Trip Cancellation: Up to $10,000|Trip Interruption: Up to $10,000|Medical Emergency: Up to $500,000|Baggage Loss/Delay: Up to $2,500|Rental Car Damage: Included|Cancel for Any Reason: 100% refund|24/7 Concierge Service', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

--
-- Table structure for table `bookings`
--
CREATE TABLE `bookings` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `propertyId` varchar(255) NOT NULL,
  `checkIn` date NOT NULL,
  `checkOut` date NOT NULL,
  `totalCost` decimal(10,2) NOT NULL,
  `insurancePlanId` varchar(255) DEFAULT NULL,
  `guests` int NOT NULL,
  `status` varchar(255) NOT NULL,
  `cancellationReason` text,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `propertyId` (`propertyId`),
  KEY `insurancePlanId` (`insurancePlanId`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`),
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`insurancePlanId`) REFERENCES `insurance_plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bookings`
--
INSERT INTO `bookings` (`id`, `userId`, `propertyId`, `checkIn`, `checkOut`, `totalCost`, `insurancePlanId`, `guests`, `status`, `cancellationReason`) VALUES
('booking1', '10', '3', '2024-08-10', '2024-08-15', 1568.00, 'GTI-02', 2, 'confirmed', NULL),
('booking2', '2', '7', '2024-09-05', '2024-09-10', 1100.00, NULL, 3, 'cancelled-by-guest', NULL),
('booking3', '4', '1', '2024-10-01', '2024-10-07', 2450.00, NULL, 4, 'cancelled-by-host', 'Property is undergoing unexpected maintenance.'),
('booking4', '5', '13', '2024-11-12', '2024-11-18', 3024.00, 'GTI-03', 2, 'confirmed', NULL),
('booking5', '8', '10', '2025-05-20', '2025-05-27', 4578.50, 'GTI-04', 2, 'confirmed', NULL),
('booking6', '2', '13', '2025-02-10', '2025-02-17', 3234.00, 'GTI-03', 4, 'confirmed', NULL),
('booking7', '1', '5', '2024-07-20', '2024-07-25', 1207.50, NULL, 2, 'cancelled-by-host', 'Host had a family emergency.'),
('booking8', '1', '8', '2024-12-01', '2024-12-05', 920.00, NULL, 1, 'confirmed', NULL);

