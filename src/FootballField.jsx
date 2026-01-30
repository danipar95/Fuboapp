import React, { useState, useEffect } from 'react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import './FootballField.css';
import playersData from './players.json';
import Modal from './Modal';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const availableFormations = ["5-3-2", "5-4-1", "4-4-2", "4-3-3", "4-5-1", "3-5-2", "3-4-3"];

const hardcodedUsers = {
  "Blackbird": "Sergio", "CMP": "Danilo", "Danipar": "Tulio", "SilverCrows": "Roman",
  "Invernalia": "Barrios", "Piris": "Alan", "Red Devils": "Marzio", "LORD": "RuizDiaz"
};

const scoresData = [
  { rank: 1, team: "Blackbird", dt: "Sergio", points: 0 },
  { rank: 2, team: "CMP", dt: "Danilo", points: 0 },
  { rank: 3, team: "Danipar", dt: "Tulio", points: 0 },
  { rank: 4, team: "La Fabrica", dt: "Maxi", points: 0 },
  { rank: 5, team: "Invernalia", dt: "Barrios", points: 0 },
  { rank: 6, team: "Piris", dt: "Alan", points: 0 },
  { rank: 7, team: "Red Devils", dt: "Marzio", points: 0 },
  { rank: 8, team: "LORD", dt: "RuizDiaz", points: 0 },
  { rank: 9, team: "Milico", dt: "Rodrigo", points: 0 },
  { rank: 10, team: "Tifosi", dt: "Pino", points: 0 },
  { rank: 11, team: "Pynandi", dt: "Duarte", points: 0 },
  { rank: 12, team: "Celtic", dt: "Fede", points: 0 },

];
const formationPositions = {
  "5-3-2": [{y:7,x:50,pos:'Portero'},{y:30,x:10,pos:'Defensa'},{y:25,x:30,pos:'Defensa'},{y:20,x:50,pos:'Defensa'},{y:25,x:70,pos:'Defensa'},{y:30,x:90,pos:'Defensa'},{y:55,x:25,pos:'Mediocampista'},{y:55,x:50,pos:'Mediocampista'},{y:55,x:75,pos:'Mediocampista'},{y:80,x:35,pos:'Delantero'},{y:80,x:65,pos:'Delantero'}],
  "5-4-1": [{y:7,x:50,pos:'Portero'},{y:30,x:10,pos:'Defensa'},{y:25,x:30,pos:'Defensa'},{y:20,x:50,pos:'Defensa'},{y:25,x:70,pos:'Defensa'},{y:30,x:90,pos:'Defensa'},{y:55,x:15,pos:'Mediocampista'},{y:45,x:30,pos:'Mediocampista'},{y:45,x:70,pos:'Mediocampista'},{y:55,x:85,pos:'Mediocampista'},{y:80,x:50,pos:'Delantero'}],
  "4-4-2": [{y:7,x:50,pos:'Portero'},{y:30,x:15,pos:'Defensa'},{y:20,x:30,pos:'Defensa'},{y:20,x:70,pos:'Defensa'},{y:30,x:85,pos:'Defensa'},{y:55,x:15,pos:'Mediocampista'},{y:45,x:30,pos:'Mediocampista'},{y:45,x:70,pos:'Mediocampista'},{y:55,x:85,pos:'Mediocampista'},{y:80,x:35,pos:'Delantero'},{y:80,x:65,pos:'Delantero'}],
  "4-3-3": [{y:7,x:50,pos:'Portero'},{y:30,x:15,pos:'Defensa'},{y:20,x:30,pos:'Defensa'},{y:20,x:70,pos:'Defensa'},{y:30,x:85,pos:'Defensa'},{y:55,x:25,pos:'Mediocampista'},{y:55,x:50,pos:'Mediocampista'},{y:55,x:75,pos:'Mediocampista'},{y:80,x:25,pos:'Delantero'},{y:85,x:50,pos:'Delantero'},{y:80,x:75,pos:'Delantero'}],
  "4-5-1": [{y:7,x:50,pos:'Portero'},{y:30,x:15,pos:'Defensa'},{y:20,x:30,pos:'Defensa'},{y:20,x:70,pos:'Defensa'},{y:30,x:85,pos:'Defensa'},{y:60,x:10,pos:'Mediocampista'},{y:55,x:30,pos:'Mediocampista'},{y:45,x:50,pos:'Mediocampista'},{y:55,x:70,pos:'Mediocampista'},{y:60,x:90,pos:'Mediocampista'},{y:80,x:50,pos:'Delantero'}],
  "3-5-2": [{y:7,x:50,pos:'Portero'},{y:25,x:20,pos:'Defensa'},{y:20,x:50,pos:'Defensa'},{y:25,x:75,pos:'Defensa'},{y:60,x:10,pos:'Mediocampista'},{y:55,x:30,pos:'Mediocampista'},{y:45,x:50,pos:'Mediocampista'},{y:55,x:70,pos:'Mediocampista'},{y:60,x:90,pos:'Mediocampista'},{y:80,x:35,pos:'Delantero'},{y:80,x:65,pos:'Delantero'}],
  "3-4-3": [{y:7,x:50,pos:'Portero'},{y:25,x:20,pos:'Defensa'},{y:20,x:50,pos:'Defensa'},{y:25,x:75,pos:'Defensa'},{y:55,x:15,pos:'Mediocampista'},{y:45,x:30,pos:'Mediocampista'},{y:45,x:70,pos:'Mediocampista'},{y:55,x:85,pos:'Mediocampista'},{y:80,x:25,pos:'Delantero'},{y:85,x:50,pos:'Delantero'},{y:80,x:75,pos:'Delantero'}]
};


