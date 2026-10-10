"""
Демо-данные для разработки: справочники, администратор, продавец с магазином,
покупатель, категории, бренды и товары с остатками.

Нужен тому, кто только склонировал репозиторий: после миграций база пустая,
и витрина, админка и приложение показывают пустые экраны. Настоящую базу в git
класть нельзя — репозиторий публичный, а в ней телефоны и хэши паролей.

Скрипт идемпотентный: каждая запись ищется по естественному ключу (код,
имя, телефон, штрихкод) и создаётся, только если её нет. Повторный запуск
ничего не дублирует. На рабочем сервере не запускать — пароли известны всем.

Использование (после alembic upgrade head и seed_permissions.py):
    python scripts/seed_demo.py

Входы:
    админка      admin / admin123
    продавец     +99361000001 (код из SMS — в журнале бэкенда при SMS_ENABLED=false)
                 или seller / seller123
    покупатель   +99361000002
"""
import sys
import os
import asyncio
from decimal import Decimal

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from PIL import Image, ImageDraw
from sqlalchemy import or_, select
from app.database import AsyncSessionLocal, engine
from app.core.security import hash_password
from app.routers.auth import NEW_USER_PERMISSIONS
from app.models.brand import Brand
from app.models.category import Category
from app.models.category_translation import CategoryTranslation
from app.models.city import City
from app.models.city_translation import CityTranslation
from app.models.country import Country
from app.models.country_translation import CountryTranslation
from app.models.currency import Currency
from app.models.currency_translation import CurrencyTranslation
from app.models.measure_unit import MeasureUnit
from app.models.measure_unit_translation import MeasureUnitTranslation
from app.models.permission import Permission
from app.models.pickup_point import PickupPoint
from app.models.product import DiscountType, Product, ProductStatus
from app.models.product_translation import ProductTranslation
from app.models.region import Region
from app.models.region_translation import RegionTranslation
from app.models.shop_additional import ShopAdditional, WarehouseType
from app.models.shop_base import LegalEntityType, RegistrationStatus, ShopBase
from app.models.stock_operation import OperationType, StockOperation
from app.models.user import User
from app.models.user_permission import UserPermission
from app.models.warehouse import Warehouse


# Переводы: (ru, tk, en).
CURRENCIES = {
    "tmt": ("Туркменский манат", "Türkmen manady", "Turkmen manat"),
    "usd": ("Доллар США", "ABŞ dollary", "US dollar"),
}

MEASURE_UNITS = {
    "pcs": ("шт", "sany", "pcs"),
    "kg": ("кг", "kg", "kg"),
    "l": ("л", "l", "l"),
}

# Велаяты и их центры.
REGIONS = [
    (("Ашхабад", "Aşgabat", "Ashgabat"), ("Ашхабад", "Aşgabat", "Ashgabat")),
    (("Ахалский велаят", "Ahal welaýaty", "Ahal Region"), ("Аркадаг", "Arkadag", "Arkadag")),
    (("Балканский велаят", "Balkan welaýaty", "Balkan Region"), ("Балканабад", "Balkanabat", "Balkanabat")),
    (("Дашогузский велаят", "Daşoguz welaýaty", "Dashoguz Region"), ("Дашогуз", "Daşoguz", "Dashoguz")),
    (("Лебапский велаят", "Lebap welaýaty", "Lebap Region"), ("Туркменабад", "Türkmenabat", "Turkmenabat")),
    (("Марыйский велаят", "Mary welaýaty", "Mary Region"), ("Мары", "Mary", "Mary")),
]

BRANDS = ["Samsung", "Apple", "Xiaomi", "Philips", "Bosch", "Adidas", "Nike", "Ýaşlyk"]

