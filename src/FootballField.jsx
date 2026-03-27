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
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- CONFIGURACIÓN Y UTILIDADES GLOBALES ---
const availableFormations = ["5-3-2", "5-4-1", "4-4-2", "4-3-3", "4-5-1", "3-5-2", "3-4-3"];
const historialData = Array.isArray(historialDataRaw) ? historialDataRaw : [];
const hardcodedUsers = {
  "Blackbird": "Sergio", "CMP": "Danilo", "Danipar": "Tulio", "La Fabrica": "Maxi",
  "Invernalia": "Barrios", "Piris": "Alan", "Red Devils": "Marzio", "LORD": "RuizDiaz",
  "Milico": "Rodrigo", "Pynandi": "Duarte", "Celtic": "Fede"
};

const puntosDeLiga = [11, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

const formationPositions = {
  "5-3-2": [{y:7,x:50,pos:'Portero'},{y:30,x:10,pos:'Defensa'},{y:25,x:30,pos:'Defensa'},{y:20,x:50,pos:'Defensa'},{y:25,x:70,pos:'Defensa'},{y:30,x:90,pos:'Defensa'},{y:55,x:25,pos:'Mediocampista'},{y:55,x:50,pos:'Mediocampista'},{y:55,x:75,pos:'Mediocampista'},{y:80,x:35,pos:'Delantero'},{y:80,x:65,pos:'Delantero'}],
  "5-4-1": [{y:7,x:50,pos:'Portero'},{y:30,x:10,pos:'Defensa'},{y:25,x:30,pos:'Defensa'},{y:20,x:50,pos:'Defensa'},{y:25,x:70,pos:'Defensa'},{y:30,x:90,pos:'Defensa'},{y:55,x:15,pos:'Mediocampista'},{y:45,x:30,pos:'Mediocampista'},{y:45,x:70,pos:'Mediocampista'},{y:55,x:85,pos:'Mediocampista'},{y:80,x:50,pos:'Delantero'}],
  "4-4-2": [{y:7,x:50,pos:'Portero'},{y:30,x:15,pos:'Defensa'},{y:20,x:30,pos:'Defensa'},{y:20,x:70,pos:'Defensa'},{y:30,x:85,pos:'Defensa'},{y:55,x:15,pos:'Mediocampista'},{y:45,x:30,pos:'Mediocampista'},{y:45,x:70,pos:'Mediocampista'},{y:55,x:85,pos:'Mediocampista'},{y:80,x:35,pos:'Delantero'},{y:80,x:65,pos:'Delantero'}],
  "4-3-3": [{y:7,x:50,pos:'Portero'},{y:30,x:15,pos:'Defensa'},{y:20,x:30,pos:'Defensa'},{y:20,x:70,pos:'Defensa'},{y:30,x:85,pos:'Defensa'},{y:55,x:25,pos:'Mediocampista'},{y:55,x:50,pos:'Mediocampista'},{y:55,x:75,pos:'Mediocampista'},{y:80,x:25,pos:'Delantero'},{y:85,x:50,pos:'Delantero'},{y:80,x:75,pos:'Delantero'}],
  "4-5-1": [{y:7,x:50,pos:'Portero'},{y:30,x:15,pos:'Defensa'},{y:20,x:30,pos:'Defensa'},{y:20,x:70,pos:'Defensa'},{y:30,x:85,pos:'Defensa'},{y:60,x:10,pos:'Mediocampista'},{y:55,x:30,pos:'Mediocampista'},{y:45,x:50,pos:'Mediocampista'},{y:55,x:70,pos:'Mediocampista'},{y:60,x:90,pos:'Mediocampista'},{y:80,x:50,pos:'Delantero'}],
  "3-5-2": [{y:7,x:50,pos:'Portero'},{y:25,x:20,pos:'Defensa'},{y:20,x:50,pos:'Defensa'},{y:25,x:75,pos:'Defensa'},{y:60,x:10,pos:'Mediocampista'},{y:55,x:30,pos:'Mediocampista'},{y:45,x:50,pos:'Mediocampista'},{y:55,x:70,pos:'Mediocampista'},{y:60,x:90,pos:'Mediocampista'},{y:80,x:35,pos:'Delantero'},{y:80,x:65,pos:'Delantero'}],
  "3-4-3": [{y:7,x:50,pos:'Portero'},{y:25,x:20,pos:'Defensa'},{y:20,x:50,pos:'Defensa'},{y:25,x:75,pos:'Defensa'},{y:55,x:15,pos:'Mediocampista'},{y:45,x:30,pos:'Mediocampista'},{y:45,x:70,pos:'Mediocampista'},{y:55,x:85,pos:'Mediocampista'},{y:80,x:25,pos:'Delantero'},{y:85,x:50,pos:'Delantero'},{y:80,x:75,pos:'Delantero'}]
};

const calcularRankingAcumulado = (datosHistorial, usuarios, puntosEscala) => {
  let totales = {};
  Object.keys(usuarios).forEach(t => { totales[t] = { team: t, points: 0, ga: 0 }; });

  datosHistorial.forEach(f => {
    const rankingFecha = [...f.resultados].sort((a, b) => {
      if (b.scoreFecha !== a.scoreFecha) return b.scoreFecha - a.scoreFecha;
      if (b.ga !== a.ga) return b.ga - a.ga;
      const ptsA = totales[a.team] ? totales[a.team].points : 0;
      const ptsB = totales[b.team] ? totales[b.team].points : 0;
      if (ptsB !== ptsA) return ptsB - ptsA;
      const gaA = totales[a.team] ? totales[a.team].ga : 0;
      const gaB = totales[b.team] ? totales[b.team].ga : 0;
      if (gaB !== gaA) return gaB - gaA;
      return a.team.localeCompare(b.team);
    });

    rankingFecha.forEach((res, pos) => {
      if (totales[res.team]) {
        totales[res.team].points += puntosEscala[pos] || 0;
        totales[res.team].ga += res.ga;
      }
    });
  });

  // ==========================================
  // NUEVO: SISTEMA DE PENALIZACIONES
  // ==========================================
  const penalizaciones = {
    "Blackbird": 1,  // Le resta 1 punto a Blackbird
    // "OtroEquipo": 2, // Si necesitas penalizar a otro, lo agregas así
  };

  Object.keys(penalizaciones).forEach(equipo => {
    if (totales[equipo]) {
      totales[equipo].points -= penalizaciones[equipo];
    }
  });
  // ==========================================

  return Object.values(totales).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.ga !== a.ga) return b.ga - a.ga;
    return a.team.localeCompare(b.team);
  });
};

