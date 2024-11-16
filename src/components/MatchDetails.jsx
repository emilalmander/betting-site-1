import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

const MatchDetails = () => {
  const { id } = useParams(); // Hämta match-id från URL
  const navigate = useNavigate(); // Navigering för tillbaka-knappen
  const { user } = useAuth(); // Hämta användarinfo
  const [match, setMatch] = useState(null); // Matchdata
  const [loading, setLoading] = useState(true); // Laddningsstatus
  const [error, setError] = useState(null); // Felstatus
  const [mockMatchDetails, setmockMatchDetails] = useState(null); // Felstatus 
  // State för gissning
  const [exactScore, setExactScore] = useState({ teamA: 20, teamB: 20 });
  const [winMargin, setWinMargin] = useState(0);
  const [winningTeam, setWinningTeam] = useState(null);
  const [totalGoals, setTotalGoals] = useState(0);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // Hämta matchdata från API
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/matches/${id}`);
        console.log('Matchdata:', response.data); // För debug
        setMatch(response.data);
      } catch (error) {
        console.error('Error fetching match:', error);
        setError('Kunde inte ladda matchen. Försök igen senare.');
        setMatch(mockMatchDetails);
      } finally {

        setLoading(false);
      }
    };
  
    fetchMatch();
  }, [id]);

  

  // Funktioner för att hantera gissningar
  const handleTeamSelection = (team) => {
    setWinningTeam(team);
  };

  const handleScoreChange = (team, increment) => {
    setExactScore((prevScore) => ({
      ...prevScore,
      [team]: Math.max(0, prevScore[team] + increment),
    }));
  };

  const handleTotalGoalsChange = (value) => {
    setTotalGoals((prevTotal) => Math.max(0, prevTotal + value));
  };

  const handleSubmitGuess = async () => {
    try {
      await axios.post('http://localhost:5000/api/guesses', {
        matchId: id,
        userId: user.id,
        exactScore,
        winMargin,
        winningTeam,
        totalGoals,
      });
      setHasGuessed(true);
      alert('Gissning skickad!');
    } catch (error) {
      console.error('Error submitting guess:', error);
      alert('Kunde inte skicka din gissning. Försök igen.');
    }
  };

  const handleChangeGuess = () => {
    setShowConfirmPopup(true);
  };

  const confirmChangeGuess = () => {
    setShowConfirmPopup(false);
    setHasGuessed(false); // Låter användaren göra en ny gissning
  };

  const cancelChangeGuess = () => {
    setShowConfirmPopup(false);
  };

  // Hantera laddning och fel
  if (loading) return <p className="text-center text-gray-400">Laddar matchdata...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-950 text-gray-200 p-6">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg text-center relative">
        
        {/* Tillbaka-knapp */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md"
        >
          Tillbaka
        </button>

        {/* Matchdetaljer */}
        <h2 className="text-3xl font-bold text-green-500 mb-4">
          {match.teamA} vs {match.teamB}
        </h2>
        <p className="text-gray-400 mb-6">
          {match.dateTime}
        </p>

       {/* Odds */}
{match.odds ? (
  <div className="bg-gray-800 p-4 rounded-lg text-white mb-6">
    <h3 className="text-lg font-semibold mb-2">Odds</h3>
    <div className="flex justify-between">
      <div className="text-center">
        <p>Team A</p>
        <p>{match.odds.teamA}</p>
      </div>
      <div className="text-center">
        <p>Oavgjort</p>
        <p>{match.odds.draw}</p>
      </div>
      <div className="text-center">
        <p>Team B</p>
        <p>{match.odds.teamB}</p>
      </div>
    </div>
  </div>
) : (
  <div className="bg-gray-800 p-4 rounded-lg text-white mb-6">
    <h3 className="text-lg font-semibold mb-2">Odds</h3>
    <p className="text-center text-gray-400">Odds är inte tillgängliga för denna match.</p>
  </div>
)}

        {/* Exakt resultat */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Exakt Resultat</h3>
          <div className="flex justify-center gap-4">
            {['teamA', 'teamB'].map((team) => (
              <div key={team} className="text-center">
                <button
                  onClick={() => handleScoreChange(team, 1)}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold"
                >
                  +
                </button>
                <p className="text-xl font-semibold mt-2 mb-2">{exactScore[team]}</p>
                <button
                  onClick={() => handleScoreChange(team, -1)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold"
                >
                  -
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Skicka eller Ändra Gissning */}
        <button
          onClick={hasGuessed ? handleChangeGuess : handleSubmitGuess}
          className={`w-full ${hasGuessed ? 'bg-red-500' : 'bg-green-500'} hover:bg-green-600 text-white py-2 rounded-md font-semibold transition duration-200`}
        >
          {hasGuessed ? 'Ändra Gissning' : 'Skicka Gissning'}
        </button>

        {/* Bekräftelseprompt för ändring */}
        {showConfirmPopup && (
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <p className="text-white mb-4">Vill du ändra din gissning?</p>
              <button
                onClick={confirmChangeGuess}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md mr-2"
              >
                Ja
              </button>
              <button
                onClick={cancelChangeGuess}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Nej
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchDetails;