# Корневая категория -> подкатегории.
CATEGORIES = [
    (("Электроника", "Elektronika", "Electronics"), [
        ("Смартфоны", "Smartfonlar", "Smartphones"),
        ("Наушники", "Gulakçynlar", "Headphones"),
    ]),
    (("Бытовая техника", "Öý tehnikasy", "Home appliances"), [
        ("Для кухни", "Aşhana üçin", "Kitchen"),
        ("Уход за домом", "Öý arassaçylygy", "Home care"),
    ]),
    (("Одежда и обувь", "Egin-eşik we aýakgap", "Clothing and shoes"), [
        ("Кроссовки", "Krossowkalar", "Sneakers"),
        ("Спортивная одежда", "Sport eşikleri", "Sportswear"),
    ]),
    (("Продукты", "Azyk önümleri", "Groceries"), [
        ("Напитки", "Içgiler", "Drinks"),
    ]),
]

# (ru-название категории, бренд, ru, tk, en, цена TMT, скидка %, остаток)
PRODUCTS = [
    ("Смартфоны", "Samsung", "Samsung Galaxy A55", "Samsung Galaxy A55", "Samsung Galaxy A55", "6500", None, 12),
    ("Смартфоны", "Apple", "iPhone 15 128 ГБ", "iPhone 15 128 GB", "iPhone 15 128 GB", "14900", "5", 5),
    ("Смартфоны", "Xiaomi", "Xiaomi Redmi Note 13", "Xiaomi Redmi Note 13", "Xiaomi Redmi Note 13", "3900", "10", 20),
    ("Наушники", "Apple", "AirPods Pro 2", "AirPods Pro 2", "AirPods Pro 2", "4200", None, 8),
    ("Наушники", "Xiaomi", "Беспроводные наушники Redmi Buds 5", "Redmi Buds 5 simsiz gulakçyny", "Redmi Buds 5 wireless earbuds", "650", None, 30),
    ("Для кухни", "Philips", "Электрочайник Philips 1,7 л", "Philips elektrik çäýnegi 1,7 l", "Philips electric kettle 1.7 L", "420", "15", 15),
    ("Для кухни", "Bosch", "Блендер Bosch ErgoMixx", "Bosch ErgoMixx blender", "Bosch ErgoMixx blender", "780", None, 6),
    ("Уход за домом", "Philips", "Утюг Philips 2000", "Philips 2000 ütügi", "Philips 2000 iron", "560", None, 10),
    ("Уход за домом", "Bosch", "Пылесос Bosch Serie 4", "Bosch Serie 4 tozsorujy", "Bosch Serie 4 vacuum cleaner", "2100", "7", 4),
    ("Кроссовки", "Adidas", "Кроссовки Adidas Runfalcon 3", "Adidas Runfalcon 3 krossowkasy", "Adidas Runfalcon 3 sneakers", "890", None, 18),
    ("Кроссовки", "Nike", "Кроссовки Nike Revolution 7", "Nike Revolution 7 krossowkasy", "Nike Revolution 7 sneakers", "950", "20", 14),
    ("Спортивная одежда", "Adidas", "Спортивный костюм Adidas", "Adidas sport eşigi", "Adidas tracksuit", "1100", None, 9),
    ("Напитки", "Ýaşlyk", "Минеральная вода Ýaşlyk 1,5 л", "Ýaşlyk mineral suwy 1,5 l", "Ýaşlyk mineral water 1.5 L", "4", None, 200),
    ("Напитки", None, "Зелёный чай, 100 г", "Gök çaý, 100 g", "Green tea, 100 g", "35", None, 50),
    # Новые товары добавлять только в конец: штрихкод строится по номеру строки.
    ("Смартфоны", "Samsung", "Samsung Galaxy S24", "Samsung Galaxy S24", "Samsung Galaxy S24", "13500", "8", 7),
    ("Смартфоны", "Samsung", "Samsung Galaxy A15", "Samsung Galaxy A15", "Samsung Galaxy A15", "2900", None, 25),
    ("Смартфоны", "Apple", "iPhone 15 Pro 256 ГБ", "iPhone 15 Pro 256 GB", "iPhone 15 Pro 256 GB", "21900", None, 3),
    ("Смартфоны", "Apple", "iPhone 13 128 ГБ", "iPhone 13 128 GB", "iPhone 13 128 GB", "10900", "12", 6),
    ("Смартфоны", "Xiaomi", "Xiaomi 14T", "Xiaomi 14T", "Xiaomi 14T", "8900", None, 9),
    ("Смартфоны", "Xiaomi", "Xiaomi Redmi 13C", "Xiaomi Redmi 13C", "Xiaomi Redmi 13C", "2300", "5", 40),
    ("Наушники", "Samsung", "Samsung Galaxy Buds FE", "Samsung Galaxy Buds FE", "Samsung Galaxy Buds FE", "1500", None, 16),
    ("Наушники", "Apple", "AirPods 3", "AirPods 3", "AirPods 3", "3100", "10", 11),
    ("Наушники", "Philips", "Накладные наушники Philips TAH4205", "Philips TAH4205 gulakçyny", "Philips TAH4205 on-ear headphones", "540", None, 22),
    ("Наушники", "Xiaomi", "Наушники Xiaomi Buds 4 Lite", "Xiaomi Buds 4 Lite gulakçyny", "Xiaomi Buds 4 Lite earbuds", "480", "15", 35),
    ("Для кухни", "Philips", "Тостер Philips Daily", "Philips Daily tosteri", "Philips Daily toaster", "390", None, 12),
    ("Для кухни", "Philips", "Аэрогриль Philips Airfryer 3000", "Philips Airfryer 3000", "Philips Airfryer 3000", "2400", "10", 5),
    ("Для кухни", "Bosch", "Кофемашина Bosch Tassimo", "Bosch Tassimo kofe maşyny", "Bosch Tassimo coffee machine", "1900", None, 4),
    ("Для кухни", "Bosch", "Микроволновая печь Bosch Serie 2", "Bosch Serie 2 mikrotolkunly peç", "Bosch Serie 2 microwave oven", "2700", "6", 3),
    ("Для кухни", "Xiaomi", "Электрочайник Xiaomi Mi Kettle", "Xiaomi Mi Kettle çäýnegi", "Xiaomi Mi Kettle", "350", None, 28),
    ("Уход за домом", "Xiaomi", "Робот-пылесос Xiaomi Robot Vacuum S10", "Xiaomi Robot Vacuum S10", "Xiaomi Robot Vacuum S10", "4300", "9", 6),
    ("Уход за домом", "Philips", "Отпариватель Philips 3000", "Philips 3000 bug ütügi", "Philips 3000 garment steamer", "690", None, 13),
    ("Уход за домом", "Bosch", "Стиральная машина Bosch Serie 6", "Bosch Serie 6 kir ýuwujy maşyn", "Bosch Serie 6 washing machine", "9800", None, 2),
    ("Уход за домом", "Samsung", "Пылесос Samsung Jet 60", "Samsung Jet 60 tozsorujy", "Samsung Jet 60 vacuum cleaner", "3600", "11", 5),
    ("Кроссовки", "Adidas", "Кроссовки Adidas Ultraboost Light", "Adidas Ultraboost Light krossowkasy", "Adidas Ultraboost Light sneakers", "2800", "15", 8),
    ("Кроссовки", "Adidas", "Кеды Adidas Grand Court", "Adidas Grand Court kedasy", "Adidas Grand Court sneakers", "1050", None, 19),
    ("Кроссовки", "Nike", "Кроссовки Nike Air Max SC", "Nike Air Max SC krossowkasy", "Nike Air Max SC sneakers", "1650", None, 12),
    ("Кроссовки", "Nike", "Кроссовки Nike Pegasus 41", "Nike Pegasus 41 krossowkasy", "Nike Pegasus 41 sneakers", "2500", "10", 7),
    ("Спортивная одежда", "Nike", "Футболка Nike Dri-FIT", "Nike Dri-FIT futbolkasy", "Nike Dri-FIT T-shirt", "420", None, 45),
    ("Спортивная одежда", "Nike", "Шорты Nike Challenger", "Nike Challenger şortigi", "Nike Challenger shorts", "480", "20", 30),
    ("Спортивная одежда", "Adidas", "Толстовка Adidas Essentials", "Adidas Essentials switşoty", "Adidas Essentials hoodie", "890", None, 17),
    ("Спортивная одежда", "Adidas", "Ветровка Adidas Own The Run", "Adidas Own The Run kurtkasy", "Adidas Own The Run jacket", "1250", "12", 10),
    ("Напитки", "Ýaşlyk", "Минеральная вода Ýaşlyk 0,5 л", "Ýaşlyk mineral suwy 0,5 l", "Ýaşlyk mineral water 0.5 L", "2", None, 500),
    ("Напитки", "Ýaşlyk", "Лимонад Ýaşlyk груша 1 л", "Ýaşlyk armyt limonady 1 l", "Ýaşlyk pear lemonade 1 L", "9", None, 120),
    ("Напитки", None, "Чёрный чай, 250 г", "Gara çaý, 250 g", "Black tea, 250 g", "60", "10", 80),
    ("Напитки", None, "Яблочный сок, 1 л", "Alma şiresi, 1 l", "Apple juice, 1 L", "18", None, 90),
    ("Напитки", None, "Молотый кофе, 250 г", "Üwelen kofe, 250 g", "Ground coffee, 250 g", "140", "5", 40),
]

