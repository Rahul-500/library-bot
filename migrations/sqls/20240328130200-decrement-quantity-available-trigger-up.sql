CREATE TRIGGER IF NOT EXISTS `decrement_quantity_available` AFTER INSERT ON `issued_books`
FOR EACH ROW
BEGIN
    DECLARE quantity_to_decrement INT;

    SET quantity_to_decrement = 1;

    UPDATE books SET quantity_available = quantity_available - quantity_to_decrement WHERE id = NEW.book_id;
END