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
import historialDataRaw from './historial.json';

const availableFormations = ["5-3-2", "5-4-1", "4-4-2", "4-3-3", "4-5-1", "3-5-2", "3-4-3"];
const historialData = Array.isArray(historialDataRaw) ? historialDataRaw : [];
const hardcodedUsers = {
  "Blackbird": "Sergio", "CMP": "Danilo", "Danipar": "Tulio", "La Fabrica": "Maxi",
  "Invernalia": "Barrios", "Piris": "Alan", "Red Devils": "Marzio", "LORD": "RuizDiaz",
  "Milico": "Rodrigo", "Pynandi": "Duarte", "Celtic": "Fede"
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
  { rank: 10, team: "Pynandi", dt: "Duarte", points: 0 },
  { rank: 11, team: "Celtic", dt: "Fede", points: 0 },

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

const fechaInicio = 2;
const totalFechasTorneo = 21; // Las 21 fechas que mencionaste
const fechaActual = 2; // La fecha que se acaba de jugar

// Cálculo de progreso real:
// Si estamos en la 2, es (2-2)/21 = 0%.
// Si quieres que al jugar la primera ya marque avance: (2 - 2 + 1) / 21
const progresoPuntual = ((fechaActual - fechaInicio + 1) / totalFechasTorneo) * 100;
const porcentajeDisplay = Math.round(progresoPuntual);

const getLeaguePoints = (pos) => {
  // Definimos la escala dentro o fuera de la función
  const escala = [11, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

  // Si la posición existe en la escala, la devuelve; si no, devuelve 0
  return escala[pos] !== undefined ? escala[pos] : 0;
};

// 1. Definimos cuánto vale cada puesto
const puntosDeLiga = [11, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
// Indice:            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

// 2. Creamos la lista de puntos acumulados
const currentScores = (() => {
  let totales = {};

  // Inicializamos equipos
  Object.keys(hardcodedUsers).forEach(teamName => {
    totales[teamName] = {
      team: teamName,
      points: 0,
      ga: 0, // Añadimos GA al objeto total
      dt: hardcodedUsers[teamName]
    };
  });

  // Procesamos historial
  historialData.forEach(f => {
    // 1. Desempate dentro de la FECHA para asignar puntos de liga
    const rankingFecha = [...f.resultados].sort((a, b) => {
      if (b.scoreFecha !== a.scoreFecha) {
        return b.scoreFecha - a.scoreFecha; // Primero por score
      }
      return b.ga - a.ga; // Si empatan, por GA
    });

    rankingFecha.forEach((resultado, pos) => {
      if (totales[resultado.team]) {
        totales[resultado.team].points += puntosDeLiga[pos] || 0;
        // Actualizamos el GA total (usamos el GA de la última fecha cargada)
        totales[resultado.team].ga = resultado.ga;
      }
    });
  });

  // 2. Desempate en la TABLA GENERAL
  return Object.values(totales).sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points; // Primero por puntos de liga
    }
    return b.ga - a.ga; // Si empatan, por GA acumulado
  });
})();



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

  const currentDate = 2;

