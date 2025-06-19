--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

-- Started on 2025-06-19 04:42:09 UTC

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
-- TOC entry 2 (class 3079 OID 16399)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3564 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 233 (class 1259 OID 16527)
-- Name: brands; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.brands (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    renown character varying(20) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    subcategory_id integer
);


ALTER TABLE public.brands OWNER TO "user";

--
-- TOC entry 232 (class 1259 OID 16526)
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.brands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.brands_id_seq OWNER TO "user";

--
-- TOC entry 3565 (class 0 OID 0)
-- Dependencies: 232
-- Name: brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.brands_id_seq OWNED BY public.brands.id;


--
-- TOC entry 223 (class 1259 OID 16443)
-- Name: categories; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categories OWNER TO "user";

--
-- TOC entry 3566 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE categories; Type: COMMENT; Schema: public; Owner: user
--

COMMENT ON TABLE public.categories IS 'Categorías principales sin estructura jerárquica interna';


--
-- TOC entry 222 (class 1259 OID 16442)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO "user";

--
-- TOC entry 3567 (class 0 OID 0)
-- Dependencies: 222
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 235 (class 1259 OID 16543)
-- Name: clients; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    email character varying(100),
    identification character varying(100),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.clients OWNER TO "user";

--
-- TOC entry 234 (class 1259 OID 16542)
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_id_seq OWNER TO "user";

--
-- TOC entry 3568 (class 0 OID 0)
-- Dependencies: 234
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- TOC entry 229 (class 1259 OID 16495)
-- Name: feature_definitions; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.feature_definitions (
    id integer NOT NULL,
    subcategory_id integer NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100) NOT NULL,
    type character varying(20) NOT NULL,
    order_index integer NOT NULL,
    options jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    mandatory boolean DEFAULT false,
    offer_print boolean DEFAULT false
);


ALTER TABLE public.feature_definitions OWNER TO "user";

--
-- TOC entry 228 (class 1259 OID 16494)
-- Name: feature_definitions_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.feature_definitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.feature_definitions_id_seq OWNER TO "user";

--
-- TOC entry 3569 (class 0 OID 0)
-- Dependencies: 228
-- Name: feature_definitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.feature_definitions_id_seq OWNED BY public.feature_definitions.id;


--
-- TOC entry 217 (class 1259 OID 16390)
-- Name: migrations; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    executed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.migrations OWNER TO "user";

--
-- TOC entry 216 (class 1259 OID 16389)
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO "user";

