# Menambahkan mini game HTML

Mini game standalone di `public/` dapat memakai room UI bersama di `components/minigames/HtmlGameRoom.tsx`. Komponen itu menyediakan nama pemain, buat/gabung room, tautan undangan, daftar peserta, mic, speaker, dan fullscreen.

## Pasang game baru

1. Letakkan file HTML di `public/`, misalnya `public/mini-games-contoh.html`.
2. Tambahkan entri ke `HTML_MINIGAME_CATALOG` di `components/minigames/htmlMiniGameCatalog.ts`:

```ts
'contoh': {
  title: 'Game Contoh',
  src: '/mini-games-contoh.html',
  roomPrefix: 'CNT',
  maxPlayers: 4,
  roomNote: 'Buat room dan undang teman untuk bermain.',
},
```

Game otomatis tersedia di `/minigames/html/contoh`; undangannya memakai URL yang sama dengan kode room.

Congklak 3D terdaftar sebagai game 2 pemain di `/minigames/html/congklak`. File `public/congklak-3d.html` memakai event room standar untuk menyinkronkan langkah dan snapshot papan; panel mic/room tetap dari komponen bersama.

## Sinkronkan permainan

Game HTML menerima `html-room:state` dari parent. Isinya mencakup `role`, `localPeerId`, `playerName`, `playerNames`, `connectedPlayers`, dan `maxPlayers`. HTML harus memakai `connectedPlayers` untuk menahan tombol Mulai sampai jumlah pemain yang game-nya butuhkan sudah bergabung.

Untuk mengirim aksi/state ke room:

```js
function broadcastGame(payload) {
  window.parent.postMessage({ type: 'html-room:broadcast', payload }, location.origin);
}

window.addEventListener('message', (event) => {
  if (event.origin !== location.origin) return;
  if (event.data?.type === 'html-room:state') {
    // Simpan role, id pemain, dan jumlah peserta untuk aturan game.
  }
  if (event.data?.type === 'html-room:remote') {
    // Terapkan event.data.payload ke state game lokal.
  }
});
```

Room meneruskan broadcast pemain lewat host ke peserta lain. Untuk game dengan aturan khusus seperti ular tangga—misalnya hanya host yang melempar dadu dan memvalidasi giliran—tambahkan adapter tipis seperti `SnakeLaddersRoomBridge`; kontrol mic dan room tetap memakai komponen bersama.
