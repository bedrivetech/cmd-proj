import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Phone, 
  User, 
  DollarSign, 
  FileText, 
  Briefcase, 
  Building2, 
  Activity, 
  X, 
  BrainCircuit, 
  Loader2,
  Copy,
  LayoutDashboard,
  Search,
  Mail,
  Ruler,
  HardHat,
  FileCheck,
  MapPin,
  UserCog,
  Landmark,
  Gavel,
  History,
  Banknote,
  AlertTriangle,
  PlayCircle,
  Database,
  Wifi,
  Calendar,
  Lock,
  LogIn
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
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp
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

// 🔐 إعدادات الدخول (LOGIN CREDENTIALS)
const APP_USERNAME = "cmdec";
const APP_PASSWORD = "cmdec";

const FILTERS = [
  { id: 'all', label: 'الكل', icon: LayoutDashboard },
  { id: 'ongoing', label: 'مشاريع مستمرة', icon: PlayCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'under_study', label: 'تحت الدراسة', icon: FileText, color: 'text-sky-600', bg: 'bg-sky-50' },
  { id: 'stalled', label: 'مشاريع متعثرة', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'financially_halted', label: 'متوقفة مالياً', icon: Banknote, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'source_private', label: 'قطاع خاص', icon: Briefcase },
  { id: 'source_etimad', label: 'منصة اعتماد', icon: Landmark },
  { id: 'source_modon', label: 'منصة مدن', icon: Building2 },
  { id: 'source_gov', label: 'مناقصات حكومية', icon: Gavel },
  { id: 'source_royal', label: 'الهيئات الملكية', icon: Landmark },
];

const EXECUTION_STATUS_OPTIONS = [
  { id: 'ongoing', label: 'مستمر', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: 'stalled', label: 'متعثر', color: 'text-red-700 bg-red-50 border-red-200' },
  { id: 'financially_halted', label: 'متوقف مالياً', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  { id: 'under_study', label: 'تحت الدراسة', color: 'text-sky-700 bg-sky-50 border-sky-200' },
  { id: 'completed', label: 'مكتمل', color: 'text-slate-700 bg-slate-50 border-slate-200' },
];

const PROJECT_SOURCE_COLORS = {
  'مشروع خاص': 'text-indigo-700 bg-indigo-50 border-indigo-200',
  'مشروع من منصة اعتماد': 'text-teal-700 bg-teal-50 border-teal-200',
  'مشروع من منصة مدن': 'text-cyan-700 bg-cyan-50 border-cyan-200',
  'مشروع مناقصة حكومية': 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'مشاريع الهيئات الملكية': 'text-purple-700 bg-purple-50 border-purple-200',
};

const STATUS_COLORS = {
  'جديد': 'text-blue-700 bg-blue-50 border-blue-200',
  'جاري التصميم': 'text-indigo-700 bg-indigo-50 border-indigo-200',
  'جاري الإشراف': 'text-violet-700 bg-violet-50 border-violet-200',
  'بانتظار الموافقة': 'text-amber-700 bg-amber-50 border-amber-200',
  'مكتمل': 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'تم التقديم': 'text-cyan-700 bg-cyan-50 border-cyan-200',
  'تحت المراجعة': 'text-orange-700 bg-orange-50 border-orange-200',
};

const PROJECT_SOURCES = [
  'مشروع خاص', 
  'مشروع من منصة اعتماد', 
  'مشروع من منصة مدن', 
  'مشروع مناقصة حكومية', 
  'مشاريع الهيئات الملكية'
];

const STATUS_OPTIONS = [
  'جديد', 
  'جاري التصميم', 
  'جاري الإشراف', 
  'بانتظار الموافقة', 
  'مكتمل', 
  'تم التقديم', 
  'تحت المراجعة'
];

const SUBMISSION_STAGES = [
  'طلب تسعير', 
  'جاري التسعير', 
  'تم تقديم عرض السعر', 
  'تحت التقييم والرد من المالك', 
  'تمت الترسية', 
  'طلب تعديل فني او مالي', 
  'لم تتم الترسية'
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
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 
  'الدمام', 'الخبر', 'الظهران', 'الاحساء', 'القطيف', 'الجبيل',
  'القصيم', 'بريدة', 'عنيزة', 
  'أبها', 'خميس مشيط', 'جازان', 'نجران', 
  'تبوك', 'حائل', 'عرعر', 'الجوف', 'سكاكا', 
  'الباحة', 'الطائف', 'ينبع', 'بيشة', 'حفر الباطن'
];

// --- Components ---

// 1. Login Screen
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <div className="flex justify-center mb-6">
           <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
             <Lock className="w-10 h-10 text-blue-600" />
           </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">تسجيل الدخول</h2>
        <p className="text-gray-500 text-center mb-8 text-sm">إدارة المكتب الهندسي</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
            <input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="أدخل اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input 
              type="password" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            دخول للنظام
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-gray-400">
          CMDEC System v2.0
        </div>
      </div>
    </div>
  );
};

