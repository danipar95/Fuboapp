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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  useEffect(() => {
    if (loggedInUser) {
      const saved = localStorage.getItem(`team-${loggedInUser}`);
      if (saved) setOnFieldPlayers(JSON.parse(saved));
    }
  }, [loggedInUser]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (hardcodedUsers[username] === password) {
      setLoggedInUser(username);
      setPassword('');
    } else {
      setModalMessage('Usuario o contraseña incorrectos.');
    }
  };

  const handleDragStart = (event) => {
    setActivePlayer(event.active.data.current);
    if (window.innerWidth < 768) setIsPanelOpen(false);
  };

  const handleDragEnd = (event) => {
    const { over, active } = event;
    setActivePlayer(null);
    setIsPanelOpen(true);
    if (over && active) {
      const playerData = active.data.current;
      const targetPos = over.data.current;

      const alreadyOnField = onFieldPlayers.some(p => p.id === playerData.id);
      if (alreadyOnField) return setModalMessage("El jugador ya está en el campo");

      const teamCount = onFieldPlayers.filter(p => p.teamName === playerData.teamName).length;
      if (teamCount >= 2) return setModalMessage(`Máximo 2 de ${playerData.teamName}`);

      if (playerData.position !== targetPos.position) return setModalMessage("Posición incorrecta");

      setOnFieldPlayers([...onFieldPlayers, { ...playerData, x: targetPos.left, y: targetPos.top }]);
    }
  };

  const handleSaveTeam = () => {
    setConfirmModal({
      message: '¿Guardar equipo y descargar imagen?',
      onConfirm: () => {
        localStorage.setItem(`team-${loggedInUser}`, JSON.stringify(onFieldPlayers));
        const input = document.getElementById('field-boundary');
        html2canvas(input, { useCORS: true }).then(canvas => {
          canvas.toBlob(blob => saveAs(blob, `${loggedInUser}-fubolito.png`));
        });
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  if (!loggedInUser) {
    return (
      <div className="login-container">
        {modalMessage && <Modal message={modalMessage} onClose={() => setModalMessage(null)} />}
        <div className="login-card">
          <h1>⚽ FUBOLITO</h1>
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label>Usuario</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Pass</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
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
        {confirmModal && (
          <Modal
            message={confirmModal.message}
            onClose={confirmModal.onCancel}
            onConfirm={confirmModal.onConfirm}
            showButtons={true}
          />
        )}

        <div className="field-and-panel-wrapper">
          <div className="field-boundary" id="field-boundary">
            <div className="halfway-line"></div>
            <div className="center-circle"></div>
            {formationPositions[selectedFormation].map((pos, i) => {
              const occupied = onFieldPlayers.some(p => p.x === pos.x && p.y === pos.y);
              return !occupied && <PlayerPlaceholder key={i} id={`slot-${i}`} position={pos.pos} top={pos.y} left={pos.x} />;
            })}
            {onFieldPlayers.map(p => (
              <div key={p.id} className="player-on-field" style={{ top: `${p.y}%`, left: `${p.x}%` }} onClick={() => setOnFieldPlayers(onFieldPlayers.filter(pl => pl.id !== p.id))}>
                <span className="player-name">{p.name}</span>
                <span className="player-team">{p.teamName}</span>
              </div>
            ))}
          </div>

          <div className={`teams-list-panel ${isPanelOpen ? 'panel-open' : ''}`}>
            <button onClick={() => setIsPanelOpen(!isPanelOpen)} className="panel-toggle-btn">{isPanelOpen ? '▲' : '▼'}</button>
            <div className="teams-list-content">
              <h3>DT: {loggedInUser}</h3>
              <button className="save-btn" onClick={handleSaveTeam}>Guardar</button>

              <div className="select-group">
                <label>Formación</label>
                <select value={selectedFormation} onChange={e => setSelectedFormation(e.target.value)}>
                  {availableFormations.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="select-group">
                <label>Equipo</label>
                <select onChange={e => setSelectedTeam(playersData.find(t => t.teamName === e.target.value))}>
                  {playersData.map(t => <option key={t.teamName} value={t.teamName}>{t.teamName}</option>)}
                </select>
              </div>

              <div className="players-by-position">
                {['Portero', 'Defensa', 'Mediocampista', 'Delantero'].map(pos => (
                  <div key={pos} className="position-section">
                    <h4>{pos}s</h4>
                    <ul>
                      {selectedTeam.players
                        .filter(p => p.position === pos && !onFieldPlayers.some(fp => fp.id === p.id))
                        .map(p => (
                          <DraggablePlayer key={p.id} player={p} teamName={selectedTeam.teamName} />
                        ))}
                    </ul>
                  </div>
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