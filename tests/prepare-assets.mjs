// One-time lossless-to-delivery conversion; generation provenance is in docs/dagobah-art.md.
import sharp from "sharp";
await sharp("public/pixel/dagobah-background.png").resize(1280, 720).webp({ quality: 88 }).toFile("public/pixel/dagobah-background.webp");
