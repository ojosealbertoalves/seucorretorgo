import Link from "next/link"
import {
  MessageCircle,
  Search,
  Bot,
  Calendar,
  PhoneOff,
  Clock,
  Building2,
  MapPin,
  ChevronDown,
} from "lucide-react"

export default function HomePage() {
  return (
    <>
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16 bg-[#1a2e44]/95 backdrop-blur-sm border-b border-white/10">
        <div className="h-full max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="text-white font-bold text-base tracking-tight select-none">
            Seu Corretor GO
          </span>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#como-funciona"
              className="text-white/70 hover:text-white text-sm transition-colors duration-200"
            >
              Como funciona
            </a>
            <Link
              href="/catalogo"
              className="text-white/70 hover:text-white text-sm transition-colors duration-200"
            >
              Catálogo
            </Link>
          </div>

          <Link
            href="/admin/login"
            className="text-white/80 border border-white/30 hover:border-white/70 hover:text-white text-xs font-medium px-4 py-1.5 rounded-md transition-all duration-200"
          >
            Acesso admin
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1a2e44 0%, #0f1f30 100%)" }}
      >
        {/* decorative blobs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "#f97316" }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "#3b82f6" }}
        />

        {/* pill tag */}
        <div className="relative mb-6 inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-4 py-2 rounded-full">
          <MapPin size={11} />
          Goiânia e Região · Apenas imóveis novos
        </div>

        {/* headline */}
        <h1 className="relative text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight max-w-3xl mb-6">
          O corretor do futuro.
          <br />
          <span style={{ color: "#f97316" }}>Sem pressão. Sem ligações.</span>
        </h1>

        {/* subtitle */}
        <p className="relative text-white/60 text-base md:text-lg max-w-xl leading-relaxed mb-10">
          Converse com o Alberto, nossa IA especialista em imóveis em Goiânia.
          Explore, compare e decida no seu ritmo — fale com um corretor apenas
          se quiser agendar uma visita.
        </p>

        {/* CTA */}
        <Link
          href="/conversar"
          className="relative inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 hover:scale-105"
          style={{
            background: "#f97316",
            boxShadow: "0 8px 32px rgba(249,115,22,0.35)",
          }}
        >
          <MessageCircle size={18} />
          Conversar com o Alberto agora
        </Link>

        {/* scroll indicator */}
        <div className="absolute bottom-8 flex flex-col items-center text-white/30 animate-bounce">
          <ChevronDown size={18} />
          <ChevronDown size={18} className="-mt-3 opacity-50" />
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" className="bg-white py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a2e44] text-center mb-16">
            Simples assim
          </h2>

          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* connector line desktop */}
            <div className="hidden md:block absolute top-7 left-[calc(16.67%+2.5rem)] right-[calc(16.67%+2.5rem)] h-px bg-gray-200" />

            {[
              {
                num: "1",
                title: "Explore sem pressão",
                desc: "Navegue pelo catálogo de imóveis novos em Goiânia com calma, sem ninguém te pressionando.",
                icon: Search,
              },
              {
                num: "2",
                title: "Converse com o Alberto",
                desc: "Nossa IA tira dúvidas, filtra opções e te ajuda a comparar os melhores empreendimentos.",
                icon: Bot,
              },
              {
                num: "3",
                title: "Decida e agende quando quiser",
                desc: "Só fale com um corretor real quando você decidir — exclusivamente para agendar a visita.",
                icon: Calendar,
              },
            ].map(({ num, title, desc, icon: Icon }) => (
              <div key={num} className="flex flex-col items-center text-center gap-4 relative">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 z-10"
                  style={{ background: "#1a2e44" }}
                >
                  {num}
                </div>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: "#fff7ed" }}
                >
                  <Icon size={20} style={{ color: "#f97316" }} />
                </div>
                <h3 className="text-base font-semibold text-[#1a2e44]">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS ── */}
      <section className="py-24 px-6" style={{ background: "#f8fafc" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a2e44] text-center mb-16">
            Por que diferente?
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                icon: PhoneOff,
                title: "Sem corretor insistente",
                desc: "Nada de ligações não solicitadas ou pressão para fechar. Você tem o controle total.",
              },
              {
                icon: Clock,
                title: "IA disponível 24h",
                desc: "O Alberto responde a qualquer hora, todos os dias. Explore quando você quiser.",
              },
              {
                icon: Building2,
                title: "Imóveis novos selecionados",
                desc: "Só empreendimentos novos de incorporadoras verificadas. Nada de imóvel usado.",
              },
              {
                icon: MapPin,
                title: "Só Goiânia — especialista local",
                desc: "Foco total na capital goiana e região. Conhecemos cada bairro e cada lançamento.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: "rgba(26,46,68,0.06)" }}
                >
                  <Icon size={20} style={{ color: "#1a2e44" }} />
                </div>
                <h3 className="text-base font-semibold text-[#1a2e44] mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section
        className="py-28 px-6 text-center"
        style={{ background: "linear-gradient(160deg, #1a2e44 0%, #0f1f30 100%)" }}
      >
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Pronto para encontrar
            <br />
            seu imóvel?
          </h2>
          <p className="text-white/50 mb-10 text-base">
            Sem formulários intermináveis. Só uma conversa.
          </p>
          <Link
            href="/conversar"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 hover:scale-105"
            style={{
              background: "#f97316",
              boxShadow: "0 8px 32px rgba(249,115,22,0.25)",
            }}
          >
            <MessageCircle size={18} />
            Falar com o Alberto
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0a1826" }} className="py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-white font-semibold text-sm">Seu Corretor GO</p>
            <p className="text-white/30 text-xs mt-0.5">© 2025 Seu Corretor GO · CRECI-GO</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/catalogo" className="text-white/40 hover:text-white/80 text-sm transition-colors duration-200">
              Catálogo
            </Link>
            <Link href="/conversar" className="text-white/40 hover:text-white/80 text-sm transition-colors duration-200">
              Conversar
            </Link>
            <Link href="/admin/login" className="text-white/40 hover:text-white/80 text-sm transition-colors duration-200">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}
