import { Player, Match, BalanceFeedback, PlayerRatingFeedback, UserSession } from '../types';
import { INITIAL_PLAYERS, INITIAL_MATCHES } from '../data/initialData';

const KEYS = {
  PLAYERS: 'volei_app_players_v1',
  MATCHES: 'volei_app_matches_v1',
  BALANCE_FEEDBACKS: 'volei_app_balance_feedbacks_v1',
  RATING_FEEDBACKS: 'volei_app_rating_feedbacks_v1',
  SESSION: 'volei_app_session_v1',
};

export function getStoredPlayers(): Player[] {
  try {
    const data = localStorage.getItem(KEYS.PLAYERS);
    return data ? JSON.parse(data) : INITIAL_PLAYERS;
  } catch {
    return INITIAL_PLAYERS;
  }
}

export function savePlayers(players: Player[]): void {
  try {
    localStorage.setItem(KEYS.PLAYERS, JSON.stringify(players));
  } catch (e) {
    console.error('Error saving players', e);
  }
}

export function getStoredMatches(): Match[] {
  try {
    const data = localStorage.getItem(KEYS.MATCHES);
    return data ? JSON.parse(data) : INITIAL_MATCHES;
  } catch {
    return INITIAL_MATCHES;
  }
}

export function saveMatches(matches: Match[]): void {
  try {
    localStorage.setItem(KEYS.MATCHES, JSON.stringify(matches));
  } catch (e) {
    console.error('Error saving matches', e);
  }
}

export function getStoredBalanceFeedbacks(): BalanceFeedback[] {
  try {
    const data = localStorage.getItem(KEYS.BALANCE_FEEDBACKS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveBalanceFeedback(feedback: BalanceFeedback): void {
  const current = getStoredBalanceFeedbacks();
  // replace or append if already evaluated for this match & evaluator
  const filtered = current.filter(
    (f) => !(f.matchId === feedback.matchId && f.evaluatorPhone === feedback.evaluatorPhone)
  );
  filtered.push(feedback);
  localStorage.setItem(KEYS.BALANCE_FEEDBACKS, JSON.stringify(filtered));
}

export function getStoredRatingFeedbacks(): PlayerRatingFeedback[] {
  try {
    const data = localStorage.getItem(KEYS.RATING_FEEDBACKS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePlayerRatingFeedbacks(
  matchId: string,
  evaluatorPhone: string,
  ratings: { targetPlayerId: string; rating: number }[]
): void {
  const currentFeedbacks = getStoredRatingFeedbacks();
  
  // Remove existing ratings for this match and evaluator
  const updatedFeedbacks = currentFeedbacks.filter(
    (rf) => !(rf.matchId === matchId && rf.evaluatorPhone === evaluatorPhone)
  );

  const newFeedbacks: PlayerRatingFeedback[] = ratings.map((r) => ({
    id: `rf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    matchId,
    evaluatorPhone,
    targetPlayerId: r.targetPlayerId,
    rating: r.rating,
    createdAt: new Date().toISOString(),
  }));

  const allFeedbacks = [...updatedFeedbacks, ...newFeedbacks];
  localStorage.setItem(KEYS.RATING_FEEDBACKS, JSON.stringify(allFeedbacks));

  // Recalculate dynamic player ratings
  recalculateAllPlayerRatings();
}

export function deleteFeedbacksForMatch(matchId: string): void {
  const balanceFeedbacks = getStoredBalanceFeedbacks();
  const updatedBalance = balanceFeedbacks.filter((f) => f.matchId !== matchId);
  localStorage.setItem(KEYS.BALANCE_FEEDBACKS, JSON.stringify(updatedBalance));

  const ratingFeedbacks = getStoredRatingFeedbacks();
  const updatedRating = ratingFeedbacks.filter((rf) => rf.matchId !== matchId);
  localStorage.setItem(KEYS.RATING_FEEDBACKS, JSON.stringify(updatedRating));
}

export function recalculateAllPlayerRatings(): Player[] {
  const players = getStoredPlayers();
  const allRatings = getStoredRatingFeedbacks();

  const updatedPlayers = players.map((player) => {
    // Find all ratings received by this player
    const receivedRatings = allRatings.filter((r) => r.targetPlayerId === player.id);
    if (receivedRatings.length === 0) {
      return {
        ...player,
        rating: (player.ratingCount && player.ratingCount > 0) ? player.rating : 3.0,
        ratingCount: player.ratingCount && player.ratingCount > 0 ? player.ratingCount : 0,
      };
    }

    const sum = receivedRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = sum / receivedRatings.length;

    return {
      ...player,
      rating: Number(avg.toFixed(1)),
      ratingCount: receivedRatings.length,
    };
  });

  savePlayers(updatedPlayers);
  return updatedPlayers;
}

export function getStoredSession(): UserSession | null {
  try {
    const data = localStorage.getItem(KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: UserSession | null): void {
  if (session) {
    localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
  } else {
    localStorage.removeItem(KEYS.SESSION);
  }
}

export function resetAllData(): void {
  localStorage.removeItem(KEYS.PLAYERS);
  localStorage.removeItem(KEYS.MATCHES);
  localStorage.removeItem(KEYS.BALANCE_FEEDBACKS);
  localStorage.removeItem(KEYS.RATING_FEEDBACKS);
  localStorage.removeItem(KEYS.SESSION);
}
