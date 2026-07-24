import type { Dict, Status } from './dict.js'

export interface DictStats {
  total: number
  byStatus: Record<Status, number>
  missingStrongs: number
  missingRendering: number
}

export function dictStats(dict: Dict): DictStats {
  const byStatus: Record<Status, number> = { candidate: 0, decided: 0, applied: 0 }
  let missingStrongs = 0
  let missingRendering = 0
  for (const e of dict.entries) {
    byStatus[e.status]++
    if (e.lemmas.some(l => l.strongs === null)) missingStrongs++
    if (e.rendering === null) missingRendering++
  }
  return { total: dict.entries.length, byStatus, missingStrongs, missingRendering }
}
