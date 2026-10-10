import React, { useCallback, useState } from 'react'
import { FlatList, ListRenderItem, Pressable } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Header from '@/components/Header'
import ActivityIndicator from '@/ui/ActivityIndicator'
import EmptyState from '@/ui/EmptyState'
import RefreshControl from '@/ui/RefreshControl'
import Typography from '@/ui/Typography'
import useAppStore from '@/store/useAppStore'
import { notificationApi } from '@/api/notificationApi'
import { notificationTarget } from '@/utils/notificationTarget'
import NotificationRow from './_components/NotificationRow'

/** По столько добавляется за одно нажатие «Показать ещё». */
const PAGE_SIZE = 20

/**
 * Список уведомлений.
 *
 * В профиле пункт стоял с пометкой «Скоро» и ничего не открывал, хотя бэкенд
 * умел всё: список, счётчик непрочитанных, отметку о прочтении, удаление.
 *
 * Предел растёт, а не листается страницами: список читают сверху вниз, и
 * пронумерованные страницы теряли бы уже просмотренное место.
 */
const NotificationsScreen = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const language = useAppStore((s) => s.lang) ?? 'ru'

  const [limit, setLimit] = useState(PAGE_SIZE)

  const { data, isPending, isFetching, refetch } = notificationApi.useGetAll({
    skip: 0,
    limit,
  })
  const markRead = notificationApi.useMarkRead()
  const markAllRead = notificationApi.useMarkAllRead()
  const remove = notificationApi.useDelete()

  const items = data ?? []
  // Пришло ровно столько, сколько просили, — значит, скорее всего, есть ещё.
  // Общее число приходит заголовком, но клиент читает только тело ответа.
  const mayHaveMore = items.length >= limit
  const hasUnread = items.some((item) => !item.is_read)

  const onPress = useCallback(
    (item: Notification.Item) => {
      if (!item.is_read) markRead.mutate(item.id)
      const target = notificationTarget(item.kind, item.entity_id)
      if (target) router.push(target)
    },
    [markRead, router],
  )

  const renderItem: ListRenderItem<Notification.Item> = useCallback(
    ({ item }) => (
      <NotificationRow
        data={item}
        hasTarget={!!notificationTarget(item.kind, item.entity_id)}
        onPress={() => onPress(item)}
        onDismiss={() => remove.mutate(item.id)}
        language={language}
        t={t}
      />
    ),
    [onPress, remove, language, t],
  )

  const keyExtractor = useCallback((item: Notification.Item) => String(item.id), [])

  return (
    <>
      <Header
        withGoBack
        title={t('notifications.title')}
        headerRight={
          hasUnread ? (
            <Pressable
              onPress={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              hitSlop={10}
            >
              <Typography variant="t1" weight="semiBold" color="main">
                {t('notifications.markAll')}
              </Typography>
            </Pressable>
          ) : undefined
        }
      />

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isPending} onRefresh={refetch} />
        }
        ListEmptyComponent={
          // Пустой список и список, который ещё не пришёл, — разные вещи.
          isPending ? (
            <ActivityIndicator isFullScreen />
          ) : (
            <EmptyState title={t('notifications.empty')} />
          )
        }
        ListFooterComponent={
          mayHaveMore ? (
            <Pressable
              style={styles.loadMore}
              onPress={() => setLimit((value) => value + PAGE_SIZE)}
            >
              <Typography variant="t1" weight="semiBold" color="main">
                {t('notifications.loadMore')}
              </Typography>
            </Pressable>
          ) : null
        }
      />
    </>
  )
}

export default NotificationsScreen

const styles = StyleSheet.create((theme) => ({
  list: {
    padding: theme.spacing(3),
    gap: theme.spacing(2),
    flexGrow: 1,
  },
  loadMore: {
    alignSelf: 'center',
    paddingVertical: theme.spacing(4),
  },
}))
