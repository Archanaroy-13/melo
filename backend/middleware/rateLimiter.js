const rateLimitMap = new Map();

const rateLimiter = (maxRequests = 10, windowMs = 60000) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const now = Date.now();
    
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = rateLimitMap.get(ip);
    if (now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    record.count += 1;
    if (record.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please try again in a minute.'
      });
    }
    
    next();
  };
};

module.exports = rateLimiter;
