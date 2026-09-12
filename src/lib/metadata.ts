export interface Extraction {
  title?: string;
  artist?: string;
  album?: string;
  artwork?: Uint8Array;
  artworkMime?: string;
}

function decodeLatin1(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
  return out;
}

let decoder: TextDecoder | null = null;

function decodeUtf8(bytes: Uint8Array): string {
  try {
    if (typeof TextDecoder !== 'undefined') {
      if (!decoder) decoder = new TextDecoder('utf-8', { fatal: false });
      return decoder.decode(bytes);
    }
  } catch {
    return fallbackUtf8(bytes);
  }
  return fallbackUtf8(bytes);
}

function fallbackUtf8(bytes: Uint8Array): string {
  let out = '';
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    if (b < 0x80) {
      out += String.fromCharCode(b);
      i += 1;
    } else if (b >= 0xc0 && b < 0xe0) {
      out += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
      i += 2;
    } else if (b >= 0xe0) {
      out += String.fromCharCode(
        ((b & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f),
      );
      i += 3;
    } else {
      i += 1;
    }
  }
  return out;
}

function decodeUtf16(bytes: Uint8Array, little: boolean): string {
  let out = '';
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    const code = little ? bytes[i] | (bytes[i + 1] << 8) : (bytes[i] << 8) | bytes[i + 1];
    if (code === 0) break;
    if (code >= 0xd800 && code <= 0xdbff && i + 3 < bytes.length) {
      const low = little ? bytes[i + 2] | (bytes[i + 3] << 8) : (bytes[i + 2] << 8) | bytes[i + 3];
      if (low >= 0xdc00 && low <= 0xdfff) {
        out += String.fromCodePoint(0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00));
        i += 2;
        continue;
      }
    }
    out += String.fromCharCode(code);
  }
  return out;
}

function decodeText(bytes: Uint8Array, encoding: number): string {
  if (bytes.length === 0) return '';
  switch (encoding) {
    case 0:
      return decodeLatin1(bytes);
    case 1: {
      if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe)
        return decodeUtf16(bytes.subarray(2), true);
      if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff)
        return decodeUtf16(bytes.subarray(2), false);
      return decodeUtf16(bytes, true);
    }
    case 2:
      return decodeUtf16(bytes, false);
    case 3:
    default:
      return decodeUtf8(bytes);
  }
}

class SD {
  constructor(public b: Uint8Array) {}

  u8(o: number): number {
    return this.b[o] ?? 0;
  }

  u32le(o: number): number {
    return (
      ((this.b[o] ?? 0) |
        ((this.b[o + 1] ?? 0) << 8) |
        ((this.b[o + 2] ?? 0) << 16) |
        ((this.b[o + 3] ?? 0) << 24)) >>>
      0
    );
  }

  u32be(o: number): number {
    return (
      (((this.b[o] ?? 0) << 24) |
        ((this.b[o + 1] ?? 0) << 16) |
        ((this.b[o + 2] ?? 0) << 8) |
        (this.b[o + 3] ?? 0)) >>>
      0
    );
  }

  syncsafe(o: number): number {
    return (
      ((this.b[o] ?? 0) & 0x7f) * 0x200000 +
      ((this.b[o + 1] ?? 0) & 0x7f) * 0x4000 +
      ((this.b[o + 2] ?? 0) & 0x7f) * 0x80 +
      ((this.b[o + 3] ?? 0) & 0x7f)
    );
  }

  ascii(o: number, len: number): string {
    let out = '';
    for (let i = 0; i < len && o + i < this.b.length; i++) {
      const c = this.b[o + i];
      if (c === 0) break;
      out += String.fromCharCode(c);
    }
    return out;
  }
}

function findNul(b: Uint8Array, from: number): number {
  for (let i = from; i < b.length; i++) if (b[i] === 0) return i - from;
  return -1;
}

function seekUtf16Nul(b: Uint8Array, from: number): number {
  for (let i = from; i + 1 < b.length; i += 2) {
    const code = b[i] | (b[i + 1] << 8);
    if (code === 0) return i;
  }
  return -1;
}

