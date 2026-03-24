module.exports.greet = function (name, ctx) {
  const actualName = typeof name === "object" && name.name ? name.name : name;
  const user = ctx && ctx.user ? ctx.user : "Unknown";
  return `Hello ${actualName}. Context user: ${user}`;
};
