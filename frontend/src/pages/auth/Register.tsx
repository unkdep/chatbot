import AuthLayout from "../../layouts/AuthLayout"

export default function Register() {
  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-center mb-6 text-black dark:text-white">
        Criar conta
      </h1>

      <form className="space-y-4">
        <input placeholder="Nome" className="input" />
        <input placeholder="Email" className="input" />
        <input placeholder="Senha" type="password" className="input" />

        <button className="btn-primary">
          Cadastrar
        </button>
      </form>
    </AuthLayout>
  )
}
