import { PostForm } from '@/components/admin/post-form'

export default function NovoBlogPostPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Novo post</h1>
      <PostForm />
    </div>
  )
}