LANGUAGES = ("ru", "tk", "en")


def _translations(model, names, **extra):
    return [model(language=lang, name=name, **extra) for lang, name in zip(LANGUAGES, names)]


async def _first(db, stmt):
    return (await db.execute(stmt)).scalars().first()


async def seed_reference(db) -> dict:
    currencies = {}
    for code, names in CURRENCIES.items():
        currency = await _first(db, select(Currency).where(Currency.code == code))
        if currency is None:
            currency = Currency(code=code, is_active=True)
            currency.translations = _translations(CurrencyTranslation, names)
            db.add(currency)
        currencies[code] = currency

    units = {}
    for code, names in MEASURE_UNITS.items():
        unit = await _first(db, select(MeasureUnit).where(MeasureUnit.code == code))
        if unit is None:
            unit = MeasureUnit(code=code, is_active=True)
            unit.translations = _translations(MeasureUnitTranslation, names)
            db.add(unit)
        units[code] = unit

    country = await _first(db, select(Country).where(Country.iso_code == "TKM"))
    if country is None:
        country = Country(iso_code="TKM", is_active=True)
        country.translations = _translations(
            CountryTranslation, ("Туркменистан", "Türkmenistan", "Turkmenistan")
        )
        db.add(country)
        await db.flush()

    cities = {}
    for region_names, city_names in REGIONS:
        region = await _first(
            db,
            select(Region).join(RegionTranslation)
            .where(RegionTranslation.language == "ru", RegionTranslation.name == region_names[0]),
        )
        if region is None:
            region = Region(country_id=country.id, is_active=True)
            region.translations = _translations(RegionTranslation, region_names)
            db.add(region)
            await db.flush()
        city = await _first(
            db,
            select(City).join(CityTranslation)
            .where(CityTranslation.language == "ru", CityTranslation.name == city_names[0]),
        )
        if city is None:
            city = City(region_id=region.id, is_active=True)
            city.translations = _translations(CityTranslation, city_names)
            db.add(city)
        cities[city_names[0]] = city

    await db.flush()
    return {"currencies": currencies, "units": units, "cities": cities}


