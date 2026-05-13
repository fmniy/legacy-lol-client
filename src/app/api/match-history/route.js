import { NextResponse } from 'next/server';

const getPlatformRoutingValue = (region) => {
  if (!region) return 'na1';
  const map = {
    'NA': 'na1', 'BR': 'br1', 'LAN': 'la1', 'LAS': 'la2',
    'KR': 'kr', 'JP': 'jp1', 'EUW': 'euw1', 'EUNE': 'eun1',
    'TR': 'tr1', 'RU': 'ru'
  };
  return map[region.toUpperCase()] || 'na1';
};

const getRegionalRoutingValue = (region) => {
  const regionMap = {
    'NA': 'americas', 'BR': 'americas', 'LAN': 'americas', 'LAS': 'americas',
    'KR': 'asia', 'JP': 'asia', 'EUW': 'europe', 'EUNE': 'europe',
    'TR': 'europe', 'RU': 'europe'
  };
  return regionMap[region.toUpperCase()] || 'americas';
};

export async function POST(request) {
  try {
    const { puuid, region } = await request.json();
    const API_KEY = process.env.RIOT_API_KEY;

    if (!API_KEY) return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
    if (!puuid) return NextResponse.json({ error: 'PUUID missing' }, { status: 400 });

    const regionalRoutingValue = getRegionalRoutingValue(region);

    // 1. Fetch Match IDs
    const matchIdsRes = await fetch(
      `https://${regionalRoutingValue}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`,
      { headers: { 'X-Riot-Token': API_KEY } }
    );

    if (!matchIdsRes.ok) throw new Error('Failed to fetch match IDs');
    const matchIds = await matchIdsRes.json();

    // 2. Fetch Match Details for each ID
    const matchDetailsPromises = matchIds.map(id =>
      fetch(`https://${regionalRoutingValue}.api.riotgames.com/lol/match/v5/matches/${id}`, {
        headers: { 'X-Riot-Token': API_KEY }
      }).then(res => res.ok ? res.json() : null)
    );

    const matchDetails = (await Promise.all(matchDetailsPromises)).filter(m => m && m.info);

    // 3. Get Champion and Spell Data for mapping
    const champMap = {};
    const spellMap = {};

    try {
      const [champRes, spellRes] = await Promise.all([
        fetch('https://ddragon.leagueoflegends.com/cdn/14.21.1/data/en_US/champion.json'),
        fetch('https://ddragon.leagueoflegends.com/cdn/14.21.1/data/en_US/summoner.json')
      ]);

      if (champRes.ok) {
        const champData = await champRes.json();
        Object.values(champData.data).forEach(c => { champMap[String(c.key)] = c.id; });
      }

      if (spellRes.ok) {
        const spellData = await spellRes.json();
        Object.values(spellData.data).forEach(s => { spellMap[String(s.key)] = s.id; });
      }
    } catch (err) {
      console.warn('Primary DDragon fetch failed, trying fallbacks...');
      // Fallback for champions
      try {
        const cdragonRes = await fetch('https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json');
        if (cdragonRes.ok) {
          const cdragonData = await cdragonRes.json();
          cdragonData.forEach(champ => {
            if (champ.id !== -1) champMap[String(champ.id)] = champ.alias;
          });
        }
      } catch (e) { console.error('Champion fallback failed'); }
    }

    // 4. Process and format matches
    const formattedMatches = matchDetails.map(match => {
      const participant = match.info.participants.find(p => p.puuid === puuid);
      if (!participant) return null;

      const champIdStr = String(participant.championId);
      const s1IdStr = String(participant.summoner1Id);
      const s2IdStr = String(participant.summoner2Id);

      return {
        matchId: match.metadata.matchId,
        championId: participant.championId,
        championName: champMap[champIdStr] || 'Unknown',
        win: participant.win,
        gameMode: match.info.gameMode,
        queueId: match.info.queueId,
        gameCreation: match.info.gameCreation,
        gameDuration: match.info.gameDuration,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        goldEarned: participant.goldEarned,
        summoner1Id: participant.summoner1Id,
        summoner2Id: participant.summoner2Id,
        spell1Name: spellMap[s1IdStr] || '',
        spell2Name: spellMap[s2IdStr] || '',
        items: [
          participant.item0, participant.item1, participant.item2,
          participant.item3, participant.item4, participant.item5,
          participant.item6
        ],
        cs: (participant.totalMinionsKilled || 0) + (participant.neutralMinionsKilled || 0)
      };
    }).filter(m => m !== null);

    return NextResponse.json({ matches: formattedMatches });

  } catch (error) {
    console.error('Match History API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