// 2. Project Form Modal
const ProjectForm = ({ onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    serviceType: 'design',
    price: '',
    collectedAmount: '', 
    status: 'جديد',
    executionStatus: 'ongoing', 
    location: '',
    projectSource: '',
    submissionStage: '',
    contractStartDate: '', 
    contractEndDate: '', 
    followUpEngineer: '',
    designEngineer: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    notes: '',
    lastUpdateDate: new Date().toISOString().split('T')[0],
    lastUpdateNote: ''
  });

  useEffect(() => {
    if (initialData) setFormData({
      ...formData,
      ...initialData,
      lastUpdateDate: initialData.lastUpdateDate || new Date().toISOString().split('T')[0],
      lastUpdateNote: initialData.lastUpdateNote || '',
      collectedAmount: initialData.collectedAmount || '',
      contractStartDate: initialData.contractStartDate || '',
      contractEndDate: initialData.contractEndDate || '',
      executionStatus: initialData.executionStatus || 'ongoing'
    });
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center sticky top-0">
          <h2 className="font-bold text-lg text-gray-800">
            {initialData ? 'تعديل بيانات المشروع' : 'إضافة مشروع جديد'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* 1. Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-800 border-b border-blue-100 pb-2">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المشروع</label>
                <input required type="text" className="w-full p-2 border rounded-md outline-none focus:border-blue-500"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">جهة المشروع</label>
                  <select className="w-full p-2 border rounded-md outline-none bg-white"
                    value={formData.projectSource} onChange={e => setFormData({...formData, projectSource: e.target.value})}>
                    <option value="">اختر الجهة...</option>
                    {PROJECT_SOURCES.map(src => <option key={src} value={src}>{src}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
                  <select className="w-full p-2 border rounded-md outline-none bg-white"
                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
                    <option value="">اختر الموقع...</option>
                    {SAUDI_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">نوع الخدمة</label>
                   <select className="w-full p-2 border rounded-md outline-none bg-white"
                    value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})}>
                    {SERVICE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Status */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              حالة المشروع والتنفيذ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الحالة التنفيذية (للفلترة)</label>
                <select className="w-full p-2 border rounded-md outline-none bg-white font-semibold text-gray-700"
                  value={formData.executionStatus} onChange={e => setFormData({...formData, executionStatus: e.target.value})}>
                  {EXECUTION_STATUS_OPTIONS.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
                </select>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">مرحلة التقديم (للمناقصات)</label>
                 <select className="w-full p-2 border rounded-md outline-none bg-white"
                  value={formData.submissionStage} onChange={e => setFormData({...formData, submissionStage: e.target.value})}>
                  <option value="">اختر المرحلة...</option>
                  {SUBMISSION_STAGES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الحالة العامة</label>
                <select className="w-full p-2 border rounded-md outline-none bg-white"
                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  {STATUS_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* 3. Financials & Dates */}
          <div className="space-y-4 bg-green-50 p-4 rounded-lg border border-green-100">
             <h3 className="text-sm font-bold text-green-900 border-b border-green-200 pb-2 flex items-center gap-2">
              <Banknote className="w-4 h-4" />
              البيانات المالية والزمنية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">قيمة العقد الإجمالية (ر.س)</label>
                <input type="number" className="w-full p-2 border rounded-md outline-none focus:border-green-500"
                  placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ المحصل (ر.س)</label>
                <input type="number" className="w-full p-2 border rounded-md outline-none focus:border-green-500"
                  placeholder="0.00" value={formData.collectedAmount} onChange={e => setFormData({...formData, collectedAmount: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ بداية العقد</label>
                <input type="date" className="w-full p-2 border rounded-md outline-none bg-white"
                  value={formData.contractStartDate} onChange={e => setFormData({...formData, contractStartDate: e.target.value})} />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ نهاية العقد</label>
                <input type="date" className="w-full p-2 border rounded-md outline-none bg-white"
                  value={formData.contractEndDate} onChange={e => setFormData({...formData, contractEndDate: e.target.value})} />
              </div>
            </div>
          </div>

          {/* 4. Updates & Team */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2"><History className="w-4 h-4"/> آخر تحديث</h4>
                <div className="space-y-2">
                   <input type="date" className="w-full p-2 border rounded-md text-sm bg-white"
                    value={formData.lastUpdateDate} onChange={e => setFormData({...formData, lastUpdateDate: e.target.value})} />
                   <textarea className="w-full p-2 border rounded-md text-sm h-20 bg-white resize-none"
                    placeholder="ملاحظات التحديث..." value={formData.lastUpdateNote} onChange={e => setFormData({...formData, lastUpdateNote: e.target.value})} />
                </div>
             </div>
             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2"><UserCog className="w-4 h-4"/> الفريق</h4>
                <div className="space-y-2">
                   <input type="text" placeholder="مهندس المتابعة" className="w-full p-2 border rounded-md text-sm bg-white"
                    value={formData.followUpEngineer} onChange={e => setFormData({...formData, followUpEngineer: e.target.value})} />
                   <input type="text" placeholder="مهندس التصميم/الإدارة" className="w-full p-2 border rounded-md text-sm bg-white"
                    value={formData.designEngineer} onChange={e => setFormData({...formData, designEngineer: e.target.value})} />
                </div>
             </div>
          </div>

          {/* 5. Client & Notes */}
           <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                 <input type="text" placeholder="اسم العميل" className="w-full p-2 border rounded-md text-sm"
                  value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} />
                 <input type="text" placeholder="رقم الجوال" className="w-full p-2 border rounded-md text-sm"
                  value={formData.ownerPhone} onChange={e => setFormData({...formData, ownerPhone: e.target.value})} />
                 <input type="text" placeholder="البريد الإلكتروني" className="w-full p-2 border rounded-md text-sm"
                  value={formData.ownerEmail} onChange={e => setFormData({...formData, ownerEmail: e.target.value})} />
              </div>
              <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 h-20 resize-none"
                placeholder="ملاحظات عامة إضافية..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
           </div>

          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition active:scale-[0.98]">
            حفظ التغييرات
          </button>
        </form>
      </div>
    </div>
  );
};

// 3. Comprehensive Project Card (Replaces Detail View)
const ProjectCard = ({ project, onEdit, onDelete }) => {
  const copyToClipboard = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  const serviceTypeInfo = SERVICE_TYPES.find(t => t.id === project.serviceType) || SERVICE_TYPES[5]; 
  const ServiceIcon = serviceTypeInfo.icon;
  const executionInfo = EXECUTION_STATUS_OPTIONS.find(t => t.id === project.executionStatus) || EXECUTION_STATUS_OPTIONS[0];

  const totalPrice = Number(project.price) || 0;
  const collected = Number(project.collectedAmount) || 0;
  const collectionPercentage = totalPrice > 0 ? Math.min(100, Math.round((collected / totalPrice) * 100)) : 0;

  const getStageColor = (stage) => {
    if (stage === 'تمت الترسية') return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    if (stage === 'لم تتم الترسية') return 'text-red-700 bg-red-50 border-red-100';
    return 'text-amber-700 bg-amber-50 border-amber-100';
  };

  const getSourceColor = (source) => {
    return PROJECT_SOURCE_COLORS[source] || 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || 'text-gray-700 bg-gray-50 border-gray-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-4 group relative flex flex-col h-full">
      {/* Top: Status */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${executionInfo.color} shadow-sm`}>
            {executionInfo.label}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border shadow-sm ${getStatusColor(project.status)}`}>
             {project.status || 'غير محدد'}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(project)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => onDelete(project.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Meta Data */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
         <div className="flex items-center gap-1 text-gray-600" title="نوع الخدمة">
            <ServiceIcon className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate">{serviceTypeInfo.label}</span>
         </div>
         <div className="flex items-center gap-1 text-gray-600" title="المدينة">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate">{project.location || 'غير محدد'}</span>
         </div>
         <div className="col-span-2 flex items-center gap-1 mt-1">
            <span className={`truncate text-[10px] px-2 py-0.5 rounded border ${getSourceColor(project.projectSource)}`}>
               {String(project.projectSource || 'غير محدد')}
            </span>
         </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-2 leading-tight min-h-[2.5rem]" title={project.name}>{project.name}</h3>

      {/* Submission Stage */}
      {project.submissionStage && (
        <div className={`mb-3 flex items-start gap-2 text-xs px-2 py-1.5 rounded border shadow-sm ${getStageColor(project.submissionStage)}`}>
          <Gavel className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span className="font-medium truncate">{project.submissionStage}</span>
        </div>
      )}

      {/* Financials */}
      {totalPrice > 0 && (
        <div className="mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="text-gray-500">العقد: {totalPrice.toLocaleString()}</span>
            <span className={collectionPercentage === 100 ? "text-emerald-600" : "text-blue-600"}>
              {collectionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mb-1">
            <div 
              className={`h-1.5 rounded-full ${collectionPercentage >= 100 ? 'bg-emerald-500' : collectionPercentage > 50 ? 'bg-blue-500' : 'bg-amber-500'}`} 
              style={{ width: `${collectionPercentage}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-gray-400 text-left">تم تحصيل: {collected.toLocaleString()}</div>
        </div>
      )}

      {/* Dates */}
      {(project.contractStartDate || project.contractEndDate) && (
        <div className="flex justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 mb-3">
           <div><span className="text-gray-400 block text-[10px]">البداية</span>{project.contractStartDate || '-'}</div>
           <div className="text-left"><span className="text-gray-400 block text-[10px]">النهاية</span>
             <span className={new Date(project.contractEndDate) < new Date() ? 'text-red-600 font-bold' : ''}>{project.contractEndDate || '-'}</span>
           </div>
        </div>
      )}

      {/* Team */}
      {(project.followUpEngineer || project.designEngineer) && (
         <div className="mb-3 flex items-center gap-2 text-xs bg-blue-50 text-blue-800 px-2 py-1.5 rounded border border-blue-100">
            <UserCog className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate font-medium">{project.followUpEngineer || project.designEngineer}</span>
         </div>
      )}

      {/* Client Details (Always Shown) */}
      {(project.ownerName || project.ownerPhone || project.ownerEmail) && (
        <div className="mb-3 border-t border-gray-100 pt-2">
           <p className="text-[10px] text-gray-400 mb-1 font-medium">بيانات المالك</p>
           <div className="space-y-1">
              {project.ownerName && (
                 <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{project.ownerName}</span>
                 </div>
              )}
              {project.ownerPhone && (
                 <div className="flex items-center justify-between text-xs text-gray-600 group/phone">
                    <div className="flex items-center gap-1.5">
                       <Phone className="w-3 h-3 text-gray-400" />
                       <span className="font-mono dir-ltr">{project.ownerPhone}</span>
                    </div>
                    <button onClick={() => copyToClipboard(project.ownerPhone)} className="text-blue-500 opacity-0 group-hover/phone:opacity-100 px-1 text-[10px]">نسخ</button>
                 </div>
              )}
              {project.ownerEmail && (
                 <div className="flex items-center justify-between text-xs text-gray-600 group/email">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                       <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                       <span className="truncate font-mono">{project.ownerEmail}</span>
                    </div>
                    <button onClick={() => copyToClipboard(project.ownerEmail)} className="text-blue-500 opacity-0 group-hover/email:opacity-100 px-1 text-[10px]">نسخ</button>
                 </div>
              )}
           </div>
        </div>
      )}

      {/* Notes & Update */}
      <div className="mt-auto pt-2 border-t border-gray-50 space-y-2">
         {(project.lastUpdateDate || project.lastUpdateNote) && (
            <div className="bg-amber-50 border border-amber-100 rounded p-2">
               <div className="flex items-center gap-1 mb-1 text-[10px] text-amber-800 font-bold">
                  <History className="w-3 h-3" />
                  <span>تحديث: {project.lastUpdateDate}</span>
               </div>
               {project.lastUpdateNote && <p className="text-[10px] text-gray-600 leading-relaxed">{project.lastUpdateNote}</p>}
            </div>
         )}
         {project.notes && (
            <div className="flex items-start gap-1.5 text-[10px] text-gray-500 bg-gray-50 p-1.5 rounded border border-gray-100">
               <FileText className="w-3 h-3 mt-0.5 text-gray-400 shrink-0" />
               <p className="line-clamp-2">{project.notes}</p>
            </div>
         )}
      </div>
    </div>
  );
};

// 4. AI Advisor
const AIAdvisor = ({ projects }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const analyzeProjects = async () => {
    if (projects.length === 0) {
      setAnalysis("لا توجد مشاريع حالياً للتحليل.");
      return;
    }
    setLoading(true);
    setError(null);
    const prompt = `بصفتك مستشار مالي وهندسي، حلل المشاريع التالية باختصار: ${JSON.stringify(projects.map(p => ({
      name: p.name, 
      status: p.status, 
      price: p.price,
      collected: p.collectedAmount,
      execution: p.executionStatus
    })))}`;
    
    try {
      const response = await fetch(AI_MODEL_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      if (!response.ok) throw new Error('فشل الاتصال');
      const data = await response.json();
      setAnalysis(data.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (err) { setError("حدث خطأ."); } finally { setLoading(false); }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 shadow-sm border border-indigo-100 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-indigo-600" /> المستشار الذكي</h3>
        <button onClick={analyzeProjects} disabled={loading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-sm transition-colors disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />} تحليل
        </button>
      </div>
      {analysis && <div className="bg-white p-4 rounded-lg border border-indigo-100 text-gray-700 text-sm leading-relaxed">{analysis}</div>}
    </div>
  );
};

// 5. Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      fetched.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setProjects(fetched);
      setLoading(false);
    });
  }, [user]);

  const handleSave = async (data) => {
    if (!user) return;
    try {
      if (editingProject) {
        const docRef = getProjectDoc(editingProject.id);
        await updateDoc(docRef, { ...data });
      } else {
        const collectionRef = getProjectsCollection();
        await addDoc(collectionRef, { ...data, createdAt: serverTimestamp(), createdBy: user.uid });
      }
      setIsFormOpen(false);
      setEditingProject(null);
    } catch (err) { console.error(err); alert("حدث خطأ."); }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد؟')) return;
    try { await deleteDoc(getProjectDoc(id)); } catch (err) { console.error(err); }
  };

  const openEdit = (project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  // Filter Logic
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.designEngineer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.projectSource?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesTab = false;
    if (activeTab === 'all') {
      matchesTab = true;
    } 
    else if (['ongoing', 'stalled', 'financially_halted', 'under_study'].includes(activeTab)) {
      matchesTab = p.executionStatus === activeTab;
    }
    else if (activeTab === 'source_private') {
      matchesTab = p.projectSource === 'مشروع خاص';
    }
    else if (activeTab === 'source_etimad') {
      matchesTab = p.projectSource && p.projectSource.includes('اعتماد');
    }
    else if (activeTab === 'source_modon') {
      matchesTab = p.projectSource && p.projectSource.includes('مدن');
    }
    else if (activeTab === 'source_gov') {
      matchesTab = p.projectSource && (p.projectSource.includes('حكومية') || p.projectSource.includes('مناقصة'));
    }
    else if (activeTab === 'source_royal') {
      matchesTab = p.projectSource && p.projectSource.includes('الهيئات');
    }

    return matchesSearch && matchesTab;
  });

  const stats = {
    total: projects.length,
    totalValue: projects.reduce((acc, p) => {
      const isSigned = 
        p.submissionStage === 'تمت الترسية' || 
        (!p.submissionStage && ['جاري التصميم', 'جاري الإشراف', 'مكتمل'].includes(p.status));
      return isSigned ? acc + (Number(p.price) || 0) : acc;
    }, 0),
    totalCollected: projects.reduce((acc, curr) => acc + (Number(curr.collectedAmount) || 0), 0),
    stalledCount: projects.filter(p => p.executionStatus === 'stalled').length
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800" dir="rtl">
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start order-2 md:order-1">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900">إدارة المكتب الهندسي</h1>
                <p className="text-xs text-gray-500">منظومة متابعة المشاريع والتحصيل</p>
              </div>
            </div>
            <div className="order-1 md:order-2 mb-2 md:mb-0">
               <img src="download (1).jpg" alt="Logo" className="h-20 object-contain" onError={(e) => {e.target.style.display = 'none';}} />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end order-3">
               <div className="relative flex-1 md:flex-none md:w-64">
                <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
                <input type="text" placeholder="بحث..." className="w-full pl-4 pr-10 py-2 bg-gray-100 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
               </div>
               <button onClick={() => { setEditingProject(null); setIsFormOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 shadow-lg transition active:scale-95">
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">مشروع جديد</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">إجمالي العقود (الموقعة)</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.totalValue.toLocaleString()} <span className="text-xs font-normal">ر.س</span></h3>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">إجمالي المحصل</p>
              <h3 className="text-xl font-bold text-emerald-600">{stats.totalCollected.toLocaleString()} <span className="text-xs font-normal">ر.س</span></h3>
           </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">عدد المشاريع</p>
              <h3 className="text-xl font-bold text-blue-600">{stats.total}</h3>
           </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">مشاريع متعثرة</p>
              <h3 className="text-xl font-bold text-red-600">{stats.stalledCount}</h3>
           </div>
           <div className="md:col-span-4">
             <AIAdvisor projects={projects} />
           </div>
        </div>

        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
          {FILTERS.map(filter => {
            const Icon = filter.icon;
            return (
              <button key={filter.id} onClick={() => setActiveTab(filter.id)} className={`px-4 py-2 rounded-lg font-medium text-xs whitespace-nowrap transition-all border flex items-center gap-2 ${activeTab === filter.id ? 'bg-gray-800 text-white border-gray-800 shadow-lg' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                {Icon && <Icon className="w-3.5 h-3.5" />} {filter.label}
              </button>
            );
          })}
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onEdit={(p) => { setEditingProject(p); setIsFormOpen(true); }} 
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <Search className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">لا توجد نتائج</h3>
          </div>
        )}
      </main>

      {isFormOpen && <ProjectForm onClose={() => { setIsFormOpen(false); setEditingProject(null); }} initialData={editingProject} onSave={handleSave} />}
      
      <div className="fixed bottom-4 left-4 bg-white/90 backdrop-blur border border-gray-200 px-3 py-1.5 rounded-full text-[10px] text-gray-500 flex items-center gap-2 shadow-sm z-50">
        <div className={`w-2 h-2 rounded-full ${USE_CUSTOM_DB ? 'bg-green-500' : 'bg-amber-500'}`}></div>
        <span className="font-medium">{USE_CUSTOM_DB ? 'قاعدة بيانات خاصة' : 'وضع التجربة'}</span>
      </div>
    </div>
  );
}
