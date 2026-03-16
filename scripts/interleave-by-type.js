#!/usr/bin/env node
/**
 * Interleaves cards by type so no two cards of the same type are consecutive.
 * Shuffles within each type group for variety.
 */

const fs = require('fs');
const path = require('path');

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function interleaveByType(cards) {
  const byType = {};
  for (const card of cards) {
    const t = card.type || 'UNKNOWN';
    if (!byType[t]) byType[t] = [];
    byType[t].push(card);
  }
  // Shuffle each group
  const groups = Object.entries(byType).map(([type, items]) => ({
    type,
    items: shuffle(items),
  }));
  // Sort by size descending (largest first) for better interleaving
  groups.sort((a, b) => b.items.length - a.items.length);

  const result = [];
  let idx = 0;
  while (result.length < cards.length) {
    for (const g of groups) {
      if (idx < g.items.length) {
        result.push(g.items[idx]);
      }
    }
    idx++;
  }
  return result;
}

const dataDir = path.join(__dirname, '..', 'data');
const files = ['sva-pitanja-1.json', 'sva-pitanja-2.json'];

for (const file of files) {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`Skip ${file}: not found`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.cards = interleaveByType(data.cards);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Interleaved ${file}: ${data.cards.length} cards`);
}