function clean(v: string | undefined | null): string | undefined {
  if (!v) return undefined;
  const out = v.replace(/\u0000+/g, ' ').replace(/\s+/g, ' ').trim();
  return out || undefined;
}

export function parseMetadata(fileName: string, data: ArrayBuffer): Extraction {
  const b = new Uint8Array(data);
  if (b.length < 4) return {};
  const s = new SD(b);

  if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) {
    return parseId3v2(b) ?? parseId3v1(b) ?? {};
  }

  if (s.ascii(0, 4) === 'fLaC') return parseFlac(b) ?? {};
  if (s.ascii(0, 4) === 'OggS') return parseOgg(b) ?? {};
  if (findFourCc(b, 'ftyp') >= 0) return parseMp4(b) ?? {};

  if (fileName.toLowerCase().endsWith('.mp3')) {
    return parseId3v2(b) ?? parseId3v1(b) ?? {};
  }

  return {};
}

function parseId3v2(b: Uint8Array): Extraction | null {
  if (b.length < 10) return null;
  if (b[0] !== 0x49 || b[1] !== 0x44 || b[2] !== 0x33) return null;
  const s = new SD(b);
  const major = s.u8(3);
  const tagSize = s.syncsafe(6);
  const end = Math.min(b.length, 10 + tagSize);
  let pos = 10;

  if ((b[5] & 0x40) !== 0 && end >= pos + 4) {
    pos += (major === 4 ? s.syncsafe(pos) : s.u32be(pos)) + 4;
  }
  if ((b[5] & 0x80) !== 0) pos += 1;

  const result: Extraction = {};
  while (pos < end - 10 && b[pos] !== 0) {
    if (major === 2) {
      const id = s.ascii(pos, 3);
      const len = (b[pos + 3] << 16) | (b[pos + 4] << 8) | b[pos + 5];
      const dataStart = pos + 6;
      applyText(result, id, b.subarray(dataStart, Math.min(end, dataStart + len)));
      pos = Math.min(end, dataStart + len);
    } else {
      const id = s.ascii(pos, 4);
      const len = major === 4 ? s.syncsafe(pos + 4) : s.u32be(pos + 4);
      const dataStart = pos + 10;
      const dataEnd = Math.min(end, dataStart + len);
      if (id === 'APIC') {
        const art = parseApic(b.subarray(dataStart, dataEnd));
        if (art) {
          result.artwork = art.bytes;
          result.artworkMime = art.mime;
        }
      } else {
        applyText(result, id, b.subarray(dataStart, dataEnd));
      }
      pos = dataEnd;
    }
  }
  return result.title || result.artist || result.album || result.artwork ? result : null;
}

function applyText(result: Extraction, id: string, data: Uint8Array) {
  if (data.length < 1) return;
  const text = clean(decodeText(data.subarray(1), data[0]));
  if (!text) return;
  if ((id === 'TIT2' || id === 'TT2') && !result.title) result.title = text;
  if ((id === 'TPE1' || id === 'TP1') && !result.artist) result.artist = text;
  if ((id === 'TALB' || id === 'TAL') && !result.album) result.album = text;
}

function parseApic(data: Uint8Array): { mime: string; bytes: Uint8Array } | null {
  if (data.length < 8) return null;
  const enc = data[0];
  let pos = 1;
  const mimeLen = findNul(data, pos);
  if (mimeLen < 0) return null;
  const mime = decodeLatin1(data.subarray(pos, pos + mimeLen)).toLowerCase() || 'image/jpeg';
  pos += mimeLen + 1;
  pos += 1;
  const descEnd = findNul(data, pos);
  if (descEnd < 0) return null;
  pos += descEnd + 1;
  if (enc === 1) {
    const u = seekUtf16Nul(data, pos);
    if (u >= 0) pos = u + 2;
  }
  const bytes = data.subarray(pos);
  if (bytes.length === 0) return null;
  return { mime, bytes };
}

