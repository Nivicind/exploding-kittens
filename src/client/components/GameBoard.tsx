import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { GameState, PlayerState, CardInstance } from '../../engine/types';
import { CardRegistry } from '../../engine/CardRegistry';
import { CardView } from './CardView';
import { PlayerHand } from './PlayerHand';
import { ActionBanner } from './ActionBanner';
import { RealisticDiscardPile } from './RealisticDiscardPile';
import { ActionSpotlight, SpotlightData } from './ActionSpotlight';
import { FlyingCardOverlay, FlyingCardTask } from './FlyingCardOverlay';
import { TurnDirectionOrbit } from './TurnDirectionOrbit';
import { TurnTransitionGlow } from './TurnTransitionGlow';
import { DefuseModal } from './DefuseModal';
import { SeeFutureModal } from './SeeFutureModal';
import { ComboTargetModal } from './ComboTargetModal';
import { DiscardPileModal } from './DiscardPileModal';
import { GameLog } from './GameLog';
import { sound } from '../../engine/audio/SoundEffects';
import { Language, UI_TEXT } from '../i18n';

interface GameBoardProps {
  state: GameState;
  myPlayerId: string;
  onDrawCard: () => void;
  onPlayCards: (cardUids: string[], options?: { targetPlayerId?: string; targetCardDefId?: string }) => void;
  onPassNope: () => void;
  onInsertDefuse: (insertIndex: number) => void;
  onSelectFavorTarget: (targetPlayerId: string) => void;
  onGiveFavorCard: (cardUid: string) => void;
  onPickDiscard: (cardUid: string) => void;
  onCloseSeeFuture: () => void;
  onLeaveGame: () => void;
  lang?: Language;
  onToggleLang?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  state,
  myPlayerId,
  onDrawCard,
  onPlayCards,
  onPassNope,
  onInsertDefuse,
  onSelectFavorTarget,
  onGiveFavorCard,
  onPickDiscard,
  onCloseSeeFuture,
  onLeaveGame,
  lang: langProp,
  onToggleLang: onToggleLangProp
}) => {
  const [internalLang, setInternalLang] = useState<Language>(() => (typeof window !== 'undefined' ? (localStorage.getItem('ek_lang') as Language || 'vi') : 'vi'));
  const lang = langProp || internalLang;
  const handleToggleLang = () => {
    if (onToggleLangProp) {
      onToggleLangProp();
    } else {
      const nextLang: Language = lang === 'vi' ? 'en' : 'vi';
      setInternalLang(nextLang);
      if (typeof window !== 'undefined') localStorage.setItem('ek_lang', nextLang);
    }
  };
  const t = <K extends keyof typeof UI_TEXT.vi>(key: K): (typeof UI_TEXT.vi)[K] => {
    return (UI_TEXT[lang] as typeof UI_TEXT.vi)[key];
  };

  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);
  const [comboTargetModalData, setComboTargetModalData] = useState<{
    mode: 'FAVOR_TARGET' | 'COMBO_TWO' | 'COMBO_THREE';
    cardUids: string[];
  } | null>(null);

  // Spotlight hiển thị thẻ bài vừa đánh giữa sân
  const [spotlightData, setSpotlightData] = useState<SpotlightData | null>(null);

  // Hiệu ứng thẻ bài bay lượn
  const [flyingTasks, setFlyingTasks] = useState<FlyingCardTask[]>([]);

  // Hiệu ứng rung lắc toàn màn hình khi nổ bom
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);

  // Tiến trình Gỡ Bom: 'reveal' (hiện lá Mèo Nổ vừa bốc & thông báo cứu mạng bằng Defuse) -> 'insert' (chọn vị trí nhét bom vào xấp bài)
  const [defuseStep, setDefuseStep] = useState<'reveal' | 'insert'>('reveal');

  // Thông báo nổi trên tay khi bị cướp bài
  const [stolenNotification, setStolenNotification] = useState<string | null>(null);

  // Vệt sáng chuyển lượt bay giữa người chơi
  const [turnGlowPositions, setTurnGlowPositions] = useState<{
    from: { x: number; y: number } | null;
    to: { x: number; y: number } | null;
  }>({ from: null, to: null });

  // Hiệu ứng chớp viền đỏ khi có người NOPE
  const [isNopedFlash, setIsNopedFlash] = useState<boolean>(false);

  // Hiệu ứng đang xào bài của xấp bài rút
  const [isShufflingDrawPile, setIsShufflingDrawPile] = useState<boolean>(false);

  // Modal xác nhận khi chủ động bấm Rời bàn
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState<boolean>(false);

  // Theo dõi log và index lượt trước đó
  const lastLogIdRef = useRef<string | null>(null);
  const prevPlayerIndexRef = useRef<number>(state.currentPlayerIndex);

  // Ref lưu vị trí avatar các đối thủ để tính toạ độ vệt sáng bay
  const opponentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const myPlayer = state.players.find(p => p.id === myPlayerId);
  const currentPlayer = state.players[state.currentPlayerIndex];
  const isMyTurn = state.status === 'playing' && currentPlayer?.id === myPlayerId;
  const opponents = state.players.filter(p => p.id !== myPlayerId);
  const aliveOpponents = opponents.filter(p => p.isAlive);

  // Theo dõi sự thay đổi trên tay mình để phát hiện chính xác lá bài nào bị cướp
  const prevHandRef = useRef<CardInstance[]>(myPlayer?.hand || []);
  const lastStolenCardRef = useRef<CardInstance | null>(null);

  useEffect(() => {
    if (myPlayer?.hand) {
      if (prevHandRef.current.length > myPlayer.hand.length) {
        // Tìm thấy lá bài vừa bị mất khỏi tay
        const missing = prevHandRef.current.find(c => !myPlayer.hand.some(curr => curr.uid === c.uid));
        if (missing) {
          lastStolenCardRef.current = missing;
        }
      }
      prevHandRef.current = myPlayer.hand;
    }
  }, [myPlayer?.hand]);

  // Tính xác suất Mèo Nổ
  const explodingKittensCount = state.drawPile.filter(c => c.defId === 'exploding_kitten').length;
  const dangerProb = state.drawPile.length > 0 
    ? (explodingKittensCount / state.drawPile.length) * 100 
    : 0;

  // Lắng nghe khi lượt chơi thay đổi để bắn vệt sáng bay giữa 2 người chơi
  useEffect(() => {
    if (state.currentPlayerIndex !== prevPlayerIndexRef.current) {
      const prevIdx = prevPlayerIndexRef.current;
      const currIdx = state.currentPlayerIndex;
      prevPlayerIndexRef.current = currIdx;

      const prevPlayer = state.players[prevIdx];
      const currPlayer = state.players[currIdx];

      if (prevPlayer && currPlayer) {
        const windowW = window.innerWidth;
        const windowH = window.innerHeight;

        // Vị trí người trước
        let fromX = windowW / 2;
        let fromY = prevPlayer.id === myPlayerId ? windowH - 120 : 80;
        const fromElem = opponentRefs.current[prevPlayer.id];
        if (fromElem) {
          const rect = fromElem.getBoundingClientRect();
          fromX = rect.left + rect.width / 2;
          fromY = rect.top + rect.height / 2;
        }

        // Vị trí người tiếp theo
        let toX = windowW / 2;
        let toY = currPlayer.id === myPlayerId ? windowH - 120 : 80;
        const toElem = opponentRefs.current[currPlayer.id];
        if (toElem) {
          const rect = toElem.getBoundingClientRect();
          toX = rect.left + rect.width / 2;
          toY = rect.top + rect.height / 2;
        }

        setTurnGlowPositions({
          from: { x: fromX, y: fromY },
          to: { x: toX, y: toY }
        });
      }
    }
  }, [state.currentPlayerIndex, myPlayerId]);

  // Lắng nghe khi cần Gỡ Bom (Defuse) để kích hoạt Giai đoạn 1: Reveal Mèo Nổ vừa rút (chính mình) hoặc Báo động Spotlight (người khác)
  useEffect(() => {
    if (state.pendingAction?.type === 'DEFUSE_INSERTION') {
      sound.playNope();
      if (state.pendingAction.initiatorId === myPlayerId) {
        setDefuseStep('reveal');
      } else {
        const victim = state.players.find(p => p.id === state.pendingAction?.initiatorId);
        const bombCard = state.pendingAction.cardsPlayed[0] || { uid: 'drawn_bomb', defId: 'exploding_kitten' };
        if (victim) {
          setSpotlightData({
            playerName: victim.name,
            cards: [bombCard],
            comboTitle: 'MÈO NỔ! 💣💥'
          });
          setTimeout(() => {
            setSpotlightData(null);
          }, 2400);
        }
      }
    }
  }, [state.pendingAction?.type, state.pendingAction?.initiatorId, myPlayerId]);

  // Lắng nghe sự kiện mới từ Log để kích hoạt Animation (Nổ bom, Đánh bài, Xào bài, Cướp bài)
  useEffect(() => {
    if (state.logs.length === 0) return;
    const latestLog = state.logs[state.logs.length - 1];
    if (latestLog.id === lastLogIdRef.current) return;
    lastLogIdRef.current = latestLog.id;

    // 0. Nếu có ai đó đánh NOPE -> Chớp viền đỏ báo động 1.6s
    if (latestLog.type === 'nope' || latestLog.message.includes('NOPE')) {
      setIsNopedFlash(true);
      setTimeout(() => setIsNopedFlash(false), 1600);
    }

    // 1. Nếu có người nổ bom -> Rung màn hình + nổ
    if (latestLog.type === 'explode') {
      sound.playExplosion();
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), 700);

      const victim = state.players.find(p => p.id === latestLog.playerId);
      if (victim) {
        setSpotlightData({
          playerName: victim.name,
          cards: [{ uid: 'exploded_kitten', defId: 'exploding_kitten' }],
          comboTitle: 'BÙM! ĐÃ BỊ NỔ TUNG! 💀💥'
        });
        setTimeout(() => setSpotlightData(null), 2600);
      }
    }

    // 2. Nếu có hiệu ứng Xào Bài (Shuffle) -> CHỈ kích hoạt animation tráo bài khi bài đã chính thức được xào (sau khi kết thúc Nope window)
    if (latestLog.message.includes('đã xào lại toàn bộ xấp bài rút')) {
      setIsShufflingDrawPile(true);
      sound.playShuffle();
      setTimeout(() => setIsShufflingDrawPile(false), 1600);
    }

    // 3. Nếu chính mình hoặc người chơi bị cướp bài (Combo 2, Combo 3, Favor)
    if ((latestLog.type === 'combo' || latestLog.type === 'info') && myPlayer) {
      // Khi mình bị cướp bài
      if (
        latestLog.message.includes(`tay của ${myPlayer.name}`) ||
        latestLog.message.includes(`cướp bài của ${myPlayer.name}`)
      ) {
        const actorId = latestLog.playerId;
        const actor = state.players.find(p => p.id === actorId)?.name || 'Đối thủ';
        const stolenCard = lastStolenCardRef.current;
        const stolenCardDef = stolenCard ? CardRegistry.getCard(stolenCard.defId) : null;
        const cardNameText = stolenCardDef ? ` lá "${stolenCardDef.nameVi}"` : ' 1 lá bài';

        setStolenNotification(`Bạn vừa bị ${actor} cướp mất${cardNameText}!`);
        setTimeout(() => setStolenNotification(null), 5500);

        // Bắn lá bài bay từ tay mình lên avatar người cướp bài (ngửa mặt nếu biết lá bài)
        if (actorId && actorId !== myPlayerId) {
          const windowW = window.innerWidth;
          const windowH = window.innerHeight;
          let targetX = windowW / 2;
          let targetY = 80;
          const actorElem = opponentRefs.current[actorId];
          if (actorElem) {
            const rect = actorElem.getBoundingClientRect();
            targetX = rect.left + rect.width / 2;
            targetY = rect.top + rect.height / 2;
          }

          setFlyingTasks(prev => [
            ...prev,
            {
              id: `fly_stolen_${Date.now()}`,
              card: stolenCard || undefined,
              from: { x: windowW / 2, y: windowH - 120 },
              to: { x: targetX, y: targetY },
              isFaceDown: !stolenCard
            }
          ]);
          sound.playCardDraw();
        }
      }
      // Khi chính mình cướp thành công bài từ đối thủ
      else if (latestLog.playerId === myPlayerId && latestLog.message.includes('cướp ngẫu nhiên 1 lá trên tay của')) {
        const victim = state.players.find(p => p.id !== myPlayerId && latestLog.message.includes(p.name));
        if (victim) {
          const windowW = window.innerWidth;
          const windowH = window.innerHeight;
          let startX = windowW / 2;
          let startY = 80;
          const victimElem = opponentRefs.current[victim.id];
          if (victimElem) {
            const rect = victimElem.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
            startY = rect.top + rect.height / 2;
          }

          setFlyingTasks(prev => [
            ...prev,
            {
              id: `fly_robbed_to_me_${Date.now()}`,
              from: { x: startX, y: startY },
              to: { x: windowW / 2, y: windowH - 120 },
              isFaceDown: true
            }
          ]);
          sound.playCardDraw();
        }
      }
      // Khi đối thủ đưa bài cho mình vì mình đã Favor họ
      else if (latestLog.message.includes(`đã đưa 1 lá bài cho ${myPlayer.name}`)) {
        const giver = state.players.find(p => p.id !== myPlayerId && latestLog.message.includes(p.name));
        if (giver) {
          const windowW = window.innerWidth;
          const windowH = window.innerHeight;
          let startX = windowW / 2;
          let startY = 80;
          const giverElem = opponentRefs.current[giver.id];
          if (giverElem) {
            const rect = giverElem.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
            startY = rect.top + rect.height / 2;
          }

          setFlyingTasks(prev => [
            ...prev,
            {
              id: `fly_favor_received_${Date.now()}`,
              from: { x: startX, y: startY },
              to: { x: windowW / 2, y: windowH - 120 },
              isFaceDown: true
            }
          ]);
          sound.playCardDraw();
        }
      }
      // Khi Đối thủ A cướp bài của Đối thủ B
      else if (latestLog.type === 'combo' && latestLog.message.includes('cướp ngẫu nhiên 1 lá trên tay của')) {
        const thief = state.players.find(p => p.id === latestLog.playerId);
        const victim = state.players.find(p => p.id !== latestLog.playerId && latestLog.message.includes(p.name));
        if (thief && victim && thief.id !== myPlayerId && victim.id !== myPlayerId) {
          const thiefElem = opponentRefs.current[thief.id];
          const victimElem = opponentRefs.current[victim.id];
          if (thiefElem && victimElem) {
            const rectT = thiefElem.getBoundingClientRect();
            const rectV = victimElem.getBoundingClientRect();
            setFlyingTasks(prev => [
              ...prev,
              {
                id: `fly_opp_steal_${Date.now()}`,
                from: { x: rectV.left + rectV.width / 2, y: rectV.top + rectV.height / 2 },
                to: { x: rectT.left + rectT.width / 2, y: rectT.top + rectT.height / 2 },
                isFaceDown: true
              }
            ]);
            sound.playCardDraw();
          }
        }
      }
      // Khi Đối thủ B đưa bài cho Đối thủ A vì bị Favor
      else if (latestLog.message.includes('đã đưa 1 lá bài cho')) {
        const receiver = state.players.find(p => latestLog.message.includes(`cho ${p.name}`));
        const giver = state.players.find(p => p.id !== receiver?.id && latestLog.message.includes(p.name));
        if (receiver && giver && receiver.id !== myPlayerId && giver.id !== myPlayerId) {
          const recvElem = opponentRefs.current[receiver.id];
          const giverElem = opponentRefs.current[giver.id];
          if (recvElem && giverElem) {
            const rectR = recvElem.getBoundingClientRect();
            const rectG = giverElem.getBoundingClientRect();
            setFlyingTasks(prev => [
              ...prev,
              {
                id: `fly_opp_favor_${Date.now()}`,
                from: { x: rectG.left + rectG.width / 2, y: rectG.top + rectG.height / 2 },
                to: { x: rectR.left + rectR.width / 2, y: rectR.top + rectR.height / 2 },
                isFaceDown: true
              }
            ]);
            sound.playCardDraw();
          }
        }
      }
    }

    // 4. Nếu có người vừa đánh bài -> Hiện Spotlight 1.2s
    if (latestLog.type === 'play' || latestLog.type === 'combo' || latestLog.type === 'nope') {
      const actor = state.players.find(p => p.id === latestLog.playerId) || { name: 'Người chơi' };
      const lastDiscardCard = state.discardPile[state.discardPile.length - 1];

      if (lastDiscardCard) {
        setSpotlightData({
          playerName: actor.name,
          cards: [lastDiscardCard],
          comboTitle: latestLog.type === 'combo' ? 'Combo Đặc Biệt' : undefined
        });

        setTimeout(() => {
          setSpotlightData(null);
        }, 1200);

        // Kích hoạt lá bài bay từ vị trí avatar đối thủ xuống giữa sân
        if (latestLog.playerId && latestLog.playerId !== myPlayerId) {
          const newTaskId = `fly_play_${Date.now()}`;
          const windowW = window.innerWidth;
          const windowH = window.innerHeight;

          let startX = windowW / 2;
          let startY = 80;
          const actorElem = opponentRefs.current[latestLog.playerId];
          if (actorElem) {
            const rect = actorElem.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
            startY = rect.top + rect.height / 2;
          }

          setFlyingTasks(prev => [
            ...prev,
            {
              id: newTaskId,
              card: lastDiscardCard,
              from: { x: startX, y: startY },
              to: { x: windowW / 2, y: windowH / 2 },
              isFaceDown: false
            }
          ]);
        }
      }
    }
  }, [state.logs, state.discardPile, myPlayerId]);

  // Hiệu ứng pháo hoa khi chiến thắng
  useEffect(() => {
    if (state.status === 'game_over') {
      sound.playVictory();
      confetti({
        particleCount: 160,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [state.status]);

  const handleCompleteFlyingTask = (id: string) => {
    setFlyingTasks(prev => prev.filter(t => t.id !== id));
  };

  // Rút bài kèm animation bài bay
  const handleDrawCard = () => {
    if (!isMyTurn || state.pendingAction) return;

    sound.playCardDraw();

    const windowW = window.innerWidth;
    const windowH = window.innerHeight;
    const newTaskId = `fly_draw_${Date.now()}`;

    setFlyingTasks(prev => [
      ...prev,
      {
        id: newTaskId,
        from: { x: windowW / 2 + 100, y: windowH / 2 },
        to: { x: windowW / 2, y: windowH - 120 },
        isFaceDown: true
      }
    ]);

    onDrawCard();
  };

  // Xử lý đánh 1 lá bài
  const handlePlaySingleCard = (cardUid: string, defId: string) => {
    if (defId === 'favor') {
      if (aliveOpponents.length === 1) {
        onPlayCards([cardUid], { targetPlayerId: aliveOpponents[0].id });
      } else {
        setComboTargetModalData({
          mode: 'FAVOR_TARGET',
          cardUids: [cardUid]
        });
      }
    } else {
      onPlayCards([cardUid]);
    }
  };

  // Xử lý Combo 2 lá
  const handlePlayComboTwo = (cardUids: [string, string]) => {
    if (aliveOpponents.length === 1) {
      onPlayCards(cardUids, { targetPlayerId: aliveOpponents[0].id });
    } else {
      setComboTargetModalData({
        mode: 'COMBO_TWO',
        cardUids
      });
    }
  };

  // Xử lý Combo 3 lá
  const handlePlayComboThree = (cardUids: [string, string, string]) => {
    setComboTargetModalData({
      mode: 'COMBO_THREE',
      cardUids
    });
  };

  // Xử lý Combo 5 lá
  const handlePlayComboFive = (cardUids: string[]) => {
    onPlayCards(cardUids);
  };

  // Xác nhận mục tiêu từ Modal
  const handleConfirmComboTarget = (targetPlayerId: string, targetCardDefId?: string) => {
    if (!comboTargetModalData) return;
    onPlayCards(comboTargetModalData.cardUids, {
      targetPlayerId,
      targetCardDefId
    });
    setComboTargetModalData(null);
  };

  // Đánh Nope từ hand
  const handlePlayNope = (cardUid: string) => {
    onPlayCards([cardUid]);
  };

  // Xử lý đưa 1 lá bài khi bị đối thủ Favor (kèm hoạt ảnh bài bay)
  const handleGiveFavorCard = (cardUid: string) => {
    const initiatorId = state.pendingAction?.initiatorId;
    const initiatorElem = initiatorId ? opponentRefs.current[initiatorId] : null;
    const card = myPlayer?.hand.find(c => c.uid === cardUid);

    const windowW = window.innerWidth;
    const windowH = window.innerHeight;

    let targetX = windowW / 2;
    let targetY = 80;
    if (initiatorElem) {
      const rect = initiatorElem.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    }

    // Bắn lá bài bay từ tay mình lên avatar người xin bài
    setFlyingTasks(prev => [
      ...prev,
      {
        id: `fly_favor_${Date.now()}`,
        card,
        from: { x: windowW / 2, y: windowH - 120 },
        to: { x: targetX, y: targetY },
        isFaceDown: false
      }
    ]);

    sound.playCardDraw();
    onGiveFavorCard(cardUid);
  };

  // Xử lý bấm nút Rời bàn (Có hỏi xác nhận nếu đang trong trận)
  const handleLeaveButtonClick = () => {
    if (state.status === 'playing' && myPlayer?.isAlive) {
      setShowLeaveConfirmModal(true);
    } else {
      onLeaveGame();
    }
  };

  return (
    <div className={`h-[100dvh] max-h-[100dvh] w-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between p-2 select-none relative ${
      isScreenShaking ? 'animate-shake' : ''
    }`}>
      
      {/* 4 VIỀN MÀN HÌNH PHÁT SÁNG THEO TRẠNG THÁI (NOPE: ĐỎ, FAVOR: ĐEN XÁM, TẤN CÔNG: CAM, LƯỢT ĐI: VÀNG) */}
      {isNopedFlash ? (
        <div className="fixed inset-0 pointer-events-none ring-8 ring-rose-600/90 shadow-[inset_0_0_120px_rgba(225,29,72,0.7)] z-40 animate-pulse" />
      ) : state.pendingAction?.type === 'FAVOR_GIVE_CARD' && state.pendingAction.targetPlayerId === myPlayerId ? (
        <div className="fixed inset-0 pointer-events-none ring-8 ring-zinc-400/90 shadow-[inset_0_0_120px_rgba(113,113,122,0.85)] z-40 animate-pulse" />
      ) : myPlayer && myPlayer.isAlive && myPlayer.turnsToTake > 1 && isMyTurn ? (
        <div className="fixed inset-0 pointer-events-none ring-8 ring-amber-500/90 shadow-[inset_0_0_120px_rgba(245,158,11,0.75)] z-40 animate-pulse" />
      ) : isMyTurn ? (
        <div className="fixed inset-0 pointer-events-none ring-4 ring-yellow-400/80 shadow-[inset_0_0_60px_rgba(250,204,21,0.35)] z-40 animate-edge-pulse" />
      ) : null}

      {/* VỆT SÁNG BAY CHUYỂN LƯỢT GIỮA CÁC NGƯỜI CHƠI */}
      <TurnTransitionGlow
        fromPos={turnGlowPositions.from}
        toPos={turnGlowPositions.to}
        triggerKey={state.currentPlayerIndex}
      />

      {/* OVERLAY THẺ BÀI BAY LƯỢN */}
      <FlyingCardOverlay tasks={flyingTasks} onCompleteTask={handleCompleteFlyingTask} />

      {/* SPOTLIGHT PHÓNG TO THẺ BÀI VỪA ĐÁNH GIỮA SÂN */}
      <ActionSpotlight data={spotlightData} lang={lang} />

      {/* 1. Header (Cố định h-10 sm:h-11) */}
      <div className="h-10 sm:h-11 flex-shrink-0 flex items-center justify-between bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-xl shadow-md backdrop-blur-md z-30">
        <div className="flex items-center gap-1.5">
          <span className="text-base sm:text-lg">💣</span>
          <h2 className="font-black text-xs sm:text-sm text-yellow-400">
            {t('gameTitle')}
          </h2>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline ml-1">
            [{state.id}]
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Lượt hiện tại */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-[10px] sm:text-[11px] hidden md:inline">{t('turnLabel')}</span>
            <span className="font-black text-yellow-400 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700 text-[10px] sm:text-xs">
              {currentPlayer?.name} {currentPlayer?.turnsToTake > 1 ? `(${currentPlayer.turnsToTake}L)` : ''}
            </span>
          </div>

          {/* Số bài trên tay của bạn */}
          {myPlayer && (
            <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold text-slate-200">
              <span>🎴</span>
              <span className="text-yellow-400 font-black">{myPlayer.hand.length}</span>
              <span className="text-slate-400 hidden xs:inline">{t('cardsCount')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {/* Nút chuyển đổi ngôn ngữ Song ngữ Việt - Anh */}
          <button
            onClick={handleToggleLang}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-black text-[10px] sm:text-[11px] transition cursor-pointer flex items-center gap-1 active:scale-95"
            title={lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          >
            <span>{lang === 'vi' ? '🇻🇳 VN' : '🇬🇧 EN'}</span>
          </button>

          <button
            onClick={() => sound.toggleMute()}
            className="p-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
            title={sound.getMuted() ? t('unmute') : t('mute')}
          >
            {sound.getMuted() ? '🔇' : '🔊'}
          </button>
          <button
            onClick={handleLeaveButtonClick}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 transition font-bold text-[11px]"
          >
            {t('leaveTable')}
          </button>
        </div>
      </div>

      {/* 2. Banner Thông Báo Hành Động Đang Chờ NOPE (Cố định góc phải, không layout shift) */}
      {state.pendingAction?.type === 'NOPE_WINDOW' && myPlayer && (
        <ActionBanner
          pendingAction={state.pendingAction}
          currentPlayer={myPlayer}
          onPassNope={onPassNope}
          lang={lang}
        />
      )}

      {/* 3. SÀN ĐẤU BÀI TẬP TRUNG (UNIFIED GAME TABLE MAT)
          - Tích hợp đối thủ phân bố vòng cung nhẹ nhàng, tự nhiên
          - Dynamic Scale: Trên mobile, người đến lượt phình to ra để đọc rõ tên; trên PC mở rộng thoải mái
      */}
      <div className="flex-1 min-h-0 relative flex flex-col justify-between items-center w-full px-2 sm:px-4 py-1 overflow-visible">
        {/* VÒNG ĐỐI THỦ PHÂN BỐ CUNG TRÒN TỰ CO GIÃN THEO BỀ NGANG MÀN HÌNH (KHÔNG HỘP, KHÔNG CUỘN) */}
        <div className="w-full max-w-5xl flex justify-center items-center gap-1 sm:gap-2 px-1 sm:px-3 pt-1 pb-2 z-20 overflow-visible">
          {opponents.map((opp, idx) => {
            const isTurn = state.status === 'playing' && currentPlayer?.id === opp.id;
            const isDefusing = state.pendingAction?.type === 'DEFUSE_INSERTION' && state.pendingAction.initiatorId === opp.id;
            const isActive = isTurn || isDefusing;
            const totalOpp = opponents.length;
            const mid = (totalOpp - 1) / 2;
            const tVal = totalOpp > 1 ? (idx - mid) / mid : 0;

            // Uốn cong hình vòng cung nhẹ nhàng
            const arcY = Math.pow(Math.abs(tVal), 1.6) * (totalOpp > 4 ? 8 : 14);
            const arcRotate = tVal * 6;

            // Tự co giãn dynamic:
            // Trên màn hình nhỏ: Người đến lượt phình to ra (flex-[2.4] min-w-[96px]), người không đến lượt thu gọn (max-w-[48px]).
            // Trên PC (sm trở lên): Mọi người chơi đều rộng rãi (sm:min-w-[90px] sm:max-w-[145px]) để đọc rõ tên không bao giờ bị cắt.
            const dynamicSizeClass = isActive
              ? 'flex-[2.4] xs:flex-[2] sm:flex-1 min-w-[96px] xs:min-w-[110px] sm:min-w-[95px] md:min-w-[115px] max-w-[130px] sm:max-w-[155px] md:max-w-[175px] z-30 scale-105 shadow-2xl'
              : 'flex-1 min-w-0 max-w-[48px] xs:max-w-[62px] sm:min-w-[85px] md:min-w-[105px] sm:max-w-[135px] md:max-w-[155px]';

            return (
              <div
                key={opp.id}
                ref={el => (opponentRefs.current[opp.id] = el)}
                style={{
                  transform: `translateY(${arcY}px) rotate(${arcRotate}deg)`
                }}
                className={`${dynamicSizeClass} rounded-xl sm:rounded-2xl flex flex-col items-center justify-between border transition-all duration-300 origin-center py-1 sm:py-2 px-1 sm:px-2 ${
                  isDefusing
                    ? 'ring-4 ring-rose-500 shadow-[0_0_35px_rgba(244,63,94,1)] bg-rose-950 border-rose-400 animate-bounce-short'
                    : isTurn
                    ? 'ring-2 sm:ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] bg-yellow-950/70 border-yellow-400'
                    : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 backdrop-blur-sm'
                } ${
                  !opp.isAlive ? 'bg-rose-950/20 border-rose-900/40 opacity-40 grayscale' : ''
                }`}
              >
                {/* Avatar đối thủ */}
                <div className={`relative text-base sm:text-2xl md:text-3xl transition-transform ${isDefusing ? 'scale-125' : isTurn ? 'scale-110' : ''}`}>
                  {isDefusing ? '🙀' : opp.isAlive ? (opp.isBot ? '🐱' : '👤') : '💀'}
                  {isDefusing ? (
                    <span className="absolute -top-2 -right-2 text-sm sm:text-base animate-ping">
                      💥
                    </span>
                  ) : isTurn ? (
                    <span className="absolute -top-1 -right-1 flex h-2 sm:h-2.5 w-2 sm:w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-full w-full bg-yellow-500"></span>
                    </span>
                  ) : null}
                </div>

                <div className="text-center w-full min-w-0 px-1 py-0.5">
                  <div className={`font-black text-slate-100 ${
                    isActive
                      ? 'text-[9px] xs:text-[10px] sm:text-[11.5px]'
                      : 'text-[7px] xs:text-[8px] sm:text-[10.5px]'
                  } truncate w-full`}>
                    {opp.name}
                  </div>
                  <div className="text-[7px] sm:text-[9px] text-slate-400 font-bold whitespace-nowrap mt-0.5">
                    {opp.isAlive ? `🎴 ${opp.hand.length} ${t('cardsCount')}` : t('explodedTag')}
                  </div>
                </div>

                {/* Trạng thái lượt đi, rút bom hoặc mất mạng */}
                {isDefusing ? (
                  <span className="text-[6px] sm:text-[7.5px] uppercase font-black px-1.5 py-0.5 rounded-full bg-rose-600 text-white shadow-lg animate-pulse whitespace-nowrap truncate max-w-full flex items-center justify-center gap-0.5 border border-rose-300 my-0.5">
                    <span>💣</span> {t('bombTag')}
                  </span>
                ) : opp.disconnected && opp.isAlive ? (
                  <span className="text-[6px] sm:text-[7.5px] uppercase font-black px-1.5 py-0.5 rounded-full bg-rose-600/90 text-white animate-pulse flex items-center gap-0.5 whitespace-nowrap truncate max-w-full my-0.5">
                    <span>📶</span> {t('aiTag')}
                  </span>
                ) : isTurn ? (
                  <span className="text-[6px] sm:text-[7.5px] uppercase font-black px-1.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 shadow-sm animate-pulse whitespace-nowrap truncate max-w-full my-0.5">
                    {t('isTurnTag')} {opp.turnsToTake > 1 ? `(${opp.turnsToTake}L)` : ''}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* BÀN CHƠI TRUNG TÂM (CENTER TABLE: TRỒNG BÀI ĐÁNH & BÀI BỐC) */}
        <div className="my-auto relative flex items-center justify-center">
          {/* MŨI TÊN XOAY VÒNG UNO CHUẨN XÁC ĐẶT NGAY SAU TÂM 2 TRỒNG BÀI */}
          <TurnDirectionOrbit direction={state.turnDirection} />

          <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-3 sm:p-5 backdrop-blur-sm shadow-2xl flex items-start justify-center gap-4 sm:gap-10 z-10 scale-[0.85] sm:scale-100 origin-center transition-transform">
            {/* A. Ở GIỮA: TRỒNG BÀI ĐÁNH RA (BÀI BỎ) XẾP XÔ LỆCH TỰ NHIÊN */}
            <RealisticDiscardPile
              discardPile={state.discardPile}
              onOpenModal={() => setShowDiscardModal(true)}
            />

            {/* B. BÊN PHẢI: TRỒNG BÀI BỐC (DRAW PILE) */}
            <div className="flex flex-col items-center justify-start flex-shrink-0">
              {/* Trên xấp bài bốc: ghi rõ phần trăm nổ */}
              <div className="mb-2 text-center flex flex-col items-center justify-center">
                <span className="h-4 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-300 block mb-0.5 leading-none">
                  TRỒNG BÀI BỐC
                </span>
                <div className={`h-5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] sm:text-[10px] font-black leading-none ${
                  dangerProb >= 35
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                    : dangerProb >= 15
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                }`}>
                  <span>💣 Nổ: {dangerProb.toFixed(1)}%</span>
                  <span>({explodingKittensCount} bom / {state.drawPile.length} lá)</span>
                </div>
              </div>

              <div
                onClick={handleDrawCard}
                className={`relative w-[116px] h-[180px] sm:w-[136px] sm:h-[212px] md:w-[148px] md:h-[228px] rounded-2xl border-2 sm:border-3 flex flex-col items-center justify-between p-2.5 sm:p-3 card-shadow transition-all ${
                  isShufflingDrawPile
                    ? 'animate-shuffle-cards border-indigo-400 shadow-[0_0_35px_rgba(99,102,241,0.7)]'
                    : isMyTurn && !state.pendingAction
                    ? 'cursor-pointer hover:scale-105 ring-4 ring-yellow-400 border-yellow-400 bg-gradient-to-b from-rose-900 via-rose-950 to-slate-950 animate-pulse'
                    : 'cursor-not-allowed border-slate-700 bg-gradient-to-b from-slate-800 to-slate-950 opacity-95'
                }`}
              >
                {/* Khi đang xào bài: Hiện 2 lớp lá bài phụ bay lệch sang 2 bên và huy hiệu xào bài */}
                {isShufflingDrawPile && (
                  <>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-900 to-slate-950 border-2 border-indigo-400/80 pointer-events-none -translate-x-3.5 -rotate-6 transition-transform opacity-80" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-900 to-slate-950 border-2 border-indigo-400/80 pointer-events-none translate-x-3.5 rotate-6 transition-transform opacity-80" />
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-indigo-950/90 backdrop-blur-[2px] rounded-2xl border-2 border-indigo-400 shadow-2xl p-2 text-center animate-pulse">
                      <span className="text-3xl sm:text-4xl animate-spin mb-1">🔀</span>
                      <span className="text-[11px] sm:text-xs font-black text-indigo-200 uppercase tracking-widest leading-tight">
                        ĐANG XÀO BÀI...
                      </span>
                    </div>
                  </>
                )}

                <div className="w-full flex justify-between text-rose-500 font-black text-[10px]">
                  <span>💣</span>
                  <span>MÈO NỔ</span>
                </div>

                <div className="text-center my-auto">
                  <div className="text-4xl sm:text-5xl mb-0.5 drop-shadow-xl">
                    💣
                  </div>
                  <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest">
                    EXPLODING
                  </p>
                </div>

                {isMyTurn && !state.pendingAction ? (
                  <button
                    type="button"
                    className="w-full py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-[10px] uppercase rounded-lg shadow-lg transition"
                  >
                    {lang === 'en' ? 'DRAW (End Turn)' : 'RÚT BÀI (Hết Lượt)'}
                  </button>
                ) : (
                  <span className="text-[9px] text-slate-500 uppercase font-semibold">
                    {isMyTurn ? (lang === 'en' ? 'Resolving...' : 'Đang giải quyết') : (lang === 'en' ? 'Waiting turn' : 'Chờ tới lượt')}
                  </span>
                )}
              </div>

              <span className="h-4 mt-2 text-[10px] text-slate-400 font-semibold flex items-center justify-center leading-none">
                {t('remainingCards').replace('{n}', state.drawPile.length.toString())}
              </span>
            </div>

          </div>
        </div>

        {/* Đệm đáy bàn chơi */}
        <div className="h-1 flex-shrink-0" />
      </div>

      {/* 5. KHUNG NHẬT KÝ VÁN ĐẤU (NẰM PHÍA TRÊN PHẦN BÀI TAY, KHÔNG ĐÈ LÊN BÀI) */}
      <GameLog logs={state.logs} />

      {/* 6. BÀN TAY NGƯỜI CHƠI / HIỂN THỊ THUA CUỘC (HOÀN TOÀN KHÔNG DÙNG KHUNG KHÓA RIÊNG, NẰM LIỀN TRÊN MẶT SÀN) */}
      <div className="h-64 sm:h-72 md:h-80 flex-shrink-0 w-full z-20 flex flex-col justify-end overflow-visible relative">
        {/* Thanh tiêu đề nổi nhẹ chỉ hiển thị trên màn hình lớn (trên mobile đã có ở header rất gọn) */}
        <div className="hidden sm:flex justify-between items-center px-4 sm:px-8 z-30 pointer-events-none mb-1">
          <div className="flex items-center gap-1.5 bg-slate-900/70 border border-slate-700/50 px-3 py-1 rounded-full backdrop-blur-md shadow-md">
            <span className="text-xs">🎴</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-200">
              {t('yourHandTitle')} ({myPlayer?.name}):{' '}
              <strong className="text-yellow-400 font-black">{myPlayer?.hand.length || 0} {t('cardsCount')}</strong>
            </span>
          </div>
        </div>

        {/* NẾU ĐÃ THUA (CHẾT DO NỔ BOM): HIỆN CHỮ BÁO ĐÃ THUA VÀ CHUYỂN SANG KHÁN GIẢ */}
        {myPlayer && !myPlayer.isAlive ? (
          <div className="flex-1 flex flex-col items-center justify-center p-3 animate-fade-in z-30 select-none">
            <div className="bg-rose-950/75 border-2 border-rose-500/80 rounded-3xl p-4 sm:p-5 backdrop-blur-md shadow-2xl shadow-rose-950/90 flex flex-col items-center text-center max-w-sm sm:max-w-md w-full animate-pulse-slow">
              <div className="text-4xl sm:text-5xl mb-1 filter drop-shadow">
                💀💥
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-rose-400 uppercase tracking-widest drop-shadow">
                {t('spectatorDefeated')}
              </h3>
              <div className="my-1.5 px-3 py-0.5 rounded-full bg-rose-600/40 border border-rose-400/60 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                {t('spectatorBadge')}
              </div>
              <p className="text-[10px] sm:text-xs text-rose-200/90 leading-relaxed max-w-xs">
                {t('spectatorText')}
              </p>
            </div>
          </div>
        ) : myPlayer ? (
          <div className="flex-1 flex items-end overflow-visible">
            <PlayerHand
              player={myPlayer}
              isMyTurn={isMyTurn}
              isNopeWindow={state.pendingAction?.type === 'NOPE_WINDOW'}
              isGiveFavorMode={state.pendingAction?.type === 'FAVOR_GIVE_CARD' && state.pendingAction.targetPlayerId === myPlayerId}
              favorInitiatorName={state.players.find(p => p.id === state.pendingAction?.initiatorId)?.name || 'Đối thủ'}
              onGiveFavorCard={handleGiveFavorCard}
              stolenNotification={stolenNotification}
              onPlaySingleCard={handlePlaySingleCard}
              onPlayComboTwo={handlePlayComboTwo}
              onPlayComboThree={handlePlayComboThree}
              onPlayComboFive={handlePlayComboFive}
              onPlayNope={handlePlayNope}
              lang={lang}
              disabled={!myPlayer.isAlive || (state.pendingAction !== null && state.pendingAction.type !== 'NOPE_WINDOW' && state.pendingAction.type !== 'FAVOR_GIVE_CARD')}
            />
          </div>
        ) : null}
      </div>

      {/* 7. CÁC MODAL HÀNH ĐỘNG CẦN THIẾT */}

      {/* Hộp thoại Rút Mèo Nổ & Kích hoạt Defuse (Giai đoạn 1: Reveal lá Nổ vừa rút) */}
      {state.pendingAction?.type === 'DEFUSE_INSERTION' && state.pendingAction.initiatorId === myPlayerId && defuseStep === 'reveal' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
          <div className="bg-slate-900 border-4 border-rose-500 rounded-3xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full text-center space-y-4 shadow-2xl shadow-rose-950/80 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/60 text-rose-300 text-xs font-black uppercase tracking-wider animate-pulse">
              <span>{lang === 'en' ? '⚠️ DANGER ALERT!' : '⚠️ BÁO ĐỘNG NGUY HIỂM!'}</span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-rose-400 uppercase tracking-wide">
                {lang === 'en' ? 'YOU DREW AN EXPLODING KITTEN!' : 'BẠN VỪA RÚT PHẢI MÈO NỔ!'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'en' ? 'A ticking kitten bomb is in your hand!' : 'Một quả bom Mèo Nổ vừa chui vào tay bạn!'}
              </p>
            </div>

            {/* Hiển thị lá bài Mèo Nổ vừa rút (Đứng yên trang nghiêm, không nhún nhảy) */}
            <div className="flex justify-center my-2">
              <div className="ring-4 ring-rose-500 rounded-2xl shadow-[0_0_40px_rgba(244,63,94,0.7)] transform scale-105 transition-transform">
                <CardView
                  card={{ uid: 'drawn_kitten_reveal', defId: 'exploding_kitten' }}
                  isSelected={false}
                  lang={lang}
                />
              </div>
            </div>

            {/* Thông báo đã dùng Defuse */}
            <div className="bg-emerald-950/70 border border-emerald-500/60 rounded-2xl p-3 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-300 font-black text-xs sm:text-sm">
                <span>🔧</span>
                <span>{lang === 'en' ? 'AUTO-USED 1 DEFUSE CARD!' : 'ĐÃ TỰ ĐỘNG DÙNG 1 LÁ GỠ BOM (DEFUSE)!'}</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                {lang === 'en' 
                  ? 'Luckily, you had a Defuse in hand and escaped alive! Now, secretly choose where to reinsert the Exploding Kitten into the deck.' 
                  : 'May mắn thay, bạn có lá Defuse trên tay nên đã thoát chết trong gang tấc! Bây giờ, hãy bí mật chọn vị trí để giấu lại Mèo Nổ vào bộ bài.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playDefuse();
                setDefuseStep('insert');
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm uppercase rounded-2xl shadow-xl shadow-emerald-500/30 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{lang === 'en' ? 'CHOOSE INSERTION POSITION' : 'CHỌN VỊ TRÍ ĐẶT LẠI MÈO NỔ'}</span>
              <span className="text-base">➔</span>
            </button>
          </div>
        </div>
      )}

      {/* Hộp thoại Chọn vị trí đặt lại Mèo Nổ (Giai đoạn 2: Insert position) */}
      {state.pendingAction?.type === 'DEFUSE_INSERTION' && state.pendingAction.initiatorId === myPlayerId && defuseStep === 'insert' && (
        <DefuseModal
          drawPileCount={state.drawPile.length}
          players={state.players}
          turnDirection={state.turnDirection}
          myPlayerId={myPlayerId}
          onConfirm={onInsertDefuse}
        />
      )}

      {/* Hộp thoại Xem Tương Lai See the Future */}
      {state.peekCards && state.peekCards.playerId === myPlayerId && (
        <SeeFutureModal
          cards={state.peekCards.cards}
          onClose={onCloseSeeFuture}
        />
      )}

      {/* Hộp thoại Chọn Mục Tiêu Combo (Favor / Combo 2 / Combo 3) */}
      {comboTargetModalData && (
        <ComboTargetModal
          mode={comboTargetModalData.mode}
          opponents={aliveOpponents}
          onConfirmTarget={handleConfirmComboTarget}
          onCancel={() => setComboTargetModalData(null)}
        />
      )}



      {/* Cửa sổ Xấp Bài Bỏ (Hoặc Chọn Bài Cho Combo 5 Lá) */}
      {(showDiscardModal || (state.pendingAction?.type === 'COMBO_FIVE_CHOOSE_DISCARD' && state.pendingAction.initiatorId === myPlayerId)) && (
        <DiscardPileModal
          cards={state.discardPile}
          isComboFivePicker={state.pendingAction?.type === 'COMBO_FIVE_CHOOSE_DISCARD' && state.pendingAction.initiatorId === myPlayerId}
          onPickCard={onPickDiscard}
          onClose={() => setShowDiscardModal(false)}
        />
      )}



      {/* Màn Hình Chiến Thắng / Thất Bại (Game Over) */}
      {state.status === 'game_over' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-5">
            <div className="text-5xl animate-bounce">
              {state.winnerId === myPlayerId ? '🏆' : '💀'}
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-yellow-400 uppercase tracking-wider">
                {state.winnerId === myPlayerId 
                  ? (lang === 'en' ? 'YOU WON!' : 'BẠN ĐÃ CHIẾN THẮNG!') 
                  : (lang === 'en' ? 'GAME OVER!' : 'TRẬN ĐẤU KẾT THÚC!')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2">
                {lang === 'en' ? 'Sole Winner:' : 'Người chiến thắng duy nhất:'}{' '}
                <strong className="text-yellow-400 text-sm sm:text-base">
                  {state.players.find(p => p.id === state.winnerId)?.name || (lang === 'en' ? 'None' : 'Không có ai')}
                </strong>
              </p>
            </div>
            <button
              onClick={onLeaveGame}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-base rounded-2xl shadow-xl transition transform active:scale-95"
            >
              {lang === 'en' ? 'Back to Main Menu 🏠' : 'Trở Về Menu Chính 🏠'}
            </button>
          </div>
        </div>
      )}

      {/* Modal xác nhận khi chủ động Rời bàn giữa trận */}
      {showLeaveConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in select-none">
          <div className="bg-slate-900 border-4 border-slate-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="text-4xl animate-bounce">🚪</div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {lang === 'en' ? 'Confirm Leave Match?' : 'Xác Nhận Rời Trận Đấu?'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'en' 
                ? 'The game is in progress and you are still alive. If you leave now, AI Bot will take over so others can continue playing.' 
                : 'Trận đấu đang diễn ra và bạn vẫn còn sống. Nếu rời bàn lúc này, Bot AI sẽ tự động tiếp quản nhân vật của bạn để các người chơi khác tiếp tục trận đấu bình thường.'}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowLeaveConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                {lang === 'en' ? 'Stay & Play' : 'Ở Lại Chơi Tiếp'}
              </button>
              <button
                onClick={() => {
                  setShowLeaveConfirmModal(false);
                  onLeaveGame();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition cursor-pointer shadow-lg shadow-rose-600/30"
              >
                {lang === 'en' ? 'Confirm Leave' : 'Xác Nhận Rời Bàn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
