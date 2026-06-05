import { EmpreendimentoForm } from '@/components/admin/empreendimento-form'

export default function NovoEmpreendimentoPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Novo Empreendimento</h1>
      <EmpreendimentoForm />
    </div>
  )
}
