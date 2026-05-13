import { NextResponse } from 'next/server';

const getPlatformRoutingValue = (region) => {
  if (!region) return 'na1';
  const map = {
    'NA': 'na1',
    'BR': 'br1',
    'LAN': 'la1',
    'LAS': 'la2',
    'KR': 'kr',
    'JP': 'jp1',
    'EUW': 'euw1',
    'EUNE': 'eun1',
    'TR': 'tr1',
    'RU': 'ru'
  };
  return map[region.toUpperCase()] || 'na1';
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { riotId, region, puuid } = body;

    const API_KEY = process.env.RIOT_API_KEY;

    if (!API_KEY) {
      return NextResponse.json({ error: 'RIOT_API_KEY missing' }, { status: 500 });
    }

    if (!puuid) {
      return NextResponse.json({ error: 'Missing puuid. Did you login properly?' }, { status: 400 });
    }

    const platformRoutingValue = getPlatformRoutingValue(region);

    // 3. Get Ranked Stats from League V4 using PUUID
    const leagueUrl = `https://${platformRoutingValue}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
    let soloQ = null;
    let flexQ = null;
    try {
      const leagueRes = await fetch(
        leagueUrl,
        { headers: { 'X-Riot-Token': API_KEY } }
      );

      if (leagueRes.ok) {
        const leagueData = await leagueRes.json();
        soloQ = leagueData.find(q => q.queueType === 'RANKED_SOLO_5x5');
        flexQ = leagueData.find(q => q.queueType === 'RANKED_FLEX_SR');
      } else {
        console.warn(`League fetch failed: ${leagueRes.status}`);
      }
    } catch (e) {
      console.warn('League error:', e);
    }

    // 4. Get Champion Mastery V4
    let masteryData = [];
    let totalMasteryScore = 0;
    try {
      // Fetch all champion masteries to calculate legacy-style total score
      const masteryRes = await fetch(
        `https://${platformRoutingValue}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`,
        { headers: { 'X-Riot-Token': API_KEY } }
      );

      if (masteryRes.ok) {
        const allMasteries = await masteryRes.json();
        // Calculate legacy total score: cap each champion's level at 7
        totalMasteryScore = allMasteries.reduce((acc, m) => acc + Math.min(m.championLevel, 7), 0);
        // Only keep the top 3 for the podium display
        masteryData = allMasteries;
      }
    } catch (e) {
      console.warn('Mastery error:', e);
    }

    // 5. Get Champion Data to map IDs to Names
    let championMap = {};
    try {
      // Primary source: Data Dragon
      const ddragonRes = await fetch('https://ddragon.leagueoflegends.com/cdn/14.21.1/data/en_US/champion.json');
      if (ddragonRes.ok) {
        const ddragonData = await ddragonRes.json();
        const champions = ddragonData.data;
        for (const key in champions) {
          const champ = champions[key];
          championMap[String(champ.key)] = { id: champ.id, name: champ.name };
        }
      } else {
        throw new Error('Data Dragon primary fetch failed');
      }
    } catch (e) {
      console.warn('Data Dragon failed, trying Community Dragon fallback:', e.message);
      try {
        const cdragonRes = await fetch('https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json');
        if (cdragonRes.ok) {
          const cdragonData = await cdragonRes.json();
          cdragonData.forEach(champ => {
            if (champ.id !== -1) {
              championMap[String(champ.id)] = { id: champ.alias, name: champ.name };
            }
          });
        }
      } catch (fallbackError) {
        console.error('All champion data sources failed:', fallbackError);
      }
    }

    const mappedMastery = masteryData.map(m => {
      const champInfo = championMap[String(m.championId)] || { id: 'Unknown', name: `Champ ${m.championId}` };
      return {
        championId: m.championId,
        championStringId: champInfo.id, // For image URLs
        championName: champInfo.name,   // For display
        championLevel: m.championLevel,
        championPoints: m.championPoints
      };
    });

    return NextResponse.json({
      summonerName: riotId?.split('#')[0] || 'Unknown',
      // We rely on the initial login fetch for level and icon
      rank: soloQ ? { tier: soloQ.tier, rank: soloQ.rank, lp: soloQ.leaguePoints } : null,
      flexRank: flexQ ? { tier: flexQ.tier, rank: flexQ.rank, lp: flexQ.leaguePoints } : null,
      pastRank: { tier: 'PLATINUM', rank: 'I' }, // Mocked historical data
      mastery: mappedMastery,
      totalMasteryScore: totalMasteryScore
    });

  } catch (error) {
    console.error('Profile API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
