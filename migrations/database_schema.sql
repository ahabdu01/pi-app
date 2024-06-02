CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    is_scanned BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE IF NOT EXISTS gists (
    id SERIAL PRIMARY KEY,
    gist_id VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    user_id INT NOT NULL,
    is_viewed BOOLEAN DEFAULT FALSE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (id, username, is_scanned) VALUES (1, 'ahabdu01', false) ON CONFLICT DO NOTHING;
