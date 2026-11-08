/**
 * events.js — Random weekly events system with conditions, probabilities,
 * and player decisions.
 */

export const RANDOM_EVENTS = [
  {
    id: 'viral_fancam',
    title: 'Viral Stage Fancam',
    description: 'A fan-captured video of an idol performing at a recent event has gone viral on social media, racking up millions of views!',
    type: 'positive',
    probability: 0.12,
    trigger: (state) => state.idols.some(i => i.popularity > 15),
    resolve: (state) => {
      const eligible = state.idols.filter(i => i.popularity > 15)
      const idol = eligible[Math.floor(Math.random() * eligible.length)]
      return {
        message: `${idol.name}'s viral fancam exploded across global feeds! Popularity +8, Fanbase +2,500.`,
        idolPatch: { [idol.id]: { popularityDelta: 8, fanbaseDelta: 2500 } },
        moneyDelta: 0,
        reputationDelta: 1,
      }
    },
  },
  {
    id: 'cf_offer',
    title: 'Commercial Brand Endorsement Offer',
    description: 'A major cosmetic brand wants one of your active artists to be the brand ambassador for their new spring skincare line.',
    type: 'positive',
    probability: 0.10,
    trigger: (state) => state.idols.some(i => i.visual >= 60 && i.popularity >= 20),
    resolve: (state) => {
      const eligible = state.idols.filter(i => i.visual >= 60 && i.popularity >= 20)
      const idol = eligible[Math.floor(Math.random() * eligible.length)]
      const endorsementFee = 18_000_000
      return {
        message: `${idol.name} signed a lucrative cosmetics endorsement deal! Company receives ₩${endorsementFee.toLocaleString()}.`,
        idolPatch: { [idol.id]: { popularityDelta: 5 } },
        moneyDelta: endorsementFee,
        reputationDelta: 2,
      }
    },
  },
  {
    id: 'fandom_billboard',
    title: 'Subway Station Fan Birthday Tribute',
    description: 'Passionate fans crowdfunded giant LED billboard advertisements at Gangnam and Hongdae subway stations to celebrate an idol!',
    type: 'positive',
    probability: 0.10,
    trigger: (state) => state.idols.some(i => i.fanbase > 1000),
    resolve: (state) => {
      const eligible = state.idols.filter(i => i.fanbase > 1000)
      const idol = eligible[Math.floor(Math.random() * eligible.length)]
      return {
        message: `Heartwarming fan support energized ${idol.name}! Loyalty +6, Fanbase +1,200.`,
        idolPatch: { [idol.id]: { loyaltyDelta: 6, fanbaseDelta: 1200 } },
        moneyDelta: 0,
        reputationDelta: 1,
      }
    },
  },
  {
    id: 'seasonal_flu',
    title: 'Seasonal Fatigue & Flu',
    description: 'Unpredictable seasonal weather causes unexpected fatigue and slight exhaustion among the trainees in the dormitories.',
    type: 'negative',
    probability: 0.10,
    trigger: (state) => state.idols.length >= 2,
    resolve: (state) => {
      return {
        message: 'Several trainees caught seasonal colds. Group fatigue increased by 15 across the company.',
        fatigueAllDelta: 15,
        moneyDelta: -1_500_000, // Clinic and medical care expenses
        reputationDelta: 0,
      }
    },
  },
  {
    id: 'studio_maintenance',
    title: 'Recording Studio Electrical Maintenance',
    description: 'An electrical surge in the studio complex tripped a transformer, requiring emergency inspection and cable replacement.',
    type: 'negative',
    probability: 0.08,
    trigger: (state) => state.money >= 10_000_000,
    resolve: (state) => {
      const cost = 3_000_000
      return {
        message: `Emergency audio hardware repairs completed. ₩${cost.toLocaleString()} deducted for technician fees.`,
        moneyDelta: -cost,
        reputationDelta: 0,
      }
    },
  },
]

export function checkWeeklyRandomEvent(state) {
  // Roll probability (25% chance of any event per week)
  if (Math.random() > 0.28) return null

  const eligibleEvents = RANDOM_EVENTS.filter(evt => {
    try {
      return evt.trigger(state)
    } catch {
      return false
    }
  })

  if (eligibleEvents.length === 0) return null

  const selected = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)]
  const result = selected.resolve(state)

  return {
    id: selected.id,
    title: selected.title,
    description: selected.description,
    type: selected.type,
    outcome: result,
  }
}
