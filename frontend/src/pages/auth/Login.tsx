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
      <div className="w-screen min-h-screen">
        <div
          className="
            relative w-full min-h-screen flex overflow-hidden
            bg-white dark:bg-[#0c0f14]
            border-4 border-white dark:border-black
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
            <div className="hidden dark:block absolute -top-56 -left-56 w-[820px] h-[820px] rounded-full blur-3xl opacity-24 bg-blue-600" />
            <div className="hidden dark:block absolute top-0 -right-72 w-[900px] h-[900px] rounded-full blur-3xl opacity-18 bg-cyan-500" />

            {/* brilho suave */}
            <div className="absolute inset-0 opacity-[0.12] dark:opacity-[0.08] bg-[radial-gradient(900px_520px_at_50%_0%,rgba(255,255,255,.55),transparent_60%)]" />
          </div>

          {/* LEFT PANEL */}
          <div
            className="
              hidden md:flex w-1/2 p-14 flex-col justify-between
              aurora
              rounded-none
              relative
              border-r border-black/10 dark:border-white/14
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
              relative
              bg-white dark:bg-[#0c0f14]
              flex
              min-h-screen
              px-6
            "
          >
            {/* ✅ Centralização real */}
            <div className="w-full max-w-md mx-auto my-auto text-black dark:text-white flex flex-col">
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

              {mode !== "forgot" && (
                <input className="input-glass mb-3" placeholder={t.email} />
              )}

              {mode !== "forgot" && (
                <input
                  className="input-glass mb-6"
                  type="password"
                  placeholder={t.password}
                />
              )}

              {mode === "forgot" && (
                <input className="input-glass mb-6" placeholder={t.typeEmail} />
              )}

              {/* ✅ Botão aurora (igual vibe do lado) */}
              <button onClick={handleSubmit} className="btn-aurora">
                <span className="btn-aurora__shine" />
                <span className="btn-aurora__label">
                  {mode === "login" && t.enter}
                  {mode === "register" && t.signup}
                  {mode === "forgot" && t.sendLink}
                </span>
              </button>

              {/* ✅ REMOVIDO: "Esqueceu a senha?" */}

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
                  {/* ✅ glow constante no dark */}
                  <div className="orbGlow absolute inset-0 -z-10 rounded-full" />
                  <img
                    src={orb}
                    alt="Lumi Orb"
                    className="orb w-72 md:w-[22rem] select-none opacity-95"
                  />
                </div>
              )}
            </div>

            {/* Dropdown idioma */}
            <div className="absolute bottom-6 right-6 z-20">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="
                  px-4 py-2 rounded-full
                  bg-white/70 dark:bg-zinc-950/55 backdrop-blur-xl
                  border border-black/10 dark:border-white/24
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
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />

                  <div
                    className="
                      absolute right-0 bottom-12 z-20
                      w-44 p-2 rounded-2xl
                      bg-white dark:bg-zinc-950
                      border border-black/10 dark:border-white/22
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
                radial-gradient(980px 560px at 10% 0%, rgba(0,140,255,.22), transparent 62%),
                radial-gradient(760px 460px at 85% 18%, rgba(34,211,238,.16), transparent 62%),
                radial-gradient(980px 620px at 50% 92%, rgba(59,130,246,.14), transparent 64%),
                linear-gradient(135deg, rgba(14,16,20,.96), rgba(10,12,16,.92));
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
              border: 1px solid rgba(0,0,0,.14);
              outline:none;
              transition:.2s;
              color:#0a0a0a;
            }
            .input-glass:focus{
              border-color: rgba(37,99,235,.50);
              box-shadow: 0 0 0 4px rgba(37,99,235,.12);
            }

            .dark .input-glass{
              background: rgba(0,0,0,.28);
              border: 1px solid rgba(255,255,255,.30);
              color:white;
            }
            .dark .input-glass::placeholder{
              color: rgba(255,255,255,.55);
            }
            .dark .input-glass:focus{
              border-color: rgba(56,189,248,.75);
              box-shadow: 0 0 0 4px rgba(56,189,248,.18);
            }

            /* ✅ BOTÃO "aurora" (light = claro / dark = escuro), com brilho no hover */
            .btn-aurora{
              position: relative;
              width: 100%;
              padding: 14px 16px;
              border-radius: 18px;
              border: 1px solid rgba(0,0,0,.10);
              color: #071019;
              background:
                radial-gradient(900px 420px at 20% 0%, rgba(59,130,246,.22), transparent 62%),
                radial-gradient(720px 360px at 85% 18%, rgba(34,211,238,.18), transparent 60%),
                radial-gradient(900px 520px at 50% 110%, rgba(14,165,233,.14), transparent 64%),
                linear-gradient(135deg, rgba(255,255,255,.92), rgba(255,255,255,.70));
              box-shadow: 0 14px 34px rgba(0,0,0,.16);
              overflow: hidden;
              transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
            }
            .btn-aurora__label{
              position: relative;
              z-index: 2;
              font-weight: 600;
            }
            .btn-aurora__shine{
              content:"";
              position:absolute;
              inset:-2px;
              z-index:1;
              opacity: .0;
              background:
                radial-gradient(220px 160px at 20% 30%, rgba(34,211,238,.55), transparent 60%),
                radial-gradient(240px 170px at 80% 40%, rgba(59,130,246,.50), transparent 62%),
                radial-gradient(220px 160px at 50% 120%, rgba(14,165,233,.45), transparent 62%);
              filter: blur(14px);
              transition: opacity .22s ease;
            }
            .btn-aurora:hover{
              transform: translateY(-1px);
              box-shadow: 0 18px 50px rgba(0,0,0,.20);
            }
            .btn-aurora:hover .btn-aurora__shine{
              opacity: .85;
            }
            .btn-aurora:active{
              transform: translateY(0px);
              box-shadow: 0 14px 34px rgba(0,0,0,.16);
              filter: saturate(.98);
            }

            .dark .btn-aurora{
              color: #eaf6ff;
              border: 1px solid rgba(255,255,255,.18);
              background:
                radial-gradient(980px 520px at 12% 0%, rgba(0,140,255,.28), transparent 62%),
                radial-gradient(760px 420px at 85% 18%, rgba(34,211,238,.22), transparent 62%),
                radial-gradient(980px 580px at 50% 120%, rgba(59,130,246,.18), transparent 64%),
                linear-gradient(135deg, rgba(14,16,20,.92), rgba(8,10,14,.92));
              box-shadow: 0 18px 44px rgba(0,0,0,.45);
            }
            .dark .btn-aurora:hover{
              box-shadow: 0 22px 60px rgba(0,0,0,.55);
            }
            .dark .btn-aurora__shine{
              filter: blur(16px);
            }

            /* ✅ ORB: glow constante no dark (e hover dá um boost) */
            .orbGlow{
              opacity: .12;
              filter: blur(34px);
              background:
                radial-gradient(circle at 50% 55%, rgba(56,189,248,.55), transparent 62%),
                radial-gradient(circle at 52% 60%, rgba(37,99,235,.35), transparent 68%);
            }
            .dark .orbGlow{
              opacity: .28;
              filter: blur(40px);
            }

            .orb{
              cursor: pointer;
              pointer-events: auto;
              transition: transform .45s ease, filter .45s ease, opacity .45s ease;
              animation: orbBreath 4.8s ease-in-out infinite;
              will-change: transform, filter;
            }
            .orb:hover{
              transform: scale(1.06);
              filter: drop-shadow(0 0 22px rgba(56,189,248,.50)) drop-shadow(0 0 48px rgba(37,99,235,.22));
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