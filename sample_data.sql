-- ==========================================================================
-- MentorConnect - Realistic Sample / Demo Data Script
-- Database: mentor_connect
-- ==========================================================================

USE mentor_connect;

-- --------------------------------------------------------------------------
-- 1. ALUMNI RECORDS (16 records)
-- --------------------------------------------------------------------------
INSERT INTO alumni (id, name, email, expertise, max_mentees) VALUES
  (2, 'DEVAK G', 'devak.g2025cse@sece.ac.in', 'java', 2),
  (3, 'Sara', 'sara.m@gmail.com', 'MySQL', 3),
  (5, 'Rakesh', 'rakesh@gmail.com', 'python', 4),
  (9, 'Ravi', 'ravi45@gmail.com', 'DBMS', 5),
  (10, 'Arun Kumar', 'arun.kumar@gmail.com', 'Java, Spring Boot, Microservices', 3),
  (11, 'Priya Menon', 'priya.menon@gmail.com', 'Python, Data Science, Machine Learning', 4),
  (12, 'Rahul Sharma', 'rahul.sharma@gmail.com', 'Cloud Computing, AWS, DevOps', 2),
  (13, 'Karthik Raj', 'karthik.raj@gmail.com', 'Web Development, React, Node.js', 3),
  (14, 'Sneha Iyer', 'sneha.iyer@gmail.com', 'Machine Learning, Deep Learning, AI', 3),
  (15, 'Aditya Kumar', 'aditya.kumar@gmail.com', 'Cyber Security, Ethical Hacking, Network Security', 2),
  (16, 'Meera Krishnan', 'meera.krishnan@gmail.com', 'SQL, Database Management, Big Data', 4),
  (17, 'Vignesh R', 'vignesh.r@gmail.com', 'C++, Data Structures, Algorithms', 3),
  (18, 'Ananya S', 'ananya.s@gmail.com', 'Full Stack Development, Java, Angular', 3),
  (19, 'Rohan Patel', 'rohan.patel@gmail.com', 'Mobile Development, Flutter, Android', 2),
  (20, 'Nithya S', 'nithya.s@gmail.com', 'Web Development, UI UX, JavaScript', 4),
  (21, 'Harish Kumar', 'harish.kumar@gmail.com', 'Python, Django, PostgreSQL', 3)
ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), expertise=VALUES(expertise), max_mentees=VALUES(max_mentees);

-- --------------------------------------------------------------------------
-- 2. STUDENT RECORDS (18 records)
-- --------------------------------------------------------------------------
INSERT INTO student (id, name, email, interests) VALUES
  (1, 'Rahul Kumar', 'rahul@gmail.com', 'Java, Spring Boot, MySQL'),
  (2, 'Priya Sharma', 'priya@gmail.com', 'Java, MySQL'),
  (3, 'Vikram Singh', 'vikram@gmail.com', 'Java, Spring Boot'),
  (4, 'Bharathkumar', 'bharath09@gmail.com', 'C++'),
  (6, 'Tharun', 'tharun.d@gmail.com', 'Java, C++'),
  (9, 'Gokul', 'goku07@gmail.com', 'CSS'),
  (10, 'Mohan', 'mohan@gmail.com', 'JavaScript'),
  (11, 'Ananya Raj', 'ananya.raj@gmail.com', 'Machine Learning, Python, Data Science'),
  (12, 'Kavin Kumar', 'kavin.kumar@gmail.com', 'Web Development, JavaScript, React'),
  (13, 'Sneha R', 'sneha.r@gmail.com', 'Java, Spring Boot, SQL'),
  (14, 'Arjun S', 'arjun.s@gmail.com', 'Cloud Computing, AWS, DevOps'),
  (15, 'Meena P', 'meena.p@gmail.com', 'Cyber Security, Network Security'),
  (16, 'Sanjay Kumar', 'sanjay.kumar@gmail.com', 'C++, Data Structures, Algorithms'),
  (17, 'Divya M', 'divya.m@gmail.com', 'Full Stack Development, Java, SQL'),
  (18, 'Deepa Nair', 'deepa.nair@gmail.com', 'Python, Django, Web Development'),
  (19, 'Harish V', 'harish.v@gmail.com', 'Mobile Development, Flutter, Android'),
  (20, 'Pooja Ramesh', 'pooja.ramesh@gmail.com', 'Data Science, Machine Learning, AI'),
  (21, 'Naveen Kumar', 'naveen.kumar@gmail.com', 'Database Management, SQL, Big Data')
ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), interests=VALUES(interests);

-- --------------------------------------------------------------------------
-- 3. MENTORSHIP PAIR RECORDS (13 records)
-- --------------------------------------------------------------------------
INSERT INTO mentorship_pair (id, alumni_id, student_id, status, matched_at) VALUES
  (1, 1, 1, 'ACTIVE', '2026-09-28 11:43:13'),
  (2, 1, 2, 'ACTIVE', '2026-09-28 11:43:58'),
  (4, 3, 3, 'ACTIVE', '2026-09-28 12:25:51'),
  (5, 3, 4, 'ACTIVE', '2026-09-28 12:55:20'),
  (6, 5, 1, 'ACTIVE', '2026-09-28 14:30:47'),
  (8, 3, 3, 'ACTIVE', '2026-09-28 14:40:43'),
  (10, 5, 2, 'ACTIVE', '2026-09-28 14:52:28'),
  (11, 5, 9, 'ACTIVE', '2026-09-28 15:44:49'),
  (12, 9, 10, 'ACTIVE', '2026-09-28 15:50:02'),
  (13, 10, 13, 'ACTIVE', '2026-09-28 22:22:33'),
  (14, 11, 11, 'ACTIVE', '2026-09-28 22:22:33'),
  (15, 13, 12, 'ACTIVE', '2026-09-28 22:22:33'),
  (16, 12, 14, 'ACTIVE', '2026-09-28 22:22:33')
ON DUPLICATE KEY UPDATE alumni_id=VALUES(alumni_id), student_id=VALUES(student_id), status=VALUES(status), matched_at=VALUES(matched_at);

-- --------------------------------------------------------------------------
-- 4. SESSION RECORDS (6 records)
-- --------------------------------------------------------------------------
INSERT INTO session (id, mentorship_pair_id, scheduled_at, status, notes) VALUES
  (1, 1, '2026-10-01 10:00:00', 'SCHEDULED', 'Introduction and goal discussion'),
  (4, 5, '2026-09-30 15:45:00', 'SCHEDULED', 'Future Plans and Development'),
  (5, 12, '2026-10-04 18:52:00', 'SCHEDULED', 'Mentoring'),
  (6, 13, '2026-10-05 14:00:00', 'SCHEDULED', 'Spring Boot architecture and project guidance'),
  (7, 14, '2026-10-06 16:30:00', 'SCHEDULED', 'Python Data Science career roadmap and portfolio review'),
  (8, 15, '2026-09-27 11:00:00', 'COMPLETED', 'React fundamentals and component lifecycle discussion')
ON DUPLICATE KEY UPDATE mentorship_pair_id=VALUES(mentorship_pair_id), scheduled_at=VALUES(scheduled_at), status=VALUES(status), notes=VALUES(notes);
