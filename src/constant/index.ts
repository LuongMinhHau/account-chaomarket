export const COOKIE_SIDEBAR_STATE_NAME = 'chao_market_sidebar_state';
export const APP_THEME_STATE_NAME = 'chao_market_theme_state';

const APP_CONSULTATION_QUERY_KEY = {
    CONSULTATIONS_SERVICES: 'consultations-services',
    CONSULTATION_SERVICES_MODULAR: 'consultation-services-modular',
    SELECTED_CONSULTATION_SERVICES: 'selected-consultation-services',
    USER_CONSULTATIONS: 'user-consultations',
};

const APP_USER_QUERY_KEY = {
    USER_PROFILE: 'user-profile',
    USER_CART: 'user-cart',
};

const APP_PRODUCT_QUERY_KEY = {
    GET_PRODUCT_TAGS: 'get-product-tags',
    GET_MARKET_TAGS: 'get-market-tags',
};

const APP_NOTIFICATION_QUERY_KEY = {
    NOTIFICATIONS: 'notifications',
    NOTIFICATIONS_UNREAD_COUNT: 'notifications-unread-count',
};

export const APP_QUERY_KEY = {
    ...APP_CONSULTATION_QUERY_KEY,
    ...APP_USER_QUERY_KEY,
    ...APP_PRODUCT_QUERY_KEY,
    ...APP_NOTIFICATION_QUERY_KEY,
};
