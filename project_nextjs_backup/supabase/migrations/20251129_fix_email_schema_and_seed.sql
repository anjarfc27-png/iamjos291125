-- Fix Email Schema and Seed Data
-- Replaces simplified email_templates with OJS-compliant structure

DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS email_template_settings CASCADE;

-- Re-create OJS Tables (from 002_add_missing_ojs_tables.sql)
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID REFERENCES journals(id) ON DELETE CASCADE,
    email_key VARCHAR(255) NOT NULL,
    can_disable BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT TRUE,
    from_role_id BIGINT,
    to_role_id BIGINT,
    stage_id INTEGER,
    seq INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_template_settings (
    email_template_id UUID NOT NULL REFERENCES email_templates(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(5) DEFAULT '',
    PRIMARY KEY (email_template_id, setting_name, locale)
);

CREATE INDEX idx_email_templates_context ON email_templates(context_id);
CREATE INDEX idx_email_template_settings_id ON email_template_settings(email_template_id);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_template_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Simplified for Admin/Site Access)
CREATE POLICY "Admins can do everything on email_templates" ON email_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_account_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can do everything on email_template_settings" ON email_template_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_account_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Public/Auth Read Access (for sending emails)
CREATE POLICY "Authenticated users can read email_templates" ON email_templates
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read email_template_settings" ON email_template_settings
    FOR SELECT USING (auth.role() = 'authenticated');


-- Seed Data Helper Function
CREATE OR REPLACE FUNCTION seed_email_template(
    p_key VARCHAR, 
    p_subject VARCHAR, 
    p_body TEXT, 
    p_description VARCHAR
) RETURNS VOID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO email_templates (email_key, can_edit) 
    VALUES (p_key, TRUE)
    RETURNING id INTO v_id;

    INSERT INTO email_template_settings (email_template_id, setting_name, setting_value, locale)
    VALUES 
        (v_id, 'subject', p_subject, 'en_US'),
        (v_id, 'body', p_body, 'en_US'),
        (v_id, 'description', p_description, 'en_US');
END;
$$ LANGUAGE plpgsql;

-- Seed Default Templates
SELECT seed_email_template(
    'SUBMISSION_ACK',
    'Submission Acknowledgement',
    'Hello {$authorName},<br/><br/>Thank you for submitting the manuscript, "{$submissionTitle}" to {$contextName}. With the online journal management system that we are using, you will be able to track its progress through the editorial process by logging in to the journal web site:<br/><br/>Submission URL: {$submissionUrl}<br/>Username: {$authorUsername}<br/><br/>If you have any questions, please contact me. Thank you for considering this journal as a venue for your work.<br/><br/>{$editorialContactSignature}',
    'Sent to the author when they complete a submission.'
);

SELECT seed_email_template(
    'REVIEW_REQUEST',
    'Article Review Request',
    'Dear {$reviewerName},<br/><br/>I believe that you would serve as an excellent reviewer of the manuscript, "{$submissionTitle}," which has been submitted to {$contextName}. The submission''s abstract is inserted below, and I hope that you will consider undertaking this important task for us.<br/><br/>Please log into the journal web site by {$responseDueDate} to indicate whether you will undertake the review or not, as well as to access the submission and record your review and recommendation. The web site is {$contextUrl}<br/><br/>The review itself is due {$reviewDueDate}.<br/><br/>Submission URL: {$submissionReviewUrl}<br/><br/>Thank you for considering this request.<br/><br/>{$editorialContactSignature}<br/><br/>"{$submissionTitle}"<br/><br/>{$submissionAbstract}',
    'Sent to a reviewer requesting them to review a submission.'
);

SELECT seed_email_template(
    'EDITOR_DECISION_ACCEPT',
    'Editor Decision: Accept Submission',
    '{$authorName}:<br/><br/>We have reached a decision regarding your submission to {$contextName}, "{$submissionTitle}".<br/><br/>Our decision is to: Accept Submission<br/><br/>{$editorialContactSignature}',
    'Sent to the author when the editor accepts their submission.'
);

SELECT seed_email_template(
    'EDITOR_DECISION_DECLINE',
    'Editor Decision: Decline Submission',
    '{$authorName}:<br/><br/>We have reached a decision regarding your submission to {$contextName}, "{$submissionTitle}".<br/><br/>Our decision is to: Decline Submission<br/><br/>{$editorialContactSignature}',
    'Sent to the author when the editor declines their submission.'
);

-- Clean up helper
DROP FUNCTION seed_email_template;
