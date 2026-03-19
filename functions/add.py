

def add(a, b, ctx):
    # Safely read the bonus from context (default to 0 if not set)
    bonus = ctx.get("bonus", 0) if ctx else 0

    result = a + b + bonus
    return result
