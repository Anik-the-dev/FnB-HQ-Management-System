
// Usage:
//   authorize('admin')              → only admin
//   authorize('admin', 'outlet')    → both roles allowed
//   authorize('outlet', { param: 'outletId' })
//     → outlet staff can only access their own outlet_id
//
// For outlet-scoped routes, pass the name of the URL param that
// holds the outlet id (defaults to 'outletId').

const authorize = (...args) => {
  // Separate roles from options
  const roles   = args.filter((a) => typeof a === 'string');
  const options = args.find((a) => typeof a === 'object') || {};
  const { param = 'outletId' } = options;

  return (req, res, next) => {
    const user = req.user;

    // 1. Role check
    if (!roles.includes(user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden.' });
    }

    // 2. Outlet ownership check — only for outlet role
    if (user.role === 'outlet') {
      const requestedId = parseInt(req.params[param] || req.body.outlet_id);
      if (requestedId && requestedId !== user.outlet_id) {
        return res.status(403).json({
          success: false,
          error: 'You can only access your own outlet.',
        });
      }
    }

    next();
  };
};

export default authorize;
