

module.exports.greet = function (name, ctx) {
  // Safely read the user from context (default to "Unknown" if not set)
  const user = (ctx && ctx.user) ? ctx.user : "Unknown";

  return `Hello ${name}. Context user: ${user}`;
};
