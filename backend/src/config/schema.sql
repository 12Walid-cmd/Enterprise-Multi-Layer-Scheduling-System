--
-- PostgreSQL database dump
--

\restrict ETVwwWWOxeTGkiJkZS8rdVN4ODuVO8pXc4HJlsCgMauacbJIFggbK5dyaqZMuKR

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-04-16 11:36:46

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 7 (class 2615 OID 18484)
-- Name: ems; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA ems;


ALTER SCHEMA ems OWNER TO postgres;

--
-- TOC entry 2 (class 3079 OID 18485)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5498 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 929 (class 1247 OID 18524)
-- Name: working_mode_enum; Type: TYPE; Schema: ems; Owner: postgres
--

CREATE TYPE ems.working_mode_enum AS ENUM (
    'LOCAL',
    'REMOTE',
    'HYBRID'
);


ALTER TYPE ems.working_mode_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 253 (class 1259 OID 19305)
-- Name: account_roles; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.account_roles (
    id integer NOT NULL,
    code character varying(32) NOT NULL,
    name character varying(64) NOT NULL,
    description text
);


ALTER TABLE ems.account_roles OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 19304)
-- Name: account_roles_id_seq; Type: SEQUENCE; Schema: ems; Owner: postgres
--

CREATE SEQUENCE ems.account_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ems.account_roles_id_seq OWNER TO postgres;

--
-- TOC entry 5499 (class 0 OID 0)
-- Dependencies: 252
-- Name: account_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: ems; Owner: postgres
--

ALTER SEQUENCE ems.account_roles_id_seq OWNED BY ems.account_roles.id;


--
-- TOC entry 221 (class 1259 OID 18531)
-- Name: assignments; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    schedule_id uuid NOT NULL,
    rotation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    tier_id uuid,
    assigned_start timestamp with time zone NOT NULL,
    assigned_end timestamp with time zone NOT NULL,
    is_override boolean DEFAULT false,
    override_reason text,
    created_at timestamp with time zone DEFAULT now(),
    assignment_status character varying(30) DEFAULT 'ON_CALL'::character varying NOT NULL
);


ALTER TABLE ems.assignments OWNER TO postgres;

--
-- TOC entry 5500 (class 0 OID 0)
-- Dependencies: 221
-- Name: COLUMN assignments.assignment_status; Type: COMMENT; Schema: ems; Owner: postgres
--

COMMENT ON COLUMN ems.assignments.assignment_status IS 'Defines working context: on-call, working shift, absence, service desk, SPOC IT/CDO, escalation roles.';


--
-- TOC entry 222 (class 1259 OID 18549)
-- Name: audit_logs; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id uuid,
    action character varying(80) NOT NULL,
    entity_type character varying(80) NOT NULL,
    entity_id uuid,
    before_state jsonb,
    after_state jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE ems.audit_logs OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 18561)
-- Name: auth_identities; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.auth_identities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    provider character varying(50) NOT NULL,
    provider_user_id character varying(255),
    password_hash text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE ems.auth_identities OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 18860)
-- Name: cities; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.cities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    province_id uuid NOT NULL,
    name text NOT NULL
);


ALTER TABLE ems.cities OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 18577)
-- Name: conflicts; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.conflicts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    schedule_id uuid,
    rotation_id uuid,
    user_id uuid,
    conflict_type character varying(50) NOT NULL,
    severity character varying(20) DEFAULT 'MEDIUM'::character varying NOT NULL,
    details jsonb,
    status character varying(20) DEFAULT 'OPEN'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    resolved_by uuid,
    resolved_at timestamp with time zone
);


ALTER TABLE ems.conflicts OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 18829)
-- Name: countries; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.countries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL
);


ALTER TABLE ems.countries OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 18592)
-- Name: coverage_gaps; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.coverage_gaps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rotation_id uuid NOT NULL,
    leave_request_id uuid,
    gap_start date NOT NULL,
    gap_end date NOT NULL,
    is_filled boolean DEFAULT false,
    filled_by uuid,
    filled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE ems.coverage_gaps OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 18604)
-- Name: groups; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    timezone character varying(64) DEFAULT 'UTC'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE ems.groups OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 18619)
-- Name: holidays; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.holidays (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid,
    holiday_date date NOT NULL,
    name character varying(255) NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    holiday_type character varying(50) DEFAULT 'OTHER'::character varying
);


ALTER TABLE ems.holidays OWNER TO postgres;

--
-- TOC entry 5501 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN holidays.holiday_type; Type: COMMENT; Schema: ems; Owner: postgres
--

COMMENT ON COLUMN ems.holidays.holiday_type IS 'Holiday classification for geo-specific and business-specific scheduling logic.';


--
-- TOC entry 228 (class 1259 OID 18630)
-- Name: leave_approvals; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.leave_approvals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    leave_request_id uuid NOT NULL,
    approver_id uuid NOT NULL,
    approval_level integer DEFAULT 1 NOT NULL,
    decision character varying(20) NOT NULL,
    decided_at timestamp with time zone DEFAULT now(),
    comment text
);


ALTER TABLE ems.leave_approvals OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 18647)
-- Name: leave_requests; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.leave_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    requested_at timestamp with time zone DEFAULT now(),
    leave_period character varying(20) DEFAULT 'FULL_DAY'::character varying NOT NULL
);


ALTER TABLE ems.leave_requests OWNER TO postgres;

