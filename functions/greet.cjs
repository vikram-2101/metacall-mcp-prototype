/**
 * greet.cjs
 *
 * A simple Node.js function loaded by MetaCall.
 * It uses the context passed from the MCP server.
 *
 * Parameters:
 *   name  — the name to greet (provided by the MCP client)
 *   ctx   — the shared context object, e.g. { user: "Vikram" }
 *
 * Example:
 *   greet("MetaCall", { user: "Vikram" })
 *   → "Hello MetaCall. Context user: Vikram"
 */

module.exports.greet = function (name, ctx) {
  // Safely read the user from context (default to "Unknown" if not set)
  const user = (ctx && ctx.user) ? ctx.user : "Unknown";

  return `Hello ${name}. Context user: ${user}`;
};
