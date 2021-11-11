require('dotenv').config();
// const crypto = require('crypto');
// const fs = require('fs');
// const multer = require('multer');
// const path = require('path');
// const port = process.env.PORT;
const User = require('../server/models/user_model');
const {TOKEN_SECRET} = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');

// const upload = multer({
//     storage: multer.diskStorage({
//         destination: (req, file, cb) => {
//             const productId = req.body.product_id;
//             const imagePath = path.join(__dirname, `../public/assets/${productId}`);
//             if (!fs.existsSync(imagePath)) {
//                 fs.mkdirSync(imagePath);
//             }
//             cb(null, imagePath);
//         },
//         filename: (req, file, cb) => {
//             const customFileName = crypto.randomBytes(18).toString('hex').substr(0, 8);
//             const fileExtension = file.mimetype.split('/')[1]; // get file extension from original file name
//             cb(null, customFileName + '.' + fileExtension);
//         }
//     })
// });

// const getImagePath = (protocol, hostname, productId) => {
//     if (protocol == 'http') {
//         return protocol + '://' + hostname + ':' + port + '/assets/' + productId + '/';
//     } else {
//         return protocol + '://' + hostname + '/assets/' + productId + '/';
//     }
// };

// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const wrapAsync = (fn) => {
    return function(req, res, next) {
        // Make sure to `.catch()` any errors and pass them along to the `next()`
        // middleware in the chain, in this case the error handler.
        fn(req, res, next).catch(next);
    };
};

const authentication = (roleId) => {
    return async function (req, res, next) {
        let accessToken = req.get('Authorization');
        // console.log(accessToken)
        if (!accessToken) {
            console.log('what')
            res.status(401).send({error: 'Unauthorized'});
            return;
        }
        // console.log(accessToken)
        
        accessToken = accessToken.replace('Bearer ', '');
        // console.log(accessToken)
        if (accessToken == 'null') {
            res.status(401).send({error: 'Unauthorized'});
            return;
        }
        // console.log('hear')
        try {
            // console.log('*')
            // console.log(roleId)
            const user = jwt.verify(accessToken, TOKEN_SECRET);
            // console.log('#')
            req.user = user;
            if (roleId == null) {
                next();
            } else {
                let userDetail;
                // if (roleId == User.USER_ROLE.ALL) {
                    userDetail = await User.getUserDetail(user.email);
                // } else {
                    // userDetail = await User.getUserDetail(user.email, roleId);
                // }
                if (!userDetail) {
                    res.status(403).send({error: 'Forbidden'});
                } else {
                    req.user.id = userDetail.id;
                    req.user.role_id = userDetail.role_id;
                    next();
                }
            }
            return;
        } catch(err) {
            console.log(err)
            res.status(403).send({error: 'Forbidden'});
            return;
        }
    };
};

module.exports = {
    // upload,
    // getImagePath,
    wrapAsync,
    authentication
};
