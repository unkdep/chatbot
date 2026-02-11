import AuthLayout from "../../layouts/AuthLayout"

export default function ForgotPassword() {
  return (
    <AuthLayout>
      <div className="min-h-screen flex items-center justify-center p-6">

        <div className="
          w-full max-w-md
          rounded-[2.5rem]
          bg-white/80 dark:bg-black/80
          backdrop-blur-xl
          border-4 border-white dark:border-black
          shadow-2xl
          p-10
          text-black dark:text-white
        ">

          <h1 className="text-3xl font-light mb-4">
            Recuperar acesso
          </h1>

          <p className="text-sm opacity-70 mb-8">
            Informe seu email para redefinir sua senha.
          </p>

          <input
            className="input-glass mb-6"
            type="email"
            placeholder="Email"
          />

          <button className="btn-primary w-full">
            Enviar instruções
          </button>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm underline opacity-70 hover:opacity-100 transition"
            >
              Voltar para login
            </a>
          </div>

        </div>
      </div>
    </AuthLayout>
  )
}
