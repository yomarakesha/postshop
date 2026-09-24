"""
Реестр всех кодов разрешений (ACL).
Формат: {ресурс}:{действие}
"""


class Perm:
    # ── Users ─────────────────────────────────────────────
    USERS_READ               = "users:read"
    USERS_CREATE             = "users:create"
    USERS_UPDATE             = "users:update"
    USERS_BLOCK              = "users:block"
    USERS_MANAGE_PERMISSIONS = "users:manage_permissions"

    # ── Brands ────────────────────────────────────────────
    BRANDS_READ   = "brands:read"
    BRANDS_CREATE = "brands:create"
    BRANDS_UPDATE = "brands:update"
    BRANDS_BLOCK  = "brands:block"

    # ── Categories ────────────────────────────────────────
    CATEGORIES_READ   = "categories:read"
    CATEGORIES_CREATE = "categories:create"
    CATEGORIES_UPDATE = "categories:update"
    CATEGORIES_BLOCK  = "categories:block"

    # ── Countries ─────────────────────────────────────────
    COUNTRIES_READ   = "countries:read"
    COUNTRIES_CREATE = "countries:create"
    COUNTRIES_UPDATE = "countries:update"
    COUNTRIES_BLOCK  = "countries:block"

    # ── Regions ───────────────────────────────────────────
    REGIONS_READ   = "regions:read"
    REGIONS_CREATE = "regions:create"
    REGIONS_UPDATE = "regions:update"
    REGIONS_BLOCK  = "regions:block"

    # ── Cities ────────────────────────────────────────────
    CITIES_READ   = "cities:read"
    CITIES_CREATE = "cities:create"
    CITIES_UPDATE = "cities:update"
    CITIES_BLOCK  = "cities:block"

    # ── Currencies ────────────────────────────────────────
    CURRENCIES_READ   = "currencies:read"
    CURRENCIES_CREATE = "currencies:create"
    CURRENCIES_UPDATE = "currencies:update"
    CURRENCIES_BLOCK  = "currencies:block"

    # ── Measure Units ─────────────────────────────────────
    MEASURE_UNITS_READ   = "measure_units:read"
    MEASURE_UNITS_CREATE = "measure_units:create"
    MEASURE_UNITS_UPDATE = "measure_units:update"
    MEASURE_UNITS_BLOCK  = "measure_units:block"

    # ── Shop Bases ────────────────────────────────────────
    SHOP_BASES_READ      = "shop_bases:read"
    SHOP_BASES_CREATE    = "shop_bases:create"
    SHOP_BASES_UPDATE    = "shop_bases:update"
    SHOP_BASES_BLOCK     = "shop_bases:block"

    # ── Shop Additionals ──────────────────────────────────
    SHOP_ADDITIONALS_READ   = "shop_additionals:read"
    SHOP_ADDITIONALS_CREATE = "shop_additionals:create"
    SHOP_ADDITIONALS_UPDATE = "shop_additionals:update"

    # ── Products ──────────────────────────────────────────
    PRODUCTS_READ     = "products:read"
    PRODUCTS_CREATE   = "products:create"
    PRODUCTS_UPDATE   = "products:update"
    PRODUCTS_BLOCK    = "products:block"
    PRODUCTS_MODERATE = "products:moderate"

    # ── Banners ───────────────────────────────────────────
    BANNERS_READ   = "banners:read"
    BANNERS_CREATE = "banners:create"
    BANNERS_UPDATE = "banners:update"
    BANNERS_DELETE = "banners:delete"
    BANNERS_BLOCK  = "banners:block"

    # ── Collections ───────────────────────────────────────
    COLLECTIONS_READ   = "collections:read"
    COLLECTIONS_CREATE = "collections:create"
    COLLECTIONS_UPDATE = "collections:update"
    COLLECTIONS_BLOCK  = "collections:block"
    COLLECTIONS_DELETE = "collections:delete"

    # ── Cart ──────────────────────────────────────────────
    CART_READ   = "cart:read"
    CART_MANAGE = "cart:manage"

    # ── Favorites ─────────────────────────────────────────
    FAVORITES_READ   = "favorites:read"
    FAVORITES_MANAGE = "favorites:manage"

    # Свои адреса доставки. Как корзина и избранное — сущность личная, поэтому
    # проверка «своё или чужое» стоит в роутере, а не в праве.
    ADDRESSES_READ   = "addresses:read"
    ADDRESSES_MANAGE = "addresses:manage"

    # Отзывы. Оставить отзыв может покупатель, проверяет его платформа —
    # reviews:moderate новым пользователям не выдаётся, это признак сотрудника.
    REVIEWS_CREATE   = "reviews:create"
    REVIEWS_MODERATE = "reviews:moderate"

    # Возвраты. Заявку подаёт покупатель, решение принимает платформа —
    # returns:manage новым пользователям не выдаётся.
    RETURNS_CREATE = "returns:create"
    RETURNS_MANAGE = "returns:manage"

    # ── Warehouses ────────────────────────────────────────
    WAREHOUSES_READ   = "warehouses:read"
    WAREHOUSES_CREATE = "warehouses:create"
    WAREHOUSES_UPDATE = "warehouses:update"
    WAREHOUSES_BLOCK  = "warehouses:block"

    # ── Delivery Message ──────────────────────────────────
    DELIVERY_MESSAGE_READ   = "delivery_message:read"
    DELIVERY_MESSAGE_CREATE = "delivery_message:create"
    DELIVERY_MESSAGE_UPDATE = "delivery_message:update"

    # ── Stock Operations (FBS) ────────────────────────────
    STOCK_OPERATIONS_READ   = "stock_operations:read"
    STOCK_OPERATIONS_CREATE = "stock_operations:create"

    # ── Warehouse Operations (FBO) ────────────────────────
    WAREHOUSE_OPERATIONS_READ   = "warehouse_operations:read"
    WAREHOUSE_OPERATIONS_CREATE = "warehouse_operations:create"

    # ── Stock Receipts (FBO intake) ───────────────────────
    STOCK_RECEIPTS_READ    = "stock_receipts:read"
    STOCK_RECEIPTS_CREATE  = "stock_receipts:create"
    STOCK_RECEIPTS_CONFIRM = "stock_receipts:confirm"

    # ── Order Statuses ────────────────────────────────────
    ORDER_STATUSES_UPDATE = "order_statuses:update"

    # ── Pickup Points ─────────────────────────────────────
    PICKUP_POINTS_READ   = "pickup_points:read"
    PICKUP_POINTS_CREATE = "pickup_points:create"
    PICKUP_POINTS_UPDATE = "pickup_points:update"
    PICKUP_POINTS_BLOCK  = "pickup_points:block"

    # ── Orders ────────────────────────────────────────────
    ORDERS_CREATE             = "orders:create"
    ORDERS_READ               = "orders:read"
    ORDERS_READ_OWN           = "orders:read_own"
    ORDERS_UPDATE_STATUS      = "orders:update_status"
    ORDERS_UPDATE_SHOP_STATUS = "orders:update_shop_status"

    # ── Statistics ────────────────────────────────────────
    STATISTICS_READ = "statistics:read"

    # ── Contact Us ────────────────────────────────────────
    CONTACT_US_READ = "contact_us:read"
    CONTACT_US_HANDLE = "contact_us:handle"




