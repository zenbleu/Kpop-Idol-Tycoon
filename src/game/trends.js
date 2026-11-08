/**
 * trends.js — Market trends for genres and concepts that rotate periodically.
 */

import { GENRES, CONCEPTS } from './balance.js'

export function generateMarketTrends(currentWeek = 1) {
  // Rotate primary trending genre and concept based on week
  const genreIndex = (currentWeek * 3) % GENRES.length
  const conceptIndex = (currentWeek * 2) % CONCEPTS.length

  const trendingGenre = GENRES[genreIndex]
  const trendingConcept = CONCEPTS[conceptIndex]

  // Secondary trend
  const secondaryGenre = GENRES[(genreIndex + 2) % GENRES.length]

  return {
    weekUpdated: currentWeek,
    genres: [trendingGenre, secondaryGenre],
    concepts: [trendingConcept],
    headline: `Music Industry Trend: ${trendingGenre} and ${trendingConcept} concepts dominate streaming charts!`,
  }
}
