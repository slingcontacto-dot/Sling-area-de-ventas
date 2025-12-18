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
import { LogOut, LayoutDashboard, PlusCircle, PieChart, Users, Database, Archive, Download, FileSpreadsheet, Loader2, Wifi, WifiOff } from 'lucide-react';
import { SUPABASE_URL } from './services/supabaseClient';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [stats, setStats] = useState<SalesStat[]>([]);
  const [activeTab, setActiveTab] = useState<'entry' | 'list' | 'stats' | 'users'>('list');
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<SalesRecord | null>(null);

  // Initialize Services on mount
  useEffect(() => {
    // Network status listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch data whenever user changes AND setup Realtime Subscription
  useEffect(() => {
    if (user) {
      refreshData();

      // Configurar escucha en Tiempo Real
      const channel = dataService.subscribeToChanges(() => {
        // Cuando hay un cambio en la base de datos, refrescamos los datos locales
        refreshData();
      });

      // Limpiar suscripción al desmontar o cambiar usuario
      return () => {
        channel.unsubscribe();
      };
    }
  }, [user]);

  const refreshData = async () => {
    if (!user) return;
    try {
        const fetchedRecords = await dataService.getRecordsForUser(user);
        setRecords(fetchedRecords);
        const fetchedStats = await dataService.getStats();
        setStats(fetchedStats);
    } catch (e) {
        console.error(e);
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setActiveTab('list'); // Default view
  };

  const handleLogout = () => {
    setUser(null);
    setRecords([]);
  };

  const handleSaveRecord = async (newRecord: Omit<SalesRecord, 'id'>) => {
    if (!isOnline) {
        alert('No tienes conexión a internet. No se puede guardar el registro en este momento.');
        return;
    }
    await dataService.addRecord(newRecord);
    // Refresh is now handled by Realtime, but calling it here ensures immediate UI feedback for the doer
    await refreshData();
  };

  // Delete Action
  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
        await dataService.deleteRecord(id);
        // Refresh handled by Realtime
    }
  };

  // Open Edit Modal
  const handleEditClick = (record: SalesRecord) => {
    setRecordToEdit(record);
    setIsEditModalOpen(true);
  };

  // Save Edit Action
  const handleUpdateRecord = async (updatedRecord: SalesRecord) => {
    await dataService.updateRecord(updatedRecord);
    setIsEditModalOpen(false);
    setRecordToEdit(null);
  };

  // Admin Actions
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
    if (window.confirm('⚠️ ATENCIÓN: Esta acción archivará la planilla actual (descargando una copia) y ELIMINARÁ todos los registros para iniciar un nuevo ciclo vacío.\n\n¿Estás seguro de continuar?')) {
        setIsLoading(true);
        // 1. Download Backup
        await handleBackup(); 
        
        // 2. Clear Data
        await dataService.clearAllRecords();
        
        setIsLoading(false);
        alert('Ciclo reiniciado. Se ha descargado una copia de los datos anteriores.');
    }
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col">
      {/* Header */}
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
                <h1 className="text-lg font-bold leading-tight">Registro de visitas Sling</h1>
                <p className="text-xs text-slate-400 font-medium">Panel de {user.role === 'owner' ? 'Dueño' : 'Empleado'}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user.username}</p>
                {isOnline ? (
                    <div className="flex items-center justify-end gap-1 text-xs text-green-400 font-medium">
                        <Wifi size={14} />
                        <span>En línea</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-end gap-1 text-xs text-red-400 font-bold animate-pulse">
                        <WifiOff size={14} />
                        <span>Sin conexión</span>
                    </div>
                )}
             </div>
             <button 
                onClick={handleLogout}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white"
                title="Cerrar Sesión"
             >
                <LogOut size={20} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs (Mobile optimized) */}
        <div className="flex justify-center mb-8">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex flex-wrap justify-center">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'list' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <LayoutDashboard size={18} />
                    Planilla
                </button>
                <button
                    onClick={() => setActiveTab('entry')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'entry' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <PlusCircle size={18} />
                    Cargar
                </button>
                <button
                    onClick={() => setActiveTab('stats')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'stats' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <PieChart size={18} />
                    Estadísticas
                </button>
                {user.role === 'owner' && (
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'users' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Users size={18} />
                        Usuarios
                    </button>
                )}
            </div>
        </div>

        {/* Content Area */}
        <div className="animate-fade-in-up">
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
            ) : (
                <>
                    {activeTab === 'entry' && (
                        <div className="max-w-4xl mx-auto">
                            <DataEntryForm currentUser={user} onSave={handleSaveRecord} />
                        </div>
                    )}

                    {activeTab === 'list' && (
                        <>
                            {/* Admin Actions Bar for Owner */}
                            {user.role === 'owner' && (
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Database size={20} className="text-blue-600" />
                                        <span className="font-semibold text-sm">Administración de Datos</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={handleExportExcel}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200 text-xs font-semibold transition-colors"
                                        >
                                            <FileSpreadsheet size={16} />
                                            Exportar Excel
                                        </button>
                                        <button
                                            onClick={handleBackup}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 text-xs font-semibold transition-colors"
                                        >
                                            <Download size={16} />
                                            Backup Diario (JSON)
                                        </button>
                                        <button
                                            onClick={handleNewCycle}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 text-xs font-semibold transition-colors"
                                        >
                                            <Archive size={16} />
                                            Archivar y Nuevo Ciclo
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Export button for employees */}
                            {user.role === 'employee' && (
                                <div className="flex justify-end mb-4">
                                    <button
                                        onClick={handleExportExcel}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm text-sm font-medium transition-colors"
                                    >
                                        <FileSpreadsheet size={16} />
                                        Descargar Planilla
                                    </button>
                                </div>
                            )}

                            <SalesTable 
                                records={records} 
                                currentUser={user} 
                                onEdit={handleEditClick}
                                onDelete={handleDeleteRecord}
                            />
                        </>
                    )}

                    {activeTab === 'stats' && (
                        <div className="max-w-5xl mx-auto">
                            <StatsView stats={stats} />
                            
                            {/* Extra context for Owner */}
                            {user.role === 'owner' && (
                                <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                                    <h3 className="text-indigo-900 font-bold text-lg mb-2">Vista de Gerencia</h3>
                                    <p className="text-indigo-700 text-sm">
                                        Como dueño, tienes acceso completo a todas las métricas. Actualmente hay un total de <span className="font-bold">{records.length}</span> registros en el sistema.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'users' && user.role === 'owner' && (
                        <div className="max-w-5xl mx-auto">
                            <UserManagement />
                        </div>
                    )}
                </>
            )}
        </div>
      </main>

      {/* Modals */}
      <EditRecordModal 
         isOpen={isEditModalOpen}
         onClose={() => setIsEditModalOpen(false)}
         record={recordToEdit}
         onSave={handleUpdateRecord}
      />
    </div>
  );
}

export default App;