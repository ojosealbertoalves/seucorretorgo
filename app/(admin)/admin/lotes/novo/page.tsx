import { LoteForm } from '@/components/admin/lote-form'

export default function NovoLotePage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Novo Lote</h1>
      <LoteForm />
    </div>
  )
}
