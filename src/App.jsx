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
  History
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

// 🔴 خطوة 1: لاستخدام قاعدة البيانات الخاصة بك، استبدل `null` بالكائن الخاص بك أدناه.
// يمكنك الحصول عليه من: Firebase Console > Project settings > General > Your apps

const YOUR_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDSvi9dNBsXIjgv3yE2TZzBslk8QgYuv50",
  authDomain: "cmdec-project.firebaseapp.com",
  projectId: "cmdec-project",
  storageBucket: "cmdec-project.firebasestorage.app",
  messagingSenderId: "624320915226",
  appId: "1:624320915226:web:0a317d1aa4e2c052006ea3"
};


// 🔴 خطوة 2: هذا الكود يختار تلقائياً بين إعداداتك أو إعدادات البيئة التجريبية
const envConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const firebaseConfig = YOUR_FIREBASE_CONFIG || envConfig;

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// تحديد المسارات تلقائياً
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const USE_CUSTOM_DB = !!YOUR_FIREBASE_CONFIG; // هل نستخدم قاعدة بيانات خاصة؟

// دالة مساعدة للحصول على مسار المجموعة الصحيح
const getProjectsCollection = () => {
  if (USE_CUSTOM_DB) {
    // مسار بسيط عند استخدام قاعدتك الخاصة
    return collection(db, 'projects');
  }
  // مسار البيئة التجريبية
  return collection(db, 'artifacts', appId, 'public', 'data', 'projects');
};

// دالة مساعدة للحصول على مسار المستند الصحيح
const getProjectDoc = (id) => {
  if (USE_CUSTOM_DB) {
    return doc(db, 'projects', id);
  }
  return doc(db, 'artifacts', appId, 'public', 'data', 'projects', id);
};

// ==========================================================================

// --- AI Configuration ---
const apiKey = "AIzaSyDRVla9f593dBhdLLSZhhv1v7V7DeejUuE"; // Injected by environment
const AI_MODEL_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

// --- Constants ---
const FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'current', label: 'مشاريع قائمة', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'bidding', label: 'تحت التسعير والدراسة', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'government', label: 'منافسات حكومية', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'new', label: 'مشاريع جديدة', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
];

