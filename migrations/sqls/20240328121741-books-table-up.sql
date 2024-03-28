CREATE TABLE IF NOT EXISTS `books` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(255) NOT NULL,
  `published_year` INT NOT NULL,
  `quantity_available` INT NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
);
