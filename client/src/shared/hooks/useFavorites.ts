import { useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { ModalRef } from '#/shared/ui/Modal'
import type { GetFavoritesFavoritesGetDefaultResponse } from '#/shared/openapi/queries/common'
import { useProfileStore } from '#/shared/stores/profileStore'
import {
  useAddToFavoritesFavoritesProductIdPost,
  useGetFavoritesFavoritesGet,
  useRemoveFromFavoritesFavoritesProductIdDelete,
} from '#/shared/openapi/queries'
import { useGetFavoritesFavoritesGetKey } from '#/shared/openapi/queries/common'

export const useFavorites = (loginModalRef?: React.RefObject<ModalRef | null>) => {
  const profile = useProfileStore((s) => s.profile)
  const queryClient = useQueryClient()
  const pendingRef = useRef(new Set<number>())

  const { data: favorites } = useGetFavoritesFavoritesGet({}, undefined, {
    enabled: !!profile,
  })

  const favoriteIds = new Set(favorites?.map((f) => f.product.id) ?? [])

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [useGetFavoritesFavoritesGetKey] })

  const addMutation = useAddToFavoritesFavoritesProductIdPost(undefined, {
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: [useGetFavoritesFavoritesGetKey] })
      const previous = queryClient.getQueryData<GetFavoritesFavoritesGetDefaultResponse>([
        useGetFavoritesFavoritesGetKey,
        {},
      ])
      queryClient.setQueryData<GetFavoritesFavoritesGetDefaultResponse>(
        [useGetFavoritesFavoritesGetKey, {}],
        (old) => [
          ...(old ?? []),
          { id: -1, product: { id: variables.path.product_id } as never, created_at: '' },
        ],
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData([useGetFavoritesFavoritesGetKey, {}], context.previous)
      }
    },
    onSettled: (_data, _err, variables) => {
      pendingRef.current.delete(variables.path.product_id)
      invalidate()
    },
  })

  const removeMutation = useRemoveFromFavoritesFavoritesProductIdDelete(undefined, {
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: [useGetFavoritesFavoritesGetKey] })
      const previous = queryClient.getQueryData<GetFavoritesFavoritesGetDefaultResponse>([
        useGetFavoritesFavoritesGetKey,
        {},
      ])
      queryClient.setQueryData<GetFavoritesFavoritesGetDefaultResponse>(
        [useGetFavoritesFavoritesGetKey, {}],
        (old) => (old ?? []).filter((f) => f.product.id !== variables.path.product_id),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData([useGetFavoritesFavoritesGetKey, {}], context.previous)
      }
    },
    onSettled: (_data, _err, variables) => {
      pendingRef.current.delete(variables.path.product_id)
      invalidate()
    },
  })

  const toggleFavorite = useCallback(
    (productId: number) => {
      if (!profile) {
        loginModalRef?.current?.open()
        return
      }
      if (pendingRef.current.has(productId)) return
      pendingRef.current.add(productId)

      if (favoriteIds.has(productId)) {
        removeMutation.mutate({ path: { product_id: productId } })
      } else {
        addMutation.mutate({ path: { product_id: productId } })
      }
    },
    [profile, favoriteIds, addMutation, removeMutation, loginModalRef],
  )

  const isFavorite = useCallback((productId: number) => favoriteIds.has(productId), [favoriteIds])

  return { toggleFavorite, isFavorite, favorites }
}
