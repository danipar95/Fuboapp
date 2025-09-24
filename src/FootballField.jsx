import React, { useState, useEffect } from 'react';
import './FootballField.css';
import playersData from './players.json';
import Modal from './Modal'; // Importamos el componente Modal
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const positionOrder = ["Delantero", "Mediocampista", "Defensa", "Portero"];
const availableFormations = ["5-3-2", "5-4-1", "4-4-2", "4-3-3", "4-5-1", "3-5-2", "3-4-3"];

const hardcodedUsers = {
  "Blackbird": "Sergio", "CMP": "Danilo", "Danipar": "Tulio", "SilverCrows": "Roman",
  "Invernalia": "Barrios", "Piris": "Alan", "Red Devils": "Marzio", "LORD": "RuizDiaz"
};

const formationPositions = {
  "5-3-2": [
    { y: 7, x: 50, position: 'Portero' }, { y: 30, x: 10, position: 'Defensa' },
    { y: 25, x: 30, position: 'Defensa' }, { y: 20, x: 50, position: 'Defensa' },
    { y: 25, x: 70, position: 'Defensa' }, { y: 30, x: 90, position: 'Defensa' },
    { y: 55, x: 25, position: 'Mediocampista' }, { y: 55, x: 50, position: 'Mediocampista' },
    { y: 55, x: 75, position: 'Mediocampista' }, { y: 80, x: 35, position: 'Delantero' },
    { y: 80, x: 65, position: 'Delantero' }
  ],
  "5-4-1": [
     { y: 7, x: 50, position: 'Portero' }, { y: 30, x: 10, position: 'Defensa' },
    { y: 25, x: 30, position: 'Defensa' }, { y: 20, x: 50, position: 'Defensa' },
    { y: 25, x: 70, position: 'Defensa' }, { y: 30, x: 90, position: 'Defensa' },
    { y: 55, x: 15, position: 'Mediocampista' }, { y: 45, x: 30, position: 'Mediocampista' },
    { y: 45, x: 70, position: 'Mediocampista' }, { y: 55, x: 85, position: 'Mediocampista' },
    { y: 80, x: 50, position: 'Delantero' }
  ],
  "4-4-2": [
    { y: 7, x: 50, position: 'Portero' }, 
    { y: 30, x: 15, position: 'Defensa' },{ y: 20, x: 30, position: 'Defensa' }, 
    { y: 20, x: 70, position: 'Defensa' },{ y: 30, x: 85, position: 'Defensa' }, 
    { y: 55, x: 15, position: 'Mediocampista' }, { y: 45, x: 30, position: 'Mediocampista' },
    { y: 45, x: 70, position: 'Mediocampista' }, { y: 55, x: 85, position: 'Mediocampista' },
    { y: 80, x: 35, position: 'Delantero' },{ y: 80, x: 65, position: 'Delantero' }
  ],
  "4-3-3": [
    { y: 7, x: 50, position: 'Portero' }, 
    { y: 30, x: 15, position: 'Defensa' },{ y: 20, x: 30, position: 'Defensa' }, 
    { y: 20, x: 70, position: 'Defensa' },{ y: 30, x: 85, position: 'Defensa' }, 
    { y: 55, x: 25, position: 'Mediocampista' }, { y: 55, x: 50, position: 'Mediocampista' },
    { y: 55, x: 75, position: 'Mediocampista' },
    { y: 80, x: 25, position: 'Delantero' }, { y: 85, x: 50, position: 'Delantero' },
    { y: 80, x: 75, position: 'Delantero' }
  ],
  "4-5-1": [
    { y: 7, x: 50, position: 'Portero' }, 
    { y: 30, x: 15, position: 'Defensa' },{ y: 20, x: 30, position: 'Defensa' }, 
    { y: 20, x: 70, position: 'Defensa' },{ y: 30, x: 85, position: 'Defensa' }, 
    { y: 60, x: 10, position: 'Mediocampista' },
    { y: 55, x: 30, position: 'Mediocampista' }, { y: 45, x: 50, position: 'Mediocampista' },
    { y: 55, x: 70, position: 'Mediocampista' }, { y: 60, x: 90, position: 'Mediocampista' },
        { y: 80, x: 50, position: 'Delantero' }
  ],
  "3-5-2": [
    { y: 7, x: 50, position: 'Portero' }, { y: 25, x: 20, position: 'Defensa' },
    { y: 20, x: 50, position: 'Defensa' }, { y: 25, x: 75, position: 'Defensa' },
    { y: 60, x: 10, position: 'Mediocampista' },
    { y: 55, x: 30, position: 'Mediocampista' }, { y: 45, x: 50, position: 'Mediocampista' },
    { y: 55, x: 70, position: 'Mediocampista' }, { y: 60, x: 90, position: 'Mediocampista' },
    { y: 80, x: 35, position: 'Delantero' },{ y: 80, x: 65, position: 'Delantero' }
  ],
  "3-4-3": [
    { y: 7, x: 50, position: 'Portero' }, { y: 25, x: 20, position: 'Defensa' },
    { y: 20, x: 50, position: 'Defensa' }, { y: 25, x: 75, position: 'Defensa' },
     { y: 55, x: 15, position: 'Mediocampista' }, { y: 45, x: 30, position: 'Mediocampista' },
    { y: 45, x: 70, position: 'Mediocampista' }, { y: 55, x: 85, position: 'Mediocampista' },
   { y: 80, x: 25, position: 'Delantero' }, { y: 85, x: 50, position: 'Delantero' },
    { y: 80, x: 75, position: 'Delantero' }
  ]
};

