import { prisma } from "../db/prisma";

const RESERVED = new Set([
  "dashboard", "api", "sign-in", "sign-up",
  "logout", "login", "register", "settings",
  "account", "profile", "admin", "home",
  "links", "campaigns", "analytics", "upgrade",
  "pricing", "about", "contact", "help",
  "terms", "privacy", "404", "500", "support", 
  "blog", "docs", "developers", "status", 
  "security", "legal", "resources", "community", 
  "events", "partners", "press", "careers", "features", 
  "testimonials", "case-studies", "integrations", "api-docs", 
  "developers", "open-source", "contributing", "roadmap", 
  "changelog", "releases", "sponsors", "team", "company", 
  "mission", "values", "culture", "news", "media", "investors", 
  "contact-us", "feedback", "bug-report", "feature-request", 
  "support-ticket", "status-page", "system-status", "uptime", 
  "downtime", "maintenance", "incident", "outage", "security-incident", 
  "data-breach", "vulnerability", "patches", "updates", "upgrade-notes", 
  "migration-guide", "api-reference", "sdk", "cli", "webhooks", "events-api", 
  "audit-logs", "access-logs", "error-logs",
]);

const CHARSET = "abcdefghijklmnopqrstuvwxyz0123456789"
const SLUG_LENGTH = 6;

// 1. generate a random slug
export function generateSlug(): string {
    return Array.from({ length: SLUG_LENGTH }, () => CHARSET[Math.floor(Math.random() * CHARSET.length)]).join("");
}

// 2. validate a slug aginst all the rules
export function validateSlug(slug: string): {
    valid: boolean;
    error?: string;
} {
    if (!slug) {
        return { valid: false, error: "Slug is required" };
    }
    if (slug.length < 3 || slug.length > 20) {
        return { valid: false, error: "Slug must be between 3 and 20 characters" };
    }
    if (!/^[a-z0-9]+$/.test(slug)) {
        return { valid: false, 
            error: "Slug can only contain lowercase letters and numbers" };
    }
    if (slug.startsWith("-") || slug.endsWith("-")) {
        return { valid: false, error: "Slug cannot start or end with a hyphen" };
    }
    if (RESERVED.has(slug.toLowerCase())) {
        return { valid: false, error: "Slug is reserved" };
    }
    return { valid: true };
}

// 3. check if a slug is available in database
export async function isSlugAvailable(slug: string): Promise<boolean> {
    const exstingSlug = await prisma.link.findUnique({
        where: { slug },
        select: { id: true }
    })
    return exstingSlug == null;
}

//4. generate a unique slug 
export async function generateUniqueSlug(
  maxAttempts = 5
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const slug = generateSlug();
    const available = await isSlugAvailable(slug);
    if (available) return slug;
  }
  throw new Error("Could not generate a unique slug. Try again.");
}