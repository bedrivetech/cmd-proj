import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Edit2, Trash2, Phone, User, DollarSign, FileText, Briefcase, Building2, Activity, 
  X, BrainCircuit, Loader2, Copy, LayoutDashboard, Search, Mail, Ruler, HardHat, FileCheck, 
  MapPin, UserCog, Landmark, Gavel, History, Banknote, AlertTriangle, PlayCircle, Database, 
  Wifi, Calendar as CalendarIcon, Lock, LogIn, Moon, Sun, Download, Archive, 
  MessageCircle, ChevronDown, Kanban, LayoutGrid, ArrowUpDown, CheckSquare, Square, Trash
} from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp 
} from 'firebase/firestore';

// ==========================================================================
// ⚙️ إعدادات قاعدة البيانات (FIREBASE CONFIGURATION)
// ==========================================================================

const YOUR_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDSvi9dNBsXIjgv3yE2TZzBslk8QgYuv50",
  authDomain: "cmdec-project.firebaseapp.com",
  projectId: "cmdec-project",
  storageBucket: "cmdec-project.firebasestorage.app",
  messagingSenderId: "624320915226",
  appId: "1:624320915226:web:0a317d1aa4e2c052006ea3"
};

const envConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const firebaseConfig = YOUR_FIREBASE_CONFIG || envConfig;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const USE_CUSTOM_DB = !!YOUR_FIREBASE_CONFIG;

const getProjectsCollection = () => {
  if (USE_CUSTOM_DB) return collection(db, 'projects');
  return collection(db, 'artifacts', appId, 'public', 'data', 'projects');
};

const getProjectDoc = (id) => {
  if (USE_CUSTOM_DB) return doc(db, 'projects', id);
  return doc(db, 'artifacts', appId, 'public', 'data', 'projects', id);
};

// ==========================================================================
// الثوابت والقوائم (DEFINITIONS)
// ==========================================================================

const apiKey = "AIzaSyDRVla9f593dBhdLLSZhhv1v7V7DeejUuE"; 
const AI_MODEL_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

const APP_USERNAME = "cmdec";
const APP_PASSWORD = "cmdec";

const FILTERS = [
  { id: 'all', label: 'الكل', icon: LayoutDashboard },
  { id: 'ongoing', label: 'مستمرة', icon: PlayCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'under_study', label: 'تحت الدراسة', icon: FileText, color: 'text-sky-600', bg: 'bg-sky-50' },
  { id: 'stalled', label: 'متعثرة', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'financially_halted', label: 'متوقفة مالياً', icon: Banknote, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'source_private', label: 'قطاع خاص', icon: Briefcase },
  { id: 'source_etimad', label: 'اعتماد', icon: Landmark },
  { id: 'source_gov', label: 'حكومية', icon: Gavel },
];