function parseId3v1(b: Uint8Array): Extraction | null {
  if (b.length < 128) return null;
  const s = new SD(b.subarray(b.length - 128));
  if (s.ascii(0, 3) !== 'TAG') return null;
  const title = clean(s.ascii(3, 30));
  const artist = clean(s.ascii(33, 30));
  const album = clean(s.ascii(63, 30));
  if (!title && !artist && !album) return null;
  return { title, artist, album };
}

function parseFlac(b: Uint8Array): Extraction | null {
  const s = new SD(b);
  const result: Extraction = {};
  let pos = 4;
  while (pos + 4 <= b.length) {
    const header = s.u32be(pos);
    const last = (header & 0x80000000) !== 0;
    const type = (header >> 24) & 0x7f;
    const length = header & 0x00ffffff;
    const bodyEnd = pos + 4 + length;
    if (bodyEnd > b.length) break;
    if (type === 4) {
      parseVorbisComments(b.subarray(pos + 4, bodyEnd), result);
    } else if (type === 6) {
      const art = parseFlacPicture(b.subarray(pos + 4, bodyEnd));
      if (art) {
        result.artwork = art.bytes;
        result.artworkMime = art.mime;
      }
    }
    pos = bodyEnd;
    if (last) break;
  }
  return result.title || result.artist || result.album || result.artwork ? result : null;
}

function parseVorbisComments(data: Uint8Array, result: Extraction) {
  const s = new SD(data);
  let pos = 0;
  const vendorLen = s.u32le(pos);
  pos += 4 + vendorLen;
  const count = s.u32le(pos);
  pos += 4;
  for (let i = 0; i < count && pos + 4 <= data.length; i++) {
    const len = s.u32le(pos);
    pos += 4;
    if (pos + len > data.length) break;
    const entry = decodeUtf8(data.subarray(pos, pos + len));
    pos += len;
    const eq = entry.indexOf('=');
    if (eq < 0) continue;
    const key = entry.slice(0, eq).toUpperCase();
    const value = entry.slice(eq + 1);
    if (key === 'TITLE' && !result.title) result.title = value;
    if (key === 'ARTIST' && !result.artist) result.artist = value;
    if (key === 'ALBUM' && !result.album) result.album = value;
  }
}

function parseFlacPicture(data: Uint8Array): { bytes: Uint8Array; mime: string } | null {
  const s = new SD(data);
  let pos = 4;
  const mimeLen = s.u32le(pos);
  pos += 4;
  if (pos + mimeLen > data.length) return null;
  const mime = decodeLatin1(data.subarray(pos, pos + mimeLen)).toLowerCase() || 'image/jpeg';
  pos += mimeLen;
  const descLen = s.u32le(pos);
  pos += 4 + descLen + 16;
  const dataLen = s.u32le(pos);
  pos += 4;
  if (pos + dataLen > data.length) return null;
  return { mime, bytes: data.subarray(pos, pos + dataLen) };
}

function parseOgg(b: Uint8Array): Extraction | null {
  const result: Extraction = {};
  let pos = 0;
  let attempts = 0;
  while (pos + 27 <= b.length && attempts < 12) {
    if (!(b[pos] === 0x4f && b[pos + 1] === 0x67 && b[pos + 2] === 0x67 && b[pos + 3] === 0x53)) break;
    const s = new SD(b);
    const segments = b[pos + 26];
    const payload = pos + 27 + segments;
    if (payload + 2 > b.length) break;
    let packetLen = 0;
    let li = 0;
    while (li < segments && packetLen <= 8192) {
      const l = b[pos + 27 + li];
      packetLen += l;
      li += 1;
      if (l < 255) break;
    }
    if (packetLen > 0 && b[payload] === 0x03) {
      const s2 = new SD(b.subarray(payload));
      const vendorLen = s2.u32le(7);
      const count = s2.u32le(11 + vendorLen);
      let p = 15 + vendorLen;
      for (let i = 0; i < count && p + 4 < b.length - payload; i++) {
        const len = s2.u32le(p);
        p += 4;
        if (p + len > b.length - payload) break;
        const entry = decodeUtf8(b.subarray(payload + p, payload + p + len));
        p += len;
        const eq = entry.indexOf('=');
        if (eq < 0) continue;
        const key = entry.slice(0, eq).toUpperCase();
        const value = entry.slice(eq + 1);
        if (key === 'TITLE' && !result.title) result.title = value;
        if (key === 'ARTIST' && !result.artist) result.artist = value;
        if (key === 'ALBUM' && !result.album) result.album = value;
      }
    }
    pos = payload + packetLen;
    attempts += 1;
    if (result.title || result.artist || result.album) return result;
  }
  return result.title || result.artist || result.album ? result : null;
}

