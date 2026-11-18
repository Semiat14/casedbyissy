-- =============================================================================
-- Cased By Issy — limits for the product-images bucket
--
-- Paste into the Supabase SQL Editor and run. Safe to run more than once.
--
-- Storage itself will then refuse any upload over 5 MB, or that isn't a
-- WebP, JPEG or PNG image, even if someone bypasses the admin's own checks.
-- (The admin resizes photos in the browser, so normal uploads are far smaller.)
-- =============================================================================

update storage.buckets
set
  file_size_limit    = 5242880,  -- 5 MB, in bytes
  allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png']
where id = 'product-images';

-- Check the result:
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'product-images';
