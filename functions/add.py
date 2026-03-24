def add(a, b, ctx):
    bonus = ctx.get("bonus", 0) if ctx else 0
    result = int(a) + int(b) + int(bonus)
    return result