'use client';

import HtmlGameRoom from '@/components/minigames/HtmlGameRoom';
import SnakeLaddersHtml from '@/components/minigames/SnakeLaddersHtml';
import type { HtmlMiniGameDefinition } from '@/components/minigames/htmlMiniGameCatalog';

export default function HtmlMiniGameEntry({
  game,
  initialRoomCode = '',
}: {
  game: HtmlMiniGameDefinition;
  initialRoomCode?: string;
}) {
  if (game.bridge === 'snake-ladders') return <SnakeLaddersHtml initialRoomCode={initialRoomCode} invitePath={game.route} />;

  return (
    <HtmlGameRoom
      src={game.src}
      title={game.title}
      roomPrefix={game.roomPrefix}
      invitePath={game.route}
      maxPlayers={game.maxPlayers}
      initialRoomCode={initialRoomCode}
      roomNote={game.roomNote}
      roomEntryMode="game"
    />
  );
}
