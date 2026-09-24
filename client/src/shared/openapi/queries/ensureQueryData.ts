// generated with @7nohe/openapi-react-query-codegen@2.1.0 

import { type QueryClient } from "@tanstack/react-query";
import type { Options } from "../requests/sdk.gen";
import { downloadShopDocumentShopBasesShopIdDocumentsFilenameGet, getAllShopsFullShopBasesFullGet, getBannerBannersBannerIdGet, getBannersBannersGet, getBrandBrandsBrandIdGet, getBrandsBrandsGet, getBrandsByCategoryAndCityProductsBrandsGet, getCartCartGet, getCategoriesCategoriesGet, getCategoryCategoriesCategoryIdGet, getCitiesCitiesGet, getCityCitiesCityIdGet, getClientsStatisticsStatisticsClientsGet, getCollectionCollectionsCollectionIdGet, getCollectionsCollectionsGet, getCountriesCountriesGet, getCountryCountriesCountryIdGet, getCurrenciesCurrenciesGet, getCurrencyCurrenciesCurrencyIdGet, getFavoritesFavoritesGet, getMeasureUnitMeasureUnitsUnitIdGet, getMeasureUnitsMeasureUnitsGet, getMeUsersMeGet, getModerationCountProductsModerationCountGet, getModerationQueueProductsModerationGet, getMyOrdersOrdersMyGet, getMyProductsProductsMyGet, getOrderOrdersOrderIdGet, getOrdersOrdersGet, getOrdersStatisticsStatisticsOrdersGet, getOrderStatusesOrderStatusesGet, getOrderStatusOrderStatusesOrderStatusIdGet, getPendingShopsCountShopBasesPendingCountGet, getPickupPointPickupPointsPickupPointIdGet, getPickupPointsPickupPointsGet, getProductBalanceStockOperationsProductIdBalanceGet, getProductForModerationProductsModerationProductIdGet, getProductProductsProductIdGet, getProductsAvailabilityStockOperationsAvailabilityGet, getProductsProductsGet, getProductStockStockOperationsProductIdGet, getReceiptStockReceiptsReceiptIdGet, getRegionRegionsRegionIdGet, getRegionsRegionsGet, getShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet, getShopAdditionalShopAdditionalsShopAdditionalIdGet, getShopAdditionalsShopAdditionalsGet, getShopBaseShopBasesShopIdGet, getShopBasesShopBasesGet, getShopInsightsOrdersShopShopIdInsightsGet, getShopOrdersOrdersShopShopIdGet, getShopsStatisticsStatisticsShopsGet, getShopSummaryOrdersShopShopIdSummaryGet, getShopTopProductsOrdersShopShopIdTopProductsGet, getShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGet, getSimilarProductsProductsProductIdSimilarGet, getUserPermissionsPermissionsUserIdPermissionsGet, getUsersUsersGet, getUserUsersUserIdGet, getWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGet, getWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGet, getWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGet, getWarehousesWarehousesGet, getWarehouseWarehousesWarehouseIdGet, healthCheckGet, listAddressesUserAddressesGet, listAllPermissionsPermissionsGet, listNotificationsNotificationsGet, listOwnReturnsReturnsMyGet, listOwnReviewsReviewsMyGet, listProductReviewsReviewsProductProductIdGet, listReceiptsStockReceiptsGet, listReturnsReturnsGet, listShopReturnsReturnsShopShopIdGet, meAuthMeGet, moderationCountReviewsModerationCountGet, moderationQueueReviewsModerationGet, pendingCountReturnsCountGet, productReviewSummaryReviewsProductProductIdSummaryGet, readContactUsContactUsGet, readDeliveryMessageDeliveryMessageGet, readFeaturesFeaturesGet, reviewEligibilityReviewsProductProductIdEligibilityGet, searchSearchGet, unreadCountNotificationsUnreadCountGet } from "../requests/sdk.gen";
import { DownloadShopDocumentShopBasesShopIdDocumentsFilenameGetData, GetAllShopsFullShopBasesFullGetData, GetBannerBannersBannerIdGetData, GetBannersBannersGetData, GetBrandBrandsBrandIdGetData, GetBrandsBrandsGetData, GetBrandsByCategoryAndCityProductsBrandsGetData, GetCartCartGetData, GetCategoriesCategoriesGetData, GetCategoryCategoriesCategoryIdGetData, GetCitiesCitiesGetData, GetCityCitiesCityIdGetData, GetClientsStatisticsStatisticsClientsGetData, GetCollectionCollectionsCollectionIdGetData, GetCollectionsCollectionsGetData, GetCountriesCountriesGetData, GetCountryCountriesCountryIdGetData, GetCurrenciesCurrenciesGetData, GetCurrencyCurrenciesCurrencyIdGetData, GetFavoritesFavoritesGetData, GetMeasureUnitMeasureUnitsUnitIdGetData, GetMeasureUnitsMeasureUnitsGetData, GetMeUsersMeGetData, GetModerationCountProductsModerationCountGetData, GetModerationQueueProductsModerationGetData, GetMyOrdersOrdersMyGetData, GetMyProductsProductsMyGetData, GetOrderOrdersOrderIdGetData, GetOrdersOrdersGetData, GetOrdersStatisticsStatisticsOrdersGetData, GetOrderStatusesOrderStatusesGetData, GetOrderStatusOrderStatusesOrderStatusIdGetData, GetPendingShopsCountShopBasesPendingCountGetData, GetPickupPointPickupPointsPickupPointIdGetData, GetPickupPointsPickupPointsGetData, GetProductBalanceStockOperationsProductIdBalanceGetData, GetProductForModerationProductsModerationProductIdGetData, GetProductProductsProductIdGetData, GetProductsAvailabilityStockOperationsAvailabilityGetData, GetProductsProductsGetData, GetProductStockStockOperationsProductIdGetData, GetReceiptStockReceiptsReceiptIdGetData, GetRegionRegionsRegionIdGetData, GetRegionsRegionsGetData, GetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetData, GetShopAdditionalShopAdditionalsShopAdditionalIdGetData, GetShopAdditionalsShopAdditionalsGetData, GetShopBaseShopBasesShopIdGetData, GetShopBasesShopBasesGetData, GetShopInsightsOrdersShopShopIdInsightsGetData, GetShopOrdersOrdersShopShopIdGetData, GetShopsStatisticsStatisticsShopsGetData, GetShopSummaryOrdersShopShopIdSummaryGetData, GetShopTopProductsOrdersShopShopIdTopProductsGetData, GetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGetData, GetSimilarProductsProductsProductIdSimilarGetData, GetUserPermissionsPermissionsUserIdPermissionsGetData, GetUsersUsersGetData, GetUserUsersUserIdGetData, GetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGetData, GetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGetData, GetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGetData, GetWarehousesWarehousesGetData, GetWarehouseWarehousesWarehouseIdGetData, HealthCheckGetData, ListAddressesUserAddressesGetData, ListAllPermissionsPermissionsGetData, ListNotificationsNotificationsGetData, ListOwnReturnsReturnsMyGetData, ListOwnReviewsReviewsMyGetData, ListProductReviewsReviewsProductProductIdGetData, ListReceiptsStockReceiptsGetData, ListReturnsReturnsGetData, ListShopReturnsReturnsShopShopIdGetData, MeAuthMeGetData, ModerationCountReviewsModerationCountGetData, ModerationQueueReviewsModerationGetData, PendingCountReturnsCountGetData, ProductReviewSummaryReviewsProductProductIdSummaryGetData, ReadContactUsContactUsGetData, ReadDeliveryMessageDeliveryMessageGetData, ReadFeaturesFeaturesGetData, ReviewEligibilityReviewsProductProductIdEligibilityGetData, SearchSearchGetData, UnreadCountNotificationsUnreadCountGetData } from "../requests/types.gen";
import * as Common from "./common";
/**
* Me
*/
export const ensureUseMeAuthMeGetData = (queryClient: QueryClient, clientOptions: Options<MeAuthMeGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseMeAuthMeGetKeyFn(clientOptions), queryFn: () => meAuthMeGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Users
*/
export const ensureUseGetUsersUsersGetData = (queryClient: QueryClient, clientOptions: Options<GetUsersUsersGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetUsersUsersGetKeyFn(clientOptions), queryFn: () => getUsersUsersGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Me
*
* Текущий пользователь видит свой профиль и список своих прав.
*/
export const ensureUseGetMeUsersMeGetData = (queryClient: QueryClient, clientOptions: Options<GetMeUsersMeGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetMeUsersMeGetKeyFn(clientOptions), queryFn: () => getMeUsersMeGet({ ...clientOptions }).then(response => response.data) });
/**
* Get User
*/
export const ensureUseGetUserUsersUserIdGetData = (queryClient: QueryClient, clientOptions: Options<GetUserUsersUserIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetUserUsersUserIdGetKeyFn(clientOptions), queryFn: () => getUserUsersUserIdGet({ ...clientOptions }).then(response => response.data) });
/**
* List All Permissions
*
* Список всех доступных в системе прав.
*/
export const ensureUseListAllPermissionsPermissionsGetData = (queryClient: QueryClient, clientOptions: Options<ListAllPermissionsPermissionsGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseListAllPermissionsPermissionsGetKeyFn(clientOptions), queryFn: () => listAllPermissionsPermissionsGet({ ...clientOptions }).then(response => response.data) });
/**
* Get User Permissions
*
* Права пользователя вместе с тем, кто и когда их выдал.
*
* granted_at и granted_by писались, но не читались нигде — аудит выдачи прав
* был недостижим. Пустой granted_by означает системную выдачу: регистрация
* по SMS и первичное заполнение прав.
*/
export const ensureUseGetUserPermissionsPermissionsUserIdPermissionsGetData = (queryClient: QueryClient, clientOptions: Options<GetUserPermissionsPermissionsUserIdPermissionsGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetUserPermissionsPermissionsUserIdPermissionsGetKeyFn(clientOptions), queryFn: () => getUserPermissionsPermissionsUserIdPermissionsGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Brands
*/
export const ensureUseGetBrandsBrandsGetData = (queryClient: QueryClient, clientOptions: Options<GetBrandsBrandsGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetBrandsBrandsGetKeyFn(clientOptions), queryFn: () => getBrandsBrandsGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Brand
*/
export const ensureUseGetBrandBrandsBrandIdGetData = (queryClient: QueryClient, clientOptions: Options<GetBrandBrandsBrandIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetBrandBrandsBrandIdGetKeyFn(clientOptions), queryFn: () => getBrandBrandsBrandIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Categories
*/
export const ensureUseGetCategoriesCategoriesGetData = (queryClient: QueryClient, clientOptions: Options<GetCategoriesCategoriesGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetCategoriesCategoriesGetKeyFn(clientOptions), queryFn: () => getCategoriesCategoriesGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Category
*/
export const ensureUseGetCategoryCategoriesCategoryIdGetData = (queryClient: QueryClient, clientOptions: Options<GetCategoryCategoriesCategoryIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetCategoryCategoriesCategoryIdGetKeyFn(clientOptions), queryFn: () => getCategoryCategoriesCategoryIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Countries
*/
export const ensureUseGetCountriesCountriesGetData = (queryClient: QueryClient, clientOptions: Options<GetCountriesCountriesGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetCountriesCountriesGetKeyFn(clientOptions), queryFn: () => getCountriesCountriesGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Country
*/
export const ensureUseGetCountryCountriesCountryIdGetData = (queryClient: QueryClient, clientOptions: Options<GetCountryCountriesCountryIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetCountryCountriesCountryIdGetKeyFn(clientOptions), queryFn: () => getCountryCountriesCountryIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Regions
*/
export const ensureUseGetRegionsRegionsGetData = (queryClient: QueryClient, clientOptions: Options<GetRegionsRegionsGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetRegionsRegionsGetKeyFn(clientOptions), queryFn: () => getRegionsRegionsGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Region
*/
export const ensureUseGetRegionRegionsRegionIdGetData = (queryClient: QueryClient, clientOptions: Options<GetRegionRegionsRegionIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetRegionRegionsRegionIdGetKeyFn(clientOptions), queryFn: () => getRegionRegionsRegionIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Cities
*/
export const ensureUseGetCitiesCitiesGetData = (queryClient: QueryClient, clientOptions: Options<GetCitiesCitiesGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetCitiesCitiesGetKeyFn(clientOptions), queryFn: () => getCitiesCitiesGet({ ...clientOptions }).then(response => response.data) });
/**
* Get City
*/
export const ensureUseGetCityCitiesCityIdGetData = (queryClient: QueryClient, clientOptions: Options<GetCityCitiesCityIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetCityCitiesCityIdGetKeyFn(clientOptions), queryFn: () => getCityCitiesCityIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Currencies
*/
export const ensureUseGetCurrenciesCurrenciesGetData = (queryClient: QueryClient, clientOptions: Options<GetCurrenciesCurrenciesGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetCurrenciesCurrenciesGetKeyFn(clientOptions), queryFn: () => getCurrenciesCurrenciesGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Currency
*/
export const ensureUseGetCurrencyCurrenciesCurrencyIdGetData = (queryClient: QueryClient, clientOptions: Options<GetCurrencyCurrenciesCurrencyIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetCurrencyCurrenciesCurrencyIdGetKeyFn(clientOptions), queryFn: () => getCurrencyCurrenciesCurrencyIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Measure Units
*/
export const ensureUseGetMeasureUnitsMeasureUnitsGetData = (queryClient: QueryClient, clientOptions: Options<GetMeasureUnitsMeasureUnitsGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetMeasureUnitsMeasureUnitsGetKeyFn(clientOptions), queryFn: () => getMeasureUnitsMeasureUnitsGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Measure Unit
*/
export const ensureUseGetMeasureUnitMeasureUnitsUnitIdGetData = (queryClient: QueryClient, clientOptions: Options<GetMeasureUnitMeasureUnitsUnitIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetMeasureUnitMeasureUnitsUnitIdGetKeyFn(clientOptions), queryFn: () => getMeasureUnitMeasureUnitsUnitIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Shop Bases
*/
export const ensureUseGetShopBasesShopBasesGetData = (queryClient: QueryClient, clientOptions: Options<GetShopBasesShopBasesGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetShopBasesShopBasesGetKeyFn(clientOptions), queryFn: () => getShopBasesShopBasesGet({ ...clientOptions }).then(response => response.data) });
/**
* Get All Shops Full
*/
export const ensureUseGetAllShopsFullShopBasesFullGetData = (queryClient: QueryClient, clientOptions: Options<GetAllShopsFullShopBasesFullGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetAllShopsFullShopBasesFullGetKeyFn(clientOptions), queryFn: () => getAllShopsFullShopBasesFullGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Pending Shops Count
*
* Количество заявок на новый магазин (статус регистрации = pending).
*/
export const ensureUseGetPendingShopsCountShopBasesPendingCountGetData = (queryClient: QueryClient, clientOptions: Options<GetPendingShopsCountShopBasesPendingCountGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetPendingShopsCountShopBasesPendingCountGetKeyFn(clientOptions), queryFn: () => getPendingShopsCountShopBasesPendingCountGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Shop Base
*
* Карточка магазина с владельцем и документами — своя либо для сотрудника.
*/
export const ensureUseGetShopBaseShopBasesShopIdGetData = (queryClient: QueryClient, clientOptions: Options<GetShopBaseShopBasesShopIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetShopBaseShopBasesShopIdGetKeyFn(clientOptions), queryFn: () => getShopBaseShopBasesShopIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Download Shop Document
*
* Выдаёт документ магазина владельцу или сотруднику платформы.
*
* Файлы лежат в uploads/, который раздаётся как статика, поэтому раньше
* паспорт и свидетельство скачивал любой, кто знал ссылку, без токена.
* Прямой путь /uploads/documents/... теперь закрыт (см. app/main.py), а
* единственный способ получить файл — этот метод с проверкой владения.
*/
export const ensureUseDownloadShopDocumentShopBasesShopIdDocumentsFilenameGetData = (queryClient: QueryClient, clientOptions: Options<DownloadShopDocumentShopBasesShopIdDocumentsFilenameGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseDownloadShopDocumentShopBasesShopIdDocumentsFilenameGetKeyFn(clientOptions), queryFn: () => downloadShopDocumentShopBasesShopIdDocumentsFilenameGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Shop Additionals
*/
export const ensureUseGetShopAdditionalsShopAdditionalsGetData = (queryClient: QueryClient, clientOptions: Options<GetShopAdditionalsShopAdditionalsGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetShopAdditionalsShopAdditionalsGetKeyFn(clientOptions), queryFn: () => getShopAdditionalsShopAdditionalsGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Shop Additional By Shop Base
*/
export const ensureUseGetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetData = (queryClient: QueryClient, clientOptions: Options<GetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetKeyFn(clientOptions), queryFn: () => getShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Shop Additional
*/
export const ensureUseGetShopAdditionalShopAdditionalsShopAdditionalIdGetData = (queryClient: QueryClient, clientOptions: Options<GetShopAdditionalShopAdditionalsShopAdditionalIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetShopAdditionalShopAdditionalsShopAdditionalIdGetKeyFn(clientOptions), queryFn: () => getShopAdditionalShopAdditionalsShopAdditionalIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Products
*/
export const ensureUseGetProductsProductsGetData = (queryClient: QueryClient, clientOptions: Options<GetProductsProductsGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetProductsProductsGetKeyFn(clientOptions), queryFn: () => getProductsProductsGet({ ...clientOptions }).then(response => response.data) });
/**
* Get My Products
*
* «Мои товары» владельца: товары его магазинов в любом статусе (включая pending/declined).
*
* Если передан `shop_base_id` — возвращаются товары только этого магазина (при условии,
* что он принадлежит текущему пользователю).
*/
export const ensureUseGetMyProductsProductsMyGetData = (queryClient: QueryClient, clientOptions: Options<GetMyProductsProductsMyGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetMyProductsProductsMyGetKeyFn(clientOptions), queryFn: () => getMyProductsProductsMyGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Moderation Count
*
* Количество товаров, ожидающих модерации (status = pending).
*/
export const ensureUseGetModerationCountProductsModerationCountGetData = (queryClient: QueryClient, clientOptions: Options<GetModerationCountProductsModerationCountGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetModerationCountProductsModerationCountGetKeyFn(clientOptions), queryFn: () => getModerationCountProductsModerationCountGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Moderation Queue
*
* Очередь модерации (для администратора): товары по статусу, без скрытия немодерированных.
*/
export const ensureUseGetModerationQueueProductsModerationGetData = (queryClient: QueryClient, clientOptions: Options<GetModerationQueueProductsModerationGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetModerationQueueProductsModerationGetKeyFn(clientOptions), queryFn: () => getModerationQueueProductsModerationGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Product For Moderation
*
* Полная информация о товаре для администратора — в любом статусе и вне зависимости от активности.
*/
export const ensureUseGetProductForModerationProductsModerationProductIdGetData = (queryClient: QueryClient, clientOptions: Options<GetProductForModerationProductsModerationProductIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetProductForModerationProductsModerationProductIdGetKeyFn(clientOptions), queryFn: () => getProductForModerationProductsModerationProductIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Brands By Category And City
*
* Уникальные бренды, у которых есть видимые товары в данной категории и городе.
*/
export const ensureUseGetBrandsByCategoryAndCityProductsBrandsGetData = (queryClient: QueryClient, clientOptions: Options<GetBrandsByCategoryAndCityProductsBrandsGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetBrandsByCategoryAndCityProductsBrandsGetKeyFn(clientOptions), queryFn: () => getBrandsByCategoryAndCityProductsBrandsGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Product
*/
export const ensureUseGetProductProductsProductIdGetData = (queryClient: QueryClient, clientOptions: Options<GetProductProductsProductIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetProductProductsProductIdGetKeyFn(clientOptions), queryFn: () => getProductProductsProductIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Similar Products
*/
export const ensureUseGetSimilarProductsProductsProductIdSimilarGetData = (queryClient: QueryClient, clientOptions: Options<GetSimilarProductsProductsProductIdSimilarGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetSimilarProductsProductsProductIdSimilarGetKeyFn(clientOptions), queryFn: () => getSimilarProductsProductsProductIdSimilarGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Banners
*/
export const ensureUseGetBannersBannersGetData = (queryClient: QueryClient, clientOptions: Options<GetBannersBannersGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetBannersBannersGetKeyFn(clientOptions), queryFn: () => getBannersBannersGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Banner
*/
export const ensureUseGetBannerBannersBannerIdGetData = (queryClient: QueryClient, clientOptions: Options<GetBannerBannersBannerIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetBannerBannersBannerIdGetKeyFn(clientOptions), queryFn: () => getBannerBannersBannerIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Collections
*/
export const ensureUseGetCollectionsCollectionsGetData = (queryClient: QueryClient, clientOptions: Options<GetCollectionsCollectionsGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetCollectionsCollectionsGetKeyFn(clientOptions), queryFn: () => getCollectionsCollectionsGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Collection
*/
export const ensureUseGetCollectionCollectionsCollectionIdGetData = (queryClient: QueryClient, clientOptions: Options<GetCollectionCollectionsCollectionIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetCollectionCollectionsCollectionIdGetKeyFn(clientOptions), queryFn: () => getCollectionCollectionsCollectionIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Cart
*/
export const ensureUseGetCartCartGetData = (queryClient: QueryClient, clientOptions: Options<GetCartCartGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetCartCartGetKeyFn(clientOptions), queryFn: () => getCartCartGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Favorites
*/
export const ensureUseGetFavoritesFavoritesGetData = (queryClient: QueryClient, clientOptions: Options<GetFavoritesFavoritesGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetFavoritesFavoritesGetKeyFn(clientOptions), queryFn: () => getFavoritesFavoritesGet({ ...clientOptions }).then(response => response.data) });
/**
* List Addresses
*
* Свои адреса. Чужих в выдаче нет: фильтр по владельцу, а не по запросу.
*/
export const ensureUseListAddressesUserAddressesGetData = (queryClient: QueryClient, clientOptions: Options<ListAddressesUserAddressesGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseListAddressesUserAddressesGetKeyFn(clientOptions), queryFn: () => listAddressesUserAddressesGet({ ...clientOptions }).then(response => response.data) });
/**
* List Product Reviews
*
* Подтверждённые отзывы о товаре. Метод публичный: отзывы для покупателей.
*/
export const ensureUseListProductReviewsReviewsProductProductIdGetData = (queryClient: QueryClient, clientOptions: Options<ListProductReviewsReviewsProductProductIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseListProductReviewsReviewsProductProductIdGetKeyFn(clientOptions), queryFn: () => listProductReviewsReviewsProductProductIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Product Review Summary
*
* Сводка по товару: средняя оценка, количество и разбивка по звёздам.
*
* Средняя и количество берутся из товара — они уже пересчитаны и совпадают с
* тем, что показано в каталоге. Разбивка считается запросом: она нужна только
* на карточке товара, и хранить её незачем.
*/
export const ensureUseProductReviewSummaryReviewsProductProductIdSummaryGetData = (queryClient: QueryClient, clientOptions: Options<ProductReviewSummaryReviewsProductProductIdSummaryGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseProductReviewSummaryReviewsProductProductIdSummaryGetKeyFn(clientOptions), queryFn: () => productReviewSummaryReviewsProductProductIdSummaryGet({ ...clientOptions }).then(response => response.data) });
/**
* Review Eligibility
*
* Можно ли оставить отзыв на этот товар.
*
* Отдельный метод, потому что форму надо показать или не показать до того, как
* человек начнёт писать: получить отказ после набранного текста — худший из
* возможных вариантов.
*/
export const ensureUseReviewEligibilityReviewsProductProductIdEligibilityGetData = (queryClient: QueryClient, clientOptions: Options<ReviewEligibilityReviewsProductProductIdEligibilityGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseReviewEligibilityReviewsProductProductIdEligibilityGetKeyFn(clientOptions), queryFn: () => reviewEligibilityReviewsProductProductIdEligibilityGet({ ...clientOptions }).then(response => response.data) });
/**
* List Own Reviews
*
* Свои отзывы в любом состоянии.
*
* Автор должен видеть и непроверенные, и отклонённые вместе с причиной: иначе
* отзыв после отправки просто пропадает, и непонятно, дошёл ли он.
*/
export const ensureUseListOwnReviewsReviewsMyGetData = (queryClient: QueryClient, clientOptions: Options<ListOwnReviewsReviewsMyGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseListOwnReviewsReviewsMyGetKeyFn(clientOptions), queryFn: () => listOwnReviewsReviewsMyGet({ ...clientOptions }).then(response => response.data) });
/**
* Moderation Queue
*
* Очередь проверки. По умолчанию — непроверенные.
*
* Пагинация через общие limit_param/skip_param, а не своим Query: свой предел
* в 100 расходился с остальными списками (общий максимум — 500), и админка,
* запрашивающая 500, получала 422 на пустой странице.
*/
export const ensureUseModerationQueueReviewsModerationGetData = (queryClient: QueryClient, clientOptions: Options<ModerationQueueReviewsModerationGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseModerationQueueReviewsModerationGetKeyFn(clientOptions), queryFn: () => moderationQueueReviewsModerationGet({ ...clientOptions }).then(response => response.data) });
/**
* Moderation Count
*
* Сколько отзывов ждёт проверки — для отметки в меню админки.
*/
export const ensureUseModerationCountReviewsModerationCountGetData = (queryClient: QueryClient, clientOptions: Options<ModerationCountReviewsModerationCountGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseModerationCountReviewsModerationCountGetKeyFn(clientOptions), queryFn: () => moderationCountReviewsModerationCountGet({ ...clientOptions }).then(response => response.data) });
/**
* List Own Returns
*
* Свои заявки в любом состоянии.
*
* Отклонённые тоже: без них заявка после отказа просто исчезает, и непонятно,
* рассмотрели её или потеряли.
*/
export const ensureUseListOwnReturnsReturnsMyGetData = (queryClient: QueryClient, clientOptions: Options<ListOwnReturnsReturnsMyGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseListOwnReturnsReturnsMyGetKeyFn(clientOptions), queryFn: () => listOwnReturnsReturnsMyGet({ ...clientOptions }).then(response => response.data) });
/**
* List Returns
*
* Все заявки. Без фильтра — целиком, чтобы видеть и разобранные.
*/
export const ensureUseListReturnsReturnsGetData = (queryClient: QueryClient, clientOptions: Options<ListReturnsReturnsGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseListReturnsReturnsGetKeyFn(clientOptions), queryFn: () => listReturnsReturnsGet({ ...clientOptions }).then(response => response.data) });
/**
* List Shop Returns
*
* Заявки на возврат по товарам одного магазина.
*
* Продавцу об оформленном возврате приходило уведомление, а посмотреть его
* было негде: список заявок доступен только платформе (RETURNS_MANAGE), и
* экрана в кабинете не существовало. Продавец узнавал, что возврат случился,
* и не мог узнать ни по какому товару, ни по какой причине.
*
* Решение по заявке остаётся за платформой — здесь только чтение.
*/
export const ensureUseListShopReturnsReturnsShopShopIdGetData = (queryClient: QueryClient, clientOptions: Options<ListShopReturnsReturnsShopShopIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseListShopReturnsReturnsShopShopIdGetKeyFn(clientOptions), queryFn: () => listShopReturnsReturnsShopShopIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Pending Count
*
* Сколько заявок ждёт решения — для отметки в меню админки.
*/
export const ensureUsePendingCountReturnsCountGetData = (queryClient: QueryClient, clientOptions: Options<PendingCountReturnsCountGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UsePendingCountReturnsCountGetKeyFn(clientOptions), queryFn: () => pendingCountReturnsCountGet({ ...clientOptions }).then(response => response.data) });
/**
* List Notifications
*
* Свои уведомления, новые сверху.
*
* Отдельного права нет: уведомления адресные, и фильтр по владельцу — не
* ограничение доступа, а само определение выдачи.
*/
export const ensureUseListNotificationsNotificationsGetData = (queryClient: QueryClient, clientOptions: Options<ListNotificationsNotificationsGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseListNotificationsNotificationsGetKeyFn(clientOptions), queryFn: () => listNotificationsNotificationsGet({ ...clientOptions }).then(response => response.data) });
/**
* Unread Count
*
* Сколько непрочитанных — для отметки в интерфейсе.
*/
export const ensureUseUnreadCountNotificationsUnreadCountGetData = (queryClient: QueryClient, clientOptions: Options<UnreadCountNotificationsUnreadCountGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseUnreadCountNotificationsUnreadCountGetKeyFn(clientOptions), queryFn: () => unreadCountNotificationsUnreadCountGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Warehouses
*/
export const ensureUseGetWarehousesWarehousesGetData = (queryClient: QueryClient, clientOptions: Options<GetWarehousesWarehousesGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetWarehousesWarehousesGetKeyFn(clientOptions), queryFn: () => getWarehousesWarehousesGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Warehouse
*/
export const ensureUseGetWarehouseWarehousesWarehouseIdGetData = (queryClient: QueryClient, clientOptions: Options<GetWarehouseWarehousesWarehouseIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetWarehouseWarehousesWarehouseIdGetKeyFn(clientOptions), queryFn: () => getWarehouseWarehousesWarehouseIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Read Delivery Message
*/
export const ensureUseReadDeliveryMessageDeliveryMessageGetData = (queryClient: QueryClient, clientOptions: Options<ReadDeliveryMessageDeliveryMessageGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseReadDeliveryMessageDeliveryMessageGetKeyFn(clientOptions), queryFn: () => readDeliveryMessageDeliveryMessageGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Products Availability
*
* Доступный остаток по нескольким товарам сразу.
*
* Поштучный опрос (единственное, что было) для карточки и списка не годится, а
* в самом ответе товара остатка нет вовсе. Метод публичный: сколько товара на
* полке — это то же самое, что покупатель видит в магазине.
*
* Считается доступный остаток, а не сырой баланс журнала: то, что уже держат
* открытые заказы, купить нельзя. Остаток берётся из журнала своего типа:
* FBS — из журнала магазина, FBO — со складов платформы. tracked=false —
* остаток покупку не ограничивает (FBO при выключенном складе платформы).
*/
export const ensureUseGetProductsAvailabilityStockOperationsAvailabilityGetData = (queryClient: QueryClient, clientOptions: Options<GetProductsAvailabilityStockOperationsAvailabilityGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetProductsAvailabilityStockOperationsAvailabilityGetKeyFn(clientOptions), queryFn: () => getProductsAvailabilityStockOperationsAvailabilityGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Product Stock
*
* Журнал движений товара — коммерческая тайна магазина, только своя.
*/
export const ensureUseGetProductStockStockOperationsProductIdGetData = (queryClient: QueryClient, clientOptions: Options<GetProductStockStockOperationsProductIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetProductStockStockOperationsProductIdGetKeyFn(clientOptions), queryFn: () => getProductStockStockOperationsProductIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Product Balance
*/
export const ensureUseGetProductBalanceStockOperationsProductIdBalanceGetData = (queryClient: QueryClient, clientOptions: Options<GetProductBalanceStockOperationsProductIdBalanceGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetProductBalanceStockOperationsProductIdBalanceGetKeyFn(clientOptions), queryFn: () => getProductBalanceStockOperationsProductIdBalanceGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Warehouse Balances
*
* Остатки всех товаров на складе.
*
* Такого метода не было: на странице склада в админке таблица «Товары на
* складе» была строкой-заглушкой без запроса и всегда сообщала, что склад
* пуст — независимо от настоящих остатков. Поштучный опрос по каждому товару
* (единственное, что было) для списка не годится.
*
* Товары с нулевым и отрицательным остатком не показываются: они на складе
* отсутствуют, а история по ним доступна отдельным методом.
*/
export const ensureUseGetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGetData = (queryClient: QueryClient, clientOptions: Options<GetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGetKeyFn(clientOptions), queryFn: () => getWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Warehouse Product Stock
*/
export const ensureUseGetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGetData = (queryClient: QueryClient, clientOptions: Options<GetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGetKeyFn(clientOptions), queryFn: () => getWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Warehouse Product Balance
*/
export const ensureUseGetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGetData = (queryClient: QueryClient, clientOptions: Options<GetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGetKeyFn(clientOptions), queryFn: () => getWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGet({ ...clientOptions }).then(response => response.data) });
/**
* List Receipts
*/
export const ensureUseListReceiptsStockReceiptsGetData = (queryClient: QueryClient, clientOptions: Options<ListReceiptsStockReceiptsGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseListReceiptsStockReceiptsGetKeyFn(clientOptions), queryFn: () => listReceiptsStockReceiptsGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Receipt
*/
export const ensureUseGetReceiptStockReceiptsReceiptIdGetData = (queryClient: QueryClient, clientOptions: Options<GetReceiptStockReceiptsReceiptIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetReceiptStockReceiptsReceiptIdGetKeyFn(clientOptions), queryFn: () => getReceiptStockReceiptsReceiptIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Enabled features
*/
export const ensureUseReadFeaturesFeaturesGetData = (queryClient: QueryClient, clientOptions: Options<ReadFeaturesFeaturesGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseReadFeaturesFeaturesGetKeyFn(clientOptions), queryFn: () => readFeaturesFeaturesGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Order Statuses
*/
export const ensureUseGetOrderStatusesOrderStatusesGetData = (queryClient: QueryClient, clientOptions: Options<GetOrderStatusesOrderStatusesGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetOrderStatusesOrderStatusesGetKeyFn(clientOptions), queryFn: () => getOrderStatusesOrderStatusesGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Order Status
*/
export const ensureUseGetOrderStatusOrderStatusesOrderStatusIdGetData = (queryClient: QueryClient, clientOptions: Options<GetOrderStatusOrderStatusesOrderStatusIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetOrderStatusOrderStatusesOrderStatusIdGetKeyFn(clientOptions), queryFn: () => getOrderStatusOrderStatusesOrderStatusIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Pickup Points
*/
export const ensureUseGetPickupPointsPickupPointsGetData = (queryClient: QueryClient, clientOptions: Options<GetPickupPointsPickupPointsGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetPickupPointsPickupPointsGetKeyFn(clientOptions), queryFn: () => getPickupPointsPickupPointsGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Pickup Point
*/
export const ensureUseGetPickupPointPickupPointsPickupPointIdGetData = (queryClient: QueryClient, clientOptions: Options<GetPickupPointPickupPointsPickupPointIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetPickupPointPickupPointsPickupPointIdGetKeyFn(clientOptions), queryFn: () => getPickupPointPickupPointsPickupPointIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Orders
*
* Список заказов.
*
* Право orders:read в описании помечено как административное, но выдаётся
* каждому при регистрации, и фильтра по владельцу здесь не было — любой
* зарегистрировавшийся читал все заказы платформы с телефонами и адресами
* покупателей. Теперь без права сотрудника выдача сужается до своих заказов.
*/
export const ensureUseGetOrdersOrdersGetData = (queryClient: QueryClient, clientOptions: Options<GetOrdersOrdersGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetOrdersOrdersGetKeyFn(clientOptions), queryFn: () => getOrdersOrdersGet({ ...clientOptions }).then(response => response.data) });
/**
* Get My Orders
*/
export const ensureUseGetMyOrdersOrdersMyGetData = (queryClient: QueryClient, clientOptions: Options<GetMyOrdersOrdersMyGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetMyOrdersOrdersMyGetKeyFn(clientOptions), queryFn: () => getMyOrdersOrdersMyGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Shop Orders
*/
export const ensureUseGetShopOrdersOrdersShopShopIdGetData = (queryClient: QueryClient, clientOptions: Options<GetShopOrdersOrdersShopShopIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetShopOrdersOrdersShopShopIdGetKeyFn(clientOptions), queryFn: () => getShopOrdersOrdersShopShopIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Shop Top Products
*
* Самые покупаемые товары магазина — по суммарному проданному количеству
* в завершённых (completed) заказах. Учитываются только неотклонённые части.
*/
export const ensureUseGetShopTopProductsOrdersShopShopIdTopProductsGetData = (queryClient: QueryClient, clientOptions: Options<GetShopTopProductsOrdersShopShopIdTopProductsGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetShopTopProductsOrdersShopShopIdTopProductsGetKeyFn(clientOptions), queryFn: () => getShopTopProductsOrdersShopShopIdTopProductsGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Shop Summary
*
* Сводка магазина за период и такая же за предыдущий.
*
* Прежняя выдача считала только текущую неделю с понедельника: в понедельник
* утром продавец видел почти пустой график и решал, что всё сломалось. И
* главное — число без базы сравнения ничего не значит: «выручка 5000» не
* говорит, хорошо это или плохо, пока рядом нет прошлой недели.
*/
export const ensureUseGetShopSummaryOrdersShopShopIdSummaryGetData = (queryClient: QueryClient, clientOptions: Options<GetShopSummaryOrdersShopShopIdSummaryGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetShopSummaryOrdersShopShopIdSummaryGetKeyFn(clientOptions), queryFn: () => getShopSummaryOrdersShopShopIdSummaryGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Shop Insights
*
* Списки, по которым продавцу есть что сделать: что не продаётся, что
* возвращают, как оценивают.
*
* Отдельно от сводки: та отвечает на «как дела», эта — на «что чинить». В
* одном ответе они означали бы тяжёлые выборки при каждом переключении
* периода на графике.
*
* По умолчанию месяц, а не неделя: за неделю «не продавалось» покажет почти
* весь ассортимент и ничего не подскажет.
*/
export const ensureUseGetShopInsightsOrdersShopShopIdInsightsGetData = (queryClient: QueryClient, clientOptions: Options<GetShopInsightsOrdersShopShopIdInsightsGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetShopInsightsOrdersShopShopIdInsightsGetKeyFn(clientOptions), queryFn: () => getShopInsightsOrdersShopShopIdInsightsGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Shop Weekly Revenue
*
* Суммарный доход магазина за текущую неделю (с понедельника 00:00 этой
* недели) по завершённым заказам, без отклонённых частей. Период — по дате
* создания заказа (отдельной даты завершения в модели нет).
*/
export const ensureUseGetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGetData = (queryClient: QueryClient, clientOptions: Options<GetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGetKeyFn(clientOptions), queryFn: () => getShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Order
*
* Заказ доступен покупателю, магазину из состава заказа и сотруднику.
*/
export const ensureUseGetOrderOrdersOrderIdGetData = (queryClient: QueryClient, clientOptions: Options<GetOrderOrdersOrderIdGetData, true>) => queryClient.ensureQueryData({ queryKey: Common.UseGetOrderOrdersOrderIdGetKeyFn(clientOptions), queryFn: () => getOrderOrdersOrderIdGet({ ...clientOptions }).then(response => response.data) });
/**
* Search
*
* Общий поиск по маркетплейсу в рамках города.
*
* Возвращает товары (с фильтрами, релевантностью и пагинацией) и — если задан
* `q` — короткие подсказки: магазины города по названию, категории и бренды.
*/
export const ensureUseSearchSearchGetData = (queryClient: QueryClient, clientOptions: Options<SearchSearchGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseSearchSearchGetKeyFn(clientOptions), queryFn: () => searchSearchGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Shops Statistics
*
* Количество магазинов с разбивкой по статусам регистрации (RegistrationStatus).
*/
export const ensureUseGetShopsStatisticsStatisticsShopsGetData = (queryClient: QueryClient, clientOptions: Options<GetShopsStatisticsStatisticsShopsGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetShopsStatisticsStatisticsShopsGetKeyFn(clientOptions), queryFn: () => getShopsStatisticsStatisticsShopsGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Clients Statistics
*
* Количество клиентов — пользователей с флагом client=True.
*/
export const ensureUseGetClientsStatisticsStatisticsClientsGetData = (queryClient: QueryClient, clientOptions: Options<GetClientsStatisticsStatisticsClientsGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetClientsStatisticsStatisticsClientsGetKeyFn(clientOptions), queryFn: () => getClientsStatisticsStatisticsClientsGet({ ...clientOptions }).then(response => response.data) });
/**
* Get Orders Statistics
*
* Количество заказов с разбивкой по статусам (OrderStatusCode).
*/
export const ensureUseGetOrdersStatisticsStatisticsOrdersGetData = (queryClient: QueryClient, clientOptions: Options<GetOrdersStatisticsStatisticsOrdersGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseGetOrdersStatisticsStatisticsOrdersGetKeyFn(clientOptions), queryFn: () => getOrdersStatisticsStatisticsOrdersGet({ ...clientOptions }).then(response => response.data) });
/**
* Read Contact Us
*/
export const ensureUseReadContactUsContactUsGetData = (queryClient: QueryClient, clientOptions: Options<ReadContactUsContactUsGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseReadContactUsContactUsGetKeyFn(clientOptions), queryFn: () => readContactUsContactUsGet({ ...clientOptions }).then(response => response.data) });
/**
* Health Check
*/
export const ensureUseHealthCheckGetData = (queryClient: QueryClient, clientOptions: Options<HealthCheckGetData, true> = {}) => queryClient.ensureQueryData({ queryKey: Common.UseHealthCheckGetKeyFn(clientOptions), queryFn: () => healthCheckGet({ ...clientOptions }).then(response => response.data) });
