# Android User-Agent Switcher (2015-2025)

Ekstensi Chrome Manifest V3 untuk mengganti User-Agent tab aktif ke profil Android dengan koleksi device tahun 2015 sampai 2025.

## Fitur
1. Ganti User-Agent tab aktif dengan sekali klik.
2. Emulasi ukuran layar mobile via Chrome Debugger Protocol.
3. Koleksi device lintas brand dan lintas kategori:
   - phone
   - foldable
   - tablet
   - gaming
   - rugged
4. Data device sudah mencakup:
   - `id`
   - `label`
   - `manufacturer`
   - `model`
   - `androidVersion`
   - `platformVersion`
   - `width`
   - `height`
   - `deviceScaleFactor`
   - `year`
   - `deviceType`
   - `userAgent`
5. Daftar device otomatis terurut dari tahun 2015 ke 2025.
6. Auto-apply ke tab HTTP/HTTPS baru atau tab yang selesai load.
7. Simpan state override per tab di `chrome.storage.local`.

## Struktur File
1. `manifest.json`: konfigurasi ekstensi MV3.
2. `background.js`: logic apply/reset emulasi dan User-Agent.
3. `devices.js`: source data device + generator metadata.
4. `popup.html`: UI popup ekstensi.
5. `popup.css`: styling popup.
6. `popup.js`: interaksi UI popup dengan background script.
7. `generate-icons.js`: helper untuk generate icon.

## Cara Install (Developer Mode)
1. Clone repo:
```bash
git clone https://github.com/zufarrizal/userAgent-Changer.git
cd userAgent-Changer
```
2. Buka Chrome ke `chrome://extensions`.
3. Aktifkan `Developer mode`.
4. Klik `Load unpacked`.
5. Pilih folder project ini.

## Cara Pakai
1. Buka website target di tab aktif.
2. Klik icon ekstensi.
3. Pilih device di dropdown.
4. Klik `Terapkan`.
5. Untuk kembali default, klik `Reset`.

## Cara Kerja Singkat
1. Popup kirim pesan ke background script (`applyDevice`, `resetDevice`, `getTabState`).
2. Background attach ke `chrome.debugger` pada tab.
3. Background set:
   - `Emulation.setDeviceMetricsOverride`
   - `Emulation.setTouchEmulationEnabled`
   - `Emulation.setEmitTouchEventsForMouse`
   - `Emulation.setUserAgentOverride`
4. Mapping `tabId -> deviceId` disimpan di storage.

## Catatan Penting
1. Ekstensi memakai permission `debugger`, sehingga Chrome akan menampilkan indikator debugging aktif pada tab yang dimodifikasi.
2. Beberapa situs tetap bisa mendeteksi environment desktop dari sinyal lain selain User-Agent.
3. Reset akan melepas session debugger untuk tab terkait.

## Pengembangan
1. Edit daftar device di `devices.js`.
2. Setiap item `RAW_DEVICES` otomatis diperkaya jadi `DEVICES`.
3. Tersedia index:
   - `DEVICES_BY_ID`
   - `DEVICES_BY_YEAR`

## Validasi Cepat
```bash
node --check background.js
node --check devices.js
node --check popup.js
```

## Versioning
Versi saat ini: `1.1.0` (lihat `manifest.json`).

## Lisensi
Proyek ini menggunakan lisensi MIT. Lihat file `LICENSE`.
