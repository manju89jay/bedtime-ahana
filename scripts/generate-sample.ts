/**
 * Generate a sample book using the v2 pipeline.
 * Child: Ahana, bilingual, kindergarten-first-day template.
 *
 * Usage: USE_STUBS=true npx tsx scripts/generate-sample.ts
 */

import type { StoryConfig } from '../types/template';

async function main() {
  // Force stub mode
  process.env.USE_STUBS = 'true';

  // Dynamic imports to pick up env
  const { generateBook } = await import('../lib/services/book-service');
  const { promises: fs } = await import('fs');
  const path = await import('path');

  const config: StoryConfig = {
    childName: 'Ahana',
    childAge: 4,
    childGender: 'girl',
    characterRefId: 'cs-ahana-001',
    familyMembers: [
      { name: 'Papa', role: 'papa' },
      { name: 'Mama', role: 'mama' },
      { name: 'Shreya', role: 'sister' },
    ],
    city: 'Ulm',
    companionObject: 'plush bunny Hoppel',
    language: 'bilingual',
    tonePreset: 'gentle',
    ageVocabulary: 'preschool',
  };

  console.log('Generating sample book (Ahana, bilingual, kindergarten)...');
  const result = await generateBook(config, 'kindergarten-first-day', 'cp-ahana-001');

  // Save book JSON
  const booksDir = path.join(process.cwd(), 'data', 'books');
  await fs.mkdir(booksDir, { recursive: true });
  const bookPath = path.join(booksDir, `${result.book.id}.json`);
  await fs.writeFile(bookPath, JSON.stringify(result.book, null, 2), 'utf-8');

  console.log(`Book ID: ${result.book.id}`);
  console.log(`Template: ${result.book.templateId}`);
  console.log(`Pages: ${result.book.pages.length}`);
  console.log(`Language: ${result.book.language}`);
  console.log(`Status: ${result.book.status}`);
  console.log(`Compliance: ${result.complianceCheck.passed ? 'PASSED' : 'FAILED'}`);
  if (result.complianceCheck.warnings.length > 0) {
    console.log(`Warnings: ${result.complianceCheck.warnings.join(', ')}`);
  }
  console.log(`Saved to: ${bookPath}`);
  console.log(`Images saved to: public/generated/${result.book.id}/`);
  console.log('');
  console.log('Sample pages:');
  for (const page of result.book.pages.slice(0, 3)) {
    console.log(`  Page ${page.pageNumber}: EN="${(page.text.en ?? '').slice(0, 60)}..." DE="${(page.text.de ?? '').slice(0, 60)}..."`);
  }
  console.log(`  ... and ${result.book.pages.length - 3} more pages`);
}

main().catch((error) => {
  console.error('Failed to generate sample book:', error);
  process.exitCode = 1;
});
