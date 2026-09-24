import { createFileRoute } from '@tanstack/react-router'
import { requireNumericParams } from '#/shared/lib/requireNumericParams'
import { CategoryIdPage } from '#/pages/category-id'

const CategoryPage = () => {
  const { categoryId } = Route.useParams()

  return <CategoryIdPage categoryId={categoryId} />
}

export const Route = createFileRoute('/_base-layout/categories/$categoryId/')({
  component: CategoryPage,
  beforeLoad: ({ params }) => requireNumericParams(params, ['categoryId']),
})
