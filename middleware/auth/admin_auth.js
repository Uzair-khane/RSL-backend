const { Op } = require("sequelize");
const Menu = require("../../models/menu");
const RoleMenu = require("../../models/role_menus");

let redirectUrl = '';

module.exports = {
  isAdminAuth: async (req, res, next) => {
    const splitUrl = req.originalUrl.split(/\/|\?/);

    if (req.isAuthenticated()) {
      let isUser = req.user;

      if (isUser && isUser.user_type == 'admin' && isUser.status) {

        // ✅ allow payment action ajax routes
        const allowedPaymentActions = [
          '/ap/payments/approve/',
          '/ap/payments/reject/',
          '/ap/payments/cash-collected/'
        ];

        const isAllowedPaymentAction = allowedPaymentActions.some(url =>
          req.originalUrl.startsWith(url)
        );

        if (isAllowedPaymentAction) {
          return next();
        }

        let checkPrefixes = await checkUrl(isUser.role_id, splitUrl);

        if (checkPrefixes) {
          return next();
        }
      }

      return res.render('admin/snippets/error-403', {
        title: 'KPCTA | Forbidden',
        successFlash: req.flash('success'),
        errorFlash: req.flash('error').join('<br />'),
        message: 'Your access was denied. Contact with your system administrator, please.',
      });
    }

    if (req.originalUrl && req.originalUrl != undefined && req.originalUrl != '/ap/home') {
      redirectUrl = `?redirect_url=${req.originalUrl}`;
    }

    return res.redirect(`/ap/auth/login${redirectUrl}`);
  }
};

const checkUrl = async (role_id, splitUrl) => {
  let searchStr = {};

  if (splitUrl[2] != undefined) {
    searchStr.route = splitUrl[2];
  }

  if (splitUrl[2] != undefined && splitUrl[3] != undefined) {
    if (isNaN(splitUrl[3])) {
      searchStr = {
        [Op.and]: {
          route: splitUrl[2],
          slug: splitUrl[3]
        }
      };
    } else {
      searchStr = {
        [Op.or]: {
          route: splitUrl[2],
          slug: splitUrl[4]
        }
      };
    }
  }

  const isMatched = await RoleMenu.count({
    include: [
      {
        model: Menu,
        as: 'menus',
        attributes: [],
        required: true,
        where: searchStr
      }
    ],
    where: { role_id: role_id }
  });

  return !!isMatched;
};