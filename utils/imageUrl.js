// utils/imageUrl.js
//
// ✅ Single source of truth for turning a locally-stored file path
//    (e.g. "/uploads/products/main-xxx.jpg") into a full URL the
//    frontend / emails can actually load, and vice-versa.
//
//    Set APP_BASE_URL in your .env once you have a permanent domain.
//    Falls back to the previous hardcoded hosting URL so nothing breaks
//    if the env var isn't set.

require("dotenv").config();

const BASE_URL = (process.env.APP_BASE_URL ||
    "https://mediumorchid-rhinoceros-818505.hostingersite.com"
).replace(/\/+$/, ""); // strip trailing slash

/**
 * Convert a stored relative path (or already-full URL) into a full URL.
 * @param {string|null|undefined} url
 * @returns {string|null}
 */
function toFullImageUrl(url) {
    if (!url) return null;

    // Already absolute (http/https) — return as-is
    if (/^https?:\/\//i.test(url)) return url;

    return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Strip the BASE_URL back off a full URL so we always persist/compare
 * relative paths ("/uploads/xyz.jpg") internally.
 * @param {string|null|undefined} url
 * @returns {string|null}
 */
function toRelativeImageUrl(url) {
    if (!url) return null;
    if (url.startsWith(BASE_URL)) return url.slice(BASE_URL.length);
    return url;
}

/**
 * Recursively walk an object/array and convert every value at the given
 * key name(s) from a relative path to a full URL. Works on Sequelize
 * instances (calls .toJSON() first) or plain objects/arrays.
 *
 * @param {any} data - a Sequelize instance/array of instances, or plain object/array
 * @param {string[]} keys - property names to convert, e.g. ["image_url", "image", "attachmentUrl"]
 */
function attachFullImageUrls(data, keys = ["image_url", "image"]) {
    if (Array.isArray(data)) {
        return data.map((item) => attachFullImageUrls(item, keys));
    }

    if (data === null || data === undefined) return data;

    const plain = typeof data.toJSON === "function" ? data.toJSON() : data;

    if (typeof plain !== "object") return plain;

    const result = { ...plain };

    for (const key of Object.keys(result)) {
        if (keys.includes(key) && typeof result[key] === "string") {
            result[key] = toFullImageUrl(result[key]);
        } else if (Array.isArray(result[key])) {
            result[key] = result[key].map((item) =>
                item && typeof item === "object"
                    ? attachFullImageUrls(item, keys)
                    : item
            );
        } else if (result[key] && typeof result[key] === "object") {
            result[key] = attachFullImageUrls(result[key], keys);
        }
    }

    return result;
}

module.exports = {
    BASE_URL,
    toFullImageUrl,
    toRelativeImageUrl,
    attachFullImageUrls,
};
