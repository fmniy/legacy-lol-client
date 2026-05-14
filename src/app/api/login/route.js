import { NextResponse } from 'next/server';

const getRoutingValue = (region) => {
  const americas = ['NA', 'BR', 'LAN', 'LAS'];
  const asia = ['KR', 'JP'];
  const europe = ['EUW', 'EUNE', 'TR', 'RU'];

  const upperRegion = region.toUpperCase();
  if (americas.includes(upperRegion)) return 'americas';
  if (asia.includes(upperRegion)) return 'asia';
  if (europe.includes(upperRegion)) return 'europe';
  return 'americas'; // Default
};

const getPlatformRoutingValue = (region) => {
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
    const { riotId, region } = body;
    const API_KEY = process.env.RIOT_API_KEY;

    if (!API_KEY) {
      return NextResponse.json({ error: 'RIOT_API_KEY is not configured on the server.' }, { status: 500 });
    }

    if (!riotId || !region) {
      return NextResponse.json({ error: 'Missing riotId or region' }, { status: 400 });
    }

    const [gameName, tagLine] = riotId.split('#');
    if (!gameName || !tagLine) {
      return NextResponse.json({ error: 'Invalid Riot ID format. Expected Name#Tag' }, { status: 400 });
    }

    const routingValue = getRoutingValue(region);
    const platformRoutingValue = getPlatformRoutingValue(region);

    // 1. Get PUUID from Account V1
    const accountRes = await fetch(
      `https://${routingValue}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers: { 'X-Riot-Token': API_KEY } }
    );

    if (accountRes.status === 404) {
      return NextResponse.json({ error: 'Summoner not found on this server. Check name and tag.' }, { status: 404 });
    }
    if (!accountRes.ok) throw new Error(`Riot API Error: ${accountRes.statusText}`);

    const accountData = await accountRes.json();
    const puuid = accountData.puuid;

    // 2. Get Summoner Details from Summoner V4
    const summonerRes = await fetch(
      `https://${platformRoutingValue}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { 'X-Riot-Token': API_KEY } }
    );

    if (!summonerRes.ok) throw new Error('The username or server is incorrect.');

    const summonerData = await summonerRes.json();

    return NextResponse.json({
      riotId: `${accountData.gameName}#${accountData.tagLine}`,
      region: region.toUpperCase(),
      puuid: puuid,
      summonerLevel: summonerData.summonerLevel,
      profileIconId: summonerData.profileIconId,
    });

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
