interface BestScore {
  cubsSurvived: number;
  monthsCompleted: number;
  finalScore: number;
  achievementTitle: string;
  date: string;
}

const BEST_SCORE_COOKIE = 'saveCheetah_bestScore';
const COOKIE_EXPIRES_DAYS = 365; // 1 year

export function getBestScore(): BestScore | null {
  try {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${BEST_SCORE_COOKIE}=`))
      ?.split('=')[1];

    if (!cookieValue) return null;

    const decodedValue = decodeURIComponent(cookieValue);
    return JSON.parse(decodedValue);
  } catch (error) {
    console.error('Error reading best score from cookie:', error);
    return null;
  }
}

export function setBestScore(score: Omit<BestScore, 'date'>): void {
  try {
    const bestScore: BestScore = {
      ...score,
      date: new Date().toISOString()
    };

    const encodedValue = encodeURIComponent(JSON.stringify(bestScore));
    const expires = new Date();
    expires.setDate(expires.getDate() + COOKIE_EXPIRES_DAYS);

    document.cookie = `${BEST_SCORE_COOKIE}=${encodedValue}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
  } catch (error) {
    console.error('Error saving best score to cookie:', error);
  }
}

export function updateBestScore(newScore: Omit<BestScore, 'date'>): boolean {
  const currentBest = getBestScore();

  // If no current best score, save this one
  if (!currentBest) {
    setBestScore(newScore);
    return true;
  }

  // Compare scores: reaching 18 months is primary factor, then cubs survived, then months, then final score
  const newReached18 = newScore.monthsCompleted >= 18;
  const currentReached18 = currentBest.monthsCompleted >= 18;

  const isBetter =
    // If new score reached 18 months but current didn't, it's better
    (newReached18 && !currentReached18) ||
    // If both reached 18 months or both didn't, compare cubs survived
    (newReached18 === currentReached18 && newScore.cubsSurvived > currentBest.cubsSurvived) ||
    // If cubs survived are equal, compare months
    (newReached18 === currentReached18 && newScore.cubsSurvived === currentBest.cubsSurvived &&
     newScore.monthsCompleted > currentBest.monthsCompleted) ||
    // If months are equal, compare final score
    (newReached18 === currentReached18 && newScore.cubsSurvived === currentBest.cubsSurvived &&
     newScore.monthsCompleted === currentBest.monthsCompleted &&
     newScore.finalScore > currentBest.finalScore);

  if (isBetter) {
    setBestScore(newScore);
    return true;
  }

  return false;
}

export function clearBestScore(): void {
  const expires = new Date();
  expires.setDate(expires.getDate() - 1); // Set to past date to delete

  document.cookie = `${BEST_SCORE_COOKIE}=; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}