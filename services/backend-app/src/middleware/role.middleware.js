// Middleware kiểm tra quyền hạn (Role-based Access Control)
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        // req.user đã được nạp từ authMiddleware trước đó
        if (!req.user) {
            return res.status(401).json({ message: 'Bạn chưa đăng nhập.' });
        }

        // Kiểm tra xem role của user có nằm trong danh sách được phép không
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Truy cập bị từ chối. Quyền ${req.user.role} không thể thực hiện hành động này.` 
            });
        }

        next();
    };
};

module.exports = roleMiddleware;