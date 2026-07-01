import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, "..", "data", "pinkfoot.db");
const DB_DIR = path.dirname(DB_PATH);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS _migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  applied_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS destinations (
  id            TEXT PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  country       TEXT,
  region        TEXT,
  hero_image    TEXT,
  gallery       TEXT,                       -- JSON array
  tagline       TEXT,
  description   TEXT,
  badge         TEXT,
  start_from    INTEGER DEFAULT 0,
  rating        REAL DEFAULT 0,
  review_count  INTEGER DEFAULT 0,
  best_months   TEXT,
  currency      TEXT,
  themes        TEXT,                       -- JSON array
  highlights    TEXT,                       -- JSON array
  published     INTEGER DEFAULT 1,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS packages (
  id              TEXT PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  destination     TEXT NOT NULL,             -- destination slug
  destination_name TEXT,
  theme           TEXT,                      -- JSON array
  nights          INTEGER DEFAULT 0,
  days            INTEGER DEFAULT 0,
  price_adult     INTEGER NOT NULL,
  price_child     INTEGER DEFAULT 0,
  currency        TEXT DEFAULT 'INR',
  original_price  INTEGER,
  discount        INTEGER DEFAULT 0,
  rating          REAL DEFAULT 0,
  review_count    INTEGER DEFAULT 0,
  cover_image     TEXT,
  gallery         TEXT,                      -- JSON array
  inclusions      TEXT,                      -- JSON array
  exclusions      TEXT,                      -- JSON array
  highlights      TEXT,                      -- JSON array
  badge           TEXT,
  itinerary       TEXT,                      -- JSON array of objects
  published       INTEGER DEFAULT 1,
  created_at      TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at      TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (destination) REFERENCES destinations(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_packages_destination ON packages(destination);

CREATE TABLE IF NOT EXISTS reviews (
  id            TEXT PRIMARY KEY,
  package_slug  TEXT NOT NULL,
  name          TEXT,
  location      TEXT,
  avatar        TEXT,
  rating        INTEGER,
  comment       TEXT,
  travel_date   TEXT,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (package_slug) REFERENCES packages(slug) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leads (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  package_slug  TEXT,
  package_title TEXT,
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  travelers     TEXT,
  travel_date   TEXT,
  message       TEXT,
  status        TEXT DEFAULT 'new',
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stays (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  property_type   TEXT,
  star_category   INTEGER,
  tier            TEXT,
  destination     TEXT,
  contact_number  TEXT,
  contact_email   TEXT,
  address         TEXT,
  map_url         TEXT,
  image           TEXT,
  description     TEXT,
  created_at      TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at      TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS policies (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  terms       TEXT NOT NULL,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at  TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

// --- Migrations (idempotent, additive) ---
const addCol = (table, col, type) => {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
  } catch (e) {
    if (!/duplicate column/i.test(e.message)) throw e;
  }
};

// Packages: long description, SEO, tags, hotels, transfers, payment policy
addCol("packages", "description", "TEXT");
addCol("packages", "meta_title", "TEXT");
addCol("packages", "meta_description", "TEXT");
addCol("packages", "meta_keywords", "TEXT");
addCol("packages", "tags", "TEXT");           // JSON array
addCol("packages", "hotels", "TEXT");         // JSON array of hotel objects
addCol("packages", "transfers", "TEXT");      // JSON array of transfer objects
addCol("packages", "payment_policy", "TEXT"); // JSON {name, terms}
addCol("packages", "category_pricing", "TEXT"); // JSON string containing standard, deluxe, luxury pricing

// Destinations: seasons, activity, region taxonomy
addCol("destinations", "travel_season_start", "TEXT");
addCol("destinations", "travel_season_end",   "TEXT");
addCol("destinations", "sales_season_start",  "TEXT");
addCol("destinations", "sales_season_end",    "TEXT");
addCol("destinations", "activity",            "TEXT");
addCol("destinations", "region_type",         "TEXT");
addCol("destinations", "region_keywords",     "TEXT");

// Stays migrations
addCol("stays", "slug", "TEXT");
addCol("stays", "gallery", "TEXT");

export default db;

export function rowToDestination(r) {
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    country: r.country,
    region: r.region,
    heroImage: r.hero_image,
    gallery: JSON.parse(r.gallery || "[]"),
    tagline: r.tagline,
    description: r.description,
    badge: r.badge,
    startFrom: r.start_from,
    rating: r.rating,
    reviewCount: r.review_count,
    bestMonths: r.best_months,
    currency: r.currency,
    themes: JSON.parse(r.themes || "[]"),
    highlights: JSON.parse(r.highlights || "[]"),
    travelSeason: r.travel_season_start || r.travel_season_end
      ? { start: r.travel_season_start, end: r.travel_season_end }
      : null,
    salesSeason: r.sales_season_start || r.sales_season_end
      ? { start: r.sales_season_start, end: r.sales_season_end }
      : null,
    activity: r.activity || null,
    regionType: r.region_type || null,
    regionKeywords: r.region_keywords || null,
    published: !!r.published,
  };
}

export function rowToPackage(r) {
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    destination: r.destination,
    destinationName: r.destination_name,
    theme: JSON.parse(r.theme || "[]"),
    duration: { nights: r.nights, days: r.days },
    price: { adult: r.price_adult, child: r.price_child, currency: r.currency, perPerson: true },
    originalPrice: r.original_price,
    discount: r.discount,
    rating: r.rating,
    reviewCount: r.review_count,
    coverImage: r.cover_image,
    gallery: JSON.parse(r.gallery || "[]"),
    inclusions: JSON.parse(r.inclusions || "[]"),
    exclusions: JSON.parse(r.exclusions || "[]"),
    highlights: JSON.parse(r.highlights || "[]"),
    badge: r.badge,
    itinerary: JSON.parse(r.itinerary || "[]"),
    description: r.description || null,
    metaTitle: r.meta_title || null,
    metaDescription: r.meta_description || null,
    metaKeywords: r.meta_keywords || null,
    tags: JSON.parse(r.tags || "[]"),
    hotels: JSON.parse(r.hotels || "[]"),
    transfers: JSON.parse(r.transfers || "[]"),
    paymentPolicies: r.payment_policy ? (
      Array.isArray(JSON.parse(r.payment_policy)) ? JSON.parse(r.payment_policy) : [JSON.parse(r.payment_policy)]
    ) : [],
    categoryPricing: r.category_pricing ? JSON.parse(r.category_pricing) : null,
    published: !!r.published,
  };
}

export function rowToStay(r) {
  if (!r) return null;
  
  // Parse gallery with safe fallback to legacy image column if gallery is empty
  let gallery = [];
  if (r.gallery) {
    try {
      gallery = JSON.parse(r.gallery);
    } catch (e) {
      gallery = [];
    }
  } else if (r.image && r.image.startsWith("[")) {
    try {
      gallery = JSON.parse(r.image);
    } catch (e) {
      gallery = [];
    }
  } else if (r.image) {
    gallery = [r.image];
  }

  // Cover image fallback
  let image = r.image || "";
  if (image.startsWith("[")) {
    try {
      const parsed = JSON.parse(image);
      image = parsed[0] || "";
    } catch (e) {
      image = "";
    }
  }
  if (!image && gallery.length > 0) {
    image = gallery[0];
  }

  return {
    id: r.id,
    slug: r.slug || r.id,
    name: r.name,
    propertyType: r.property_type,
    starCategory: r.star_category,
    tier: r.tier,
    destination: r.destination,
    contactNumber: r.contact_number,
    contactEmail: r.contact_email,
    address: r.address,
    mapUrl: r.map_url,
    image,
    gallery,
    images: gallery, // alias for safety
    description: r.description,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}export function rowToPolicy(r) {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    terms: r.terms,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
