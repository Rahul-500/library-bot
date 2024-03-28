CREATE TABLE IF NOT EXISTS `library_history` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(255),
  `book_id` INT,
  `checked_out` DATE NOT NULL,
  `returned` DATETIME DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
   FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
   FOREIGN KEY (`book_id`) REFERENCES `books`(`id`)
);