--
-- TOC entry 5502 (class 0 OID 0)
-- Dependencies: 229
-- Name: COLUMN leave_requests.leave_period; Type: COMMENT; Schema: ems; Owner: postgres
--

COMMENT ON COLUMN ems.leave_requests.leave_period IS 'Defines whether leave is full day, morning half-day, or afternoon half-day.';


--
-- TOC entry 230 (class 1259 OID 18664)
-- Name: notifications; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    message text NOT NULL,
    type character varying(50) NOT NULL,
    related_entity_type character varying(80),
    related_entity_id uuid,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE ems.notifications OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 19348)
-- Name: permissions; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.permissions (
    id integer NOT NULL,
    code character varying(64) NOT NULL,
    description text
);


ALTER TABLE ems.permissions OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 19347)
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: ems; Owner: postgres
--

CREATE SEQUENCE ems.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ems.permissions_id_seq OWNER TO postgres;

--
-- TOC entry 5503 (class 0 OID 0)
-- Dependencies: 255
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: ems; Owner: postgres
--

ALTER SEQUENCE ems.permissions_id_seq OWNED BY ems.permissions.id;


--
-- TOC entry 243 (class 1259 OID 18841)
-- Name: provinces; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.provinces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    country_id uuid NOT NULL,
    name text NOT NULL
);


ALTER TABLE ems.provinces OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 19360)
-- Name: role_permissions; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE ems.role_permissions OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 18678)
-- Name: role_types; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.role_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(64) NOT NULL,
    name character varying(128) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE ems.role_types OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 18692)
-- Name: rotation_members; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.rotation_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rotation_id uuid NOT NULL,
    user_id uuid,
    rotation_order integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    team_id uuid,
    member_type character varying(20) DEFAULT 'individual'::character varying,
    CONSTRAINT rotation_members_user_or_team_check CHECK ((((user_id IS NOT NULL) AND (team_id IS NULL)) OR ((user_id IS NULL) AND (team_id IS NOT NULL))))
);


ALTER TABLE ems.rotation_members OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 18706)
-- Name: rotation_scopes; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.rotation_scopes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rotation_id uuid NOT NULL,
    group_id uuid,
    team_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE ems.rotation_scopes OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 19170)
-- Name: rotation_templates; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.rotation_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    rotation_type character varying(100),
    cadence_type character varying(50),
    cadence_interval integer DEFAULT 1,
    min_assignees integer DEFAULT 1,
    is_private boolean DEFAULT false,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE ems.rotation_templates OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 18717)
-- Name: rotation_tier_members; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.rotation_tier_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tier_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rotation_order integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE ems.rotation_tier_members OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 18731)
-- Name: rotation_tiers; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.rotation_tiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rotation_id uuid NOT NULL,
    tier_level integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE ems.rotation_tiers OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 19151)
-- Name: rotation_types; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.rotation_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE ems.rotation_types OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 18743)
-- Name: rotations; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.rotations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    rotation_type character varying(50) NOT NULL,
    group_id uuid,
    team_id uuid,
    cadence_type character varying(50) NOT NULL,
    cadence_interval integer DEFAULT 1 NOT NULL,
    allow_overlap boolean DEFAULT false,
    min_assignees integer DEFAULT 1,
    allow_empty boolean DEFAULT false,
    spans_multiple_teams boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE ems.rotations OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 19222)
-- Name: schedule_overrides; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.schedule_overrides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    rotation_id uuid,
    override_date date NOT NULL,
    chip_cls text NOT NULL,
    chip_label text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE ems.schedule_overrides OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 18761)
-- Name: schedules; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rotation_id uuid NOT NULL,
    window_start date NOT NULL,
    window_end date NOT NULL,
    generated_at timestamp with time zone DEFAULT now(),
    generated_by uuid,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL
);


ALTER TABLE ems.schedules OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 18776)
-- Name: staffing_rules; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.staffing_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rotation_id uuid NOT NULL,
    rule_type character varying(50) NOT NULL,
    rule_config jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE ems.staffing_rules OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 18790)
-- Name: team_members; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.team_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    team_id uuid,
    role_type_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE ems.team_members OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 18803)
-- Name: teams; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.teams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid,
    parent_team_id uuid,
    name character varying(255) NOT NULL,
    description text,
    timezone character varying(64),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    member_count integer DEFAULT 0
);


ALTER TABLE ems.teams OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 19318)
-- Name: user_account_roles; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.user_account_roles (
    user_id uuid NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE ems.user_account_roles OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 19378)
-- Name: user_role_audit_logs; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.user_role_audit_logs (
    id bigint NOT NULL,
    target_user_id uuid NOT NULL,
    target_team_member_id uuid NOT NULL,
    changed_by_user_id uuid,
    changed_by_identifier character varying(255),
    old_role_ids text[] DEFAULT '{}'::text[] NOT NULL,
    new_role_ids text[] DEFAULT '{}'::text[] NOT NULL,
    changed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE ems.user_role_audit_logs OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 19377)
-- Name: user_role_audit_logs_id_seq; Type: SEQUENCE; Schema: ems; Owner: postgres
--

CREATE SEQUENCE ems.user_role_audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ems.user_role_audit_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5504 (class 0 OID 0)
-- Dependencies: 258
-- Name: user_role_audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: ems; Owner: postgres
--

ALTER SEQUENCE ems.user_role_audit_logs_id_seq OWNED BY ems.user_role_audit_logs.id;