const PlayerOnField = ({ player, onClick, onDragStart }) => {
  return (
    <div
      className="player-on-field"
      style={{ top: `${player.y}%`, left: `${player.x}%` }}
      onClick={() => onClick(player.id)}
      draggable="true"
      onDragStart={onDragStart}
    >
      <div className="player-info">
        <span className="player-name">{player.name}</span>
        <span className="player-team">{player.teamName}</span>
      </div>
    </div>
  );
};

const PlayerPlaceholder = ({ position, top, left, onDropPlayer, onDragOver }) => {
  return (
    <div
      className="player-placeholder"
      style={{ top: `${top}%`, left: `${left}%` }}
      onDrop={(e) => onDropPlayer(e, { position, top, left })}
      onDragOver={onDragOver}
    >
      {position.substring(0, 3)}
    </div>
  );
};

const FootballField = () => {
  const [selectedTeam, setSelectedTeam] = useState(playersData[0]);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [selectedFormation, setSelectedFormation] = useState(availableFormations[2]);
  const [onFieldPlayers, setOnFieldPlayers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [modalMessage, setModalMessage] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    if (loggedInUser) {
      const savedPlayers = localStorage.getItem(`team-${loggedInUser}`);
      if (savedPlayers) {
        setOnFieldPlayers(JSON.parse(savedPlayers));
      } else {
        setOnFieldPlayers([]);
      }
    }
  }, [loggedInUser]);

  const handleTeamChange = (event) => {
    const teamName = event.target.value;
    const team = playersData.find(t => t.teamName === teamName);
    setSelectedTeam(team);
  };

  const handleFormationChange = (event) => {
    setSelectedFormation(event.target.value);
    setOnFieldPlayers([]);
  };

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const handleDragStart = (e, player) => {
    const playerDataWithTeam = { ...player, teamName: selectedTeam.teamName };
    e.dataTransfer.setData("player", JSON.stringify(playerDataWithTeam));
    setIsPanelOpen(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropPlayer = (e, targetPosition) => {
    e.preventDefault();
    setIsPanelOpen(true);
    const playerData = JSON.parse(e.dataTransfer.getData("player"));

    const playersFromSameTeam = onFieldPlayers.filter(p => p.teamName === playerData.teamName);
    if (playersFromSameTeam.length >= 2) {
      setModalMessage(`¡Solo puedes tener un máximo de dos jugadores de ${playerData.teamName} en el campo!`);
      return;
    }

    if (playerData.position !== targetPosition.position) {
      setModalMessage(`¡${playerData.position} no puede ir en la posición de ${targetPosition.position}!`);
      return;
    }

    const isPositionOccupied = onFieldPlayers.some(p => p.x === targetPosition.left && p.y === targetPosition.top);
    if (isPositionOccupied) {
      setModalMessage("¡Esa posición ya está ocupada!");
      return;
    }

    const isPlayerOnField = onFieldPlayers.some(p => p.id === playerData.id);
    if (isPlayerOnField) {
      // Si el jugador ya está en el campo, actualiza su posición
      const newPlayers = onFieldPlayers.map(p => {
        if (p.id === playerData.id) {
          return { ...p, x: targetPosition.left, y: targetPosition.top };
        }
        return p;
      });
      setOnFieldPlayers(newPlayers);
    } else {
      // Si es un jugador nuevo, agrégalo
      const newPlayerOnField = { ...playerData, x: targetPosition.left, y: targetPosition.top };
      setOnFieldPlayers([...onFieldPlayers, newPlayerOnField]);
    }
  };

  const removePlayerFromField = (playerId) => {
    setOnFieldPlayers(onFieldPlayers.filter(p => p.id !== playerId));
  };

  const groupPlayersByPosition = (players) => {
    const grouped = {};
    players.forEach(player => {
      if (!grouped[player.position]) {
        grouped[player.position] = [];
      }
      grouped[player.position].push(player);
    });
    return grouped;
  };

  const groupedPlayers = selectedTeam ? groupPlayersByPosition(selectedTeam.players) : {};
  const availablePlayers = selectedTeam.players.filter(player => !onFieldPlayers.some(p => p.id === player.id));
  const groupedAvailablePlayers = groupPlayersByPosition(availablePlayers);

  const handleLogin = (e) => {
    e.preventDefault();
    if (hardcodedUsers[username] === password) {
      setLoggedInUser(username);
      setPassword('');
      setModalMessage(`¡Bienvenido, ${username}!`);
    } else {
      setModalMessage('Usuario o contraseña incorrectos.');
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setOnFieldPlayers([]);
    setModalMessage('Has cerrado sesión.');
  };

  /*const handleSaveTeam = () => {
    if (loggedInUser) {
      localStorage.setItem(`team-${loggedInUser}`, JSON.stringify(onFieldPlayers));
      setModalMessage('¡Equipo guardado con éxito!');
    }
  };*/
    const handleSaveTeam = () => {
    if (loggedInUser) {
        setConfirmModal({
        message: '¡Equipo guardado con éxito! ¿Quieres también descargarlo como una imagen?',
        onConfirm: () => {
            localStorage.setItem(`team-${loggedInUser}`, JSON.stringify(onFieldPlayers));
            setConfirmModal(null);
            handleDownloadImage();
        },
        onCancel: () => {
            localStorage.setItem(`team-${loggedInUser}`, JSON.stringify(onFieldPlayers));
            setConfirmModal(null);
        }
        });
 const handleDownloadImage = () => {
  const input = document.getElementById('field-boundary');
  if (input) {
    html2canvas(input, {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
    }).then(function(canvas) {
      const now = new Date();
      
      // Formatear la fecha
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      
      // Formatear la hora, minuto y segundo
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      // Crear el nombre del archivo con usuario, fecha y hora
      const filename = `${loggedInUser}-${year}-${month}-${day} ${hours}:${minutes}:${seconds}.png`;

      canvas.toBlob(function(blob) {
        saveAs(blob, filename);
      });
    });
  }
};
  }
};

  return (
    <div className="field-container">
      {modalMessage && <Modal message={modalMessage} onClose={() => setModalMessage(null)} />}
        {confirmModal && (
    <Modal
        message={confirmModal.message}
        onClose={confirmModal.onCancel}
        onConfirm={confirmModal.onConfirm}
        showButtons={true}
    />
    )}
      {!loggedInUser ? (
        <div className="login-form-container">
          <form onSubmit={handleLogin} className="login-form">
            <h2>Iniciar Sesión</h2>
            <p>FUBOLITO V1.0</p>
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Ingresar</button>
          </form>
        </div>
      ) : (
        <div className="field-and-panel-wrapper">
          <div className="field-boundary" id="field-boundary">
            <div className="halfway-line"></div>
            <div className="center-circle"></div>
            <div className="center-spot"></div>
            <div className="goal-area top"><div className="small-goal-area"></div><div className="penalty-spot"></div><div className="penalty-arc"></div></div>
            <div className="goal-area bottom"><div className="small-goal-area"></div><div className="penalty-spot"></div><div className="penalty-arc"></div></div>
            <div className="goal top"></div>
            <div className="goal bottom"></div>
            <div className="corner-arc top-left"></div>
            <div className="corner-arc top-right"></div>
            <div className="corner-arc bottom-left"></div>
            <div className="corner-arc bottom-right"></div>

            {formationPositions[selectedFormation].map((pos, index) => {
              const isOccupied = onFieldPlayers.some(p => p.x === pos.x && p.y === pos.y);
              if (isOccupied) return null;
              return (
                <PlayerPlaceholder
                  key={`${pos.y}-${pos.x}`}
                  top={pos.y}
                  left={pos.x}
                  position={pos.position}
                  onDropPlayer={handleDropPlayer}
                  onDragOver={handleDragOver}
                />
              );
            })}

            {onFieldPlayers.map(player => (
              <PlayerOnField
                key={player.id}
                player={player}
                onClick={removePlayerFromField}
                onDragStart={(e) => handleDragStart(e, player)} // Agregamos el onDragStart aquí para permitir mover jugadores ya en el campo
              />
            ))}
          </div>
          
          <div className={`teams-list-panel ${isPanelOpen ? 'panel-open' : ''}`}>
            <button onClick={togglePanel} className="panel-toggle-btn">
              {isPanelOpen ? '▲' : '▼'}
            </button>
            <div className="teams-list-content">
              <div className="user-info">
                <h3>Usuario: {loggedInUser}</h3>
                <button onClick={handleSaveTeam}>Guardar Equipo</button>
                <button onClick={handleLogout}>Cerrar Sesión</button>
              </div>
              <div className="select-container">
                <label htmlFor="formation-select">Alineación:</label>
                <select id="formation-select" onChange={handleFormationChange} value={selectedFormation}>
                  {availableFormations.map((formation) => (
                    <option key={formation} value={formation}>{formation}</option>
                  ))}
                </select>
              </div>
              <h2>Equipos y Jugadores</h2>
              <div className="select-container">
                <label htmlFor="team-select">Selecciona un equipo:</label>
                <select id="team-select" onChange={handleTeamChange} value={selectedTeam?.teamName || ''}>
                  {playersData.map((team) => (
                    <option key={team.teamName} value={team.teamName}>{team.teamName}</option>
                  ))}
                </select>
              </div>
              {selectedTeam && (
                <div className="players-by-position">
                  {positionOrder.map(position => {
                    const playersInPosition = groupedAvailablePlayers[position];
                    if (!playersInPosition || playersInPosition.length === 0) return null;
                    return (
                      <div key={position} className="position-group">
                        <h3>{position}</h3>
                        <ul>
                          {playersInPosition.map(player => (
                            <li
                              key={player.id}
                              draggable="true"
                              onDragStart={(e) => handleDragStart(e, player)}
                              className="draggable-player"
                            >
                              <strong>{player.name}</strong> - {player.position}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FootballField;