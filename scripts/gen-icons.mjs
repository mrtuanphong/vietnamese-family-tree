import sharp from "sharp";

function makeSvg(size) {
  const r = Math.round(size * 0.12);
  const cx = size / 2;
  const trunkW = Math.round(size * 0.08);
  const trunkH = Math.round(size * 0.22);
  const trunkX = cx - trunkW / 2;
  const trunkY = Math.round(size * 0.72);
  const c1r = Math.round(size * 0.18);
  const c2r = Math.round(size * 0.22);
  const c1y = Math.round(size * 0.62);
  const c2y = Math.round(size * 0.46);
  const c3y = Math.round(size * 0.30);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#0d9488"/>
  <rect x="${trunkX}" y="${trunkY}" width="${trunkW}" height="${trunkH}" fill="white"/>
  <circle cx="${cx}" cy="${c1y}" r="${c1r}" fill="white"/>
  <circle cx="${cx}" cy="${c2y}" r="${c2r}" fill="white"/>
  <circle cx="${cx}" cy="${c3y}" r="${c1r}" fill="white"/>
</svg>`;
}

await sharp(Buffer.from(makeSvg(192))).png().toFile("public/icons/icon-192.png");
await sharp(Buffer.from(makeSvg(512))).png().toFile("public/icons/icon-512.png");
console.log("Icons generated.");