--
-- TOC entry 241 (class 1259 OID 18817)
-- Name: user_roles; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role_type_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE ems.user_roles OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 18879)
-- Name: users; Type: TABLE; Schema: ems; Owner: postgres
--

CREATE TABLE ems.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    working_mode ems.working_mode_enum DEFAULT 'LOCAL'::ems.working_mode_enum NOT NULL,
    city_id uuid,
    username character varying(64) DEFAULT ''::character varying
);


ALTER TABLE ems.users OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 19294)
-- Name: login_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_attempts (
    identifier character varying(255) NOT NULL,
    failed_attempts integer DEFAULT 0 NOT NULL,
    lockout_until timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.login_attempts OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 19206)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    email text NOT NULL,
    token text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 19196)
-- Name: temp_passwords; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.temp_passwords (
    email text NOT NULL,
    hash text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    temp_password text
);


ALTER TABLE public.temp_passwords OWNER TO postgres;

--
-- TOC entry 5129 (class 2604 OID 19308)
-- Name: account_roles id; Type: DEFAULT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.account_roles ALTER COLUMN id SET DEFAULT nextval('ems.account_roles_id_seq'::regclass);


--
-- TOC entry 5130 (class 2604 OID 19351)
-- Name: permissions id; Type: DEFAULT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.permissions ALTER COLUMN id SET DEFAULT nextval('ems.permissions_id_seq'::regclass);


--
-- TOC entry 5131 (class 2604 OID 19381)
-- Name: user_role_audit_logs id; Type: DEFAULT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.user_role_audit_logs ALTER COLUMN id SET DEFAULT nextval('ems.user_role_audit_logs_id_seq'::regclass);


--
-- TOC entry 5283 (class 2606 OID 19317)
-- Name: account_roles account_roles_code_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.account_roles
    ADD CONSTRAINT account_roles_code_key UNIQUE (code);


--
-- TOC entry 5285 (class 2606 OID 19315)
-- Name: account_roles account_roles_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.account_roles
    ADD CONSTRAINT account_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5137 (class 2606 OID 18548)
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 5142 (class 2606 OID 18560)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5145 (class 2606 OID 18572)
-- Name: auth_identities auth_identities_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.auth_identities
    ADD CONSTRAINT auth_identities_pkey PRIMARY KEY (id);


--
-- TOC entry 5147 (class 2606 OID 18574)
-- Name: auth_identities auth_identities_provider_provider_user_id_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.auth_identities
    ADD CONSTRAINT auth_identities_provider_provider_user_id_key UNIQUE (provider, provider_user_id);


--
-- TOC entry 5149 (class 2606 OID 18576)
-- Name: auth_identities auth_identities_user_id_provider_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.auth_identities
    ADD CONSTRAINT auth_identities_user_id_provider_key UNIQUE (user_id, provider);


--
-- TOC entry 5256 (class 2606 OID 18870)
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- TOC entry 5152 (class 2606 OID 18591)
-- Name: conflicts conflicts_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.conflicts
    ADD CONSTRAINT conflicts_pkey PRIMARY KEY (id);


--
-- TOC entry 5247 (class 2606 OID 18840)
-- Name: countries countries_name_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.countries
    ADD CONSTRAINT countries_name_key UNIQUE (name);


--
-- TOC entry 5249 (class 2606 OID 18838)
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (id);


--
-- TOC entry 5158 (class 2606 OID 18603)
-- Name: coverage_gaps coverage_gaps_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.coverage_gaps
    ADD CONSTRAINT coverage_gaps_pkey PRIMARY KEY (id);


--
-- TOC entry 5162 (class 2606 OID 18618)
-- Name: groups groups_name_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.groups
    ADD CONSTRAINT groups_name_key UNIQUE (name);


--
-- TOC entry 5164 (class 2606 OID 18616)
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5166 (class 2606 OID 18629)
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- TOC entry 5172 (class 2606 OID 18646)
-- Name: leave_approvals leave_approvals_leave_request_id_approver_id_approval_level_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.leave_approvals
    ADD CONSTRAINT leave_approvals_leave_request_id_approver_id_approval_level_key UNIQUE (leave_request_id, approver_id, approval_level);


--
-- TOC entry 5174 (class 2606 OID 18644)
-- Name: leave_approvals leave_approvals_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.leave_approvals
    ADD CONSTRAINT leave_approvals_pkey PRIMARY KEY (id);


--
-- TOC entry 5177 (class 2606 OID 18663)
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 5180 (class 2606 OID 18677)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5289 (class 2606 OID 19359)
-- Name: permissions permissions_code_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.permissions
    ADD CONSTRAINT permissions_code_key UNIQUE (code);


--
-- TOC entry 5291 (class 2606 OID 19357)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5252 (class 2606 OID 18851)
-- Name: provinces provinces_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.provinces
    ADD CONSTRAINT provinces_pkey PRIMARY KEY (id);


--
-- TOC entry 5293 (class 2606 OID 19366)
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- TOC entry 5182 (class 2606 OID 18691)
-- Name: role_types role_types_code_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.role_types
    ADD CONSTRAINT role_types_code_key UNIQUE (code);


--
-- TOC entry 5184 (class 2606 OID 18689)
-- Name: role_types role_types_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.role_types
    ADD CONSTRAINT role_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5189 (class 2606 OID 18703)
-- Name: rotation_members rotation_members_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_members
    ADD CONSTRAINT rotation_members_pkey PRIMARY KEY (id);


