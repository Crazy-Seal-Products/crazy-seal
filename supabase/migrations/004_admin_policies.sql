-- Admin (authenticated staff) read/write access.
-- Only staff members are issued Supabase auth accounts, so the
-- authenticated role is treated as staff.

-- Leads
CREATE POLICY "Authenticated can read leads" ON leads
  FOR SELECT TO authenticated USING (TRUE);

-- Warranty tables
CREATE POLICY "Authenticated can read warranty registrations" ON warranty_registrations
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated can update warranty registrations" ON warranty_registrations
  FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "Authenticated can read warranty transfers" ON warranty_transfers
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated can update warranty transfers" ON warranty_transfers
  FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "Authenticated can read warranty claims" ON warranty_claims
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated can update warranty claims" ON warranty_claims
  FOR UPDATE TO authenticated USING (TRUE);

-- Content requests
CREATE POLICY "Authenticated can read content requests" ON content_requests
  FOR SELECT TO authenticated USING (TRUE);

-- Content management (FAQ + gallery): staff can see and manage everything
CREATE POLICY "Authenticated can read all FAQ items" ON faq_items
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated can manage FAQ items" ON faq_items
  FOR ALL TO authenticated USING (TRUE);

CREATE POLICY "Authenticated can read all gallery images" ON gallery_images
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated can manage gallery images" ON gallery_images
  FOR ALL TO authenticated USING (TRUE);

-- Legacy GF archive (admin browsing)
CREATE POLICY "Authenticated can read legacy GF entries" ON legacy_gf_entries
  FOR SELECT TO authenticated USING (TRUE);
