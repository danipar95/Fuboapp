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
  "Blackbird": "Sergio", "CMP": "Danilo", "Danipar": "Tulio", "La Fabrica": "Maxi",
  "Invernalia": "Barrios", "Piris": "Alan", "Red Devils": "Marzio", "LORD": "RuizDiaz",
  "Milico": "Rodrigo", "Tifosi": "Pino", "Pynandi": "Duarte"
};

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 1000, tolerance: 10 } })
  );

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

  // --- LÓGICA DE VALIDACIÓN Y MOVIMIENTO DE FORMACIÓN ---
  const isFormationDisabled = (formationName) => {
    if (onFieldPlayers.length === 0) return false;
    const currentCounts = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'].reduce((acc, pos) => {
      acc[pos] = onFieldPlayers.filter(p => p.position === pos).length;
      return acc;
    }, {});
    const targetPositions = formationPositions[formationName];
    const targetCounts = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'].reduce((acc, pos) => {
      acc[pos] = targetPositions.filter(p => p.pos === pos).length;
      return acc;
    }, {});
    return Object.keys(currentCounts).some(pos => currentCounts[pos] > targetCounts[pos]);
  };

  const handleFormationChange = (newFormation) => {
    if (isFormationDisabled(newFormation)) return;

    // Mover jugadores automáticamente a las nuevas posiciones
    const newPositions = [...formationPositions[newFormation]];
    const updatedPlayers = onFieldPlayers.map(player => {
      const slotIndex = newPositions.findIndex(slot => slot.pos === player.position);
      if (slotIndex !== -1) {
        const slot = newPositions[slotIndex];
        newPositions.splice(slotIndex, 1); // Remover slot usado
        return { ...player, x: slot.x, y: slot.y };
      }
      return player;
    });

    setOnFieldPlayers(updatedPlayers);
    setSelectedFormation(newFormation);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (hardcodedUsers[username] === password) {
      setLoggedInUser(username);
      setPassword('');
    } else {
      setModalMessage('Usuario o contraseña incorrectos.');
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setOnFieldPlayers([]);
    setSelectedDT("");
  };

  const handleDragStart = (event) => {
    const player = event.active.data.current;
    setActivePlayer(player);
    if (navigator.vibrate) navigator.vibrate(100);
    if (window.innerWidth < 768) setIsPanelOpen(false);
  };

  const handleDragEnd = (event) => {
    const { over, active } = event;
    setActivePlayer(null);
    setIsPanelOpen(true);
    if (over && active) {
      const playerData = active.data.current;
      const targetPos = over.data.current;
      if (onFieldPlayers.some(p => p.id === playerData.id)) return setModalMessage("Ya está en el campo");
      const teamCount = onFieldPlayers.filter(p => p.teamName === playerData.teamName).length;
      if (playerData.teamName === selectedDT) {
        if (teamCount >= 1) return setModalMessage(`Solo podés poner 1 de ${playerData.teamName} por el DT.`);
      } else {
        if (teamCount >= 2) return setModalMessage(`Máximo 2 de ${playerData.teamName}`);
      }
      if (playerData.position !== targetPos.position) return setModalMessage("Posición incorrecta");
      setOnFieldPlayers([...onFieldPlayers, { ...playerData, x: targetPos.left, y: targetPos.top }]);
    }
  };

  const handleSaveTeam = () => {
    if (onFieldPlayers.length !== 11) return setModalMessage(`Faltan jugadores (${onFieldPlayers.length}/11).`);
    if (!captainId) return setModalMessage("Asigna un capitán (doble clic).");
    if (!selectedDT) return setModalMessage("Selecciona un DT.");

    const ahora = new Date();
    const fechaFormateada = ahora.toLocaleDateString() + " - " + ahora.toLocaleTimeString();
    setTimestamp(fechaFormateada);

    setConfirmModal({
      message: '¿Guardar equipo y descargar imagen?',
      onConfirm: () => {
        const dataToSave = {
          players: onFieldPlayers,
          captainId: captainId,
          formation: selectedFormation,
          selectedDT: selectedDT,
          timestamp: fechaFormateada
        };
        localStorage.setItem(`team-${loggedInUser}`, JSON.stringify(dataToSave));

        setTimeout(() => {
          const input = document.getElementById('capture-area');
          html2canvas(input, { useCORS: true, backgroundColor: "#000000", scale: 2 }).then(canvas => {
            canvas.toBlob(blob => saveAs(blob, `${loggedInUser}-equipo.png`));
          });
          setConfirmModal(null);
        }, 100);
      },
      onCancel: () => { setConfirmModal(null); setTimestamp(""); }
    });
  };

  if (!loggedInUser) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>⚽ FUBOLITO</h1>
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group"><label>Usuario</label><input type="text" value={username} onChange={e=>setUsername(e.target.value)} required /></div>
            <div className="input-group"><label>Pass</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
            <button type="submit" className="login-button">Entrar</button>
          </form>
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
            <div className="field-boundary" id="field-boundary">
              <div className="halfway-line"></div><div className="center-circle"></div>
              {formationPositions[selectedFormation].map((pos, i) => {
                const occupied = onFieldPlayers.some(p => p.x === pos.x && p.y === pos.y);
                return !occupied && <PlayerPlaceholder key={i} id={`slot-${i}`} position={pos.pos} top={pos.y} left={pos.x}/>;
              })}
              {onFieldPlayers.map(p => (
                <div key={p.id} className={`player-on-field ${captainId === p.id ? 'is-captain' : ''}`} style={{top: `${p.y}%`, left: `${p.x}%`}} onDoubleClick={() => setCaptainId(p.id === captainId ? null : p.id)}>
                  {captainId === p.id && <span className="captain-armband">©</span>}
                  <span className="player-name">{p.name}</span>
                  <span className="player-team">{p.teamName}</span>
                  <button className="delete-player-btn" onClick={(e) => { e.stopPropagation(); setOnFieldPlayers(onFieldPlayers.filter(pl => pl.id !== p.id)); if (captainId === p.id) setCaptainId(null); }}>×</button>
                </div>
              ))}
            </div>
            <div className="photo-caption-footer">
               <div className="caption-top"><span className="caption-user">{loggedInUser.toUpperCase()}</span><span className="caption-formation">{selectedFormation}</span></div>
               <div className="caption-bottom"><span>DT: {selectedDT || "---"}</span><span>{timestamp}</span></div>
            </div>
          </div>

          <div className={`teams-list-panel ${isPanelOpen ? 'panel-open' : ''}`}>
            <button onClick={() => setIsPanelOpen(!isPanelOpen)} className="panel-toggle-btn">{isPanelOpen ? '▲' : '▼'}</button>
            <div className="teams-list-content">
              <div className="panel-header-row"><h3>Panel</h3><button className="logout-btn" onClick={handleLogout}>Salir</button></div>
              <button className="save-btn" onClick={handleSaveTeam}>Guardar Imagen</button>

              <div className="select-group">
                <label>Formación</label>
                <select value={selectedFormation} onChange={e => handleFormationChange(e.target.value)}>
                  {availableFormations.map(f => (
                    <option key={f} value={f} disabled={isFormationDisabled(f)}>
                      {f} {isFormationDisabled(f) ? ' (Bloqueada)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="select-group">
                <label>DT (Equipo)</label>
                <select value={selectedDT} onChange={e => {
                    if (onFieldPlayers.filter(p => p.teamName === e.target.value).length > 1) return setModalMessage("Ya tienes 2 jugadores de este club.");
                    setSelectedDT(e.target.value);
                }}><option value="">Seleccionar...</option>{playersData.map(t => <option key={t.teamName} value={t.teamName}>{t.teamName}</option>)}</select>
              </div>

              <div className="select-group">
                <label>Ver Jugadores</label>
                <select onChange={e => setSelectedTeam(playersData.find(t => t.teamName === e.target.value))}>{playersData.map(t => <option key={t.teamName} value={t.teamName}>{t.teamName}</option>)}</select>
              </div>

              <div className="players-by-position">
                {['Portero', 'Defensa', 'Mediocampista', 'Delantero'].map(pos => (
                  <div key={pos} className="position-section"><h4>{pos}s</h4><ul>{selectedTeam.players.filter(p => p.position === pos && !onFieldPlayers.some(fp => fp.id === p.id)).map(p => <DraggablePlayer key={p.id} player={p} teamName={selectedTeam.teamName} />)}</ul></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <DragOverlay>{activePlayer ? <div className="dragging-item-floating">{activePlayer.name}</div> : null}</DragOverlay>
    </DndContext>
  );
};

export default FootballField;