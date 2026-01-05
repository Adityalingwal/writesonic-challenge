
CREATE TABLE tracking_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(255) NOT NULL,
    primary_brand VARCHAR(255) NOT NULL,
    competitors TEXT[] NOT NULL DEFAULT '{}',
    brands TEXT[] NOT NULL DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    total_prompts INTEGER DEFAULT 0
);

CREATE TABLE prompt (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    prompt_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_session_id
        FOREIGN KEY(session_id)
        REFERENCES tracking_session(id)
        ON DELETE CASCADE
);

CREATE TABLE ai_response (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL,
    session_id UUID NOT NULL,
    raw_response TEXT NOT NULL,
    platform VARCHAR(50) DEFAULT 'chatgpt',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_prompt_id
        FOREIGN KEY(prompt_id)
        REFERENCES prompt(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_session_id
        FOREIGN KEY(session_id)
        REFERENCES tracking_session(id)
        ON DELETE CASCADE
);


CREATE TABLE brand_mention (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL,
    session_id UUID NOT NULL,
    prompt_id UUID NOT NULL,
    brand_name VARCHAR(255) NOT NULL,
    mention_count INTEGER DEFAULT 1,
    context TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_response_id
        FOREIGN KEY(response_id)
        REFERENCES ai_response(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_session_id
        FOREIGN KEY(session_id)
        REFERENCES tracking_session(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_prompt_id
        FOREIGN KEY(prompt_id)
        REFERENCES prompt(id)
        ON DELETE CASCADE
);

CREATE TABLE citation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL,
    session_id UUID NOT NULL,
    url TEXT NOT NULL,
    title VARCHAR(500),
    domain VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_response_id
        FOREIGN KEY(response_id)
        REFERENCES ai_response(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_session_id
        FOREIGN KEY(session_id)
        REFERENCES tracking_session(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_prompt_session ON prompt(session_id);
CREATE INDEX idx_response_session ON ai_response(session_id);
CREATE INDEX idx_response_prompt ON ai_response(prompt_id);
CREATE INDEX idx_mention_session ON brand_mention(session_id);
CREATE INDEX idx_mention_response ON brand_mention(response_id);
CREATE INDEX idx_mention_brand ON brand_mention(brand_name);
CREATE INDEX idx_citation_session ON citation(session_id);
CREATE INDEX idx_citation_response ON citation(response_id);
CREATE INDEX idx_session_status ON tracking_session(status);
CREATE INDEX idx_session_created ON tracking_session(created_at DESC);
