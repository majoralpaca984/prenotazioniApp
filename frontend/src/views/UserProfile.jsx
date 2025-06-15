import React, { useState, useEffect } from "react";

// API Configuration
const API_BASE_URL = "https://prenotazioniapp.onrender.com";

// Utility functions
const getToken = () => localStorage?.getItem("token") || null;
const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
};

function UserProfile() {
  // Stati per navigazione
  const [activeTab, setActiveTab] = useState('personal');
  
  // Stati per i dati utente
  const [user, setUser] = useState(getUserFromToken());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Stati per informazioni personali
  const [personalData, setPersonalData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    birthDate: '',
    address: '',
    avatar: null
  });
  const [editingPersonal, setEditingPersonal] = useState(false);

  // Stati per cambio password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Stati per preferenze
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    reminderTime: '24', // ore prima
    privacy: 'friends',
    newsletter: true
  });

  // Stati per documenti
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Analisi del sangue",
      type: "Laboratorio",
      date: "2024-01-15",
      size: "2.3 MB",
      url: "#"
    },
    {
      id: 2,
      name: "ECG",
      type: "Cardiologia", 
      date: "2024-01-10",
      size: "1.8 MB",
      url: "#"
    }
  ]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Simulazione navigazione
  const navigate = (path) => {
    console.log(`Navigazione verso: ${path}`);
    alert(`Navigazione verso: ${path}`);
  };

  // API call per ottenere dati profilo
  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setPersonalData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          birthDate: userData.birthDate ? userData.birthDate.split('T')[0] : '',
          address: userData.address || '',
          avatar: userData.avatar || null
        });
        
        if (userData.preferences) {
          setPreferences({
            emailNotifications: userData.preferences.emailNotifications ?? true,
            smsNotifications: userData.preferences.smsNotifications ?? false,
            reminderTime: userData.preferences.reminderTime || '24',
            privacy: userData.preferences.privacy || 'friends',
            newsletter: userData.preferences.newsletter ?? true
          });
        }
      }
    } catch (err) {
      console.error('Errore nel caricamento profilo:', err);
    }
  };

  // Carica profilo al mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // API call per aggiornare profilo - ORA REALE!
  const updateProfile = async (data) => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('✅ Profilo aggiornato con successo!');
        setEditingPersonal(false);
        
        // Aggiorna token se fornito
        if (result.token) {
          localStorage.setItem('token', result.token);
        }
        
        // Ricarica dati profilo
        await fetchProfile();
      } else {
        throw new Error(result.message || 'Errore nell\'aggiornamento');
      }
    } catch (err) {
      setError(err.message || 'Errore nell\'aggiornamento del profilo');
    } finally {
      setLoading(false);
    }
  };

  // API call per cambio password - ORA REALE!
  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('✅ Password cambiata con successo!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        throw new Error(result.message || 'Errore nel cambio password');
      }
    } catch (err) {
      setError(err.message || 'Errore nel cambio password');
    } finally {
      setLoading(false);
    }
  };

  // API call per aggiornare preferenze
  const savePreferences = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ preferences })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('✅ Preferenze salvate con successo!');
      } else {
        throw new Error(result.message || 'Errore nel salvataggio');
      }
    } catch (err) {
      setError(err.message || 'Errore nel salvataggio delle preferenze');
    } finally {
      setLoading(false);
    }
  };

  // Handler per upload documenti
  const handleDocumentUpload = async (file) => {
    setUploadingDoc(true);
    
    // Simulazione upload
    setTimeout(() => {
      const newDoc = {
        id: documents.length + 1,
        name: file.name,
        type: "Documento",
        date: new Date().toISOString().split('T')[0],
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        url: "#"
      };
      setDocuments([...documents, newDoc]);
      setMessage('Documento caricato con successo!');
      setUploadingDoc(false);
    }, 2000);
  };

  // Handler per upload avatar
  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Crea preview dell'immagine
      const reader = new FileReader();
      reader.onload = (e) => {
        setPersonalData({...personalData, avatar: e.target.result});
        setMessage('Avatar aggiornato! Ricordati di salvare le modifiche.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler per logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Stili CSS
  const styles = `
    .profile-gradient {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    }
    
    .card-glass {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .tab-active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .upload-zone {
      border: 2px dashed #d1d5db;
      transition: all 0.3s ease;
    }
    
    .upload-zone:hover {
      border-color: #667eea;
      background-color: #f8fafc;
    }
    
    .upload-zone.dragover {
      border-color: #667eea;
      background-color: #eff6ff;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-gray-50">
        {/* Header con gradient */}
        <div className="profile-gradient py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center mb-8">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-white hover:text-gray-200 mr-4"
              >
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
              <h1 className="text-4xl font-bold text-white">Il Mio Profilo</h1>
            </div>
            
            {/* Avatar e info base */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-xl overflow-hidden">
                  {personalData.avatar ? (
                    <img 
                      src={personalData.avatar} 
                      alt="Avatar" 
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl text-gray-400">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => document.getElementById('avatarInput').click()}
                  className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
                >
                  <i className="fas fa-camera"></i>
                </button>
                <input
                  id="avatarInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-2">{personalData.name}</h2>
                <p className="text-white/80 text-lg mb-1">
                  <i className="fas fa-envelope mr-2"></i>
                  {personalData.email}
                </p>
                <p className="text-white/80">
                  <i className="fas fa-calendar-alt mr-2"></i>
                  Membro dal 2024
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
          {/* Messaggi */}
          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <i className="fas fa-check-circle mr-2"></i>
              {message}
            </div>
          )}
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar con tabs */}
            <div className="lg:col-span-1">
              <div className="card-glass rounded-2xl p-6 shadow-xl">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      activeTab === 'personal' ? 'tab-active' : 'hover:bg-gray-100'
                    }`}
                  >
                    <i className="fas fa-user mr-3"></i>
                    Informazioni Personali
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      activeTab === 'settings' ? 'tab-active' : 'hover:bg-gray-100'
                    }`}
                  >
                    <i className="fas fa-cog mr-3"></i>
                    Impostazioni Account
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      activeTab === 'documents' ? 'tab-active' : 'hover:bg-gray-100'
                    }`}
                  >
                    <i className="fas fa-file-medical mr-3"></i>
                    Documenti & Referti
                  </button>
                  
                  <hr className="my-4" />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                  >
                    <i className="fas fa-sign-out-alt mr-3"></i>
                    Esci
                  </button>
                </nav>
              </div>
            </div>

            {/* Contenuto principale */}
            <div className="lg:col-span-3">
              {/* TAB: Informazioni Personali */}
              {activeTab === 'personal' && (
                <div className="card-glass rounded-2xl p-8 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">
                      <i className="fas fa-user mr-3 text-blue-600"></i>
                      Informazioni Personali
                    </h3>
                    <button
                      onClick={() => setEditingPersonal(!editingPersonal)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                    >
                      <i className={`fas ${editingPersonal ? 'fa-times' : 'fa-edit'} mr-2`}></i>
                      {editingPersonal ? 'Annulla' : 'Modifica'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Nome Completo
                      </label>
                      {editingPersonal ? (
                        <input
                          type="text"
                          value={personalData.name}
                          onChange={(e) => setPersonalData({...personalData, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg text-gray-900 font-medium">{personalData.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Email
                      </label>
                      {editingPersonal ? (
                        <input
                          type="email"
                          value={personalData.email}
                          onChange={(e) => setPersonalData({...personalData, email: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg text-gray-900 font-medium">{personalData.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Telefono
                      </label>
                      {editingPersonal ? (
                        <input
                          type="tel"
                          value={personalData.phone}
                          onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                          placeholder="+39 123 456 7890"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg text-gray-900 font-medium">{personalData.phone || 'Non specificato'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Data di Nascita
                      </label>
                      {editingPersonal ? (
                        <input
                          type="date"
                          value={personalData.birthDate}
                          onChange={(e) => setPersonalData({...personalData, birthDate: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg text-gray-900 font-medium">{personalData.birthDate || 'Non specificata'}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Indirizzo
                      </label>
                      {editingPersonal ? (
                        <input
                          type="text"
                          value={personalData.address}
                          onChange={(e) => setPersonalData({...personalData, address: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                          placeholder="Via, Città, CAP"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg text-gray-900 font-medium">{personalData.address || 'Non specificato'}</p>
                      )}
                    </div>
                  </div>

                  {editingPersonal && (
                    <div className="mt-6 flex space-x-4">
                      <button
                        onClick={() => updateProfile(personalData)}
                        disabled={loading}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                        ) : (
                          <i className="fas fa-save mr-2"></i>
                        )}
                        Salva Modifiche
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Impostazioni Account */}
              {activeTab === 'settings' && (
                <div className="space-y-8">
                  {/* Cambio Password */}
                  <div className="card-glass rounded-2xl p-8 shadow-xl">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">
                      <i className="fas fa-lock mr-3 text-red-600"></i>
                      Sicurezza Account
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                          Password Attuale
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                          Nuova Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                          Conferma Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900 bg-white"
                        />
                      </div>
                    </div>

                    <button
                      onClick={changePassword}
                      disabled={loading}
                      className="mt-6 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                      ) : (
                        <i className="fas fa-key mr-2"></i>
                      )}
                      Cambia Password
                    </button>
                  </div>

                  {/* Preferenze Notifiche */}
                  <div className="card-glass rounded-2xl p-8 shadow-xl">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">
                      <i className="fas fa-bell mr-3 text-yellow-600"></i>
                      Preferenze Notifiche
                    </h3>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-gray-100">Notifiche Email</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Ricevi promemoria via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.emailNotifications}
                            onChange={(e) => setPreferences({...preferences, emailNotifications: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-gray-100">Notifiche SMS</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Ricevi promemoria via SMS</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.smsNotifications}
                            onChange={(e) => setPreferences({...preferences, smsNotifications: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                          Promemoria Anticipato
                        </label>
                        <select
                          value={preferences.reminderTime}
                          onChange={(e) => setPreferences({...preferences, reminderTime: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        >
                          <option value="1">1 ora prima</option>
                          <option value="24">24 ore prima</option>
                          <option value="48">2 giorni prima</option>
                          <option value="168">1 settimana prima</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                          Privacy Profilo
                        </label>
                        <select
                          value={preferences.privacy}
                          onChange={(e) => setPreferences({...preferences, privacy: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        >
                          <option value="public">Pubblico</option>
                          <option value="friends">Solo amici</option>
                          <option value="private">Privato</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={savePreferences}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                        ) : (
                          <i className="fas fa-save mr-2"></i>
                        )}
                        Salva Preferenze
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Documenti & Referti */}
              {activeTab === 'documents' && (
                <div className="space-y-8">
                  {/* Area Upload */}
                  <div className="card-glass rounded-2xl p-8 shadow-xl">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">
                      <i className="fas fa-cloud-upload-alt mr-3 text-green-600"></i>
                      Carica Nuovo Documento
                    </h3>

                    <div 
                      className="upload-zone rounded-xl p-8 text-center cursor-pointer"
                      onClick={() => document.getElementById('fileInput').click()}
                    >
                      <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Clicca per caricare o trascina i file qui
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        PDF, JPG, PNG - Max 10MB
                      </p>
                      
                      <input
                        id="fileInput"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleDocumentUpload(e.target.files[0]);
                          }
                        }}
                      />
                    </div>

                    {uploadingDoc && (
                      <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Caricamento in corso...
                      </div>
                    )}
                  </div>

                  {/* Lista Documenti */}
                  <div className="card-glass rounded-2xl p-8 shadow-xl">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">
                      <i className="fas fa-file-medical mr-3 text-purple-600"></i>
                      I Miei Documenti ({documents.length})
                    </h3>

                    <div className="space-y-4">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <i className="fas fa-file-pdf text-purple-600 text-xl"></i>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-gray-100">{doc.name}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-700 dark:text-gray-300">
                                <span>
                                  <i className="fas fa-tag mr-1"></i>
                                  {doc.type}
                                </span>
                                <span>
                                  <i className="fas fa-calendar mr-1"></i>
                                  {doc.date}
                                </span>
                                <span>
                                  <i className="fas fa-file mr-1"></i>
                                  {doc.size}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-700 p-2">
                              <i className="fas fa-download"></i>
                            </button>
                            <button className="text-gray-600 hover:text-gray-700 p-2">
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              onClick={() => deleteDocument(doc.id)}
                              className="text-red-600 hover:text-red-700 p-2"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}

                      {documents.length === 0 && (
                        <div className="text-center py-12">
                          <i className="fas fa-file-medical text-6xl text-gray-300 mb-4"></i>
                          <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                            Nessun documento caricato
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            Carica i tuoi referti e documenti medici per tenerli sempre a portata di mano
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserProfile;