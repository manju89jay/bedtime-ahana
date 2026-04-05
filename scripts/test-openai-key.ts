/**
 * Quick test to verify your OpenAI API key works with GPT Image.
 *
 * Usage:
 *   pnpm tsx scripts/test-openai-key.ts
 *
 * Reads OPENAI_API_KEY from .env.local
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5';

  console.log('--- OpenAI API Key Test ---\n');

  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set in .env.local');
    process.exit(1);
  }

  console.log(`Key prefix: ${apiKey.slice(0, 10)}...${apiKey.slice(-4)}`);
  console.log(`Key length: ${apiKey.length} characters`);
  console.log(`Key format: ${apiKey.startsWith('sk-proj-') ? 'Project key' : apiKey.startsWith('sk-') ? 'User key' : 'Unknown format'}`);
  console.log(`Image model: ${model}\n`);

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

  // Test 2: Generate a tiny GPT Image
  console.log(`Test 2: Generating a GPT Image (model: ${model})...`);
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: 'A simple yellow star on a white background',
        n: 1,
        size: '1024x1024',
        quality: 'low',
        output_format: 'png',
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
        console.error('\nYour key does not have access to image generation.');
        console.error('Project keys may have restricted permissions.');
        console.error('Try creating a "User key" instead of a "Project key".');
      }
      process.exit(1);
    }

    const data = await res.json();
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) {
      console.error('FAILED: No b64_json in response');
      console.error('Response keys:', JSON.stringify(Object.keys(data.data?.[0] || {})));
      process.exit(1);
    }

    const sizeKb = Math.round(Buffer.from(b64, 'base64').length / 1024);
    console.log(`OK — Image generated (${sizeKb} KB)`);
    console.log('\n--- ALL TESTS PASSED ---');
    console.log(`Your key works! GPT Image (${model}) is ready to use.`);
  } catch (err) {
    console.error(`FAILED: ${err}`);
    process.exit(1);
  }
}

main();
