import { IncorporadoraForm } from '@/components/admin/incorporadora-form'

export default function NovaIncorporadoraPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Nova Incorporadora</h1>
      <IncorporadoraForm />
    </div>
  )
}
