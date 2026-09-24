/**
 * Коды прав, которыми размечены разделы и действия админки.
 *
 * Карта была заполнена только для десяти справочников. Разделы «Магазины»,
 * «Заказы», «Пункты выдачи», «Модерация товаров», «Заявки продавцов»,
 * «Обращения» и «Сообщение о доставке» передавались без права, а помощник для
 * undefined возвращал «разрешено» — их видел любой вошедший, независимо от
 * набора прав. Коды сверены с app/core/permissions.py на бэкенде.
 */
export const PERMISSION_KEYS = {
  USERS: {
    read: 'users:read',
    create: 'users:create',
    update: 'users:update',
    block: 'users:block',
    managePermissions: 'users:manage_permissions',
  },
  BRANDS: {
    read: 'brands:read',
    create: 'brands:create',
    update: 'brands:update',
    block: 'brands:block',
  },
  CATEGORIES: {
    read: 'categories:read',
    create: 'categories:create',
    update: 'categories:update',
    block: 'categories:block',
  },
  COUNTRIES: {
    read: 'countries:read',
    create: 'countries:create',
    update: 'countries:update',
    block: 'countries:block',
  },
  REGIONS: {
    read: 'regions:read',
    create: 'regions:create',
    update: 'regions:update',
    block: 'regions:block',
  },
  CITIES: {
    read: 'cities:read',
    create: 'cities:create',
    update: 'cities:update',
    block: 'cities:block',
  },
  CURRENCIES: {
    read: 'currencies:read',
    create: 'currencies:create',
    update: 'currencies:update',
    block: 'currencies:block',
  },
  MEASURE_UNITS: {
    read: 'measure_units:read',
    create: 'measure_units:create',
    update: 'measure_units:update',
    block: 'measure_units:block',
  },
  BANNERS: {
    read: 'banners:read',
    create: 'banners:create',
    update: 'banners:update',
    block: 'banners:block',
    delete: 'banners:delete',
  },
  COLLECTIONS: {
    read: 'collections:read',
    create: 'collections:create',
    update: 'collections:update',
    block: 'collections:block',
    delete: 'collections:delete',
  },
  SHOPS: {
    read: 'shop_bases:read',
    create: 'shop_bases:create',
    update: 'shop_bases:update',
    block: 'shop_bases:block',
  },
  RETURNS: {
    create: 'returns:create',
    manage: 'returns:manage',
  },
  REVIEWS: {
    create: 'reviews:create',
    moderate: 'reviews:moderate',
  },
  PRODUCTS: {
    read: 'products:read',
    create: 'products:create',
    update: 'products:update',
    block: 'products:block',
    moderate: 'products:moderate',
  },
  ORDERS: {
    read: 'orders:read',
    updateStatus: 'orders:update_status',
    updateShopStatus: 'orders:update_shop_status',
  },
  PICKUP_POINTS: {
    read: 'pickup_points:read',
    create: 'pickup_points:create',
    update: 'pickup_points:update',
    block: 'pickup_points:block',
  },
  WAREHOUSES: {
    read: 'warehouses:read',
    create: 'warehouses:create',
    update: 'warehouses:update',
    block: 'warehouses:block',
  },
  WAREHOUSE_OPERATIONS: {
    read: 'warehouse_operations:read',
    create: 'warehouse_operations:create',
  },
  STOCK_RECEIPTS: {
    read: 'stock_receipts:read',
    create: 'stock_receipts:create',
    confirm: 'stock_receipts:confirm',
  },
  DELIVERY_MESSAGE: {
    read: 'delivery_message:read',
    create: 'delivery_message:create',
    update: 'delivery_message:update',
  },
  CONTACT_US: {
    read: 'contact_us:read',
    handle: 'contact_us:handle',
  },
  STATISTICS: {
    read: 'statistics:read',
  },
} as const