--
-- TOC entry 5191 (class 2606 OID 19148)
-- Name: rotation_members rotation_members_rotation_team_unique; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_members
    ADD CONSTRAINT rotation_members_rotation_team_unique UNIQUE (rotation_id, team_id);


--
-- TOC entry 5193 (class 2606 OID 19146)
-- Name: rotation_members rotation_members_rotation_user_unique; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_members
    ADD CONSTRAINT rotation_members_rotation_user_unique UNIQUE (rotation_id, user_id);


--
-- TOC entry 5198 (class 2606 OID 18714)
-- Name: rotation_scopes rotation_scopes_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_scopes
    ADD CONSTRAINT rotation_scopes_pkey PRIMARY KEY (id);


--
-- TOC entry 5200 (class 2606 OID 18716)
-- Name: rotation_scopes rotation_scopes_rotation_id_group_id_team_id_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_scopes
    ADD CONSTRAINT rotation_scopes_rotation_id_group_id_team_id_key UNIQUE (rotation_id, group_id, team_id);


--
-- TOC entry 5271 (class 2606 OID 19181)
-- Name: rotation_templates rotation_templates_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_templates
    ADD CONSTRAINT rotation_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 5204 (class 2606 OID 18728)
-- Name: rotation_tier_members rotation_tier_members_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_tier_members
    ADD CONSTRAINT rotation_tier_members_pkey PRIMARY KEY (id);


--
-- TOC entry 5206 (class 2606 OID 18730)
-- Name: rotation_tier_members rotation_tier_members_tier_id_user_id_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_tier_members
    ADD CONSTRAINT rotation_tier_members_tier_id_user_id_key UNIQUE (tier_id, user_id);


--
-- TOC entry 5209 (class 2606 OID 18740)
-- Name: rotation_tiers rotation_tiers_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_tiers
    ADD CONSTRAINT rotation_tiers_pkey PRIMARY KEY (id);


--
-- TOC entry 5211 (class 2606 OID 18742)
-- Name: rotation_tiers rotation_tiers_rotation_id_tier_level_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_tiers
    ADD CONSTRAINT rotation_tiers_rotation_id_tier_level_key UNIQUE (rotation_id, tier_level);


--
-- TOC entry 5267 (class 2606 OID 19164)
-- Name: rotation_types rotation_types_name_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_types
    ADD CONSTRAINT rotation_types_name_key UNIQUE (name);


--
-- TOC entry 5269 (class 2606 OID 19162)
-- Name: rotation_types rotation_types_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_types
    ADD CONSTRAINT rotation_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5215 (class 2606 OID 18760)
-- Name: rotations rotations_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotations
    ADD CONSTRAINT rotations_pkey PRIMARY KEY (id);


--
-- TOC entry 5279 (class 2606 OID 19235)
-- Name: schedule_overrides schedule_overrides_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.schedule_overrides
    ADD CONSTRAINT schedule_overrides_pkey PRIMARY KEY (id);


--
-- TOC entry 5221 (class 2606 OID 18773)
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (id);


--
-- TOC entry 5223 (class 2606 OID 18775)
-- Name: schedules schedules_rotation_id_window_start_window_end_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.schedules
    ADD CONSTRAINT schedules_rotation_id_window_start_window_end_key UNIQUE (rotation_id, window_start, window_end);


--
-- TOC entry 5226 (class 2606 OID 18789)
-- Name: staffing_rules staffing_rules_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.staffing_rules
    ADD CONSTRAINT staffing_rules_pkey PRIMARY KEY (id);


--
-- TOC entry 5231 (class 2606 OID 18800)
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- TOC entry 5233 (class 2606 OID 18802)
-- Name: team_members team_members_user_id_team_id_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.team_members
    ADD CONSTRAINT team_members_user_id_team_id_key UNIQUE (user_id, team_id);


--
-- TOC entry 5237 (class 2606 OID 18816)
-- Name: teams teams_group_id_name_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.teams
    ADD CONSTRAINT teams_group_id_name_key UNIQUE (group_id, name);


--
-- TOC entry 5239 (class 2606 OID 18814)
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- TOC entry 5217 (class 2606 OID 19166)
-- Name: rotations unique_rotation_name; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotations
    ADD CONSTRAINT unique_rotation_name UNIQUE (name);


--
-- TOC entry 5259 (class 2606 OID 18872)
-- Name: cities uq_city_per_province; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.cities
    ADD CONSTRAINT uq_city_per_province UNIQUE (province_id, name);


--
-- TOC entry 5254 (class 2606 OID 18853)
-- Name: provinces uq_province_per_country; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.provinces
    ADD CONSTRAINT uq_province_per_country UNIQUE (country_id, name);


--
-- TOC entry 5287 (class 2606 OID 19324)
-- Name: user_account_roles user_account_roles_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.user_account_roles
    ADD CONSTRAINT user_account_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- TOC entry 5295 (class 2606 OID 19394)
-- Name: user_role_audit_logs user_role_audit_logs_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.user_role_audit_logs
    ADD CONSTRAINT user_role_audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5243 (class 2606 OID 18826)
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5245 (class 2606 OID 18828)
-- Name: user_roles user_roles_user_id_role_type_id_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.user_roles
    ADD CONSTRAINT user_roles_user_id_role_type_id_key UNIQUE (user_id, role_type_id);


