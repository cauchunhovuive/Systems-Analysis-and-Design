const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        // Kiểm tra xem user đã đi qua authMiddleware chưa
        if (!req.user) {
            return res.status(401).json({ message: 'Bạn chưa đăng nhập.' });
        }

        // Kiểm tra xem role của user có nằm trong mảng allowedRoles không
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Cảnh báo bảo mật: Quyền[${req.user.role}] không được phép thực hiện hành động này!` 
            });
        }

        // Nếu hợp lệ, cho phép đi tiếp
        next();
    };
};

module.exports = roleMiddleware;