const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Sensibilidad en PC
    },
  }),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,      // MUY IMPORTANTE: Evita que el scroll bloquee el drag
      tolerance: 5,    // Si mueve mucho el dedo antes del delay, se cancela
    },
  })
);
useEffect(() => {
  const handleBeforeUnload = (e) => {
    // Solo mostramos la advertencia si hay jugadores en el campo
    if (onFieldPlayers.length > 0) {
      const message = "¿Seguro que quieres salir? Se perderán los cambios que no hayas guardado en la imagen.";
      e.preventDefault();
      e.returnValue = message; // Estándar para la mayoría de navegadores
      return message;          // Estándar para algunos navegadores antiguos
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  // Limpiamos el evento cuando el componente se desmonte
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [onFieldPlayers]); // Se actualiza cada vez que cambia la lista de jugadores
 const playWhistle = () => {
  const audio = new Audio('https://www.soundjay.com/sports/sounds/referee-whistle-01-short.mp3');
  audio.volume = 0.2; // Un volumen sutil para que no sea molesto
  audio.play().catch(e => console.log("Audio esperando interacción"));
};

const [viewingFecha, setViewingFecha] = useState(currentDate);

// Función para procesar los puntos totales acumulados
const calculateTotalScores = () => {
  let totals = {};

  // Inicializar equipos
  Object.keys(hardcodedUsers).forEach(team => totals[team] = 0);

  // Procesar cada fecha del historial
  historialData.forEach(f => {
    // Ordenar resultados de esta fecha de mayor a menor score
    const sortedFecha = [...f.resultados].sort((a, b) => b.scoreFecha - a.scoreFecha);

    sortedFecha.forEach((res, index) => {
      totals[res.team] += getLeaguePoints(index + 1);
    });
  });

  return totals;
};


 useEffect(() => {
  if (loggedInUser) {
    const savedData = localStorage.getItem(`team-${loggedInUser}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setOnFieldPlayers(parsed.players || []);
        setCaptainId(parsed.captainId || null);
        setSelectedDT(parsed.selectedDT || "");
        if (parsed.formation) setSelectedFormation(parsed.formation);
      } catch (error) {
        console.error("Error cargando datos locales:", error);
        localStorage.removeItem(`team-${loggedInUser}`); // Limpia si está corrupto
      }
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
  // 1. Preguntamos para evitar cierres accidentales
  setConfirmModal({
    message: '¿Estás seguro de que quieres cerrar sesión?',
    onConfirm: () => {
      setLoggedInUser(null);
      setOnFieldPlayers([]);
      setSelectedDT("");
      setUsername("");
      setPassword("");
      setConfirmModal(null);
    },
    onCancel: () => setConfirmModal(null)
  });
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
          <h1>FUBOLITO APERTURA 2026</h1>
          <p>Ingresa tus credenciales de DT</p>
        </div>

        <form
        onSubmit={(e) => {
  e.preventDefault();

  // Limpiamos cualquier mensaje previo antes de validar
  setModalMessage(null);

  // Convertimos a minúsculas/trim para evitar errores de espacios accidentales
  const userInput = username.trim();
  const passInput = password.trim();

  if (hardcodedUsers[userInput] === passInput) {
    // ÉXITO: Primero entramos, luego limpiamos los campos
    setLoggedInUser(userInput);
    console.log("Login exitoso para:", userInput);
  } else {
    // ERROR: Solo aquí suena el silbato y sale el mensaje
    playWhistle();
    setModalMessage("Usuario o contraseña incorrectos");
    // Opcional: limpiar solo la contraseña para reintento
    setPassword("");
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
                    <div className="panel-header-row">
                      <div className="user-info">
                        <small>DT CONECTADO</small>
                        <h3>{loggedInUser}</h3>
                      </div>
                      <button className="logout-btn" onClick={handleLogout} title="Cerrar Sesión">
                        <span className="logout-icon">⎋</span> SALIR
                      </button>
                    </div>
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
                            <ul>{selectedTeam.players.filter(p => p.position === pos && !onFieldPlayers.some(fp => fp.id === p.id)).map(p =>
                                <DraggablePlayer key={p.id} player={p} teamName={selectedTeam.teamName}/>)}</ul>
                          </div>
                      ))}
                    </div>
                  </>
              ) : (
                  <div className="scores-container">
                    <div className="scores-header">
                      <div className="selector-fecha">
                        <label>VER FECHA:</label>
                        <select value={viewingFecha} onChange={(e) => setViewingFecha(parseInt(e.target.value))}>
                          {[...Array(21)].map((_, i) => (
                              <option key={i + 2} value={i + 2}>Fecha {i + 2}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {/* Tabla de la Fecha Seleccionada */}
                    <div className="fecha-details">
                      <h4>Resultados Fecha {viewingFecha}</h4>
                      <table className="mini-table">
                        <thead>
                        <tr>
                          <th className="m-pos">Pos</th>
                          <th className="m-team">Equipo</th>
                          <th className="m-score">Score</th>
                          <th className="m-ga">GA</th>
                          {/* Nueva columna */}
                          <th className="m-pts">Pts Liga</th>
                        </tr>
                        </thead>
                        <tbody>
                        {historialData.find(h => h.fecha === viewingFecha)?.resultados
                            .sort((a, b) => {
                              if (b.scoreFecha !== a.scoreFecha) return b.scoreFecha - a.scoreFecha;
                              return b.ga - a.ga; // Desempate visual en la mini tabla
                            })
                            .map((res, index) => (
                                <tr key={res.team}>
                                  <td className="m-pos">{index + 1}</td>
                                  <td className="m-team">{res.team}</td>
                                  <td className="m-score">{res.scoreFecha}</td>
                                  <td className="m-ga">{res.ga}</td>
                                  <td className="m-pts gain">+{getLeaguePoints(index)}</td>
                                </tr>
                            ))
                        }
                        </tbody>
                      </table>
                    </div>
                    <div className="tournament-progress">
                      <div className="progress-info">
                        <span>Jornada {fechaActual - fechaInicio + 1} de {totalFechasTorneo}</span>
                        <span>{porcentajeDisplay}% Completado</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{width: `${progresoPuntual}%`}}></div>
                      </div>
                    </div>
                    <table className="scores-table">
                      <thead>
                      <tr>
                        <th className="col-rank">#</th>
                        <th className="col-team">EQUIPO / DT</th>
                        <th className="col-pts">PTS</th>
                      </tr>
                      </thead>
                      <tbody>
                      {/* ANTES: scoresData.map(...) */}
                      {/* AHORA: */}
                      {currentScores.map((s, index) => {
                        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : null;
                        return (
                            <tr key={s.team} className={loggedInUser === s.team ? 'highlight-row' : ''}>
                              <td>{medal || index + 1}</td>
                              <td>
                                <div className="team-info-cell">
                                  <strong>{s.team}</strong>
                                  <small>DT: {s.dt}</small>
                                </div>
                              </td>
                              <td className="score-points-cell">{s.points}</td>
                            </tr>
                        );
                      })}
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