--
-- TOC entry 5261 (class 2606 OID 18894)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5263 (class 2606 OID 18892)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5265 (class 2606 OID 19286)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5281 (class 2606 OID 19303)
-- Name: login_attempts login_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_attempts
    ADD CONSTRAINT login_attempts_pkey PRIMARY KEY (identifier);


--
-- TOC entry 5276 (class 2606 OID 19215)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (email);


--
-- TOC entry 5274 (class 2606 OID 19205)
-- Name: temp_passwords temp_passwords_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.temp_passwords
    ADD CONSTRAINT temp_passwords_pkey PRIMARY KEY (email);


--
-- TOC entry 5138 (class 1259 OID 18905)
-- Name: idx_assignments_rotation_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_assignments_rotation_id ON ems.assignments USING btree (rotation_id);


--
-- TOC entry 5139 (class 1259 OID 18911)
-- Name: idx_assignments_schedule_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_assignments_schedule_id ON ems.assignments USING btree (schedule_id);


--
-- TOC entry 5140 (class 1259 OID 18917)
-- Name: idx_assignments_tier_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_assignments_tier_id ON ems.assignments USING btree (tier_id);


--
-- TOC entry 5143 (class 1259 OID 18928)
-- Name: idx_audit_logs_actor; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_audit_logs_actor ON ems.audit_logs USING btree (actor_id);


--
-- TOC entry 5150 (class 1259 OID 18934)
-- Name: idx_auth_identities_user_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_auth_identities_user_id ON ems.auth_identities USING btree (user_id);


--
-- TOC entry 5257 (class 1259 OID 18878)
-- Name: idx_cities_province_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_cities_province_id ON ems.cities USING btree (province_id);


--
-- TOC entry 5153 (class 1259 OID 18940)
-- Name: idx_conflicts_resolved_by; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_conflicts_resolved_by ON ems.conflicts USING btree (resolved_by);


--
-- TOC entry 5154 (class 1259 OID 18946)
-- Name: idx_conflicts_rotation_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_conflicts_rotation_id ON ems.conflicts USING btree (rotation_id);


--
-- TOC entry 5155 (class 1259 OID 18952)
-- Name: idx_conflicts_schedule_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_conflicts_schedule_id ON ems.conflicts USING btree (schedule_id);


--
-- TOC entry 5156 (class 1259 OID 18958)
-- Name: idx_conflicts_user_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_conflicts_user_id ON ems.conflicts USING btree (user_id);


--
-- TOC entry 5159 (class 1259 OID 18969)
-- Name: idx_coverage_gaps_leave_request_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_coverage_gaps_leave_request_id ON ems.coverage_gaps USING btree (leave_request_id);


--
-- TOC entry 5160 (class 1259 OID 18975)
-- Name: idx_coverage_gaps_rotation_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_coverage_gaps_rotation_id ON ems.coverage_gaps USING btree (rotation_id);


--
-- TOC entry 5167 (class 1259 OID 18981)
-- Name: idx_holidays_created_by; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_holidays_created_by ON ems.holidays USING btree (created_by);


--
-- TOC entry 5168 (class 1259 OID 18987)
-- Name: idx_holidays_group_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_holidays_group_id ON ems.holidays USING btree (group_id);


--
-- TOC entry 5169 (class 1259 OID 18993)
-- Name: idx_leave_approvals_approver_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_leave_approvals_approver_id ON ems.leave_approvals USING btree (approver_id);


--
-- TOC entry 5170 (class 1259 OID 18999)
-- Name: idx_leave_approvals_leave_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_leave_approvals_leave_id ON ems.leave_approvals USING btree (leave_request_id);


--
-- TOC entry 5175 (class 1259 OID 19005)
-- Name: idx_leave_requests_user_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_leave_requests_user_id ON ems.leave_requests USING btree (user_id);


--
-- TOC entry 5178 (class 1259 OID 19011)
-- Name: idx_notifications_user_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON ems.notifications USING btree (user_id);


--
-- TOC entry 5250 (class 1259 OID 18859)
-- Name: idx_provinces_country_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_provinces_country_id ON ems.provinces USING btree (country_id);


--
-- TOC entry 5185 (class 1259 OID 19017)
-- Name: idx_rotation_members_rotation_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_rotation_members_rotation_id ON ems.rotation_members USING btree (rotation_id);


--
-- TOC entry 5186 (class 1259 OID 19149)
-- Name: idx_rotation_members_team_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_rotation_members_team_id ON ems.rotation_members USING btree (team_id);


--
-- TOC entry 5187 (class 1259 OID 19023)
-- Name: idx_rotation_members_user_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_rotation_members_user_id ON ems.rotation_members USING btree (user_id);


--
-- TOC entry 5194 (class 1259 OID 19029)
-- Name: idx_rotation_scopes_group_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_rotation_scopes_group_id ON ems.rotation_scopes USING btree (group_id);


--
-- TOC entry 5195 (class 1259 OID 19035)
-- Name: idx_rotation_scopes_rotation_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_rotation_scopes_rotation_id ON ems.rotation_scopes USING btree (rotation_id);


--
-- TOC entry 5196 (class 1259 OID 19041)
-- Name: idx_rotation_scopes_team_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_rotation_scopes_team_id ON ems.rotation_scopes USING btree (team_id);


--
-- TOC entry 5201 (class 1259 OID 19047)
-- Name: idx_rotation_tier_members_tier_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_rotation_tier_members_tier_id ON ems.rotation_tier_members USING btree (tier_id);


