Why 500 → error
5xx means the server failed: unhandled exception, DB down, bug in code, etc. Those are things you usually want to alert on, investigate, and fix. The err check covers the same case — pino-http passes an error when the handler threw.

Why 400 → warn
4xx means the client sent a bad or unauthorized request: 401, 403, 404, 422, etc. The server responded correctly; nothing necessarily “crashed.” These are often expected (wrong password, missing field, not found). They’re worth logging, but at a lower severity than a server failure.

Practical effect
With your logger default level "info", both still get logged. The difference shows up in:

Filtering — e.g. LOG_LEVEL=error keeps 5xx but drops 4xx
Monitoring/alerting — alert on error, maybe dashboard 4xx separately
Terminal output — pino-pretty colors error vs warn differently
So it’s not “500 is special and 400 isn’t” — it’s server problem vs client problem, mapped to standard log severities.


“Classic backend pattern” in one sentence
Don’t enforce business rules with read-then-write in application code unless the database guarantees nothing changes between read and write — use a transaction + lock, or push the rule into a single SQL statement / constraint.