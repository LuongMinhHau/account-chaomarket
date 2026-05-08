/**
 * Workaround: Next.js 16 Turbopack + standalone output doesn't generate
 * middleware.js.nft.json, causing ENOENT during "Finalizing page optimization".
 *
 * This script watches for .next/server/ creation and continuously ensures
 * the stub file exists until the build process completes.
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const NFT_PATH = join('.next', 'server', 'middleware.js.nft.json');
const NFT_CONTENT = JSON.stringify({ version: 1, files: [] });

function ensureNft() {
    try {
        const dir = join('.next', 'server');
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        // Turbopack Edge middleware doesn't emit these files,
        // but standalone output expects them during finalization
        if (!existsSync(join(dir, 'middleware.js.nft.json'))) {
            writeFileSync(NFT_PATH, NFT_CONTENT);
        }
        if (!existsSync(join(dir, 'middleware.js'))) {
            writeFileSync(join(dir, 'middleware.js'), '// stub — Edge middleware bundled separately\n');
        }
    } catch {
        // Ignore — directory might not exist yet
    }
}

// Poll every 500ms for 5 minutes
const interval = setInterval(ensureNft, 500);
setTimeout(() => clearInterval(interval), 5 * 60 * 1000);

// Also create immediately
ensureNft();