async def seed_logistics(db, cities) -> None:
    ashgabat = cities["Ашхабад"]
    if await _first(db, select(Warehouse).where(Warehouse.name == "Склад Postshop, Ашхабад")) is None:
        db.add(Warehouse(
            name="Склад Postshop, Ашхабад",
            address="Ашхабад, ул. Битарап Туркменистан, 1",
            phone_numbers=["+99312000000"],
            is_active=True,
        ))
    points = [
        ("Пункт выдачи «Центр»", "Ашхабад, просп. Махтумкули, 10", "37.9375000", "58.3800000"),
        ("Пункт выдачи «Гурбансолтан эдже»", "Ашхабад, просп. Гурбансолтан эдже, 45", "37.9180000", "58.3920000"),
    ]
    for name, address, lat, lon in points:
        if await _first(db, select(PickupPoint).where(PickupPoint.name == name)) is None:
            db.add(PickupPoint(
                city_id=ashgabat.id, name=name, address=address,
                latitude=Decimal(lat), longitude=Decimal(lon), is_active=True,
            ))


async def _get_or_create_user(db, *, phone, username=None, **fields) -> tuple[User, bool]:
    # Ищем и по логину: admin мог появиться раньше через create_superuser.py
    # с другим телефоном, и вставка упала бы на уникальности username.
    cond = User.phone == phone
    if username:
        cond = or_(cond, User.username == username)
    user = await _first(db, select(User).where(cond))
    if user is not None:
        return user, False
    user = User(phone=phone, username=username, is_active=True, **fields)
    db.add(user)
    await db.flush()
    return user, True


