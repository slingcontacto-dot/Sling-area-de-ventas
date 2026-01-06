import React, { useState, useEffect } from 'react';
import { User, SalesRecord, SalesStat } from './types';
import { dataService } from './services/dataService';
import { authService } from './services/authService';
import { LoginForm } from './components/LoginForm';
import { DataEntryForm } from './components/DataEntryForm';
import { SalesTable } from './components/SalesTable';
import { StatsView } from './components/StatsView';
import { EditRecordModal } from './components/EditRecordModal';
import { UserManagement } from './components/UserManagement';
import { LogOut, LayoutDashboard, PlusCircle, PieChart, Users, Database, Archive, Download, FileSpreadsheet, Loader2, Wifi, WifiOff, Trophy, Star, Check, Sparkles } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [stats, setStats] = useState<SalesStat[]>([]);
  const [activeTab, setActiveTab] = useState<'entry' | 'list' | 'stats' | 'users'>('list');
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
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
        refreshData(false);
      });
      return () => {
        channel.unsubscribe();
      };
    }
  }, [user]);

  const refreshData = async (initialLoad = false) => {
    if (!user) return;
    try {
        const fetchedRecords = await dataService.getRecordsForUser(user);
        setRecords(fetchedRecords);
        const fetchedStats = await dataService.getStats();
        setStats(fetchedStats);

        if (initialLoad && !hasAcknowledgedInThisSession && fetchedStats.length > 0) {
            const topPerformer = [...fetchedStats].sort((a, b) => b.salesCount - a.salesCount)[0];
            if (topPerformer && topPerformer.name === user.username && topPerformer.salesCount > 0) {
                setShowTopUserModal(true);
            }
        }
    } catch (e) {
        console.error(e);
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setHasAcknowledgedInThisSession(false);
    setUser(loggedInUser);
    setActiveTab('list');
  };

  const handleLogout = () => {
    setUser(null);
    setRecords([]);
    setHasAcknowledgedInThisSession(false);
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
  };

  const handleExportExcel = () => {
    const csv = dataService.convertToCSV(records);
    const filename = `Reporte_Ventas_${new Date().toISOString().slice(0, 10)}.csv`;
    dataService.downloadFile(csv, filename, 'csv');
  };

  const handleBackup = async () => {
    const allData = await dataService.getAllRecords();
    const json = JSON.stringify(allData, null, 2);
    const filename = `Backup_Sling_${new Date().toISOString().slice(0, 10)}.json`;
    dataService.downloadFile(json, filename, 'json');
  };

  const handleNewCycle = async () => {
    if (window.confirm('⚠️ ATENCIÓN: Esta acción archivará la planilla y ELIMINARÁ todos los registros.\n\n¿Continuar?')) {
        setIsLoading(true);
        await handleBackup(); 
        await dataService.clearAllRecords();
        setIsLoading(false);
    }
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

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

        <div className="animate-fade-in-up">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">Procesando datos...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'entry' && <div className="max-w-4xl mx-auto"><DataEntryForm currentUser={user} onSave={handleSaveRecord} /></div>}
                    {activeTab === 'list' && (
                        <>
                            {user.role === 'owner' && (
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-wrap items-center justify-between gap-5">
                                    <div className="flex items-center gap-3 text-slate-800">
                                        <div className="p-2 bg-blue-50 rounded-lg"><Database size={22} className="text-blue-600" /></div>
                                        <div>
                                            <span className="font-black text-sm block">Panel de Administración</span>
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">Gestión de base de datos</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={handleExportExcel} className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 border border-green-200 text-xs font-black transition-all">
                                            <FileSpreadsheet size={16} /> EXPORTAR EXCEL
                                        </button>
                                        <button onClick={handleBackup} className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 border border-gray-200 text-xs font-black transition-all">
                                            <Download size={16} /> RESPALDO (JSON)
                                        </button>
                                        <button onClick={handleNewCycle} className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 border border-red-200 text-xs font-black transition-all">
                                            <Archive size={16} /> REINICIAR CICLO
                                        </button>
                                    </div>
                                </div>
                            )}
                            <SalesTable records={records} currentUser={user} onEdit={handleEditClick} onDelete={handleDeleteRecord} />
                        </>
                    )}
                    {activeTab === 'stats' && <div className="max-w-5xl mx-auto"><StatsView stats={stats} /></div>}
                    {activeTab === 'users' && user.role === 'owner' && <div className="max-w-5xl mx-auto"><UserManagement /></div>}
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