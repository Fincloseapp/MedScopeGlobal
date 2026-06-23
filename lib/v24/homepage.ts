export const V24_AI_MEDICAL = {
  title: "AI Medical Intelligence",
  subtitle: "Klinické uvažování, diferenciální diagnostika a studijní asistence — v češtině.",
  features: [
    {
      id: "assistant",
      title: "AI Medical Assistant",
      description: "Odborné shrnutí studií, guidelines a klinických témat s citacemi zdrojů.",
      href: "/ai",
      icon: "assistant",
    },
    {
      id: "reasoning",
      title: "AI Clinical Reasoning",
      description: "Strukturované klinické uvažování — anamnéza, DDx, další kroky.",
      href: "/ai/klinicke-uvazovani",
      icon: "reasoning",
    },
    {
      id: "ddx",
      title: "AI Differential Diagnosis",
      description: "Diferenciální diagnostika s red flags a pravděpodobnostním rámcem.",
      href: "/ai/diferencialni-diagnostika",
      icon: "ddx",
    },
    {
      id: "treatment",
      title: "AI Treatment Planner",
      description: "Léčebný plán v edukativním režimu — bez individuálního dávkování.",
      href: "/ai/lecebny-plan",
      icon: "treatment",
    },
    {
      id: "study",
      title: "AI Study Assistant",
      description: "Příprava na LF — anatomie, farmakologie, klinické scénáře.",
      href: "/studium",
      icon: "study",
    },
  ],
} as const;
