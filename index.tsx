
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { PageView, User, GameState, Card, Suit, Rank } from './types';
import { startGame, checkWinCondition } from './services/rummyService';

// --- MOCK DATA & CONFIG ---
const MOCK_USER: User = { id: '1', username: 'PlayerOne', chips: 1000 };
const RESTRICTED_STATES = ['Andhra Pradesh', 'Assam', 'Nagaland', 'Odisha', 'Sikkim', 'Telangana'];
// In a real app, this would use an IP-to-location service. We'll simulate it.
const MOCK_USER_LOCATION = 'Maharashtra'; // Change to a restricted state to test

// --- HELPER COMPONENTS ---

const CardComponent: React.FC<{ card: Card; onClick?: () => void; isSelected?: boolean }> = ({ card, onClick, isSelected }) => {
  const color = card.suit === Suit.Hearts || card.suit === Suit.Diamonds ? 'text-red-500' : 'text-black';
  const selectionClasses = isSelected ? 'ring-4 ring-blue-500 transform -translate-y-2' : 'hover:transform hover:-translate-y-2';
  return (
    <div
      onClick={onClick}
      className={`w-20 h-28 bg-white rounded-lg shadow-md flex flex-col justify-between p-2 cursor-pointer transition-transform duration-200 ${selectionClasses}`}
      aria-label={`${card.rank} of ${card.suit}`}
    >
      <span className={`text-xl font-bold ${color}`}>{card.rank}</span>
      <span className={`text-2xl self-center ${color}`}>{card.suit}</span>
      <span className={`text-xl font-bold self-end transform rotate-180 ${color}`}>{card.rank}</span>
    </div>
  );
};

const CardPlaceholder: React.FC<{ text?: string, onClick?: () => void }> = ({ text, onClick }) => (
  <div onClick={onClick} className="w-20 h-28 bg-blue-500 rounded-lg shadow-md flex items-center justify-center text-white font-bold cursor-pointer border-2 border-blue-700">
    {text || 'Deck'}
  </div>
);


// --- VIEW COMPONENTS ---

const AgeGateComponent: React.FC<{ onConfirm: () => void }> = ({ onConfirm }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-lg text-center shadow-xl">
      <h1 className="text-2xl font-bold mb-4">Welcome to Rummy Social Club</h1>
      <p className="mb-6">You must be 18 years or older to play.</p>
      <button onClick={onConfirm} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg mr-4">
        I am 18+
      </button>
      <a href="https://www.google.com" className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-6 rounded-lg">
        Exit
      </a>
    </div>
  </div>
);

const GeoBlockedComponent: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-screen text-center p-4">
    <h1 className="text-3xl font-bold text-red-600 mb-4">Access Restricted</h1>
    <p className="text-lg">We're sorry, but our services are not available in your region due to local regulations.</p>
    <p className="mt-2 text-sm text-gray-600">Restricted states include: {RESTRICTED_STATES.join(', ')}.</p>
  </div>
);

const AuthComponent: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin({ ...MOCK_USER, username: username.trim() });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login or Sign Up</h2>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Enter a Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., RummyKing123"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Play Now
        </button>
      </form>
    </div>
  );
};

const LobbyComponent: React.FC<{ user: User; onPlay: () => void }> = ({ user, onPlay }) => (
  <div className="container mx-auto p-4 text-center">
    <header className="bg-white p-6 rounded-lg shadow-md my-8">
        <h1 className="text-4xl font-bold">Welcome, {user.username}!</h1>
        <p className="text-xl text-gray-600 mt-2">Your Chips: <span className="font-bold text-yellow-500">{user.chips.toLocaleString()}</span></p>
    </header>
    <main>
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Ready to Play?</h2>
            <p className="mb-6">Join a table and test your Rummy skills!</p>
            <button onClick={onPlay} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
                Play Rummy
            </button>
        </div>
    </main>
  </div>
);

