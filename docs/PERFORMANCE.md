# Performance Review

## 1. Parallelize per-page asset generation in the create flow
- **Observation**: `handleCreate` awaits image and TTS requests sequentially for every outline beat, stretching total generation time as the network latency stacks per page.【F:app/create/page.tsx†L55-L106】
- **Improvement**: Fire both requests concurrently once the page text is ready; they do not depend on each other beyond the shared payload.
```diff
diff --git a/app/create/page.tsx b/app/create/page.tsx
@@
-        const imageRes = await fetch("/api/image", {
-          method: "POST",
-          headers: { "Content-Type": "application/json" },
-          body: JSON.stringify({
-            pageNo: pageBeat.pageNo,
-            characterVisuals: characterCard.visualStyle,
-            sceneSummary: pageBeat.summary,
-            bookId
-          })
-        });
-        if (!imageRes.ok) throw new Error("Image prompt failed");
-        const imageJson = await imageRes.json();
-
-        setStatus(`Synthesizing narration for page ${pageBeat.pageNo}...`);
-        const ttsRes = await fetch("/api/tts", {
-          method: "POST",
-          headers: { "Content-Type": "application/json" },
-          body: JSON.stringify({
-            text: pageJson.text,
-            language: formValues.language,
-            voice: "calm-parent",
-            bookId,
-            pageNo: pageBeat.pageNo
-          })
-        });
-        if (!ttsRes.ok) throw new Error("Audio generation failed");
-        const ttsJson = await ttsRes.json();
+        setStatus(`Creating assets for page ${pageBeat.pageNo}...`);
+        const [imageRes, ttsRes] = await Promise.all([
+          fetch("/api/image", {
+            method: "POST",
+            headers: { "Content-Type": "application/json" },
+            body: JSON.stringify({
+              pageNo: pageBeat.pageNo,
+              characterVisuals: characterCard.visualStyle,
+              sceneSummary: pageBeat.summary,
+              bookId
+            })
+          }),
+          fetch("/api/tts", {
+            method: "POST",
+            headers: { "Content-Type": "application/json" },
+            body: JSON.stringify({
+              text: pageJson.text,
+              language: formValues.language,
+              voice: "calm-parent",
+              bookId,
+              pageNo: pageBeat.pageNo
+            })
+          })
+        ]);
+        if (!imageRes.ok) throw new Error("Image prompt failed");
+        if (!ttsRes.ok) throw new Error("Audio generation failed");
+        const [imageJson, ttsJson] = await Promise.all([imageRes.json(), ttsRes.json()]);
```
- **Impact**: Cuts roughly one network round trip per page (~2× speedup for asset stage) with minimal risk; still serial per page to preserve progress messaging.

## 2. Batch filesystem reads when listing books
- **Observation**: `listBooks` iterates with `await fs.readFile` inside the loop, leading to sequential disk I/O when many books exist.【F:lib/storage.ts†L34-L48】
- **Improvement**: Read candidate files in parallel via `Promise.allSettled`, then filter/parse results to keep warnings intact.
```diff
diff --git a/lib/storage.ts b/lib/storage.ts
@@
-  const books: Book[] = [];
-  for (const file of files) {
-    if (!file.endsWith(".json")) continue;
-    const raw = await fs.readFile(path.join(BOOKS_DIR, file), "utf-8");
-    try {
-      const book = JSON.parse(raw) as Book;
-      books.push(book);
-    } catch (error) {
-      console.warn(`Skipping invalid book file ${file}`, error);
-    }
-  }
+  const books: Book[] = [];
+  const candidates = files.filter((file) => file.endsWith(".json"));
+  const reads = await Promise.allSettled(
+    candidates.map((file) => fs.readFile(path.join(BOOKS_DIR, file), "utf-8"))
+  );
+  reads.forEach((result, index) => {
+    const file = candidates[index];
+    if (result.status !== "fulfilled") {
+      console.warn(`Skipping unreadable book file ${file}`, result.reason);
+      return;
+    }
+    try {
+      books.push(JSON.parse(result.value) as Book);
+    } catch (error) {
+      console.warn(`Skipping invalid book file ${file}`, error);
+    }
+  });
```
- **Impact**: Improves cold-start listing latency, especially as stored books grow; risk is low because warnings already guard malformed files.

## 3. Avoid redundant disk writes on unchanged book saves
- **Observation**: `saveBook` overwrites the JSON file every time it is called, even if the serialized payload has not changed—`ReaderNav` triggers this on blur after each edit and on load stamping.【F:lib/storage.ts†L14-L19】【F:components/ReaderNav.tsx†L34-L59】
- **Improvement**: Compare existing file contents before writing; skip the write when no diff is detected.
```diff
diff --git a/lib/storage.ts b/lib/storage.ts
@@
 export async function saveBook(book: Book) {
   await ensureBookDirs(book.bookId);
   const filePath = path.join(BOOKS_DIR, `${book.bookId}.json`);
-  const json = JSON.stringify(book, null, 2);
-  await fs.writeFile(filePath, json, "utf-8");
+  const json = JSON.stringify(book, null, 2);
+  try {
+    const existing = await fs.readFile(filePath, "utf-8");
+    if (existing === json) {
+      return;
+    }
+  } catch (error: any) {
+    if (error.code !== "ENOENT") {
+      throw error;
+    }
+  }
+  await fs.writeFile(filePath, json, "utf-8");
 }
```
- **Impact**: Reduces unnecessary disk churn during reader edits and initial saves; low risk because it still writes when the file is missing or diverges.