const STATUS_OPTIONS = [
  'جديد', 'جاري التصميم', 'جاري الإشراف', 'بانتظار الموافقة', 'مكتمل', 'تم التقديم', 'تحت المراجعة'
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

const PROJECT_SOURCES = [
  'مشروع خاص', 
  'مشروع من منصة اعتماد', 
  'مشروع من منصة مدن', 
  'مشروع مناقصة حكومية', 
  'مشاريع الهيئات الملكية'
];

const SERVICE_TYPES = [
  { id: 'design', label: 'تصميم', icon: Ruler },
  { id: 'supervision', label: 'إشراف', icon: HardHat },
  { id: 'design_supervision', label: 'تصميم وإشراف', icon: Activity },
  { id: 'municipal', label: 'خدمات بلدية وتصاريح', icon: FileText },
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

// 1. AI Advisor Component
const AIAdvisor = ({ projects }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const analyzeProjects = async () => {
    if (projects.length === 0) {
      setAnalysis("لا توجد مشاريع حالياً للتحليل. أضف بعض المشاريع أولاً.");
      return;
    }

    setLoading(true);
    setError(null);

    const prompt = `
      بصفتك مستشار تخطيط استراتيجي لمكتب استشاري هندسي، قم بتحليل البيانات التالية للمشاريع.
      
      قدم تقريراً مهنياً مختصراً باللغة العربية:
      1. **توزيع الخدمات:** نسبة مشاريع التصميم vs الإشراف.
      2. **تحليل المصادر:** التركيز على الجهات (اعتماد، خاص، إلخ).
      3. **آخر التحديثات:** نظرة على المشاريع التي تم تحديث حالتها مؤخراً وهل هناك تأخير في الردود؟
      4. **توصيات:** نصائح للتركيز عليها الفترة القادمة.

      بيانات المشاريع:
      ${JSON.stringify(projects.map(p => ({
        name: p.name,
        serviceType: p.serviceType,
        projectSource: p.projectSource,
        submissionStage: p.submissionStage,
        lastUpdateDate: p.lastUpdateDate,
        lastUpdateNote: p.lastUpdateNote,
        status: p.status
      })))}
    `;

    try {
      const response = await fetch(AI_MODEL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) throw new Error('فشل الاتصال');

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setAnalysis(text);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء التحليل.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 shadow-sm border border-indigo-100 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-indigo-600" />
          المستشار الذكي للمكتب الهندسي
        </h3>
        <button 
          onClick={analyzeProjects}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-sm transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
          {analysis ? 'تحديث التحليل' : 'تحليل محفظة المشاريع'}
        </button>
      </div>

      {error && <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>}

      {analysis && (
        <div className="bg-white p-4 rounded-lg border border-indigo-100 text-gray-700 text-sm leading-relaxed whitespace-pre-line animate-in fade-in duration-500">
          {analysis}
        </div>
      )}
    </div>
  );
};

// 2. Project Form Modal
const ProjectForm = ({ onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    serviceType: 'design',
    price: '',
    status: 'جديد',
    location: '',
    projectSource: '',
    submissionStage: '',
    followUpEngineer: '',
    designEngineer: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    notes: '',
    lastUpdateDate: new Date().toISOString().split('T')[0], // Default to today
    lastUpdateNote: '' // Note for the update
  });

  useEffect(() => {
    if (initialData) setFormData({
      ...formData,
      ...initialData,
      lastUpdateDate: initialData.lastUpdateDate || new Date().toISOString().split('T')[0],
      lastUpdateNote: initialData.lastUpdateNote || ''
    });
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center sticky top-0">
          <h2 className="font-bold text-lg text-gray-800">
            {initialData ? 'تعديل بيانات المشروع' : 'إضافة مشروع هندسي جديد'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المشروع</label>
            <input 
              required
              type="text" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="مثال: تصميم فيلا سكنية..."
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">جهة المشروع</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.projectSource}
                onChange={e => setFormData({...formData, projectSource: e.target.value})}
              >
                <option value="">اختر الجهة...</option>
                {PROJECT_SOURCES.map(src => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مرحلة التقديم</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.submissionStage}
                onChange={e => setFormData({...formData, submissionStage: e.target.value})}
              >
                <option value="">اختر المرحلة...</option>
                {SUBMISSION_STAGES.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Update Status Section */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 space-y-3">
            <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
              <History className="w-4 h-4" />
              آخر تحديث للمشروع
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">تاريخ التحديث</label>
                <input 
                  type="date"
                  className="w-full p-2 border border-amber-200 rounded-md text-sm focus:border-amber-500 outline-none bg-white"
                  value={formData.lastUpdateDate}
                  onChange={e => setFormData({...formData, lastUpdateDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">ملاحظات التحديث الأخير</label>
                <textarea 
                  className="w-full p-2 border border-amber-200 rounded-md text-sm focus:border-amber-500 outline-none h-16 resize-none bg-white"
                  placeholder="مثال: تم التواصل مع العميل وطلب مهلة للتفكير..."
                  value={formData.lastUpdateNote}
                  onChange={e => setFormData({...formData, lastUpdateNote: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع الخدمة</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.serviceType}
                onChange={e => setFormData({...formData, serviceType: e.target.value})}
              >
                {SERVICE_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              >
                <option value="">اختر الموقع...</option>
                {SAUDI_LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">القيمة (ر.س)</label>
              <input 
                type="number" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0.00"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحالة العامة</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Engineers */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3 border border-blue-100">
            <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
              <UserCog className="w-4 h-4" />
              فريق العمل
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">مهندس المتابعة</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-blue-200 rounded-md text-sm focus:border-blue-500 outline-none"
                  value={formData.followUpEngineer}
                  onChange={e => setFormData({...formData, followUpEngineer: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">مهندس التصميم/الإدارة</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-blue-200 rounded-md text-sm focus:border-blue-500 outline-none"
                  value={formData.designEngineer}
                  onChange={e => setFormData({...formData, designEngineer: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Owner Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4" />
              بيانات العميل
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                placeholder="الاسم"
                value={formData.ownerName}
                onChange={e => setFormData({...formData, ownerName: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="الجوال"
                  value={formData.ownerPhone}
                  onChange={e => setFormData({...formData, ownerPhone: e.target.value})}
                />
                <input 
                  type="email" 
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="الايميل"
                  value={formData.ownerEmail}
                  onChange={e => setFormData({...formData, ownerEmail: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات عامة</label>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
              placeholder="ملاحظات إضافية..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            ></textarea>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-200 transition transform active:scale-[0.98]"
          >
            حفظ التغييرات
          </button>
        </form>
      </div>
    </div>
  );
};

// 3. Project Card
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

  const isNewOrBidding = ['جديد', 'بانتظار الموافقة', 'تم التقديم', 'تحت المراجعة'].includes(project.status) || project.submissionStage;
  const activeEngineer = (isNewOrBidding && project.followUpEngineer) ? project.followUpEngineer : project.designEngineer;
  const engineerLabel = (isNewOrBidding && project.followUpEngineer) ? 'متابعة:' : 'تصميم/إشراف:';

  const getStageColor = (stage) => {
    if (stage === 'تمت الترسية') return 'text-green-700 bg-green-50 border-green-100';
    if (stage === 'لم تتم الترسية') return 'text-red-700 bg-red-50 border-red-100';
    return 'text-amber-700 bg-amber-50 border-amber-100';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 group relative flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            project.status === 'مكتمل' ? 'bg-green-100 text-green-800' :
            project.submissionStage ? 'bg-amber-100 text-amber-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {project.status}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(project)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(project.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tags Row */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
          <ServiceIcon className="w-3 h-3" />
          {serviceTypeInfo.label}
        </span>
        {project.location && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
            <MapPin className="w-3 h-3" />
            {project.location}
          </span>
        )}
         {project.projectSource && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100">
            <Landmark className="w-3 h-3" />
            {project.projectSource === 'مشروع مناقصة حكومية' ? 'حكومي' : 
             project.projectSource === 'مشروع من منصة اعتماد' ? 'اعتماد' : 
             project.projectSource === 'مشروع خاص' ? 'خاص' : project.projectSource}
          </span>
        )}
      </div>

      {/* Title & Price */}
      <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2 leading-tight" title={project.name}>{project.name}</h3>
      {project.price && (
        <div className="flex items-center gap-1 text-gray-600 mb-2 font-medium text-sm mt-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          {Number(project.price).toLocaleString()} ر.س
        </div>
      )}

      {/* Submission Stage */}
      {project.submissionStage && (
        <div className={`mb-3 flex items-start gap-2 text-xs px-3 py-2 rounded-lg border ${getStageColor(project.submissionStage)}`}>
          <Gavel className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{project.submissionStage}</span>
        </div>
      )}

      {/* Last Update Section */}
      {(project.lastUpdateDate || project.lastUpdateNote) && (
        <div className="mb-3 bg-amber-50/50 border border-amber-100 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1 text-xs text-amber-800 font-semibold">
            <History className="w-3 h-3" />
            <span>آخر تحديث: {project.lastUpdateDate}</span>
          </div>
          {project.lastUpdateNote && (
            <p className="text-xs text-gray-600 leading-relaxed">{project.lastUpdateNote}</p>
          )}
        </div>
      )}

      {/* Active Engineer */}
      {activeEngineer && (
        <div className="mb-3 flex items-center gap-2 text-sm bg-blue-50 text-blue-800 px-3 py-2 rounded-lg border border-blue-100">
          <UserCog className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs text-blue-500 font-normal ml-1">{engineerLabel}</span>
          <span className="font-semibold truncate">{activeEngineer}</span>
        </div>
      )}

      {/* Contact Details & General Notes */}
      <div className="mt-auto pt-4 border-t border-gray-50 space-y-2">
        {(project.ownerName || project.ownerPhone || project.ownerEmail) ? (
          <div className="bg-gray-50 p-2.5 rounded-lg space-y-1.5">
            {project.ownerName && (
              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span className="truncate">{project.ownerName}</span>
              </div>
            )}
            
            {project.ownerPhone && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-mono">{project.ownerPhone}</span>
                <button 
                  onClick={() => copyToClipboard(project.ownerPhone)} 
                  className="text-blue-500 hover:text-blue-700 ml-auto"
                  title="نسخ"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            )}

            {project.ownerEmail && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span className="truncate font-mono" title={project.ownerEmail}>{project.ownerEmail}</span>
              </div>
            )}
          </div>
        ) : null}

        {/* General Notes Display */}
        {project.notes && (
          <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50/50 p-2 rounded">
            <FileText className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0" />
            <p className="line-clamp-2">{project.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Auth & Data Fetching ---
  useEffect(() => {
    const initAuth = async () => {
      if (USE_CUSTOM_DB) {
        await signInAnonymously(auth);
      } else {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      }
    };
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    // استخدام الدالة المساعدة لجلب المسار الصحيح
    const projectsRef = getProjectsCollection();
    
    const unsubscribeDocs = onSnapshot(projectsRef, 
      (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetched.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setProjects(fetched);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribeDocs();
  }, [user]);

  // --- Actions ---
  const handleSave = async (data) => {
    if (!user) return;
    
    try {
      if (editingProject) {
        // استخدام الدالة المساعدة للمسار
        const docRef = getProjectDoc(editingProject.id);
        await updateDoc(docRef, { ...data });
      } else {
        // استخدام الدالة المساعدة للمجموعة
        const collectionRef = getProjectsCollection();
        await addDoc(collectionRef, {
          ...data,
          createdAt: serverTimestamp(),
          createdBy: user.uid
        });
      }
      setIsFormOpen(false);
      setEditingProject(null);
    } catch (err) {
      console.error("Error saving:", err);
      alert("حدث خطأ أثناء الحفظ. تأكد من صلاحيات قاعدة البيانات.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;
    try {
      const docRef = getProjectDoc(id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Error deleting:", err);
      alert("حدث خطأ أثناء الحذف.");
    }
  };

  const openEdit = (project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  // --- Dynamic Filter Logic ---
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.designEngineer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.projectSource?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesTab = false;
    if (activeTab === 'all') {
      matchesTab = true;
    } else if (activeTab === 'government') {
      matchesTab = p.projectSource && (
        p.projectSource.includes('حكومي') || 
        p.projectSource.includes('اعتماد') || 
        p.projectSource.includes('مدن') ||
        p.projectSource.includes('الهيئات')
      );
    } else if (activeTab === 'bidding') {
      matchesTab = (p.submissionStage && p.submissionStage !== '') || 
                   ['تم التقديم', 'تحت المراجعة', 'بانتظار الموافقة'].includes(p.status);
    } else if (activeTab === 'current') {
      matchesTab = ['جاري التصميم', 'جاري الإشراف', 'مكتمل'].includes(p.status);
    } else if (activeTab === 'new') {
      matchesTab = p.status === 'جديد';
    }

    return matchesSearch && matchesTab;
  });

  const stats = {
    total: projects.length,
    totalValue: projects.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0),
    designCount: projects.filter(p => p.serviceType === 'design').length,
    supervisionCount: projects.filter(p => p.serviceType === 'supervision').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">جاري تحميل المشاريع - مرحبا بك في CMDEC...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800" dir="rtl">
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900">لوحة تحكم المشاريع</h1>
                <p className="text-xs text-gray-500">منظومة متابعة التصاميم والإشراف</p>
              </div>
            </div>
                        {/* Center: Logo (Order 1 on mobile to be on top, 2 on desktop to be in middle) */}
            <div className="order-1 md:order-2 mb-2 md:mb-0">
               {/* ملاحظة: تأكد من وضع ملف الصورة 'download (1).jpg' في المجلد العام public folder */}
               <img 
                 src="download (1).jpg" 
                 alt="CMDEC Logo" 
                 className="h-20 object-contain" 
                 onError={(e) => {
                   e.target.style.display = 'none';
                 }}
               />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:flex-none md:w-64">
                <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="بحث برقم، اسم، مدينة أو مهندس..." 
                  className="w-full pl-4 pr-10 py-2 bg-gray-100 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
               </div>
               <button 
                onClick={() => { setEditingProject(null); setIsFormOpen(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 shadow-lg shadow-blue-200 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">مشروع جديد</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي قيمة العقود (المقدرة)</p>
              <h2 className="text-3xl font-bold text-gray-900">{stats.totalValue.toLocaleString()} <span className="text-sm font-normal text-gray-400">ر.س</span></h2>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md">
                    <Activity className="w-3 h-3" />
                    <span>{stats.total} مشاريع</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
                    <Ruler className="w-3 h-3" />
                    <span>{stats.designCount} تصميم</span>
                </div>
                 <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                    <HardHat className="w-3 h-3" />
                    <span>{stats.supervisionCount} إشراف</span>
                </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <AIAdvisor projects={projects} />
          </div>
        </div>

        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
          {FILTERS.map(filter => {
            const Icon = filter.icon;
            const isActive = activeTab === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveTab(filter.id)}
                className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all border flex items-center gap-2 ${
                  isActive
                  ? filter.id === 'all' 
                    ? 'bg-gray-800 text-white border-gray-800 shadow-lg'
                    : `bg-white ${filter.color} border-current shadow-md ring-1 ring-current` 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {filter.label}
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
                onEdit={openEdit} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ruler className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد مشاريع لعرضها</h3>
            <p className="text-gray-500 text-sm mb-6">لم يتم العثور على مشاريع تطابق التصنيف المختار.</p>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="text-blue-600 font-medium hover:underline"
            >
              أضف مشروعاً هندسياً جديداً
            </button>
          </div>
        )}
      </main>

      {isFormOpen && (
        <ProjectForm 
          onClose={() => { setIsFormOpen(false); setEditingProject(null); }}
          initialData={editingProject}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
