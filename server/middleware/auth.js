import jwt from 'jsonwebtoken';

const requireAuth = (req, res, next) => {
    // Node.js automatically lowercases all incoming HTTP header keys. 
    // This means that even though the client sends "Authorization", in req.headers it will be "authorization".
    // This behavior is part of the HTTP spec (headers are case-insensitive), but it can be confusing!
    // Always use lowercase header keys when reading from req.headers in Node.js to avoid subtle bugs.
    const auth = req.headers.authorization;
    if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
        console.error('auth headers failing');
        return res.status(401).json({ error: 'Please authenticate' });
    }
    const token = auth.split(" ")[1];
    try {
        // Use the correct secret env variable (likely JWT_SECRET, not JWT_TOKEN)
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = payload; // Attach decoded user info to req, not res
            next();
        } catch (err) {
            // If verify fails (token invalid, expired, signature doesn't match, etc.),
            // jwt.verify throws and we return a 401 Unauthorized response.
            console.error(err);
            return res.status(401).json({ error: 'Please authenticate' });
        }
    } catch (err) {
        return res.status(401).json({ error: 'Please authenticate' });
    }
}

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not Authorized' });
    }
    next();
};

export { requireAuth, requireAdmin };

// 401 Unauthorized: Use this when the user is not authenticated (i.e., has not provided valid credentials or token).
// 403 Forbidden: Use this when the user is authenticated but does not have permission to access the requested resource.