--
-- PostgreSQL database dump
--

-- Dumped from database version 14.7 (Debian 14.7-1.pgdg110+1)
-- Dumped by pg_dump version 15.3

-- Started on 2024-04-12 15:24:22

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


--
-- TOC entry 6 (class 2615 OID 16385)
-- Name: appsession; Type: SCHEMA; Schema: -; Owner: sbaa
--

CREATE SCHEMA appsession;


ALTER SCHEMA appsession OWNER TO sbaa;

--
-- TOC entry 7 (class 2615 OID 16386)
-- Name: pgboss; Type: SCHEMA; Schema: -; Owner: sbaa
--

CREATE SCHEMA pgboss;


ALTER SCHEMA pgboss OWNER TO sbaa;

--
-- TOC entry 8 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: sbaa
--

--CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO sbaa;

--
-- TOC entry 3680 (class 0 OID 0)
-- Dependencies: 8
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: sbaa
--

COMMENT ON SCHEMA public IS 'standard public schema';


-- Extension: citext

CREATE EXTENSION citext	SCHEMA public;


--
-- TOC entry 907 (class 1247 OID 16493)
-- Name: job_state; Type: TYPE; Schema: pgboss; Owner: sbaa
--

CREATE TYPE pgboss.job_state AS ENUM (
    'created',
    'retry',
    'active',
    'completed',
    'expired',
    'cancelled',
    'failed'
);


ALTER TYPE pgboss.job_state OWNER TO sbaa;

--
-- TOC entry 293 (class 1255 OID 26013)
-- Name: array_replace(text[], text, text); Type: FUNCTION; Schema: public; Owner: sbaa
--

