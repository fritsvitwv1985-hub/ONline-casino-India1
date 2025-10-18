
export enum PageView {
  AgeGate,
  GeoBlocked,
  Auth,
  Lobby,
  Game,
}

export interface User {
  id: string;
  username: string;
  chips: number;
}

export enum Suit {
  Hearts = '♥',
  Diamonds = '♦',
  Clubs = '♣',
  Spades = '♠',
}

export enum Rank {
  Ace = 'A',
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = '10',
  Jack = 'J',
  Queen = 'Q',
  King = 'K',
}

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export interface GameState {
  playerHand: Card[];
  discardPile: Card[];
  deck: Card[];
  opponentCardCount: number;
  status: 'playing' | 'won' | 'lost';
  message: string;
}
