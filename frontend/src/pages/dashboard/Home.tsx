export default function Home() {
  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-medium">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <Card title="Em conversa" value="0" />
        <Card title="Aguardando" value="123" />
        <Card title="Finalizados" value="0" />
        <Card title="Novos contatos" value="578" />

      </div>

    </div>
  )
}

function Card({ title, value }: any) {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm">
      <div className="text-sm opacity-70 mb-2">{title}</div>
      <div className="text-3xl font-semibold">{value}</div>
    </div>
  )
}
