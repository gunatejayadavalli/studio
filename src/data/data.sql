CREATE DATABASE IF NOT EXISTS `airbnblite-db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `airbnblite-db`;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isHost` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES (1,'Alex Johnson','alex@gmail.com','password123','https://i.pravatar.cc/150?u=alex',1),(2,'Maria Garcia','maria@gmail.com','password123','https://i.pravatar.cc/150?u=maria',0),(3,'Sam Lee','sam@gmail.com','password456','https://i.pravatar.cc/150?u=sam',1);
UNLOCK TABLES;

DROP TABLE IF EXISTS `properties`;
CREATE TABLE `properties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hostId` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pricePerNight` decimal(10,2) NOT NULL,
  `rating` decimal(3,2) NOT NULL,
  `thumbnail` varchar(1024) COLLATE utf8mb4_unicode_ci NOT NULL,
  `images` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `amenities` text COLLATE utf8mb4_unicode_ci,
  `propertyInfo` text COLLATE utf8mb4_unicode_ci,
  `data_ai_hint` varchar(255) COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `properties` WRITE;
INSERT INTO `properties` VALUES 
(1,1,'Cozy Beachside Cottage','Malibu, California',350.00,4.80,'https://images.unsplash.com/photo-1588806488534-395f33a5b331?q=80&w=2070&auto=format&fit=crop','https://images.unsplash.com/photo-1588806488534-395f33a5b331?q=80&w=2070&auto=format&fit=crop|https://images.unsplash.com/photo-1560200353-ce0a1b8e64a1?q=80&w=2070&auto=format&fit=crop','A charming cottage right on the beach, perfect for a romantic getaway.','WiFi,Kitchen,Air Conditioning','Check-in is at 3 PM. WiFi password is \'beachlife\'.','beach house'),
(2,1,'Modern Downtown Loft','New York, New York',500.00,4.90,'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop|https://images.unsplash.com/photo-1628592102751-ba834f697244?q=80&w=2070&auto=format&fit=crop','Stylish loft in the heart of the city with stunning skyline views.','WiFi,Air Conditioning','The key is in the lockbox, code 1234. Enjoy the city!','city apartment'),
(3,3,'Secluded Mountain Cabin','Aspen, Colorado',280.00,4.70,'https://images.unsplash.com/photo-1559708479-62e1c7c93459?q=80&w=1925&auto=format&fit=crop','https://images.unsplash.com/photo-1559708479-62e1c7c93459?q=80&w=1925&auto=format&fit=crop|https://images.unsplash.com/photo-1594741148362-9e6a77cd53e2?q=80&w=2070&auto=format&fit=crop','Escape to this peaceful cabin surrounded by nature.','WiFi,Kitchen','Beware of bears! Store food securely. The fireplace is ready to use.','mountain cabin');
UNLOCK TABLES;


DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `propertyId` int NOT NULL,
  `checkIn` date NOT NULL,
  `checkOut` date NOT NULL,
  `totalCost` decimal(10,2) NOT NULL,
  `insurancePlanId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guests` int NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'confirmed',
  `cancellationReason` text COLLATE utf8mb4_unicode_ci,
  `reservationCost` decimal(10,2) NOT NULL,
  `serviceFee` decimal(10,2) NOT NULL,
  `insuranceCost` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `insurance_plans`;
CREATE TABLE `insurance_plans` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pricePercent` decimal(5,2) NOT NULL,
  `minTripValue` decimal(10,2) NOT NULL,
  `maxTripValue` decimal(10,2) NOT NULL,
  `benefits` text COLLATE utf8mb4_unicode_ci,
  `termsUrl` varchar(1024) COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `insurance_plans` WRITE;
INSERT INTO `insurance_plans` VALUES 
('plan-basic','Basic Wanderer Protection',5.00,0.00,1000.00,'Trip Cancellation up to $500|Lost Baggage up to $250','https://example.com/basic-terms.pdf'),
('plan-premium','Adventure-Ready Coverage',7.50,1000.00,5000.00,'Trip Cancellation up to $2,500|Medical Emergency up to $10,000|Lost Baggage up to $1,000','https://example.com/premium-terms.pdf');
UNLOCK TABLES;
