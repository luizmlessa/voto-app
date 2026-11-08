import { useEffect, useState } from 'react';
import { useVotoStore } from './store/useVotoStore';
import { usePlayUnlocked, useContextLine, useToday, useSleepItems } from './store/selectors';
import { isWeekend } from './lib/calendar';

export default function App() {
  const rollover = useVotoStore((s) => s.rollover);
  useEffect(() => { rollover(); }, [rollover]);

  const [abaAtiva, setAbaAtiva] = useState<'hoje' | 'heroi' | 'taverna' | 'metas'>('hoje');
  
  const { level, xp, hp, maxHp, mode, classe, moedas, streak, freezes, metas } = useVotoStore();
  const setMode = useVotoStore((s) => s.setMode);
  const setClasse = useVotoStore((s) => s.setClasse);
  const toggleItem = useVotoStore((s) => s.toggleItem);
  const toggleSleep = useVotoStore((s) => s.toggleSleep);
  const markPlayed = useVotoStore((s) => s.markPlayed);
  const addMeta = useVotoStore((s) => s.addMeta);
  const removeMeta = useVotoStore((s) => s.removeMeta);
  const buyItem = useVotoStore((s) => s.buyItem);

  const day = useToday();
  const sleep = useSleepItems();
  const unlocked = usePlayUnlocked();
  const line = useContextLine();

  const [novaMeta, setNovaMeta] = useState({ titulo: '', xp: 15, hp: 10, tipoDia: 'util' as 'todos' | 'util' | 'fds' });

  if (!day) return null;

  const xpMax = 100 + (level - 1) * 50;
  const metasDoDia = metas.filter(m => m.tipoDia === 'todos' || m.tipoDia === (isWeekend() ? 'fds' : 'util'));

  const getHeroVisual = () => {
    const congelado = hp < 30;
    const cansado = hp >= 30 && hp < 60;
    
    let corpo = '🧑‍🎓';
    if (congelado) corpo = '🥶';
    else if (cansado) corpo = '😰';
    
    let arma = '🪵';
    let aura = '';
    let nome = 'Roupas de Aprendiz';
    
    if (level >= 15) { arma = '🔮'; aura = 'drop-shadow-[0_0_15px_rgba(250,204,21,1)]'; nome = 'Lendário'; }
    else if (level >= 10) { arma = '⚔️'; aura = 'drop-shadow-[0_0_10px_rgba(56,189,248,1)]'; nome = 'Armadura de Aço'; }
    else if (level >= 5) { arma = '🗡️'; aura = 'drop-shadow-[0_0_8px_rgba(52,211,153,1)]'; nome = 'Armadura de Couro'; }

    let animacao = 'heroi-andando';
    if (congelado) animacao = 'heroi-congelado';
    else if (cansado) animacao = 'heroi-parado';

    return { corpo, arma, aura, nome, animacao, congelado };
  };

  const heroi = getHeroVisual();

  if (!classe) {
    return (
      <div className="mx-auto max-w-md p-6 bg-zinc-950 min-h-screen text-zinc-100 flex flex-col justify-center">
        <h1 className="text-3xl font-bold mb-2 text-center text-violet-400 uppercase">Escolha sua Classe</h1>
        <p className="text-zinc-400 text-center mb-8">Sua jornada começa aqui.</p>
        <div className="flex flex-col gap-4">
          <button onClick={() => setClasse('guerreiro')} className="bg-zinc-900 pixel-border p-4 text-left hover:bg-zinc-800 transition-colors">
            <strong className="text-xl text-rose-400 block mb-1">🛡️ Guerreiro</strong>
            <span className="text-sm text-zinc-400 block">+30 HP Máximo. Perde metade do HP no rollover.</span>
          </button>
          <button onClick={() => setClasse('mago')} className="bg-zinc-900 pixel-border p-4 text-left hover:bg-zinc-800 transition-colors">
            <strong className="text-xl text-blue-400 block mb-1">🔮 Mago</strong>
            <span className="text-sm text-zinc-400 block">Carreira dá o dobro de XP. +5 moedas ao subir nível.</span>
          </button>
          <button onClick={() => setClasse('ladino')} className="bg-zinc-900 pixel-border p-4 text-left hover:bg-zinc-800 transition-colors">
            <strong className="text-xl text-emerald-400 block mb-1">🗡️ Ladino</strong>
            <span className="text-sm text-zinc-400 block">Toda tarefa dá +2 moedas. Cardio no fds dá o dobro de XP.</span>
          </button>
          <button onClick={() => setClasse('clerigo')} className="bg-zinc-900 pixel-border p-4 text-left hover:bg-zinc-800 transition-colors">
            <strong className="text-xl text-amber-400 block mb-1">✨ Clérigo</strong>
            <span className="text-sm text-zinc-400 block">Dormir 6h30+ recupera 10 HP. Tarefa básica dá +50% XP.</span>
          </button>
          <button onClick={() => setClasse('druida')} className="bg-zinc-900 pixel-border p-4 text-left hover:bg-zinc-800 transition-colors">
            <strong className="text-xl text-lime-400 block mb-1">🍃 Druida</strong>
            <span className="text-sm text-zinc-400 block">Treino/Cardio dá o dobro de XP. Beber água recupera +5 HP.</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      
      {/* SIDEBAR / MOBILE HEADER */}
      <div className="md:w-64 md:h-screen md:sticky md:top-0 border-b-4 md:border-b-0 md:border-r-4 border-zinc-800 bg-zinc-900 md:bg-zinc-950 p-4 flex flex-col justify-between z-20">
        <div>
          <h1 className="text-2xl font-bold uppercase mb-1">Voto Vinculativo</h1>
          <div className="flex items-center gap-3 text-sm mb-6">
            <span className="capitalize font-medium text-zinc-300 bg-zinc-800 px-2 py-1 pixel-border">{heroi.corpo} {classe}</span>
            <span className="text-yellow-400 font-bold bg-yellow-950 px-2 py-1 pixel-border">🪙 {moedas}</span>
          </div>

          {/* NAVEGAÇÃO DESKTOP (Lado Esquerdo) */}
          <nav className="hidden md:flex flex-col gap-2">
            <button onClick={() => setAbaAtiva('hoje')} className={`flex items-center gap-3 p-3 font-bold text-left pixel-btn ${abaAtiva === 'hoje' ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}>
              📋 HOJE
            </button>
            <button onClick={() => setAbaAtiva('heroi')} className={`flex items-center gap-3 p-3 font-bold text-left pixel-btn ${abaAtiva === 'heroi' ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}>
              🧙 HERÓI
            </button>
            <button onClick={() => setAbaAtiva('taverna')} className={`flex items-center gap-3 p-3 font-bold text-left pixel-btn ${abaAtiva === 'taverna' ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}>
              🍺 TAVERNA
            </button>
            <button onClick={() => setAbaAtiva('metas')} className={`flex items-center gap-3 p-3 font-bold text-left pixel-btn ${abaAtiva === 'metas' ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}>
              ⚙️ METAS
            </button>
          </nav>
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          
          {/* ABA HOJE */}
          {abaAtiva === 'hoje' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Coluna Esquerda: Metas */}
              <div>
                {!isWeekend() && (
                  <div className="flex gap-2 mb-6">
                    <button onClick={() => setMode('solo')} className={`flex-1 py-2 font-bold text-sm pixel-btn ${mode === 'solo' ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400'}`}>SOLO</button>
                    <button onClick={() => setMode('coop')} className={`flex-1 py-2 font-bold text-sm pixel-btn ${mode === 'coop' ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400'}`}>COOP</button>
                  </div>
                )}
                <p className="text-sm text-zinc-400 bg-zinc-900 pixel-border p-3 mb-6">{line}</p>

                <h2 className="text-xl text-zinc-300 font-bold mb-3 uppercase">Checklist do dia</h2>
                <div className="flex flex-col gap-3">
                  {metasDoDia.map((it) => {
                    const isDone = !!day.done[it.id];
                    return (
                      <button key={it.id} onClick={() => toggleItem(it.id, it.xp, it.hp)} className={`w-full flex items-center gap-3 p-3 transition-all text-left pixel-btn ${isDone ? 'bg-emerald-900 border-emerald-500' : 'bg-zinc-900 border-zinc-700'}`}>
                        <span className={`w-6 h-6 flex items-center justify-center shrink-0 border-2 ${isDone ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-600'}`}>{isDone && '✓'}</span>
                        <span className="flex-1 text-base font-bold">{it.titulo}</span>
                        <span className="text-xs text-yellow-500 font-bold bg-yellow-950 px-2 py-1">+{it.xp} XP</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coluna Direita: Ação e Sono */}
              <div>
                <div className="bg-zinc-900 pixel-border p-6 mb-6 text-center">
                  <h2 className="text-xl text-zinc-300 font-bold mb-4 uppercase">Recompensa</h2>
                  <p className="text-sm text-zinc-400 mb-4">Complete todas as metas para liberar seu lazer.</p>
                  <button disabled={!unlocked || day.played} onClick={markPlayed} className={`w-full py-5 text-xl font-bold uppercase transition-all pixel-btn ${day.played ? 'bg-zinc-800 text-zinc-600' : unlocked ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-600 border-zinc-700'}`}>
                    {day.played ? '✓ Jogo Usado' : unlocked ? '🎮 Jogar Liberado' : '🔒 Bloqueado'}
                  </button>
                </div>

                <h2 className="text-xl text-zinc-300 font-bold mb-3 uppercase">Controle de Sono</h2>
                <div className="flex flex-col gap-3">
                  {sleep.map((it) => {
                    const isDone = !!day.sleep[it.id];
                    return (
                      <button key={it.id} onClick={() => toggleSleep(it.id)} className={`w-full flex items-center gap-3 p-3 text-left pixel-btn ${isDone ? 'bg-indigo-900 border-indigo-500' : 'bg-zinc-900 border-zinc-700'}`}>
                        <span className={`w-6 h-6 flex items-center justify-center border-2 ${isDone ? 'bg-indigo-500 border-indigo-500 text-black' : 'border-zinc-600'}`}>{isDone && '✓'}</span>
                        <span className="flex-1 text-base font-bold">{it.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ABA HERÓI */}
          {abaAtiva === 'heroi' && (
            <div className="max-w-2xl mx-auto">
              <div className={`bg-zinc-900 pixel-border p-6 flex flex-col items-center justify-center relative mb-6 overflow-hidden transition-colors duration-1000 ${heroi.congelado ? 'bg-blue-950/40 border-blue-800' : ''}`}>
                {heroi.congelado && (
                  <div className="absolute top-2 text-rose-400 text-sm font-bold animate-pulse uppercase tracking-widest">❄️ Hipotermia ❄️</div>
                )}
                <div className={`relative flex items-center justify-center mb-2 mt-4 ${heroi.aura}`}>
                  <div className={`text-9xl z-10 ${heroi.animacao}`}>{heroi.corpo}</div>
                  <div className={`absolute -right-8 bottom-2 text-6xl transform rotate-12 z-20 ${heroi.animacao}`}>{heroi.arma}</div>
                </div>
                <h2 className="text-3xl font-bold capitalize mt-2">{classe}</h2>
                <p className="text-violet-400 text-xl mb-6">{heroi.nome}</p>
                
                <div className="w-full flex justify-between text-base font-bold mb-1">
                  <span className="text-yellow-400">XP</span><span>{xp} / {xpMax}</span>
                </div>
                <div className="w-full h-5 bg-zinc-950 border-2 border-zinc-800 mb-6 p-0.5">
                  <div className="h-full bg-yellow-400" style={{ width: `${(xp / xpMax) * 100}%` }} />
                </div>

                <div className="w-full flex justify-between text-base font-bold mb-1">
                  <span className="text-rose-500">HP</span><span>{hp} / {maxHp}</span>
                </div>
                <div className="w-full h-5 bg-zinc-950 border-2 border-zinc-800 p-0.5">
                  <div className={`h-full transition-colors duration-500 ${heroi.congelado ? 'bg-blue-400' : 'bg-rose-500'}`} style={{ width: `${(hp / maxHp) * 100}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-900 pixel-border p-4 text-center">
                  <span className="block text-3xl mb-1">🔥</span>
                  <strong className="text-3xl block">{streak}</strong>
                  <span className="text-xs text-zinc-400 uppercase font-bold">Streak</span>
                </div>
                <div className="bg-zinc-900 pixel-border p-4 text-center">
                  <span className="block text-3xl mb-1">🎮</span>
                  <strong className="text-3xl block">{Object.values(useVotoStore.getState().days).filter(d => d.played).length}</strong>
                  <span className="text-xs text-zinc-400 uppercase font-bold">Jogados</span>
                </div>
                <div className="bg-zinc-900 pixel-border p-4 text-center">
                  <span className="block text-3xl mb-1">❄️</span>
                  <strong className="text-3xl block">{freezes}/2</strong>
                  <span className="text-xs text-zinc-400 uppercase font-bold">Amuletos</span>
                </div>
              </div>
            </div>
          )}

          {/* ABA TAVERNA */}
          {abaAtiva === 'taverna' && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <span className="text-6xl">🍺</span>
                <h2 className="text-3xl font-bold mt-2 text-yellow-400 uppercase">Taverna</h2>
                <p className="text-zinc-400">Gaste suas moedas suadas.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Itens... */}
                <div className="bg-zinc-900 pixel-border p-4 flex flex-col justify-between">
                  <div>
                    <strong className="text-xl text-rose-400 block uppercase mb-1">🧪 Poção de Vida</strong>
                    <span className="text-sm text-zinc-400 block mb-4">Recupera 30 de HP instantaneamente.</span>
                  </div>
                  <button disabled={moedas < 30} onClick={() => buyItem('pocao')} className={`w-full font-bold px-4 py-2 pixel-btn ${moedas < 30 ? 'bg-zinc-800 text-zinc-500' : 'bg-rose-600 text-white'}`}>🪙 30</button>
                </div>
                <div className="bg-zinc-900 pixel-border p-4 flex flex-col justify-between">
                  <div>
                    <strong className="text-xl text-yellow-400 block uppercase mb-1">📜 Pergaminho</strong>
                    <span className="text-sm text-zinc-400 block mb-4">Ganha 20 XP instantaneamente.</span>
                  </div>
                  <button disabled={moedas < 50} onClick={() => buyItem('xp_boost')} className={`w-full font-bold px-4 py-2 pixel-btn ${moedas < 50 ? 'bg-zinc-800 text-zinc-500' : 'bg-yellow-600 text-black'}`}>🪙 50</button>
                </div>
                <div className={`bg-zinc-900 pixel-border p-4 flex flex-col justify-between ${freezes >= 2 ? 'opacity-50' : ''}`}>
                  <div>
                    <strong className="text-xl text-cyan-400 block uppercase mb-1">❄️ Amuleto de Gelo</strong>
                    <span className="text-sm text-zinc-400 block mb-4">Salva seu Streak 1 vez se falhar. (Máx 2)</span>
                  </div>
                  <button disabled={freezes >= 2 || moedas < 100} onClick={() => buyItem('congelamento')} className={`w-full font-bold px-4 py-2 pixel-btn ${freezes >= 2 || moedas < 100 ? 'bg-zinc-800 text-zinc-500' : 'bg-cyan-600 text-white'}`}>
                    {freezes >= 2 ? 'LOTADO' : '🪙 100'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ABA METAS */}
          {abaAtiva === 'metas' && (
            <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900 pixel-border p-4 h-fit">
                <h3 className="font-bold mb-3 uppercase text-violet-400 text-lg">Forjar Meta</h3>
                <input type="text" placeholder="Ex: Ler 10 páginas" value={novaMeta.titulo} onChange={e => setNovaMeta({...novaMeta, titulo: e.target.value})} className="w-full bg-zinc-950 border-2 border-zinc-700 p-2 mb-3 focus:border-violet-500 outline-none" />
                <div className="flex gap-2 mb-3">
                  <select value={novaMeta.tipoDia} onChange={e => setNovaMeta({...novaMeta, tipoDia: e.target.value as 'todos' | 'util' | 'fds'})} className="bg-zinc-950 border-2 border-zinc-700 p-2 flex-1 outline-none">
                    <option value="util">Seg a Sex</option>
                    <option value="fds">Sáb e Dom</option>
                    <option value="todos">Todos os dias</option>
                  </select>
                  <input type="number" min="1" value={novaMeta.xp} onChange={e => setNovaMeta({...novaMeta, xp: Number(e.target.value)})} className="w-20 bg-zinc-950 border-2 border-zinc-700 p-2 text-center" title="XP" placeholder="XP" />
                </div>
                <button onClick={() => { if(novaMeta.titulo) { addMeta(novaMeta); setNovaMeta({...novaMeta, titulo: ''}); } }} className="w-full bg-violet-600 py-2 font-bold pixel-btn text-white">Adicionar</button>
              </div>

              <div className="flex flex-col gap-3">
                {metas.map(m => (
                  <div key={m.id} className="flex justify-between items-center bg-zinc-900 p-3 pixel-border">
                    <div>
                      <span className="block font-bold">{m.titulo}</span>
                      <span className="text-xs text-zinc-500 uppercase">{m.tipoDia} • {m.xp} XP</span>
                    </div>
                    <button onClick={() => removeMeta(m.id)} className="text-rose-500 font-bold p-2 hover:bg-rose-500/20 pixel-btn">X</button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* NAVEGAÇÃO MOBILE (Fica escondida no Desktop) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t-4 border-zinc-800 flex justify-around p-2 pb-safe z-30">
        <button onClick={() => setAbaAtiva('hoje')} className={`flex flex-col items-center p-2 text-sm font-bold w-16 pixel-btn ${abaAtiva === 'hoje' ? 'bg-violet-600 text-white' : 'text-zinc-500'}`}>
          <span className="text-xl mb-1">📋</span>HOJE
        </button>
        <button onClick={() => setAbaAtiva('heroi')} className={`flex flex-col items-center p-2 text-sm font-bold w-16 pixel-btn ${abaAtiva === 'heroi' ? 'bg-violet-600 text-white' : 'text-zinc-500'}`}>
          <span className="text-xl mb-1">🧙</span>HERÓI
        </button>
        <button onClick={() => setAbaAtiva('taverna')} className={`flex flex-col items-center p-2 text-sm font-bold w-16 pixel-btn ${abaAtiva === 'taverna' ? 'bg-violet-600 text-white' : 'text-zinc-500'}`}>
          <span className="text-xl mb-1">🍺</span>TAVERNA
        </button>
        <button onClick={() => setAbaAtiva('metas')} className={`flex flex-col items-center p-2 text-sm font-bold w-16 pixel-btn ${abaAtiva === 'metas' ? 'bg-violet-600 text-white' : 'text-zinc-500'}`}>
          <span className="text-xl mb-1">⚙️</span>METAS
        </button>
      </div>

    </div>
  );
}