const DraggablePlayer = ({ player, teamName }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    data: { ...player, teamName }
  });
  const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.3 : 1 };
  return (
    <li ref={setNodeRef} style={style} {...listeners} {...attributes} className="draggable-player">
      <strong>{player.name}</strong>
    </li>
  );
};

const PlayerPlaceholder = ({ id, position, top, left }) => {
  const { setNodeRef, isOver } = useDroppable({ id, data: { position, top, left } });
  return (
    <div ref={setNodeRef} className={`player-placeholder ${isOver ? 'is-over' : ''}`} style={{ top: `${top}%`, left: `${left}%` }}>
      {position.substring(0, 3)}
    </div>
  );
};

const FootballField = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(playersData[0]);
  const [selectedFormation, setSelectedFormation] = useState("4-4-2");
  const [onFieldPlayers, setOnFieldPlayers] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activePlayer, setActivePlayer] = useState(null);
  const [modalMessage, setModalMessage] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [captainId, setCaptainId] = useState(null);
  const [selectedDT, setSelectedDT] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [activeTab, setActiveTab] = useState('armar');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 1000, tolerance: 10 } })
  );

 const playWhistle = () => {
  const audio = new Audio('https://www.soundjay.com/sports/sounds/referee-whistle-01-short.mp3');
  audio.volume = 0.2; // Un volumen sutil para que no sea molesto
  audio.play().catch(e => console.log("Audio esperando interacción"));
};

  useEffect(() => {
    if (loggedInUser) {
      const savedData = localStorage.getItem(`team-${loggedInUser}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setOnFieldPlayers(parsed.players || []);
        setCaptainId(parsed.captainId || null);
        setSelectedDT(parsed.selectedDT || "");
        if (parsed.formation) setSelectedFormation(parsed.formation);
      }
    }
  }, [loggedInUser]);

  const isFormationDisabled = (fName) => {
    if (onFieldPlayers.length === 0) return false;
    const currentCounts = onFieldPlayers.reduce((acc, p) => {
      acc[p.position] = (acc[p.position] || 0) + 1;
      return acc;
    }, {});
    const targetSlots = formationPositions[fName].reduce((acc, slot) => {
      acc[slot.pos] = (acc[slot.pos] || 0) + 1;
      return acc;
    }, {});
    return ['Portero', 'Defensa', 'Mediocampista', 'Delantero'].some(pos =>
      (currentCounts[pos] || 0) > (targetSlots[pos] || 0)
    );
  };

  const handleFormationChange = (newF) => {
    if (isFormationDisabled(newF)) return;
    const slots = [...formationPositions[newF]];
    const updated = onFieldPlayers.map(p => {
      const idx = slots.findIndex(s => s.pos === p.position);
      const slot = slots[idx];
      slots.splice(idx, 1);
      return { ...p, x: slot.x, y: slot.y };
    });
    setOnFieldPlayers(updated);
    setSelectedFormation(newF);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setOnFieldPlayers([]);
    setSelectedDT("");
    setUsername("");
    setPassword("");
  };

  const handleDragStart = (e) => {
    setActivePlayer(e.active.data.current);
    if (window.innerWidth < 768) setIsPanelOpen(false);
  };

  const handleDragEnd = (event) => {
    const { over, active } = event;
    setActivePlayer(null);
    setIsPanelOpen(true);
    if (over && active) {
  const pData = active.data.current;
  const tPos = over.data.current;

  // 1. Error: Jugador repetido
  if (onFieldPlayers.some(p => p.id === pData.id)) {
    playWhistle(); // ¡PRRRRRT!
    return setModalMessage("Ya está en el campo");
  }

  // 2. Error: Validación de cupos por equipo
  const teamCount = onFieldPlayers.filter(p => p.teamName === pData.teamName).length;
  if (pData.teamName === selectedDT) {
    if (teamCount >= 1) {
      playWhistle(); // ¡PRRRRRT!
      return setModalMessage(`Máximo 1 de ${pData.teamName} (DT).`);
    }
  } else {
    if (teamCount >= 2) {
      playWhistle(); // ¡PRRRRRT!
      return setModalMessage(`Máximo 2 de ${pData.teamName}.`);
    }
  }

  // 3. Error: Posición incorrecta en la cancha
  if (pData.position !== tPos.position) {
    playWhistle(); // ¡PRRRRRT!
    return setModalMessage("Posición incorrecta");
  }

  // Si pasa todas las reglas, se agrega sin silbato
  setOnFieldPlayers(prev => [...prev, { ...pData, x: tPos.left, y: tPos.top }]);
}
  };

  const handleSaveTeam = () => {
    if (onFieldPlayers.length !== 11) return setModalMessage("Faltan jugadores (11).");
    if (!captainId) return setModalMessage("Doble clic para marcar al Capitán.");
    if (!selectedDT) return setModalMessage("Falta elegir el DT de la fecha.");
    const fecha = new Date().toLocaleString();
    setTimestamp(fecha);
    setConfirmModal({
      message: '¿Descargar imagen del equipo?',
      onConfirm: () => {
        localStorage.setItem(`team-${loggedInUser}`, JSON.stringify({
          players: onFieldPlayers, captainId, formation: selectedFormation, selectedDT, timestamp: fecha
        }));
        setTimeout(() => {
          html2canvas(document.getElementById('capture-area'), { useCORS: true, backgroundColor: "#000", scale: 2 }).then(canvas => {
            saveAs(canvas.toDataURL(), `${loggedInUser}-equipo.png`);
          });
          setConfirmModal(null);
        }, 100);
      },
      onCancel: () => { setConfirmModal(null); setTimestamp(""); }
    });
  };

  if (!loggedInUser) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <span className="logo-icon">⚽</span>
          <h1>FUBOLITO 2026</h1>
          <p>Ingresa tus credenciales de DT</p>
        </div>

        <form className="login-form" onSubmit={(e) => {
          e.preventDefault();
          if (hardcodedUsers[username] === password) setLoggedInUser(username);
          else {
            playWhistle(); // ¡Silbatazo por login fallido!
            setModalMessage("Usuario o contraseña incorrectos");
          }
        }}>
          <div className="input-group">
            <label>Usuario</label>
            <input
              type="text"
              placeholder="Nombre de tu equipo..."
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">
            INICIAR SESIÓN
          </button>
        </form>

        <div className="login-footer">
          © danipar - 2026
        </div>
      </div>
    </div>
  );
}

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="field-container">
        {modalMessage && <Modal message={modalMessage} onClose={() => setModalMessage(null)} />}
        {confirmModal && <Modal message={confirmModal.message} onClose={confirmModal.onCancel} onConfirm={confirmModal.onConfirm} showButtons={true} />}

        <div className="field-and-panel-wrapper">
          <div id="capture-area" className="capture-wrapper">
            <div className="field-boundary">
              <div className="halfway-line"></div><div className="center-circle"></div>
              {formationPositions[selectedFormation].map((pos, i) => {
                const occupied = onFieldPlayers.some(p => Math.abs(p.x - pos.x) < 1 && Math.abs(p.y - pos.y) < 1);
                return !occupied && <PlayerPlaceholder key={`slot-${selectedFormation}-${i}`} id={`slot-${i}`} position={pos.pos} top={pos.y} left={pos.x}/>;
              })}
              {onFieldPlayers.map(p => (
                <div key={p.id} className={`player-on-field ${captainId === p.id ? 'is-captain' : ''}`} style={{top: `${p.y}%`, left: `${p.x}%`}} onDoubleClick={() => setCaptainId(p.id === captainId ? null : p.id)}>
                  {captainId === p.id && <span className="captain-armband">©</span>}
                  <span className="player-name">{p.name}</span>
                  <span className="player-team">{p.teamName}</span>
                  <button className="delete-player-btn" onClick={(e) => {
                    e.stopPropagation();
                    setOnFieldPlayers(onFieldPlayers.filter(pl => pl.id !== p.id));
                    if (captainId === p.id) setCaptainId(null);
                  }}>×</button>
                </div>
              ))}
            </div>
            <div className="photo-caption-footer">
               <div className="caption-top"><span className="caption-user">{loggedInUser.toUpperCase()}</span><span className="caption-formation">{selectedFormation}</span></div>
               <div className="caption-bottom"><span>DT: {selectedDT || "---"}</span><span>{timestamp}</span></div>
            </div>
          </div>

          <div className={`teams-list-panel ${isPanelOpen ? 'panel-open' : ''}`}>
            {/* Este es el botón que "tira" del panel hacia arriba en el celular */}
  <button onClick={() => setIsPanelOpen(!isPanelOpen)} className="panel-toggle-btn">
    {isPanelOpen ? '▼ CERRAR MENÚ' : '▲ ARMAR EQUIPO / POSICIONES'}
  </button>
            <div className="tabs-header">
              <button className={`tab-btn ${activeTab === 'armar' ? 'active' : ''}`} onClick={() => setActiveTab('armar')}>⚙️ Armar</button>
              <button className={`tab-btn ${activeTab === 'puntos' ? 'active' : ''}`} onClick={() => setActiveTab('puntos')}>🏆 Puntos</button>
            </div>
            <div className="teams-list-content">
              {activeTab === 'armar' ? (
                <>
                  <div className="panel-header-row"><h3>{loggedInUser}</h3><button className="logout-btn" onClick={handleLogout}>Salir</button></div>
                  <button className="save-btn" onClick={handleSaveTeam}>Descargar Imagen</button>
                  <div className="select-group">
                    <label>Formación</label>
                    <select value={selectedFormation} onChange={e => handleFormationChange(e.target.value)}>
                      {availableFormations.map(f => (
                        <option key={f} value={f} disabled={isFormationDisabled(f)}>
                          {f} {isFormationDisabled(f) ? '(Incompatible)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="select-group">
                    <label>DT de la Fecha</label>
                    <select value={selectedDT} onChange={e => setSelectedDT(e.target.value)}>
                      <option value="">Elegir...</option>
                      {playersData.map(t => <option key={t.teamName} value={t.teamName}>{t.teamName}</option>)}
                    </select>
                  </div>
                  <div className="select-group">
                    <label>Club</label>
                    <select onChange={e => setSelectedTeam(playersData.find(t => t.teamName === e.target.value))}>
                      {playersData.map(t => <option key={t.teamName} value={t.teamName}>{t.teamName}</option>)}
                    </select>
                  </div>
                  <div className="players-by-position">
                    {['Portero', 'Defensa', 'Mediocampista', 'Delantero'].map(pos => (
                      <div key={pos} className="position-section">
                        <h4>{pos}s</h4>
                        <ul>{selectedTeam.players.filter(p => p.position === pos && !onFieldPlayers.some(fp => fp.id === p.id)).map(p => <DraggablePlayer key={p.id} player={p} teamName={selectedTeam.teamName} />)}</ul>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="scores-container">
                  <h3>Tabla General</h3>
                  <table className="scores-table">
                    <thead><tr><th>#</th><th>Equipo</th><th>Pts</th></tr></thead>
                    <tbody>
                      {scoresData.map(s => (
                        <tr key={s.team} className={loggedInUser === s.team ? 'highlight-row' : ''}>
                          <td>{s.rank}</td>
                          <td><strong>{s.team}</strong><br/><small>{s.dt}</small></td>
                          <td className="score-points">{s.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
     <DragOverlay>
  {activePlayer ? (
    <div className="player-on-field dragging-helper">
      <span className="player-name">{activePlayer.name}</span>
      <span className="player-team">{activePlayer.teamName}</span>
    </div>
  ) : null}
</DragOverlay>
    </DndContext>
  );
};

export default FootballField;