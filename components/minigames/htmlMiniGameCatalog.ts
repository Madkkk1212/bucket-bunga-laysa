export type HtmlMiniGameDefinition = {
  title: string;
  src: string;
  roomPrefix: string;
  maxPlayers: number;
  roomNote: string;
  route: string;
  bridge?: 'snake-ladders';
};

/** Add future standalone HTML games here; their room controls are supplied by HtmlGameRoom. */
export const HTML_MINIGAME_CATALOG: Record<string, HtmlMiniGameDefinition> = {
  'ular-tangga': {
    title: 'Ular Tangga',
    src: '/mini-games-ular-tangga.html',
    route: '/minigames/ular-tangga',
    roomPrefix: 'ULT',
    maxPlayers: 4,
    roomNote: 'Pilih jumlah pemain lalu Bersama teman. Host dapat memulai setelah semua kursi room terisi.',
    bridge: 'snake-ladders',
  },
  congklak: {
    title: 'Congklak 3D',
    src: '/congklak-3d.html',
    route: '/minigames/congklak',
    roomPrefix: 'CGK',
    maxPlayers: 2,
    roomNote: 'Pilih 2 Pemain lalu Bersama teman. Bagikan kode atau undangan; permainan aktif setelah lawan bergabung.',
  },
};
