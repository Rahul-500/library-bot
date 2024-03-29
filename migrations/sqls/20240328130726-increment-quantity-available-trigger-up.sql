
CREATE TRIGGER IF NOT EXISTS `increment_quantity_available` BEFORE DELETE ON `issued_books`
FOR EACH ROW
BEGIN
    DECLARE quantity_to_increment INT;

    SET quantity_to_increment = 1;

    UPDATE books SET quantity_available = quantity_available + quantity_to_increment WHERE id = OLD.book_id;
END