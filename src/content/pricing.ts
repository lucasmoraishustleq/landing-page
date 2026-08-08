/**
 * Fonte única de verdade para TODOS os valores monetários do site.
 * Para mudar um preço, altere aqui — a copy que cita valores usa estas variáveis,
 * então nada fica hardcoded no meio do texto.
 */
export const pricing = {
  currencySymbol: '$',

  /** Produto (waitlist → "founding member") */
  deposit: 25, // depósito reembolsável para reservar a vaga founding
  foundingMonthly: 50, // preço travado para membros founding
  standardMonthly: 100, // preço padrão após o lançamento

  /** Founding Partner Program (FPP) — o serviço done-with-you */
  fpp: {
    monthly: 750,
    reservationFee: 30,
    spots: 3,
    durationDays: 90,
  },
} as const

/** Formata um número como preço: price(50) -> "$50" */
export const price = (value: number) => `${pricing.currencySymbol}${value}`

/** Preço mensal formatado: perMonth(50) -> "$50/month" */
export const perMonth = (value: number) => `${price(value)}/month`
