const roleMiddleware = (roles = []) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ success: false, message: "غير مصرح: لا توجد بيانات مستخدم" });
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({ success: false, message: "ليس لديك صلاحية لتنفيذ هذا الإجراء" });
    }

    next();
  };
};

export default roleMiddleware;
