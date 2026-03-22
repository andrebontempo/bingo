"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import { QRCodeSVG } from "qrcode.react";

export default function AdminDashboard() {
  const socket = useSocket();
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [roomId, setRoomId] = useState(null);

  const [gameMode, setGameMode] = useState(75);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [history, setHistory] = useState([]);
  const [lastDrawn, setLastDrawn] = useState(null);
  const [autoMode, setAutoMode] = useState(0);
  const [players, setPlayers] = useState([]); // Nova lista de jogadores

  const [voices, setVoices] = useState([]);
  const [selectedVoiceType, setSelectedVoiceType] = useState('male');
  const [frontendUrl, setFrontendUrl] = useState('');

  useEffect(() => {
    setFrontendUrl(window.location.origin);
    const stored = localStorage.getItem("adminData");
    if (!stored) {
      router.push("/admin");
    } else {
      setAdmin(JSON.parse(stored));
    }

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    if (typeof window !== "undefined") {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [router]);

  useEffect(() => {
    if (socket && roomId) {
      socket.on('player_bingo', (data) => {
        alert(`BINGO ACIONADO POR: ${data.playerName}`);
      });
      socket.on('player_linha', (data) => {
        alert(`LINHA ACIONADA POR: ${data.playerName}`);
      });
      socket.on('player_joined', (data) => {
        setPlayers(prev => {
          if (prev.some(p => p.name === data.name)) return prev;
          return [...prev, { name: data.name }];
        });
      });
      return () => {
        socket.off('player_bingo');
        socket.off('player_linha');
        socket.off('player_joined');
      };
    }
  }, [socket, roomId]);

  const createRoom = async () => {
    try {
      if (!admin) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/rooms/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: admin._id, gameMode })
      });
      const data = await res.json();
      setRoomId(data.roomId);
      setCalledNumbers([]);
      setLastDrawn(null);
      setHistory([]);
      setPlayers([]);
      if (socket) socket.emit('join_room', data.roomId);
    } catch (e) {
      console.error(e);
      alert('Backend is currently offline.');
    }
  };

  const getVoice = () => {
    const ptVoices = voices.filter(v => v.lang.startsWith("pt"));
    const vList = ptVoices.length > 0 ? ptVoices : voices;
    if (selectedVoiceType === 'female') {
      return vList.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("maria")) || vList[0];
    } else {
      return vList.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("daniel")) || vList[0];
    }
  };

  const speak = (num) => {
    const v = getVoice();
    if (!v) return;
    window.speechSynthesis.cancel();
    let text = `${num}`;
    if (gameMode === 75 || gameMode === 90) {
      const cols = ["B", "I", "N", "G", "O"];
      const letter = cols[Math.floor((num - 1) / (gameMode === 75 ? 15 : 18))];
      text = `${letter}. ${num}`;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.voice = v;
    u.rate = selectedVoiceType === 'female' ? 0.95 : 0.85;
    u.pitch = selectedVoiceType === 'female' ? 1.0 : 0.75;
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    if (autoMode === 0) return;
    if (calledNumbers.length >= gameMode) {
      setAutoMode(0);
      return;
    }
    const timer = setTimeout(() => {
      drawNumber();
    }, autoMode);
    return () => clearTimeout(timer);
  }, [autoMode, calledNumbers, gameMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetGame = () => {
    if (!window.confirm("Deseja realmente iniciar um Novo Bingo? Isso encerrará a sala atual e removerá todos os jogadores conectados.")) return;

    setAutoMode(0);
    setCalledNumbers([]);
    setLastDrawn(null);
    setHistory([]);
    setPlayers([]);
    if (socket) socket.emit('close_room', roomId);
    setRoomId(null);
  };

  const drawNumber = async () => {
    if (!roomId) return alert("Crie uma sala primeiro!");
    if (calledNumbers.length >= gameMode) {
      setAutoMode(0);
      return alert("Todos sorteados!");
    }

    let n;
    do { n = Math.floor(Math.random() * gameMode) + 1; } while (calledNumbers.includes(n));

    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    const newCalled = [...calledNumbers, n];
    setCalledNumbers(newCalled);
    setLastDrawn(n);
    setHistory(prev => [{ number: n, time: timeStr }, ...prev]);
    speak(n);

    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/rooms/${roomId}/draw`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: n })
    });

    let displayStr = `${n}`;
    if (gameMode === 75 || gameMode === 90) {
      const cols = ["B", "I", "N", "G", "O"];
      const letter = cols[Math.floor((n - 1) / (gameMode === 75 ? 15 : 18))];
      displayStr = `${letter} ${n}`;
    }
    if (socket) socket.emit('draw_number', { roomId, number: n, display: displayStr });
  };

  const getDisplayNumber = (num, mMode) => {
    if (!num) return <span style={{ fontSize: '0.4em', whiteSpace: 'nowrap', letterSpacing: '2px' }}>INÍCIO DO JOGO</span>;
    if (mMode === 75 || mMode === 90) {
      const cols = ["B", "I", "N", "G", "O"];
      const letter = cols[Math.floor((num - 1) / (mMode === 75 ? 15 : 18))];
      return `${letter} ${num}`;
    }
    return `${num}`;
  };

  const switchMode = (m) => {
    setGameMode(m);
    setRoomId(null);
    setCalledNumbers([]);
    setLastDrawn(null);
    setHistory([]);
  };

  const renderCols = () => {
    if (gameMode !== 75 && gameMode !== 90) {
      const rowsCount = gameMode / 10;
      const rows = [];
      for (let r = 0; r < rowsCount; r++) {
        const cells = [];
        for (let c = 1; c <= 10; c++) {
          const n = r * 10 + c;
          cells.push(<td key={n} className={calledNumbers.includes(n) ? "highlight" : ""}>{n}</td>);
        }
        rows.push(<tr key={r}>{cells}</tr>);
      }
      return rows;
    } else {
      const rowsCount = gameMode === 75 ? 15 : 18;
      const rows = [];
      for (let r = 1; r <= rowsCount; r++) {
        const cells = [];
        for (let c = 0; c < 5; c++) {
          const n = r + c * rowsCount;
          cells.push(<td key={n} className={calledNumbers.includes(n) ? "highlight" : ""}>{n}</td>);
        }
        rows.push(<tr key={r}>{cells}</tr>);
      }
      return rows;
    }
  };

  return (
    <div className="app-container pt-4">
      <header className="d-flex justify-content-between align-items-center w-100 flex-wrap gap-3 mb-4">
        <h1 id="mainTitle" className="mb-0 text-light fw-bold d-flex align-items-center flex-wrap gap-3" style={{ letterSpacing: '1px', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
          {roomId ? (
            <>
              Sala Aberta
              <span className="ms-2 text-info" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)' }}>
                | Cód: {roomId}
              </span>
            </>
          ) : (
            "PAINEL DE CONTROLE"
          )}
        </h1>
        <div className="tabs pt-2 pt-md-0">
          {[30, 75, 80, 90].map(m => (
            <button key={m} className={gameMode === m ? "active" : ""} onClick={() => switchMode(m)}>{m}</button>
          ))}
        </div>
      </header>

      {!roomId ? (
        <main className="w-100 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <div className="board-glass p-4 p-md-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ borderRadius: '24px', maxWidth: '600px', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="mb-4 text-info opacity-75">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.5 5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zM3 4.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm2 7a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm-1.5-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
                <path d="M14 2H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zM2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H2z" />
              </svg>
            </div>
            <h2 className="text-light fw-bold mb-4" style={{ fontFamily: 'var(--font-syncopate)' }}>ESTAÇÃO BINGO</h2>
            <p className="text-light opacity-75 mb-5 fs-5">
              Selecione a quantidade de dezenas na aba superior e ligue os motores virtuais para iniciar a sala!
            </p>
            <button className="btn-cyber btn-primary-cyber px-5 py-4 w-100 fw-bold rounded-4" style={{ fontSize: '1.4rem', letterSpacing: '2px', boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)' }} onClick={createRoom}>
              INICIAR SALA ({gameMode} Bolas)
            </button>
            <p className="mt-4 mb-0 text-light opacity-50 small">
              O sistema gerará simultaneamente o Código Criptográfico e o QR Code temporário para acesso instantâneo.
            </p>
          </div>
        </main>
      ) : (
        <>
          <main>
            <div className="hero-stage mb-4">
              <div className="number-display pop text-center">
                {getDisplayNumber(lastDrawn, gameMode)}
              </div>
            </div>
            <div className="board-glass">
              <table className="w-100">
                <thead>
                  {(gameMode === 75 || gameMode === 90) && (
                    <tr>{["B", "I", "N", "G", "O"].map(c => <th key={c} className="text-center fs-5 pb-3 w-20">{c}</th>)}</tr>
                  )}
                  {(gameMode !== 75 && gameMode !== 90) && (
                    <tr>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => <th key={c} className="text-center fs-6 pb-2">{c}</th>)}</tr>
                  )}
                </thead>
                <tbody>{renderCols()}</tbody>
              </table>
            </div>
          </main>

          <aside>
            <section className="cyber-panel controls-panel mb-4">
              <h2 className="mb-3 text-light fw-bold">Comandos</h2>
              <div className="control-stack d-flex flex-column gap-2">
                <button className="btn-cyber bg-transparent text-white border-secondary rounded-3 py-2 mb-1" onClick={resetGame}>♻️ Novo Bingo</button>

                <div className="d-flex gap-2">
                  <button className={`btn-cyber flex-grow-1 rounded-3 py-2 ${autoMode === 5000 ? 'border-info text-info fw-bold' : 'border-secondary text-white bg-transparent'}`} onClick={() => setAutoMode(5000)}>
                    ⚡ Auto 5s
                  </button>
                  <button className={`btn-cyber flex-grow-1 rounded-3 py-2 ${autoMode === 8000 ? 'border-info text-info fw-bold' : 'border-secondary text-white bg-transparent'}`} onClick={() => setAutoMode(8000)}>
                    🐢 Auto 8s
                  </button>
                </div>

                {autoMode > 0 ? (
                  <button className="btn-cyber border-danger text-danger bg-transparent rounded-3 w-100 py-3 mt-2 mb-2 fw-bold" onClick={() => setAutoMode(0)}>
                    ⏹ Parar Sorteio Auto
                  </button>
                ) : (
                  <button className="btn-cyber btn-primary-cyber rounded-3 w-100 py-3 mt-2 mb-2 fw-bold" onClick={drawNumber} style={{ fontSize: '1.2rem' }}>
                    SORTEAR BOLA
                  </button>
                )}

                <div className="voice-switch w-100 m-0 border border-secondary shadow-sm rounded-3 mt-2">
                  <button className={selectedVoiceType === 'male' ? 'active' : ''} onClick={() => setSelectedVoiceType('male')}>Voz 1</button>
                  <button className={selectedVoiceType === 'female' ? 'active' : ''} onClick={() => setSelectedVoiceType('female')}>Voz 2</button>
                </div>
              </div>
            </section>

            <section className="cyber-panel qr-panel text-center">
              <h2 className="text-light fw-bold">QR Code</h2>
              <div className="d-flex justify-content-center p-3 bg-white mx-auto my-3" style={{ borderRadius: '16px', maxWidth: '240px' }}>
                <QRCodeSVG value={`${frontendUrl}/jogar?room=${roomId}`} size={200} />
              </div>
              <p className="small text-light mb-0">Jogadores entram apenas escaneando.</p>
            </section>

            <section className="cyber-panel mt-4 overflow-hidden">
               <div className="d-flex justify-content-between align-items-center mb-3">
                 <h2 className="text-light fw-bold m-0">Jogadores</h2>
                 <span className="badge bg-info" style={{ fontSize: '0.8rem' }}>{players.length}</span>
               </div>
               <div className="d-flex flex-wrap gap-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                 {players.length > 0 ? (
                   players.map((p, i) => (
                     <span key={i} className="badge bg-dark border border-secondary text-light px-3 py-2" style={{ borderRadius: '12px', fontSize: '0.85rem' }}>
                       👤 {p.name}
                     </span>
                   ))
                 ) : (
                   <p className="text-light opacity-50 small mb-0 w-100 text-center">Nenhum jogador na sala.</p>
                 )}
               </div>
            </section>

            <section className="cyber-panel history-panel mt-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="text-light fw-bold m-0">Histórico</h2>
                <span className="badge" style={{ background: 'var(--accent)', fontSize: '0.8rem' }}>{calledNumbers.length} bolas</span>
              </div>

              {history.length > 0 ? (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '10px' }}>
                  {history.map((item, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center rounded-3 bg-dark border shadow-sm px-3 py-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <span className="text-info opacity-75 small" style={{ fontFamily: 'monospace' }}>{item.time}</span>
                      <strong className="text-white" style={{ fontSize: '1.2rem', letterSpacing: '1px' }}>
                        {getDisplayNumber(item.number, gameMode)}
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-light opacity-50 small mb-0 text-center py-2">O sorteio ainda não iniciou.</p>
              )}
            </section>
          </aside>
        </>
      )}
    </div>
  );
}