const EXECUTION_STATUS_OPTIONS = [
  { id: 'ongoing', label: 'مستمر', color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' },
  { id: 'stalled', label: 'متعثر', color: 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' },
  { id: 'financially_halted', label: 'متوقف مالياً', color: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800' },
  { id: 'under_study', label: 'تحت الدراسة', color: 'text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800' },
  { id: 'completed', label: 'مكتمل', color: 'text-slate-700 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
];

const STATUS_OPTIONS = [
  'جديد', 'جاري التصميم', 'جاري الإشراف', 'بانتظار الموافقة', 'مكتمل', 'تم التقديم', 'تحت المراجعة'
];

const PROJECT_SOURCES = [
  'مشروع خاص', 'مشروع من منصة اعتماد', 'مشروع من منصة مدن', 'مشروع مناقصة حكومية', 'مشاريع الهيئات الملكية'
];

const SUBMISSION_STAGES = [
  'طلب تسعير', 'جاري التسعير', 'تم تقديم عرض السعر', 'تحت التقييم والرد من المالك', 'تمت الترسية', 'طلب تعديل فني او مالي', 'لم تتم الترسية'
];

const SERVICE_TYPES = [
  { id: 'design', label: 'تصميم', icon: Ruler },
  { id: 'supervision', label: 'إشراف', icon: HardHat },
  { id: 'design_supervision', label: 'تصميم وإشراف', icon: Activity },
  { id: 'municipal', label: 'خدمات بلدية', icon: FileText },
  { id: 'safety', label: 'خدمات سلامة', icon: FileCheck },
  { id: 'other', label: 'أخرى', icon: Briefcase },
];

const SAUDI_LOCATIONS = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'رأس الخير', 'الاحساء', 'القطيف', 'الجبيل',
  'القصيم', 'بريدة', 'عنيزة', 'أبها', 'خميس مشيط', 'جازان', 'نجران', 'تبوك', 'حائل', 'عرعر', 'الجوف', 'نيوم', 
  'الباحة', 'الطائف', 'ينبع', 'بيشة', 'حفر الباطن'
];

// --- Helper Functions ---

const calculateFinancials = (project) => {
  const price = Number(project.price) || 0;
  const payments = project.payments || [];
  const collected = payments.reduce((acc, p) => p.isPaid ? acc + (Number(p.amount) || 0) : acc, 0);
  const percentage = price > 0 ? Math.min(100, Math.round((collected / price) * 100)) : 0;
  return { price, collected, percentage };
};

const exportToCSV = (projects) => {
  const headers = ['اسم المشروع', 'العميل', 'رقم الهاتف', 'نوع الخدمة', 'قيمة العقد', 'المحصل', 'الحالة', 'بداية العقد', 'نهاية العقد'];
  const rows = projects.map(p => {
    const fin = calculateFinancials(p);
    return [
      `"${p.name}"`, 
      `"${p.ownerName || ''}"`, 
      `"${p.ownerPhone || ''}"`,
      `"${SERVICE_TYPES.find(t => t.id === p.serviceType)?.label || ''}"`,
      fin.price,
      fin.collected,
      `"${p.status}"`,
      p.contractStartDate || '',
      p.contractEndDate || ''
    ];
  });
  
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `projects_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- Components ---

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === APP_USERNAME && password === APP_PASSWORD) {
      onLogin();
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300" dir="rtl">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex justify-center mb-6">
           <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
             <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
           </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">تسجيل الدخول</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm">CMDEC Projects Dashboard</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المستخدم</label>
            <input type="text" className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="أدخل اسم المستخدم" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور</label>
            <input type="password" className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="أدخل كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm p-3 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2">
            <LogIn className="w-5 h-5" /> دخول للنظام
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-gray-400">CMDEC Projects System v2.5</div>
      </div>
    </div>
  );
};

const ProjectForm = ({ onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    name: '', serviceType: 'design', price: '', status: 'جديد', executionStatus: 'ongoing', location: '',
    projectSource: '', submissionStage: '', contractStartDate: '', contractEndDate: '',
    followUpEngineer: '', designEngineer: '', ownerName: '', ownerPhone: '', ownerEmail: '',
    notes: '', lastUpdateDate: new Date().toISOString().split('T')[0], lastUpdateNote: '',
    payments: [], // New: Payment Milestones
    isArchived: false
  });

  useEffect(() => {
    if (initialData) setFormData({ 
      ...formData, ...initialData,
      lastUpdateDate: initialData.lastUpdateDate || new Date().toISOString().split('T')[0],
      lastUpdateNote: initialData.lastUpdateNote || '',
      payments: initialData.payments || [],
      isArchived: initialData.isArchived || false
    });
  }, [initialData]);

  const handlePaymentChange = (index, field, value) => {
    const newPayments = [...formData.payments];
    newPayments[index][field] = value;
    setFormData({ ...formData, payments: newPayments });
  };

  const addPayment = () => {
    setFormData({ ...formData, payments: [...formData.payments, { title: '', amount: '', isPaid: false }] });
  };

  const removePayment = (index) => {
    setFormData({ ...formData, payments: formData.payments.filter((_, i) => i !== index) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="font-bold text-lg text-gray-800 dark:text-white">{initialData ? 'تعديل المشروع' : 'مشروع جديد'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition"><X className="w-5 h-5" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-blue-100 dark:border-blue-900/30 pb-2">البيانات الأساسية</h3>
            <div className="grid grid-cols-1 gap-4">
               <input required type="text" placeholder="اسم المشروع" className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:border-blue-500 outline-none"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white outline-none" value={formData.projectSource} onChange={e => setFormData({...formData, projectSource: e.target.value})}>
                  <option value="">جهة المشروع...</option>{PROJECT_SOURCES.map(src => <option key={src} value={src}>{src}</option>)}
                </select>
                <select className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
                  <option value="">المدينة...</option>{SAUDI_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
                <select className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white outline-none" value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})}>
                  {SERVICE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 pb-2 flex items-center gap-2"><Activity className="w-4 h-4" /> الحالة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white outline-none" value={formData.executionStatus} onChange={e => setFormData({...formData, executionStatus: e.target.value})}>
                {EXECUTION_STATUS_OPTIONS.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
              </select>
              <select className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white outline-none" value={formData.submissionStage} onChange={e => setFormData({...formData, submissionStage: e.target.value})}>
                <option value="">مرحلة المناقصة...</option>{SUBMISSION_STAGES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
              <select className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                {STATUS_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
          </div>

          {/* Financials (New: Payments) */}
          <div className="space-y-4 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
             <div className="flex justify-between items-center border-b border-emerald-200 dark:border-emerald-800 pb-2">
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-2"><Banknote className="w-4 h-4" /> الدفعات المالية</h3>
                <button type="button" onClick={addPayment} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded flex items-center gap-1"><Plus className="w-3 h-3" /> إضافة دفعة</button>
             </div>
             
             <div className="grid grid-cols-1 gap-4">
               <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">إجمالي قيمة العقد</label>
                  <input type="number" className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white outline-none" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
               </div>
               
               {/* Payments List */}
               <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                 {formData.payments.length === 0 && <p className="text-xs text-center text-gray-400 italic">لا توجد دفعات مضافة</p>}
                 {formData.payments.map((payment, idx) => (
                   <div key={idx} className="flex gap-2 items-center">
                     <input type="text" placeholder="عنوان الدفعة (مثلاً: الدفعة الأولى)" className="flex-1 p-1.5 text-xs border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                       value={payment.title} onChange={e => handlePaymentChange(idx, 'title', e.target.value)} />
                     <input type="number" placeholder="المبلغ" className="w-24 p-1.5 text-xs border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                       value={payment.amount} onChange={e => handlePaymentChange(idx, 'amount', e.target.value)} />
                     <button type="button" onClick={() => handlePaymentChange(idx, 'isPaid', !payment.isPaid)} 
                       className={`p-1.5 rounded transition ${payment.isPaid ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}`} title="حالة الدفع">
                       {payment.isPaid ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                     </button>
                     <button type="button" onClick={() => removePayment(idx)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded"><Trash className="w-4 h-4" /></button>
                   </div>
                 ))}
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                <input type="date" className="w-full p-2 text-xs border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" title="تاريخ البداية" value={formData.contractStartDate} onChange={e => setFormData({...formData, contractStartDate: e.target.value})} />
                <input type="date" className="w-full p-2 text-xs border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" title="تاريخ النهاية" value={formData.contractEndDate} onChange={e => setFormData({...formData, contractEndDate: e.target.value})} />
             </div>
          </div>

          {/* Team & Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50 space-y-3">
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2"><UserCog className="w-4 h-4"/> الفريق</h4>
                <input type="text" placeholder="مهندس المتابعة" className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.followUpEngineer} onChange={e => setFormData({...formData, followUpEngineer: e.target.value})} />
                <input type="text" placeholder="مهندس التصميم/الإدارة" className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.designEngineer} onChange={e => setFormData({...formData, designEngineer: e.target.value})} />
             </div>
             <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-200 flex items-center gap-2"><User className="w-4 h-4"/> العميل</h4>
                <input type="text" placeholder="الاسم" className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} />
                <input type="text" placeholder="الجوال" className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.ownerPhone} onChange={e => setFormData({...formData, ownerPhone: e.target.value})} />
                <input type="text" placeholder="الإيميل" className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.ownerEmail} onChange={e => setFormData({...formData, ownerEmail: e.target.value})} />
             </div>
          </div>

          {/* Updates */}
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800/50 space-y-2">
             <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2"><History className="w-4 h-4"/> آخر تحديث</h4>
             <input type="date" className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.lastUpdateDate} onChange={e => setFormData({...formData, lastUpdateDate: e.target.value})} />
             <textarea className="w-full p-2 text-sm border rounded h-16 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="تفاصيل التحديث..." value={formData.lastUpdateNote} onChange={e => setFormData({...formData, lastUpdateNote: e.target.value})} />
          </div>

          <textarea className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg h-20 resize-none dark:bg-gray-700 dark:text-white" placeholder="ملاحظات عامة..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>

          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition active:scale-[0.98]">
            حفظ التغييرات
          </button>
        </form>
      </div>
    </div>
  );
};

const ProjectCard = ({ project, onEdit, onDelete, onArchive }) => {
  const fin = calculateFinancials(project);
  const serviceInfo = SERVICE_TYPES.find(t => t.id === project.serviceType) || SERVICE_TYPES[5]; 
  const executionInfo = EXECUTION_STATUS_OPTIONS.find(t => t.id === project.executionStatus) || EXECUTION_STATUS_OPTIONS[0];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all p-4 group flex flex-col h-full relative overflow-hidden">
      {/* Top Bar */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${executionInfo.color}`}>{executionInfo.label}</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">{project.status}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-lg">
          <button onClick={() => onEdit(project)} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => onArchive(project)} className="p-1.5 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 rounded" title={project.isArchived ? "استعادة" : "أرشفة"}><Archive className="w-4 h-4" /></button>
          <button onClick={() => onDelete(project.id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2 line-clamp-2" title={project.name}>{project.name}</h3>

      {/* Meta */}
      <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-3 mb-3">
         <span className="flex items-center gap-1"><serviceInfo.icon className="w-3.5 h-3.5" /> {serviceInfo.label}</span>
         <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {project.location || '-'}</span>
         <span className="flex items-center gap-1"><Landmark className="w-3.5 h-3.5" /> {project.projectSource || '-'}</span>
      </div>

      {/* Submission Stage Badge */}
      {project.submissionStage && (
        <div className="mb-3 text-xs bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 px-2 py-1.5 rounded border border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <Gavel className="w-3.5 h-3.5" /> {project.submissionStage}
        </div>
      )}

      {/* Financial Progress */}
      {fin.price > 0 && (
        <div className="mb-3 bg-gray-50 dark:bg-gray-700/30 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-gray-500 dark:text-gray-400">المالية ({fin.percentage}%)</span>
            <span className={fin.percentage === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"}>
              {fin.collected.toLocaleString()} / {fin.price.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
            <div className={`h-1.5 rounded-full ${fin.percentage >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${fin.percentage}%` }}></div>
          </div>
        </div>
      )}

      {/* Dates */}
      {(project.contractStartDate || project.contractEndDate) && (
        <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded mb-3">
           <div><span className="block text-gray-400 dark:text-gray-500">البداية</span>{project.contractStartDate || '-'}</div>
           <div className="text-left"><span className="block text-gray-400 dark:text-gray-500">النهاية</span>
             <span className={new Date(project.contractEndDate) < new Date() && project.executionStatus !== 'completed' ? 'text-red-600 dark:text-red-400 font-bold' : ''}>{project.contractEndDate || '-'}</span>
           </div>
        </div>
      )}

      {/* Footer: Client & Contact */}
      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
         <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0">
               <User className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
               <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{project.ownerName || 'غير محدد'}</p>
            </div>
         </div>
         <div className="flex gap-1 flex-shrink-0">
            {project.ownerPhone && (
               <>
                 <a href={`https://wa.me/${project.ownerPhone.replace(/\s+/g, '')}`} target="_blank" rel="noreferrer" className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition" title="واتساب">
                    <MessageCircle className="w-4 h-4" />
                 </a>
                 <button onClick={() => navigator.clipboard.writeText(project.ownerPhone)} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition"><Phone className="w-4 h-4" /></button>
               </>
            )}
         </div>
      </div>
    </div>
  );
};

// --- View Components ---

const KanbanView = ({ projects, onEdit, onDelete, onArchive }) => {
  // Group projects by Execution Status
  const columns = EXECUTION_STATUS_OPTIONS.map(status => ({
    ...status,
    projects: projects.filter(p => p.executionStatus === status.id)
  }));

  return (
    <div className="flex overflow-x-auto pb-6 gap-4 h-[calc(100vh-220px)] custom-scrollbar">
      {columns.map(col => (
        <div key={col.id} className="min-w-[300px] w-[300px] flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 h-full">
          <div className={`p-3 border-b border-gray-200 dark:border-gray-700 font-bold flex justify-between items-center sticky top-0 bg-inherit rounded-t-xl z-10 ${col.color.split(' ')[0]}`}>
            {col.label}
            <span className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs shadow-sm">{col.projects.length}</span>
          </div>
          <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
            {col.projects.map(p => (
              <ProjectCard key={p.id} project={p} onEdit={onEdit} onDelete={onDelete} onArchive={onArchive} />
            ))}
            {col.projects.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-xs border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">لا توجد مشاريع</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const CalendarView = ({ projects, onEdit }) => {
  // Simple Month View Logic
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sun
  
  // Adjust for Saturday start if needed, here assuming Sun start
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const projectsByDate = projects.reduce((acc, p) => {
    if (p.contractEndDate) {
      const d = new Date(p.contractEndDate);
      if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
        const day = d.getDate();
        if (!acc[day]) acc[day] = [];
        acc[day].push(p);
      }
    }
    return acc;
  }, {});

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const monthName = currentDate.toLocaleString('ar-SA', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">السابق</button>
        <h3 className="font-bold text-lg text-gray-800 dark:text-white">{monthName}</h3>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">التالي</button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
        {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(d => <div key={d} className="py-3">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-gray-50 dark:bg-gray-900">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50"></div>)}
        {days.map(day => (
          <div key={day} className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-2 min-h-[100px] overflow-y-auto relative group">
            <span className="text-xs font-bold text-gray-400 absolute top-1 right-2">{day}</span>
            <div className="mt-4 space-y-1">
              {projectsByDate[day]?.map(p => (
                <button key={p.id} onClick={() => onEdit(p)} className="w-full text-right text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-1 rounded truncate hover:bg-blue-100 dark:hover:bg-blue-900/50 block">
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. Main App
export default function App() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // New States
  const [viewMode, setViewMode] = useState('cards'); // cards, kanban, calendar
  const [darkMode, setDarkMode] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, price_high, price_low, end_date
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (USE_CUSTOM_DB) { await signInAnonymously(auth); } 
      else { if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) { await signInWithCustomToken(auth, __initial_auth_token); } else { await signInAnonymously(auth); } }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const projectsRef = getProjectsCollection();
    return onSnapshot(projectsRef, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(fetched);
      setLoading(false);
    });
  }, [user]);

  // Toggle Dark Mode Class
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleSave = async (data) => {
    if (!user) return;
    try {
      if (editingProject) {
        await updateDoc(getProjectDoc(editingProject.id), data);
      } else {
        await addDoc(getProjectsCollection(), { ...data, createdAt: serverTimestamp(), createdBy: user.uid });
      }
      setIsFormOpen(false);
      setEditingProject(null);
    } catch (err) { console.error(err); alert("حدث خطأ."); }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد؟')) return;
    try { await deleteDoc(getProjectDoc(id)); } catch (err) { console.error(err); }
  };

  const handleArchive = async (project) => {
    try { await updateDoc(getProjectDoc(project.id), { isArchived: !project.isArchived }); } catch (err) { console.error(err); }
  };

  const processedProjects = useMemo(() => {
    let filtered = projects.filter(p => {
      // Archive Filter
      if (p.isArchived && !showArchived) return false;
      if (!p.isArchived && showArchived) return false; // Show only archived if toggled

      // Search Filter
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.ownerName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Tab Filter
      let matchesTab = false;
      if (activeTab === 'all') matchesTab = true;
      else if (['ongoing', 'stalled', 'financially_halted', 'under_study'].includes(activeTab)) matchesTab = p.executionStatus === activeTab;
      else if (activeTab === 'source_private') matchesTab = p.projectSource === 'مشروع خاص';
      else if (activeTab === 'source_etimad') matchesTab = p.projectSource && p.projectSource.includes('اعتماد');
      else if (activeTab === 'source_gov') matchesTab = p.projectSource && (p.projectSource.includes('حكومية') || p.projectSource.includes('مناقصة'));
      
      return matchesSearch && matchesTab;
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'price_high') return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === 'price_low') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'end_date') return new Date(a.contractEndDate || '2099') - new Date(b.contractEndDate || '2099');
      if (sortBy === 'oldest') return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0); // Newest default
    });
  }, [projects, activeTab, searchTerm, sortBy, showArchived]);

  const stats = {
    total: projects.filter(p => !p.isArchived).length,
    totalValue: projects.reduce((acc, p) => !p.isArchived && p.submissionStage === 'تمت الترسية' ? acc + (Number(p.price) || 0) : acc, 0),
    stalledCount: projects.filter(p => !p.isArchived && p.executionStatus === 'stalled').length
  };

  if (!isAuthenticated) return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-3 w-full md:w-auto order-2 md:order-1">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">لوحة تحكم المشـاريع</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">CMDEC Projects Dashboard</p>
              </div>
            </div>

            {/* Center Logo (if exists) */}
            <div className="order-1 md:order-2">
               <img src="download (1).jpg" alt="Logo" className="h-16 object-contain" onError={(e) => {e.target.style.display = 'none';}} />
            </div>
            
            {/* Toolbar */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end order-3">
               <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute right-3 top-2.5 text-gray-400" />
                <input type="text" placeholder="بحث..." className="pl-4 pr-9 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
               </div>
               
               {/* View Switcher */}
               <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                 <button onClick={() => setViewMode('cards')} className={`p-1.5 rounded ${viewMode === 'cards' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500'}`} title="كروت"><LayoutGrid className="w-4 h-4" /></button>
                 <button onClick={() => setViewMode('kanban')} className={`p-1.5 rounded ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500'}`} title="كانبان"><Kanban className="w-4 h-4" /></button>
                 <button onClick={() => setViewMode('calendar')} className={`p-1.5 rounded ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500'}`} title="تقويم"><CalendarIcon className="w-4 h-4" /></button>
               </div>

               {/* Actions */}
               <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                 {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </button>
               <button onClick={() => exportToCSV(processedProjects)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300" title="تصدير Excel"><Download className="w-5 h-5" /></button>
               <button onClick={() => { setEditingProject(null); setIsFormOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg"><Plus className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-Header (Filters & Sort) */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 min-w-max">
          <div className="flex gap-2">
            {FILTERS.map(filter => (
              <button key={filter.id} onClick={() => setActiveTab(filter.id)} className={`px-3 py-1.5 rounded-md font-medium text-xs whitespace-nowrap flex items-center gap-1.5 transition ${activeTab === filter.id ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                <filter.icon className="w-3.5 h-3.5" /> {filter.label}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
          <select className="bg-transparent text-xs font-bold text-gray-600 dark:text-gray-300 outline-none cursor-pointer" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">الأحدث إضافة</option>
            <option value="oldest">الأقدم إضافة</option>
            <option value="price_high">الأعلى سعراً</option>
            <option value="price_low">الأقل سعراً</option>
            <option value="end_date">الأقرب تسليماً</option>
          </select>
          <button onClick={() => setShowArchived(!showArchived)} className={`text-xs font-bold flex items-center gap-1 ${showArchived ? 'text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <Archive className="w-3.5 h-3.5" /> {showArchived ? 'عرض النشط' : 'الأرشيف'}
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-130px)] overflow-y-auto custom-scrollbar">
        {/* Stats (Only show in Cards View for space) */}
        {viewMode === 'cards' && !showArchived && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">إجمالي العقود الموقعة</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalValue.toLocaleString()} <span className="text-xs font-normal">ر.س</span></h3>
             </div>
             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">مشاريع متعثرة</p>
                <h3 className="text-xl font-bold text-red-600">{stats.stalledCount}</h3>
             </div>
             <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 flex items-center justify-between">
               <div>
                 <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-1">المستشار الذكي</h4>
                 <p className="text-xs text-blue-700 dark:text-blue-400">تحليل للمخاطر المالية والزمنية</p>
               </div>
               <button className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition">تحليل الآن</button>
             </div>
          </div>
        )}

        {/* Content Area */}
        {processedProjects.length > 0 ? (
          <>
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                {processedProjects.map(p => (
                  <ProjectCard key={p.id} project={p} onEdit={(p) => { setEditingProject(p); setIsFormOpen(true); }} onDelete={handleDelete} onArchive={handleArchive} />
                ))}
              </div>
            )}
            {viewMode === 'kanban' && (
              <KanbanView projects={processedProjects} onEdit={(p) => { setEditingProject(p); setIsFormOpen(true); }} onDelete={handleDelete} onArchive={handleArchive} />
            )}
            {viewMode === 'calendar' && (
              <CalendarView projects={processedProjects} onEdit={(p) => { setEditingProject(p); setIsFormOpen(true); }} />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">لا توجد مشاريع</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">حاول تغيير الفلاتر أو أضف مشروعاً جديداً</p>
          </div>
        )}
      </main>

      {isFormOpen && <ProjectForm onClose={() => { setIsFormOpen(false); setEditingProject(null); }} initialData={editingProject} onSave={handleSave} />}
      
      <div className="fixed bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-full text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-2 shadow-sm z-50">
        <div className={`w-2 h-2 rounded-full ${USE_CUSTOM_DB ? 'bg-green-500' : 'bg-amber-500'}`}></div>
        <span className="font-medium">{USE_CUSTOM_DB ? 'متصل بقاعدة بيانات خاصة' : 'وضع التجربة'}</span>
      </div>
    </div>
  );
}
