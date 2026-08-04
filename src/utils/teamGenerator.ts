import { Player, Team, Match } from '../types';

interface GenerationOptions {
  teamAName?: string;
  teamBName?: string;
  teamAColor?: string;
  teamBColor?: string;
}

export function generateBalancedTeams(
  presentPlayers: Player[],
  pastMatches: Match[] = [],
  options: GenerationOptions = {}
): { teamA: Team; teamB: Team; scoreDiff: number; ratingA: number; ratingB: number } {
  if (presentPlayers.length < 2) {
    throw new Error('É necessário pelo menos 2 jogadores presentes para formar os times.');
  }

  const teamAColor = options.teamAColor || 'bg-blue-500';
  const teamBColor = options.teamBColor || 'bg-amber-500';

  // If number of players is odd, remove the weakest player before balancing
  let weakestPlayer: Player | null = null;
  let playersToBalance = presentPlayers;

  if (presentPlayers.length % 2 !== 0) {
    const sortedByRating = [...presentPlayers].sort((a, b) => {
      const rA = a.rating ?? 3.0;
      const rB = b.rating ?? 3.0;
      if (rA !== rB) return rA - rB;
      return (a.matchesPlayed || 0) - (b.matchesPlayed || 0);
    });
    weakestPlayer = sortedByRating[0];
    playersToBalance = presentPlayers.filter((p) => p.id !== weakestPlayer!.id);
  }

  // Build co-occurrence matrix from past matches to favor team variety
  const coOccurrenceMap = new Map<string, number>();
  pastMatches.forEach((match) => {
    [match.teamA.playerIds, match.teamB.playerIds].forEach((ids) => {
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const key = [ids[i], ids[j]].sort().join('_');
          coOccurrenceMap.set(key, (coOccurrenceMap.get(key) || 0) + 1);
        }
      }
    });
  });

  const countTeamA = Math.ceil(playersToBalance.length / 2);

  // We perform candidate simulations to find the best combination
  let bestCombination: {
    teamAPlayers: Player[];
    teamBPlayers: Player[];
    score: number;
    ratingA: number;
    ratingB: number;
  } | null = null;

  const iterations = Math.min(1000, Math.pow(2, playersToBalance.length));

  for (let i = 0; i < iterations; i++) {
    // Shuffle copy of players
    const shuffled = [...playersToBalance].sort(() => Math.random() - 0.5);
    const teamAPlayers = shuffled.slice(0, countTeamA);
    const teamBPlayers = shuffled.slice(countTeamA);

    // 1. Skill rating sum
    const sumA = teamAPlayers.reduce((acc, p) => acc + (p.rating ?? 3.0), 0);
    const sumB = teamBPlayers.reduce((acc, p) => acc + (p.rating ?? 3.0), 0);
    const ratingA = teamAPlayers.length ? sumA / teamAPlayers.length : 0;
    const ratingB = teamBPlayers.length ? sumB / teamBPlayers.length : 0;
    const skillDiff = Math.abs(sumA - sumB);

    // 2. Positional balance penalty
    const posA: Record<string, number> = {};
    const posB: Record<string, number> = {};
    teamAPlayers.forEach((p) => {
      if (p.position) posA[p.position] = (posA[p.position] || 0) + 1;
    });
    teamBPlayers.forEach((p) => {
      if (p.position) posB[p.position] = (posB[p.position] || 0) + 1;
    });

    let posPenalty = 0;
    // Prefer both teams to have at least 1 setter if present
    if ((posA['Levantador'] || 0) > 0 && (posB['Levantador'] || 0) === 0 && playersToBalance.filter(p => p.position === 'Levantador').length >= 2) {
      posPenalty += 4;
    }

    // 3. Variety penalty (repeat teammates)
    let varietyPenalty = 0;
    for (let x = 0; x < teamAPlayers.length; x++) {
      for (let y = x + 1; y < teamAPlayers.length; y++) {
        const key = [teamAPlayers[x].id, teamAPlayers[y].id].sort().join('_');
        varietyPenalty += (coOccurrenceMap.get(key) || 0) * 1.5;
      }
    }
    for (let x = 0; x < teamBPlayers.length; x++) {
      for (let y = x + 1; y < teamBPlayers.length; y++) {
        const key = [teamBPlayers[x].id, teamBPlayers[y].id].sort().join('_');
        varietyPenalty += (coOccurrenceMap.get(key) || 0) * 1.5;
      }
    }

    // Combined score (lower is better)
    const combinedScore = skillDiff * 12 + posPenalty * 6 + varietyPenalty * 1.5;

    if (!bestCombination || combinedScore < bestCombination.score) {
      bestCombination = {
        teamAPlayers,
        teamBPlayers,
        score: combinedScore,
        ratingA,
        ratingB,
      };
    }
  }

  if (!bestCombination) {
    const half = Math.ceil(playersToBalance.length / 2);
    bestCombination = {
      teamAPlayers: playersToBalance.slice(0, half),
      teamBPlayers: playersToBalance.slice(half),
      score: 0,
      ratingA: 4.0,
      ratingB: 4.0,
    };
  }

  const finalTeamAPlayers = [...bestCombination.teamAPlayers];
  const finalTeamBPlayers = [...bestCombination.teamBPlayers];

  // If there was an odd player (weakestPlayer), assign him/her to the weaker team
  if (weakestPlayer) {
    const sumA = finalTeamAPlayers.reduce((acc, p) => acc + (p.rating ?? 3.0), 0);
    const sumB = finalTeamBPlayers.reduce((acc, p) => acc + (p.rating ?? 3.0), 0);

    if (sumA < sumB) {
      finalTeamAPlayers.push(weakestPlayer);
    } else if (sumB < sumA) {
      finalTeamBPlayers.push(weakestPlayer);
    } else {
      // Equal score -> place in team with fewer total accumulated matches played
      const matchesA = finalTeamAPlayers.reduce((acc, p) => acc + (p.matchesPlayed || 0), 0);
      const matchesB = finalTeamBPlayers.reduce((acc, p) => acc + (p.matchesPlayed || 0), 0);

      if (matchesA <= matchesB) {
        finalTeamAPlayers.push(weakestPlayer);
      } else {
        finalTeamBPlayers.push(weakestPlayer);
      }
    }
  }

  const randomPlayerA = finalTeamAPlayers.length
    ? finalTeamAPlayers[Math.floor(Math.random() * finalTeamAPlayers.length)]
    : null;
  const randomPlayerB = finalTeamBPlayers.length
    ? finalTeamBPlayers[Math.floor(Math.random() * finalTeamBPlayers.length)]
    : null;

  const getTeamName = (customName?: string, randomPlayer?: Player | null, fallback = 'Time A') => {
    if (customName) return customName;
    if (randomPlayer) {
      const firstName = randomPlayer.name.trim().split(' ')[0];
      return `Time ${firstName}`;
    }
    return fallback;
  };

  const teamAName = getTeamName(options.teamAName, randomPlayerA, 'Time A');
  const teamBName = getTeamName(options.teamBName, randomPlayerB, 'Time B');

  const teamA: Team = {
    id: 'teamA',
    name: teamAName,
    color: teamAColor,
    playerIds: finalTeamAPlayers.map((p) => p.id),
  };

  const teamB: Team = {
    id: 'teamB',
    name: teamBName,
    color: teamBColor,
    playerIds: finalTeamBPlayers.map((p) => p.id),
  };

  const scoreDiff = Math.abs(bestCombination.ratingA - bestCombination.ratingB);

  return {
    teamA,
    teamB,
    scoreDiff,
    ratingA: Number(bestCombination.ratingA.toFixed(1)),
    ratingB: Number(bestCombination.ratingB.toFixed(1)),
  };
}