--
-- TOC entry 5202 (class 1259 OID 19053)
-- Name: idx_rotation_tier_members_user_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_rotation_tier_members_user_id ON ems.rotation_tier_members USING btree (user_id);


--
-- TOC entry 5207 (class 1259 OID 19059)
-- Name: idx_rotation_tiers_rotation_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_rotation_tiers_rotation_id ON ems.rotation_tiers USING btree (rotation_id);


--
-- TOC entry 5212 (class 1259 OID 19065)
-- Name: idx_rotations_group_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_rotations_group_id ON ems.rotations USING btree (group_id);


--
-- TOC entry 5213 (class 1259 OID 19071)
-- Name: idx_rotations_team_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_rotations_team_id ON ems.rotations USING btree (team_id);


--
-- TOC entry 5277 (class 1259 OID 19246)
-- Name: idx_schedule_overrides_date; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_schedule_overrides_date ON ems.schedule_overrides USING btree (override_date);


--
-- TOC entry 5218 (class 1259 OID 19077)
-- Name: idx_schedules_generated_by; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_schedules_generated_by ON ems.schedules USING btree (generated_by);


--
-- TOC entry 5219 (class 1259 OID 19083)
-- Name: idx_schedules_rotation_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_schedules_rotation_id ON ems.schedules USING btree (rotation_id);


--
-- TOC entry 5224 (class 1259 OID 19089)
-- Name: idx_staffing_rules_rotation_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_staffing_rules_rotation_id ON ems.staffing_rules USING btree (rotation_id);


--
-- TOC entry 5227 (class 1259 OID 19095)
-- Name: idx_team_members_role_type_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_team_members_role_type_id ON ems.team_members USING btree (role_type_id);


--
-- TOC entry 5228 (class 1259 OID 19101)
-- Name: idx_team_members_team_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_team_members_team_id ON ems.team_members USING btree (team_id);


--
-- TOC entry 5229 (class 1259 OID 19107)
-- Name: idx_team_members_user_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_team_members_user_id ON ems.team_members USING btree (user_id);


--
-- TOC entry 5234 (class 1259 OID 19113)
-- Name: idx_teams_group_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_teams_group_id ON ems.teams USING btree (group_id);


--
-- TOC entry 5235 (class 1259 OID 19119)
-- Name: idx_teams_parent_team_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_teams_parent_team_id ON ems.teams USING btree (parent_team_id);


--
-- TOC entry 5240 (class 1259 OID 19125)
-- Name: idx_user_roles_role_type_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_user_roles_role_type_id ON ems.user_roles USING btree (role_type_id);


--
-- TOC entry 5241 (class 1259 OID 19131)
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: ems; Owner: postgres
--

CREATE INDEX idx_user_roles_user_id ON ems.user_roles USING btree (user_id);


--
-- TOC entry 5272 (class 1259 OID 19395)
-- Name: temp_passwords_email_uidx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX temp_passwords_email_uidx ON public.temp_passwords USING btree (email);


--
-- TOC entry 5296 (class 2606 OID 18900)
-- Name: assignments assignments_rotation_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.assignments
    ADD CONSTRAINT assignments_rotation_id_fkey FOREIGN KEY (rotation_id) REFERENCES ems.rotations(id) ON DELETE CASCADE;


--
-- TOC entry 5297 (class 2606 OID 18906)
-- Name: assignments assignments_schedule_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.assignments
    ADD CONSTRAINT assignments_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES ems.schedules(id) ON DELETE CASCADE;


--
-- TOC entry 5298 (class 2606 OID 18912)
-- Name: assignments assignments_tier_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.assignments
    ADD CONSTRAINT assignments_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES ems.rotation_tiers(id) ON DELETE SET NULL;


--
-- TOC entry 5299 (class 2606 OID 18918)
-- Name: assignments assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.assignments
    ADD CONSTRAINT assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES ems.users(id) ON DELETE CASCADE;


--
-- TOC entry 5300 (class 2606 OID 18923)
-- Name: audit_logs audit_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.audit_logs
    ADD CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES ems.users(id) ON DELETE SET NULL;


--
-- TOC entry 5301 (class 2606 OID 18929)
-- Name: auth_identities auth_identities_user_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.auth_identities
    ADD CONSTRAINT auth_identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES ems.users(id) ON DELETE CASCADE;


--
-- TOC entry 5337 (class 2606 OID 18873)
-- Name: cities cities_province_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.cities
    ADD CONSTRAINT cities_province_id_fkey FOREIGN KEY (province_id) REFERENCES ems.provinces(id) ON DELETE RESTRICT;


--
-- TOC entry 5302 (class 2606 OID 18935)
-- Name: conflicts conflicts_resolved_by_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.conflicts
    ADD CONSTRAINT conflicts_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES ems.users(id) ON DELETE SET NULL;


--
-- TOC entry 5303 (class 2606 OID 18941)
-- Name: conflicts conflicts_rotation_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.conflicts
    ADD CONSTRAINT conflicts_rotation_id_fkey FOREIGN KEY (rotation_id) REFERENCES ems.rotations(id) ON DELETE SET NULL;


--
-- TOC entry 5304 (class 2606 OID 18947)
-- Name: conflicts conflicts_schedule_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.conflicts
    ADD CONSTRAINT conflicts_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES ems.schedules(id) ON DELETE SET NULL;


