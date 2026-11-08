/**
 * news.js — Lightweight procedural news generator based on actual game events.
 */

export function createNewsItem({
  type, // 'album_release' | 'concert' | 'tier_up' | 'reputation_up' | 'event' | 'departure' | 'fandom'
  headline,
  detail,
  week,
  year = 2026,
  sentiment = 'neutral', // 'positive' | 'negative' | 'neutral' | 'gold'
}) {
  return {
    id: `news_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    headline,
    detail,
    week,
    year,
    sentiment,
    timestamp: Date.now(),
  }
}

export function generateMilestoneNews({
  type,
  data,
  week,
  year,
}) {
  switch (type) {
    case 'album_release':
      return createNewsItem({
        type,
        headline: `[COMEBACK] ${data.targetName} drops sensational new ${data.releaseType} "${data.albumTitle}"!`,
        detail: `The ${data.genre} release featuring a stunning ${data.concept} visual concept is making immediate waves across digital streaming services.`,
        week,
        year,
        sentiment: 'gold',
      })
    case 'album_sales_complete':
      return createNewsItem({
        type,
        headline: `[CHART REPORT] ${data.targetName}'s "${data.albumTitle}" concludes initial sales run with ${Number(data.copiesSold).toLocaleString()} copies!`,
        detail: `Industry observers commend the high production quality and intense fandom engagement generated over the release window.`,
        week,
        year,
        sentiment: 'positive',
      })
    case 'concert_sold_out':
      return createNewsItem({
        type,
        headline: `[BOX OFFICE] ${data.targetName} completely SELLS OUT ${data.venueName}!`,
        detail: `All ${Number(data.capacity).toLocaleString()} seats were claimed within minutes, cementing their burgeoning stage dominance.`,
        week,
        year,
        sentiment: 'gold',
      })
    case 'tour_complete':
      return createNewsItem({
        type,
        headline: `[WORLD TOUR] ${data.targetName} successfully wraps up their "${data.tourName}"!`,
        detail: `Performing across ${data.stopsCount} major arenas to over ${Number(data.totalTickets).toLocaleString()} cheering fans.`,
        week,
        year,
        sentiment: 'gold',
      })
    case 'tier_promotion':
      return createNewsItem({
        type,
        headline: `[INDUSTRY] Agency climbs to Company Tier ${data.tier}!`,
        detail: `Financial analysts and media commentators note the rapid expansion and talent power of the growing enterprise.`,
        week,
        year,
        sentiment: 'gold',
      })
    case 'reputation_promotion':
      return createNewsItem({
        type,
        headline: `[GLOBAL REACH] Company officially reaches "${data.reputation}" Reputation status!`,
        detail: `With international recognition soaring, the agency now stands alongside world-class entertainment pioneers.`,
        week,
        year,
        sentiment: 'gold',
      })
    case 'idol_left_company':
      return createNewsItem({
        type,
        headline: `[EXCLUSIVE] ${data.idolName} officially parts ways with agency.`,
        detail: `Following contract termination, the company roster has been restructured. Netizens express shock and concern for agency stability.`,
        week,
        year,
        sentiment: 'negative',
      })
    case 'group_formed':
      return createNewsItem({
        type,
        headline: `[DEBUT ALERT] Agency officially unveils new ${data.gender}: "${data.groupName}"!`,
        detail: `Featuring ${data.memberCount} members with high expectations from music fans eagerly awaiting their debut teaser releases.`,
        week,
        year,
        sentiment: 'positive',
      })
    default:
      return null
  }
}
