# add.py
#
# A simple Python function loaded by MetaCall.
# It uses the context passed from the MCP server.
#
# Parameters:
#   a    — first number (provided by MCP client)
#   b    — second number (provided by MCP client)
#   ctx  — the shared context dict, e.g. { "bonus": 5 }
#
# Example:
#   add(2, 3, { "bonus": 5 })
#   → 10  (2 + 3 + 5)

def add(a, b, ctx):
    # Safely read the bonus from context (default to 0 if not set)
    bonus = ctx.get("bonus", 0) if ctx else 0

    result = a + b + bonus
    return result
