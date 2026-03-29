/**
 * Quick test to verify your OpenAI API key works with DALL-E 3.
 *
 * Usage:
 *   npx tsx scripts/test-openai-key.ts
 *
 * Reads OPENAI_API_KEY from .env.local
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;

  console.log('--- OpenAI API Key Test ---\n');

  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set in .env.local');
    process.exit(1);
  }

  console.log(`Key prefix: ${apiKey.slice(0, 10)}...${apiKey.slice(-4)}`);
  console.log(`Key length: ${apiKey.length} characters`);
  console.log(`Key format: ${apiKey.startsWith('sk-proj-') ? 'Project key' : apiKey.startsWith('sk-') ? 'User key' : 'Unknown format'}\n`);

  // Test 1: List models (cheapest API call possible)
  console.log('Test 1: Checking API access (list models)...');
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      const err = await res.json();
      console.error(`FAILED: ${res.status} — ${err.error?.message || JSON.stringify(err)}`);
      if (res.status === 401) {
        console.error('\nYour API key is invalid. Common causes:');
        console.error('  - Key was copied with extra spaces or line breaks');
        console.error('  - Key was revoked or expired');
        console.error('  - Key belongs to a different organization');
        console.error('\nCheck: https://platform.openai.com/api-keys');
      }
      process.exit(1);
    }
    console.log('OK — API key is valid\n');
  } catch (err) {
    console.error(`FAILED: Network error — ${err}`);
    process.exit(1);
  }

  // Test 2: Check if DALL-E 3 is available
  console.log('Test 2: Generating a tiny DALL-E 3 image (costs ~$0.04)...');
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: 'A simple yellow star on a white background',
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error(`FAILED: ${res.status} — ${err.error?.message || JSON.stringify(err)}`);
      if (res.status === 429) {
        console.error('\nRate limited or no billing. Check:');
        console.error('  https://platform.openai.com/settings/organization/billing');
      }
      if (res.status === 403) {
        console.error('\nYour key does not have access to DALL-E 3.');
        console.error('Project keys may have restricted permissions.');
        console.error('Try creating a "User key" instead of a "Project key".');
      }
      process.exit(1);
    }

    const data = await res.json();
    console.log(`OK — Image generated: ${data.data[0].url.slice(0, 60)}...`);
    console.log('\n--- ALL TESTS PASSED ---');
    console.log('Your key works! DALL-E 3 is ready to use.');
  } catch (err) {
    console.error(`FAILED: ${err}`);
    process.exit(1);
  }
}

main();
