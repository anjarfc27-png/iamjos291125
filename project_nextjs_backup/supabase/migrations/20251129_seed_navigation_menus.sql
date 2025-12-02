-- Seed Navigation Menus
-- Inserts default menus if they don't exist

INSERT INTO navigation_menus (title, area_name, menu_type)
VALUES 
    ('Primary Navigation Menu', 'primary', 'default'),
    ('User Navigation Menu', 'user', 'default')
ON CONFLICT DO NOTHING;
-- Note: navigation_menus doesn't have a unique constraint on title/area_name in the original schema, 
-- but we should probably check before inserting to avoid duplicates if we run this multiple times.
-- Since we can't rely on ON CONFLICT without a unique index, let's use a WHERE NOT EXISTS.

INSERT INTO navigation_menus (title, area_name, menu_type)
SELECT 'Primary Navigation Menu', 'primary', 'default'
WHERE NOT EXISTS (
    SELECT 1 FROM navigation_menus WHERE area_name = 'primary'
);

INSERT INTO navigation_menus (title, area_name, menu_type)
SELECT 'User Navigation Menu', 'user', 'default'
WHERE NOT EXISTS (
    SELECT 1 FROM navigation_menus WHERE area_name = 'user'
);
