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
    syncDbToServer();
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
    syncDbToServer();
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
  const filtered = current.filter(
    (f) => !(f.matchId === feedback.matchId && f.evaluatorPhone === feedback.evaluatorPhone)
  );
  filtered.push(feedback);
  localStorage.setItem(KEYS.BALANCE_FEEDBACKS, JSON.stringify(filtered));
  syncDbToServer();
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

  recalculateAllPlayerRatings();
  syncDbToServer();
}

export function deleteFeedbacksForMatch(matchId: string): void {
  const balanceFeedbacks = getStoredBalanceFeedbacks();
  const updatedBalance = balanceFeedbacks.filter((f) => f.matchId !== matchId);
  localStorage.setItem(KEYS.BALANCE_FEEDBACKS, JSON.stringify(updatedBalance));

  const ratingFeedbacks = getStoredRatingFeedbacks();
  const updatedRating = ratingFeedbacks.filter((rf) => rf.matchId !== matchId);
  localStorage.setItem(KEYS.RATING_FEEDBACKS, JSON.stringify(updatedRating));

  syncDbToServer();
}

export function recalculateAllPlayerRatings(): Player[] {
  const players = getStoredPlayers();
  const allRatings = getStoredRatingFeedbacks();

  const updatedPlayers = players.map((player) => {
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

  try {
    localStorage.setItem(KEYS.PLAYERS, JSON.stringify(updatedPlayers));
  } catch {}
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

  fetch('/api/reset', { method: 'POST' }).catch(() => {});
}

// SERVER BACKEND DB SYNC
export async function syncDbToServer(): Promise<void> {
  try {
    const payload = {
      players: getStoredPlayers(),
      matches: getStoredMatches(),
      balanceFeedbacks: getStoredBalanceFeedbacks(),
      ratingFeedbacks: getStoredRatingFeedbacks(),
    };
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('Unable to sync database to local server:', err);
  }
}

export async function fetchDbFromServer(retries = 1): Promise<{
  players: Player[];
  matches: Match[];
  balanceFeedbacks: BalanceFeedback[];
  ratingFeedbacks: PlayerRatingFeedback[];
} | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch('/api/db');
      if (!res.ok) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }
        return null;
      }
      const json = await res.json();
      if (json && json.success) {
        if (!json.data) {
          // Initial server seed
          await syncDbToServer();
          return {
            players: getStoredPlayers(),
            matches: getStoredMatches(),
            balanceFeedbacks: getStoredBalanceFeedbacks(),
            ratingFeedbacks: getStoredRatingFeedbacks(),
          };
        }

        const { players, matches, balanceFeedbacks, ratingFeedbacks } = json.data;
        if (Array.isArray(players)) {
          localStorage.setItem(KEYS.PLAYERS, JSON.stringify(players));
        }
        if (Array.isArray(matches)) {
          localStorage.setItem(KEYS.MATCHES, JSON.stringify(matches));
        }
        if (Array.isArray(balanceFeedbacks)) {
          localStorage.setItem(KEYS.BALANCE_FEEDBACKS, JSON.stringify(balanceFeedbacks));
        }
        if (Array.isArray(ratingFeedbacks)) {
          localStorage.setItem(KEYS.RATING_FEEDBACKS, JSON.stringify(ratingFeedbacks));
        }

        return {
          players: players || getStoredPlayers(),
          matches: matches || getStoredMatches(),
          balanceFeedbacks: balanceFeedbacks || getStoredBalanceFeedbacks(),
          ratingFeedbacks: ratingFeedbacks || getStoredRatingFeedbacks(),
        };
      }
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }
      console.warn('Unable to fetch database from local server, fallback to client state:', err);
    }
  }
  return null;
}
