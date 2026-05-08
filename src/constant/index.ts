export const COOKIE_SIDEBAR_STATE_NAME = 'chao_market_sidebar_state';
export const APP_THEME_STATE_NAME = 'chao_market_theme_state';

const APP_USER_QUERY_KEY = {
    USER_PROFILE: 'user-profile',
};

const APP_NOTIFICATION_QUERY_KEY = {
    NOTIFICATIONS: 'notifications',
    NOTIFICATIONS_UNREAD_COUNT: 'notifications-unread-count',
};

const APP_CART_QUERY_KEY = {
    USER_CART: 'user-cart',
};

export const APP_QUERY_KEY = {
    ...APP_USER_QUERY_KEY,
    ...APP_NOTIFICATION_QUERY_KEY,
    ...APP_CART_QUERY_KEY,
};
