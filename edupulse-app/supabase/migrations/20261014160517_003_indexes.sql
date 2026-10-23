-- Migration 003: Indexes
-- Based on STEP 4 recommendations. Adjust after reviewing actual query patterns.

-- profile_topics: discovery by topic + skill level
CREATE INDEX idx_profile_topics_topic ON public.profile_topics(topic_id, interest_type, skill_level);

-- user_availability: schedule lookup
CREATE INDEX idx_user_availability_user_day ON public.user_availability(user_id, day_of_week);

-- learning_goals: user goals list + topic matching
CREATE INDEX idx_learning_goals_user_status ON public.learning_goals(user_id, status);
CREATE INDEX idx_learning_goals_topic_match ON public.learning_goals(topic_id, status, visibility);

-- study_partner_requests: status pages
CREATE INDEX idx_partner_req_recipient ON public.study_partner_requests(recipient_id, status, created_at);
CREATE INDEX idx_partner_req_requester ON public.study_partner_requests(requester_id, status, created_at);

-- study_group_members: member lists and join requests
CREATE INDEX idx_group_members_group ON public.study_group_members(group_id, status);
CREATE INDEX idx_group_members_user ON public.study_group_members(user_id, status);

-- study_sessions: upcoming sessions
CREATE INDEX idx_study_sessions_starts ON public.study_sessions(starts_at, status);
CREATE INDEX idx_session_members_user ON public.study_session_members(user_id, status);

-- mentor_services: mentor directory filter
CREATE INDEX idx_mentor_services_topic ON public.mentor_services(topic_id, is_active, price_type);

-- mentor_availability_slots: slot search
CREATE INDEX idx_mentor_slots_available ON public.mentor_availability_slots(mentor_id, status, starts_at);

-- mentor_bookings: dashboard for both sides
CREATE INDEX idx_bookings_learner ON public.mentor_bookings(learner_id, status, starts_at);
CREATE INDEX idx_bookings_mentor ON public.mentor_bookings(mentor_id, status, starts_at);

-- user_reports: moderation queue
CREATE INDEX idx_reports_status ON public.user_reports(status, created_at);

-- mentor_profiles: text search via trigram on headline and expertise_summary
CREATE INDEX idx_mentor_profiles_headline_trgm ON public.mentor_profiles USING GIN (headline gin_trgm_ops);
CREATE INDEX idx_mentor_profiles_expertise_trgm ON public.mentor_profiles USING GIN (expertise_summary gin_trgm_ops);
