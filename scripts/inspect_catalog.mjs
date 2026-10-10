import fs from 'fs';

const flowerCode = fs.readFileSync('data/flowers.ts', 'utf-8');
const flowerMatches = [...flowerCode.matchAll(/\{\s*id:\s*["']([^"']+)["'][\s\S]*?\n\s*\},?/g)];
const allFlowers = [];
const vipFlowers = [];

for (const m of flowerMatches) {
  const str = m[0];
  const id = str.match(/id:\s*["']([^"']+)["']/)?.[1];
  const name = str.match(/name:\s*["']([^"']+)["']/)?.[1];
  const isVip = str.includes('isPremium: true');
  if (id && name) {
    allFlowers.push({ id, name, isVip });
    if (isVip) vipFlowers.push({ id, name });
  }
}

const bucketCode = fs.readFileSync('data/buckets.ts', 'utf-8');
const bucketMatches = [...bucketCode.matchAll(/\{\s*id:\s*["']([^"']+)["'][\s\S]*?\n\s*\},?/g)];
const allBuckets = [];
const vipBuckets = [];

for (const m of bucketMatches) {
  const str = m[0];
  const id = str.match(/id:\s*["']([^"']+)["']/)?.[1];
  const label = str.match(/label:\s*["']([^"']+)["']/)?.[1];
  const isVip = str.includes('isPremium: true');
  if (id && label) {
    allBuckets.push({ id, label, isVip });
    if (isVip) vipBuckets.push({ id, label });
  }
}

console.log(`Total flowers: ${allFlowers.length}, VIP flowers: ${vipFlowers.length}`);
console.log('VIP flowers:', JSON.stringify(vipFlowers, null, 2));

console.log(`Total buckets: ${allBuckets.length}, VIP buckets: ${vipBuckets.length}`);
console.log('VIP buckets:', JSON.stringify(vipBuckets, null, 2));
