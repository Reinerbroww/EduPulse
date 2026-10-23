# RLS Cross-User Test Plan

Prerequisite: migrations applied + 2 test accounts A,B.
Tests: profiles, user_safety_settings (owner-only), topics (read active), profile_topics, learning_goals, study_partner_requests (requester/recipient), study_groups/members, sessions/members, notes/shared, mentor_profiles (verification UPDATE restricted), mentor_services/slots, mentor_bookings (age gate, block), booking_payments (column restrictions), reports (internal notes hidden).
Status: NOT EXECUTED (need live Supabase with 2 auth users). See supabase/migrations_bundle.sql + 007. No claim of cross-user pass without live test.