# Полный список всех прав с описаниями (используется в seed)
ALL_PERMISSIONS: list[dict] = [
    # Users
    {"code": Perm.USERS_READ,               "description": "View users list"},
    {"code": Perm.USERS_CREATE,             "description": "Create new users"},
    {"code": Perm.USERS_UPDATE,             "description": "Update user info"},
    {"code": Perm.USERS_BLOCK,              "description": "Block / unblock users"},
    {"code": Perm.USERS_MANAGE_PERMISSIONS, "description": "Grant / revoke permissions for users"},

    # Brands
    {"code": Perm.BRANDS_READ,   "description": "View brands"},
    {"code": Perm.BRANDS_CREATE, "description": "Create brands"},
    {"code": Perm.BRANDS_UPDATE, "description": "Update brands"},
    {"code": Perm.BRANDS_BLOCK,  "description": "Block / unblock brands"},

    # Categories
    {"code": Perm.CATEGORIES_READ,   "description": "View categories"},
    {"code": Perm.CATEGORIES_CREATE, "description": "Create categories"},
    {"code": Perm.CATEGORIES_UPDATE, "description": "Update categories"},
    {"code": Perm.CATEGORIES_BLOCK,  "description": "Block / unblock categories"},

    # Countries
    {"code": Perm.COUNTRIES_READ,   "description": "View countries"},
    {"code": Perm.COUNTRIES_CREATE, "description": "Create countries"},
    {"code": Perm.COUNTRIES_UPDATE, "description": "Update countries"},
    {"code": Perm.COUNTRIES_BLOCK,  "description": "Block / unblock countries"},

    # Regions
    {"code": Perm.REGIONS_READ,   "description": "View regions"},
    {"code": Perm.REGIONS_CREATE, "description": "Create regions"},
    {"code": Perm.REGIONS_UPDATE, "description": "Update regions"},
    {"code": Perm.REGIONS_BLOCK,  "description": "Block / unblock regions"},

    # Cities
    {"code": Perm.CITIES_READ,   "description": "View cities"},
    {"code": Perm.CITIES_CREATE, "description": "Create cities"},
    {"code": Perm.CITIES_UPDATE, "description": "Update cities"},
    {"code": Perm.CITIES_BLOCK,  "description": "Block / unblock cities"},

    # Currencies
    {"code": Perm.CURRENCIES_READ,   "description": "View currencies"},
    {"code": Perm.CURRENCIES_CREATE, "description": "Create currencies"},
    {"code": Perm.CURRENCIES_UPDATE, "description": "Update currencies"},
    {"code": Perm.CURRENCIES_BLOCK,  "description": "Block / unblock currencies"},

    # Measure Units
    {"code": Perm.MEASURE_UNITS_READ,   "description": "View measure units"},
    {"code": Perm.MEASURE_UNITS_CREATE, "description": "Create measure units"},
    {"code": Perm.MEASURE_UNITS_UPDATE, "description": "Update measure units"},
    {"code": Perm.MEASURE_UNITS_BLOCK,  "description": "Block / unblock measure units"},

    # Shop Bases
    {"code": Perm.SHOP_BASES_READ,      "description": "View shop bases"},
    {"code": Perm.SHOP_BASES_CREATE,    "description": "Create shop bases"},
    {"code": Perm.SHOP_BASES_UPDATE,    "description": "Update shop bases"},
    {"code": Perm.SHOP_BASES_BLOCK,     "description": "Block / unblock shop bases"},

    # Shop Additionals
    {"code": Perm.SHOP_ADDITIONALS_READ,   "description": "View shop additionals"},
    {"code": Perm.SHOP_ADDITIONALS_CREATE, "description": "Create shop additionals"},
    {"code": Perm.SHOP_ADDITIONALS_UPDATE, "description": "Update shop additionals"},

    # Products
    {"code": Perm.PRODUCTS_READ,     "description": "View products"},
    {"code": Perm.PRODUCTS_CREATE,   "description": "Create products"},
    {"code": Perm.PRODUCTS_UPDATE,   "description": "Update products"},
    {"code": Perm.PRODUCTS_BLOCK,    "description": "Block / unblock products"},
    {"code": Perm.PRODUCTS_MODERATE, "description": "Approve / decline products (moderation)"},

    # Banners
    {"code": Perm.BANNERS_READ,   "description": "View banners"},
    {"code": Perm.BANNERS_CREATE, "description": "Create banners"},
    {"code": Perm.BANNERS_UPDATE, "description": "Update banners / upload images"},
    {"code": Perm.BANNERS_DELETE, "description": "Delete banners"},
    {"code": Perm.BANNERS_BLOCK,  "description": "Block / unblock banners"},

    # Collections
    {"code": Perm.COLLECTIONS_READ,   "description": "View collections"},
    {"code": Perm.COLLECTIONS_CREATE, "description": "Create collections"},
    {"code": Perm.COLLECTIONS_UPDATE, "description": "Update collections"},
    {"code": Perm.COLLECTIONS_BLOCK,  "description": "Block / unblock collections"},
    {"code": Perm.COLLECTIONS_DELETE, "description": "Delete collections"},

    # Cart
    {"code": Perm.CART_READ,   "description": "View own cart"},
    {"code": Perm.CART_MANAGE, "description": "Add / update / remove items in own cart"},

    # Favorites
    {"code": Perm.FAVORITES_READ,   "description": "View own favorites"},
    {"code": Perm.FAVORITES_MANAGE, "description": "Add / remove products from favorites"},

    {"code": Perm.ADDRESSES_READ,   "description": "View own saved delivery addresses"},
    {"code": Perm.ADDRESSES_MANAGE, "description": "Add / update / remove own delivery addresses"},

    {"code": Perm.REVIEWS_CREATE,   "description": "Leave a review for a purchased product"},
    {"code": Perm.REVIEWS_MODERATE, "description": "Approve / reject / remove reviews"},

    {"code": Perm.RETURNS_CREATE, "description": "Request a return for a purchased item"},
    {"code": Perm.RETURNS_MANAGE, "description": "Approve / reject return requests"},

    # Warehouses
    {"code": Perm.WAREHOUSES_READ,   "description": "View warehouses"},
    {"code": Perm.WAREHOUSES_CREATE, "description": "Create warehouses"},
    {"code": Perm.WAREHOUSES_UPDATE, "description": "Update warehouses"},
    {"code": Perm.WAREHOUSES_BLOCK,  "description": "Block / unblock warehouses"},

    # Delivery Message
    {"code": Perm.DELIVERY_MESSAGE_READ,   "description": "View delivery message text"},
    {"code": Perm.DELIVERY_MESSAGE_CREATE, "description": "Create delivery message text (singleton)"},
    {"code": Perm.DELIVERY_MESSAGE_UPDATE, "description": "Update delivery message text"},

    # Stock Operations (FBS)
    {"code": Perm.STOCK_OPERATIONS_READ,   "description": "View FBS product stock operations and balance"},
    {"code": Perm.STOCK_OPERATIONS_CREATE, "description": "Create FBS stock operation"},

    # Warehouse Operations (FBO)
    {"code": Perm.WAREHOUSE_OPERATIONS_READ,   "description": "View FBO warehouse operations and balance"},
    {"code": Perm.WAREHOUSE_OPERATIONS_CREATE, "description": "Create FBO warehouse operation"},

    # Stock Receipts (FBO intake)
    {"code": Perm.STOCK_RECEIPTS_READ,    "description": "View stock receipts"},
    {"code": Perm.STOCK_RECEIPTS_CREATE,  "description": "Create receipt and manage its items"},
    {"code": Perm.STOCK_RECEIPTS_CONFIRM, "description": "Confirm stock receipt and post to warehouse"},

    # Order Statuses
    {"code": Perm.ORDER_STATUSES_UPDATE, "description": "Manage translations for order statuses"},

    # Pickup Points
    {"code": Perm.PICKUP_POINTS_READ,   "description": "View pickup points"},
    {"code": Perm.PICKUP_POINTS_CREATE, "description": "Create pickup points"},
    {"code": Perm.PICKUP_POINTS_UPDATE, "description": "Update pickup points"},
    {"code": Perm.PICKUP_POINTS_BLOCK,  "description": "Block / unblock pickup points"},

    # Orders
    {"code": Perm.ORDERS_CREATE,        "description": "Create an order from own cart"},
    {"code": Perm.ORDERS_READ,          "description": "View all orders (admin)"},
    {"code": Perm.ORDERS_READ_OWN,      "description": "View own orders"},
    {"code": Perm.ORDERS_UPDATE_STATUS, "description": "Change global order status (admin)"},
    {"code": Perm.ORDERS_UPDATE_SHOP_STATUS, "description": "Change local (shop) order status"},

    # Statistics
    {"code": Perm.STATISTICS_READ, "description": "View aggregated statistics (shops, clients, orders)"},

    # Contact Us
    {"code": Perm.CONTACT_US_READ, "description": "View contact-us form submissions"},
    {"code": Perm.CONTACT_US_HANDLE, "description": "Mark contact-us submissions as handled"},
]