function findFourCc(b: Uint8Array, want: string): number {
  const w = new Uint8Array(want.split('').map((c) => c.charCodeAt(0)));
  for (let i = 0; i + 8 <= b.length; i++) {
    let ok = true;
    for (let j = 0; j < 4; j++) {
      if (b[i + 4 + j] !== w[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return i;
  }
  return -1;
}

function parseMp4(b: Uint8Array): Extraction | null {
  const s = new SD(b);
  const result: Extraction = {};
  const boxes: { start: number; end: number; label: string }[] = [];
  let pos = 0;
  while (pos + 8 <= b.length) {
    const size = s.u32be(pos);
    const label = s.ascii(pos + 4, 4);
    if (size < 8 || pos + size > b.length) break;
    boxes.push({ start: pos + 8, end: pos + size, label });
    pos += size;
    if (size === 0) break;
  }
  const moov = boxes.find((x) => x.label === 'moov');
  if (!moov) return null;
  parseMp4Container(b, moov.start, moov.end, result);
  return result.title || result.artist || result.album || result.artwork ? result : null;
}

function parseMp4Container(b: Uint8Array, start: number, end: number, result: Extraction) {
  let pos = start;
  let guard = 0;
  while (pos + 8 <= end && guard < 200) {
    guard += 1;
    const s = new SD(b);
    const size = s.u32be(pos);
    const label = s.ascii(pos + 4, 4);
    if (size < 8 || pos + size > end + 8) break;
    const bodyStart = pos + 8;
    const bodyEnd = pos + size;
    if (label === '\u00A9nam' || label === '\u00A9ART' || label === '\u00A9alb' || label === 'covr') {
      const val = parseMp4MetaItem(b, bodyStart, bodyEnd);
      if (val !== undefined && typeof val === 'string') {
        if (label === '\u00A9nam' && !result.title) result.title = val;
        if (label === '\u00A9ART' && !result.artist) result.artist = val;
        if (label === '\u00A9alb' && !result.album) result.album = val;
      } else if (label === 'covr' && val !== undefined) {
        result.artwork = val.bytes;
        result.artworkMime = val.mime;
      }
    } else if (label === 'udta' || label === 'meta' || label === 'ilst') {
      parseMp4Container(b, bodyStart, bodyEnd, result);
    }
    pos = bodyEnd;
  }
}

function parseMp4MetaItem(
  b: Uint8Array,
  start: number,
  end: number,
):
  | string
  | { bytes: Uint8Array; mime: string }
  | undefined {
  let pos = start;
  while (pos + 8 <= end) {
    const s = new SD(b);
    const size = s.u32be(pos);
    const label = s.ascii(pos + 4, 4);
    if (size < 8 || pos + size > end + 8) break;
    const bodyStart = pos + 8;
    const bodyEnd = pos + size;
    if (label === 'data' && bodyEnd - bodyStart >= 8) {
      const flags = s.u32be(bodyStart);
      const payload = b.subarray(bodyStart + 8, bodyEnd);
      if (flags === 13 || flags === 14) {
        if (payload.length > 0) {
          return { bytes: payload, mime: flags === 13 ? 'image/jpeg' : 'image/png' };
        }
      } else {
        const text = clean(decodeUtf8(payload) || decodeText(payload, 1));
        if (text) return text;
      }
    }
    pos = bodyEnd;
  }
  return undefined;
}

export function stripExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx > 0 ? name.slice(0, idx) : name;
}

export function titleFromFileName(name: string): string {
  const base = stripExtension(name);
  return (
    base.replace(/[_-]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
  ) || base;
}