--
-- TOC entry 5305 (class 2606 OID 18953)
-- Name: conflicts conflicts_user_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.conflicts
    ADD CONSTRAINT conflicts_user_id_fkey FOREIGN KEY (user_id) REFERENCES ems.users(id) ON DELETE SET NULL;


--
-- TOC entry 5306 (class 2606 OID 18959)
-- Name: coverage_gaps coverage_gaps_filled_by_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.coverage_gaps
    ADD CONSTRAINT coverage_gaps_filled_by_fkey FOREIGN KEY (filled_by) REFERENCES ems.users(id) ON DELETE SET NULL;


--
-- TOC entry 5307 (class 2606 OID 18964)
-- Name: coverage_gaps coverage_gaps_leave_request_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.coverage_gaps
    ADD CONSTRAINT coverage_gaps_leave_request_id_fkey FOREIGN KEY (leave_request_id) REFERENCES ems.leave_requests(id) ON DELETE SET NULL;


--
-- TOC entry 5308 (class 2606 OID 18970)
-- Name: coverage_gaps coverage_gaps_rotation_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.coverage_gaps
    ADD CONSTRAINT coverage_gaps_rotation_id_fkey FOREIGN KEY (rotation_id) REFERENCES ems.rotations(id) ON DELETE CASCADE;


--
-- TOC entry 5309 (class 2606 OID 18976)
-- Name: holidays holidays_created_by_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.holidays
    ADD CONSTRAINT holidays_created_by_fkey FOREIGN KEY (created_by) REFERENCES ems.users(id) ON DELETE SET NULL;


--
-- TOC entry 5310 (class 2606 OID 18982)
-- Name: holidays holidays_group_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.holidays
    ADD CONSTRAINT holidays_group_id_fkey FOREIGN KEY (group_id) REFERENCES ems.groups(id) ON DELETE CASCADE;


--
-- TOC entry 5311 (class 2606 OID 18988)
-- Name: leave_approvals leave_approvals_approver_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.leave_approvals
    ADD CONSTRAINT leave_approvals_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES ems.users(id) ON DELETE CASCADE;


--
-- TOC entry 5312 (class 2606 OID 18994)
-- Name: leave_approvals leave_approvals_leave_request_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.leave_approvals
    ADD CONSTRAINT leave_approvals_leave_request_id_fkey FOREIGN KEY (leave_request_id) REFERENCES ems.leave_requests(id) ON DELETE CASCADE;


--
-- TOC entry 5313 (class 2606 OID 19000)
-- Name: leave_requests leave_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.leave_requests
    ADD CONSTRAINT leave_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES ems.users(id) ON DELETE CASCADE;


--
-- TOC entry 5314 (class 2606 OID 19006)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES ems.users(id) ON DELETE CASCADE;


--
-- TOC entry 5336 (class 2606 OID 18854)
-- Name: provinces provinces_country_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.provinces
    ADD CONSTRAINT provinces_country_id_fkey FOREIGN KEY (country_id) REFERENCES ems.countries(id) ON DELETE RESTRICT;


--
-- TOC entry 5344 (class 2606 OID 19372)
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES ems.permissions(id) ON DELETE CASCADE;


--
-- TOC entry 5345 (class 2606 OID 19367)
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES ems.account_roles(id) ON DELETE CASCADE;


--
-- TOC entry 5315 (class 2606 OID 19012)
-- Name: rotation_members rotation_members_rotation_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_members
    ADD CONSTRAINT rotation_members_rotation_id_fkey FOREIGN KEY (rotation_id) REFERENCES ems.rotations(id) ON DELETE CASCADE;


--
-- TOC entry 5316 (class 2606 OID 19139)
-- Name: rotation_members rotation_members_team_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_members
    ADD CONSTRAINT rotation_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES ems.teams(id) ON DELETE CASCADE;


--
-- TOC entry 5317 (class 2606 OID 19018)
-- Name: rotation_members rotation_members_user_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_members
    ADD CONSTRAINT rotation_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES ems.users(id) ON DELETE CASCADE;


--
-- TOC entry 5318 (class 2606 OID 19024)
-- Name: rotation_scopes rotation_scopes_group_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_scopes
    ADD CONSTRAINT rotation_scopes_group_id_fkey FOREIGN KEY (group_id) REFERENCES ems.groups(id) ON DELETE CASCADE;


--
-- TOC entry 5319 (class 2606 OID 19030)
-- Name: rotation_scopes rotation_scopes_rotation_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_scopes
    ADD CONSTRAINT rotation_scopes_rotation_id_fkey FOREIGN KEY (rotation_id) REFERENCES ems.rotations(id) ON DELETE CASCADE;


--
-- TOC entry 5320 (class 2606 OID 19036)
-- Name: rotation_scopes rotation_scopes_team_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_scopes
    ADD CONSTRAINT rotation_scopes_team_id_fkey FOREIGN KEY (team_id) REFERENCES ems.teams(id) ON DELETE CASCADE;


--
-- TOC entry 5339 (class 2606 OID 19182)
-- Name: rotation_templates rotation_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_templates
    ADD CONSTRAINT rotation_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES ems.users(id) ON DELETE SET NULL;


--
-- TOC entry 5321 (class 2606 OID 19042)
-- Name: rotation_tier_members rotation_tier_members_tier_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_tier_members
    ADD CONSTRAINT rotation_tier_members_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES ems.rotation_tiers(id) ON DELETE CASCADE;


