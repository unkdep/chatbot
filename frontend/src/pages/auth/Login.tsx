import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthLayout from "../../layouts/AuthLayout"
import orb from "../../assets/orb.gif"

type Mode = "login" | "register" | "forgot"
type Lang = "pt" | "en" | "es"

const I18N: Record<
  Lang,
  {
    brand: string
    leftTitle: string
    leftSubtitle: string
    loginTitle: string
    registerTitle: string
    forgotTitle: string
    firstName: string
    lastName2: string
    email: string
    password: string
    enter: string
    signup: string
    sendLink: string
    forgotLink: string
    createAccount: string
    backToLogin: string
    typeEmail: string
    language: string
  }
> = {
  pt: {
    brand: "Lumi",
    leftTitle: "Comece agora",
    leftSubtitle: "Experiência moderna e fluida.",
    loginTitle: "Entrar",
    registerTitle: "Criar conta",
    forgotTitle: "Recuperar acesso",
    firstName: "Primeiro nome",
    lastName2: "Segundo nome",
    email: "Email",
    password: "Senha",
    enter: "Entrar",
    signup: "Cadastrar",
    sendLink: "Enviar link",
    forgotLink: "Esqueceu a senha?",
    createAccount: "Criar conta",
    backToLogin: "Voltar para login",
    typeEmail: "Digite seu email",
    language: "Idioma",
  },
  en: {
    brand: "Lumi",
    leftTitle: "Start now",
    leftSubtitle: "Modern, smooth experience.",
    loginTitle: "Sign in",
    registerTitle: "Create account",
    forgotTitle: "Recover access",
    firstName: "First name",
    lastName2: "Last name",
    email: "Email",
    password: "Password",
    enter: "Sign in",
    signup: "Create",
    sendLink: "Send link",
    forgotLink: "Forgot password?",
    createAccount: "Create account",
    backToLogin: "Back to login",
    typeEmail: "Type your email",
    language: "Language",
  },
  es: {
    brand: "Lumi",
    leftTitle: "Empieza ahora",
    leftSubtitle: "Experiencia moderna y fluida.",
    loginTitle: "Entrar",
    registerTitle: "Crear cuenta",
    forgotTitle: "Recuperar acceso",
    firstName: "Nombre",
    lastName2: "Apellido",
    email: "Correo",
    password: "Contraseña",
    enter: "Entrar",
    signup: "Registrar",
    sendLink: "Enviar enlace",
    forgotLink: "¿Olvidaste tu contraseña?",
    createAccount: "Crear cuenta",
    backToLogin: "Volver al login",
    typeEmail: "Escribe tu correo",
    language: "Idioma",
  },
}

