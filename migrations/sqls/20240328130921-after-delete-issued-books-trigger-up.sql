
CREATE TRIGGER `after_delete_issued_books` AFTER DELETE ON `issued_books`
FOR EACH ROW
BEGIN
    INSERT INTO library_history (user_id, book_id, checked_out)
    VALUES (OLD.user_id, OLD.book_id, OLD.checked_out);
END