const GameComponent: React.FC<{ onEndGame: () => void }> = ({ onEndGame }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    setGameState(startGame());
  }, []);

  const handleSelectCard = (card: Card) => {
    if (gameState?.status !== 'playing') return;
    setSelectedCard(card);
  };

  const handleDrawFromDeck = () => {
    if (!gameState || gameState.status !== 'playing') return;
    const newDeck = [...gameState.deck];
    const drawnCard = newDeck.pop();
    if (drawnCard) {
      const newPlayerHand = [...gameState.playerHand, drawnCard];
      setGameState({ ...gameState, playerHand: newPlayerHand, deck: newDeck, message: "Your turn. Discard a card." });
      // Here you would typically lock drawing until a card is discarded
    }
  };
  
  const handleDiscard = () => {
    if (!gameState || !selectedCard || gameState.status !== 'playing') return;

    // Filter out the selected card from the player's hand
    const newPlayerHand = gameState.playerHand.filter(card => card.id !== selectedCard.id);
    
    // Ensure a card was actually removed (prevents invalid discards)
    if (newPlayerHand.length === gameState.playerHand.length) return;

    const newDiscardPile = [selectedCard, ...gameState.discardPile];
    setSelectedCard(null);

    // Check for win condition
    if (checkWinCondition(newPlayerHand)) {
        setGameState({
            ...gameState,
            playerHand: newPlayerHand,
            discardPile: newDiscardPile,
            status: 'won',
            message: 'Congratulations, you won!'
        });
        return;
    }

    setGameState({ ...gameState, playerHand: newPlayerHand, discardPile: newDiscardPile, message: "Opponent's turn..." });
    
    // Simulate opponent's turn after a short delay
    setTimeout(opponentTurn, 1500);
  };

  const opponentTurn = () => {
    setGameState(prevState => {
        if (!prevState || prevState.status !== 'playing') return prevState;
        let { deck, discardPile, opponentCardCount } = prevState;

        // Simple AI: always draw from deck and discard the first card
        const newDeck = [...deck];
        const drawnCard = newDeck.pop();
        if(!drawnCard) { // Deck is empty, handle reshuffle or end game
             return {...prevState, status: 'lost', message: "Game over! The deck is empty."};
        }
        
        // Opponent "discards" a card. We don't know which, but one is added to the pile.
        // For simulation, let's just take another card from the deck to be the discard.
        const discardedCard = newDeck.pop(); 
        if(!discardedCard) {
             return {...prevState, status: 'lost', message: "Game over! The deck is empty."};
        }
        
        const newDiscardPile = [discardedCard, ...discardPile];
        
        return {
            ...prevState,
            deck: newDeck,
            discardPile: newDiscardPile,
            message: 'Your turn. Draw a card from the deck or discard pile.',
        };
    });
  };

  if (!gameState) {
    return <div>Loading Game...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-green-800 p-4 font-sans">
        {/* Opponent's Hand */}
        <div className="flex justify-center mb-4">
            <div className="flex space-x-[-50px]">
            {Array.from({ length: gameState.opponentCardCount }).map((_, i) => (
                <div key={i} className="w-20 h-28 bg-blue-500 rounded-lg shadow-md border-2 border-blue-700"></div>
            ))}
            </div>
        </div>

        {/* Deck and Discard Pile */}
        <div className="flex justify-center items-center my-4 space-x-8">
            <CardPlaceholder text={`Deck (${gameState.deck.length})`} onClick={handleDrawFromDeck} />
            <div>
            <p className="text-white text-center mb-1">Discard Pile</p>
            {gameState.discardPile[0] ? <CardComponent card={gameState.discardPile[0]} /> : <div className="w-20 h-28 bg-green-700 rounded-lg"></div>}
            </div>
        </div>
         <p className="text-white text-center text-lg h-8">{gameState.message}</p>

        {/* Player's Hand */}
        <div className="flex-grow flex flex-col justify-end">
            <div className="flex justify-center items-end space-x-2 p-4 bg-black bg-opacity-20 rounded-t-xl">
            {gameState.playerHand.sort((a,b) => a.rank.localeCompare(b.rank)).map(card => (
                <CardComponent key={card.id} card={card} onClick={() => handleSelectCard(card)} isSelected={selectedCard?.id === card.id}/>
            ))}
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center p-2 space-x-4">
            <button onClick={handleDiscard} disabled={!selectedCard || gameState.status !== 'playing'} className="bg-red-500 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">
                Discard Selected
            </button>
             {gameState.status !== 'playing' ? (
                <button onClick={onEndGame} className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
                    Back to Lobby
                </button>
             ) : (
                <button onClick={onEndGame} className="bg-gray-500 text-white font-bold py-2 px-4 rounded">
                    Quit Game
                </button>
             )}
        </div>
    </div>
  );
};


const FooterComponent: React.FC = () => (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 text-xs text-center z-10">
        <div className="max-w-4xl mx-auto">
            <p className="font-bold mb-2">
                This is a Social Casino/Simulated Gaming platform. There is no real money wagering or winning of real-world prizes. For users 18+ only.
            </p>
            <p>
                <a href="#" className="underline hover:text-gray-300">Responsible Gaming</a> | <a href="#" className="underline hover:text-gray-300">Privacy Policy</a> | <a href="#" className="underline hover:text-gray-300">Terms of Service</a>
            </p>
        </div>
    </footer>
);

// --- MAIN APP ---

const App = () => {
  const [view, setView] = useState<PageView>(PageView.AgeGate);
  const [user, setUser] = useState<User | null>(null);
  const [isGeoBlocked, setIsGeoBlocked] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Check for geo-location first
    if (isGeoBlocked === null) {
      setIsGeoBlocked(RESTRICTED_STATES.includes(MOCK_USER_LOCATION));
      return;
    }

    if (isGeoBlocked) {
      setView(PageView.GeoBlocked);
      return;
    }
    
    // 2. If not blocked, check age gate
    const hasConfirmedAge = localStorage.getItem('ageConfirmed');
    if (!hasConfirmedAge) {
      setView(PageView.AgeGate);
    } else {
      setView(PageView.Auth);
    }
  }, [isGeoBlocked]);

  const handleAgeConfirm = () => {
    localStorage.setItem('ageConfirmed', 'true');
    setView(PageView.Auth);
  };
  
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView(PageView.Lobby);
  };

  const handlePlay = () => {
    setView(PageView.Game);
  };

  const handleEndGame = () => {
      setView(PageView.Lobby);
  }

  const renderView = () => {
    switch (view) {
      case PageView.GeoBlocked:
        return <GeoBlockedComponent />;
      case PageView.AgeGate:
        return <AgeGateComponent onConfirm={handleAgeConfirm} />;
      case PageView.Auth:
        return <AuthComponent onLogin={handleLogin} />;
      case PageView.Lobby:
        if (user) {
          return <LobbyComponent user={user} onPlay={handlePlay} />;
        }
        // Fallback to auth if user is null
        setView(PageView.Auth);
        return null;
      case PageView.Game:
        return <GameComponent onEndGame={handleEndGame} />;
      default:
        return <AuthComponent onLogin={handleLogin} />;
    }
  };

  return (
    <div className="font-sans">
      {view !== PageView.Game && <FooterComponent/>}
      <main className="pb-20"> {/* Padding to prevent content from being hidden by footer */}
        {renderView()}
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