export default function Login() {
  const [mode, setMode] = useState<Mode>("login")
  const [lang, setLang] = useState<Lang>("pt")
  const [langOpen, setLangOpen] = useState(false)

  const navigate = useNavigate()
  const t = useMemo(() => I18N[lang], [lang])

  function handleSubmit() {
    if (mode === "login") navigate("/dashboard")
  }

  function selectLang(next: Lang) {
    setLang(next)
    setLangOpen(false)
  }

  return (
    <AuthLayout>
      <div className="w-screen h-screen">
        <div
          className="
            relative w-full h-full flex overflow-hidden
            bg-white dark:bg-black
            border-4 border-white dark:border-black
            shadow-2xl
            rounded-none
          "
        >
          {/* Reflexos / luzes (azul) */}
          <div className="pointer-events-none absolute inset-0">
            {/* LIGHT */}
            <div className="absolute -top-44 -left-44 w-[620px] h-[620px] rounded-full blur-3xl opacity-35 bg-sky-300 dark:hidden" />
            <div className="absolute top-10 -right-64 w-[680px] h-[680px] rounded-full blur-3xl opacity-25 bg-cyan-200 dark:hidden" />
            <div className="absolute -bottom-72 left-1/3 w-[820px] h-[820px] rounded-full blur-3xl opacity-20 bg-blue-200 dark:hidden" />

            {/* DARK */}
            <div className="hidden dark:block absolute -top-56 -left-56 w-[820px] h-[820px] rounded-full blur-3xl opacity-35 bg-blue-600" />
            <div className="hidden dark:block absolute top-0 -right-72 w-[900px] h-[900px] rounded-full blur-3xl opacity-28 bg-cyan-500" />

            {/* brilho suave */}
            <div className="absolute inset-0 opacity-[0.12] dark:opacity-[0.10] bg-[radial-gradient(900px_520px_at_50%_0%,rgba(255,255,255,.55),transparent_60%)]" />
          </div>

          {/* LEFT PANEL */}
          <div
            className="
              hidden md:flex w-1/2 p-14 flex-col justify-between
              aurora
              rounded-none
              relative
              border-r border-black/10 dark:border-white/10
            "
          >
            <div className="leftBrand text-xl font-light text-black dark:text-white select-none">
              {t.brand}
            </div>

            <div className="leftCopy">
              <h1 className="text-4xl font-light mb-4 text-black dark:text-white">
                {t.leftTitle}
              </h1>
              <p className="opacity-80 text-black dark:text-white">{t.leftSubtitle}</p>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div
            className="
              w-full md:w-1/2
              flex items-center justify-center p-10
              bg-white dark:bg-black
              relative
            "
          >
            {/* emenda/fundo igual ao login */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-white dark:bg-black hidden md:block" />

            {/* Dropdown idioma no canto inferior direito */}
            <div className="absolute bottom-6 right-6 z-20">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="
                  px-4 py-2 rounded-full
                  bg-white/70 dark:bg-zinc-950/55 backdrop-blur-xl
                  border border-black/10 dark:border-white/18
                  hover:scale-[1.03] transition
                  text-sm font-medium
                  text-black dark:text-white
                "
                aria-haspopup="menu"
                aria-expanded={langOpen}
                title={t.language}
              >
                {lang.toUpperCase()}
              </button>

              {langOpen && (
                <>
                  {/* click outside */}
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />

                  <div
                    className="
                      absolute right-0 bottom-12 z-20
                      w-44 p-2 rounded-2xl
                      bg-white dark:bg-zinc-950
                      border border-black/10 dark:border-white/18
                      shadow-[0_22px_70px_rgba(0,0,0,.25)]
                    "
                    role="menu"
                  >
                    <LangItem active={lang === "pt"} onClick={() => selectLang("pt")}>
                      PT — Português
                    </LangItem>
                    <LangItem active={lang === "en"} onClick={() => selectLang("en")}>
                      EN — English
                    </LangItem>
                    <LangItem active={lang === "es"} onClick={() => selectLang("es")}>
                      ES — Español
                    </LangItem>
                  </div>
                </>
              )}
            </div>

            {/* Card no desktop; mobile flat + desce o card no desktop */}
            <div
              className="
                w-full max-w-md
                text-black dark:text-white

                /* 🔽 MOBILE — abaixa de verdade */
                mt-32 px-2

                /* 🖥️ DESKTOP */
                md:mt-0
                md:p-10
                md:rounded-[2.25rem]
                md:bg-white/70 md:dark:bg-zinc-950/55
                md:border md:border-black/10 md:dark:border-white/15
                md:shadow-[0_25px_80px_rgba(0,0,0,.18)]
                md:translate-y-10

                flex flex-col
              "
            >
              <h2 className="text-3xl font-light mb-6 text-black dark:text-white">
                {mode === "login" && t.loginTitle}
                {mode === "register" && t.registerTitle}
                {mode === "forgot" && t.forgotTitle}
              </h2>

              {mode === "register" && (
                <>
                  <input className="input-glass mb-3" placeholder={t.firstName} />
                  <input className="input-glass mb-3" placeholder={t.lastName2} />
                </>
              )}

              {mode !== "forgot" && <input className="input-glass mb-3" placeholder={t.email} />}

              {mode !== "forgot" && (
                <input className="input-glass mb-6" type="password" placeholder={t.password} />
              )}

              {mode === "forgot" && <input className="input-glass mb-6" placeholder={t.typeEmail} />}

              <button onClick={handleSubmit} className="btn-primary">
                {mode === "login" && t.enter}
                {mode === "register" && t.signup}
                {mode === "forgot" && t.sendLink}
              </button>

              {mode === "login" && (
                <button
                  onClick={() => setMode("forgot")}
                  className="block mt-4 text-sm underline opacity-70 hover:opacity-100 transition text-black dark:text-white"
                >
                  {t.forgotLink}
                </button>
              )}

              {mode !== "forgot" && (
                <button
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                  className="mt-6 text-sm underline opacity-70 hover:opacity-100 transition text-black dark:text-white"
                >
                  {mode === "login" ? t.createAccount : t.backToLogin}
                </button>
              )}

              {mode === "forgot" && (
                <button
                  onClick={() => setMode("login")}
                  className="mt-6 text-sm underline opacity-70 hover:opacity-100 transition text-black dark:text-white"
                >
                  {t.backToLogin}
                </button>
              )}

              {mode === "login" && (
                <div className="mt-10 flex justify-center relative">
                  <div className="absolute inset-0 -z-10 blur-2xl opacity-25 dark:opacity-35 bg-sky-400 rounded-full" />
                  <img src={orb} alt="Lumi Orb" className="orb w-80 md:w-[24rem] select-none opacity-95" />
                </div>
              )}
            </div>
          </div>

          <style>{`
            .aurora{
              background:
                radial-gradient(900px 520px at 10% 0%, rgba(59,130,246,.20), transparent 60%),
                radial-gradient(720px 420px at 85% 18%, rgba(34,211,238,.16), transparent 60%),
                radial-gradient(900px 560px at 50% 92%, rgba(14,165,233,.12), transparent 62%),
                linear-gradient(135deg, rgba(255,255,255,.92), rgba(255,255,255,.70));
            }
            .dark .aurora{
              background:
                radial-gradient(980px 560px at 10% 0%, rgba(0,140,255,.26), transparent 62%),
                radial-gradient(760px 460px at 85% 18%, rgba(34,211,238,.20), transparent 62%),
                radial-gradient(980px 620px at 50% 92%, rgba(59,130,246,.18), transparent 64%),
                linear-gradient(135deg, rgba(10,10,10,.96), rgba(0,0,0,.92));
            }

            .leftBrand{ transition: .25s ease; }
            .leftBrand:hover{
              transform: translateY(-1px);
              text-shadow: 0 0 22px rgba(56,189,248,.35);
            }
            .leftCopy{ transition: .25s ease; }
            .leftCopy:hover{
              transform: translateY(-2px);
              text-shadow: 0 0 26px rgba(56,189,248,.30);
            }

            .input-glass{
              width:100%;
              padding:12px 14px;
              border-radius:16px;
              background: rgba(255,255,255,.75);
              border: 1px solid rgba(0,0,0,.12);
              outline:none;
              transition:.2s;
              color:#0a0a0a;
            }
            .input-glass:focus{
              border-color: rgba(37,99,235,.45);
              box-shadow: 0 0 0 4px rgba(37,99,235,.12);
            }
            .dark .input-glass{
              background: rgba(0,0,0,.38);
              border: 1px solid rgba(255,255,255,.18);
              color:white;
            }
            .dark .input-glass:focus{
              border-color: rgba(59,130,246,.65);
              box-shadow: 0 0 0 4px rgba(59,130,246,.22);
            }

            .btn-primary{
              width:100%;
              padding:14px 16px;
              border-radius:18px;
              color:#fff !important;
              background: linear-gradient(180deg, #0b1220, #000);
              border: 1px solid rgba(0,0,0,.10);
              box-shadow: 0 18px 40px rgba(0,0,0,.22);
              transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease;
            }
            .btn-primary:hover{
              transform: translateY(-1px);
              box-shadow: 0 22px 55px rgba(0,0,0,.26);
            }
            .btn-primary:active{
              transform: translateY(0px);
              opacity:.95;
            }
            .dark .btn-primary{
              border: 1px solid rgba(255,255,255,.22);
              box-shadow: 0 18px 40px rgba(0,0,0,.38);
            }

            .orb{
              cursor: pointer;
              pointer-events: auto;
              transition: transform .45s ease, filter .45s ease, opacity .45s ease;
              animation: orbBreath 4.8s ease-in-out infinite;
              will-change: transform, filter;
            }
            .orb:hover{
              transform: scale(1.08);
              filter: drop-shadow(0 0 26px rgba(56,189,248,.55)) drop-shadow(0 0 60px rgba(59,130,246,.25));
              opacity: 1;
            }
            @keyframes orbBreath{
              0%   { transform: translateY(0px) scale(1); }
              50%  { transform: translateY(-6px) scale(1.02); }
              100% { transform: translateY(0px) scale(1); }
            }
          `}</style>
        </div>
      </div>
    </AuthLayout>
  )
}

function LangItem({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-3 py-2 rounded-xl text-sm
        transition
        text-black dark:text-white
        ${active ? "bg-black/5 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/10"}
      `}
      role="menuitem"
    >
      {children}
    </button>
  )
}
