CREATE TABLE IF NOT EXISTS `return_request_alerts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `book_id` INT DEFAULT NULL,
  `user_id` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('pending','approved','declined') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `book_id` (`book_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_return_request_books` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`),
  CONSTRAINT `fk_return_request_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);