const DraggablePlayer = ({ player, teamName }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: player.id, data: { ...player, teamName } });
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

// --- COMPONENTE PRINCIPAL ---
const FootballField = () => {
  const ultimaFechaCargada = historialData.length > 0 ? Math.max(...historialData.map(h => h.fecha)) : 2;
  const fechaInicio = 2;
  const totalFechasTorneo = 21;
  const nroFechaActual = ultimaFechaCargada - fechaInicio + 1;
  const progresoPuntual = (nroFechaActual / totalFechasTorneo) * 100;

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
  const [activeTab, setActiveTab] = useState('armar');
  const [viewingFecha, setViewingFecha] = useState(ultimaFechaCargada);

  const currentScores = calcularRankingAcumulado(historialData, hardcodedUsers, puntosDeLiga);
  const pastScores = historialData.length > 1 ? calcularRankingAcumulado(historialData.slice(0, -1), hardcodedUsers, puntosDeLiga) : [];

  const getTrendGeneral = (teamName) => {
    if (pastScores.length === 0) return "new";
    const posAnt = pastScores.findIndex(r => r.team === teamName);
    const posAct = currentScores.findIndex(r => r.team === teamName);
    if (posAnt === -1) return "new";
    if (posAct < posAnt) return "up";
    if (posAct > posAnt) return "down";
    return "equal";
  };

  const resultadosFechaVista = (() => {
    if (historialData.length === 0) return [];
    const indexFecha = historialData.findIndex(h => h.fecha === viewingFecha);
    if (indexFecha === -1) return [];
    const fechaData = historialData[indexFecha];
    const subHistorialAnterior = historialData.slice(0, indexFecha);
    const tablaAnterior = calcularRankingAcumulado(subHistorialAnterior, hardcodedUsers, puntosDeLiga);

    const puntosPrevios = {}; const gaPrevios = {};
    tablaAnterior.forEach(t => { puntosPrevios[t.team] = t.points; gaPrevios[t.team] = t.ga; });

    return [...fechaData.resultados].sort((a, b) => {
      if (b.scoreFecha !== a.scoreFecha) return b.scoreFecha - a.scoreFecha;
      if (b.ga !== a.ga) return b.ga - a.ga;
      const ptsA = puntosPrevios[a.team] || 0; const ptsB = puntosPrevios[b.team] || 0;
      if (ptsB !== ptsA) return ptsB - ptsA;
      const gaA = gaPrevios[a.team] || 0; const gaB = gaPrevios[b.team] || 0;
      if (gaB !== gaA) return gaB - gaA;
      return a.team.localeCompare(b.team);
    });
  })();

  const getEvolutionData = () => {
    return historialData.map((f, i) => {
      const dataPunto = { name: `F${f.fecha}` };
      const tablaAnterior = calcularRankingAcumulado(historialData.slice(0, i), hardcodedUsers, puntosDeLiga);
      const puntosPrevios = {}; tablaAnterior.forEach(t => { puntosPrevios[t.team] = t.points; });

      const rankingFecha = [...f.resultados].sort((a, b) => {
         if (b.scoreFecha !== a.scoreFecha) return b.scoreFecha - a.scoreFecha;
         if (b.ga !== a.ga) return b.ga - a.ga;
         const ptsA = puntosPrevios[a.team] || 0; const ptsB = puntosPrevios[b.team] || 0;
         if (ptsB !== ptsA) return ptsB - ptsA;
         return a.team.localeCompare(b.team);
      });

      rankingFecha.forEach((res, index) => { dataPunto[res.team] = index + 1; });
      return dataPunto;
    });
  };

  const getGeneralHistoryData = () => {
    const generalHistory = [];
    for (let i = 1; i <= historialData.length; i++) {
      const fechaActualRef = historialData[i - 1].fecha;
      const tablaEnEseMomento = calcularRankingAcumulado(historialData.slice(0, i), hardcodedUsers, puntosDeLiga);
      const puntoGrafico = { name: `F${fechaActualRef}` };
      tablaEnEseMomento.forEach((res, index) => { puntoGrafico[res.team] = index + 1; });
      generalHistory.push(puntoGrafico);
    }
    return generalHistory;
  };

  const getLeaguePoints = (index) => puntosDeLiga[index] || 0;
  // --- NUEVO: CÁLCULO DE PUNTOS TOTALES (bruto) ---
  const rankingPuntosTotales = (() => {
    let totales = {};
    Object.keys(hardcodedUsers).forEach(t => totales[t] = { team: t, totalScore: 0 });

    historialData.forEach(fecha => {
      fecha.resultados.forEach(res => {
        if (totales[res.team]) totales[res.team].totalScore += res.scoreFecha;
      });
    });

    // Ordenamos del que hizo más puntos en total al que hizo menos
    return Object.values(totales).sort((a, b) => b.totalScore - a.totalScore);
  })();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  useEffect(() => {
    if (loggedInUser) {
      const saved = localStorage.getItem(`team-${loggedInUser}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setOnFieldPlayers(parsed.players || []);
        setCaptainId(parsed.captainId || null);
        setSelectedFormation(parsed.formation || "4-4-2");
        setSelectedDT(parsed.selectedDT || "");
      }
    }
  }, [loggedInUser]);

  const handleDragStart = (e) => {
    setActivePlayer(e.active.data.current);
    if (window.innerWidth < 768) setIsPanelOpen(false);
  };

  const playWhistle = () => {
    const audio = new Audio('https://www.soundjay.com/sports/sounds/referee-whistle-01-short.mp3');
    audio.volume = 0.2; audio.play().catch(e => console.log("Audio esperando"));
  };
// Verifica si una formación tiene espacio suficiente para los jugadores que YA están en la cancha
  const isFormationAllowed = (formacion) => {
    const conteoActual = { 'Portero': 0, 'Defensa': 0, 'Mediocampista': 0, 'Delantero': 0 };
    onFieldPlayers.forEach(p => {
      if (conteoActual[p.position] !== undefined) conteoActual[p.position]++;
    });

    const conteoNuevaFormacion = { 'Portero': 0, 'Defensa': 0, 'Mediocampista': 0, 'Delantero': 0 };
    formationPositions[formacion].forEach(slot => {
      if (conteoNuevaFormacion[slot.pos] !== undefined) conteoNuevaFormacion[slot.pos]++;
    });

    for (let pos of Object.keys(conteoActual)) {
      // Si hay más jugadores en cancha que los que permite esta formación, se bloquea
      if (conteoActual[pos] > conteoNuevaFormacion[pos]) return false;
    }
    return true;
  };
  // --- NUEVA FUNCIÓN: Cambia la formación y reubica a los jugadores ---
  const handleFormationChange = (e) => {
    const nuevaFormacion = e.target.value;
    setSelectedFormation(nuevaFormacion); // Cambiamos el estado de la formación

    // Traemos las coordenadas exactas de la nueva formación elegida
    const nuevosSlots = formationPositions[nuevaFormacion];
    const slotsOcupados = new Set(); // Para no poner a 2 jugadores en el mismo lugar

    // Reposicionamos a cada jugador que ya está en la cancha
    const jugadoresReubicados = onFieldPlayers.map(jugador => {
      // Buscamos un hueco para su posición (Ej: Defensa) que no hayamos usado todavía
      const indexSlot = nuevosSlots.findIndex((slot, i) =>
        slot.pos === jugador.position && !slotsOcupados.has(i)
      );

      if (indexSlot !== -1) {
        slotsOcupados.add(indexSlot); // Marcamos este hueco como ocupado
        // Le asignamos las nuevas coordenadas al jugador
        return { ...jugador, x: nuevosSlots[indexSlot].x, y: nuevosSlots[indexSlot].y };
      }
      return jugador;
    });

    // Actualizamos la cancha con los jugadores en sus nuevas posiciones
    setOnFieldPlayers(jugadoresReubicados);
  };
  const handleDragEnd = (event) => {
    const { over, active } = event;
    setActivePlayer(null);
    setIsPanelOpen(true);
    if (over && active) {
      const pData = active.data.current; const tPos = over.data.current;
      if (onFieldPlayers.some(p => p.id === pData.id)) { playWhistle(); return setModalMessage("Ya está en el campo"); }
      const teamCount = onFieldPlayers.filter(p => p.teamName === pData.teamName).length;
      if (pData.teamName === selectedDT) {
        if (teamCount >= 1) { playWhistle(); return setModalMessage(`Máximo 1 de ${pData.teamName} (DT).`); }
      } else {
        if (teamCount >= 2) { playWhistle(); return setModalMessage(`Máximo 2 de ${pData.teamName}.`); }
      }
      if (pData.position !== tPos.position) { playWhistle(); return setModalMessage("Posición incorrecta"); }
      setOnFieldPlayers(prev => [...prev, { ...pData, x: tPos.left, y: tPos.top }]);
    }
  };

  const handleSaveTeam = () => {
    if (onFieldPlayers.length !== 11) return setModalMessage("Faltan jugadores (11).");
    if (!captainId) return setModalMessage("Doble clic para marcar al Capitán.");
    if (!selectedDT) return setModalMessage("Falta elegir el DT de la fecha.");

    setConfirmModal({
      message: '¿Descargar imagen del equipo?',
      onConfirm: () => {
        localStorage.setItem(`team-${loggedInUser}`, JSON.stringify({ players: onFieldPlayers, captainId, formation: selectedFormation, selectedDT }));
        setTimeout(() => {
          html2canvas(document.getElementById('capture-area'), { useCORS: true, backgroundColor: "#000", scale: 2 }).then(canvas => {
            saveAs(canvas.toDataURL(), `${loggedInUser}-equipo.png`);
          });
          setConfirmModal(null);
        }, 100);
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  if (!loggedInUser) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-header">
            <span className="logo-icon">⚽</span>
            <h1>FUBOLITO 2026</h1>
            <p>Inicia sesión para armar tu equipo</p>
          </div>
          <form className="login-form" onSubmit={(e) => {
            e.preventDefault();
            if (hardcodedUsers[username] === password) setLoggedInUser(username);
            else setModalMessage("Credenciales incorrectas");
          }}>
            <div className="input-group">
                <label>Equipo</label>
                <input type="text" placeholder="Tu equipo" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="input-group">
                <label>Contraseña</label>
                <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="login-button">ENTRAR</button>
          </form>
          <div className="login-footer">Torneo Clausura 2026</div>
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

          {/* ========================================= */}
          {/* ZONA DE CAPTURA DE IMAGEN CON EL FOOTER */}
          {/* ========================================= */}
          <div id="capture-area" className="capture-wrapper" style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#111' }}>

            {/* LA CANCHA */}
            <div className="field-boundary">
              <div className="halfway-line"></div>
              {formationPositions[selectedFormation].map((pos, i) => {
                const occupied = onFieldPlayers.some(p => Math.abs(p.x - pos.x) < 1 && Math.abs(p.y - pos.y) < 1);
                return !occupied && <PlayerPlaceholder key={i} id={`slot-${i}`} position={pos.pos} top={pos.y} left={pos.x}/>;
              })}
              {onFieldPlayers.map(p => (
                <div key={p.id} className={`player-on-field ${captainId === p.id ? 'is-captain' : ''}`} style={{top: `${p.y}%`, left: `${p.x}%`}} onDoubleClick={() => setCaptainId(p.id)}>

                  {/* NOMBRES EN MÚLTIPLES LÍNEAS */}
                  <div className="player-name" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.1' }}>
                    {p.name.split(' ').map((palabra, index) => (
                      <span key={index}>{palabra}</span>
                    ))}
                  </div>

                  {/* --- NUEVO: NOMBRE DEL EQUIPO EN LA CANCHA --- */}
                  <span className="player-team" style={{ fontSize: '9px', color: '#ffd700', marginTop: '2px', textAlign: 'center', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {p.teamName}
                  </span>

                  <button className="delete-player-btn" onClick={() => setOnFieldPlayers(onFieldPlayers.filter(pl => pl.id !== p.id))}>×</button>
                  {captainId === p.id && <div className="captain-armband">C</div>}
                </div>
              ))}
            </div>

            {/* EL PIE DE FOTO (FOOTER) */}
            {/* EL PIE DE FOTO (FOOTER) */}
            <div style={{
              marginTop: '10px',
              padding: '12px 20px',
              backgroundColor: 'rgba(20, 20, 20, 0.9)',
              border: '1px solid #333',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              color: '#ddd',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>

              {/* Fila principal con los datos del equipo */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: '#ffd700', fontWeight: 'bold' }}>FORMACIÓN:</span> {selectedFormation}
                </div>
                <div>
                  <span style={{ color: '#ffd700', fontWeight: 'bold' }}>DT:</span> {selectedDT || "Sin Asignar"}
                </div>
              </div>

              {/* Segunda fila exclusiva para la fecha y hora */}
              <div style={{
                fontSize: '11px',
                color: '#888',
                textAlign: 'center',
                paddingTop: '8px',
                borderTop: '1px dashed #444'
              }}>
                Fecha: {new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })} hs
              </div>

            </div>

          </div>
          {/* ========================================= */}

          <div className={`teams-list-panel ${isPanelOpen ? 'panel-open' : ''}`}>

            {/* --- BOTÓN PARA SUBIR Y BAJAR EL PANEL EN CELULARES --- */}
            <button
                className="panel-toggle-btn"
                onClick={() => setIsPanelOpen(!isPanelOpen)}
            >
              {isPanelOpen ? '▼' : '▲'}
            </button>

            <div className="panel-header-row">
              <div className="user-info">
                <h3>{loggedInUser}</h3>
                <small>DT Oficial</small>
              </div>
              <button className="logout-btn" onClick={() => setLoggedInUser(null)}>
                <span className="logout-icon">🚪</span> Salir
              </button>
            </div>

            <div className="tabs-header">
              <button className={`tab-btn ${activeTab === 'armar' ? 'active' : ''}`}
                      onClick={() => setActiveTab('armar')}>Armar
              </button>
              <button className={`tab-btn ${activeTab === 'puntos' ? 'active' : ''}`}
                      onClick={() => setActiveTab('puntos')}>Puntos
              </button>
            </div>

            <div className="teams-list-content">
              {activeTab === 'armar' ? (
                  <>
                    <button onClick={handleSaveTeam} className="save-btn" style={{marginBottom: '15px'}}>Descargar
                      Equipo
                    </button>

                    {/* SELECTOR DE EQUIPO (JUGADORES) */}
                    <div className="select-group">
                      <label>Equipo (Jugadores)</label>
                      <select
                          value={selectedTeam?.teamName || ""}
                          onChange={e => setSelectedTeam(playersData.find(t => t.teamName === e.target.value))}
                      >
                        {playersData.map(t => (
                            <option key={`equipo-${t.teamName}`} value={t.teamName}>{t.teamName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="select-group">
                      <label>Formación</label>
                      {/* Reemplazamos el onChange simple por nuestra nueva función */}
                      <select value={selectedFormation} onChange={handleFormationChange}>
                        {availableFormations.map(f => {
                          const disponible = isFormationAllowed(f);
                          return (
                              <option key={f} value={f} disabled={!disponible}>
                                {f} {!disponible && "(No compatible)"}
                              </option>
                          );
                        })}
                      </select>
                    </div>
                    {/* SELECTOR DE DT (CLUBES) */}
                    <div className="select-group">
                      <label>DT de la Fecha</label>
                      <select value={selectedDT} onChange={e => setSelectedDT(e.target.value)} className="dt-select">
                        <option value="">Elegir DT...</option>
                        {playersData.map(t => (
                            <option key={`dt-${t.teamName}`} value={t.teamName}>
                              {t.teamName}
                            </option>
                        ))}
                      </select>
                    </div>

                    <div className="players-by-position">
                      {['Portero', 'Defensa', 'Mediocampista', 'Delantero'].map(pos => (
                          <div key={pos} className="pos-section">
                            <h4 style={{
                              color: '#aaa',
                              margin: '15px 0 5px 0',
                              fontSize: '12px',
                              textTransform: 'uppercase'
                            }}>{pos}</h4>
                            <ul>
                              {selectedTeam && selectedTeam.players
                                  .filter(p => p.position === pos && !onFieldPlayers.some(fp => fp.id === p.id))
                                  .map(p => (
                                      <DraggablePlayer key={p.id} player={p} teamName={selectedTeam.teamName}/>
                                  ))}
                            </ul>
                          </div>
                      ))}
                    </div>
                  </>
              ) : (
                  <div className="scores-container">

                    <div className="tournament-progress">
                      <div className="progress-info">
                        <span>Jornada {nroFechaActual} de {totalFechasTorneo}</span>
                        <span>{Math.round(progresoPuntual)}% Completado</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{width: `${progresoPuntual}%`}}></div>
                      </div>
                    </div>

                    <div className="scores-header">
                      <h3 style={{margin: 0}}>Tabla General</h3>
                      <span className="season-tag">2026</span>
                    </div>
                    <table className="scores-table">
                      <tbody>
                      {currentScores.map((s, index) => {
                        const trend = getTrendGeneral(s.team);
                        const isMe = loggedInUser === s.team;

                        let medalClass = '';
                        if (index === 0) medalClass = 'gold';
                        else if (index === 1) medalClass = 'silver';
                        else if (index === 2) medalClass = 'bronze';

                        return (
                            <tr key={s.team} className={`${isMe ? 'highlight-row' : ''} ${medalClass}`}>
                              <td style={{width: '20px', textAlign: 'center', color: '#888'}}>{index + 1}</td>
                              <td className="trend-cell">
                                {trend === "up" && <span className="trend-up">▲</span>}
                                {trend === "down" && <span className="trend-down">▼</span>}
                                {trend === "equal" && <span className="trend-equal">─</span>}
                              </td>
                              <td className="team-info-cell">
                                <strong>{s.team}</strong>
                                <small>GA: {s.ga}</small>
                              </td>
                              <td className="pts-details">
                                <div className="points-badge">
                                  <span className="total-pts">{s.points}</span>
                                </div>
                              </td>
                            </tr>
                        );
                      })}
                      </tbody>
                    </table>

                    <div className="fecha-details">
                      <div className="selector-fecha">
                        <label>FECHA:</label>
                        <select value={viewingFecha} onChange={(e) => setViewingFecha(Number(e.target.value))}>
                          {historialData.map(h => <option key={h.fecha} value={h.fecha}>Jornada {h.fecha}</option>)}
                        </select>
                      </div>
                      <table className="mini-table">
                        <thead>
                        <tr>
                          <th className="m-pos">#</th>
                          <th className="m-team">EQUIPO</th>
                          <th className="m-score">PTS</th>
                          <th className="m-ga">GA</th>
                          <th className="m-pts">LIGA</th>
                        </tr>
                        </thead>
                        <tbody>
                        {resultadosFechaVista.map((res, index) => {
                          const isMe = loggedInUser === res.team;
                          const puntosGanados = getLeaguePoints(index);
                          return (
                              <tr key={res.team} className={isMe ? 'highlight-row' : ''}>
                                <td className="m-pos">{index + 1}</td>
                                <td className="m-team">{res.team}</td>
                                <td className="m-score">{res.scoreFecha}</td>
                                <td className="m-ga">{res.ga}</td>
                                <td className="m-pts gain">+{puntosGanados}</td>
                              </tr>
                          );
                        })}
                        </tbody>
                      </table>
                    </div>
                    {/* GRÁFICOS */}
                    <div style={{
                      width: '100%',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      marginTop: '30px',
                      boxSizing: 'border-box'
                    }}>
                      <h4 style={{textAlign: 'center', color: '#ffd700', marginBottom: '15px', fontSize: '12px'}}>
                        POSICIONES POR FECHA
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        {/* Agregamos margin para compensar el espacio de los ejes */}
                        <LineChart data={getEvolutionData()} margin={{top: 5, right: 20, left: -25, bottom: 5}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333"/>
                          <XAxis dataKey="name" stroke="#888" fontSize={10}/>
                          <YAxis reversed domain={[1, 11]} stroke="#888" fontSize={10}/>
                          <Tooltip contentStyle={{backgroundColor: '#222', border: '1px solid #444'}}/>
                          {Object.keys(hardcodedUsers).map((team, i) => (
                              <Line key={team} type="monotone" dataKey={team}
                                    stroke={loggedInUser === team ? "#ffd700" : `hsl(${i * 35}, 60%, 45%)`}
                                    strokeWidth={loggedInUser === team ? 4 : 2} dot={loggedInUser === team}
                                    activeDot={{r: 8}}/>
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={{
                      width: '100%',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      marginTop: '30px',
                      marginBottom: '30px',
                      boxSizing: 'border-box'
                    }}>
                      <h4 style={{textAlign: 'center', color: '#ffd700', marginBottom: '15px', fontSize: '12px'}}>
                        CARRERA POR EL TÍTULO
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={getGeneralHistoryData()} margin={{top: 5, right: 20, left: -25, bottom: 5}}>
                          <defs>
                            <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ffd700" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#ffd700" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false}/>
                          <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false}/>
                          <YAxis reversed domain={[1, 11]} stroke="#888" fontSize={10} tickLine={false}
                                 axisLine={false}/>
                          <Tooltip contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '8px'
                          }}/>
                          {Object.keys(hardcodedUsers).map((team, index) => (
                              <Area key={`general-${team}`} type="monotone" dataKey={team}
                                    stroke={loggedInUser === team ? "#ffd700" : `hsl(${index * 35}, 50%, 40%)`}
                                    strokeWidth={loggedInUser === team ? 4 : 1} fillOpacity={1}
                                    fill={loggedInUser === team ? "url(#colorUser)" : "transparent"}
                                    dot={loggedInUser === team ? {r: 4, fill: '#ffd700'} : false} connectNulls/>
                          ))}
                        </AreaChart>
                      </ResponsiveContainer>

                      {/* --- NUEVA TABLA: SUMATORIA DE PUNTOS TOTALES --- */}
                      <div className="fecha-details" style={{marginTop: '30px', marginBottom: '30px'}}>
                        <h4 style={{textAlign: 'center', color: '#ffd700', marginBottom: '15px'}}>
                          TOTAL DE PUNTOS HECHOS
                        </h4>
                        <table className="mini-table">
                          <thead>
                          <tr>
                            <th className="m-pos">#</th>
                            <th className="m-team">EQUIPO</th>
                            <th className="m-score" style={{width: '80px'}}>PTS TOTALES</th>
                          </tr>
                          </thead>
                          <tbody>
                          {rankingPuntosTotales.map((res, index) => {
                            const isMe = loggedInUser === res.team;
                            return (
                                <tr key={res.team} className={isMe ? 'highlight-row' : ''}>
                                  <td className="m-pos">{index + 1}</td>
                                  <td className="m-team">{res.team}</td>
                                  <td className="m-score"
                                      style={{color: '#4caf50', fontWeight: 'bold', fontSize: '13px'}}>
                                    {res.totalScore}
                                  </td>
                                </tr>
                            );
                          })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* COMPONENTE QUE MUESTRA EL JUGADOR FLOTANDO AL ARRASTRAR */}
      <DragOverlay>
        {activePlayer ? (
            <div className="player-on-field dragging-helper">
              <div className="player-name"
                   style={{display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.1'}}>
                {activePlayer.name.split(' ').map((palabra, index) => (
                    <span key={index}>{palabra}</span>
                ))}
              </div>
              <span className="player-team">{activePlayer.teamName}</span>
            </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default FootballField;