async def _grant(db, user: User, codes) -> None:
    query = select(Permission)
    if codes is not None:
        query = query.where(Permission.code.in_(codes))
    have = set((await db.execute(
        select(UserPermission.permission_id).where(UserPermission.user_id == user.id)
    )).scalars())
    for perm in (await db.execute(query)).scalars():
        if perm.id not in have:
            db.add(UserPermission(user_id=user.id, permission_id=perm.id))


async def seed_users(db) -> dict:
    admin, created = await _get_or_create_user(
        db, phone="+99361000000", username="admin", name="Админ", surname="Демо",
        password=hash_password("admin123"),
    )
    await _grant(db, admin, None)  # все права

    seller, _ = await _get_or_create_user(
        db, phone="+99361000001", username="seller", name="Продавец", surname="Демо",
        password=hash_password("seller123"), client=True,
    )
    await _grant(db, seller, NEW_USER_PERMISSIONS)

    buyer, _ = await _get_or_create_user(
        db, phone="+99361000002", name="Покупатель", surname="Демо", client=True,
    )
    await _grant(db, buyer, NEW_USER_PERMISSIONS)

    return {"admin": admin, "seller": seller, "buyer": buyer}


DEMO_LOGO_PATH = "uploads/logos/demo_shop.webp"


def _ensure_demo_logo() -> str:
    """Рисует логотип-заглушку, если файла ещё нет, и возвращает путь для БД."""
    file_path = os.path.join(os.path.dirname(__file__), "..", DEMO_LOGO_PATH)
    if not os.path.exists(file_path):
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        logo = Image.new("RGB", (256, 256), "#1E88E5")
        ImageDraw.Draw(logo).ellipse((64, 64, 192, 192), fill="#FFFFFF")
        logo.save(file_path, "WEBP")
    return DEMO_LOGO_PATH


