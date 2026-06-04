export function randomXpForDifficulty(difficulty: 'easy' | 'medium' | 'hard'): number {
  const ranges = {
    easy:   { min: 500,   max: 2000  },
    medium: { min: 2100,  max: 6000  },
    hard:   { min: 6100,  max: 10000 },
  }
  const { min, max } = ranges[difficulty]
  const steps = Math.floor((max - min) / 100)
  return min + Math.floor(Math.random() * (steps + 1)) * 100
}
