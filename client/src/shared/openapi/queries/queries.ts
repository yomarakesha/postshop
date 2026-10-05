// generated with @7nohe/openapi-react-query-codegen@2.1.0 

import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";
import type { Options } from "../requests/sdk.gen";
import { addItemStockReceiptsReceiptIdItemsPost, addToCartCartPost, addToFavoritesFavoritesProductIdPost, approveProductProductsProductIdApprovePatch, approveReturnReturnsRequestIdApprovePatch, approveReviewReviewsReviewIdApprovePatch, blockBannerBannersBannerIdBlockPatch, blockBrandBrandsBrandIdBlockPatch, blockCategoryCategoriesCategoryIdBlockPatch, blockCityCitiesCityIdBlockPatch, blockCollectionCollectionsCollectionIdBlockPatch, blockCountryCountriesCountryIdBlockPatch, blockCurrencyCurrenciesCurrencyIdBlockPatch, blockMeasureUnitMeasureUnitsUnitIdBlockPatch, blockPickupPointPickupPointsPickupPointIdBlockPatch, blockProductProductsProductIdBlockPatch, blockRegionRegionsRegionIdBlockPatch, blockShopBaseShopBasesShopIdBlockPatch, blockUserUsersUserIdBlockPatch, blockWarehouseWarehousesWarehouseIdBlockPatch, bulkGrantPermissionsPermissionsUserIdPermissionsBulkPost, cancelOrderOrdersOrderIdCancelPost, cancelReceiptStockReceiptsReceiptIdCancelPost, cancelReturnReturnsRequestIdDelete, changePasswordAuthPasswordChangePost, clearCartCartDelete, confirmReceiptStockReceiptsReceiptIdConfirmPost, createAddressUserAddressesPost, createBannerBannersPost, createBrandBrandsPost, createCategoryCategoriesPost, createCityCitiesPost, createCollectionCollectionsPost, createContactUsContactUsPost, createCountryCountriesPost, createCurrencyCurrenciesPost, createDeliveryMessageDeliveryMessagePost, createMeasureUnitMeasureUnitsPost, createOrderOrdersPost, createPickupPointPickupPointsPost, createProductProductsPost, createReceiptStockReceiptsPost, createRegionRegionsPost, createReturnReturnsPost, createReviewReviewsPost, createShopAdditionalShopAdditionalsPost, createShopBaseShopBasesPost, createStockOperationStockOperationsPost, createUserUsersPost, createWarehouseOperationWarehouseOperationsPost, createWarehouseWarehousesPost, declineProductProductsProductIdDeclinePatch, deleteAddressUserAddressesAddressIdDelete, deleteBannerBannersBannerIdDelete, deleteBannerImageBannersBannerIdImageDelete, deleteCollectionCollectionsCollectionIdDelete, deleteItemStockReceiptsReceiptIdItemsItemIdDelete, deleteNotificationNotificationsNotificationIdDelete, deleteReceiptStockReceiptsReceiptIdDelete, deleteReviewReviewsReviewIdDelete, deleteShopAdditionalShopAdditionalsShopAdditionalIdDelete, downloadShopDocumentShopBasesShopIdDocumentsFilenameGet, getAllShopsFullShopBasesFullGet, getBannerBannersBannerIdGet, getBannersBannersGet, getBrandBrandsBrandIdGet, getBrandsBrandsGet, getBrandsByCategoryAndCityProductsBrandsGet, getCartCartGet, getCategoriesCategoriesGet, getCategoryCategoriesCategoryIdGet, getCitiesCitiesGet, getCityCitiesCityIdGet, getClientsStatisticsStatisticsClientsGet, getCollectionCollectionsCollectionIdGet, getCollectionsCollectionsGet, getCountriesCountriesGet, getCountryCountriesCountryIdGet, getCurrenciesCurrenciesGet, getCurrencyCurrenciesCurrencyIdGet, getFavoritesFavoritesGet, getFboAttentionCountOrdersFboAttentionCountGet, getMeasureUnitMeasureUnitsUnitIdGet, getMeasureUnitsMeasureUnitsGet, getMeUsersMeGet, getModerationCountProductsModerationCountGet, getModerationQueueProductsModerationGet, getMyOrdersOrdersMyGet, getMyProductsProductsMyGet, getOrderOrdersOrderIdGet, getOrdersOrdersGet, getOrdersStatisticsStatisticsOrdersGet, getOrderStatusesOrderStatusesGet, getOrderStatusOrderStatusesOrderStatusIdGet, getPendingOrdersCountOrdersPendingCountGet, getPendingShopsCountShopBasesPendingCountGet, getPickupPointPickupPointsPickupPointIdGet, getPickupPointsPickupPointsGet, getProductBalanceStockOperationsProductIdBalanceGet, getProductForModerationProductsModerationProductIdGet, getProductProductsProductIdGet, getProductsAvailabilityStockOperationsAvailabilityGet, getProductsProductsGet, getProductStockStockOperationsProductIdGet, getReceiptStockReceiptsReceiptIdGet, getRegionRegionsRegionIdGet, getRegionsRegionsGet, getShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet, getShopAdditionalShopAdditionalsShopAdditionalIdGet, getShopAdditionalsShopAdditionalsGet, getShopAttentionCountOrdersShopShopIdAttentionCountGet, getShopBaseShopBasesShopIdGet, getShopBasesShopBasesGet, getShopInsightsOrdersShopShopIdInsightsGet, getShopOrdersOrdersShopShopIdGet, getShopsStatisticsStatisticsShopsGet, getShopSummaryOrdersShopShopIdSummaryGet, getShopTopProductsOrdersShopShopIdTopProductsGet, getShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGet, getSimilarProductsProductsProductIdSimilarGet, getUserPermissionsPermissionsUserIdPermissionsGet, getUsersUsersGet, getUserUsersUserIdGet, getWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGet, getWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGet, getWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGet, getWarehousesWarehousesGet, getWarehouseWarehousesWarehouseIdGet, grantPermissionPermissionsUserIdPermissionsPost, healthCheckGet, listAddressesUserAddressesGet, listAllPermissionsPermissionsGet, listNotificationsNotificationsGet, listOwnReturnsReturnsMyGet, listOwnReviewsReviewsMyGet, listProductReviewsReviewsProductProductIdGet, listReceiptsStockReceiptsGet, listReturnsReturnsGet, listShopReturnsReturnsShopShopIdGet, loginAuthLoginPost, markAllReadNotificationsReadAllPatch, markReadNotificationsNotificationIdReadPatch, meAuthMeGet, moderationCountReviewsModerationCountGet, moderationQueueReviewsModerationGet, pendingCountReturnsCountGet, productReviewSummaryReviewsProductProductIdSummaryGet, readContactUsContactUsGet, readDeliveryMessageDeliveryMessageGet, readFeaturesFeaturesGet, receiveReturnReturnsRequestIdReceivePatch, refreshAuthRefreshPost, rejectReturnReturnsRequestIdRejectPatch, rejectReviewReviewsReviewIdRejectPatch, removeFromCartCartProductIdDelete, removeFromFavoritesFavoritesProductIdDelete, requestOtpAuthOtpRequestPost, requestPhoneChangeAuthPhoneChangeRequestPost, reviewEligibilityReviewsProductProductIdEligibilityGet, revokeAllPermissionsPermissionsUserIdPermissionsDelete, revokePermissionPermissionsUserIdPermissionsPermissionCodeDelete, searchSearchGet, setContactUsHandledContactUsContactIdHandledPatch, setDefaultAddressUserAddressesAddressIdDefaultPatch, setStockStockOperationsSetPost, setUserPermissionsPermissionsUserIdPermissionsPut, unblockBannerBannersBannerIdUnblockPatch, unblockBrandBrandsBrandIdUnblockPatch, unblockCategoryCategoriesCategoryIdUnblockPatch, unblockCityCitiesCityIdUnblockPatch, unblockCollectionCollectionsCollectionIdUnblockPatch, unblockCountryCountriesCountryIdUnblockPatch, unblockCurrencyCurrenciesCurrencyIdUnblockPatch, unblockMeasureUnitMeasureUnitsUnitIdUnblockPatch, unblockPickupPointPickupPointsPickupPointIdUnblockPatch, unblockProductProductsProductIdUnblockPatch, unblockRegionRegionsRegionIdUnblockPatch, unblockShopBaseShopBasesShopIdUnblockPatch, unblockUserUsersUserIdUnblockPatch, unblockWarehouseWarehousesWarehouseIdUnblockPatch, unreadCountNotificationsUnreadCountGet, updateAddressUserAddressesAddressIdPut, updateBannerBannersBannerIdPut, updateBrandBrandsBrandIdPut, updateCartItemCartProductIdPut, updateCategoryCategoriesCategoryIdPut, updateCityCitiesCityIdPut, updateCollectionCollectionsCollectionIdPut, updateCountryCountriesCountryIdPut, updateCurrencyCurrenciesCurrencyIdPut, updateDeliveryMessageDeliveryMessagePut, updateItemQuantityStockReceiptsReceiptIdItemsItemIdPatch, updateMeasureUnitMeasureUnitsUnitIdPut, updateOrderStatusOrdersOrderIdStatusPatch, updateOrderStatusTranslationsOrderStatusesOrderStatusIdTranslationsPut, updatePickupPointPickupPointsPickupPointIdPut, updateProductProductsProductIdPut, updateRegionRegionsRegionIdPut, updateReviewReviewsReviewIdPut, updateShopAdditionalShopAdditionalsShopAdditionalIdPut, updateShopBaseRegistrationStatusShopBasesShopIdRegistrationStatusPatch, updateShopBaseShopBasesShopIdPut, updateShopOrderStatusOrdersOrderIdShopShopIdStatusPatch, updateUserUsersUserIdPut, updateWarehouseWarehousesWarehouseIdPut, uploadBannerImageBannersBannerIdImagePost, uploadBrandImageBrandsBrandIdImagePost, uploadCategoryImageCategoriesCategoryIdImagePost, uploadShopDocumentsShopBasesShopIdDocumentsPost, verifyOtpAuthOtpVerifyPost, verifyPhoneChangeAuthPhoneChangeVerifyPost } from "../requests/sdk.gen";
import { AddItemStockReceiptsReceiptIdItemsPostData, AddItemStockReceiptsReceiptIdItemsPostError, AddToCartCartPostData, AddToCartCartPostError, AddToFavoritesFavoritesProductIdPostData, AddToFavoritesFavoritesProductIdPostError, ApproveProductProductsProductIdApprovePatchData, ApproveProductProductsProductIdApprovePatchError, ApproveReturnReturnsRequestIdApprovePatchData, ApproveReturnReturnsRequestIdApprovePatchError, ApproveReviewReviewsReviewIdApprovePatchData, ApproveReviewReviewsReviewIdApprovePatchError, BlockBannerBannersBannerIdBlockPatchData, BlockBannerBannersBannerIdBlockPatchError, BlockBrandBrandsBrandIdBlockPatchData, BlockBrandBrandsBrandIdBlockPatchError, BlockCategoryCategoriesCategoryIdBlockPatchData, BlockCategoryCategoriesCategoryIdBlockPatchError, BlockCityCitiesCityIdBlockPatchData, BlockCityCitiesCityIdBlockPatchError, BlockCollectionCollectionsCollectionIdBlockPatchData, BlockCollectionCollectionsCollectionIdBlockPatchError, BlockCountryCountriesCountryIdBlockPatchData, BlockCountryCountriesCountryIdBlockPatchError, BlockCurrencyCurrenciesCurrencyIdBlockPatchData, BlockCurrencyCurrenciesCurrencyIdBlockPatchError, BlockMeasureUnitMeasureUnitsUnitIdBlockPatchData, BlockMeasureUnitMeasureUnitsUnitIdBlockPatchError, BlockPickupPointPickupPointsPickupPointIdBlockPatchData, BlockPickupPointPickupPointsPickupPointIdBlockPatchError, BlockProductProductsProductIdBlockPatchData, BlockProductProductsProductIdBlockPatchError, BlockRegionRegionsRegionIdBlockPatchData, BlockRegionRegionsRegionIdBlockPatchError, BlockShopBaseShopBasesShopIdBlockPatchData, BlockShopBaseShopBasesShopIdBlockPatchError, BlockUserUsersUserIdBlockPatchData, BlockUserUsersUserIdBlockPatchError, BlockWarehouseWarehousesWarehouseIdBlockPatchData, BlockWarehouseWarehousesWarehouseIdBlockPatchError, BulkGrantPermissionsPermissionsUserIdPermissionsBulkPostData, BulkGrantPermissionsPermissionsUserIdPermissionsBulkPostError, CancelOrderOrdersOrderIdCancelPostData, CancelOrderOrdersOrderIdCancelPostError, CancelReceiptStockReceiptsReceiptIdCancelPostData, CancelReceiptStockReceiptsReceiptIdCancelPostError, CancelReturnReturnsRequestIdDeleteData, CancelReturnReturnsRequestIdDeleteError, ChangePasswordAuthPasswordChangePostData, ChangePasswordAuthPasswordChangePostError, ClearCartCartDeleteData, ConfirmReceiptStockReceiptsReceiptIdConfirmPostData, ConfirmReceiptStockReceiptsReceiptIdConfirmPostError, CreateAddressUserAddressesPostData, CreateAddressUserAddressesPostError, CreateBannerBannersPostData, CreateBannerBannersPostError, CreateBrandBrandsPostData, CreateBrandBrandsPostError, CreateCategoryCategoriesPostData, CreateCategoryCategoriesPostError, CreateCityCitiesPostData, CreateCityCitiesPostError, CreateCollectionCollectionsPostData, CreateCollectionCollectionsPostError, CreateContactUsContactUsPostData, CreateContactUsContactUsPostError, CreateCountryCountriesPostData, CreateCountryCountriesPostError, CreateCurrencyCurrenciesPostData, CreateCurrencyCurrenciesPostError, CreateDeliveryMessageDeliveryMessagePostData, CreateDeliveryMessageDeliveryMessagePostError, CreateMeasureUnitMeasureUnitsPostData, CreateMeasureUnitMeasureUnitsPostError, CreateOrderOrdersPostData, CreateOrderOrdersPostError, CreatePickupPointPickupPointsPostData, CreatePickupPointPickupPointsPostError, CreateProductProductsPostData, CreateProductProductsPostError, CreateReceiptStockReceiptsPostData, CreateReceiptStockReceiptsPostError, CreateRegionRegionsPostData, CreateRegionRegionsPostError, CreateReturnReturnsPostData, CreateReturnReturnsPostError, CreateReviewReviewsPostData, CreateReviewReviewsPostError, CreateShopAdditionalShopAdditionalsPostData, CreateShopAdditionalShopAdditionalsPostError, CreateShopBaseShopBasesPostData, CreateShopBaseShopBasesPostError, CreateStockOperationStockOperationsPostData, CreateStockOperationStockOperationsPostError, CreateUserUsersPostData, CreateUserUsersPostError, CreateWarehouseOperationWarehouseOperationsPostData, CreateWarehouseOperationWarehouseOperationsPostError, CreateWarehouseWarehousesPostData, CreateWarehouseWarehousesPostError, DeclineProductProductsProductIdDeclinePatchData, DeclineProductProductsProductIdDeclinePatchError, DeleteAddressUserAddressesAddressIdDeleteData, DeleteAddressUserAddressesAddressIdDeleteError, DeleteBannerBannersBannerIdDeleteData, DeleteBannerBannersBannerIdDeleteError, DeleteBannerImageBannersBannerIdImageDeleteData, DeleteBannerImageBannersBannerIdImageDeleteError, DeleteCollectionCollectionsCollectionIdDeleteData, DeleteCollectionCollectionsCollectionIdDeleteError, DeleteItemStockReceiptsReceiptIdItemsItemIdDeleteData, DeleteItemStockReceiptsReceiptIdItemsItemIdDeleteError, DeleteNotificationNotificationsNotificationIdDeleteData, DeleteNotificationNotificationsNotificationIdDeleteError, DeleteReceiptStockReceiptsReceiptIdDeleteData, DeleteReceiptStockReceiptsReceiptIdDeleteError, DeleteReviewReviewsReviewIdDeleteData, DeleteReviewReviewsReviewIdDeleteError, DeleteShopAdditionalShopAdditionalsShopAdditionalIdDeleteData, DeleteShopAdditionalShopAdditionalsShopAdditionalIdDeleteError, DownloadShopDocumentShopBasesShopIdDocumentsFilenameGetData, DownloadShopDocumentShopBasesShopIdDocumentsFilenameGetError, GetAllShopsFullShopBasesFullGetData, GetAllShopsFullShopBasesFullGetError, GetBannerBannersBannerIdGetData, GetBannerBannersBannerIdGetError, GetBannersBannersGetData, GetBannersBannersGetError, GetBrandBrandsBrandIdGetData, GetBrandBrandsBrandIdGetError, GetBrandsBrandsGetData, GetBrandsBrandsGetError, GetBrandsByCategoryAndCityProductsBrandsGetData, GetBrandsByCategoryAndCityProductsBrandsGetError, GetCartCartGetData, GetCategoriesCategoriesGetData, GetCategoriesCategoriesGetError, GetCategoryCategoriesCategoryIdGetData, GetCategoryCategoriesCategoryIdGetError, GetCitiesCitiesGetData, GetCitiesCitiesGetError, GetCityCitiesCityIdGetData, GetCityCitiesCityIdGetError, GetClientsStatisticsStatisticsClientsGetData, GetCollectionCollectionsCollectionIdGetData, GetCollectionCollectionsCollectionIdGetError, GetCollectionsCollectionsGetData, GetCollectionsCollectionsGetError, GetCountriesCountriesGetData, GetCountriesCountriesGetError, GetCountryCountriesCountryIdGetData, GetCountryCountriesCountryIdGetError, GetCurrenciesCurrenciesGetData, GetCurrenciesCurrenciesGetError, GetCurrencyCurrenciesCurrencyIdGetData, GetCurrencyCurrenciesCurrencyIdGetError, GetFavoritesFavoritesGetData, GetFboAttentionCountOrdersFboAttentionCountGetData, GetMeasureUnitMeasureUnitsUnitIdGetData, GetMeasureUnitMeasureUnitsUnitIdGetError, GetMeasureUnitsMeasureUnitsGetData, GetMeasureUnitsMeasureUnitsGetError, GetMeUsersMeGetData, GetModerationCountProductsModerationCountGetData, GetModerationQueueProductsModerationGetData, GetModerationQueueProductsModerationGetError, GetMyOrdersOrdersMyGetData, GetMyOrdersOrdersMyGetError, GetMyProductsProductsMyGetData, GetMyProductsProductsMyGetError, GetOrderOrdersOrderIdGetData, GetOrderOrdersOrderIdGetError, GetOrdersOrdersGetData, GetOrdersOrdersGetError, GetOrdersStatisticsStatisticsOrdersGetData, GetOrderStatusesOrderStatusesGetData, GetOrderStatusOrderStatusesOrderStatusIdGetData, GetOrderStatusOrderStatusesOrderStatusIdGetError, GetPendingOrdersCountOrdersPendingCountGetData, GetPendingShopsCountShopBasesPendingCountGetData, GetPickupPointPickupPointsPickupPointIdGetData, GetPickupPointPickupPointsPickupPointIdGetError, GetPickupPointsPickupPointsGetData, GetPickupPointsPickupPointsGetError, GetProductBalanceStockOperationsProductIdBalanceGetData, GetProductBalanceStockOperationsProductIdBalanceGetError, GetProductForModerationProductsModerationProductIdGetData, GetProductForModerationProductsModerationProductIdGetError, GetProductProductsProductIdGetData, GetProductProductsProductIdGetError, GetProductsAvailabilityStockOperationsAvailabilityGetData, GetProductsAvailabilityStockOperationsAvailabilityGetError, GetProductsProductsGetData, GetProductsProductsGetError, GetProductStockStockOperationsProductIdGetData, GetProductStockStockOperationsProductIdGetError, GetReceiptStockReceiptsReceiptIdGetData, GetReceiptStockReceiptsReceiptIdGetError, GetRegionRegionsRegionIdGetData, GetRegionRegionsRegionIdGetError, GetRegionsRegionsGetData, GetRegionsRegionsGetError, GetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetData, GetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetError, GetShopAdditionalShopAdditionalsShopAdditionalIdGetData, GetShopAdditionalShopAdditionalsShopAdditionalIdGetError, GetShopAdditionalsShopAdditionalsGetData, GetShopAdditionalsShopAdditionalsGetError, GetShopAttentionCountOrdersShopShopIdAttentionCountGetData, GetShopAttentionCountOrdersShopShopIdAttentionCountGetError, GetShopBaseShopBasesShopIdGetData, GetShopBaseShopBasesShopIdGetError, GetShopBasesShopBasesGetData, GetShopBasesShopBasesGetError, GetShopInsightsOrdersShopShopIdInsightsGetData, GetShopInsightsOrdersShopShopIdInsightsGetError, GetShopOrdersOrdersShopShopIdGetData, GetShopOrdersOrdersShopShopIdGetError, GetShopsStatisticsStatisticsShopsGetData, GetShopSummaryOrdersShopShopIdSummaryGetData, GetShopSummaryOrdersShopShopIdSummaryGetError, GetShopTopProductsOrdersShopShopIdTopProductsGetData, GetShopTopProductsOrdersShopShopIdTopProductsGetError, GetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGetData, GetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGetError, GetSimilarProductsProductsProductIdSimilarGetData, GetSimilarProductsProductsProductIdSimilarGetError, GetUserPermissionsPermissionsUserIdPermissionsGetData, GetUserPermissionsPermissionsUserIdPermissionsGetError, GetUsersUsersGetData, GetUsersUsersGetError, GetUserUsersUserIdGetData, GetUserUsersUserIdGetError, GetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGetData, GetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGetError, GetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGetData, GetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGetError, GetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGetData, GetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGetError, GetWarehousesWarehousesGetData, GetWarehousesWarehousesGetError, GetWarehouseWarehousesWarehouseIdGetData, GetWarehouseWarehousesWarehouseIdGetError, GrantPermissionPermissionsUserIdPermissionsPostData, GrantPermissionPermissionsUserIdPermissionsPostError, HealthCheckGetData, ListAddressesUserAddressesGetData, ListAllPermissionsPermissionsGetData, ListNotificationsNotificationsGetData, ListNotificationsNotificationsGetError, ListOwnReturnsReturnsMyGetData, ListOwnReviewsReviewsMyGetData, ListProductReviewsReviewsProductProductIdGetData, ListProductReviewsReviewsProductProductIdGetError, ListReceiptsStockReceiptsGetData, ListReceiptsStockReceiptsGetError, ListReturnsReturnsGetData, ListReturnsReturnsGetError, ListShopReturnsReturnsShopShopIdGetData, ListShopReturnsReturnsShopShopIdGetError, LoginAuthLoginPostData, LoginAuthLoginPostError, MarkAllReadNotificationsReadAllPatchData, MarkReadNotificationsNotificationIdReadPatchData, MarkReadNotificationsNotificationIdReadPatchError, MeAuthMeGetData, ModerationCountReviewsModerationCountGetData, ModerationQueueReviewsModerationGetData, ModerationQueueReviewsModerationGetError, PendingCountReturnsCountGetData, ProductReviewSummaryReviewsProductProductIdSummaryGetData, ProductReviewSummaryReviewsProductProductIdSummaryGetError, ReadContactUsContactUsGetData, ReadContactUsContactUsGetError, ReadDeliveryMessageDeliveryMessageGetData, ReadFeaturesFeaturesGetData, ReceiveReturnReturnsRequestIdReceivePatchData, ReceiveReturnReturnsRequestIdReceivePatchError, RefreshAuthRefreshPostData, RefreshAuthRefreshPostError, RejectReturnReturnsRequestIdRejectPatchData, RejectReturnReturnsRequestIdRejectPatchError, RejectReviewReviewsReviewIdRejectPatchData, RejectReviewReviewsReviewIdRejectPatchError, RemoveFromCartCartProductIdDeleteData, RemoveFromCartCartProductIdDeleteError, RemoveFromFavoritesFavoritesProductIdDeleteData, RemoveFromFavoritesFavoritesProductIdDeleteError, RequestOtpAuthOtpRequestPostData, RequestOtpAuthOtpRequestPostError, RequestPhoneChangeAuthPhoneChangeRequestPostData, RequestPhoneChangeAuthPhoneChangeRequestPostError, ReviewEligibilityReviewsProductProductIdEligibilityGetData, ReviewEligibilityReviewsProductProductIdEligibilityGetError, RevokeAllPermissionsPermissionsUserIdPermissionsDeleteData, RevokeAllPermissionsPermissionsUserIdPermissionsDeleteError, RevokePermissionPermissionsUserIdPermissionsPermissionCodeDeleteData, RevokePermissionPermissionsUserIdPermissionsPermissionCodeDeleteError, SearchSearchGetData, SearchSearchGetError, SetContactUsHandledContactUsContactIdHandledPatchData, SetContactUsHandledContactUsContactIdHandledPatchError, SetDefaultAddressUserAddressesAddressIdDefaultPatchData, SetDefaultAddressUserAddressesAddressIdDefaultPatchError, SetStockStockOperationsSetPostData, SetStockStockOperationsSetPostError, SetUserPermissionsPermissionsUserIdPermissionsPutData, SetUserPermissionsPermissionsUserIdPermissionsPutError, UnblockBannerBannersBannerIdUnblockPatchData, UnblockBannerBannersBannerIdUnblockPatchError, UnblockBrandBrandsBrandIdUnblockPatchData, UnblockBrandBrandsBrandIdUnblockPatchError, UnblockCategoryCategoriesCategoryIdUnblockPatchData, UnblockCategoryCategoriesCategoryIdUnblockPatchError, UnblockCityCitiesCityIdUnblockPatchData, UnblockCityCitiesCityIdUnblockPatchError, UnblockCollectionCollectionsCollectionIdUnblockPatchData, UnblockCollectionCollectionsCollectionIdUnblockPatchError, UnblockCountryCountriesCountryIdUnblockPatchData, UnblockCountryCountriesCountryIdUnblockPatchError, UnblockCurrencyCurrenciesCurrencyIdUnblockPatchData, UnblockCurrencyCurrenciesCurrencyIdUnblockPatchError, UnblockMeasureUnitMeasureUnitsUnitIdUnblockPatchData, UnblockMeasureUnitMeasureUnitsUnitIdUnblockPatchError, UnblockPickupPointPickupPointsPickupPointIdUnblockPatchData, UnblockPickupPointPickupPointsPickupPointIdUnblockPatchError, UnblockProductProductsProductIdUnblockPatchData, UnblockProductProductsProductIdUnblockPatchError, UnblockRegionRegionsRegionIdUnblockPatchData, UnblockRegionRegionsRegionIdUnblockPatchError, UnblockShopBaseShopBasesShopIdUnblockPatchData, UnblockShopBaseShopBasesShopIdUnblockPatchError, UnblockUserUsersUserIdUnblockPatchData, UnblockUserUsersUserIdUnblockPatchError, UnblockWarehouseWarehousesWarehouseIdUnblockPatchData, UnblockWarehouseWarehousesWarehouseIdUnblockPatchError, UnreadCountNotificationsUnreadCountGetData, UpdateAddressUserAddressesAddressIdPutData, UpdateAddressUserAddressesAddressIdPutError, UpdateBannerBannersBannerIdPutData, UpdateBannerBannersBannerIdPutError, UpdateBrandBrandsBrandIdPutData, UpdateBrandBrandsBrandIdPutError, UpdateCartItemCartProductIdPutData, UpdateCartItemCartProductIdPutError, UpdateCategoryCategoriesCategoryIdPutData, UpdateCategoryCategoriesCategoryIdPutError, UpdateCityCitiesCityIdPutData, UpdateCityCitiesCityIdPutError, UpdateCollectionCollectionsCollectionIdPutData, UpdateCollectionCollectionsCollectionIdPutError, UpdateCountryCountriesCountryIdPutData, UpdateCountryCountriesCountryIdPutError, UpdateCurrencyCurrenciesCurrencyIdPutData, UpdateCurrencyCurrenciesCurrencyIdPutError, UpdateDeliveryMessageDeliveryMessagePutData, UpdateDeliveryMessageDeliveryMessagePutError, UpdateItemQuantityStockReceiptsReceiptIdItemsItemIdPatchData, UpdateItemQuantityStockReceiptsReceiptIdItemsItemIdPatchError, UpdateMeasureUnitMeasureUnitsUnitIdPutData, UpdateMeasureUnitMeasureUnitsUnitIdPutError, UpdateOrderStatusOrdersOrderIdStatusPatchData, UpdateOrderStatusOrdersOrderIdStatusPatchError, UpdateOrderStatusTranslationsOrderStatusesOrderStatusIdTranslationsPutData, UpdateOrderStatusTranslationsOrderStatusesOrderStatusIdTranslationsPutError, UpdatePickupPointPickupPointsPickupPointIdPutData, UpdatePickupPointPickupPointsPickupPointIdPutError, UpdateProductProductsProductIdPutData, UpdateProductProductsProductIdPutError, UpdateRegionRegionsRegionIdPutData, UpdateRegionRegionsRegionIdPutError, UpdateReviewReviewsReviewIdPutData, UpdateReviewReviewsReviewIdPutError, UpdateShopAdditionalShopAdditionalsShopAdditionalIdPutData, UpdateShopAdditionalShopAdditionalsShopAdditionalIdPutError, UpdateShopBaseRegistrationStatusShopBasesShopIdRegistrationStatusPatchData, UpdateShopBaseRegistrationStatusShopBasesShopIdRegistrationStatusPatchError, UpdateShopBaseShopBasesShopIdPutData, UpdateShopBaseShopBasesShopIdPutError, UpdateShopOrderStatusOrdersOrderIdShopShopIdStatusPatchData, UpdateShopOrderStatusOrdersOrderIdShopShopIdStatusPatchError, UpdateUserUsersUserIdPutData, UpdateUserUsersUserIdPutError, UpdateWarehouseWarehousesWarehouseIdPutData, UpdateWarehouseWarehousesWarehouseIdPutError, UploadBannerImageBannersBannerIdImagePostData, UploadBannerImageBannersBannerIdImagePostError, UploadBrandImageBrandsBrandIdImagePostData, UploadBrandImageBrandsBrandIdImagePostError, UploadCategoryImageCategoriesCategoryIdImagePostData, UploadCategoryImageCategoriesCategoryIdImagePostError, UploadShopDocumentsShopBasesShopIdDocumentsPostData, UploadShopDocumentsShopBasesShopIdDocumentsPostError, VerifyOtpAuthOtpVerifyPostData, VerifyOtpAuthOtpVerifyPostError, VerifyPhoneChangeAuthPhoneChangeVerifyPostData, VerifyPhoneChangeAuthPhoneChangeVerifyPostError } from "../requests/types.gen";
import * as Common from "./common";
/**
* Me
*/
export const useMeAuthMeGet = <TData = Common.MeAuthMeGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<MeAuthMeGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseMeAuthMeGetKeyFn(clientOptions, queryKey), queryFn: () => meAuthMeGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Users
*/
export const useGetUsersUsersGet = <TData = Common.GetUsersUsersGetDefaultResponse, TError = GetUsersUsersGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetUsersUsersGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetUsersUsersGetKeyFn(clientOptions, queryKey), queryFn: () => getUsersUsersGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Me
*
* Текущий пользователь видит свой профиль и список своих прав.
*/
export const useGetMeUsersMeGet = <TData = Common.GetMeUsersMeGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetMeUsersMeGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetMeUsersMeGetKeyFn(clientOptions, queryKey), queryFn: () => getMeUsersMeGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get User
*/
export const useGetUserUsersUserIdGet = <TData = Common.GetUserUsersUserIdGetDefaultResponse, TError = GetUserUsersUserIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetUserUsersUserIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetUserUsersUserIdGetKeyFn(clientOptions, queryKey), queryFn: () => getUserUsersUserIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* List All Permissions
*
* Список всех доступных в системе прав.
*/
export const useListAllPermissionsPermissionsGet = <TData = Common.ListAllPermissionsPermissionsGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListAllPermissionsPermissionsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseListAllPermissionsPermissionsGetKeyFn(clientOptions, queryKey), queryFn: () => listAllPermissionsPermissionsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get User Permissions
*
* Права пользователя вместе с тем, кто и когда их выдал.
*
* granted_at и granted_by писались, но не читались нигде — аудит выдачи прав
* был недостижим. Пустой granted_by означает системную выдачу: регистрация
* по SMS и первичное заполнение прав.
*/
export const useGetUserPermissionsPermissionsUserIdPermissionsGet = <TData = Common.GetUserPermissionsPermissionsUserIdPermissionsGetDefaultResponse, TError = GetUserPermissionsPermissionsUserIdPermissionsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetUserPermissionsPermissionsUserIdPermissionsGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetUserPermissionsPermissionsUserIdPermissionsGetKeyFn(clientOptions, queryKey), queryFn: () => getUserPermissionsPermissionsUserIdPermissionsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Brands
*/
export const useGetBrandsBrandsGet = <TData = Common.GetBrandsBrandsGetDefaultResponse, TError = GetBrandsBrandsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetBrandsBrandsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetBrandsBrandsGetKeyFn(clientOptions, queryKey), queryFn: () => getBrandsBrandsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Brand
*/
export const useGetBrandBrandsBrandIdGet = <TData = Common.GetBrandBrandsBrandIdGetDefaultResponse, TError = GetBrandBrandsBrandIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetBrandBrandsBrandIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetBrandBrandsBrandIdGetKeyFn(clientOptions, queryKey), queryFn: () => getBrandBrandsBrandIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Categories
*/
export const useGetCategoriesCategoriesGet = <TData = Common.GetCategoriesCategoriesGetDefaultResponse, TError = GetCategoriesCategoriesGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCategoriesCategoriesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetCategoriesCategoriesGetKeyFn(clientOptions, queryKey), queryFn: () => getCategoriesCategoriesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Category
*/
export const useGetCategoryCategoriesCategoryIdGet = <TData = Common.GetCategoryCategoriesCategoryIdGetDefaultResponse, TError = GetCategoryCategoriesCategoryIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCategoryCategoriesCategoryIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetCategoryCategoriesCategoryIdGetKeyFn(clientOptions, queryKey), queryFn: () => getCategoryCategoriesCategoryIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Countries
*/
export const useGetCountriesCountriesGet = <TData = Common.GetCountriesCountriesGetDefaultResponse, TError = GetCountriesCountriesGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCountriesCountriesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetCountriesCountriesGetKeyFn(clientOptions, queryKey), queryFn: () => getCountriesCountriesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Country
*/
export const useGetCountryCountriesCountryIdGet = <TData = Common.GetCountryCountriesCountryIdGetDefaultResponse, TError = GetCountryCountriesCountryIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCountryCountriesCountryIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetCountryCountriesCountryIdGetKeyFn(clientOptions, queryKey), queryFn: () => getCountryCountriesCountryIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Regions
*/
export const useGetRegionsRegionsGet = <TData = Common.GetRegionsRegionsGetDefaultResponse, TError = GetRegionsRegionsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetRegionsRegionsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetRegionsRegionsGetKeyFn(clientOptions, queryKey), queryFn: () => getRegionsRegionsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Region
*/
export const useGetRegionRegionsRegionIdGet = <TData = Common.GetRegionRegionsRegionIdGetDefaultResponse, TError = GetRegionRegionsRegionIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetRegionRegionsRegionIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetRegionRegionsRegionIdGetKeyFn(clientOptions, queryKey), queryFn: () => getRegionRegionsRegionIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Cities
*/
export const useGetCitiesCitiesGet = <TData = Common.GetCitiesCitiesGetDefaultResponse, TError = GetCitiesCitiesGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCitiesCitiesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetCitiesCitiesGetKeyFn(clientOptions, queryKey), queryFn: () => getCitiesCitiesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get City
*/
export const useGetCityCitiesCityIdGet = <TData = Common.GetCityCitiesCityIdGetDefaultResponse, TError = GetCityCitiesCityIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCityCitiesCityIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetCityCitiesCityIdGetKeyFn(clientOptions, queryKey), queryFn: () => getCityCitiesCityIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Currencies
*/
export const useGetCurrenciesCurrenciesGet = <TData = Common.GetCurrenciesCurrenciesGetDefaultResponse, TError = GetCurrenciesCurrenciesGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCurrenciesCurrenciesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetCurrenciesCurrenciesGetKeyFn(clientOptions, queryKey), queryFn: () => getCurrenciesCurrenciesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Currency
*/
export const useGetCurrencyCurrenciesCurrencyIdGet = <TData = Common.GetCurrencyCurrenciesCurrencyIdGetDefaultResponse, TError = GetCurrencyCurrenciesCurrencyIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCurrencyCurrenciesCurrencyIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetCurrencyCurrenciesCurrencyIdGetKeyFn(clientOptions, queryKey), queryFn: () => getCurrencyCurrenciesCurrencyIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Measure Units
*/
export const useGetMeasureUnitsMeasureUnitsGet = <TData = Common.GetMeasureUnitsMeasureUnitsGetDefaultResponse, TError = GetMeasureUnitsMeasureUnitsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetMeasureUnitsMeasureUnitsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetMeasureUnitsMeasureUnitsGetKeyFn(clientOptions, queryKey), queryFn: () => getMeasureUnitsMeasureUnitsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Measure Unit
*/
export const useGetMeasureUnitMeasureUnitsUnitIdGet = <TData = Common.GetMeasureUnitMeasureUnitsUnitIdGetDefaultResponse, TError = GetMeasureUnitMeasureUnitsUnitIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetMeasureUnitMeasureUnitsUnitIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetMeasureUnitMeasureUnitsUnitIdGetKeyFn(clientOptions, queryKey), queryFn: () => getMeasureUnitMeasureUnitsUnitIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Bases
*/
export const useGetShopBasesShopBasesGet = <TData = Common.GetShopBasesShopBasesGetDefaultResponse, TError = GetShopBasesShopBasesGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopBasesShopBasesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetShopBasesShopBasesGetKeyFn(clientOptions, queryKey), queryFn: () => getShopBasesShopBasesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get All Shops Full
*/
export const useGetAllShopsFullShopBasesFullGet = <TData = Common.GetAllShopsFullShopBasesFullGetDefaultResponse, TError = GetAllShopsFullShopBasesFullGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetAllShopsFullShopBasesFullGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetAllShopsFullShopBasesFullGetKeyFn(clientOptions, queryKey), queryFn: () => getAllShopsFullShopBasesFullGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Pending Shops Count
*
* Количество заявок на новый магазин (статус регистрации = pending).
*/
export const useGetPendingShopsCountShopBasesPendingCountGet = <TData = Common.GetPendingShopsCountShopBasesPendingCountGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetPendingShopsCountShopBasesPendingCountGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetPendingShopsCountShopBasesPendingCountGetKeyFn(clientOptions, queryKey), queryFn: () => getPendingShopsCountShopBasesPendingCountGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Base
*
* Карточка магазина с владельцем и документами — своя либо для сотрудника.
*/
export const useGetShopBaseShopBasesShopIdGet = <TData = Common.GetShopBaseShopBasesShopIdGetDefaultResponse, TError = GetShopBaseShopBasesShopIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopBaseShopBasesShopIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetShopBaseShopBasesShopIdGetKeyFn(clientOptions, queryKey), queryFn: () => getShopBaseShopBasesShopIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
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
export const useDownloadShopDocumentShopBasesShopIdDocumentsFilenameGet = <TData = Common.DownloadShopDocumentShopBasesShopIdDocumentsFilenameGetDefaultResponse, TError = DownloadShopDocumentShopBasesShopIdDocumentsFilenameGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<DownloadShopDocumentShopBasesShopIdDocumentsFilenameGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseDownloadShopDocumentShopBasesShopIdDocumentsFilenameGetKeyFn(clientOptions, queryKey), queryFn: () => downloadShopDocumentShopBasesShopIdDocumentsFilenameGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Additionals
*/
export const useGetShopAdditionalsShopAdditionalsGet = <TData = Common.GetShopAdditionalsShopAdditionalsGetDefaultResponse, TError = GetShopAdditionalsShopAdditionalsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopAdditionalsShopAdditionalsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetShopAdditionalsShopAdditionalsGetKeyFn(clientOptions, queryKey), queryFn: () => getShopAdditionalsShopAdditionalsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Additional By Shop Base
*/
export const useGetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet = <TData = Common.GetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetDefaultResponse, TError = GetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetKeyFn(clientOptions, queryKey), queryFn: () => getShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Additional
*/
export const useGetShopAdditionalShopAdditionalsShopAdditionalIdGet = <TData = Common.GetShopAdditionalShopAdditionalsShopAdditionalIdGetDefaultResponse, TError = GetShopAdditionalShopAdditionalsShopAdditionalIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopAdditionalShopAdditionalsShopAdditionalIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetShopAdditionalShopAdditionalsShopAdditionalIdGetKeyFn(clientOptions, queryKey), queryFn: () => getShopAdditionalShopAdditionalsShopAdditionalIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Products
*/
export const useGetProductsProductsGet = <TData = Common.GetProductsProductsGetDefaultResponse, TError = GetProductsProductsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetProductsProductsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetProductsProductsGetKeyFn(clientOptions, queryKey), queryFn: () => getProductsProductsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get My Products
*
* «Мои товары» владельца: товары его магазинов в любом статусе (включая pending/declined).
*
* Если передан `shop_base_id` — возвращаются товары только этого магазина (при условии,
* что он принадлежит текущему пользователю).
*/
export const useGetMyProductsProductsMyGet = <TData = Common.GetMyProductsProductsMyGetDefaultResponse, TError = GetMyProductsProductsMyGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetMyProductsProductsMyGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetMyProductsProductsMyGetKeyFn(clientOptions, queryKey), queryFn: () => getMyProductsProductsMyGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Moderation Count
*
* Количество товаров, ожидающих модерации (status = pending).
*/
export const useGetModerationCountProductsModerationCountGet = <TData = Common.GetModerationCountProductsModerationCountGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetModerationCountProductsModerationCountGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetModerationCountProductsModerationCountGetKeyFn(clientOptions, queryKey), queryFn: () => getModerationCountProductsModerationCountGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Moderation Queue
*
* Очередь модерации (для администратора): товары по статусу, без скрытия немодерированных.
*/
export const useGetModerationQueueProductsModerationGet = <TData = Common.GetModerationQueueProductsModerationGetDefaultResponse, TError = GetModerationQueueProductsModerationGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetModerationQueueProductsModerationGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetModerationQueueProductsModerationGetKeyFn(clientOptions, queryKey), queryFn: () => getModerationQueueProductsModerationGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Product For Moderation
*
* Полная информация о товаре для администратора — в любом статусе и вне зависимости от активности.
*/
export const useGetProductForModerationProductsModerationProductIdGet = <TData = Common.GetProductForModerationProductsModerationProductIdGetDefaultResponse, TError = GetProductForModerationProductsModerationProductIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetProductForModerationProductsModerationProductIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetProductForModerationProductsModerationProductIdGetKeyFn(clientOptions, queryKey), queryFn: () => getProductForModerationProductsModerationProductIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Brands By Category And City
*
* Уникальные бренды, у которых есть видимые товары в данной категории и городе.
*/
export const useGetBrandsByCategoryAndCityProductsBrandsGet = <TData = Common.GetBrandsByCategoryAndCityProductsBrandsGetDefaultResponse, TError = GetBrandsByCategoryAndCityProductsBrandsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetBrandsByCategoryAndCityProductsBrandsGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetBrandsByCategoryAndCityProductsBrandsGetKeyFn(clientOptions, queryKey), queryFn: () => getBrandsByCategoryAndCityProductsBrandsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Product
*/
export const useGetProductProductsProductIdGet = <TData = Common.GetProductProductsProductIdGetDefaultResponse, TError = GetProductProductsProductIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetProductProductsProductIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetProductProductsProductIdGetKeyFn(clientOptions, queryKey), queryFn: () => getProductProductsProductIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Similar Products
*/
export const useGetSimilarProductsProductsProductIdSimilarGet = <TData = Common.GetSimilarProductsProductsProductIdSimilarGetDefaultResponse, TError = GetSimilarProductsProductsProductIdSimilarGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetSimilarProductsProductsProductIdSimilarGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetSimilarProductsProductsProductIdSimilarGetKeyFn(clientOptions, queryKey), queryFn: () => getSimilarProductsProductsProductIdSimilarGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Banners
*/
export const useGetBannersBannersGet = <TData = Common.GetBannersBannersGetDefaultResponse, TError = GetBannersBannersGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetBannersBannersGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetBannersBannersGetKeyFn(clientOptions, queryKey), queryFn: () => getBannersBannersGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Banner
*/
export const useGetBannerBannersBannerIdGet = <TData = Common.GetBannerBannersBannerIdGetDefaultResponse, TError = GetBannerBannersBannerIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetBannerBannersBannerIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetBannerBannersBannerIdGetKeyFn(clientOptions, queryKey), queryFn: () => getBannerBannersBannerIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Collections
*/
export const useGetCollectionsCollectionsGet = <TData = Common.GetCollectionsCollectionsGetDefaultResponse, TError = GetCollectionsCollectionsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCollectionsCollectionsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetCollectionsCollectionsGetKeyFn(clientOptions, queryKey), queryFn: () => getCollectionsCollectionsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Collection
*/
export const useGetCollectionCollectionsCollectionIdGet = <TData = Common.GetCollectionCollectionsCollectionIdGetDefaultResponse, TError = GetCollectionCollectionsCollectionIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCollectionCollectionsCollectionIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetCollectionCollectionsCollectionIdGetKeyFn(clientOptions, queryKey), queryFn: () => getCollectionCollectionsCollectionIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Cart
*/
export const useGetCartCartGet = <TData = Common.GetCartCartGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCartCartGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetCartCartGetKeyFn(clientOptions, queryKey), queryFn: () => getCartCartGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Favorites
*/
export const useGetFavoritesFavoritesGet = <TData = Common.GetFavoritesFavoritesGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetFavoritesFavoritesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetFavoritesFavoritesGetKeyFn(clientOptions, queryKey), queryFn: () => getFavoritesFavoritesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* List Addresses
*
* Свои адреса. Чужих в выдаче нет: фильтр по владельцу, а не по запросу.
*/
export const useListAddressesUserAddressesGet = <TData = Common.ListAddressesUserAddressesGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListAddressesUserAddressesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseListAddressesUserAddressesGetKeyFn(clientOptions, queryKey), queryFn: () => listAddressesUserAddressesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* List Product Reviews
*
* Подтверждённые отзывы о товаре. Метод публичный: отзывы для покупателей.
*/
export const useListProductReviewsReviewsProductProductIdGet = <TData = Common.ListProductReviewsReviewsProductProductIdGetDefaultResponse, TError = ListProductReviewsReviewsProductProductIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListProductReviewsReviewsProductProductIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseListProductReviewsReviewsProductProductIdGetKeyFn(clientOptions, queryKey), queryFn: () => listProductReviewsReviewsProductProductIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Product Review Summary
*
* Сводка по товару: средняя оценка, количество и разбивка по звёздам.
*
* Средняя и количество берутся из товара — они уже пересчитаны и совпадают с
* тем, что показано в каталоге. Разбивка считается запросом: она нужна только
* на карточке товара, и хранить её незачем.
*/
export const useProductReviewSummaryReviewsProductProductIdSummaryGet = <TData = Common.ProductReviewSummaryReviewsProductProductIdSummaryGetDefaultResponse, TError = ProductReviewSummaryReviewsProductProductIdSummaryGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ProductReviewSummaryReviewsProductProductIdSummaryGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseProductReviewSummaryReviewsProductProductIdSummaryGetKeyFn(clientOptions, queryKey), queryFn: () => productReviewSummaryReviewsProductProductIdSummaryGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Review Eligibility
*
* Можно ли оставить отзыв на этот товар.
*
* Отдельный метод, потому что форму надо показать или не показать до того, как
* человек начнёт писать: получить отказ после набранного текста — худший из
* возможных вариантов.
*/
export const useReviewEligibilityReviewsProductProductIdEligibilityGet = <TData = Common.ReviewEligibilityReviewsProductProductIdEligibilityGetDefaultResponse, TError = ReviewEligibilityReviewsProductProductIdEligibilityGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ReviewEligibilityReviewsProductProductIdEligibilityGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseReviewEligibilityReviewsProductProductIdEligibilityGetKeyFn(clientOptions, queryKey), queryFn: () => reviewEligibilityReviewsProductProductIdEligibilityGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* List Own Reviews
*
* Свои отзывы в любом состоянии.
*
* Автор должен видеть и непроверенные, и отклонённые вместе с причиной: иначе
* отзыв после отправки просто пропадает, и непонятно, дошёл ли он.
*/
export const useListOwnReviewsReviewsMyGet = <TData = Common.ListOwnReviewsReviewsMyGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListOwnReviewsReviewsMyGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseListOwnReviewsReviewsMyGetKeyFn(clientOptions, queryKey), queryFn: () => listOwnReviewsReviewsMyGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Moderation Queue
*
* Очередь проверки. По умолчанию — непроверенные.
*
* Пагинация через общие limit_param/skip_param, а не своим Query: свой предел
* в 100 расходился с остальными списками (общий максимум — 500), и админка,
* запрашивающая 500, получала 422 на пустой странице.
*/
export const useModerationQueueReviewsModerationGet = <TData = Common.ModerationQueueReviewsModerationGetDefaultResponse, TError = ModerationQueueReviewsModerationGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ModerationQueueReviewsModerationGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseModerationQueueReviewsModerationGetKeyFn(clientOptions, queryKey), queryFn: () => moderationQueueReviewsModerationGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Moderation Count
*
* Сколько отзывов ждёт проверки — для отметки в меню админки.
*/
export const useModerationCountReviewsModerationCountGet = <TData = Common.ModerationCountReviewsModerationCountGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ModerationCountReviewsModerationCountGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseModerationCountReviewsModerationCountGetKeyFn(clientOptions, queryKey), queryFn: () => moderationCountReviewsModerationCountGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* List Own Returns
*
* Свои заявки в любом состоянии.
*
* Отклонённые тоже: без них заявка после отказа просто исчезает, и непонятно,
* рассмотрели её или потеряли.
*/
export const useListOwnReturnsReturnsMyGet = <TData = Common.ListOwnReturnsReturnsMyGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListOwnReturnsReturnsMyGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseListOwnReturnsReturnsMyGetKeyFn(clientOptions, queryKey), queryFn: () => listOwnReturnsReturnsMyGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* List Returns
*
* Все заявки. Без фильтра — целиком, чтобы видеть и разобранные.
*/
export const useListReturnsReturnsGet = <TData = Common.ListReturnsReturnsGetDefaultResponse, TError = ListReturnsReturnsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListReturnsReturnsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseListReturnsReturnsGetKeyFn(clientOptions, queryKey), queryFn: () => listReturnsReturnsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
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
export const useListShopReturnsReturnsShopShopIdGet = <TData = Common.ListShopReturnsReturnsShopShopIdGetDefaultResponse, TError = ListShopReturnsReturnsShopShopIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListShopReturnsReturnsShopShopIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseListShopReturnsReturnsShopShopIdGetKeyFn(clientOptions, queryKey), queryFn: () => listShopReturnsReturnsShopShopIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Pending Count
*
* Сколько заявок ждёт решения — для отметки в меню админки.
*/
export const usePendingCountReturnsCountGet = <TData = Common.PendingCountReturnsCountGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<PendingCountReturnsCountGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UsePendingCountReturnsCountGetKeyFn(clientOptions, queryKey), queryFn: () => pendingCountReturnsCountGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* List Notifications
*
* Свои уведомления, новые сверху.
*
* Отдельного права нет: уведомления адресные, и фильтр по владельцу — не
* ограничение доступа, а само определение выдачи.
*/
export const useListNotificationsNotificationsGet = <TData = Common.ListNotificationsNotificationsGetDefaultResponse, TError = ListNotificationsNotificationsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListNotificationsNotificationsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseListNotificationsNotificationsGetKeyFn(clientOptions, queryKey), queryFn: () => listNotificationsNotificationsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Unread Count
*
* Сколько непрочитанных — для отметки в интерфейсе.
*/
export const useUnreadCountNotificationsUnreadCountGet = <TData = Common.UnreadCountNotificationsUnreadCountGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<UnreadCountNotificationsUnreadCountGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseUnreadCountNotificationsUnreadCountGetKeyFn(clientOptions, queryKey), queryFn: () => unreadCountNotificationsUnreadCountGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Warehouses
*/
export const useGetWarehousesWarehousesGet = <TData = Common.GetWarehousesWarehousesGetDefaultResponse, TError = GetWarehousesWarehousesGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetWarehousesWarehousesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetWarehousesWarehousesGetKeyFn(clientOptions, queryKey), queryFn: () => getWarehousesWarehousesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Warehouse
*/
export const useGetWarehouseWarehousesWarehouseIdGet = <TData = Common.GetWarehouseWarehousesWarehouseIdGetDefaultResponse, TError = GetWarehouseWarehousesWarehouseIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetWarehouseWarehousesWarehouseIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetWarehouseWarehousesWarehouseIdGetKeyFn(clientOptions, queryKey), queryFn: () => getWarehouseWarehousesWarehouseIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Read Delivery Message
*/
export const useReadDeliveryMessageDeliveryMessageGet = <TData = Common.ReadDeliveryMessageDeliveryMessageGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ReadDeliveryMessageDeliveryMessageGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseReadDeliveryMessageDeliveryMessageGetKeyFn(clientOptions, queryKey), queryFn: () => readDeliveryMessageDeliveryMessageGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
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
export const useGetProductsAvailabilityStockOperationsAvailabilityGet = <TData = Common.GetProductsAvailabilityStockOperationsAvailabilityGetDefaultResponse, TError = GetProductsAvailabilityStockOperationsAvailabilityGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetProductsAvailabilityStockOperationsAvailabilityGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetProductsAvailabilityStockOperationsAvailabilityGetKeyFn(clientOptions, queryKey), queryFn: () => getProductsAvailabilityStockOperationsAvailabilityGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Product Stock
*
* Журнал движений товара — коммерческая тайна магазина, только своя.
*/
export const useGetProductStockStockOperationsProductIdGet = <TData = Common.GetProductStockStockOperationsProductIdGetDefaultResponse, TError = GetProductStockStockOperationsProductIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetProductStockStockOperationsProductIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetProductStockStockOperationsProductIdGetKeyFn(clientOptions, queryKey), queryFn: () => getProductStockStockOperationsProductIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Product Balance
*/
export const useGetProductBalanceStockOperationsProductIdBalanceGet = <TData = Common.GetProductBalanceStockOperationsProductIdBalanceGetDefaultResponse, TError = GetProductBalanceStockOperationsProductIdBalanceGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetProductBalanceStockOperationsProductIdBalanceGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetProductBalanceStockOperationsProductIdBalanceGetKeyFn(clientOptions, queryKey), queryFn: () => getProductBalanceStockOperationsProductIdBalanceGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
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
export const useGetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGet = <TData = Common.GetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGetDefaultResponse, TError = GetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGetKeyFn(clientOptions, queryKey), queryFn: () => getWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Warehouse Product Stock
*/
export const useGetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGet = <TData = Common.GetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGetDefaultResponse, TError = GetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGetKeyFn(clientOptions, queryKey), queryFn: () => getWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Warehouse Product Balance
*/
export const useGetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGet = <TData = Common.GetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGetDefaultResponse, TError = GetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGetKeyFn(clientOptions, queryKey), queryFn: () => getWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* List Receipts
*/
export const useListReceiptsStockReceiptsGet = <TData = Common.ListReceiptsStockReceiptsGetDefaultResponse, TError = ListReceiptsStockReceiptsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListReceiptsStockReceiptsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseListReceiptsStockReceiptsGetKeyFn(clientOptions, queryKey), queryFn: () => listReceiptsStockReceiptsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Receipt
*/
export const useGetReceiptStockReceiptsReceiptIdGet = <TData = Common.GetReceiptStockReceiptsReceiptIdGetDefaultResponse, TError = GetReceiptStockReceiptsReceiptIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetReceiptStockReceiptsReceiptIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetReceiptStockReceiptsReceiptIdGetKeyFn(clientOptions, queryKey), queryFn: () => getReceiptStockReceiptsReceiptIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Enabled features
*/
export const useReadFeaturesFeaturesGet = <TData = Common.ReadFeaturesFeaturesGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ReadFeaturesFeaturesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseReadFeaturesFeaturesGetKeyFn(clientOptions, queryKey), queryFn: () => readFeaturesFeaturesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Order Statuses
*/
export const useGetOrderStatusesOrderStatusesGet = <TData = Common.GetOrderStatusesOrderStatusesGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetOrderStatusesOrderStatusesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetOrderStatusesOrderStatusesGetKeyFn(clientOptions, queryKey), queryFn: () => getOrderStatusesOrderStatusesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Order Status
*/
export const useGetOrderStatusOrderStatusesOrderStatusIdGet = <TData = Common.GetOrderStatusOrderStatusesOrderStatusIdGetDefaultResponse, TError = GetOrderStatusOrderStatusesOrderStatusIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetOrderStatusOrderStatusesOrderStatusIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetOrderStatusOrderStatusesOrderStatusIdGetKeyFn(clientOptions, queryKey), queryFn: () => getOrderStatusOrderStatusesOrderStatusIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Pickup Points
*/
export const useGetPickupPointsPickupPointsGet = <TData = Common.GetPickupPointsPickupPointsGetDefaultResponse, TError = GetPickupPointsPickupPointsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetPickupPointsPickupPointsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetPickupPointsPickupPointsGetKeyFn(clientOptions, queryKey), queryFn: () => getPickupPointsPickupPointsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Pickup Point
*/
export const useGetPickupPointPickupPointsPickupPointIdGet = <TData = Common.GetPickupPointPickupPointsPickupPointIdGetDefaultResponse, TError = GetPickupPointPickupPointsPickupPointIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetPickupPointPickupPointsPickupPointIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetPickupPointPickupPointsPickupPointIdGetKeyFn(clientOptions, queryKey), queryFn: () => getPickupPointPickupPointsPickupPointIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
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
export const useGetOrdersOrdersGet = <TData = Common.GetOrdersOrdersGetDefaultResponse, TError = GetOrdersOrdersGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetOrdersOrdersGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetOrdersOrdersGetKeyFn(clientOptions, queryKey), queryFn: () => getOrdersOrdersGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Pending Orders Count
*
* Сколько заказов ждут оператора — для счётчика в меню админки.
*
* Оператор узнавал о новом заказе, только открыв список: у модерации,
* возвратов и приёмки счётчики были, у заказов — нет.
*/
export const useGetPendingOrdersCountOrdersPendingCountGet = <TData = Common.GetPendingOrdersCountOrdersPendingCountGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetPendingOrdersCountOrdersPendingCountGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetPendingOrdersCountOrdersPendingCountGetKeyFn(clientOptions, queryKey), queryFn: () => getPendingOrdersCountOrdersPendingCountGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Fbo Attention Count
*
* Сколько заказов ждут сборки складом Postshop — для счётчика в админке.
*/
export const useGetFboAttentionCountOrdersFboAttentionCountGet = <TData = Common.GetFboAttentionCountOrdersFboAttentionCountGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetFboAttentionCountOrdersFboAttentionCountGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetFboAttentionCountOrdersFboAttentionCountGetKeyFn(clientOptions, queryKey), queryFn: () => getFboAttentionCountOrdersFboAttentionCountGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Attention Count
*
* Сколько заказов ждут действий продавца — для счётчика «Мои заказы».
*
* Это части FBS в одобренном оператором заказе, которые ещё не приняты или
* не собраны. Части FBO собирает склад Postshop — продавцу они не задача.
*/
export const useGetShopAttentionCountOrdersShopShopIdAttentionCountGet = <TData = Common.GetShopAttentionCountOrdersShopShopIdAttentionCountGetDefaultResponse, TError = GetShopAttentionCountOrdersShopShopIdAttentionCountGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopAttentionCountOrdersShopShopIdAttentionCountGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetShopAttentionCountOrdersShopShopIdAttentionCountGetKeyFn(clientOptions, queryKey), queryFn: () => getShopAttentionCountOrdersShopShopIdAttentionCountGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get My Orders
*/
export const useGetMyOrdersOrdersMyGet = <TData = Common.GetMyOrdersOrdersMyGetDefaultResponse, TError = GetMyOrdersOrdersMyGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetMyOrdersOrdersMyGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetMyOrdersOrdersMyGetKeyFn(clientOptions, queryKey), queryFn: () => getMyOrdersOrdersMyGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Orders
*/
export const useGetShopOrdersOrdersShopShopIdGet = <TData = Common.GetShopOrdersOrdersShopShopIdGetDefaultResponse, TError = GetShopOrdersOrdersShopShopIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopOrdersOrdersShopShopIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetShopOrdersOrdersShopShopIdGetKeyFn(clientOptions, queryKey), queryFn: () => getShopOrdersOrdersShopShopIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Top Products
*
* Самые покупаемые товары магазина — по суммарному проданному количеству
* в завершённых (completed) заказах. Учитываются только неотклонённые части.
*/
export const useGetShopTopProductsOrdersShopShopIdTopProductsGet = <TData = Common.GetShopTopProductsOrdersShopShopIdTopProductsGetDefaultResponse, TError = GetShopTopProductsOrdersShopShopIdTopProductsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopTopProductsOrdersShopShopIdTopProductsGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetShopTopProductsOrdersShopShopIdTopProductsGetKeyFn(clientOptions, queryKey), queryFn: () => getShopTopProductsOrdersShopShopIdTopProductsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
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
export const useGetShopSummaryOrdersShopShopIdSummaryGet = <TData = Common.GetShopSummaryOrdersShopShopIdSummaryGetDefaultResponse, TError = GetShopSummaryOrdersShopShopIdSummaryGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopSummaryOrdersShopShopIdSummaryGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetShopSummaryOrdersShopShopIdSummaryGetKeyFn(clientOptions, queryKey), queryFn: () => getShopSummaryOrdersShopShopIdSummaryGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
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
export const useGetShopInsightsOrdersShopShopIdInsightsGet = <TData = Common.GetShopInsightsOrdersShopShopIdInsightsGetDefaultResponse, TError = GetShopInsightsOrdersShopShopIdInsightsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopInsightsOrdersShopShopIdInsightsGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetShopInsightsOrdersShopShopIdInsightsGetKeyFn(clientOptions, queryKey), queryFn: () => getShopInsightsOrdersShopShopIdInsightsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Weekly Revenue
*
* Суммарный доход магазина за текущую неделю (с понедельника 00:00 этой
* недели) по завершённым заказам, без отклонённых частей. Период — по дате
* создания заказа (отдельной даты завершения в модели нет).
*/
export const useGetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGet = <TData = Common.GetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGetDefaultResponse, TError = GetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGetKeyFn(clientOptions, queryKey), queryFn: () => getShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Order
*
* Заказ доступен покупателю, магазину из состава заказа и сотруднику.
*/
export const useGetOrderOrdersOrderIdGet = <TData = Common.GetOrderOrdersOrderIdGetDefaultResponse, TError = GetOrderOrdersOrderIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetOrderOrdersOrderIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetOrderOrdersOrderIdGetKeyFn(clientOptions, queryKey), queryFn: () => getOrderOrdersOrderIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Search
*
* Общий поиск по маркетплейсу в рамках города.
*
* Возвращает товары (с фильтрами, релевантностью и пагинацией) и — если задан
* `q` — короткие подсказки: магазины города по названию, категории и бренды.
*/
export const useSearchSearchGet = <TData = Common.SearchSearchGetDefaultResponse, TError = SearchSearchGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<SearchSearchGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseSearchSearchGetKeyFn(clientOptions, queryKey), queryFn: () => searchSearchGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shops Statistics
*
* Количество магазинов с разбивкой по статусам регистрации (RegistrationStatus).
*/
export const useGetShopsStatisticsStatisticsShopsGet = <TData = Common.GetShopsStatisticsStatisticsShopsGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopsStatisticsStatisticsShopsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetShopsStatisticsStatisticsShopsGetKeyFn(clientOptions, queryKey), queryFn: () => getShopsStatisticsStatisticsShopsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Clients Statistics
*
* Количество клиентов — пользователей с флагом client=True.
*/
export const useGetClientsStatisticsStatisticsClientsGet = <TData = Common.GetClientsStatisticsStatisticsClientsGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetClientsStatisticsStatisticsClientsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetClientsStatisticsStatisticsClientsGetKeyFn(clientOptions, queryKey), queryFn: () => getClientsStatisticsStatisticsClientsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Orders Statistics
*
* Количество заказов с разбивкой по статусам (OrderStatusCode).
*/
export const useGetOrdersStatisticsStatisticsOrdersGet = <TData = Common.GetOrdersStatisticsStatisticsOrdersGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetOrdersStatisticsStatisticsOrdersGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseGetOrdersStatisticsStatisticsOrdersGetKeyFn(clientOptions, queryKey), queryFn: () => getOrdersStatisticsStatisticsOrdersGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Read Contact Us
*/
export const useReadContactUsContactUsGet = <TData = Common.ReadContactUsContactUsGetDefaultResponse, TError = ReadContactUsContactUsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ReadContactUsContactUsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseReadContactUsContactUsGetKeyFn(clientOptions, queryKey), queryFn: () => readContactUsContactUsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Health Check
*/
export const useHealthCheckGet = <TData = Common.HealthCheckGetDefaultResponse, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<HealthCheckGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useQuery<TData, TError>({ queryKey: Common.UseHealthCheckGetKeyFn(clientOptions, queryKey), queryFn: () => healthCheckGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Login
*/
export const useLoginAuthLoginPost = <TData = Common.LoginAuthLoginPostMutationResult, TError = LoginAuthLoginPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<LoginAuthLoginPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<LoginAuthLoginPostData, true>, TContext>({ mutationKey: Common.UseLoginAuthLoginPostKeyFn(mutationKey), mutationFn: clientOptions => loginAuthLoginPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Request Otp
*/
export const useRequestOtpAuthOtpRequestPost = <TData = Common.RequestOtpAuthOtpRequestPostMutationResult, TError = RequestOtpAuthOtpRequestPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<RequestOtpAuthOtpRequestPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<RequestOtpAuthOtpRequestPostData, true>, TContext>({ mutationKey: Common.UseRequestOtpAuthOtpRequestPostKeyFn(mutationKey), mutationFn: clientOptions => requestOtpAuthOtpRequestPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Verify Otp
*/
export const useVerifyOtpAuthOtpVerifyPost = <TData = Common.VerifyOtpAuthOtpVerifyPostMutationResult, TError = VerifyOtpAuthOtpVerifyPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<VerifyOtpAuthOtpVerifyPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<VerifyOtpAuthOtpVerifyPostData, true>, TContext>({ mutationKey: Common.UseVerifyOtpAuthOtpVerifyPostKeyFn(mutationKey), mutationFn: clientOptions => verifyOtpAuthOtpVerifyPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Refresh
*/
export const useRefreshAuthRefreshPost = <TData = Common.RefreshAuthRefreshPostMutationResult, TError = RefreshAuthRefreshPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<RefreshAuthRefreshPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<RefreshAuthRefreshPostData, true>, TContext>({ mutationKey: Common.UseRefreshAuthRefreshPostKeyFn(mutationKey), mutationFn: clientOptions => refreshAuthRefreshPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Change Password
*
* Смена своего пароля.
*
* Раньше пароль ставился через PUT /users/{id}, и текущий там не спрашивали:
* один украденный токен превращался в постоянный захват аккаунта — владелец
* терял вход, а срок жизни токена уже ничего не значил. Теперь текущий пароль
* обязателен, и правка через users его больше не принимает.
*
* Единственное исключение — учётная запись без пароля: она создана входом по
* SMS, пароля у неё никогда не было, и подтверждать нечем. Такой пользователь
* задаёт пароль впервые, ни у кого ничего не отбирая: до этого пароль не
* открывал доступ к его аккаунту, потому что пароля не существовало.
*
* Сброс пароля сотрудником — отдельная история и остаётся в PUT /users/{id}:
* у платформы нет другого способа вернуть доступ по обращению в поддержку.
*/
export const useChangePasswordAuthPasswordChangePost = <TData = Common.ChangePasswordAuthPasswordChangePostMutationResult, TError = ChangePasswordAuthPasswordChangePostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<ChangePasswordAuthPasswordChangePostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<ChangePasswordAuthPasswordChangePostData, true>, TContext>({ mutationKey: Common.UseChangePasswordAuthPasswordChangePostKeyFn(mutationKey), mutationFn: clientOptions => changePasswordAuthPasswordChangePost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Request Phone Change
*
* Первый шаг смены своего номера: код уходит на НОВЫЙ номер.
*
* Номер — это логин: вход по SMS идёт по нему, и пароль для этого не нужен.
* Правка через PUT /users/{id} меняла его без всякого подтверждения, то есть
* украденным токеном можно было навсегда забрать вход у владельца: код на
* старый номер больше не приходил бы.
*
* Код идёт на новый номер, а не на старый, потому что доказать надо именно
* владение новым: иначе пользователь запросто уведёт свой аккаунт на чужой
* или несуществующий номер и потеряет вход сам.
*/
export const useRequestPhoneChangeAuthPhoneChangeRequestPost = <TData = Common.RequestPhoneChangeAuthPhoneChangeRequestPostMutationResult, TError = RequestPhoneChangeAuthPhoneChangeRequestPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<RequestPhoneChangeAuthPhoneChangeRequestPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<RequestPhoneChangeAuthPhoneChangeRequestPostData, true>, TContext>({ mutationKey: Common.UseRequestPhoneChangeAuthPhoneChangeRequestPostKeyFn(mutationKey), mutationFn: clientOptions => requestPhoneChangeAuthPhoneChangeRequestPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Verify Phone Change
*
* Второй шаг: код с нового номера подтверждает смену.
*
* Занятость номера проверяется ещё раз: между запросом кода и подтверждением
* его мог занять кто-то другой, а два аккаунта с одним номером сделали бы
* вход по SMS неоднозначным.
*/
export const useVerifyPhoneChangeAuthPhoneChangeVerifyPost = <TData = Common.VerifyPhoneChangeAuthPhoneChangeVerifyPostMutationResult, TError = VerifyPhoneChangeAuthPhoneChangeVerifyPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<VerifyPhoneChangeAuthPhoneChangeVerifyPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<VerifyPhoneChangeAuthPhoneChangeVerifyPostData, true>, TContext>({ mutationKey: Common.UseVerifyPhoneChangeAuthPhoneChangeVerifyPostKeyFn(mutationKey), mutationFn: clientOptions => verifyPhoneChangeAuthPhoneChangeVerifyPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create User
*/
export const useCreateUserUsersPost = <TData = Common.CreateUserUsersPostMutationResult, TError = CreateUserUsersPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateUserUsersPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateUserUsersPostData, true>, TContext>({ mutationKey: Common.UseCreateUserUsersPostKeyFn(mutationKey), mutationFn: clientOptions => createUserUsersPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Grant Permission
*
* Назначить одно право пользователю.
*/
export const useGrantPermissionPermissionsUserIdPermissionsPost = <TData = Common.GrantPermissionPermissionsUserIdPermissionsPostMutationResult, TError = GrantPermissionPermissionsUserIdPermissionsPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<GrantPermissionPermissionsUserIdPermissionsPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<GrantPermissionPermissionsUserIdPermissionsPostData, true>, TContext>({ mutationKey: Common.UseGrantPermissionPermissionsUserIdPermissionsPostKeyFn(mutationKey), mutationFn: clientOptions => grantPermissionPermissionsUserIdPermissionsPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Bulk Grant Permissions
*
* Назначить несколько прав сразу.
*/
export const useBulkGrantPermissionsPermissionsUserIdPermissionsBulkPost = <TData = Common.BulkGrantPermissionsPermissionsUserIdPermissionsBulkPostMutationResult, TError = BulkGrantPermissionsPermissionsUserIdPermissionsBulkPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<BulkGrantPermissionsPermissionsUserIdPermissionsBulkPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<BulkGrantPermissionsPermissionsUserIdPermissionsBulkPostData, true>, TContext>({ mutationKey: Common.UseBulkGrantPermissionsPermissionsUserIdPermissionsBulkPostKeyFn(mutationKey), mutationFn: clientOptions => bulkGrantPermissionsPermissionsUserIdPermissionsBulkPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Brand
*/
export const useCreateBrandBrandsPost = <TData = Common.CreateBrandBrandsPostMutationResult, TError = CreateBrandBrandsPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateBrandBrandsPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateBrandBrandsPostData, true>, TContext>({ mutationKey: Common.UseCreateBrandBrandsPostKeyFn(mutationKey), mutationFn: clientOptions => createBrandBrandsPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Upload Brand Image
*/
export const useUploadBrandImageBrandsBrandIdImagePost = <TData = Common.UploadBrandImageBrandsBrandIdImagePostMutationResult, TError = UploadBrandImageBrandsBrandIdImagePostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UploadBrandImageBrandsBrandIdImagePostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UploadBrandImageBrandsBrandIdImagePostData, true>, TContext>({ mutationKey: Common.UseUploadBrandImageBrandsBrandIdImagePostKeyFn(mutationKey), mutationFn: clientOptions => uploadBrandImageBrandsBrandIdImagePost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Category
*/
export const useCreateCategoryCategoriesPost = <TData = Common.CreateCategoryCategoriesPostMutationResult, TError = CreateCategoryCategoriesPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateCategoryCategoriesPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateCategoryCategoriesPostData, true>, TContext>({ mutationKey: Common.UseCreateCategoryCategoriesPostKeyFn(mutationKey), mutationFn: clientOptions => createCategoryCategoriesPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Upload Category Image
*/
export const useUploadCategoryImageCategoriesCategoryIdImagePost = <TData = Common.UploadCategoryImageCategoriesCategoryIdImagePostMutationResult, TError = UploadCategoryImageCategoriesCategoryIdImagePostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UploadCategoryImageCategoriesCategoryIdImagePostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UploadCategoryImageCategoriesCategoryIdImagePostData, true>, TContext>({ mutationKey: Common.UseUploadCategoryImageCategoriesCategoryIdImagePostKeyFn(mutationKey), mutationFn: clientOptions => uploadCategoryImageCategoriesCategoryIdImagePost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Country
*/
export const useCreateCountryCountriesPost = <TData = Common.CreateCountryCountriesPostMutationResult, TError = CreateCountryCountriesPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateCountryCountriesPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateCountryCountriesPostData, true>, TContext>({ mutationKey: Common.UseCreateCountryCountriesPostKeyFn(mutationKey), mutationFn: clientOptions => createCountryCountriesPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Region
*/
export const useCreateRegionRegionsPost = <TData = Common.CreateRegionRegionsPostMutationResult, TError = CreateRegionRegionsPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateRegionRegionsPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateRegionRegionsPostData, true>, TContext>({ mutationKey: Common.UseCreateRegionRegionsPostKeyFn(mutationKey), mutationFn: clientOptions => createRegionRegionsPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create City
*/
export const useCreateCityCitiesPost = <TData = Common.CreateCityCitiesPostMutationResult, TError = CreateCityCitiesPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateCityCitiesPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateCityCitiesPostData, true>, TContext>({ mutationKey: Common.UseCreateCityCitiesPostKeyFn(mutationKey), mutationFn: clientOptions => createCityCitiesPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Currency
*/
export const useCreateCurrencyCurrenciesPost = <TData = Common.CreateCurrencyCurrenciesPostMutationResult, TError = CreateCurrencyCurrenciesPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateCurrencyCurrenciesPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateCurrencyCurrenciesPostData, true>, TContext>({ mutationKey: Common.UseCreateCurrencyCurrenciesPostKeyFn(mutationKey), mutationFn: clientOptions => createCurrencyCurrenciesPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Measure Unit
*/
export const useCreateMeasureUnitMeasureUnitsPost = <TData = Common.CreateMeasureUnitMeasureUnitsPostMutationResult, TError = CreateMeasureUnitMeasureUnitsPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateMeasureUnitMeasureUnitsPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateMeasureUnitMeasureUnitsPostData, true>, TContext>({ mutationKey: Common.UseCreateMeasureUnitMeasureUnitsPostKeyFn(mutationKey), mutationFn: clientOptions => createMeasureUnitMeasureUnitsPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Shop Base
*/
export const useCreateShopBaseShopBasesPost = <TData = Common.CreateShopBaseShopBasesPostMutationResult, TError = CreateShopBaseShopBasesPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateShopBaseShopBasesPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateShopBaseShopBasesPostData, true>, TContext>({ mutationKey: Common.UseCreateShopBaseShopBasesPostKeyFn(mutationKey), mutationFn: clientOptions => createShopBaseShopBasesPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Upload Shop Documents
*
* Загрузка документов магазина. У каждого файла — вид (паспорт, патент…).
*
* Документ того же вида заменяет прежний: продавец досылает исправленный
* скан после отказа, и два «паспорта» в заявке модератору ни к чему.
* Каждый файл проверяется по формату и антивирусом до записи на диск.
*/
export const useUploadShopDocumentsShopBasesShopIdDocumentsPost = <TData = Common.UploadShopDocumentsShopBasesShopIdDocumentsPostMutationResult, TError = UploadShopDocumentsShopBasesShopIdDocumentsPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UploadShopDocumentsShopBasesShopIdDocumentsPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UploadShopDocumentsShopBasesShopIdDocumentsPostData, true>, TContext>({ mutationKey: Common.UseUploadShopDocumentsShopBasesShopIdDocumentsPostKeyFn(mutationKey), mutationFn: clientOptions => uploadShopDocumentsShopBasesShopIdDocumentsPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Shop Additional
*/
export const useCreateShopAdditionalShopAdditionalsPost = <TData = Common.CreateShopAdditionalShopAdditionalsPostMutationResult, TError = CreateShopAdditionalShopAdditionalsPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateShopAdditionalShopAdditionalsPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateShopAdditionalShopAdditionalsPostData, true>, TContext>({ mutationKey: Common.UseCreateShopAdditionalShopAdditionalsPostKeyFn(mutationKey), mutationFn: clientOptions => createShopAdditionalShopAdditionalsPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Product
*/
export const useCreateProductProductsPost = <TData = Common.CreateProductProductsPostMutationResult, TError = CreateProductProductsPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateProductProductsPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateProductProductsPostData, true>, TContext>({ mutationKey: Common.UseCreateProductProductsPostKeyFn(mutationKey), mutationFn: clientOptions => createProductProductsPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Banner
*/
export const useCreateBannerBannersPost = <TData = Common.CreateBannerBannersPostMutationResult, TError = CreateBannerBannersPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateBannerBannersPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateBannerBannersPostData, true>, TContext>({ mutationKey: Common.UseCreateBannerBannersPostKeyFn(mutationKey), mutationFn: clientOptions => createBannerBannersPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Upload Banner Image
*/
export const useUploadBannerImageBannersBannerIdImagePost = <TData = Common.UploadBannerImageBannersBannerIdImagePostMutationResult, TError = UploadBannerImageBannersBannerIdImagePostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UploadBannerImageBannersBannerIdImagePostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UploadBannerImageBannersBannerIdImagePostData, true>, TContext>({ mutationKey: Common.UseUploadBannerImageBannersBannerIdImagePostKeyFn(mutationKey), mutationFn: clientOptions => uploadBannerImageBannersBannerIdImagePost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Collection
*/
export const useCreateCollectionCollectionsPost = <TData = Common.CreateCollectionCollectionsPostMutationResult, TError = CreateCollectionCollectionsPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateCollectionCollectionsPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateCollectionCollectionsPostData, true>, TContext>({ mutationKey: Common.UseCreateCollectionCollectionsPostKeyFn(mutationKey), mutationFn: clientOptions => createCollectionCollectionsPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Add To Cart
*/
export const useAddToCartCartPost = <TData = Common.AddToCartCartPostMutationResult, TError = AddToCartCartPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<AddToCartCartPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<AddToCartCartPostData, true>, TContext>({ mutationKey: Common.UseAddToCartCartPostKeyFn(mutationKey), mutationFn: clientOptions => addToCartCartPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Add To Favorites
*/
export const useAddToFavoritesFavoritesProductIdPost = <TData = Common.AddToFavoritesFavoritesProductIdPostMutationResult, TError = AddToFavoritesFavoritesProductIdPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<AddToFavoritesFavoritesProductIdPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<AddToFavoritesFavoritesProductIdPostData, true>, TContext>({ mutationKey: Common.UseAddToFavoritesFavoritesProductIdPostKeyFn(mutationKey), mutationFn: clientOptions => addToFavoritesFavoritesProductIdPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Address
*
* Добавить адрес.
*
* Первый адрес становится основным независимо от запроса: иначе у человека с
* единственным адресом при оформлении не подставлялось бы ничего, и смысл
* сохранения пропадал.
*/
export const useCreateAddressUserAddressesPost = <TData = Common.CreateAddressUserAddressesPostMutationResult, TError = CreateAddressUserAddressesPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateAddressUserAddressesPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateAddressUserAddressesPostData, true>, TContext>({ mutationKey: Common.UseCreateAddressUserAddressesPostKeyFn(mutationKey), mutationFn: clientOptions => createAddressUserAddressesPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Review
*
* Оставить отзыв о купленном товаре.
*
* Купленном и полученном: нужна позиция из завершённого заказа. Отзыв уходит
* на проверку — витрина публична, и пропускать туда что угодно нельзя.
*/
export const useCreateReviewReviewsPost = <TData = Common.CreateReviewReviewsPostMutationResult, TError = CreateReviewReviewsPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateReviewReviewsPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateReviewReviewsPostData, true>, TContext>({ mutationKey: Common.UseCreateReviewReviewsPostKeyFn(mutationKey), mutationFn: clientOptions => createReviewReviewsPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Return
*
* Заявка на возврат купленного товара.
*
* Требуется завершённый заказ этого пользователя: до завершения товар не
* получен, и возвращать нечего. То же правило стоит на отзывах.
*/
export const useCreateReturnReturnsPost = <TData = Common.CreateReturnReturnsPostMutationResult, TError = CreateReturnReturnsPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateReturnReturnsPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateReturnReturnsPostData, true>, TContext>({ mutationKey: Common.UseCreateReturnReturnsPostKeyFn(mutationKey), mutationFn: clientOptions => createReturnReturnsPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Warehouse
*/
export const useCreateWarehouseWarehousesPost = <TData = Common.CreateWarehouseWarehousesPostMutationResult, TError = CreateWarehouseWarehousesPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateWarehouseWarehousesPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateWarehouseWarehousesPostData, true>, TContext>({ mutationKey: Common.UseCreateWarehouseWarehousesPostKeyFn(mutationKey), mutationFn: clientOptions => createWarehouseWarehousesPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Delivery Message
*/
export const useCreateDeliveryMessageDeliveryMessagePost = <TData = Common.CreateDeliveryMessageDeliveryMessagePostMutationResult, TError = CreateDeliveryMessageDeliveryMessagePostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateDeliveryMessageDeliveryMessagePostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateDeliveryMessageDeliveryMessagePostData, true>, TContext>({ mutationKey: Common.UseCreateDeliveryMessageDeliveryMessagePostKeyFn(mutationKey), mutationFn: clientOptions => createDeliveryMessageDeliveryMessagePost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Stock Operation
*
* Движение товара по складу магазина.
*
* Раньше магазин, товар и единица проверялись по отдельности, а связь между
* ними и владельцем — нет. Посторонний мог оприходовать товар на чужой склад
* или списанием обнулить остаток конкурента, и его товары перестали бы
* заказываться.
*/
export const useCreateStockOperationStockOperationsPost = <TData = Common.CreateStockOperationStockOperationsPostMutationResult, TError = CreateStockOperationStockOperationsPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateStockOperationStockOperationsPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateStockOperationStockOperationsPostData, true>, TContext>({ mutationKey: Common.UseCreateStockOperationStockOperationsPostKeyFn(mutationKey), mutationFn: clientOptions => createStockOperationStockOperationsPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Set Stock
*
* Пересчёт: продавец называет фактический остаток, разницу пишет сервер.
*
* Без этого пересчитанную полку нельзя было записать честно: чтобы свести
* остаток, продавец оформлял «приход» там, где товар нашёлся, и «возврат
* поставщику» там, где он пропал, — журнал переставал описывать то, что
* происходило на самом деле.
*
* Разница считается здесь, а не на экране: между чтением остатка и записью
* проходит время, за которое товар успевают купить, и присланное с экрана
* «стало 7» затёрло бы эту продажу. Строка товара блокируется, доступный
* остаток читается заново, и в журнал ложится именно разница.
*
* Совпало — операции нет: пустая запись «изменение 0» засоряет историю.
*/
export const useSetStockStockOperationsSetPost = <TData = Common.SetStockStockOperationsSetPostMutationResult, TError = SetStockStockOperationsSetPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<SetStockStockOperationsSetPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<SetStockStockOperationsSetPostData, true>, TContext>({ mutationKey: Common.UseSetStockStockOperationsSetPostKeyFn(mutationKey), mutationFn: clientOptions => setStockStockOperationsSetPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Warehouse Operation
*/
export const useCreateWarehouseOperationWarehouseOperationsPost = <TData = Common.CreateWarehouseOperationWarehouseOperationsPostMutationResult, TError = CreateWarehouseOperationWarehouseOperationsPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateWarehouseOperationWarehouseOperationsPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateWarehouseOperationWarehouseOperationsPostData, true>, TContext>({ mutationKey: Common.UseCreateWarehouseOperationWarehouseOperationsPostKeyFn(mutationKey), mutationFn: clientOptions => createWarehouseOperationWarehouseOperationsPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Receipt
*/
export const useCreateReceiptStockReceiptsPost = <TData = Common.CreateReceiptStockReceiptsPostMutationResult, TError = CreateReceiptStockReceiptsPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateReceiptStockReceiptsPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateReceiptStockReceiptsPostData, true>, TContext>({ mutationKey: Common.UseCreateReceiptStockReceiptsPostKeyFn(mutationKey), mutationFn: clientOptions => createReceiptStockReceiptsPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Add Item
*/
export const useAddItemStockReceiptsReceiptIdItemsPost = <TData = Common.AddItemStockReceiptsReceiptIdItemsPostMutationResult, TError = AddItemStockReceiptsReceiptIdItemsPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<AddItemStockReceiptsReceiptIdItemsPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<AddItemStockReceiptsReceiptIdItemsPostData, true>, TContext>({ mutationKey: Common.UseAddItemStockReceiptsReceiptIdItemsPostKeyFn(mutationKey), mutationFn: clientOptions => addItemStockReceiptsReceiptIdItemsPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Cancel Receipt
*
* Отменить черновик прихода.
*
* Ошибочный черновик некуда было девать: статусов было два, удаления нет, и
* он висел в списке вечно. Отмена оставляет запись в истории, но выводит её
* из работы. Подтверждённый приход не отменяется — он уже оприходован на
* склад, и обратное движение оформляется складской операцией.
*/
export const useCancelReceiptStockReceiptsReceiptIdCancelPost = <TData = Common.CancelReceiptStockReceiptsReceiptIdCancelPostMutationResult, TError = CancelReceiptStockReceiptsReceiptIdCancelPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CancelReceiptStockReceiptsReceiptIdCancelPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CancelReceiptStockReceiptsReceiptIdCancelPostData, true>, TContext>({ mutationKey: Common.UseCancelReceiptStockReceiptsReceiptIdCancelPostKeyFn(mutationKey), mutationFn: clientOptions => cancelReceiptStockReceiptsReceiptIdCancelPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Confirm Receipt
*/
export const useConfirmReceiptStockReceiptsReceiptIdConfirmPost = <TData = Common.ConfirmReceiptStockReceiptsReceiptIdConfirmPostMutationResult, TError = ConfirmReceiptStockReceiptsReceiptIdConfirmPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<ConfirmReceiptStockReceiptsReceiptIdConfirmPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<ConfirmReceiptStockReceiptsReceiptIdConfirmPostData, true>, TContext>({ mutationKey: Common.UseConfirmReceiptStockReceiptsReceiptIdConfirmPostKeyFn(mutationKey), mutationFn: clientOptions => confirmReceiptStockReceiptsReceiptIdConfirmPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Pickup Point
*/
export const useCreatePickupPointPickupPointsPost = <TData = Common.CreatePickupPointPickupPointsPostMutationResult, TError = CreatePickupPointPickupPointsPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreatePickupPointPickupPointsPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreatePickupPointPickupPointsPostData, true>, TContext>({ mutationKey: Common.UseCreatePickupPointPickupPointsPostKeyFn(mutationKey), mutationFn: clientOptions => createPickupPointPickupPointsPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Order
*/
export const useCreateOrderOrdersPost = <TData = Common.CreateOrderOrdersPostMutationResult, TError = CreateOrderOrdersPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateOrderOrdersPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateOrderOrdersPostData, true>, TContext>({ mutationKey: Common.UseCreateOrderOrdersPostKeyFn(mutationKey), mutationFn: clientOptions => createOrderOrdersPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Cancel Order
*
* Покупатель отменяет собственный заказ.
*
* Доступно только владельцу заказа и только пока заказ ещё не собран
* (глобальный статус pending или approved). Переводит заказ в rejected;
* резерв стока освобождается автоматически, списания до completed не было.
*/
export const useCancelOrderOrdersOrderIdCancelPost = <TData = Common.CancelOrderOrdersOrderIdCancelPostMutationResult, TError = CancelOrderOrdersOrderIdCancelPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CancelOrderOrdersOrderIdCancelPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CancelOrderOrdersOrderIdCancelPostData, true>, TContext>({ mutationKey: Common.UseCancelOrderOrdersOrderIdCancelPostKeyFn(mutationKey), mutationFn: clientOptions => cancelOrderOrdersOrderIdCancelPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Create Contact Us
*/
export const useCreateContactUsContactUsPost = <TData = Common.CreateContactUsContactUsPostMutationResult, TError = CreateContactUsContactUsPostError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CreateContactUsContactUsPostData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CreateContactUsContactUsPostData, true>, TContext>({ mutationKey: Common.UseCreateContactUsContactUsPostKeyFn(mutationKey), mutationFn: clientOptions => createContactUsContactUsPost(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update User
*
* Правка пользователя.
*
* Право users:update выдаётся каждому при регистрации, а проверки, чья это
* запись, здесь не было вовсе. То есть любой зарегистрировавшийся мог задать
* администратору новые логин и пароль и войти под ними — это подтверждалось
* запросом.
*
* Теперь чужую запись правит только сотрудник платформы. Логин чужому не
* меняет никто, даже сотрудник: подмена логина — это и есть захват аккаунта,
* а законной причины переименовать чужой вход нет. Пароль сотрудник сменить
* может: это сброс пароля по обращению в поддержку, других способов вернуть
* доступ у платформы нет.
*
* Свой пароль и свой номер здесь не меняются — для них есть отдельные методы
* с подтверждением (POST /auth/password/change и POST /auth/phone/change*).
* Причина в том, что здесь подтверждать нечем: метод открыт по токену, и без
* текущего пароля или кода на номер украденный токен означал бы вечный захват
* аккаунта, а не доступ до истечения токена.
*/
export const useUpdateUserUsersUserIdPut = <TData = Common.UpdateUserUsersUserIdPutMutationResult, TError = UpdateUserUsersUserIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateUserUsersUserIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateUserUsersUserIdPutData, true>, TContext>({ mutationKey: Common.UseUpdateUserUsersUserIdPutKeyFn(mutationKey), mutationFn: clientOptions => updateUserUsersUserIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Set User Permissions
*
* Атомарно заменить все права пользователя.
*/
export const useSetUserPermissionsPermissionsUserIdPermissionsPut = <TData = Common.SetUserPermissionsPermissionsUserIdPermissionsPutMutationResult, TError = SetUserPermissionsPermissionsUserIdPermissionsPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<SetUserPermissionsPermissionsUserIdPermissionsPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<SetUserPermissionsPermissionsUserIdPermissionsPutData, true>, TContext>({ mutationKey: Common.UseSetUserPermissionsPermissionsUserIdPermissionsPutKeyFn(mutationKey), mutationFn: clientOptions => setUserPermissionsPermissionsUserIdPermissionsPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Brand
*/
export const useUpdateBrandBrandsBrandIdPut = <TData = Common.UpdateBrandBrandsBrandIdPutMutationResult, TError = UpdateBrandBrandsBrandIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateBrandBrandsBrandIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateBrandBrandsBrandIdPutData, true>, TContext>({ mutationKey: Common.UseUpdateBrandBrandsBrandIdPutKeyFn(mutationKey), mutationFn: clientOptions => updateBrandBrandsBrandIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Category
*/
export const useUpdateCategoryCategoriesCategoryIdPut = <TData = Common.UpdateCategoryCategoriesCategoryIdPutMutationResult, TError = UpdateCategoryCategoriesCategoryIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateCategoryCategoriesCategoryIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateCategoryCategoriesCategoryIdPutData, true>, TContext>({ mutationKey: Common.UseUpdateCategoryCategoriesCategoryIdPutKeyFn(mutationKey), mutationFn: clientOptions => updateCategoryCategoriesCategoryIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Country
*/
export const useUpdateCountryCountriesCountryIdPut = <TData = Common.UpdateCountryCountriesCountryIdPutMutationResult, TError = UpdateCountryCountriesCountryIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateCountryCountriesCountryIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateCountryCountriesCountryIdPutData, true>, TContext>({ mutationKey: Common.UseUpdateCountryCountriesCountryIdPutKeyFn(mutationKey), mutationFn: clientOptions => updateCountryCountriesCountryIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Region
*/
export const useUpdateRegionRegionsRegionIdPut = <TData = Common.UpdateRegionRegionsRegionIdPutMutationResult, TError = UpdateRegionRegionsRegionIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateRegionRegionsRegionIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateRegionRegionsRegionIdPutData, true>, TContext>({ mutationKey: Common.UseUpdateRegionRegionsRegionIdPutKeyFn(mutationKey), mutationFn: clientOptions => updateRegionRegionsRegionIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update City
*/
export const useUpdateCityCitiesCityIdPut = <TData = Common.UpdateCityCitiesCityIdPutMutationResult, TError = UpdateCityCitiesCityIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateCityCitiesCityIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateCityCitiesCityIdPutData, true>, TContext>({ mutationKey: Common.UseUpdateCityCitiesCityIdPutKeyFn(mutationKey), mutationFn: clientOptions => updateCityCitiesCityIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Currency
*/
export const useUpdateCurrencyCurrenciesCurrencyIdPut = <TData = Common.UpdateCurrencyCurrenciesCurrencyIdPutMutationResult, TError = UpdateCurrencyCurrenciesCurrencyIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateCurrencyCurrenciesCurrencyIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateCurrencyCurrenciesCurrencyIdPutData, true>, TContext>({ mutationKey: Common.UseUpdateCurrencyCurrenciesCurrencyIdPutKeyFn(mutationKey), mutationFn: clientOptions => updateCurrencyCurrenciesCurrencyIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Measure Unit
*/
export const useUpdateMeasureUnitMeasureUnitsUnitIdPut = <TData = Common.UpdateMeasureUnitMeasureUnitsUnitIdPutMutationResult, TError = UpdateMeasureUnitMeasureUnitsUnitIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateMeasureUnitMeasureUnitsUnitIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateMeasureUnitMeasureUnitsUnitIdPutData, true>, TContext>({ mutationKey: Common.UseUpdateMeasureUnitMeasureUnitsUnitIdPutKeyFn(mutationKey), mutationFn: clientOptions => updateMeasureUnitMeasureUnitsUnitIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Shop Base
*/
export const useUpdateShopBaseShopBasesShopIdPut = <TData = Common.UpdateShopBaseShopBasesShopIdPutMutationResult, TError = UpdateShopBaseShopBasesShopIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateShopBaseShopBasesShopIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateShopBaseShopBasesShopIdPutData, true>, TContext>({ mutationKey: Common.UseUpdateShopBaseShopBasesShopIdPutKeyFn(mutationKey), mutationFn: clientOptions => updateShopBaseShopBasesShopIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Shop Additional
*/
export const useUpdateShopAdditionalShopAdditionalsShopAdditionalIdPut = <TData = Common.UpdateShopAdditionalShopAdditionalsShopAdditionalIdPutMutationResult, TError = UpdateShopAdditionalShopAdditionalsShopAdditionalIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateShopAdditionalShopAdditionalsShopAdditionalIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateShopAdditionalShopAdditionalsShopAdditionalIdPutData, true>, TContext>({ mutationKey: Common.UseUpdateShopAdditionalShopAdditionalsShopAdditionalIdPutKeyFn(mutationKey), mutationFn: clientOptions => updateShopAdditionalShopAdditionalsShopAdditionalIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Product
*/
export const useUpdateProductProductsProductIdPut = <TData = Common.UpdateProductProductsProductIdPutMutationResult, TError = UpdateProductProductsProductIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateProductProductsProductIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateProductProductsProductIdPutData, true>, TContext>({ mutationKey: Common.UseUpdateProductProductsProductIdPutKeyFn(mutationKey), mutationFn: clientOptions => updateProductProductsProductIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Banner
*/
export const useUpdateBannerBannersBannerIdPut = <TData = Common.UpdateBannerBannersBannerIdPutMutationResult, TError = UpdateBannerBannersBannerIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateBannerBannersBannerIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateBannerBannersBannerIdPutData, true>, TContext>({ mutationKey: Common.UseUpdateBannerBannersBannerIdPutKeyFn(mutationKey), mutationFn: clientOptions => updateBannerBannersBannerIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Collection
*/
export const useUpdateCollectionCollectionsCollectionIdPut = <TData = Common.UpdateCollectionCollectionsCollectionIdPutMutationResult, TError = UpdateCollectionCollectionsCollectionIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateCollectionCollectionsCollectionIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateCollectionCollectionsCollectionIdPutData, true>, TContext>({ mutationKey: Common.UseUpdateCollectionCollectionsCollectionIdPutKeyFn(mutationKey), mutationFn: clientOptions => updateCollectionCollectionsCollectionIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Cart Item
*/
export const useUpdateCartItemCartProductIdPut = <TData = Common.UpdateCartItemCartProductIdPutMutationResult, TError = UpdateCartItemCartProductIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateCartItemCartProductIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateCartItemCartProductIdPutData, true>, TContext>({ mutationKey: Common.UseUpdateCartItemCartProductIdPutKeyFn(mutationKey), mutationFn: clientOptions => updateCartItemCartProductIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Address
*
* Правка адреса.
*
* Признак основного здесь не меняется — для этого отдельный метод: снять флаг
* у прежнего и поставить новому надо одной операцией, иначе основными
* оказываются два адреса или ни один.
*/
export const useUpdateAddressUserAddressesAddressIdPut = <TData = Common.UpdateAddressUserAddressesAddressIdPutMutationResult, TError = UpdateAddressUserAddressesAddressIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateAddressUserAddressesAddressIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateAddressUserAddressesAddressIdPutData, true>, TContext>({ mutationKey: Common.UseUpdateAddressUserAddressesAddressIdPutKeyFn(mutationKey), mutationFn: clientOptions => updateAddressUserAddressesAddressIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Review
*
* Правка своего отзыва.
*
* Правка возвращает отзыв на проверку: иначе подтверждённый безобидный текст
* можно было бы заменить на любой другой, минуя модерацию. Рейтинг товара при
* этом пересчитывается — отзыв перестаёт быть подтверждённым и выходит из
* среднего.
*/
export const useUpdateReviewReviewsReviewIdPut = <TData = Common.UpdateReviewReviewsReviewIdPutMutationResult, TError = UpdateReviewReviewsReviewIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateReviewReviewsReviewIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateReviewReviewsReviewIdPutData, true>, TContext>({ mutationKey: Common.UseUpdateReviewReviewsReviewIdPutKeyFn(mutationKey), mutationFn: clientOptions => updateReviewReviewsReviewIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Warehouse
*/
export const useUpdateWarehouseWarehousesWarehouseIdPut = <TData = Common.UpdateWarehouseWarehousesWarehouseIdPutMutationResult, TError = UpdateWarehouseWarehousesWarehouseIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateWarehouseWarehousesWarehouseIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateWarehouseWarehousesWarehouseIdPutData, true>, TContext>({ mutationKey: Common.UseUpdateWarehouseWarehousesWarehouseIdPutKeyFn(mutationKey), mutationFn: clientOptions => updateWarehouseWarehousesWarehouseIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Delivery Message
*/
export const useUpdateDeliveryMessageDeliveryMessagePut = <TData = Common.UpdateDeliveryMessageDeliveryMessagePutMutationResult, TError = UpdateDeliveryMessageDeliveryMessagePutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateDeliveryMessageDeliveryMessagePutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateDeliveryMessageDeliveryMessagePutData, true>, TContext>({ mutationKey: Common.UseUpdateDeliveryMessageDeliveryMessagePutKeyFn(mutationKey), mutationFn: clientOptions => updateDeliveryMessageDeliveryMessagePut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Order Status Translations
*/
export const useUpdateOrderStatusTranslationsOrderStatusesOrderStatusIdTranslationsPut = <TData = Common.UpdateOrderStatusTranslationsOrderStatusesOrderStatusIdTranslationsPutMutationResult, TError = UpdateOrderStatusTranslationsOrderStatusesOrderStatusIdTranslationsPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateOrderStatusTranslationsOrderStatusesOrderStatusIdTranslationsPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateOrderStatusTranslationsOrderStatusesOrderStatusIdTranslationsPutData, true>, TContext>({ mutationKey: Common.UseUpdateOrderStatusTranslationsOrderStatusesOrderStatusIdTranslationsPutKeyFn(mutationKey), mutationFn: clientOptions => updateOrderStatusTranslationsOrderStatusesOrderStatusIdTranslationsPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Pickup Point
*/
export const useUpdatePickupPointPickupPointsPickupPointIdPut = <TData = Common.UpdatePickupPointPickupPointsPickupPointIdPutMutationResult, TError = UpdatePickupPointPickupPointsPickupPointIdPutError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdatePickupPointPickupPointsPickupPointIdPutData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdatePickupPointPickupPointsPickupPointIdPutData, true>, TContext>({ mutationKey: Common.UseUpdatePickupPointPickupPointsPickupPointIdPutKeyFn(mutationKey), mutationFn: clientOptions => updatePickupPointPickupPointsPickupPointIdPut(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Block User
*/
export const useBlockUserUsersUserIdBlockPatch = <TData = Common.BlockUserUsersUserIdBlockPatchMutationResult, TError = BlockUserUsersUserIdBlockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<BlockUserUsersUserIdBlockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<BlockUserUsersUserIdBlockPatchData, true>, TContext>({ mutationKey: Common.UseBlockUserUsersUserIdBlockPatchKeyFn(mutationKey), mutationFn: clientOptions => blockUserUsersUserIdBlockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Unblock User
*/
export const useUnblockUserUsersUserIdUnblockPatch = <TData = Common.UnblockUserUsersUserIdUnblockPatchMutationResult, TError = UnblockUserUsersUserIdUnblockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UnblockUserUsersUserIdUnblockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UnblockUserUsersUserIdUnblockPatchData, true>, TContext>({ mutationKey: Common.UseUnblockUserUsersUserIdUnblockPatchKeyFn(mutationKey), mutationFn: clientOptions => unblockUserUsersUserIdUnblockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Block Brand
*/
export const useBlockBrandBrandsBrandIdBlockPatch = <TData = Common.BlockBrandBrandsBrandIdBlockPatchMutationResult, TError = BlockBrandBrandsBrandIdBlockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<BlockBrandBrandsBrandIdBlockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<BlockBrandBrandsBrandIdBlockPatchData, true>, TContext>({ mutationKey: Common.UseBlockBrandBrandsBrandIdBlockPatchKeyFn(mutationKey), mutationFn: clientOptions => blockBrandBrandsBrandIdBlockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Unblock Brand
*/
export const useUnblockBrandBrandsBrandIdUnblockPatch = <TData = Common.UnblockBrandBrandsBrandIdUnblockPatchMutationResult, TError = UnblockBrandBrandsBrandIdUnblockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UnblockBrandBrandsBrandIdUnblockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UnblockBrandBrandsBrandIdUnblockPatchData, true>, TContext>({ mutationKey: Common.UseUnblockBrandBrandsBrandIdUnblockPatchKeyFn(mutationKey), mutationFn: clientOptions => unblockBrandBrandsBrandIdUnblockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Block Category
*/
export const useBlockCategoryCategoriesCategoryIdBlockPatch = <TData = Common.BlockCategoryCategoriesCategoryIdBlockPatchMutationResult, TError = BlockCategoryCategoriesCategoryIdBlockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<BlockCategoryCategoriesCategoryIdBlockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<BlockCategoryCategoriesCategoryIdBlockPatchData, true>, TContext>({ mutationKey: Common.UseBlockCategoryCategoriesCategoryIdBlockPatchKeyFn(mutationKey), mutationFn: clientOptions => blockCategoryCategoriesCategoryIdBlockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Unblock Category
*/
export const useUnblockCategoryCategoriesCategoryIdUnblockPatch = <TData = Common.UnblockCategoryCategoriesCategoryIdUnblockPatchMutationResult, TError = UnblockCategoryCategoriesCategoryIdUnblockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UnblockCategoryCategoriesCategoryIdUnblockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UnblockCategoryCategoriesCategoryIdUnblockPatchData, true>, TContext>({ mutationKey: Common.UseUnblockCategoryCategoriesCategoryIdUnblockPatchKeyFn(mutationKey), mutationFn: clientOptions => unblockCategoryCategoriesCategoryIdUnblockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Block Country
*/
export const useBlockCountryCountriesCountryIdBlockPatch = <TData = Common.BlockCountryCountriesCountryIdBlockPatchMutationResult, TError = BlockCountryCountriesCountryIdBlockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<BlockCountryCountriesCountryIdBlockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<BlockCountryCountriesCountryIdBlockPatchData, true>, TContext>({ mutationKey: Common.UseBlockCountryCountriesCountryIdBlockPatchKeyFn(mutationKey), mutationFn: clientOptions => blockCountryCountriesCountryIdBlockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Unblock Country
*/
export const useUnblockCountryCountriesCountryIdUnblockPatch = <TData = Common.UnblockCountryCountriesCountryIdUnblockPatchMutationResult, TError = UnblockCountryCountriesCountryIdUnblockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UnblockCountryCountriesCountryIdUnblockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UnblockCountryCountriesCountryIdUnblockPatchData, true>, TContext>({ mutationKey: Common.UseUnblockCountryCountriesCountryIdUnblockPatchKeyFn(mutationKey), mutationFn: clientOptions => unblockCountryCountriesCountryIdUnblockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Block Region
*/
export const useBlockRegionRegionsRegionIdBlockPatch = <TData = Common.BlockRegionRegionsRegionIdBlockPatchMutationResult, TError = BlockRegionRegionsRegionIdBlockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<BlockRegionRegionsRegionIdBlockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<BlockRegionRegionsRegionIdBlockPatchData, true>, TContext>({ mutationKey: Common.UseBlockRegionRegionsRegionIdBlockPatchKeyFn(mutationKey), mutationFn: clientOptions => blockRegionRegionsRegionIdBlockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Unblock Region
*/
export const useUnblockRegionRegionsRegionIdUnblockPatch = <TData = Common.UnblockRegionRegionsRegionIdUnblockPatchMutationResult, TError = UnblockRegionRegionsRegionIdUnblockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UnblockRegionRegionsRegionIdUnblockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UnblockRegionRegionsRegionIdUnblockPatchData, true>, TContext>({ mutationKey: Common.UseUnblockRegionRegionsRegionIdUnblockPatchKeyFn(mutationKey), mutationFn: clientOptions => unblockRegionRegionsRegionIdUnblockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Block City
*/
export const useBlockCityCitiesCityIdBlockPatch = <TData = Common.BlockCityCitiesCityIdBlockPatchMutationResult, TError = BlockCityCitiesCityIdBlockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<BlockCityCitiesCityIdBlockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<BlockCityCitiesCityIdBlockPatchData, true>, TContext>({ mutationKey: Common.UseBlockCityCitiesCityIdBlockPatchKeyFn(mutationKey), mutationFn: clientOptions => blockCityCitiesCityIdBlockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Unblock City
*/
export const useUnblockCityCitiesCityIdUnblockPatch = <TData = Common.UnblockCityCitiesCityIdUnblockPatchMutationResult, TError = UnblockCityCitiesCityIdUnblockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UnblockCityCitiesCityIdUnblockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UnblockCityCitiesCityIdUnblockPatchData, true>, TContext>({ mutationKey: Common.UseUnblockCityCitiesCityIdUnblockPatchKeyFn(mutationKey), mutationFn: clientOptions => unblockCityCitiesCityIdUnblockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Block Currency
*/
export const useBlockCurrencyCurrenciesCurrencyIdBlockPatch = <TData = Common.BlockCurrencyCurrenciesCurrencyIdBlockPatchMutationResult, TError = BlockCurrencyCurrenciesCurrencyIdBlockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<BlockCurrencyCurrenciesCurrencyIdBlockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<BlockCurrencyCurrenciesCurrencyIdBlockPatchData, true>, TContext>({ mutationKey: Common.UseBlockCurrencyCurrenciesCurrencyIdBlockPatchKeyFn(mutationKey), mutationFn: clientOptions => blockCurrencyCurrenciesCurrencyIdBlockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Unblock Currency
*/
export const useUnblockCurrencyCurrenciesCurrencyIdUnblockPatch = <TData = Common.UnblockCurrencyCurrenciesCurrencyIdUnblockPatchMutationResult, TError = UnblockCurrencyCurrenciesCurrencyIdUnblockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UnblockCurrencyCurrenciesCurrencyIdUnblockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UnblockCurrencyCurrenciesCurrencyIdUnblockPatchData, true>, TContext>({ mutationKey: Common.UseUnblockCurrencyCurrenciesCurrencyIdUnblockPatchKeyFn(mutationKey), mutationFn: clientOptions => unblockCurrencyCurrenciesCurrencyIdUnblockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Block Measure Unit
*/
export const useBlockMeasureUnitMeasureUnitsUnitIdBlockPatch = <TData = Common.BlockMeasureUnitMeasureUnitsUnitIdBlockPatchMutationResult, TError = BlockMeasureUnitMeasureUnitsUnitIdBlockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<BlockMeasureUnitMeasureUnitsUnitIdBlockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<BlockMeasureUnitMeasureUnitsUnitIdBlockPatchData, true>, TContext>({ mutationKey: Common.UseBlockMeasureUnitMeasureUnitsUnitIdBlockPatchKeyFn(mutationKey), mutationFn: clientOptions => blockMeasureUnitMeasureUnitsUnitIdBlockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Unblock Measure Unit
*/
export const useUnblockMeasureUnitMeasureUnitsUnitIdUnblockPatch = <TData = Common.UnblockMeasureUnitMeasureUnitsUnitIdUnblockPatchMutationResult, TError = UnblockMeasureUnitMeasureUnitsUnitIdUnblockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UnblockMeasureUnitMeasureUnitsUnitIdUnblockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UnblockMeasureUnitMeasureUnitsUnitIdUnblockPatchData, true>, TContext>({ mutationKey: Common.UseUnblockMeasureUnitMeasureUnitsUnitIdUnblockPatchKeyFn(mutationKey), mutationFn: clientOptions => unblockMeasureUnitMeasureUnitsUnitIdUnblockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Block Shop Base
*
* Закрыть магазин. Владелец закрывает свой, сотрудник — любой.
*
* Владелец не может закрыть магазин, пока у него есть незавершённые дела:
* открытые заказы и одобренные, но не полученные возвраты. Раньше магазин
* закрывался молча — товары пропадали из каталога, а заказы покупателей
* оставались висеть без продавца. Сотрудника это не останавливает: закрытие
* платформой — решение, а не уход продавца, и заказы разбирает она же.
*/
export const useBlockShopBaseShopBasesShopIdBlockPatch = <TData = Common.BlockShopBaseShopBasesShopIdBlockPatchMutationResult, TError = BlockShopBaseShopBasesShopIdBlockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<BlockShopBaseShopBasesShopIdBlockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<BlockShopBaseShopBasesShopIdBlockPatchData, true>, TContext>({ mutationKey: Common.UseBlockShopBaseShopBasesShopIdBlockPatchKeyFn(mutationKey), mutationFn: clientOptions => blockShopBaseShopBasesShopIdBlockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Unblock Shop Base
*
* Снова открыть магазин. Владелец может вернуть свой.
*
* Но не тот, что закрыла платформа: раньше владелец снимал блокировку
* сотрудника одним запросом — права block/unblock у него есть, а кто
* поставил блок, не хранилось.
*/
export const useUnblockShopBaseShopBasesShopIdUnblockPatch = <TData = Common.UnblockShopBaseShopBasesShopIdUnblockPatchMutationResult, TError = UnblockShopBaseShopBasesShopIdUnblockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UnblockShopBaseShopBasesShopIdUnblockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UnblockShopBaseShopBasesShopIdUnblockPatchData, true>, TContext>({ mutationKey: Common.UseUnblockShopBaseShopBasesShopIdUnblockPatchKeyFn(mutationKey), mutationFn: clientOptions => unblockShopBaseShopBasesShopIdUnblockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Shop Base Registration Status
*/
export const useUpdateShopBaseRegistrationStatusShopBasesShopIdRegistrationStatusPatch = <TData = Common.UpdateShopBaseRegistrationStatusShopBasesShopIdRegistrationStatusPatchMutationResult, TError = UpdateShopBaseRegistrationStatusShopBasesShopIdRegistrationStatusPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateShopBaseRegistrationStatusShopBasesShopIdRegistrationStatusPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateShopBaseRegistrationStatusShopBasesShopIdRegistrationStatusPatchData, true>, TContext>({ mutationKey: Common.UseUpdateShopBaseRegistrationStatusShopBasesShopIdRegistrationStatusPatchKeyFn(mutationKey), mutationFn: clientOptions => updateShopBaseRegistrationStatusShopBasesShopIdRegistrationStatusPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Block Product
*
* Снять товар с продажи. Владелец снимает свой, сотрудник — любой.
*
* Снятие сотрудником помечается: вернуть такой товар владелец не может, и
* ему приходит уведомление — раньше товар просто пропадал из каталога.
*/
export const useBlockProductProductsProductIdBlockPatch = <TData = Common.BlockProductProductsProductIdBlockPatchMutationResult, TError = BlockProductProductsProductIdBlockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<BlockProductProductsProductIdBlockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<BlockProductProductsProductIdBlockPatchData, true>, TContext>({ mutationKey: Common.UseBlockProductProductsProductIdBlockPatchKeyFn(mutationKey), mutationFn: clientOptions => blockProductProductsProductIdBlockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Unblock Product
*/
export const useUnblockProductProductsProductIdUnblockPatch = <TData = Common.UnblockProductProductsProductIdUnblockPatchMutationResult, TError = UnblockProductProductsProductIdUnblockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UnblockProductProductsProductIdUnblockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UnblockProductProductsProductIdUnblockPatchData, true>, TContext>({ mutationKey: Common.UseUnblockProductProductsProductIdUnblockPatchKeyFn(mutationKey), mutationFn: clientOptions => unblockProductProductsProductIdUnblockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Approve Product
*/
export const useApproveProductProductsProductIdApprovePatch = <TData = Common.ApproveProductProductsProductIdApprovePatchMutationResult, TError = ApproveProductProductsProductIdApprovePatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<ApproveProductProductsProductIdApprovePatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<ApproveProductProductsProductIdApprovePatchData, true>, TContext>({ mutationKey: Common.UseApproveProductProductsProductIdApprovePatchKeyFn(mutationKey), mutationFn: clientOptions => approveProductProductsProductIdApprovePatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Decline Product
*/
export const useDeclineProductProductsProductIdDeclinePatch = <TData = Common.DeclineProductProductsProductIdDeclinePatchMutationResult, TError = DeclineProductProductsProductIdDeclinePatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<DeclineProductProductsProductIdDeclinePatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<DeclineProductProductsProductIdDeclinePatchData, true>, TContext>({ mutationKey: Common.UseDeclineProductProductsProductIdDeclinePatchKeyFn(mutationKey), mutationFn: clientOptions => declineProductProductsProductIdDeclinePatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Block Banner
*/
export const useBlockBannerBannersBannerIdBlockPatch = <TData = Common.BlockBannerBannersBannerIdBlockPatchMutationResult, TError = BlockBannerBannersBannerIdBlockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<BlockBannerBannersBannerIdBlockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<BlockBannerBannersBannerIdBlockPatchData, true>, TContext>({ mutationKey: Common.UseBlockBannerBannersBannerIdBlockPatchKeyFn(mutationKey), mutationFn: clientOptions => blockBannerBannersBannerIdBlockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Unblock Banner
*/
export const useUnblockBannerBannersBannerIdUnblockPatch = <TData = Common.UnblockBannerBannersBannerIdUnblockPatchMutationResult, TError = UnblockBannerBannersBannerIdUnblockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UnblockBannerBannersBannerIdUnblockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UnblockBannerBannersBannerIdUnblockPatchData, true>, TContext>({ mutationKey: Common.UseUnblockBannerBannersBannerIdUnblockPatchKeyFn(mutationKey), mutationFn: clientOptions => unblockBannerBannersBannerIdUnblockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Block Collection
*/
export const useBlockCollectionCollectionsCollectionIdBlockPatch = <TData = Common.BlockCollectionCollectionsCollectionIdBlockPatchMutationResult, TError = BlockCollectionCollectionsCollectionIdBlockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<BlockCollectionCollectionsCollectionIdBlockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<BlockCollectionCollectionsCollectionIdBlockPatchData, true>, TContext>({ mutationKey: Common.UseBlockCollectionCollectionsCollectionIdBlockPatchKeyFn(mutationKey), mutationFn: clientOptions => blockCollectionCollectionsCollectionIdBlockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Unblock Collection
*/
export const useUnblockCollectionCollectionsCollectionIdUnblockPatch = <TData = Common.UnblockCollectionCollectionsCollectionIdUnblockPatchMutationResult, TError = UnblockCollectionCollectionsCollectionIdUnblockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UnblockCollectionCollectionsCollectionIdUnblockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UnblockCollectionCollectionsCollectionIdUnblockPatchData, true>, TContext>({ mutationKey: Common.UseUnblockCollectionCollectionsCollectionIdUnblockPatchKeyFn(mutationKey), mutationFn: clientOptions => unblockCollectionCollectionsCollectionIdUnblockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Set Default Address
*
* Сделать адрес основным: он и подставляется при оформлении.
*/
export const useSetDefaultAddressUserAddressesAddressIdDefaultPatch = <TData = Common.SetDefaultAddressUserAddressesAddressIdDefaultPatchMutationResult, TError = SetDefaultAddressUserAddressesAddressIdDefaultPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<SetDefaultAddressUserAddressesAddressIdDefaultPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<SetDefaultAddressUserAddressesAddressIdDefaultPatchData, true>, TContext>({ mutationKey: Common.UseSetDefaultAddressUserAddressesAddressIdDefaultPatchKeyFn(mutationKey), mutationFn: clientOptions => setDefaultAddressUserAddressesAddressIdDefaultPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Approve Review
*
* Пропустить отзыв на витрину: с этого момента он входит в рейтинг.
*/
export const useApproveReviewReviewsReviewIdApprovePatch = <TData = Common.ApproveReviewReviewsReviewIdApprovePatchMutationResult, TError = ApproveReviewReviewsReviewIdApprovePatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<ApproveReviewReviewsReviewIdApprovePatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<ApproveReviewReviewsReviewIdApprovePatchData, true>, TContext>({ mutationKey: Common.UseApproveReviewReviewsReviewIdApprovePatchKeyFn(mutationKey), mutationFn: clientOptions => approveReviewReviewsReviewIdApprovePatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Reject Review
*
* Отклонить отзыв с причиной.
*
* Причина обязательна и видна автору: без неё отзыв просто исчезает, и
* исправить его нельзя, потому что непонятно что.
*/
export const useRejectReviewReviewsReviewIdRejectPatch = <TData = Common.RejectReviewReviewsReviewIdRejectPatchMutationResult, TError = RejectReviewReviewsReviewIdRejectPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<RejectReviewReviewsReviewIdRejectPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<RejectReviewReviewsReviewIdRejectPatchData, true>, TContext>({ mutationKey: Common.UseRejectReviewReviewsReviewIdRejectPatchKeyFn(mutationKey), mutationFn: clientOptions => rejectReviewReviewsReviewIdRejectPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Approve Return
*
* Подтвердить возврат: платформа согласна принять товар назад.
*
* Остаток здесь не меняется — товар ещё у покупателя. Он возвращается в
* остаток, когда его получат и осмотрят (PATCH /returns/{id}/receive).
*/
export const useApproveReturnReturnsRequestIdApprovePatch = <TData = Common.ApproveReturnReturnsRequestIdApprovePatchMutationResult, TError = ApproveReturnReturnsRequestIdApprovePatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<ApproveReturnReturnsRequestIdApprovePatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<ApproveReturnReturnsRequestIdApprovePatchData, true>, TContext>({ mutationKey: Common.UseApproveReturnReturnsRequestIdApprovePatchKeyFn(mutationKey), mutationFn: clientOptions => approveReturnReturnsRequestIdApprovePatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Receive Return
*
* Товар по одобренному возврату получен назад.
*
* Получает тот, у кого товар хранится: часть FBS — продавец, часть FBO —
* склад Postshop (сотрудник). restock=true — товар цел и возвращается в
* остаток; false — брак, остаток не меняется.
*/
export const useReceiveReturnReturnsRequestIdReceivePatch = <TData = Common.ReceiveReturnReturnsRequestIdReceivePatchMutationResult, TError = ReceiveReturnReturnsRequestIdReceivePatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<ReceiveReturnReturnsRequestIdReceivePatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<ReceiveReturnReturnsRequestIdReceivePatchData, true>, TContext>({ mutationKey: Common.UseReceiveReturnReturnsRequestIdReceivePatchKeyFn(mutationKey), mutationFn: clientOptions => receiveReturnReturnsRequestIdReceivePatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Reject Return
*
* Отказать в возврате с причиной.
*
* Причина обязательна: без неё заявка закрывается молча, и покупатель не
* понимает ни решения, ни что делать дальше.
*/
export const useRejectReturnReturnsRequestIdRejectPatch = <TData = Common.RejectReturnReturnsRequestIdRejectPatchMutationResult, TError = RejectReturnReturnsRequestIdRejectPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<RejectReturnReturnsRequestIdRejectPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<RejectReturnReturnsRequestIdRejectPatchData, true>, TContext>({ mutationKey: Common.UseRejectReturnReturnsRequestIdRejectPatchKeyFn(mutationKey), mutationFn: clientOptions => rejectReturnReturnsRequestIdRejectPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Mark Read
*
* Отметить прочитанным. Чужое — 404: подтверждать его существование незачем.
*/
export const useMarkReadNotificationsNotificationIdReadPatch = <TData = Common.MarkReadNotificationsNotificationIdReadPatchMutationResult, TError = MarkReadNotificationsNotificationIdReadPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<MarkReadNotificationsNotificationIdReadPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<MarkReadNotificationsNotificationIdReadPatchData, true>, TContext>({ mutationKey: Common.UseMarkReadNotificationsNotificationIdReadPatchKeyFn(mutationKey), mutationFn: clientOptions => markReadNotificationsNotificationIdReadPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Mark All Read
*
* Отметить прочитанными все свои.
*
* Нужно потому, что накопившийся список иначе разбирается по одному, и отметка
* «есть новое» не гаснет, пока человек не откроет каждое.
*/
export const useMarkAllReadNotificationsReadAllPatch = <TData = Common.MarkAllReadNotificationsReadAllPatchMutationResult, TError = unknown, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<MarkAllReadNotificationsReadAllPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<MarkAllReadNotificationsReadAllPatchData, true>, TContext>({ mutationKey: Common.UseMarkAllReadNotificationsReadAllPatchKeyFn(mutationKey), mutationFn: clientOptions => markAllReadNotificationsReadAllPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Block Warehouse
*/
export const useBlockWarehouseWarehousesWarehouseIdBlockPatch = <TData = Common.BlockWarehouseWarehousesWarehouseIdBlockPatchMutationResult, TError = BlockWarehouseWarehousesWarehouseIdBlockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<BlockWarehouseWarehousesWarehouseIdBlockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<BlockWarehouseWarehousesWarehouseIdBlockPatchData, true>, TContext>({ mutationKey: Common.UseBlockWarehouseWarehousesWarehouseIdBlockPatchKeyFn(mutationKey), mutationFn: clientOptions => blockWarehouseWarehousesWarehouseIdBlockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Unblock Warehouse
*/
export const useUnblockWarehouseWarehousesWarehouseIdUnblockPatch = <TData = Common.UnblockWarehouseWarehousesWarehouseIdUnblockPatchMutationResult, TError = UnblockWarehouseWarehousesWarehouseIdUnblockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UnblockWarehouseWarehousesWarehouseIdUnblockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UnblockWarehouseWarehousesWarehouseIdUnblockPatchData, true>, TContext>({ mutationKey: Common.UseUnblockWarehouseWarehousesWarehouseIdUnblockPatchKeyFn(mutationKey), mutationFn: clientOptions => unblockWarehouseWarehousesWarehouseIdUnblockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Item Quantity
*
* Исправить количество позиции черновика.
*
* Складчик при приёмке находил расхождение — привезли меньше заявленного, —
* и мог только удалить позицию и завести её заново. Подтверждается то, что
* фактически принято, поэтому количество правится до подтверждения.
*/
export const useUpdateItemQuantityStockReceiptsReceiptIdItemsItemIdPatch = <TData = Common.UpdateItemQuantityStockReceiptsReceiptIdItemsItemIdPatchMutationResult, TError = UpdateItemQuantityStockReceiptsReceiptIdItemsItemIdPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateItemQuantityStockReceiptsReceiptIdItemsItemIdPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateItemQuantityStockReceiptsReceiptIdItemsItemIdPatchData, true>, TContext>({ mutationKey: Common.UseUpdateItemQuantityStockReceiptsReceiptIdItemsItemIdPatchKeyFn(mutationKey), mutationFn: clientOptions => updateItemQuantityStockReceiptsReceiptIdItemsItemIdPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Block Pickup Point
*/
export const useBlockPickupPointPickupPointsPickupPointIdBlockPatch = <TData = Common.BlockPickupPointPickupPointsPickupPointIdBlockPatchMutationResult, TError = BlockPickupPointPickupPointsPickupPointIdBlockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<BlockPickupPointPickupPointsPickupPointIdBlockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<BlockPickupPointPickupPointsPickupPointIdBlockPatchData, true>, TContext>({ mutationKey: Common.UseBlockPickupPointPickupPointsPickupPointIdBlockPatchKeyFn(mutationKey), mutationFn: clientOptions => blockPickupPointPickupPointsPickupPointIdBlockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Unblock Pickup Point
*/
export const useUnblockPickupPointPickupPointsPickupPointIdUnblockPatch = <TData = Common.UnblockPickupPointPickupPointsPickupPointIdUnblockPatchMutationResult, TError = UnblockPickupPointPickupPointsPickupPointIdUnblockPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UnblockPickupPointPickupPointsPickupPointIdUnblockPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UnblockPickupPointPickupPointsPickupPointIdUnblockPatchData, true>, TContext>({ mutationKey: Common.UseUnblockPickupPointPickupPointsPickupPointIdUnblockPatchKeyFn(mutationKey), mutationFn: clientOptions => unblockPickupPointPickupPointsPickupPointIdUnblockPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Order Status
*/
export const useUpdateOrderStatusOrdersOrderIdStatusPatch = <TData = Common.UpdateOrderStatusOrdersOrderIdStatusPatchMutationResult, TError = UpdateOrderStatusOrdersOrderIdStatusPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateOrderStatusOrdersOrderIdStatusPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateOrderStatusOrdersOrderIdStatusPatchData, true>, TContext>({ mutationKey: Common.UseUpdateOrderStatusOrdersOrderIdStatusPatchKeyFn(mutationKey), mutationFn: clientOptions => updateOrderStatusOrdersOrderIdStatusPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Update Shop Order Status
*
* Магазин меняет локальный статус своей части заказа.
*
* Доступно только после того, как админ глобально одобрил заказ (approved):
* именно тогда заказ разослан по магазинам. Переходы:
* pending → approved/rejected, approved → ready_to_take/rejected.
*/
export const useUpdateShopOrderStatusOrdersOrderIdShopShopIdStatusPatch = <TData = Common.UpdateShopOrderStatusOrdersOrderIdShopShopIdStatusPatchMutationResult, TError = UpdateShopOrderStatusOrdersOrderIdShopShopIdStatusPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<UpdateShopOrderStatusOrdersOrderIdShopShopIdStatusPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<UpdateShopOrderStatusOrdersOrderIdShopShopIdStatusPatchData, true>, TContext>({ mutationKey: Common.UseUpdateShopOrderStatusOrdersOrderIdShopShopIdStatusPatchKeyFn(mutationKey), mutationFn: clientOptions => updateShopOrderStatusOrdersOrderIdShopShopIdStatusPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Set Contact Us Handled
*
* Отметить обращение обработанным или снять отметку.
*/
export const useSetContactUsHandledContactUsContactIdHandledPatch = <TData = Common.SetContactUsHandledContactUsContactIdHandledPatchMutationResult, TError = SetContactUsHandledContactUsContactIdHandledPatchError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<SetContactUsHandledContactUsContactIdHandledPatchData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<SetContactUsHandledContactUsContactIdHandledPatchData, true>, TContext>({ mutationKey: Common.UseSetContactUsHandledContactUsContactIdHandledPatchKeyFn(mutationKey), mutationFn: clientOptions => setContactUsHandledContactUsContactIdHandledPatch(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Revoke All Permissions
*
* Отозвать ВСЕ права у пользователя.
*/
export const useRevokeAllPermissionsPermissionsUserIdPermissionsDelete = <TData = Common.RevokeAllPermissionsPermissionsUserIdPermissionsDeleteMutationResult, TError = RevokeAllPermissionsPermissionsUserIdPermissionsDeleteError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<RevokeAllPermissionsPermissionsUserIdPermissionsDeleteData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<RevokeAllPermissionsPermissionsUserIdPermissionsDeleteData, true>, TContext>({ mutationKey: Common.UseRevokeAllPermissionsPermissionsUserIdPermissionsDeleteKeyFn(mutationKey), mutationFn: clientOptions => revokeAllPermissionsPermissionsUserIdPermissionsDelete(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Revoke Permission
*
* Отозвать право у пользователя.
*/
export const useRevokePermissionPermissionsUserIdPermissionsPermissionCodeDelete = <TData = Common.RevokePermissionPermissionsUserIdPermissionsPermissionCodeDeleteMutationResult, TError = RevokePermissionPermissionsUserIdPermissionsPermissionCodeDeleteError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<RevokePermissionPermissionsUserIdPermissionsPermissionCodeDeleteData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<RevokePermissionPermissionsUserIdPermissionsPermissionCodeDeleteData, true>, TContext>({ mutationKey: Common.UseRevokePermissionPermissionsUserIdPermissionsPermissionCodeDeleteKeyFn(mutationKey), mutationFn: clientOptions => revokePermissionPermissionsUserIdPermissionsPermissionCodeDelete(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Delete Shop Additional
*
* Удалить профиль магазина вместе с логотипом.
*
* Профиля, созданного не тому магазину, было не убрать: ни удаления, ни
* блокировки, а второй создать нельзя — слот занят. Магазин при этом
* остаётся, профиль создаётся заново.
*/
export const useDeleteShopAdditionalShopAdditionalsShopAdditionalIdDelete = <TData = Common.DeleteShopAdditionalShopAdditionalsShopAdditionalIdDeleteMutationResult, TError = DeleteShopAdditionalShopAdditionalsShopAdditionalIdDeleteError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<DeleteShopAdditionalShopAdditionalsShopAdditionalIdDeleteData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<DeleteShopAdditionalShopAdditionalsShopAdditionalIdDeleteData, true>, TContext>({ mutationKey: Common.UseDeleteShopAdditionalShopAdditionalsShopAdditionalIdDeleteKeyFn(mutationKey), mutationFn: clientOptions => deleteShopAdditionalShopAdditionalsShopAdditionalIdDelete(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Delete Banner
*/
export const useDeleteBannerBannersBannerIdDelete = <TData = Common.DeleteBannerBannersBannerIdDeleteMutationResult, TError = DeleteBannerBannersBannerIdDeleteError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<DeleteBannerBannersBannerIdDeleteData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<DeleteBannerBannersBannerIdDeleteData, true>, TContext>({ mutationKey: Common.UseDeleteBannerBannersBannerIdDeleteKeyFn(mutationKey), mutationFn: clientOptions => deleteBannerBannersBannerIdDelete(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Delete Banner Image
*/
export const useDeleteBannerImageBannersBannerIdImageDelete = <TData = Common.DeleteBannerImageBannersBannerIdImageDeleteMutationResult, TError = DeleteBannerImageBannersBannerIdImageDeleteError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<DeleteBannerImageBannersBannerIdImageDeleteData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<DeleteBannerImageBannersBannerIdImageDeleteData, true>, TContext>({ mutationKey: Common.UseDeleteBannerImageBannersBannerIdImageDeleteKeyFn(mutationKey), mutationFn: clientOptions => deleteBannerImageBannersBannerIdImageDelete(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Delete Collection
*/
export const useDeleteCollectionCollectionsCollectionIdDelete = <TData = Common.DeleteCollectionCollectionsCollectionIdDeleteMutationResult, TError = DeleteCollectionCollectionsCollectionIdDeleteError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<DeleteCollectionCollectionsCollectionIdDeleteData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<DeleteCollectionCollectionsCollectionIdDeleteData, true>, TContext>({ mutationKey: Common.UseDeleteCollectionCollectionsCollectionIdDeleteKeyFn(mutationKey), mutationFn: clientOptions => deleteCollectionCollectionsCollectionIdDelete(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Clear Cart
*/
export const useClearCartCartDelete = <TData = Common.ClearCartCartDeleteMutationResult, TError = unknown, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<ClearCartCartDeleteData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<ClearCartCartDeleteData, true>, TContext>({ mutationKey: Common.UseClearCartCartDeleteKeyFn(mutationKey), mutationFn: clientOptions => clearCartCartDelete(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Remove From Cart
*/
export const useRemoveFromCartCartProductIdDelete = <TData = Common.RemoveFromCartCartProductIdDeleteMutationResult, TError = RemoveFromCartCartProductIdDeleteError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<RemoveFromCartCartProductIdDeleteData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<RemoveFromCartCartProductIdDeleteData, true>, TContext>({ mutationKey: Common.UseRemoveFromCartCartProductIdDeleteKeyFn(mutationKey), mutationFn: clientOptions => removeFromCartCartProductIdDelete(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Remove From Favorites
*/
export const useRemoveFromFavoritesFavoritesProductIdDelete = <TData = Common.RemoveFromFavoritesFavoritesProductIdDeleteMutationResult, TError = RemoveFromFavoritesFavoritesProductIdDeleteError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<RemoveFromFavoritesFavoritesProductIdDeleteData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<RemoveFromFavoritesFavoritesProductIdDeleteData, true>, TContext>({ mutationKey: Common.UseRemoveFromFavoritesFavoritesProductIdDeleteKeyFn(mutationKey), mutationFn: clientOptions => removeFromFavoritesFavoritesProductIdDelete(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Delete Address
*
* Удалить адрес.
*
* Если удалили основной, основным становится следующий: иначе у человека с
* парой адресов при оформлении перестало бы подставляться что-либо, хотя
* адреса есть.
*/
export const useDeleteAddressUserAddressesAddressIdDelete = <TData = Common.DeleteAddressUserAddressesAddressIdDeleteMutationResult, TError = DeleteAddressUserAddressesAddressIdDeleteError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<DeleteAddressUserAddressesAddressIdDeleteData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<DeleteAddressUserAddressesAddressIdDeleteData, true>, TContext>({ mutationKey: Common.UseDeleteAddressUserAddressesAddressIdDeleteKeyFn(mutationKey), mutationFn: clientOptions => deleteAddressUserAddressesAddressIdDelete(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Delete Review
*
* Удалить свой отзыв. Сотрудник платформы может удалить любой.
*/
export const useDeleteReviewReviewsReviewIdDelete = <TData = Common.DeleteReviewReviewsReviewIdDeleteMutationResult, TError = DeleteReviewReviewsReviewIdDeleteError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<DeleteReviewReviewsReviewIdDeleteData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<DeleteReviewReviewsReviewIdDeleteData, true>, TContext>({ mutationKey: Common.UseDeleteReviewReviewsReviewIdDeleteKeyFn(mutationKey), mutationFn: clientOptions => deleteReviewReviewsReviewIdDelete(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Cancel Return
*
* Отозвать свою заявку, пока её не рассмотрели.
*
* После решения — нельзя: подтверждённый возврат уже изменил склад, а
* отклонённый должен остаться видимым вместе с причиной.
*/
export const useCancelReturnReturnsRequestIdDelete = <TData = Common.CancelReturnReturnsRequestIdDeleteMutationResult, TError = CancelReturnReturnsRequestIdDeleteError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<CancelReturnReturnsRequestIdDeleteData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<CancelReturnReturnsRequestIdDeleteData, true>, TContext>({ mutationKey: Common.UseCancelReturnReturnsRequestIdDeleteKeyFn(mutationKey), mutationFn: clientOptions => cancelReturnReturnsRequestIdDelete(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Delete Notification
*
* Убрать своё уведомление из списка.
*/
export const useDeleteNotificationNotificationsNotificationIdDelete = <TData = Common.DeleteNotificationNotificationsNotificationIdDeleteMutationResult, TError = DeleteNotificationNotificationsNotificationIdDeleteError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<DeleteNotificationNotificationsNotificationIdDeleteData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<DeleteNotificationNotificationsNotificationIdDeleteData, true>, TContext>({ mutationKey: Common.UseDeleteNotificationNotificationsNotificationIdDeleteKeyFn(mutationKey), mutationFn: clientOptions => deleteNotificationNotificationsNotificationIdDelete(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Delete Receipt
*
* Удалить черновик прихода вместе с его позициями.
*
* Подтверждённый приход удалить нельзя: на него опирается движение по складу.
*/
export const useDeleteReceiptStockReceiptsReceiptIdDelete = <TData = Common.DeleteReceiptStockReceiptsReceiptIdDeleteMutationResult, TError = DeleteReceiptStockReceiptsReceiptIdDeleteError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<DeleteReceiptStockReceiptsReceiptIdDeleteData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<DeleteReceiptStockReceiptsReceiptIdDeleteData, true>, TContext>({ mutationKey: Common.UseDeleteReceiptStockReceiptsReceiptIdDeleteKeyFn(mutationKey), mutationFn: clientOptions => deleteReceiptStockReceiptsReceiptIdDelete(clientOptions) as unknown as Promise<TData>, ...options });
/**
* Delete Item
*/
export const useDeleteItemStockReceiptsReceiptIdItemsItemIdDelete = <TData = Common.DeleteItemStockReceiptsReceiptIdItemsItemIdDeleteMutationResult, TError = DeleteItemStockReceiptsReceiptIdItemsItemIdDeleteError, TQueryKey extends Array<unknown> = unknown[], TContext = unknown>(mutationKey?: TQueryKey, options?: Omit<UseMutationOptions<TData, TError, Options<DeleteItemStockReceiptsReceiptIdItemsItemIdDeleteData, true>, TContext>, "mutationKey" | "mutationFn">) => useMutation<TData, TError, Options<DeleteItemStockReceiptsReceiptIdItemsItemIdDeleteData, true>, TContext>({ mutationKey: Common.UseDeleteItemStockReceiptsReceiptIdItemsItemIdDeleteKeyFn(mutationKey), mutationFn: clientOptions => deleteItemStockReceiptsReceiptIdItemsItemIdDelete(clientOptions) as unknown as Promise<TData>, ...options });
