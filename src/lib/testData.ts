import type { Candidate, JobDescription } from '@/types/meetingLaunch';

export const testCandidate: Candidate = {
  id: 'cand_001',
  name: 'Ravi Shankar',
  phone: '+91 98765 43210',
  email: 'ravi.shankar@example.com',
  current_company: 'TechCorp India',
  current_role: 'Senior Backend Engineer',
  total_experience_years: 6,
  relevant_experience_years: 5,
  current_location: 'Bengaluru, India',
  current_ctc_lpa: 18,
  expected_ctc_lpa: 24,
  notice_period_days: 30,
};

export const testJD: JobDescription = {
  id: 'jd_001',
  title: 'Backend Engineer',
  client_name: 'FinTech Solutions',
  location: 'Bengaluru, India',
  is_remote: false,
  min_experience_years: 4,
  max_experience_years: 8,
  min_ctc_lpa: 15,
  max_ctc_lpa: 28,
  max_notice_period_days: 60,
  must_have_skills: ['Go', 'PostgreSQL', 'System Design', 'REST APIs'],
  good_to_have_skills: ['Kubernetes', 'Kafka', 'Redis'],
  responsibilities:
    'Design and build scalable backend services. Own end-to-end delivery of features. Collaborate with frontend and data teams. Participate in code reviews and mentorship.',
};