async def seed_shop(db, seller: User, cities) -> ShopBase:
    shop = await _first(db, select(ShopBase).where(ShopBase.owner_id == seller.id))
    if shop is not None:
        # Магазин без логотипа покупателю не виден вместе со всеми товарами
        # (app/core/visibility.py) — чиним и магазины, созданные до этой правки.
        profile = await _first(db, select(ShopAdditional).where(ShopAdditional.shop_base_id == shop.id))
        if profile is not None and not profile.logo_path:
            profile.logo_path = _ensure_demo_logo()
        return shop
    shop = ShopBase(
        owner_id=seller.id,
        legal_entity_type=LegalEntityType.individual_entrepreneur,
        # Документы не прикладываем: файлов нет, а одобрение через API без них
        # невозможно — поэтому магазин сразу создаётся одобренным.
        documents=[],
        is_active=True,
        registration_status=RegistrationStatus.approved,
    )
    db.add(shop)
    await db.flush()
    db.add(ShopAdditional(
        shop_base_id=shop.id,
        city_id=cities["Ашхабад"].id,
        warehouse_type=WarehouseType.fbs,
        name="Демо-магазин",
        logo_path=_ensure_demo_logo(),
        description="Магазин с тестовыми товарами для разработки.",
        addresses=["Ашхабад, просп. Махтумкули, 25"],
        phone_numbers=["+99361000001"],
        color="#1E88E5",
        color_text="#FFFFFF",
    ))
    return shop


async def seed_catalog(db) -> tuple[dict, dict]:
    brands = {}
    for name in BRANDS:
        brand = await _first(db, select(Brand).where(Brand.name == name))
        if brand is None:
            brand = Brand(name=name, is_active=True)
            db.add(brand)
        brands[name] = brand

    async def category(names, parent_id):
        found = await _first(
            db,
            select(Category).join(CategoryTranslation)
            .where(CategoryTranslation.language == "ru", CategoryTranslation.name == names[0]),
        )
        if found is None:
            found = Category(parent_id=parent_id, is_active=True)
            found.translations = _translations(CategoryTranslation, names)
            db.add(found)
            await db.flush()
        return found

    categories = {}
    for root_names, children in CATEGORIES:
        root = await category(root_names, None)
        categories[root_names[0]] = root
        for child_names in children:
            categories[child_names[0]] = await category(child_names, root.id)

    await db.flush()
    return brands, categories


async def seed_products(db, shop, brands, categories, reference) -> int:
    tmt = reference["currencies"]["tmt"]
    pcs = reference["units"]["pcs"]
    added = 0
    for index, (cat, brand, ru, tk, en, price, discount, stock) in enumerate(PRODUCTS, start=1):
        barcode = f"2000000{index:06d}"
        if await _first(db, select(Product).where(Product.barcode == barcode)) is not None:
            continue
        product = Product(
            category_id=categories[cat].id,
            shop_base_id=shop.id,
            brand_id=brands[brand].id if brand else None,
            measure_unit_id=pcs.id,
            barcode=barcode,
            vendor_barcode=f"DEMO-{index:03d}",
            images=[],
            price=Decimal(price),
            currency_id=tmt.id,
            discount_type=DiscountType.percentage if discount else None,
            discount=Decimal(discount) if discount else None,
            is_active=True,
            status=ProductStatus.approved,
        )
        product.translations = [
            ProductTranslation(language=lang, name=name, description=name)
            for lang, name in zip(LANGUAGES, (ru, tk, en))
        ]
        db.add(product)
        await db.flush()
        db.add(StockOperation(
            shop_id=shop.id,
            product_id=product.id,
            measure_unit_id=pcs.id,
            operation_type=OperationType.income,
            quantity=Decimal(stock),
        ))
        added += 1
    return added


async def seed_demo():
    try:
        async with AsyncSessionLocal() as db:
            if await _first(db, select(Permission)) is None:
                print("[ERROR] Прав нет. Сначала запустите scripts/seed_permissions.py.")
                return
            reference = await seed_reference(db)
            await seed_logistics(db, reference["cities"])
            users = await seed_users(db)
            shop = await seed_shop(db, users["seller"], reference["cities"])
            brands, categories = await seed_catalog(db)
            added = await seed_products(db, shop, brands, categories, reference)
            await db.commit()
            print(f"[OK] Demo data ready: {added} products added ({len(PRODUCTS)} total).")
            print("   admin  / admin123   — админка")
            print("   seller / seller123  — продавец, телефон +99361000001")
            print("   покупатель          — телефон +99361000002")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_demo())
