'use client';

import HtmlGameRoom from '@/components/minigames/HtmlGameRoom';
import SnakeLaddersHtml from '@/components/minigames/SnakeLaddersHtml';
import type { HtmlMiniGameDefinition } from '@/components/minigames/htmlMiniGameCatalog';

export default function HtmlMiniGameEntry({
  game,
  initialRoomCode = '',
  initialRole,
}: {
  game: HtmlMiniGameDefinition;
  initialRoomCode?: string;
  initialRole?: 'host' | 'guest' | 'none';
}) {
  if (game.bridge === 'snake-ladders') {
    return <SnakeLaddersHtml initialRoomCode={initialRoomCode} initialRole={initialRole} invitePath={game.route} />;
  }

  return (
    <HtmlGameRoom
      src={game.src}
      title={game.title}
      roomPrefix={game.roomPrefix}
      invitePath={game.route}
      maxPlayers={game.maxPlayers}
      initialRoomCode={initialRoomCode}
      initialRole={initialRole}
      roomNote={game.roomNote}
      roomEntryMode="game"
    />
  );
}
