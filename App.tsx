

import React, { useState, useEffect } from 'react';
import { User, SalesRecord, SalesStat, Cycle } from './types';
import { dataService } from './services/dataService';
import { authService } from './services/authService';
import { LoginForm } from './components/LoginForm';
import { DataEntryForm } from './components/DataEntryForm';
import { SalesTable } from './components/SalesTable';
import { StatsView } from './components/StatsView';
import { EditRecordModal } from './components/EditRecordModal';
import { UserManagement } from './components/UserManagement';
import { LogOut, LayoutDashboard, PlusCircle, PieChart, Users, Database, Archive, Download, FileSpreadsheet, Loader2, Wifi, WifiOff, Trophy, Star, Check, Sparkles, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [stats, setStats] = useState<SalesStat[]>([]);
  const [activeTab, setActiveTab] = useState<'entry' | 'list' | 'stats' | 'users'>('list');
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Cycle Management State
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [currentCycleIndex, setCurrentCycleIndex] = useState<number>(-1); // -1 means Current/Active cycle
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<SalesRecord | null>(null);
  
  const [showTopUserModal, setShowTopUserModal] = useState(false);
  const [hasAcknowledgedInThisSession, setHasAcknowledgedInThisSession] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (user) {
      refreshData(true);
      const channel = dataService.subscribeToChanges(() => {
        // Only refresh if we are looking at the current cycle
        if (currentCycleIndex === -1) {
            refreshData(false);
        }
      });
      return () => {
        channel.unsubscribe();
      };
    }
  }, [user, currentCycleIndex]); // Added currentCycleIndex dependency

  const refreshData = async (initialLoad = false) => {
    if (!user) return;
    try {
        setIsLoading(true);
        // Load cycle list
        const cyclesList = await dataService.getCycles();
        setCycles(cyclesList);

        // Determine which cycle ID to fetch
        let cycleIdToFetch: string | null = null;
        if (currentCycleIndex !== -1 && cyclesList[currentCycleIndex]) {
            cycleIdToFetch = cyclesList[currentCycleIndex].id;
        }

        const fetchedRecords = await dataService.getRecordsForUser(user, cycleIdToFetch);
        setRecords(fetchedRecords);
        
        const fetchedStats = await dataService.getStats(cycleIdToFetch);
        setStats(fetchedStats);

        if (initialLoad && !hasAcknowledgedInThisSession && fetchedStats.length > 0 && currentCycleIndex === -1) {
            const topPerformer = [...fetchedStats].sort((a, b) => b.salesCount - a.salesCount)[0];
            if (topPerformer && topPerformer.name === user.username && topPerformer.salesCount > 0) {
                setShowTopUserModal(true);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setHasAcknowledgedInThisSession(false);
    setUser(loggedInUser);
    setActiveTab('list');
    setCurrentCycleIndex(-1); // Reset to current cycle on login
  };

  const handleLogout = () => {
    setUser(null);
    setRecords([]);
    setHasAcknowledgedInThisSession(false);
  };

  // Cycle Navigation
  const handlePreviousCycle = () => {
    // Moving "back" in time means increasing the index (0 is most recent past, 1 is older)
    if (currentCycleIndex < cycles.length - 1) {
        setCurrentCycleIndex(prev => prev + 1);
    } else if (currentCycleIndex === -1 && cycles.length > 0) {
        setCurrentCycleIndex(0);
    }
  };

  const handleNextCycle = () => {
    // Moving "forward" in time means decreasing index
    if (currentCycleIndex > 0) {
        setCurrentCycleIndex(prev => prev - 1);
    } else if (currentCycleIndex === 0) {
        setCurrentCycleIndex(-1); // Back to current
    }
  };

  const getCycleDisplayName = () => {
    if (currentCycleIndex === -1) return "CICLO ACTUAL (En curso)";
    return `HISTORIAL: ${cycles[currentCycleIndex]?.name || 'Ciclo sin nombre'}`;
  };

  const handleSaveRecord = async (newRecord: Omit<SalesRecord, 'id'>) => {
    if (!isOnline) {
        alert('No tienes conexión a internet.');
        return;
    }
    await dataService.addRecord(newRecord);
    await refreshData(false);
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
        await dataService.deleteRecord(id);
        await refreshData(false);
    }
  };

  const handleEditClick = (record: SalesRecord) => {
    setRecordToEdit(record);
    setIsEditModalOpen(true);
  };

  const handleUpdateRecord = async (updatedRecord: SalesRecord) => {
    await dataService.updateRecord(updatedRecord);
    setIsEditModalOpen(false);
    setRecordToEdit(null);
    await refreshData(false);
  };

  const handleExportExcel = () => {
    const csv = dataService.convertToCSV(records);
    const cycleName = currentCycleIndex === -1 ? 'Actual' : cycles[currentCycleIndex].name;
    const filename = `Reporte_Ventas_${cycleName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    dataService.downloadFile(csv, filename, 'csv');
  };

  const handleBackup = async () => {
    // Backup always downloads EVERYTHING currently visible (or you could change to download all DB)
    // Here we download what is currently in state
    const json = JSON.stringify(records, null, 2);
    const cycleName = currentCycleIndex === -1 ? 'Actual' : cycles[currentCycleIndex].name;
    const filename = `Backup_Sling_${cycleName.replace(/\s+/g, '_')}.json`;
    dataService.downloadFile(json, filename, 'json');
  };

  const handleArchiveCycle = async () => {
    const defaultName = `Ciclo ${new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`;
    const name = window.prompt('Nombre para archivar este ciclo:', defaultName);
    
    if (name) {
        if (window.confirm(`⚠️ CONFIRMAR CIERRE DE CICLO\n\nSe moverán todos los registros actuales a la carpeta "${name}".\nLa planilla actual quedará vacía para iniciar de nuevo.\n\n¿Estás seguro?`)) {
            setIsLoading(true);
            const success = await dataService.archiveCurrentCycle(name);
            if (success) {
                alert('Ciclo cerrado y archivado correctamente.');
                await refreshData(true);
            } else {
                alert('Hubo un error al archivar el ciclo.');
            }
            setIsLoading(false);
        }
    }
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const isCurrentCycle = currentCycleIndex === -1;

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col">
      {showTopUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden transform animate-bounce-short">
             <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-10 text-center relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                    <div className="flex flex-wrap gap-6 justify-center py-4">
                        {[...Array(20)].map((_, i) => <Star key={i} size={32} className="text-white fill-white animate-pulse" />)}
                    </div>
                </div>
                
                <div className="relative z-10">
                    <div className="bg-white w-28 h-28 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3 transform hover:rotate-0 transition-transform duration-300">
                        <Trophy className="w-14 h-14 text-yellow-500" />
                    </div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-2 drop-shadow-lg">
                        ¡Eres el mejor!
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-white/90 font-bold bg-black/20 py-2 px-4 rounded-full w-fit mx-auto">
                        <Sparkles size={18} className="text-yellow-300" />
                        Líder de Ventas Actual
                    </div>
                </div>
             </div>
             
             <div className="p-10 text-center">
                <p className="text-gray-700 mb-8 text-xl leading-relaxed">
                    Hola <span className="font-black text-indigo-600">{user.username}</span>, tu desempeño es excepcional. Entras al sistema como el vendedor número uno del equipo.
                </p>
                <button 
                  onClick={() => {
                      setShowTopUserModal(false);
                      setHasAcknowledgedInThisSession(true);
                  }}
                  className="group relative w-full bg-slate-900 hover:bg-black text-white font-black py-5 px-8 rounded-2xl shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        <Check size={24} className="text-green-400" />
                        ¡ENTRAR A CARGAR!
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </button>
                <p className="mt-4 text-xs text-gray-400 font-medium">Reconocimiento automático basado en rendimiento real</p>
             </div>
          </div>
        </div>
      )}

      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                {!imgError ? (
                    <img 
                        src="/logo.jpg" 
                        alt="Logo" 
                        className="w-full h-full object-contain"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <span className="text-blue-900 font-bold text-xl">S</span>
                )}
             </div>
             <div>
                <h1 className="text-lg font-bold leading-tight">Sling Ventas</h1>
                <p className="text-xs text-slate-400 font-medium">{user.role === 'owner' ? 'Dueño' : 'Equipo de Ventas'}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-blue-400">{user.username}</p>
                {isOnline ? (
                    <div className="flex items-center justify-end gap-1 text-[10px] text-green-400 font-black uppercase">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        <span>Online</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-end gap-1 text-[10px] text-red-400 font-black uppercase">
                        <WifiOff size={10} />
                        <span>Offline</span>
                    </div>
                )}
             </div>
             <button 
                onClick={handleLogout}
                className="p-2.5 bg-slate-800 hover:bg-red-600 rounded-xl transition-all text-slate-300 hover:text-white group"
                title="Cerrar Sesión"
             >
                <LogOut size={18} className="group-hover:rotate-180 transition-transform duration-500" />
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Cycle Navigation Bar */}
        <div className="flex items-center justify-center mb-8 gap-4">
            <button 
                onClick={handlePreviousCycle}
                disabled={currentCycleIndex >= cycles.length - 1 && cycles.length > 0} // Disabled if at oldest cycle
                className="p-2 rounded-full bg-white text-slate-800 shadow-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft size={24} />
            </button>

            <div className={`px-6 py-2 rounded-xl flex items-center gap-3 shadow-sm border ${
                isCurrentCycle 
                ? 'bg-blue-600 text-white border-blue-500 shadow-blue-200' 
                : 'bg-amber-100 text-amber-900 border-amber-200'
            }`}>
                <Calendar size={18} className={isCurrentCycle ? 'text-blue-200' : 'text-amber-700'} />
                <span className="font-black uppercase tracking-wide text-sm">
                    {getCycleDisplayName()}
                </span>
            </div>

            <button 
                onClick={handleNextCycle}
                disabled={currentCycleIndex === -1} // Disabled if at current cycle
                className="p-2 rounded-full bg-white text-slate-800 shadow-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <ChevronRight size={24} />
            </button>
        </div>

        {/* Action Tabs */}
        {isCurrentCycle && (
            <div className="flex justify-center mb-10">
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap justify-center gap-1">
                    <button onClick={() => setActiveTab('list')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <LayoutDashboard size={18} /> Planilla
                    </button>
                    <button onClick={() => setActiveTab('entry')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'entry' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <PlusCircle size={18} /> Nueva Visita
                    </button>
                    <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'stats' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <PieChart size={18} /> Estadísticas
                    </button>
                    {user.role === 'owner' && (
                        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <Users size={18} /> Personal
                        </button>
                    )}
                </div>
            </div>
        )}

        <div className="animate-fade-in-up">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">Procesando datos del ciclo...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'entry' && isCurrentCycle && <div className="max-w-4xl mx-auto"><DataEntryForm currentUser={user} onSave={handleSaveRecord} /></div>}
                    
                    {(activeTab === 'list' || !isCurrentCycle) && (
                        <>
                            {user.role === 'owner' && (
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-wrap items-center justify-between gap-5">
                                    <div className="flex items-center gap-3 text-slate-800">
                                        <div className="p-2 bg-blue-50 rounded-lg"><Database size={22} className="text-blue-600" /></div>
                                        <div>
                                            <span className="font-black text-sm block">Panel de Administración</span>
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">
                                                {isCurrentCycle ? 'Gestión ciclo actual' : 'Viendo ciclo archivado'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={handleExportExcel} className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 border border-green-200 text-xs font-black transition-all">
                                            <FileSpreadsheet size={16} /> EXPORTAR
                                        </button>
                                        <button onClick={handleBackup} className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 border border-gray-200 text-xs font-black transition-all">
                                            <Download size={16} /> JSON
                                        </button>
                                        {isCurrentCycle && (
                                            <button onClick={handleArchiveCycle} className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 border border-amber-200 text-xs font-black transition-all">
                                                <Archive size={16} /> CERRAR CICLO
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                            <SalesTable records={records} currentUser={user} onEdit={handleEditClick} onDelete={handleDeleteRecord} />
                            {!isCurrentCycle && (
                                <div className="mt-8 max-w-5xl mx-auto">
                                    <h3 className="text-xl font-black text-gray-800 mb-4 px-4">Estadísticas de este Ciclo</h3>
                                    <StatsView stats={stats} />
                                </div>
                            )}
                        </>
                    )}
                    
                    {activeTab === 'stats' && isCurrentCycle && <div className="max-w-5xl mx-auto"><StatsView stats={stats} /></div>}
                    {activeTab === 'users' && isCurrentCycle && user.role === 'owner' && <div className="max-w-5xl mx-auto"><UserManagement /></div>}
                </>
            )}
        </div>
      </main>

      <EditRecordModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} record={recordToEdit} onSave={handleUpdateRecord} />
      
      <footer className="py-6 text-center text-gray-400 text-xs font-medium">
          &copy; {new Date().getFullYear()} Sling Gestión de Ventas - Panel de Alto Rendimiento
      </footer>
    </div>
  );
}

export default App;