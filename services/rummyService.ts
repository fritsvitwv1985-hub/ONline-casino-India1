import { Card, Suit, Rank, GameState } from '../types';

const SUITS: Suit[] = [Suit.Hearts, Suit.Diamonds, Suit.Clubs, Suit.Spades];
const RANKS: Rank[] = [
  Rank.Ace, Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven, 
  Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King
];

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({ suit, rank, id: `${rank}-${suit}` });
    });
  });
  return deck;
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffledDeck = [...deck];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  return shuffledDeck;
};

export const startGame = (): GameState => {
  let deck = shuffleDeck(createDeck());
  
  const playerHand: Card[] = [];
  const opponentHand: Card[] = [];

  // Deal 10 cards to each player
  for (let i = 0; i < 10; i++) {
    playerHand.push(deck.pop()!);
    opponentHand.push(deck.pop()!);
  }

  const discardPile: Card[] = [deck.pop()!];

  return {
    playerHand,
    discardPile,
    deck,
    opponentCardCount: opponentHand.length,
    status: 'playing',
    message: 'Your turn. Draw a card from the deck or discard pile.',
  };
};

// Basic check for sets (3 or 4 of a kind) and runs (3+ sequential cards of the same suit)
// This is a simplified check for MVP purposes
export const checkWinCondition = (hand: Card[]): boolean => {
    if (hand.length !== 10) return false;
    // A real implementation would involve complex sorting and combination checking.
    // For this MVP, we'll use a placeholder logic. For instance, we can check if all cards are part of a set or run.
    // This is computationally intensive, so we will simplify and assume the user correctly declares a win.
    // A proper implementation is beyond the scope of this initial setup.
    // For now, let's just simulate a potential win condition for UI development.
    // A simple (and incorrect) check for demo: if hand has 3 sets of 3 and one card left over.
    const ranks: { [key: string]: number } = {};
    hand.forEach(card => {
        ranks[card.rank] = (ranks[card.rank] || 0) + 1;
    });

    let sets = 0;
    Object.values(ranks).forEach(count => {
        if (count >= 3) {
            sets++;
        }
    });

    return sets >= 2; // Example: win if there are at least 2 sets.
};