--
-- TOC entry 5322 (class 2606 OID 19048)
-- Name: rotation_tier_members rotation_tier_members_user_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_tier_members
    ADD CONSTRAINT rotation_tier_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES ems.users(id) ON DELETE CASCADE;


--
-- TOC entry 5323 (class 2606 OID 19054)
-- Name: rotation_tiers rotation_tiers_rotation_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotation_tiers
    ADD CONSTRAINT rotation_tiers_rotation_id_fkey FOREIGN KEY (rotation_id) REFERENCES ems.rotations(id) ON DELETE CASCADE;


--
-- TOC entry 5324 (class 2606 OID 19060)
-- Name: rotations rotations_group_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotations
    ADD CONSTRAINT rotations_group_id_fkey FOREIGN KEY (group_id) REFERENCES ems.groups(id) ON DELETE SET NULL;


--
-- TOC entry 5325 (class 2606 OID 19066)
-- Name: rotations rotations_team_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.rotations
    ADD CONSTRAINT rotations_team_id_fkey FOREIGN KEY (team_id) REFERENCES ems.teams(id) ON DELETE SET NULL;


--
-- TOC entry 5340 (class 2606 OID 19241)
-- Name: schedule_overrides schedule_overrides_rotation_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.schedule_overrides
    ADD CONSTRAINT schedule_overrides_rotation_id_fkey FOREIGN KEY (rotation_id) REFERENCES ems.rotations(id) ON DELETE CASCADE;


--
-- TOC entry 5341 (class 2606 OID 19236)
-- Name: schedule_overrides schedule_overrides_user_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.schedule_overrides
    ADD CONSTRAINT schedule_overrides_user_id_fkey FOREIGN KEY (user_id) REFERENCES ems.users(id) ON DELETE CASCADE;


--
-- TOC entry 5326 (class 2606 OID 19072)
-- Name: schedules schedules_generated_by_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.schedules
    ADD CONSTRAINT schedules_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES ems.users(id) ON DELETE SET NULL;


--
-- TOC entry 5327 (class 2606 OID 19078)
-- Name: schedules schedules_rotation_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.schedules
    ADD CONSTRAINT schedules_rotation_id_fkey FOREIGN KEY (rotation_id) REFERENCES ems.rotations(id) ON DELETE CASCADE;


--
-- TOC entry 5328 (class 2606 OID 19084)
-- Name: staffing_rules staffing_rules_rotation_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.staffing_rules
    ADD CONSTRAINT staffing_rules_rotation_id_fkey FOREIGN KEY (rotation_id) REFERENCES ems.rotations(id) ON DELETE CASCADE;


--
-- TOC entry 5329 (class 2606 OID 19090)
-- Name: team_members team_members_role_type_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.team_members
    ADD CONSTRAINT team_members_role_type_id_fkey FOREIGN KEY (role_type_id) REFERENCES ems.role_types(id) ON DELETE SET NULL;


--
-- TOC entry 5330 (class 2606 OID 19096)
-- Name: team_members team_members_team_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.team_members
    ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES ems.teams(id) ON DELETE CASCADE;


--
-- TOC entry 5331 (class 2606 OID 19102)
-- Name: team_members team_members_user_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.team_members
    ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES ems.users(id) ON DELETE CASCADE;


--
-- TOC entry 5332 (class 2606 OID 19108)
-- Name: teams teams_group_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.teams
    ADD CONSTRAINT teams_group_id_fkey FOREIGN KEY (group_id) REFERENCES ems.groups(id) ON DELETE CASCADE;


--
-- TOC entry 5333 (class 2606 OID 19114)
-- Name: teams teams_parent_team_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.teams
    ADD CONSTRAINT teams_parent_team_id_fkey FOREIGN KEY (parent_team_id) REFERENCES ems.teams(id) ON DELETE CASCADE;


--
-- TOC entry 5342 (class 2606 OID 19330)
-- Name: user_account_roles user_account_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.user_account_roles
    ADD CONSTRAINT user_account_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES ems.account_roles(id) ON DELETE CASCADE;


--
-- TOC entry 5343 (class 2606 OID 19325)
-- Name: user_account_roles user_account_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.user_account_roles
    ADD CONSTRAINT user_account_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES ems.team_members(id) ON DELETE CASCADE;


--
-- TOC entry 5334 (class 2606 OID 19120)
-- Name: user_roles user_roles_role_type_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.user_roles
    ADD CONSTRAINT user_roles_role_type_id_fkey FOREIGN KEY (role_type_id) REFERENCES ems.role_types(id) ON DELETE RESTRICT;


--
-- TOC entry 5335 (class 2606 OID 19126)
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES ems.users(id) ON DELETE CASCADE;


--
-- TOC entry 5338 (class 2606 OID 18895)
-- Name: users users_city_id_fkey; Type: FK CONSTRAINT; Schema: ems; Owner: postgres
--

ALTER TABLE ONLY ems.users
    ADD CONSTRAINT users_city_id_fkey FOREIGN KEY (city_id) REFERENCES ems.cities(id);


-- Completed on 2026-04-16 11:36:47

--
-- PostgreSQL database dump complete
--

\unrestrict ETVwwWWOxeTGkiJkZS8rdVN4ODuVO8pXc4HJlsCgMauacbJIFggbK5dyaqZMuKR

