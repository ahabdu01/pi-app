CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    is_scanned BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE gists (
    id SERIAL PRIMARY KEY,
    gist_id VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    user_id INT NOT NULL,
    is_viewed BOOLEAN DEFAULT FALSE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


INSERT INTO users (username, is_scanned) VALUES ('ahabdu01', false);
