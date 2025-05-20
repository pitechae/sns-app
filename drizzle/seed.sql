-- Insert records into item_groups table
INSERT INTO item_groups (id, name, code, created_at)
VALUES 
  (lower(hex(randomblob(16))), 'BOY''S POLO SHIRT', 'BPS', unixepoch()),
  (lower(hex(randomblob(16))), 'BOY''S SHORT PANT', 'BSP', unixepoch());