CREATE FUNCTION public.array_replace(arr text[], search text, replace text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      DECLARE
          result text[] := '{}';
          item text;
      BEGIN
          FOREACH item IN ARRAY arr LOOP
              result := array_append(result, replace(item, search, replace));
          END LOOP;
          RETURN result;
      END;
      $$;


ALTER FUNCTION public.array_replace(arr text[], search text, replace text) OWNER TO sbaa;

--
-- TOC entry 302 (class 1255 OID 17033)
-- Name: refresh_sync_view(); Type: FUNCTION; Schema: public; Owner: sbaa
--

CREATE FUNCTION public.refresh_sync_view() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.sb_sync_queue;
  RETURN NULL;
END;
$$;


ALTER FUNCTION public.refresh_sync_view() OWNER TO sbaa;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 212 (class 1259 OID 16507)
-- Name: session; Type: TABLE; Schema: appsession; Owner: sbaa
--

CREATE TABLE appsession.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE appsession.session OWNER TO sbaa;

--
-- TOC entry 213 (class 1259 OID 16512)
-- Name: archive; Type: TABLE; Schema: pgboss; Owner: sbaa
--

CREATE TABLE pgboss.archive (
    id uuid NOT NULL,
    name text NOT NULL,
    priority integer NOT NULL,
    data jsonb,
    state pgboss.job_state NOT NULL,
    retrylimit integer NOT NULL,
    retrycount integer NOT NULL,
    retrydelay integer NOT NULL,
    retrybackoff boolean NOT NULL,
    startafter timestamp with time zone NOT NULL,
    startedon timestamp with time zone,
    singletonkey text,
    singletonon timestamp without time zone,
    expirein interval NOT NULL,
    createdon timestamp with time zone NOT NULL,
    completedon timestamp with time zone,
    keepuntil timestamp with time zone NOT NULL,
    on_complete boolean NOT NULL,
    output jsonb,
    archivedon timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE pgboss.archive OWNER TO sbaa;

--
-- TOC entry 214 (class 1259 OID 16518)
-- Name: job; Type: TABLE; Schema: pgboss; Owner: sbaa
--

CREATE TABLE pgboss.job (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    data jsonb,
    state pgboss.job_state DEFAULT 'created'::pgboss.job_state NOT NULL,
    retrylimit integer DEFAULT 0 NOT NULL,
    retrycount integer DEFAULT 0 NOT NULL,
    retrydelay integer DEFAULT 0 NOT NULL,
    retrybackoff boolean DEFAULT false NOT NULL,
    startafter timestamp with time zone DEFAULT now() NOT NULL,
    startedon timestamp with time zone,
    singletonkey text,
    singletonon timestamp without time zone,
    expirein interval DEFAULT '00:15:00'::interval NOT NULL,
    createdon timestamp with time zone DEFAULT now() NOT NULL,
    completedon timestamp with time zone,
    keepuntil timestamp with time zone DEFAULT (now() + '14 days'::interval) NOT NULL,
    on_complete boolean DEFAULT false NOT NULL,
    output jsonb
);


ALTER TABLE pgboss.job OWNER TO sbaa;

--
-- TOC entry 215 (class 1259 OID 16535)
-- Name: schedule; Type: TABLE; Schema: pgboss; Owner: sbaa
--

CREATE TABLE pgboss.schedule (
    name text NOT NULL,
    cron text NOT NULL,
    timezone text,
    data jsonb,
    options jsonb,
    created_on timestamp with time zone DEFAULT now() NOT NULL,
    updated_on timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE pgboss.schedule OWNER TO sbaa;

--
-- TOC entry 216 (class 1259 OID 16542)
-- Name: subscription; Type: TABLE; Schema: pgboss; Owner: sbaa
--

CREATE TABLE pgboss.subscription (
    event text NOT NULL,
    name text NOT NULL,
    created_on timestamp with time zone DEFAULT now() NOT NULL,
    updated_on timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE pgboss.subscription OWNER TO sbaa;

--
-- TOC entry 217 (class 1259 OID 16549)
-- Name: version; Type: TABLE; Schema: pgboss; Owner: sbaa
--

CREATE TABLE pgboss.version (
    version integer NOT NULL,
    maintained_on timestamp with time zone,
    cron_on timestamp with time zone
);


ALTER TABLE pgboss.version OWNER TO sbaa;

--
-- TOC entry 218 (class 1259 OID 26014)
-- Name: edfi_tenant; Type: TABLE; Schema: public; Owner: sbaa
--

CREATE TABLE public.edfi_tenant (
    id integer NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL,
    modified timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" integer,
    "modifiedById" integer,
    name character varying NOT NULL,
    "sbEnvironmentId" integer NOT NULL
);


ALTER TABLE public.edfi_tenant OWNER TO sbaa;

--
-- TOC entry 3682 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN edfi_tenant.name; Type: COMMENT; Schema: public; Owner: sbaa
--

COMMENT ON COLUMN public.edfi_tenant.name IS 'The name used in the tenant management database in StartingBlocks, or "default" for v5/6 environments';


--
-- TOC entry 219 (class 1259 OID 26021)
-- Name: edfi_tenant_id_seq; Type: SEQUENCE; Schema: public; Owner: sbaa
--

CREATE SEQUENCE public.edfi_tenant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.edfi_tenant_id_seq OWNER TO sbaa;

--
-- TOC entry 3683 (class 0 OID 0)
-- Dependencies: 219
-- Name: edfi_tenant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sbaa
--

ALTER SEQUENCE public.edfi_tenant_id_seq OWNED BY public.edfi_tenant.id;


--
-- TOC entry 220 (class 1259 OID 26022)
-- Name: edorg; Type: TABLE; Schema: public; Owner: sbaa
--

CREATE TABLE public.edorg (
    id integer NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL,
    modified timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" integer,
    "modifiedById" integer,
    "odsId" integer NOT NULL,
    "edfiTenantId" integer NOT NULL,
    "parentId" integer,
    "educationOrganizationId" integer NOT NULL,
    "nameOfInstitution" character varying NOT NULL,
    discriminator character varying NOT NULL,
    "odsDbName" character varying NOT NULL,
    "shortNameOfInstitution" character varying,
    "sbEnvironmentId" integer NOT NULL,
    "odsInstanceId" integer
);


ALTER TABLE public.edorg OWNER TO sbaa;

--
-- TOC entry 3684 (class 0 OID 0)
-- Dependencies: 220
-- Name: COLUMN edorg."educationOrganizationId"; Type: COMMENT; Schema: public; Owner: sbaa
--

COMMENT ON COLUMN public.edorg."educationOrganizationId" IS 'Pre-v7/v2, this reliably included the Ods name. In v7/v2 it is no longer alone sufficient as a natural key, and must be combined with an ODS identifier.';


--
-- TOC entry 221 (class 1259 OID 26029)
-- Name: edorg_closure; Type: TABLE; Schema: public; Owner: sbaa
--

CREATE TABLE public.edorg_closure (
    id_ancestor integer NOT NULL,
    id_descendant integer NOT NULL
);


ALTER TABLE public.edorg_closure OWNER TO sbaa;

--
-- TOC entry 222 (class 1259 OID 26032)
-- Name: edorg_id_seq; Type: SEQUENCE; Schema: public; Owner: sbaa
--

CREATE SEQUENCE public.edorg_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.edorg_id_seq OWNER TO sbaa;

--
-- TOC entry 3685 (class 0 OID 0)
-- Dependencies: 222
-- Name: edorg_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sbaa
--

ALTER SEQUENCE public.edorg_id_seq OWNED BY public.edorg.id;


--
-- TOC entry 223 (class 1259 OID 26033)
-- Name: sb_environment; Type: TABLE; Schema: public; Owner: sbaa
--

CREATE TABLE public.sb_environment (
    id integer NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL,
    modified timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" integer,
    "modifiedById" integer,
    "envLabel" character varying,
    name character varying NOT NULL,
    "configPublic" jsonb,
    "configPrivate" jsonb
);


ALTER TABLE public.sb_environment OWNER TO sbaa;

--
-- TOC entry 224 (class 1259 OID 26040)
-- Name: env_nav; Type: VIEW; Schema: public; Owner: sbaa
--

CREATE VIEW public.env_nav AS
 SELECT sb_environment.name AS "sbEnvironmentName",
    sb_environment.id AS "sbEnvironmentId",
    NULL::character varying AS "edfiTenantName",
    NULL::integer AS "edfiTenantId"
   FROM public.sb_environment
UNION
 SELECT sb_environment.name AS "sbEnvironmentName",
    sb_environment.id AS "sbEnvironmentId",
    edfi_tenant.name AS "edfiTenantName",
    edfi_tenant.id AS "edfiTenantId"
   FROM (public.sb_environment
     RIGHT JOIN public.edfi_tenant ON ((sb_environment.id = edfi_tenant."sbEnvironmentId")));


ALTER TABLE public.env_nav OWNER TO sbaa;

--
-- TOC entry 225 (class 1259 OID 26045)
-- Name: migrations; Type: TABLE; Schema: public; Owner: sbaa
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO sbaa;

--
-- TOC entry 226 (class 1259 OID 26050)
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: sbaa
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO sbaa;

--
-- TOC entry 3686 (class 0 OID 0)
-- Dependencies: 226
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sbaa
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 227 (class 1259 OID 26051)
-- Name: ods; Type: TABLE; Schema: public; Owner: sbaa
--

CREATE TABLE public.ods (
    id integer NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL,
    modified timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" integer,
    "modifiedById" integer,
    "edfiTenantId" integer NOT NULL,
    "dbName" character varying NOT NULL,
    "sbEnvironmentId" integer NOT NULL,
    "odsInstanceId" integer,
    "odsInstanceName" character varying
);


ALTER TABLE public.ods OWNER TO sbaa;

--
-- TOC entry 228 (class 1259 OID 26058)
-- Name: ods_id_seq; Type: SEQUENCE; Schema: public; Owner: sbaa
--

CREATE SEQUENCE public.ods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ods_id_seq OWNER TO sbaa;

--
-- TOC entry 3687 (class 0 OID 0)
-- Dependencies: 228
-- Name: ods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sbaa
--

ALTER SEQUENCE public.ods_id_seq OWNED BY public.ods.id;


--
-- TOC entry 229 (class 1259 OID 26059)
-- Name: oidc; Type: TABLE; Schema: public; Owner: sbaa
--

CREATE TABLE public.oidc (
    id integer NOT NULL,
    issuer character varying NOT NULL,
    "clientId" character varying NOT NULL,
    "clientSecret" character varying NOT NULL,
    scope character varying NOT NULL
);


ALTER TABLE public.oidc OWNER TO sbaa;

--
-- TOC entry 230 (class 1259 OID 26064)
-- Name: oidc_id_seq; Type: SEQUENCE; Schema: public; Owner: sbaa
--

CREATE SEQUENCE public.oidc_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.oidc_id_seq OWNER TO sbaa;

--
-- TOC entry 3688 (class 0 OID 0)
-- Dependencies: 230
-- Name: oidc_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sbaa
--

ALTER SEQUENCE public.oidc_id_seq OWNED BY public.oidc.id;


--
-- TOC entry 231 (class 1259 OID 26065)
-- Name: ownership; Type: TABLE; Schema: public; Owner: sbaa
--

CREATE TABLE public.ownership (
    id integer NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL,
    modified timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" integer,
    "modifiedById" integer,
    "teamId" integer NOT NULL,
    "roleId" integer,
    "edfiTenantId" integer,
    "odsId" integer,
    "edorgId" integer,
    "sbEnvironmentId" integer
);


ALTER TABLE public.ownership OWNER TO sbaa;

--
-- TOC entry 232 (class 1259 OID 26070)
-- Name: ownership_id_seq; Type: SEQUENCE; Schema: public; Owner: sbaa
--

CREATE SEQUENCE public.ownership_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ownership_id_seq OWNER TO sbaa;

--
-- TOC entry 3689 (class 0 OID 0)
-- Dependencies: 232
-- Name: ownership_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sbaa
--

ALTER SEQUENCE public.ownership_id_seq OWNED BY public.ownership.id;


--
-- TOC entry 233 (class 1259 OID 26071)
-- Name: ownership_view; Type: VIEW; Schema: public; Owner: sbaa
--

CREATE VIEW public.ownership_view AS
 SELECT ownership.id,
    ownership."teamId",
    ownership."roleId",
        CASE
            WHEN (ownership."edorgId" IS NOT NULL) THEN 'Edorg'::text
            WHEN (ownership."odsId" IS NOT NULL) THEN 'Ods'::text
            WHEN (ownership."edfiTenantId" IS NOT NULL) THEN 'EdfiTenant'::text
            ELSE 'SbEnvironment'::text
        END AS "resourceType",
    ((((sb_environment.name)::text ||
        CASE
            WHEN (edfi_tenant.name IS NOT NULL) THEN (' / '::text || (edfi_tenant.name)::text)
            ELSE ''::text
        END) ||
        CASE
            WHEN (ods."dbName" IS NOT NULL) THEN (' / '::text || (ods."dbName")::text)
            ELSE ''::text
        END) ||
        CASE
            WHEN (edorg."shortNameOfInstitution" IS NOT NULL) THEN (' / '::text || (edorg."shortNameOfInstitution")::text)
            ELSE ''::text
        END) AS "resourceText"
   FROM ((((public.ownership
     LEFT JOIN public.edorg ON ((ownership."edorgId" = edorg.id)))
     LEFT JOIN public.ods ON (((ownership."odsId" = ods.id) OR (edorg."odsId" = ods.id))))
     LEFT JOIN public.edfi_tenant ON (((ownership."edfiTenantId" = edfi_tenant.id) OR (ods."edfiTenantId" = edfi_tenant.id))))
     LEFT JOIN public.sb_environment ON (((ownership."sbEnvironmentId" = sb_environment.id) OR (edfi_tenant."sbEnvironmentId" = sb_environment.id))));


ALTER TABLE public.ownership_view OWNER TO sbaa;

--
-- TOC entry 234 (class 1259 OID 26076)
-- Name: role; Type: TABLE; Schema: public; Owner: sbaa
--

CREATE TABLE public.role (
    id integer NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL,
    modified timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" integer,
    "modifiedById" integer,
    name character varying NOT NULL,
    description character varying,
    "teamId" integer,
    type text NOT NULL,
    "privilegeIds" text[] DEFAULT '{}'::text[] NOT NULL
);


ALTER TABLE public.role OWNER TO sbaa;

--
-- TOC entry 235 (class 1259 OID 26084)
-- Name: role_id_seq; Type: SEQUENCE; Schema: public; Owner: sbaa
--

CREATE SEQUENCE public.role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.role_id_seq OWNER TO sbaa;

--
-- TOC entry 3690 (class 0 OID 0)
-- Dependencies: 235
-- Name: role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sbaa
--

ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;


--
-- TOC entry 236 (class 1259 OID 26085)
-- Name: sb_environment_id_seq; Type: SEQUENCE; Schema: public; Owner: sbaa
--

CREATE SEQUENCE public.sb_environment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sb_environment_id_seq OWNER TO sbaa;

--
-- TOC entry 3691 (class 0 OID 0)
-- Dependencies: 236
-- Name: sb_environment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sbaa
--

ALTER SEQUENCE public.sb_environment_id_seq OWNED BY public.sb_environment.id;


--
-- TOC entry 237 (class 1259 OID 26086)
-- Name: sb_sync_queue; Type: MATERIALIZED VIEW; Schema: public; Owner: sbaa
--

CREATE MATERIALIZED VIEW public.sb_sync_queue AS
 WITH job AS (
         SELECT job_1.id,
            job_1.name,
            job_1.data,
            job_1.state,
            job_1.createdon,
            job_1.completedon,
            job_1.output
           FROM pgboss.job job_1
          WHERE (job_1.name = ANY (ARRAY['sbe-sync'::text, 'edfi-tenant-sync'::text]))
        UNION
         SELECT archive.id,
            archive.name,
            archive.data,
            archive.state,
            archive.createdon,
            archive.completedon,
            archive.output
           FROM pgboss.archive
          WHERE (archive.name = ANY (ARRAY['sbe-sync'::text, 'edfi-tenant-sync'::text]))
        )
 SELECT job.id,
        CASE
            WHEN (job.name = 'sbe-sync'::text) THEN 'SbEnvironment'::text
            ELSE 'EdfiTenant'::text
        END AS type,
    COALESCE(sb_environment.name, edfi_tenant.name, 'resource no longer exists'::character varying) AS name,
    COALESCE(sb_environment.id, edfi_tenant."sbEnvironmentId") AS "sbEnvironmentId",
    edfi_tenant.id AS "edfiTenantId",
    (job.data)::text AS "dataText",
    job.data,
    job.state,
    job.createdon,
    job.completedon,
    job.output,
    ((job.output -> 'hasChanges'::text))::boolean AS "hasChanges"
   FROM ((job
     LEFT JOIN public.sb_environment ON ((((job.data -> 'sbEnvironmentId'::text))::integer = sb_environment.id)))
     LEFT JOIN public.edfi_tenant ON ((((job.data -> 'edfiTenantId'::text))::integer = edfi_tenant.id)))
  WITH NO DATA;


ALTER TABLE public.sb_sync_queue OWNER TO sbaa;

--
-- TOC entry 238 (class 1259 OID 26093)
-- Name: team; Type: TABLE; Schema: public; Owner: sbaa
--

CREATE TABLE public.team (
    id integer NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL,
    modified timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" integer,
    "modifiedById" integer,
    name character varying NOT NULL
);


ALTER TABLE public.team OWNER TO sbaa;

--
-- TOC entry 239 (class 1259 OID 26100)
-- Name: team_id_seq; Type: SEQUENCE; Schema: public; Owner: sbaa
--

CREATE SEQUENCE public.team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.team_id_seq OWNER TO sbaa;

--
-- TOC entry 3692 (class 0 OID 0)
-- Dependencies: 239
-- Name: team_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sbaa
--

ALTER SEQUENCE public.team_id_seq OWNED BY public.team.id;


--
-- TOC entry 240 (class 1259 OID 26101)
-- Name: typeorm_metadata; Type: TABLE; Schema: public; Owner: sbaa
--

CREATE TABLE public.typeorm_metadata (
    type character varying NOT NULL,
    database character varying,
    schema character varying,
    "table" character varying,
    name character varying,
    value text
);


ALTER TABLE public.typeorm_metadata OWNER TO sbaa;

--
-- TOC entry 241 (class 1259 OID 26106)
-- Name: user; Type: TABLE; Schema: public; Owner: sbaa
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL,
    modified timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" integer,
    "modifiedById" integer,
    username public.citext NOT NULL,
    "givenName" character varying,
    "familyName" character varying,
    "roleId" integer,
    "isActive" boolean NOT NULL,
    config text
);


ALTER TABLE public."user" OWNER TO sbaa;

--
-- TOC entry 242 (class 1259 OID 26113)
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: sbaa
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO sbaa;

--
-- TOC entry 3693 (class 0 OID 0)
-- Dependencies: 242
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sbaa
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- TOC entry 243 (class 1259 OID 26114)
-- Name: user_team_membership; Type: TABLE; Schema: public; Owner: sbaa
--

CREATE TABLE public.user_team_membership (
    id integer NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL,
    modified timestamp without time zone DEFAULT now() NOT NULL,
    "createdById" integer,
    "modifiedById" integer,
    "teamId" integer NOT NULL,
    "userId" integer NOT NULL,
    "roleId" integer
);


ALTER TABLE public.user_team_membership OWNER TO sbaa;

--
-- TOC entry 244 (class 1259 OID 26119)
-- Name: user_team_membership_id_seq; Type: SEQUENCE; Schema: public; Owner: sbaa
--

CREATE SEQUENCE public.user_team_membership_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_team_membership_id_seq OWNER TO sbaa;

--
-- TOC entry 3694 (class 0 OID 0)
-- Dependencies: 244
-- Name: user_team_membership_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sbaa
--

ALTER SEQUENCE public.user_team_membership_id_seq OWNED BY public.user_team_membership.id;


--
-- TOC entry 3376 (class 2604 OID 26120)
-- Name: edfi_tenant id; Type: DEFAULT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.edfi_tenant ALTER COLUMN id SET DEFAULT nextval('public.edfi_tenant_id_seq'::regclass);


--
-- TOC entry 3379 (class 2604 OID 26121)
-- Name: edorg id; Type: DEFAULT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.edorg ALTER COLUMN id SET DEFAULT nextval('public.edorg_id_seq'::regclass);


--
-- TOC entry 3385 (class 2604 OID 26122)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 3386 (class 2604 OID 26123)
-- Name: ods id; Type: DEFAULT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ods ALTER COLUMN id SET DEFAULT nextval('public.ods_id_seq'::regclass);


--
-- TOC entry 3389 (class 2604 OID 26124)
-- Name: oidc id; Type: DEFAULT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.oidc ALTER COLUMN id SET DEFAULT nextval('public.oidc_id_seq'::regclass);


--
-- TOC entry 3390 (class 2604 OID 26125)
-- Name: ownership id; Type: DEFAULT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ownership ALTER COLUMN id SET DEFAULT nextval('public.ownership_id_seq'::regclass);


--
-- TOC entry 3393 (class 2604 OID 26126)
-- Name: role id; Type: DEFAULT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.role ALTER COLUMN id SET DEFAULT nextval('public.role_id_seq'::regclass);


--
-- TOC entry 3382 (class 2604 OID 26127)
-- Name: sb_environment id; Type: DEFAULT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.sb_environment ALTER COLUMN id SET DEFAULT nextval('public.sb_environment_id_seq'::regclass);


--
-- TOC entry 3397 (class 2604 OID 26128)
-- Name: team id; Type: DEFAULT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.team ALTER COLUMN id SET DEFAULT nextval('public.team_id_seq'::regclass);


--
-- TOC entry 3400 (class 2604 OID 26129)
-- Name: user id; Type: DEFAULT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- TOC entry 3403 (class 2604 OID 26130)
-- Name: user_team_membership id; Type: DEFAULT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.user_team_membership ALTER COLUMN id SET DEFAULT nextval('public.user_team_membership_id_seq'::regclass);


--
-- TOC entry 3644 (class 0 OID 16507)
-- Dependencies: 212
-- Data for Name: session; Type: TABLE DATA; Schema: appsession; Owner: sbaa
--

COPY appsession.session (sid, sess, expire) FROM stdin;
UhBRab6PFt0VWChbRgJAIKLf-2u1VXTS	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":2,"created":"2024-03-04T03:31:30.619Z","modified":"2024-03-04T03:31:30.619Z","createdById":null,"modifiedById":null,"username":"moreader@example.com","givenName":"Mo","familyName":"Reader","roleId":1,"isActive":true,"config":null,"role":{"id":1,"created":"2024-03-04T03:19:10.930Z","modified":"2024-03-04T03:19:10.930Z","createdById":null,"modifiedById":null,"name":"Tenant user global role","description":"Standard tenant user","teamId":null,"type":"UserGlobal","privilegeIds":["me:read","privilege:read"]},"userTeamMemberships":[{"id":1,"created":"2024-03-04T03:35:26.691Z","modified":"2024-03-04T03:35:26.691Z","createdById":null,"modifiedById":null,"teamId":2,"userId":2,"roleId":7,"role":{"id":7,"created":"2024-03-04T03:19:10.930Z","modified":"2024-03-04T03:19:10.930Z","createdById":null,"modifiedById":null,"name":"Tenant viewer","description":"Tenant viewer","teamId":null,"type":"UserTeam","privilegeIds":["team.ownership:read","team.role:read","team.user:read","team.user-team-membership:read","team.sb-environment.edfi-tenant:read","team.sb-environment.edfi-tenant.vendor:read","team.sb-environment.edfi-tenant.claimset:read","team.sb-environment.edfi-tenant.ods:read","team.sb-environment.edfi-tenant.ods.edorg:read","team.sb-environment.edfi-tenant.ods.edorg.application:read","team.sb-environment:read"]},"team":{"id":2,"created":"2024-03-04T03:30:30.442Z","modified":"2024-03-04T03:30:30.442Z","createdById":null,"modifiedById":null,"name":"Miniscule Oxbow"}}]}}}	2040-01-01 23:59:59.000000
bQDd2KOUIzv-uEbyD_PxLmjcQg4akSXs	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":4,"created":"2024-03-04T03:37:54.281Z","modified":"2024-03-04T03:37:54.281Z","createdById":null,"modifiedById":null,"username":"stateadmin@example.com","givenName":"State","familyName":"Admin","roleId":1,"isActive":true,"config":null,"role":{"id":1,"created":"2024-03-04T03:19:10.930Z","modified":"2024-03-04T03:19:10.930Z","createdById":null,"modifiedById":null,"name":"Tenant user global role","description":"Standard tenant user","teamId":null,"type":"UserGlobal","privilegeIds":["me:read","privilege:read"]},"userTeamMemberships":[{"id":3,"created":"2024-03-04T20:24:11.127Z","modified":"2024-03-04T20:24:11.127Z","createdById":null,"modifiedById":null,"teamId":3,"userId":4,"roleId":6,"role":{"id":6,"created":"2024-03-04T03:19:10.930Z","modified":"2024-03-04T03:19:10.930Z","createdById":null,"modifiedById":null,"name":"Tenant admin","description":"Tenant admin","teamId":null,"type":"UserTeam","privilegeIds":["team.ownership:read","team.role:read","team.role:update","team.role:delete","team.role:create","team.user:read","team.user-team-membership:read","team.user-team-membership:update","team.user-team-membership:delete","team.user-team-membership:create","team.sb-environment.edfi-tenant:read","team.sb-environment.edfi-tenant.vendor:read","team.sb-environment.edfi-tenant.vendor:update","team.sb-environment.edfi-tenant.vendor:delete","team.sb-environment.edfi-tenant.vendor:create","team.sb-environment.edfi-tenant.claimset:read","team.sb-environment.edfi-tenant.claimset:update","team.sb-environment.edfi-tenant.claimset:delete","team.sb-environment.edfi-tenant.claimset:create","team.sb-environment.edfi-tenant.ods:read","team.sb-environment.edfi-tenant.ods.edorg:read","team.sb-environment.edfi-tenant.ods.edorg.application:read","team.sb-environment.edfi-tenant.ods.edorg.application:update","team.sb-environment.edfi-tenant.ods.edorg.application:delete","team.sb-environment.edfi-tenant.ods.edorg.application:create","team.sb-environment.edfi-tenant.ods.edorg.application:reset-credentials","team.sb-environment:read"]},"team":{"id":3,"created":"2024-03-04T03:38:28.422Z","modified":"2024-03-04T03:38:28.422Z","createdById":null,"modifiedById":null,"name":"State Level"}}]}}}	2040-01-01 23:59:59.000000
iOHKzKxsPyc8JJw_pw0cwwutJUJdiZ3e	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":3,"created":"2024-03-04T03:35:45.862Z","modified":"2024-03-04T03:35:45.862Z","createdById":null,"modifiedById":null,"username":"moadmin@example.com","givenName":"Mo","familyName":"Admin","roleId":1,"isActive":true,"config":null,"role":{"id":1,"created":"2024-03-04T03:19:10.930Z","modified":"2024-03-04T03:19:10.930Z","createdById":null,"modifiedById":null,"name":"Tenant user global role","description":"Standard tenant user","teamId":null,"type":"UserGlobal","privilegeIds":["me:read","privilege:read"]},"userTeamMemberships":[{"id":2,"created":"2024-03-04T03:36:04.919Z","modified":"2024-03-04T03:36:04.919Z","createdById":null,"modifiedById":null,"teamId":2,"userId":3,"roleId":6,"role":{"id":6,"created":"2024-03-04T03:19:10.930Z","modified":"2024-03-04T03:19:10.930Z","createdById":null,"modifiedById":null,"name":"Tenant admin","description":"Tenant admin","teamId":null,"type":"UserTeam","privilegeIds":["team.ownership:read","team.role:read","team.role:update","team.role:delete","team.role:create","team.user:read","team.user-team-membership:read","team.user-team-membership:update","team.user-team-membership:delete","team.user-team-membership:create","team.sb-environment.edfi-tenant:read","team.sb-environment.edfi-tenant.vendor:read","team.sb-environment.edfi-tenant.vendor:update","team.sb-environment.edfi-tenant.vendor:delete","team.sb-environment.edfi-tenant.vendor:create","team.sb-environment.edfi-tenant.claimset:read","team.sb-environment.edfi-tenant.claimset:update","team.sb-environment.edfi-tenant.claimset:delete","team.sb-environment.edfi-tenant.claimset:create","team.sb-environment.edfi-tenant.ods:read","team.sb-environment.edfi-tenant.ods.edorg:read","team.sb-environment.edfi-tenant.ods.edorg.application:read","team.sb-environment.edfi-tenant.ods.edorg.application:update","team.sb-environment.edfi-tenant.ods.edorg.application:delete","team.sb-environment.edfi-tenant.ods.edorg.application:create","team.sb-environment.edfi-tenant.ods.edorg.application:reset-credentials","team.sb-environment:read"]},"team":{"id":2,"created":"2024-03-04T03:30:30.442Z","modified":"2024-03-04T03:30:30.442Z","createdById":null,"modifiedById":null,"name":"Miniscule Oxbow"}}]}}}	2040-01-01 23:59:59.000000
P3ENz2CSIraOTT-sSRT4gJyQKV5aOKxE	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":5,"created":"2024-03-05T03:13:44.003Z","modified":"2024-03-05T03:13:44.003Z","createdById":null,"modifiedById":null,"username":"globaladmin@example.com","givenName":"Global","familyName":"Admin","roleId":2,"isActive":true,"config":null,"role":{"id":2,"created":"2024-03-04T03:19:10.930Z","modified":"2024-03-04T03:19:10.930Z","createdById":null,"modifiedById":null,"name":"Global admin","description":"Global admin","teamId":null,"type":"UserGlobal","privilegeIds":["me:read","ownership:read","ownership:update","ownership:delete","ownership:create","role:read","role:update","role:delete","role:create","sb-environment.edfi-tenant:read","sb-environment.edfi-tenant:update","sb-environment.edfi-tenant:delete","sb-environment.edfi-tenant:create","sb-environment.edfi-tenant:refresh-resources","ods:read","edorg:read","privilege:read","user:read","user:update","user:delete","user:create","team:read","team:update","team:delete","team:create","user-team-membership:read","user-team-membership:update","user-team-membership:delete","user-team-membership:create","team.ownership:read","team.role:read","team.role:update","team.role:delete","team.role:create","team.user:read","team.user-team-membership:read","team.user-team-membership:update","team.user-team-membership:delete","team.user-team-membership:create","team.sb-environment.edfi-tenant:read","team.sb-environment.edfi-tenant.vendor:read","team.sb-environment.edfi-tenant.vendor:update","team.sb-environment.edfi-tenant.vendor:delete","team.sb-environment.edfi-tenant.vendor:create","team.sb-environment.edfi-tenant.claimset:read","team.sb-environment.edfi-tenant.claimset:update","team.sb-environment.edfi-tenant.claimset:delete","team.sb-environment.edfi-tenant.claimset:create","team.sb-environment.edfi-tenant.ods:read","team.sb-environment.edfi-tenant.ods.edorg:read","team.sb-environment.edfi-tenant.ods.edorg.application:read","team.sb-environment.edfi-tenant.ods.edorg.application:update","team.sb-environment.edfi-tenant.ods.edorg.application:delete","team.sb-environment.edfi-tenant.ods.edorg.application:create","team.sb-environment.edfi-tenant.ods.edorg.application:reset-credentials","sb-sync-queue:read","sb-sync-queue:archive","sb-environment:read","sb-environment:update","sb-environment:delete","sb-environment:create","sb-environment:refresh-resources","team.sb-environment:read"]}}}}	2040-01-01 23:59:59.000000
BYwFyb1rMAoPQQyeHVYnSdL5pUW6x5Jq	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":6,"created":"2024-03-05T03:46:48.376Z","modified":"2024-03-05T03:46:48.376Z","createdById":null,"modifiedById":null,"username":"mohslite@example.com","givenName":"Mo","familyName":"Hslite","roleId":1,"isActive":true,"config":null,"role":{"id":1,"created":"2024-03-04T03:19:10.930Z","modified":"2024-03-04T03:19:10.930Z","createdById":null,"modifiedById":null,"name":"Tenant user global role","description":"Standard tenant user","teamId":null,"type":"UserGlobal","privilegeIds":["me:read","privilege:read"]},"userTeamMemberships":[{"id":4,"created":"2024-03-05T03:47:04.916Z","modified":"2024-03-05T03:47:04.916Z","createdById":null,"modifiedById":null,"teamId":1,"userId":6,"roleId":9,"role":{"id":9,"created":"2024-03-05T03:44:10.351Z","modified":"2024-03-05T03:44:10.351Z","createdById":null,"modifiedById":null,"name":"Lite","description":"","teamId":null,"type":"UserTeam","privilegeIds":["team.sb-environment:read","me:read","privilege:read","team.sb-environment.edfi-tenant:read","team.sb-environment.edfi-tenant.ods:read","team.sb-environment.edfi-tenant.ods.edorg:read"]},"team":{"id":1,"created":"2024-03-04T03:21:29.704Z","modified":"2024-03-04T10:19:55.804Z","createdById":null,"modifiedById":null,"name":"Miniscule Oxbow HS"}}]}}}	2040-01-01 23:59:59.000000
\.


--
-- TOC entry 3522 (class 0 OID 16549)
-- Dependencies: 217
-- Data for Name: version; Type: TABLE DATA; Schema: pgboss; Owner: sbaa
--

COPY pgboss.version (version, maintained_on, cron_on) FROM stdin;
20	2024-04-12 02:12:01.078516+00	2024-04-12 02:14:04.990907+00
\.


--
-- TOC entry 3605 (class 0 OID 16590)
-- Dependencies: 223
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: sbaa
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1687190483471	Initial1687190483471
2	1687190483472	SbeConfigReorg1687190483472
3	1687466013005	AdOdsNaturalKeyToEdorg1687466013005
4	1687881668666	EducationOrganizationIdToNumber1687881668666
5	1687900131470	UniqueOwnershipConstraints1687900131470
6	1689282856860	EdorgShortname1689282856860
7	1691010443030	OwnershipUniquenessSoftdelete1691010443030
8	1691520653756	AbandonSoftDeletion1691520653756
9	1691694310950	GuaranteeMembershipUniqueness1691694310950
10	1692280869502	AddSeparateSbeNameField1692280869502
11	1692740626759	NewSbSyncQueue1692740626759
12	1693335908870	NullableEnvlabel1693335908870
13	1693514948085	FkOnDeleteTweaks1693514948085
14	1694446892889	FkOnDeleteFix1694446892889
15	1697054661848	LowercaseUniqueUsernames1697054661848
16	1697203599392	Seeding1697203599392
17	1697207080973	RemoveRemainingAppLauncherThings1697207080973
18	1709328882890	V7Changes1709328882890
19	1710178189458	EnvNav1710178189458
20	1710454017707	OdsInstanceName1710454017707
\.


--
-- TOC entry 3620 (class 0 OID 16658)
-- Dependencies: 240
-- Data for Name: typeorm_metadata; Type: TABLE DATA; Schema: public; Owner: sbaa
--

COPY public.typeorm_metadata (type, database, schema, "table", name, value) FROM stdin;
VIEW	\N	public	\N	ownership_view	SELECT ownership."id",\nownership."teamId",\nownership."roleId",\nCASE\n    WHEN "ownership"."edorgId" IS NOT NULL then 'Edorg'\n    WHEN ownership."odsId" IS NOT NULL THEN 'Ods'\n    WHEN ownership."edfiTenantId" IS NOT NULL THEN 'EdfiTenant'\n    ELSE 'SbEnvironment' END "resourceType",\nsb_environment.name ||\nCASE WHEN edfi_tenant."name" IS NOT NULL THEN ' / ' || edfi_tenant."name" ELSE '' END ||\nCASE WHEN ods."dbName" IS NOT NULL THEN ' / ' || ods."dbName" ELSE '' END ||\nCASE\n    WHEN edorg."shortNameOfInstitution" IS NOT NULL THEN ' / ' || edorg."shortNameOfInstitution"\n    ELSE '' END              "resourceText"\nFROM ownership\n  LEFT JOIN edorg ON ownership."edorgId" = edorg.id\n  LEFT JOIN ods ON ownership."odsId" = ods.id OR edorg."odsId" = ods.id\n  LEFT JOIN edfi_tenant ON ownership."edfiTenantId" = edfi_tenant.id OR ods."edfiTenantId" = edfi_tenant.id\n  LEFT JOIN sb_environment ON ownership."sbEnvironmentId" = sb_environment.id or\n                              edfi_tenant."sbEnvironmentId" = sb_environment.id
MATERIALIZED_VIEW	\N	public	\N	sb_sync_queue	with job as (select id, name, data, state, createdon, completedon, output\n    from pgboss.job\n    where name in ('sbe-sync', 'edfi-tenant-sync')\n    union\n    select id, name, data, state, createdon, completedon, output\n    from pgboss.archive\n    where name in ('sbe-sync', 'edfi-tenant-sync'))\nselect job."id",\ncase when job."name" = 'sbe-sync' then 'SbEnvironment' else 'EdfiTenant' end     "type",\ncoalesce(sb_environment."name", edfi_tenant."name", 'resource no longer exists') "name",\ncoalesce(sb_environment."id", edfi_tenant."sbEnvironmentId")                     "sbEnvironmentId",\nedfi_tenant."id"                                                                 "edfiTenantId",\n"data"::text                                                                     "dataText",\ndata,\nstate,\ncreatedon,\ncompletedon,\noutput,\n(job.output -> 'hasChanges')::bool                                               "hasChanges"\nfrom job\nleft join public.sb_environment on (job.data -> 'sbEnvironmentId')::int = sb_environment.id\nleft join public.edfi_tenant on (job.data -> 'edfiTenantId')::int = edfi_tenant.id
VIEW	\N	public	\N	env_nav	select "name" "sbEnvironmentName", "id" "sbEnvironmentId", null "edfiTenantName", null "edfiTenantId"\nfrom sb_environment\nunion\nselect sb_environment."name",\n       sb_environment."id",\n       edfi_tenant."name",\n       edfi_tenant."id"\nfrom sb_environment\n         right join edfi_tenant on sb_environment.id = edfi_tenant."sbEnvironmentId";
\.

-- * * Here's the real test case data

--
-- TOC entry 3600 (class 0 OID 16571)
-- Dependencies: 218
-- Data for Name: edfi_tenant; Type: TABLE DATA; Schema: public; Owner: sbaa
--

COPY public.edfi_tenant (id, created, modified, "createdById", "modifiedById", name, "sbEnvironmentId") FROM stdin;
1	2024-03-03 22:10:35.023074	2024-03-03 22:10:35.023074	\N	\N	tenant1	1
2	2024-03-03 22:10:35.023074	2024-03-03 22:10:35.023074	\N	\N	default	2
\.


--
-- TOC entry 3602 (class 0 OID 16579)
-- Dependencies: 220
-- Data for Name: edorg; Type: TABLE DATA; Schema: public; Owner: sbaa
--

COPY public.edorg (id, created, modified, "createdById", "modifiedById", "odsId", "edfiTenantId", "parentId", "educationOrganizationId", "nameOfInstitution", discriminator, "odsDbName", "shortNameOfInstitution", "sbEnvironmentId", "odsInstanceId") FROM stdin;
1	2024-03-04 04:03:09.619387	2024-03-04 04:03:09.619387	\N	\N	1	1	\N	1	MO District	edfi.LocalEducationAgency	EdFi_Ods	MO	1	1
2	2024-03-04 04:03:09.619387	2024-03-04 04:03:09.619387	\N	\N	1	1	1	11	MO High School	edfi.School	EdFi_Ods	MO HS	1	1
3	2024-03-04 04:03:09.619387	2024-03-04 04:03:09.619387	\N	\N	1	1	1	12	MO Middle School	edfi.School	EdFi_Ods	MO MS	1	1
4	2024-03-04 04:03:09.619387	2024-03-04 04:03:09.619387	\N	\N	2	2	\N	1	MO District	edfi.LocalEducationAgency	EdFi_Ods	MO	2	\N
5	2024-03-04 04:03:09.619387	2024-03-04 04:03:09.619387	\N	\N	2	2	4	11	MO High School	edfi.School	EdFi_Ods	MO HS	2	\N
6	2024-03-04 04:03:09.619387	2024-03-04 04:03:09.619387	\N	\N	2	2	4	12	MO Middle School	edfi.School	EdFi_Ods	MO MS	2	\N
\.


--
-- TOC entry 3603 (class 0 OID 16586)
-- Dependencies: 221
-- Data for Name: edorg_closure; Type: TABLE DATA; Schema: public; Owner: sbaa
--

COPY public.edorg_closure (id_ancestor, id_descendant) FROM stdin;
1	1
2	2
1	2
3	3
1	3
4	4
5	5
4	5
6	6
4	6
\.


--
-- TOC entry 3607 (class 0 OID 16596)
-- Dependencies: 225
-- Data for Name: ods; Type: TABLE DATA; Schema: public; Owner: sbaa
--

COPY public.ods (id, created, modified, "createdById", "modifiedById", "edfiTenantId", "dbName", "sbEnvironmentId", "odsInstanceId", "odsInstanceName") FROM stdin;
1	2024-03-04 03:38:27.627918	2024-03-04 03:38:27.627918	\N	\N	1	EdFi_Ods	1	1	prod
2	2024-03-04 03:38:27.627918	2024-03-04 03:38:27.627918	\N	\N	2	EdFi_Ods	2	\N	\N
\.


--
-- TOC entry 3609 (class 0 OID 16604)
-- Dependencies: 227
-- Data for Name: oidc; Type: TABLE DATA; Schema: public; Owner: sbaa
--

COPY public.oidc (id, issuer, "clientId", "clientSecret", scope) FROM stdin;
\.


--
-- TOC entry 3611 (class 0 OID 16610)
-- Dependencies: 229
-- Data for Name: ownership; Type: TABLE DATA; Schema: public; Owner: sbaa
--

COPY public.ownership (id, created, modified, "createdById", "modifiedById", "teamId", "roleId", "edfiTenantId", "odsId", "edorgId", "sbEnvironmentId") FROM stdin;
1	2024-03-04 03:56:38.938724	2024-03-04 03:56:38.938724	\N	\N	2	5	\N	1	\N	\N
2	2024-03-04 04:20:26.804309	2024-03-04 04:20:26.804309	\N	\N	1	5	\N	\N	2	\N
3	2024-03-04 04:21:25.094605	2024-03-04 04:21:25.094605	\N	\N	3	5	\N	\N	\N	1
4	2024-03-04 03:56:38.938724	2024-03-04 03:56:38.938724	\N	\N	2	5	\N	2	\N	\N
5	2024-03-04 04:20:26.804309	2024-03-04 04:20:26.804309	\N	\N	1	5	\N	\N	5	\N
6	2024-03-04 04:21:25.094605	2024-03-04 04:21:25.094605	\N	\N	3	5	\N	\N	\N	2
\.


--
-- TOC entry 3614 (class 0 OID 16628)
-- Dependencies: 233
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: sbaa
--

COPY public.role (id, created, modified, "createdById", "modifiedById", name, description, "teamId", type, "privilegeIds") FROM stdin;
1	2024-03-03 21:19:10.930893	2024-03-03 21:19:10.930893	\N	\N	Tenant user global role	Standard tenant user	\N	"UserGlobal"	{me:read,privilege:read}
2	2024-03-03 21:19:10.930893	2024-03-03 21:19:10.930893	\N	\N	Global admin	Global admin	\N	"UserGlobal"	{me:read,ownership:read,ownership:update,ownership:delete,ownership:create,role:read,role:update,role:delete,role:create,sb-environment.edfi-tenant:read,sb-environment.edfi-tenant:update,sb-environment.edfi-tenant:delete,sb-environment.edfi-tenant:create,sb-environment.edfi-tenant:refresh-resources,ods:read,edorg:read,privilege:read,user:read,user:update,user:delete,user:create,team:read,team:update,team:delete,team:create,user-team-membership:read,user-team-membership:update,user-team-membership:delete,user-team-membership:create,team.ownership:read,team.role:read,team.role:update,team.role:delete,team.role:create,team.user:read,team.user-team-membership:read,team.user-team-membership:update,team.user-team-membership:delete,team.user-team-membership:create,team.sb-environment.edfi-tenant:read,team.sb-environment.edfi-tenant:create-ods,team.sb-environment.edfi-tenant:delete-ods,team.sb-environment.edfi-tenant.vendor:read,team.sb-environment.edfi-tenant.vendor:update,team.sb-environment.edfi-tenant.vendor:delete,team.sb-environment.edfi-tenant.vendor:create,team.sb-environment.edfi-tenant.claimset:read,team.sb-environment.edfi-tenant.claimset:update,team.sb-environment.edfi-tenant.claimset:delete,team.sb-environment.edfi-tenant.claimset:create,team.sb-environment.edfi-tenant.ods:read,team.sb-environment.edfi-tenant.ods:create-edorg,team.sb-environment.edfi-tenant.ods:delete-edorg,team.sb-environment.edfi-tenant.ods.edorg:read,team.sb-environment.edfi-tenant.ods.edorg.application:read,team.sb-environment.edfi-tenant.ods.edorg.application:update,team.sb-environment.edfi-tenant.ods.edorg.application:delete,team.sb-environment.edfi-tenant.ods.edorg.application:create,team.sb-environment.edfi-tenant.ods.edorg.application:reset-credentials,sb-sync-queue:read,sb-sync-queue:archive,sb-environment:read,sb-environment:update,sb-environment:delete,sb-environment:create,sb-environment:refresh-resources,team.sb-environment:read}
3	2024-03-03 21:19:10.930893	2024-03-03 21:19:10.930893	\N	\N	Global viewer	Global viewer	\N	"UserGlobal"	{me:read,ownership:read,role:read,sb-environment.edfi-tenant:read,ods:read,edorg:read,privilege:read,user:read,team:read,user-team-membership:read,team.ownership:read,team.role:read,team.user:read,team.user-team-membership:read,team.sb-environment.edfi-tenant:read,team.sb-environment.edfi-tenant.vendor:read,team.sb-environment.edfi-tenant.claimset:read,team.sb-environment.edfi-tenant.ods:read,team.sb-environment.edfi-tenant.ods.edorg:read,team.sb-environment.edfi-tenant.ods.edorg.application:read,sb-sync-queue:read,sb-environment:read,team.sb-environment:read}
4	2024-03-03 21:19:10.930893	2024-03-03 21:19:10.930893	\N	\N	Shared-instance ownership	Shared-instance ownership	\N	"ResourceOwnership"	{team.sb-environment.edfi-tenant:read,team.sb-environment.edfi-tenant.vendor:read,team.sb-environment.edfi-tenant.claimset:read,team.sb-environment.edfi-tenant.ods:read,team.sb-environment.edfi-tenant.ods:create-edorg,team.sb-environment.edfi-tenant.ods:delete-edorg,team.sb-environment.edfi-tenant.ods.edorg:read,team.sb-environment.edfi-tenant.ods.edorg.application:read,team.sb-environment.edfi-tenant.ods.edorg.application:update,team.sb-environment.edfi-tenant.ods.edorg.application:delete,team.sb-environment.edfi-tenant.ods.edorg.application:create,team.sb-environment.edfi-tenant.ods.edorg.application:reset-credentials,team.sb-environment:read}
7	2024-03-03 21:19:10.930893	2024-03-03 21:19:10.930893	\N	\N	Tenant viewer	Tenant viewer	\N	"UserTeam"	{team.ownership:read,team.role:read,team.user:read,team.user-team-membership:read,team.sb-environment.edfi-tenant:read,team.sb-environment.edfi-tenant.vendor:read,team.sb-environment.edfi-tenant.claimset:read,team.sb-environment.edfi-tenant.ods:read,team.sb-environment.edfi-tenant.ods.edorg:read,team.sb-environment.edfi-tenant.ods.edorg.application:read,team.sb-environment:read}
5	2024-03-03 21:19:10.930893	2024-03-03 21:19:10.930893	\N	\N	Full ownership	Full ownership	\N	"ResourceOwnership"	{team.sb-environment.edfi-tenant:read,team.sb-environment.edfi-tenant:create-ods,team.sb-environment.edfi-tenant:delete-ods,team.sb-environment.edfi-tenant.vendor:read,team.sb-environment.edfi-tenant.vendor:update,team.sb-environment.edfi-tenant.vendor:delete,team.sb-environment.edfi-tenant.vendor:create,team.sb-environment.edfi-tenant.claimset:read,team.sb-environment.edfi-tenant.claimset:update,team.sb-environment.edfi-tenant.claimset:delete,team.sb-environment.edfi-tenant.claimset:create,team.sb-environment.edfi-tenant.ods:read,team.sb-environment.edfi-tenant.ods:create-edorg,team.sb-environment.edfi-tenant.ods:delete-edorg,team.sb-environment.edfi-tenant.ods.edorg:read,team.sb-environment.edfi-tenant.ods.edorg.application:read,team.sb-environment.edfi-tenant.ods.edorg.application:update,team.sb-environment.edfi-tenant.ods.edorg.application:delete,team.sb-environment.edfi-tenant.ods.edorg.application:create,team.sb-environment.edfi-tenant.ods.edorg.application:reset-credentials,team.sb-environment:read}
6	2024-03-03 21:19:10.930893	2024-03-03 21:19:10.930893	\N	\N	Tenant admin	Tenant admin	\N	"UserTeam"	{team.ownership:read,team.role:read,team.role:update,team.role:delete,team.role:create,team.user:read,team.user-team-membership:read,team.user-team-membership:update,team.user-team-membership:delete,team.user-team-membership:create,team.sb-environment.edfi-tenant:read,team.sb-environment.edfi-tenant:create-ods,team.sb-environment.edfi-tenant:delete-ods,team.sb-environment.edfi-tenant.vendor:read,team.sb-environment.edfi-tenant.vendor:update,team.sb-environment.edfi-tenant.vendor:delete,team.sb-environment.edfi-tenant.vendor:create,team.sb-environment.edfi-tenant.claimset:read,team.sb-environment.edfi-tenant.claimset:update,team.sb-environment.edfi-tenant.claimset:delete,team.sb-environment.edfi-tenant.claimset:create,team.sb-environment.edfi-tenant.ods:read,team.sb-environment.edfi-tenant.ods:create-edorg,team.sb-environment.edfi-tenant.ods:delete-edorg,team.sb-environment.edfi-tenant.ods.edorg:read,team.sb-environment.edfi-tenant.ods.edorg.application:read,team.sb-environment.edfi-tenant.ods.edorg.application:update,team.sb-environment.edfi-tenant.ods.edorg.application:delete,team.sb-environment.edfi-tenant.ods.edorg.application:create,team.sb-environment.edfi-tenant.ods.edorg.application:reset-credentials,team.sb-environment:read}
8	2024-03-03 21:19:10.930893	2024-03-03 21:19:10.930893	\N	\N	Standard tenant access	Tenant user	\N	"UserTeam"	{team.ownership:read,team.role:read,team.user:read,team.user-team-membership:read,team.sb-environment.edfi-tenant:read,team.sb-environment.edfi-tenant.vendor:read,team.sb-environment.edfi-tenant.claimset:read,team.sb-environment.edfi-tenant.ods:read,team.sb-environment.edfi-tenant.ods.edorg:read,team.sb-environment.edfi-tenant.ods.edorg.application:read,team.sb-environment.edfi-tenant.ods.edorg.application:update,team.sb-environment.edfi-tenant.ods.edorg.application:delete,team.sb-environment.edfi-tenant.ods.edorg.application:create,team.sb-environment.edfi-tenant.ods.edorg.application:reset-credentials,team.sb-environment:read}
9	2024-03-04 21:44:10.351226	2024-03-04 21:44:10.351226	\N	\N	Lite		\N	"UserTeam"	{team.sb-environment:read,me:read,privilege:read,team.sb-environment.edfi-tenant:read,team.sb-environment.edfi-tenant.ods:read,team.sb-environment.edfi-tenant.ods.edorg:read}
\.


--
-- TOC entry 3613 (class 0 OID 16616)
-- Dependencies: 231
-- Data for Name: sb_environment; Type: TABLE DATA; Schema: public; Owner: sbaa
--

COPY public.sb_environment (id, created, modified, "createdById", "modifiedById", "envLabel", name, "configPublic", "configPrivate") FROM stdin;
1	2024-03-03 22:00:34.453614	2024-03-04 03:35:04.779177	\N	\N	\N	State Level EdFi this year v7	{"values": {"tenants": {"tenant1": {"adminApiKey": "252bd79f5caf6276e89e10a2"}}, "edfiHostname": "http://localhost:4444/v7-api"}, "version": "v2", "adminApiUrl": "https://localhost:4444/v7-adminapi"}	{"encrypted": "wPJx3/oOn0eOs0fc1r44lF01PETv8Ibc1jor9bumf2RdCxD2nK3bVMZ6KoMRS9n/JueN6JWf7fdnwN2cTwfIEFzVZrTl5ioxcI905c9+CsPhbtcAogCLO80ojrIzxsezhpMcJV+BbDr7fSTaCjICJGfTb5IOfcjsIYEznzlSfQDFwr+ImQO1lkZgRb6KqMsKwQklzppmcITVbRMITZR2PA=="}
2	2024-03-03 22:00:34.453614	2024-03-04 03:35:04.779177	\N	\N	\N	State Level EdFi last year v6	{"values": {"adminApiKey": "252bd79f5caf6276e89e10a2", "edfiHostname": "http://localhost:4443/v6-api", "adminApiUrl": "https://localhost:4443/v6-adminapi"}, "version": "v1", "adminApiUrl": "https://localhost:4443/v6-adminapi"}	{"encrypted": "zKiRzK4NBTpmg7tS7h9Kgq/m1/RLywKIJUW1XA2GXVbcNjD0rYtyYg7g6lgZ19XyUMVHvg7Gu2fmMTqMDbuU1xY2ijaMA1flqoF9PshhVGQlMJqrOdYhR02J0oPIwJdEw6SZJxWmQChi2ZsfT79pbRq8D9l4yzk8t63rnzsCqOY="}
\.


--
-- TOC entry 3618 (class 0 OID 16650)
-- Dependencies: 238
-- Data for Name: team; Type: TABLE DATA; Schema: public; Owner: sbaa
--

COPY public.team (id, created, modified, "createdById", "modifiedById", name) FROM stdin;
2	2024-03-03 21:30:30.442804	2024-03-03 21:30:30.442804	\N	\N	Miniscule Oxbow
3	2024-03-03 21:38:28.422059	2024-03-03 21:38:28.422059	\N	\N	State Level
1	2024-03-03 21:21:29.704129	2024-03-04 04:19:55.804098	\N	\N	Miniscule Oxbow HS
\.


--
-- TOC entry 3621 (class 0 OID 16663)
-- Dependencies: 241
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: sbaa
--

COPY public."user" (id, created, modified, "createdById", "modifiedById", username, "givenName", "familyName", "roleId", "isActive", config) FROM stdin;
3	2024-03-03 21:35:45.862091	2024-03-03 21:35:45.862091	\N	\N	moadmin@example.com	Mo	Admin	1	t	\N
2	2024-03-03 21:31:30.61979	2024-03-03 21:31:30.61979	\N	\N	moreader@example.com	Mo	Reader	1	t	\N
4	2024-03-03 21:37:54.281112	2024-03-03 21:37:54.281112	\N	\N	stateadmin@example.com	State	Admin	1	t	\N
5	2024-03-04 21:13:44.003656	2024-03-04 21:13:44.003656	\N	\N	globaladmin@example.com	Global	Admin	2	t	\N
6	2024-03-04 21:46:48.376638	2024-03-04 21:46:48.376638	\N	\N	mohslite@example.com	Mo	Hslite	1	t	\N
\.


--
-- TOC entry 3623 (class 0 OID 16671)
-- Dependencies: 243
-- Data for Name: user_team_membership; Type: TABLE DATA; Schema: public; Owner: sbaa
--

COPY public.user_team_membership (id, created, modified, "createdById", "modifiedById", "teamId", "userId", "roleId") FROM stdin;
1	2024-03-03 21:35:26.691797	2024-03-03 21:35:26.691797	\N	\N	2	2	7
2	2024-03-03 21:36:04.919729	2024-03-03 21:36:04.919729	\N	\N	2	3	6
3	2024-03-04 14:24:11.127022	2024-03-04 14:24:11.127022	\N	\N	3	4	6
4	2024-03-04 21:47:04.916344	2024-03-04 21:47:04.916344	\N	\N	1	6	9
\.

--
-- TOC entry 3695 (class 0 OID 0)
-- Dependencies: 219
-- Name: edfi_tenant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sbaa
--

SELECT pg_catalog.setval('public.edfi_tenant_id_seq', 80, true);


--
-- TOC entry 3696 (class 0 OID 0)
-- Dependencies: 222
-- Name: edorg_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sbaa
--

SELECT pg_catalog.setval('public.edorg_id_seq', 11746, true);


--
-- TOC entry 3697 (class 0 OID 0)
-- Dependencies: 226
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sbaa
--

SELECT pg_catalog.setval('public.migrations_id_seq', 20, true);


--
-- TOC entry 3698 (class 0 OID 0)
-- Dependencies: 228
-- Name: ods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sbaa
--

SELECT pg_catalog.setval('public.ods_id_seq', 1427, true);


--
-- TOC entry 3699 (class 0 OID 0)
-- Dependencies: 230
-- Name: oidc_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sbaa
--

SELECT pg_catalog.setval('public.oidc_id_seq', 1, true);


--
-- TOC entry 3700 (class 0 OID 0)
-- Dependencies: 232
-- Name: ownership_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sbaa
--

SELECT pg_catalog.setval('public.ownership_id_seq', 73, true);


--
-- TOC entry 3701 (class 0 OID 0)
-- Dependencies: 235
-- Name: role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sbaa
--

SELECT pg_catalog.setval('public.role_id_seq', 14, true);


--
-- TOC entry 3702 (class 0 OID 0)
-- Dependencies: 236
-- Name: sb_environment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sbaa
--

SELECT pg_catalog.setval('public.sb_environment_id_seq', 50, true);


--
-- TOC entry 3703 (class 0 OID 0)
-- Dependencies: 239
-- Name: team_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sbaa
--

SELECT pg_catalog.setval('public.team_id_seq', 16, true);


--
-- TOC entry 3704 (class 0 OID 0)
-- Dependencies: 242
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sbaa
--

SELECT pg_catalog.setval('public.user_id_seq', 25, true);


--
-- TOC entry 3705 (class 0 OID 0)
-- Dependencies: 244
-- Name: user_team_membership_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sbaa
--

SELECT pg_catalog.setval('public.user_team_membership_id_seq', 28, true);


--
-- TOC entry 3408 (class 2606 OID 16658)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: appsession; Owner: sbaa
--

ALTER TABLE ONLY appsession.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 3414 (class 2606 OID 16660)
-- Name: job job_pkey; Type: CONSTRAINT; Schema: pgboss; Owner: sbaa
--

ALTER TABLE ONLY pgboss.job
    ADD CONSTRAINT job_pkey PRIMARY KEY (id);


--
-- TOC entry 3420 (class 2606 OID 16662)
-- Name: schedule schedule_pkey; Type: CONSTRAINT; Schema: pgboss; Owner: sbaa
--

ALTER TABLE ONLY pgboss.schedule
    ADD CONSTRAINT schedule_pkey PRIMARY KEY (name);


--
-- TOC entry 3422 (class 2606 OID 16664)
-- Name: subscription subscription_pkey; Type: CONSTRAINT; Schema: pgboss; Owner: sbaa
--

ALTER TABLE ONLY pgboss.subscription
    ADD CONSTRAINT subscription_pkey PRIMARY KEY (event, name);


--
-- TOC entry 3424 (class 2606 OID 16666)
-- Name: version version_pkey; Type: CONSTRAINT; Schema: pgboss; Owner: sbaa
--

ALTER TABLE ONLY pgboss.version
    ADD CONSTRAINT version_pkey PRIMARY KEY (version);


--
-- TOC entry 3426 (class 2606 OID 26133)
-- Name: edfi_tenant PK_4ab896e8044a62fcb3d2adb2957; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.edfi_tenant
    ADD CONSTRAINT "PK_4ab896e8044a62fcb3d2adb2957" PRIMARY KEY (id);


--
-- TOC entry 3442 (class 2606 OID 26135)
-- Name: oidc PK_532548120e364bf777d351c46b0; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.oidc
    ADD CONSTRAINT "PK_532548120e364bf777d351c46b0" PRIMARY KEY (id);


--
-- TOC entry 3440 (class 2606 OID 26137)
-- Name: ods PK_85909268d35d1e1b470fd8706d7; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ods
    ADD CONSTRAINT "PK_85909268d35d1e1b470fd8706d7" PRIMARY KEY (id);


--
-- TOC entry 3438 (class 2606 OID 26139)
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- TOC entry 3428 (class 2606 OID 26141)
-- Name: edorg PK_8ff8cd575c93fd763da4020d0bb; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.edorg
    ADD CONSTRAINT "PK_8ff8cd575c93fd763da4020d0bb" PRIMARY KEY (id);


--
-- TOC entry 3461 (class 2606 OID 26143)
-- Name: user_team_membership PK_9bea2e1d154a4955c5de1d08473; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.user_team_membership
    ADD CONSTRAINT "PK_9bea2e1d154a4955c5de1d08473" PRIMARY KEY (id);


--
-- TOC entry 3436 (class 2606 OID 26145)
-- Name: sb_environment PK_9f51231184c890eb1d5b9d01758; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.sb_environment
    ADD CONSTRAINT "PK_9f51231184c890eb1d5b9d01758" PRIMARY KEY (id);


--
-- TOC entry 3454 (class 2606 OID 26147)
-- Name: role PK_b36bcfe02fc8de3c57a8b2391c2; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY (id);


--
-- TOC entry 3434 (class 2606 OID 26149)
-- Name: edorg_closure PK_b515d3f3a0246481749362eec94; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.edorg_closure
    ADD CONSTRAINT "PK_b515d3f3a0246481749362eec94" PRIMARY KEY (id_ancestor, id_descendant);


--
-- TOC entry 3459 (class 2606 OID 26151)
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- TOC entry 3456 (class 2606 OID 26153)
-- Name: team PK_da8c6efd67bb301e810e56ac139; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.team
    ADD CONSTRAINT "PK_da8c6efd67bb301e810e56ac139" PRIMARY KEY (id);


--
-- TOC entry 3444 (class 2606 OID 26155)
-- Name: ownership PK_f911f1e192c37beebcf9ef2f756; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ownership
    ADD CONSTRAINT "PK_f911f1e192c37beebcf9ef2f756" PRIMARY KEY (id);


--
-- TOC entry 3446 (class 2606 OID 26157)
-- Name: ownership UQ_0796c30d643a13b0a5489e1f7c3; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ownership
    ADD CONSTRAINT "UQ_0796c30d643a13b0a5489e1f7c3" UNIQUE ("teamId", "edfiTenantId");


--
-- TOC entry 3430 (class 2606 OID 26159)
-- Name: edorg UQ_33c75697e30842d2559e910ffef; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.edorg
    ADD CONSTRAINT "UQ_33c75697e30842d2559e910ffef" UNIQUE ("edfiTenantId", "odsId", "educationOrganizationId");


--
-- TOC entry 3448 (class 2606 OID 26161)
-- Name: ownership UQ_99758503ba9f18ec99ab8d72384; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ownership
    ADD CONSTRAINT "UQ_99758503ba9f18ec99ab8d72384" UNIQUE ("teamId", "sbEnvironmentId");


--
-- TOC entry 3450 (class 2606 OID 26163)
-- Name: ownership UQ_dc1f1ddb60cb2358f424909bf7c; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ownership
    ADD CONSTRAINT "UQ_dc1f1ddb60cb2358f424909bf7c" UNIQUE ("teamId", "odsId");


--
-- TOC entry 3452 (class 2606 OID 26165)
-- Name: ownership UQ_dd40433e091e5d45bec9b801d28; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ownership
    ADD CONSTRAINT "UQ_dd40433e091e5d45bec9b801d28" UNIQUE ("teamId", "edorgId");


--
-- TOC entry 3463 (class 2606 OID 26167)
-- Name: user_team_membership UQ_fd1dcfae7e73c3d52a4b2d9df5e; Type: CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.user_team_membership
    ADD CONSTRAINT "UQ_fd1dcfae7e73c3d52a4b2d9df5e" UNIQUE ("teamId", "userId");


--
-- TOC entry 3406 (class 1259 OID 16703)
-- Name: IDX_session_expire; Type: INDEX; Schema: appsession; Owner: sbaa
--

CREATE INDEX "IDX_session_expire" ON appsession.session USING btree (expire);


--
-- TOC entry 3409 (class 1259 OID 16704)
-- Name: archive_archivedon_idx; Type: INDEX; Schema: pgboss; Owner: sbaa
--

CREATE INDEX archive_archivedon_idx ON pgboss.archive USING btree (archivedon);


--
-- TOC entry 3410 (class 1259 OID 16705)
-- Name: archive_id_idx; Type: INDEX; Schema: pgboss; Owner: sbaa
--

CREATE INDEX archive_id_idx ON pgboss.archive USING btree (id);


--
-- TOC entry 3411 (class 1259 OID 16706)
-- Name: job_fetch; Type: INDEX; Schema: pgboss; Owner: sbaa
--

CREATE INDEX job_fetch ON pgboss.job USING btree (name text_pattern_ops, startafter) WHERE (state < 'active'::pgboss.job_state);


--
-- TOC entry 3412 (class 1259 OID 16707)
-- Name: job_name; Type: INDEX; Schema: pgboss; Owner: sbaa
--

CREATE INDEX job_name ON pgboss.job USING btree (name text_pattern_ops);


--
-- TOC entry 3415 (class 1259 OID 16708)
-- Name: job_singleton_queue; Type: INDEX; Schema: pgboss; Owner: sbaa
--

CREATE UNIQUE INDEX job_singleton_queue ON pgboss.job USING btree (name, singletonkey) WHERE ((state < 'active'::pgboss.job_state) AND (singletonon IS NULL) AND (singletonkey ~~ '\_\_pgboss\_\_singleton\_queue%'::text));


--
-- TOC entry 3416 (class 1259 OID 16709)
-- Name: job_singletonkey; Type: INDEX; Schema: pgboss; Owner: sbaa
--

CREATE UNIQUE INDEX job_singletonkey ON pgboss.job USING btree (name, singletonkey) WHERE ((state < 'completed'::pgboss.job_state) AND (singletonon IS NULL) AND (NOT (singletonkey ~~ '\_\_pgboss\_\_singleton\_queue%'::text)));


--
-- TOC entry 3417 (class 1259 OID 16710)
-- Name: job_singletonkeyon; Type: INDEX; Schema: pgboss; Owner: sbaa
--

CREATE UNIQUE INDEX job_singletonkeyon ON pgboss.job USING btree (name, singletonon, singletonkey) WHERE (state < 'expired'::pgboss.job_state);


--
-- TOC entry 3418 (class 1259 OID 16711)
-- Name: job_singletonon; Type: INDEX; Schema: pgboss; Owner: sbaa
--

CREATE UNIQUE INDEX job_singletonon ON pgboss.job USING btree (name, singletonon) WHERE ((state < 'expired'::pgboss.job_state) AND (singletonkey IS NULL));


--
-- TOC entry 3431 (class 1259 OID 26168)
-- Name: IDX_535b90f37f800a350ce4de5b90; Type: INDEX; Schema: public; Owner: sbaa
--

CREATE INDEX "IDX_535b90f37f800a350ce4de5b90" ON public.edorg_closure USING btree (id_descendant);


--
-- TOC entry 3457 (class 1259 OID 26169)
-- Name: IDX_78a916df40e02a9deb1c4b75ed; Type: INDEX; Schema: public; Owner: sbaa
--

CREATE UNIQUE INDEX "IDX_78a916df40e02a9deb1c4b75ed" ON public."user" USING btree (username);


--
-- TOC entry 3432 (class 1259 OID 26170)
-- Name: IDX_b67fab0829f3b586fc9cd24cb9; Type: INDEX; Schema: public; Owner: sbaa
--

CREATE INDEX "IDX_b67fab0829f3b586fc9cd24cb9" ON public.edorg_closure USING btree (id_ancestor);


--
-- TOC entry 3500 (class 2620 OID 17035)
-- Name: job sb_sync_queue_refresh_delete; Type: TRIGGER; Schema: pgboss; Owner: sbaa
--

CREATE TRIGGER sb_sync_queue_refresh_delete AFTER DELETE ON pgboss.job FOR EACH ROW WHEN (((old.name = 'sbe-sync'::text) OR (old.name = 'edfi-tenant-sync'::text))) EXECUTE FUNCTION public.refresh_sync_view();


--
-- TOC entry 3501 (class 2620 OID 17034)
-- Name: job sb_sync_queue_refresh_insert_update; Type: TRIGGER; Schema: pgboss; Owner: sbaa
--

CREATE TRIGGER sb_sync_queue_refresh_insert_update AFTER INSERT OR UPDATE ON pgboss.job FOR EACH ROW WHEN (((new.name = 'sbe-sync'::text) OR (new.name = 'edfi-tenant-sync'::text))) EXECUTE FUNCTION public.refresh_sync_view();


--
-- TOC entry 3479 (class 2606 OID 26171)
-- Name: ownership FK_091071fb2770f4bf2e3192e6192; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ownership
    ADD CONSTRAINT "FK_091071fb2770f4bf2e3192e6192" FOREIGN KEY ("edorgId") REFERENCES public.edorg(id) ON DELETE CASCADE;


--
-- TOC entry 3476 (class 2606 OID 26176)
-- Name: ods FK_21f00024e194f67e9f51575f750; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ods
    ADD CONSTRAINT "FK_21f00024e194f67e9f51575f750" FOREIGN KEY ("edfiTenantId") REFERENCES public.edfi_tenant(id) ON DELETE CASCADE;


--
-- TOC entry 3495 (class 2606 OID 26181)
-- Name: user_team_membership FK_2454184e9011e28172f06d0d639; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.user_team_membership
    ADD CONSTRAINT "FK_2454184e9011e28172f06d0d639" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3480 (class 2606 OID 26186)
-- Name: ownership FK_29b0ffd913131cf5282742fa893; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ownership
    ADD CONSTRAINT "FK_29b0ffd913131cf5282742fa893" FOREIGN KEY ("odsId") REFERENCES public.ods(id) ON DELETE CASCADE;


--
-- TOC entry 3487 (class 2606 OID 26191)
-- Name: role FK_30fe66100b98ed08e1c9fdee0e8; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT "FK_30fe66100b98ed08e1c9fdee0e8" FOREIGN KEY ("modifiedById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3490 (class 2606 OID 26196)
-- Name: team FK_3a93fbdeba4e1e9e47fec6bada9; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.team
    ADD CONSTRAINT "FK_3a93fbdeba4e1e9e47fec6bada9" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3467 (class 2606 OID 26201)
-- Name: edorg FK_3e3a6841fcba09f3cf956944fa0; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.edorg
    ADD CONSTRAINT "FK_3e3a6841fcba09f3cf956944fa0" FOREIGN KEY ("modifiedById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3492 (class 2606 OID 26206)
-- Name: user FK_45c0d39d1f9ceeb56942db93cc5; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_45c0d39d1f9ceeb56942db93cc5" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3491 (class 2606 OID 26211)
-- Name: team FK_4a6172bf2bf88b295a19b3245a7; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.team
    ADD CONSTRAINT "FK_4a6172bf2bf88b295a19b3245a7" FOREIGN KEY ("modifiedById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3496 (class 2606 OID 26216)
-- Name: user_team_membership FK_513e407d9457dc50784b4d9c20d; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.user_team_membership
    ADD CONSTRAINT "FK_513e407d9457dc50784b4d9c20d" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- TOC entry 3488 (class 2606 OID 26221)
-- Name: role FK_528f294633a808293425ae2ab56; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT "FK_528f294633a808293425ae2ab56" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3472 (class 2606 OID 26226)
-- Name: edorg_closure FK_535b90f37f800a350ce4de5b90e; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.edorg_closure
    ADD CONSTRAINT "FK_535b90f37f800a350ce4de5b90e" FOREIGN KEY (id_descendant) REFERENCES public.edorg(id) ON DELETE CASCADE;


--
-- TOC entry 3477 (class 2606 OID 26231)
-- Name: ods FK_75491c4f18c4da07baa1da7f9c0; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ods
    ADD CONSTRAINT "FK_75491c4f18c4da07baa1da7f9c0" FOREIGN KEY ("modifiedById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3464 (class 2606 OID 26236)
-- Name: edfi_tenant FK_77c6bec8378354712fac1f4ed9e; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.edfi_tenant
    ADD CONSTRAINT "FK_77c6bec8378354712fac1f4ed9e" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3468 (class 2606 OID 26241)
-- Name: edorg FK_94e49b7b79f2b23d4685809c9e3; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.edorg
    ADD CONSTRAINT "FK_94e49b7b79f2b23d4685809c9e3" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3474 (class 2606 OID 26246)
-- Name: sb_environment FK_9689609f9a1151c15e0fd46044e; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.sb_environment
    ADD CONSTRAINT "FK_9689609f9a1151c15e0fd46044e" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3497 (class 2606 OID 26251)
-- Name: user_team_membership FK_978dfce88e15d0e7461b7350b1e; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.user_team_membership
    ADD CONSTRAINT "FK_978dfce88e15d0e7461b7350b1e" FOREIGN KEY ("modifiedById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3489 (class 2606 OID 26256)
-- Name: role FK_997dd31f342ad1e67a8dc9a24d1; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT "FK_997dd31f342ad1e67a8dc9a24d1" FOREIGN KEY ("teamId") REFERENCES public.team(id) ON DELETE CASCADE;


--
-- TOC entry 3481 (class 2606 OID 26261)
-- Name: ownership FK_9e38f4be50b8931ae3f2cc9468e; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ownership
    ADD CONSTRAINT "FK_9e38f4be50b8931ae3f2cc9468e" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3482 (class 2606 OID 26266)
-- Name: ownership FK_9ed3cde4307ca1cf1275e297152; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ownership
    ADD CONSTRAINT "FK_9ed3cde4307ca1cf1275e297152" FOREIGN KEY ("teamId") REFERENCES public.team(id) ON DELETE CASCADE;


--
-- TOC entry 3498 (class 2606 OID 26271)
-- Name: user_team_membership FK_ac0aaa143bbf1ee8725a6b1593e; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.user_team_membership
    ADD CONSTRAINT "FK_ac0aaa143bbf1ee8725a6b1593e" FOREIGN KEY ("roleId") REFERENCES public.role(id) ON DELETE SET NULL;


--
-- TOC entry 3483 (class 2606 OID 26276)
-- Name: ownership FK_b09a0d360c3eeb7a25a598f04e4; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ownership
    ADD CONSTRAINT "FK_b09a0d360c3eeb7a25a598f04e4" FOREIGN KEY ("roleId") REFERENCES public.role(id) ON DELETE SET NULL;


--
-- TOC entry 3473 (class 2606 OID 26281)
-- Name: edorg_closure FK_b67fab0829f3b586fc9cd24cb93; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.edorg_closure
    ADD CONSTRAINT "FK_b67fab0829f3b586fc9cd24cb93" FOREIGN KEY (id_ancestor) REFERENCES public.edorg(id) ON DELETE CASCADE;


--
-- TOC entry 3493 (class 2606 OID 26286)
-- Name: user FK_b7b62199aa0ff55f53e0137b217; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_b7b62199aa0ff55f53e0137b217" FOREIGN KEY ("modifiedById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3469 (class 2606 OID 26291)
-- Name: edorg FK_bce5c212f9dd8360f0bf8168ac9; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.edorg
    ADD CONSTRAINT "FK_bce5c212f9dd8360f0bf8168ac9" FOREIGN KEY ("edfiTenantId") REFERENCES public.edfi_tenant(id) ON DELETE CASCADE;


--
-- TOC entry 3465 (class 2606 OID 26296)
-- Name: edfi_tenant FK_becbb52581423083ffcf053733a; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.edfi_tenant
    ADD CONSTRAINT "FK_becbb52581423083ffcf053733a" FOREIGN KEY ("sbEnvironmentId") REFERENCES public.sb_environment(id) ON DELETE CASCADE;


--
-- TOC entry 3470 (class 2606 OID 26301)
-- Name: edorg FK_bf2fe95bd8a50a2346489472df2; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.edorg
    ADD CONSTRAINT "FK_bf2fe95bd8a50a2346489472df2" FOREIGN KEY ("parentId") REFERENCES public.edorg(id);


--
-- TOC entry 3494 (class 2606 OID 26306)
-- Name: user FK_c28e52f758e7bbc53828db92194; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES public.role(id) ON DELETE SET NULL;


--
-- TOC entry 3484 (class 2606 OID 26311)
-- Name: ownership FK_cc065f6b477a818771878eeb628; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ownership
    ADD CONSTRAINT "FK_cc065f6b477a818771878eeb628" FOREIGN KEY ("modifiedById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3485 (class 2606 OID 26316)
-- Name: ownership FK_ce537e2505b0775277cf7e4a83d; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ownership
    ADD CONSTRAINT "FK_ce537e2505b0775277cf7e4a83d" FOREIGN KEY ("edfiTenantId") REFERENCES public.edfi_tenant(id) ON DELETE CASCADE;


--
-- TOC entry 3475 (class 2606 OID 26321)
-- Name: sb_environment FK_d31c6bd5a79862649f2407ff3ac; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.sb_environment
    ADD CONSTRAINT "FK_d31c6bd5a79862649f2407ff3ac" FOREIGN KEY ("modifiedById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3499 (class 2606 OID 26326)
-- Name: user_team_membership FK_e08e451152e4e3214301716d149; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.user_team_membership
    ADD CONSTRAINT "FK_e08e451152e4e3214301716d149" FOREIGN KEY ("teamId") REFERENCES public.team(id) ON DELETE CASCADE;


--
-- TOC entry 3466 (class 2606 OID 26331)
-- Name: edfi_tenant FK_e1ebbdef1ca79a15f84673c8c04; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.edfi_tenant
    ADD CONSTRAINT "FK_e1ebbdef1ca79a15f84673c8c04" FOREIGN KEY ("modifiedById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3471 (class 2606 OID 26336)
-- Name: edorg FK_eacb927c57ecca3c22ab93fb849; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.edorg
    ADD CONSTRAINT "FK_eacb927c57ecca3c22ab93fb849" FOREIGN KEY ("odsId") REFERENCES public.ods(id) ON DELETE CASCADE;


--
-- TOC entry 3478 (class 2606 OID 26341)
-- Name: ods FK_fc6df40388b53b0603abb95846a; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ods
    ADD CONSTRAINT "FK_fc6df40388b53b0603abb95846a" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3486 (class 2606 OID 26346)
-- Name: ownership FK_fe36fa53d8f494740a5af704430; Type: FK CONSTRAINT; Schema: public; Owner: sbaa
--

ALTER TABLE ONLY public.ownership
    ADD CONSTRAINT "FK_fe36fa53d8f494740a5af704430" FOREIGN KEY ("sbEnvironmentId") REFERENCES public.sb_environment(id) ON DELETE CASCADE;


--
-- TOC entry 3681 (class 0 OID 0)
-- Dependencies: 8
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: sbaa
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- TOC entry 3667 (class 0 OID 26086)
-- Dependencies: 237 3676
-- Name: sb_sync_queue; Type: MATERIALIZED VIEW DATA; Schema: public; Owner: sbaa
--

REFRESH MATERIALIZED VIEW public.sb_sync_queue;


--
-- PostgreSQL database dump complete
--