--
-- TOC entry 3570 (class 0 OID 0)
-- Dependencies: 216
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 225 (class 1259 OID 16460)
-- Name: products; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.products (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    brand character varying(50),
    model character varying(50),
    age_group character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.products OWNER TO "user";

--
-- TOC entry 224 (class 1259 OID 16459)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO "user";

--
-- TOC entry 3571 (class 0 OID 0)
-- Dependencies: 224
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 219 (class 1259 OID 16411)
-- Name: roles; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roles OWNER TO "user";

--
-- TOC entry 218 (class 1259 OID 16410)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO "user";

--
-- TOC entry 3572 (class 0 OID 0)
-- Dependencies: 218
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 227 (class 1259 OID 16477)
-- Name: subcategories; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.subcategories (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name character varying(100) NOT NULL,
    sku text NOT NULL,
    gap_new numeric(5,2) NOT NULL,
    gap_used numeric(5,2) NOT NULL,
    margin_new numeric(5,2) NOT NULL,
    margin_used numeric(5,2) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.subcategories OWNER TO "user";

--
-- TOC entry 226 (class 1259 OID 16476)
-- Name: subcategories_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.subcategories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subcategories_id_seq OWNER TO "user";

--
-- TOC entry 3573 (class 0 OID 0)
-- Dependencies: 226
-- Name: subcategories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.subcategories_id_seq OWNED BY public.subcategories.id;


--
-- TOC entry 221 (class 1259 OID 16424)
-- Name: users; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    role_id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(100) NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO "user";

--
-- TOC entry 220 (class 1259 OID 16423)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO "user";

--
-- TOC entry 3574 (class 0 OID 0)
-- Dependencies: 220
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 231 (class 1259 OID 16512)
-- Name: valuation_factors; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.valuation_factors (
    id integer NOT NULL,
    subcategory_id integer NOT NULL,
    factor_type character varying(50) NOT NULL,
    factor_value character varying(50) NOT NULL,
    score integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.valuation_factors OWNER TO "user";

--
-- TOC entry 230 (class 1259 OID 16511)
-- Name: valuation_factors_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.valuation_factors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.valuation_factors_id_seq OWNER TO "user";

--
-- TOC entry 3575 (class 0 OID 0)
-- Dependencies: 230
-- Name: valuation_factors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.valuation_factors_id_seq OWNED BY public.valuation_factors.id;


--
-- TOC entry 239 (class 1259 OID 16582)
-- Name: valuation_items; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.valuation_items (
    id integer NOT NULL,
    valuation_id integer NOT NULL,
    category_id integer NOT NULL,
    subcategory_id integer NOT NULL,
    brand_id integer,
    status character varying(50) NOT NULL,
    brand_renown character varying(20) NOT NULL,
    modality character varying(20) NOT NULL,
    condition_state character varying(20) NOT NULL,
    demand character varying(20) NOT NULL,
    cleanliness character varying(20) NOT NULL,
    features jsonb,
    new_price numeric(10,2) NOT NULL,
    purchase_score integer,
    sale_score integer,
    suggested_purchase_price numeric(10,2),
    suggested_sale_price numeric(10,2),
    final_purchase_price numeric(10,2),
    final_sale_price numeric(10,2),
    consignment_price numeric(10,2),
    images jsonb,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    online_store_ready boolean DEFAULT false,
    quantity integer DEFAULT 1 NOT NULL,
    store_credit_price numeric(10,2)
);


ALTER TABLE public.valuation_items OWNER TO "user";

--
-- TOC entry 238 (class 1259 OID 16581)
-- Name: valuation_items_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.valuation_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.valuation_items_id_seq OWNER TO "user";

--
-- TOC entry 3576 (class 0 OID 0)
-- Dependencies: 238
-- Name: valuation_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.valuation_items_id_seq OWNED BY public.valuation_items.id;


--
-- TOC entry 237 (class 1259 OID 16555)
-- Name: valuations; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.valuations (
    id integer NOT NULL,
    client_id integer NOT NULL,
    user_id integer NOT NULL,
    valuation_date timestamp without time zone DEFAULT now(),
    total_purchase_amount numeric(10,2),
    total_consignment_amount numeric(10,2),
    status character varying(20) DEFAULT 'pending'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    total_store_credit_amount numeric(10,2)
);


ALTER TABLE public.valuations OWNER TO "user";

--
-- TOC entry 236 (class 1259 OID 16554)
-- Name: valuations_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.valuations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.valuations_id_seq OWNER TO "user";

--
-- TOC entry 3577 (class 0 OID 0)
-- Dependencies: 236
-- Name: valuations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.valuations_id_seq OWNED BY public.valuations.id;


--
-- TOC entry 3341 (class 2604 OID 16530)
-- Name: brands id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.brands ALTER COLUMN id SET DEFAULT nextval('public.brands_id_seq'::regclass);


--
-- TOC entry 3321 (class 2604 OID 16446)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 3345 (class 2604 OID 16546)
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- TOC entry 3333 (class 2604 OID 16498)
-- Name: feature_definitions id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.feature_definitions ALTER COLUMN id SET DEFAULT nextval('public.feature_definitions_id_seq'::regclass);


--
-- TOC entry 3312 (class 2604 OID 16393)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 3325 (class 2604 OID 16463)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 3314 (class 2604 OID 16414)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 3329 (class 2604 OID 16480)
-- Name: subcategories id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.subcategories ALTER COLUMN id SET DEFAULT nextval('public.subcategories_id_seq'::regclass);


--
-- TOC entry 3317 (class 2604 OID 16427)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3338 (class 2604 OID 16515)
-- Name: valuation_factors id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.valuation_factors ALTER COLUMN id SET DEFAULT nextval('public.valuation_factors_id_seq'::regclass);


--
-- TOC entry 3354 (class 2604 OID 16585)
-- Name: valuation_items id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.valuation_items ALTER COLUMN id SET DEFAULT nextval('public.valuation_items_id_seq'::regclass);


--
-- TOC entry 3349 (class 2604 OID 16558)
-- Name: valuations id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.valuations ALTER COLUMN id SET DEFAULT nextval('public.valuations_id_seq'::regclass);


--
-- TOC entry 3388 (class 2606 OID 16535)
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- TOC entry 3374 (class 2606 OID 16453)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3390 (class 2606 OID 16551)
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- TOC entry 3381 (class 2606 OID 16504)
-- Name: feature_definitions feature_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.feature_definitions
    ADD CONSTRAINT feature_definitions_pkey PRIMARY KEY (id);


--
-- TOC entry 3360 (class 2606 OID 16398)
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- TOC entry 3362 (class 2606 OID 16396)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3376 (class 2606 OID 16470)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 3364 (class 2606 OID 16422)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 3366 (class 2606 OID 16420)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3379 (class 2606 OID 16487)
-- Name: subcategories subcategories_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT subcategories_pkey PRIMARY KEY (id);


--
-- TOC entry 3392 (class 2606 OID 16553)
-- Name: clients uk_clients_phone; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT uk_clients_phone UNIQUE (phone);


--
-- TOC entry 3368 (class 2606 OID 16436)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3370 (class 2606 OID 16432)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3372 (class 2606 OID 16434)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3386 (class 2606 OID 16519)
-- Name: valuation_factors valuation_factors_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.valuation_factors
    ADD CONSTRAINT valuation_factors_pkey PRIMARY KEY (id);


--
-- TOC entry 3403 (class 2606 OID 16591)
-- Name: valuation_items valuation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.valuation_items
    ADD CONSTRAINT valuation_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3398 (class 2606 OID 16566)
-- Name: valuations valuations_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.valuations
    ADD CONSTRAINT valuations_pkey PRIMARY KEY (id);


--
-- TOC entry 3382 (class 1259 OID 49281)
-- Name: idx_feature_definitions_offer_print; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_feature_definitions_offer_print ON public.feature_definitions USING btree (subcategory_id, offer_print) WHERE (offer_print = true);


--
-- TOC entry 3383 (class 1259 OID 16510)
-- Name: idx_feature_definitions_subcategory; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_feature_definitions_subcategory ON public.feature_definitions USING btree (subcategory_id);


--
-- TOC entry 3377 (class 1259 OID 16493)
-- Name: idx_subcategories_category; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_subcategories_category ON public.subcategories USING btree (category_id);


--
-- TOC entry 3384 (class 1259 OID 16525)
-- Name: idx_valuation_factors; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_valuation_factors ON public.valuation_factors USING btree (subcategory_id, factor_type, factor_value);


--
-- TOC entry 3399 (class 1259 OID 16613)
-- Name: idx_valuation_items_category; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_valuation_items_category ON public.valuation_items USING btree (category_id);


--
-- TOC entry 3400 (class 1259 OID 16614)
-- Name: idx_valuation_items_subcategory; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_valuation_items_subcategory ON public.valuation_items USING btree (subcategory_id);


--
-- TOC entry 3401 (class 1259 OID 16612)
-- Name: idx_valuation_items_valuation; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_valuation_items_valuation ON public.valuation_items USING btree (valuation_id);


--
-- TOC entry 3393 (class 1259 OID 16577)
-- Name: idx_valuations_client; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_valuations_client ON public.valuations USING btree (client_id);


--
-- TOC entry 3394 (class 1259 OID 16579)
-- Name: idx_valuations_date; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_valuations_date ON public.valuations USING btree (valuation_date);


--
-- TOC entry 3395 (class 1259 OID 16580)
-- Name: idx_valuations_status; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_valuations_status ON public.valuations USING btree (status);


--
-- TOC entry 3396 (class 1259 OID 16578)
-- Name: idx_valuations_user; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_valuations_user ON public.valuations USING btree (user_id);


--
-- TOC entry 3409 (class 2606 OID 24682)
-- Name: brands brands_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.subcategories(id);


--
-- TOC entry 3407 (class 2606 OID 16505)
-- Name: feature_definitions feature_definitions_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.feature_definitions
    ADD CONSTRAINT feature_definitions_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.subcategories(id);


--
-- TOC entry 3405 (class 2606 OID 16471)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 3406 (class 2606 OID 16488)
-- Name: subcategories subcategories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 3404 (class 2606 OID 16437)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- TOC entry 3408 (class 2606 OID 16520)
-- Name: valuation_factors valuation_factors_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.valuation_factors
    ADD CONSTRAINT valuation_factors_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.subcategories(id);


--
-- TOC entry 3412 (class 2606 OID 16607)
-- Name: valuation_items valuation_items_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.valuation_items
    ADD CONSTRAINT valuation_items_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- TOC entry 3413 (class 2606 OID 16597)
-- Name: valuation_items valuation_items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.valuation_items
    ADD CONSTRAINT valuation_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 3414 (class 2606 OID 16602)
-- Name: valuation_items valuation_items_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.valuation_items
    ADD CONSTRAINT valuation_items_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.subcategories(id);


--
-- TOC entry 3415 (class 2606 OID 16592)
-- Name: valuation_items valuation_items_valuation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.valuation_items
    ADD CONSTRAINT valuation_items_valuation_id_fkey FOREIGN KEY (valuation_id) REFERENCES public.valuations(id);


--
-- TOC entry 3410 (class 2606 OID 16567)
-- Name: valuations valuations_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.valuations
    ADD CONSTRAINT valuations_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- TOC entry 3411 (class 2606 OID 16572)
-- Name: valuations valuations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.valuations
    ADD CONSTRAINT valuations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2025-06-19 04:42:09 UTC

--
-- PostgreSQL database dump complete
--

