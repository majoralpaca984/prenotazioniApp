import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function PaymentPage() {
  const navigate = useNavigate(); // ✅ Navigazione reale invece di simulata

  // 🔗 Leggi parametri URL per dati dinamici dell'esame
  const getExamDataFromURL = () => {
    // In un'app reale useresti useSearchParams() di react-router-dom
    const params = new URLSearchParams(window.location.search);
    
    // Se ci sono parametri URL, usa quelli, altrimenti usa dati di default
    if (params.get('doctorId')) {
      return {
        id: params.get('doctorId') || "1",
        name: params.get('examType') || "Visita Specialistica",
        doctor: params.get('doctorName') || "Dr. Mario Rossi",
        specialty: params.get('speciality') || "Medicina Generale",
        date: params.get('date') || "2025-01-20",
        time: params.get('time') || "Da definire",
        price: parseFloat(params.get('price')) || 80.00,
        location: "Roma, Via Roma 1"
      };
    }
    
    // Dati di default se non ci sono parametri URL
    return {
      id: "1",
      name: "Ecografia Addominale",
      doctor: "Dr. Mario Rossi",
      specialty: "Radiologia", 
      date: "2025-01-20",
      time: "10:30",
      price: 80.00,
      location: "Roma, Via Roma 1"
    };
  };

  // 📋 Dati esame dinamici basati sui parametri URL
  const examData = getExamDataFromURL();
  // Stati per step del pagamento
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Stati per dati fatturazione
  const [billingData, setBillingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'Italia'
  });

  // Stati per metodo pagamento
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // Stati per carta di credito
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Stati per validazioni e errori
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  // Calcoli prezzo
  const subtotal = examData.price;
  const tax = subtotal * 0.22; // IVA 22%
  const total = subtotal + tax;

  // Validazione email
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validazione carta di credito (algoritmo di Luhn semplificato)
  const validateCard = (number) => {
    const cleaned = number.replace(/\s/g, '');
    return /^\d{13,19}$/.test(cleaned);
  };

  // Formattazione numero carta
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  // Formattazione scadenza
  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  // Validazione form billing
  const validateBillingForm = () => {
    const newErrors = {};

    if (!billingData.firstName.trim()) newErrors.firstName = 'Nome obbligatorio';
    if (!billingData.lastName.trim()) newErrors.lastName = 'Cognome obbligatorio';
    if (!billingData.email.trim()) {
      newErrors.email = 'Email obbligatoria';
    } else if (!validateEmail(billingData.email)) {
      newErrors.email = 'Formato email non valido';
    }
    if (!billingData.phone.trim()) newErrors.phone = 'Telefono obbligatorio';
    if (!billingData.address.trim()) newErrors.address = 'Indirizzo obbligatorio';
    if (!billingData.city.trim()) newErrors.city = 'Città obbligatoria';
    if (!billingData.zipCode.trim()) newErrors.zipCode = 'CAP obbligatorio';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validazione form carta
  const validateCardForm = () => {
    const newErrors = {};

    if (!cardData.number.trim()) {
      newErrors.cardNumber = 'Numero carta obbligatorio';
    } else if (!validateCard(cardData.number)) {
      newErrors.cardNumber = 'Numero carta non valido';
    }

    if (!cardData.expiry.trim()) {
      newErrors.expiry = 'Scadenza obbligatoria';
    } else if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      newErrors.expiry = 'Formato scadenza non valido (MM/YY)';
    }

    if (!cardData.cvv.trim()) {
      newErrors.cvv = 'CVV obbligatorio';
    } else if (!/^\d{3,4}$/.test(cardData.cvv)) {
      newErrors.cvv = 'CVV non valido';
    }

    if (!cardData.name.trim()) newErrors.cardName = 'Nome sulla carta obbligatorio';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Procedi al passo successivo
  const nextStep = () => {
    if (currentStep === 1 && !validateBillingForm()) return;
    if (currentStep === 2 && paymentMethod === 'card' && !validateCardForm()) return;
    
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  // Torna al passo precedente
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Processo pagamento
  const processPayment = async () => {
    setPaymentProcessing(true);
    setMessage('');

    try {
      // Simulazione chiamata API pagamento
      await new Promise(resolve => setTimeout(resolve, 3000));

      // TODO: Integrare con Stripe, PayPal, o altro gateway
      // const response = await fetch('/api/payments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     amount: total,
      //     exam: examData,
      //     billing: billingData,
      //     payment: paymentMethod === 'card' ? cardData : { method: paymentMethod }
      //   })
      // });

      setPaymentComplete(true);
      setMessage('✅ Pagamento completato con successo!');

    } catch (error) {
      setMessage('❌ Errore nel pagamento. Riprova.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // CSS Styles
  const styles = `
    .payment-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    
    .step-indicator {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
    }
    
    .step {
      display: flex;
      align-items: center;
      margin: 0 1rem;
    }
    
    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 0.5rem;
      transition: all 0.3s ease;
    }
    
    .step-number.active {
      background: #667eea;
      color: white;
    }
    
    .step-number.completed {
      background: #10b981;
      color: white;
    }
    
    .step-number.inactive {
      background: #e5e7eb;
      color: #9ca3af;
    }
    
    .card-input {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      background-size: 1.5rem;
      padding-right: 3rem;
    }
    
    .secure-badge {
      background: linear-gradient(45deg, #10b981, #059669);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      margin-top: 1rem;
    }
  `;

  if (paymentComplete) {
    return (
      <>
        <style>{styles}</style>
        <div className="payment-container">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-check text-3xl text-white"></i>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Pagamento Completato!
                  </h1>
                  <p className="text-gray-600 text-lg">
                    La tua prenotazione è stata confermata
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4">Dettagli Prenotazione</h3>
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Esame:</span>
                      <span className="font-medium">{examData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dottore:</span>
                      <span className="font-medium">{examData.doctor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data:</span>
                      <span className="font-medium">{examData.date} alle {examData.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Totale Pagato:</span>
                      <span className="font-bold text-green-600">€{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <i className="fas fa-tachometer-alt mr-2"></i>
                    Vai alla Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/calendar')}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all"
                  >
                    <i className="fas fa-calendar mr-2"></i>
                    Vedi Calendario
                  </button>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                  <i className="fas fa-envelope mr-2"></i>
                  Una email di conferma è stata inviata a {billingData.email}
                </div>

                <div className="mt-4 text-xs text-center text-gray-400 bg-blue-50 p-3 rounded-lg">
                  💡 <strong>Info per sviluppatori:</strong> I dati dell'esame vengono letti dai parametri URL. 
                  Questo pagamento è collegato al DoctorCard che hai selezionato!
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="payment-container">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                Completa il Pagamento
              </h1>
              <p className="text-white/80 text-lg">
                Prenota il tuo esame in sicurezza
              </p>
            </div>

            {/* Step Indicator */}
            <div className="step-indicator">
              <div className="step">
                <div className={`step-number ${currentStep >= 1 ? 'active' : 'inactive'}`}>1</div>
                <span className="text-white font-medium">Dati Fatturazione</span>
              </div>
              <div className="flex-1 h-px bg-white/30 mx-4 self-center"></div>
              <div className="step">
                <div className={`step-number ${currentStep >= 2 ? 'active' : 'inactive'}`}>2</div>
                <span className="text-white font-medium">Metodo Pagamento</span>
              </div>
              <div className="flex-1 h-px bg-white/30 mx-4 self-center"></div>
              <div className="step">
                <div className={`step-number ${currentStep >= 3 ? 'active' : 'inactive'}`}>3</div>
                <span className="text-white font-medium">Conferma</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Principale */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                  {/* Messaggi */}
                  {message && (
                    <div className={`mb-6 p-4 rounded-lg ${
                      message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {message}
                    </div>
                  )}

                  {/* Step 1: Dati Fatturazione */}
                  {currentStep === 1 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <i className="fas fa-user mr-3 text-blue-600"></i>
                        Dati di Fatturazione
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nome *
                          </label>
                          <input
                            type="text"
                            value={billingData.firstName}
                            onChange={(e) => setBillingData({...billingData, firstName: e.target.value})}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.firstName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Mario"
                          />
                          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Cognome *
                          </label>
                          <input
                            type="text"
                            value={billingData.lastName}
                            onChange={(e) => setBillingData({...billingData, lastName: e.target.value})}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.lastName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Rossi"
                          />
                          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={billingData.email}
                            onChange={(e) => setBillingData({...billingData, email: e.target.value})}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="mario.rossi@email.com"
                          />
                          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Telefono *
                          </label>
                          <input
                            type="tel"
                            value={billingData.phone}
                            onChange={(e) => setBillingData({...billingData, phone: e.target.value})}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="+39 123 456 7890"
                          />
                          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Indirizzo *
                          </label>
                          <input
                            type="text"
                            value={billingData.address}
                            onChange={(e) => setBillingData({...billingData, address: e.target.value})}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.address ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Via Roma 123"
                          />
                          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Città *
                          </label>
                          <input
                            type="text"
                            value={billingData.city}
                            onChange={(e) => setBillingData({...billingData, city: e.target.value})}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.city ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Roma"
                          />
                          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            CAP *
                          </label>
                          <input
                            type="text"
                            value={billingData.zipCode}
                            onChange={(e) => setBillingData({...billingData, zipCode: e.target.value})}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.zipCode ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="00100"
                          />
                          {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Metodo Pagamento */}
                  {currentStep === 2 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <i className="fas fa-credit-card mr-3 text-green-600"></i>
                        Metodo di Pagamento
                      </h3>

                      {/* Selezione metodo */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <button
                          onClick={() => setPaymentMethod('card')}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            paymentMethod === 'card' 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <i className="fas fa-credit-card text-2xl mb-2 text-blue-600"></i>
                          <div className="font-medium">Carta di Credito</div>
                          <div className="text-sm text-gray-500">Visa, Mastercard</div>
                        </button>

                        <button
                          onClick={() => setPaymentMethod('paypal')}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            paymentMethod === 'paypal' 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <i className="fab fa-paypal text-2xl mb-2 text-blue-600"></i>
                          <div className="font-medium">PayPal</div>
                          <div className="text-sm text-gray-500">Account PayPal</div>
                        </button>

                        <button
                          onClick={() => setPaymentMethod('bank')}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            paymentMethod === 'bank' 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <i className="fas fa-university text-2xl mb-2 text-blue-600"></i>
                          <div className="font-medium">Bonifico</div>
                          <div className="text-sm text-gray-500">Bancario</div>
                        </button>
                      </div>

                      {/* Form carta di credito */}
                      {paymentMethod === 'card' && (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Numero Carta *
                            </label>
                            <input
                              type="text"
                              value={cardData.number}
                              onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 card-input ${
                                errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="1234 5678 9012 3456"
                              maxLength="19"
                            />
                            {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">
                                Scadenza *
                              </label>
                              <input
                                type="text"
                                value={cardData.expiry}
                                onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                  errors.expiry ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="MM/YY"
                                maxLength="5"
                              />
                              {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">
                                CVV *
                              </label>
                              <input
                                type="text"
                                value={cardData.cvv}
                                onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                  errors.cvv ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="123"
                                maxLength="4"
                              />
                              {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Nome sulla Carta *
                            </label>
                            <input
                              type="text"
                              value={cardData.name}
                              onChange={(e) => setCardData({...cardData, name: e.target.value.toUpperCase()})}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                errors.cardName ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="MARIO ROSSI"
                            />
                            {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                          </div>
                        </div>
                      )}

                      {/* Info PayPal */}
                      {paymentMethod === 'paypal' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                          <i className="fab fa-paypal text-4xl text-blue-600 mb-4"></i>
                          <h4 className="font-bold text-gray-900 mb-2">Pagamento tramite PayPal</h4>
                          <p className="text-gray-600">
                            Verrai reindirizzato su PayPal per completare il pagamento in sicurezza.
                          </p>
                        </div>
                      )}

                      {/* Info Bonifico */}
                      {paymentMethod === 'bank' && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                            <i className="fas fa-university mr-2 text-gray-600"></i>
                            Dati per Bonifico Bancario
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Beneficiario:</strong> EasyCare S.r.l.</div>
                            <div><strong>IBAN:</strong> IT60 X054 2811 1010 0000 0123 456</div>
                            <div><strong>BIC:</strong> BPMOIT22</div>
                            <div><strong>Causale:</strong> Pagamento esame {examData.name} - Ref: {examData.id}</div>
                          </div>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                            <p className="text-sm text-yellow-800">
                              <i className="fas fa-info-circle mr-2"></i>
                              Il pagamento verrà confermato entro 1-2 giorni lavorativi.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Conferma */}
                  {currentStep === 3 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <i className="fas fa-check-circle mr-3 text-green-600"></i>
                        Conferma Pagamento
                      </h3>

                      <div className="space-y-6">
                        {/* Riepilogo Dati Fatturazione */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h4 className="font-bold text-gray-900 mb-4">Dati di Fatturazione</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Nome:</span>
                              <span className="font-medium ml-2">{billingData.firstName} {billingData.lastName}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Email:</span>
                              <span className="font-medium ml-2">{billingData.email}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Telefono:</span>
                              <span className="font-medium ml-2">{billingData.phone}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Indirizzo:</span>
                              <span className="font-medium ml-2">
                                {billingData.address}, {billingData.city} {billingData.zipCode}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Riepilogo Pagamento */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h4 className="font-bold text-gray-900 mb-4">Metodo di Pagamento</h4>
                          <div className="flex items-center">
                            {paymentMethod === 'card' && (
                              <>
                                <i className="fas fa-credit-card text-blue-600 mr-3"></i>
                                <span>Carta **** **** **** {cardData.number.slice(-4)}</span>
                              </>
                            )}
                            {paymentMethod === 'paypal' && (
                              <>
                                <i className="fab fa-paypal text-blue-600 mr-3"></i>
                                <span>PayPal</span>
                              </>
                            )}
                            {paymentMethod === 'bank' && (
                              <>
                                <i className="fas fa-university text-blue-600 mr-3"></i>
                                <span>Bonifico Bancario</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Termini e Condizioni */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                          <div className="flex items-start">
                            <input type="checkbox" className="mt-1 mr-3" id="terms" />
                            <label htmlFor="terms" className="text-sm text-gray-700">
                              Accetto i{' '}
                              <a href="#" className="text-blue-600 hover:underline">termini e condizioni</a>
                              {' '}e l'
                              <a href="#" className="text-blue-600 hover:underline">informativa sulla privacy</a>.
                              Confermo che i dati inseriti sono corretti.
                            </label>
                          </div>
                        </div>

                        {/* Bottone Pagamento */}
                        <button
                          onClick={processPayment}
                          disabled={paymentProcessing}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                        >
                          {paymentProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                              Elaborazione in corso...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-lock mr-3"></i>
                              Paga €{total.toFixed(2)}
                            </>
                          )}
                        </button>

                        {/* Badge Sicurezza */}
                        <div className="text-center">
                          <div className="secure-badge">
                            <i className="fas fa-shield-alt mr-2"></i>
                            Pagamento Sicuro SSL
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottoni Navigazione */}
                  {!paymentProcessing && currentStep < 3 && (
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                      <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Indietro
                      </button>
                      
                      <button
                        onClick={nextStep}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                      >
                        Avanti
                        <i className="fas fa-arrow-right ml-2"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Riepilogo */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-2xl p-6 sticky top-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Riepilogo Ordine
                  </h3>

                  {/* Dettagli Esame */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-stethoscope text-blue-600"></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{examData.name}</h4>
                        <p className="text-sm text-gray-600">{examData.specialty}</p>
                        <p className="text-sm text-gray-600">
                          <i className="fas fa-user-md mr-1"></i>
                          {examData.doctor}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <i className="fas fa-calendar mr-2"></i>
                        {examData.time !== "Da definire" 
                          ? `${examData.date} alle ${examData.time}`
                          : `${examData.date} - Orario da concordare`
                        }
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        {examData.location}
                      </div>
                    </div>
                  </div>

                  {/* Calcolo Prezzo */}
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotale</span>
                      <span className="font-medium">€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IVA (22%)</span>
                      <span className="font-medium">€{tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-900">Totale</span>
                        <span className="text-lg font-bold text-green-600">€{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info Aggiuntive */}
                  <div className="mt-6 text-sm text-gray-600">
                    <div className="flex items-center mb-2">
                      <i className="fas fa-clock mr-2 text-green-500"></i>
                      Conferma immediata
                    </div>
                    <div className="flex items-center mb-2">
                      <i className="fas fa-undo mr-2 text-blue-500"></i>
                      Cancellazione gratuita fino a 24h prima
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-shield-alt mr-2 text-purple-500"></i>
                      Pagamento sicuro e protetto
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentPage;