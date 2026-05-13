const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
const API_KEY = process.env.RIOT_API_KEY;

async function testRank() {
  const summonerId = 'vXg61y99hH0Xj_L7mZ6r8_g78_P7lR-c-zU4jNqXwXhVJQ'; // this is an example, let's just do a full lookup
  // wait, we need to know what region the user logged in as.
  // let's just fetch MakerLoL94's rank.
  const name = 'MakerLoL94';
  const tag = 'LAS'; // or whatever tag they use.
  
  // Actually we can just write a quick script that uses the real API KEY and looks them up.
  console.log('Testing...');
}
testRank();
