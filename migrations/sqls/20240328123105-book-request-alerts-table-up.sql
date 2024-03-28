CREATE TABLE IF NOT EXISTS `book_request_alerts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(255) DEFAULT NULL,
  `description` TEXT,
  `status` ENUM('pending','approved','declined') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);