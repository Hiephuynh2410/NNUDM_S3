var ResHelper = require('../helper/ResponseHelper');
module.exports = function (...roles) {
    return function (req, res, next) {
        let userRole = req.user.role;
        let matchArray = roles.filter(e => userRole.includes(e));
        if (matchArray.length > 0) {
            next();
        } else {
            ResHelper.RenderRes(res, false, "ban khong co quyen")
        }
    }
}