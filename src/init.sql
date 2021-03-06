CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  password CHAR(60) NOT NULL
);

CREATE UNIQUE INDEX ON users((lower(email)));

CREATE TABLE morning_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  report_day DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_duration FLOAT(1) NOT NULL,
  sleep_quality INTEGER NOT NULL,
  generic_mood_m INTEGER NOT NULL,
  CONSTRAINT CHK_integers CHECK (sleep_quality >= 1 AND sleep_quality <= 5 AND generic_mood_m >= 1 AND generic_mood_m <= 5)
);

CREATE UNIQUE INDEX ON morning_reports (user_id, report_day);

CREATE TABLE evening_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  report_day DATE NOT NULL DEFAULT CURRENT_DATE,
  sports_duration FLOAT(1) NOT NULL,
  studying_duration FLOAT(1) NOT NULL,
  eating_reg_qual INTEGER NOT NULL,
  generic_mood_e INTEGER NOT NULL,
  CONSTRAINT CHK_integers CHECK (eating_reg_qual >= 1 AND eating_reg_qual <= 5 AND generic_mood_e >= 1 AND generic_mood_e <= 5)
);

CREATE UNIQUE INDEX ON evening_reports (user_id, report_day);