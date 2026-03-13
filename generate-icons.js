const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
  ]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * stride, y * stride + stride);
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function drawIcon(size) {
  const data = Buffer.alloc(size * size * 4, 0);

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  }

  function blendPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    const dstA = data[i + 3] / 255;
    const srcA = a / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA <= 0) return;
    data[i] = Math.round((r * srcA + data[i] * dstA * (1 - srcA)) / outA);
    data[i + 1] = Math.round((g * srcA + data[i + 1] * dstA * (1 - srcA)) / outA);
    data[i + 2] = Math.round((b * srcA + data[i + 2] * dstA * (1 - srcA)) / outA);
    data[i + 3] = Math.round(outA * 255);
  }

  const radius = size * 0.22;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = x / (size - 1);
      const ny = y / (size - 1);

      const c1 = [27, 162, 222];
      const c2 = [17, 97, 238];
      const c3 = [32, 201, 151];
      const top = [
        c1[0] * (1 - nx) + c2[0] * nx,
        c1[1] * (1 - nx) + c2[1] * nx,
        c1[2] * (1 - nx) + c2[2] * nx
      ];
      const rgb = [
        top[0] * (1 - ny) + c3[0] * ny,
        top[1] * (1 - ny) + c3[1] * ny,
        top[2] * (1 - ny) + c3[2] * ny
      ];

      const dx = Math.min(x, size - 1 - x);
      const dy = Math.min(y, size - 1 - y);
      let alpha = 255;
      if (dx < radius && dy < radius) {
        const cx = radius - dx - 1;
        const cy = radius - dy - 1;
        if (cx * cx + cy * cy > (radius - 1) * (radius - 1)) alpha = 0;
      }
      if (alpha > 0) setPixel(x, y, rgb[0], rgb[1], rgb[2], alpha);
    }
  }

  const glowY = size * 0.2;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x - size * 0.25;
      const dy = y - glowY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const g = Math.max(0, 1 - dist / (size * 0.7));
      if (g > 0) blendPixel(x, y, 255, 255, 255, Math.round(g * 38));
    }
  }

  const cx = size * 0.5;
  const cy = size * 0.5;
  const headR = size * 0.22;
  const bodyW = size * 0.34;
  const bodyH = size * 0.26;
  const bodyX0 = Math.round(cx - bodyW / 2);
  const bodyY0 = Math.round(cy + headR * 0.25);
  const bodyRadius = Math.max(2, Math.round(size * 0.05));

  for (let y = Math.floor(cy - headR); y <= Math.ceil(cy + headR); y += 1) {
    for (let x = Math.floor(cx - headR); x <= Math.ceil(cx + headR); x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= headR * headR) {
        setPixel(x, y, 245, 249, 255, 255);
      }
    }
  }

  for (let y = bodyY0; y < bodyY0 + bodyH; y += 1) {
    for (let x = bodyX0; x < bodyX0 + bodyW; x += 1) {
      const dx = Math.min(x - bodyX0, bodyX0 + bodyW - 1 - x);
      const dy = Math.min(y - bodyY0, bodyY0 + bodyH - 1 - y);
      if (dx >= bodyRadius || dy >= bodyRadius) {
        setPixel(x, y, 245, 249, 255, 255);
      } else {
        const qx = bodyRadius - dx - 1;
        const qy = bodyRadius - dy - 1;
        if (qx * qx + qy * qy <= (bodyRadius - 1) * (bodyRadius - 1)) {
          setPixel(x, y, 245, 249, 255, 255);
        }
      }
    }
  }

  const eyeR = Math.max(1, Math.round(size * 0.016));
  const eyeY = Math.round(cy - headR * 0.2);
  const eyeDX = Math.round(headR * 0.38);
  for (const ex of [Math.round(cx - eyeDX), Math.round(cx + eyeDX)]) {
    for (let y = eyeY - eyeR; y <= eyeY + eyeR; y += 1) {
      for (let x = ex - eyeR; x <= ex + eyeR; x += 1) {
        const dx = x - ex;
        const dy = y - eyeY;
        if (dx * dx + dy * dy <= eyeR * eyeR) setPixel(x, y, 22, 35, 72, 255);
      }
    }
  }

  const antennaY = Math.round(cy - headR * 0.88);
  const antennaLen = Math.max(2, Math.round(size * 0.09));
  for (let i = 0; i < antennaLen; i += 1) {
    setPixel(Math.round(cx - headR * 0.45) - i, antennaY - i, 245, 249, 255, 255);
    setPixel(Math.round(cx + headR * 0.45) + i, antennaY - i, 245, 249, 255, 255);
  }

  const uaText = [
    "  ##   ##   ",
    " ## ## ##   ",
    "##   ###    ",
    "##   ###    ",
    "##   ###    ",
    " ## ## ##   ",
    "  ##   ##   "
  ];
  const pixelSize = Math.max(1, Math.round(size * 0.015));
  const textStartX = Math.round(cx - (uaText[0].length * pixelSize) / 2);
  const textStartY = Math.round(bodyY0 + bodyH * 0.35);

  for (let row = 0; row < uaText.length; row += 1) {
    for (let col = 0; col < uaText[row].length; col += 1) {
      if (uaText[row][col] !== "#") continue;
      for (let py = 0; py < pixelSize; py += 1) {
        for (let px = 0; px < pixelSize; px += 1) {
          setPixel(textStartX + col * pixelSize + px, textStartY + row * pixelSize + py, 23, 113, 185, 255);
        }
      }
    }
  }

  return data;
}

function writeIcon(size) {
  const rgba = drawIcon(size);
  const png = encodePng(size, size, rgba);
  const outPath = path.join(__dirname, `icon${size}.png`);
  fs.writeFileSync(outPath, png);
}

[16, 32, 48, 128].forEach(writeIcon);
console.log("Icons generated: icon16.png, icon32.png, icon48.png, icon128.png");
