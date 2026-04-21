'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { getStoredOrgId } from '@/lib/auth';
import {
  ChevronLeft,
  Loader2,
  Save,
  Plus,
  Trash2,
  Stethoscope,
  Heart,
  Calendar,
  Palette,
  Badge,
  FlaskConical,
  Headphones,
  Shield,
  Clock,
  User,
  XCircle,
  AlertTriangle,
  Settings,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const AVAILABLE_ICONS = [
  { id: 'stethoscope', icon: Stethoscope, label: 'Médico' },
  { id: 'heart', icon: Heart, label: 'Enfermería' },
  { id: 'calendar', icon: Calendar, label: 'Recepción' },
  { id: 'palette', icon: Palette, label: 'Administrativo' },
  { id: 'badge', icon: Badge, label: 'Badge' },
  { id: 'vaccines', icon: FlaskConical, label: 'Vacunas' },
  { id: 'support', icon: Headphones, label: 'Soporte' },
  { id: 'person', icon: User, label: 'Usuario' },
];

const PERMISSION_MODULES = [
  { key: 'appointments', label: 'Agenda', labelEn: 'Appointments' },
  { key: 'patients', label: 'Pacientes', labelEn: 'Patients' },
  { key: 'clinical_history', label: 'Expedientes', labelEn: 'Clinical History' },
  { key: 'inventory', label: 'Inventario', labelEn: 'Inventory' },
  { key: 'billing', label: 'Facturación', labelEn: 'Billing' },
  { key: 'users', label: 'Usuarios', labelEn: 'Users' },
  { key: 'settings', label: 'Configuración', labelEn: 'Settings' },
];

interface UserTypeConfig {
  type: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  dashboard: string;
  permissions: string[];
  canHaveSpecialties: boolean;
}

const emptyFormData: UserTypeConfig = {
  type: '',
  name: '',
  nameEn: '',
  description: '',
  descriptionEn: '',
  icon: 'stethoscope',
  dashboard: '/dashboard',
  permissions: [],
  canHaveSpecialties: false,
};

export default function UserTypesPage() {
  const { lang, t } = useI18n();
  const params = useParams();
  const slug = (params?.slug as string) || '';
  
  const orgId = getStoredOrgId() || '';

  const [userTypes, setUserTypes] = useState<Record<string, UserTypeConfig>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState<UserTypeConfig>(emptyFormData);

  const loadUserTypes = useCallback(async () => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/team/user-types`, {
        credentials: 'include',
      });

      if (!res.ok) {
        setMessage({ type: 'error', text: t('userTypes.errorLoading') });
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      setUserTypes(data || {});
      
      const keys = Object.keys(data || {});
      if (keys.length > 0) {
        setSelectedKey(keys[0]);
        setFormData(data[keys[0]]);
      } else {
        setSelectedKey(null);
        setFormData(emptyFormData);
      }
    } catch (error) {
      console.error('[UserTypes] Load failed:', error);
      setMessage({ type: 'error', text: t('userTypes.errorLoading') });
    } finally {
      setIsLoading(false);
    }
  }, [orgId, t]);

  useEffect(() => {
    loadUserTypes();
  }, [loadUserTypes]);

  const handleSave = async () => {
    if (!formData.type || !formData.name) {
      setMessage({ type: 'error', text: t('userTypes.nameRequired') });
      return;
    }

    const typeKey = formData.type.toLowerCase().replace(/\s+/g, '-');
    
    setIsSaving(true);
    setMessage(null);

    try {
      const newCustom = { ...userTypes, [typeKey]: formData };
      
      const res = await fetch(`${API_URL}/team/user-types`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newCustom),
      });

      if (!res.ok) {
        setMessage({ type: 'error', text: t('userTypes.errorSaving') });
        setIsSaving(false);
        return;
      }

      setUserTypes(newCustom);
      setSelectedKey(typeKey);
      setIsCreating(false);
      setMessage({ type: 'success', text: t('userTypes.changesSaved') });
    } catch (error) {
      console.error('[UserTypes] Save failed:', error);
      setMessage({ type: 'error', text: t('userTypes.errorSaving') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (typeKey: string) => {
    if (deleteConfirm !== typeKey) {
      setDeleteConfirm(typeKey);
      return;
    }

    const newCustom = { ...userTypes };
    delete newCustom[typeKey];

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/team/user-types`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newCustom),
      });

      if (!res.ok) {
        setMessage({ type: 'error', text: t('userTypes.errorSaving') });
        setIsLoading(false);
        return;
      }

      setUserTypes(newCustom);
      setDeleteConfirm(null);
      
      const remainingKeys = Object.keys(newCustom);
      if (remainingKeys.length > 0) {
        setSelectedKey(remainingKeys[0]);
        setFormData(newCustom[remainingKeys[0]]);
      } else {
        setSelectedKey(null);
        setFormData(emptyFormData);
      }
      
      setMessage({ type: 'success', text: t('userTypes.changesSaved') });
    } catch (error) {
      console.error('[UserTypes] Delete failed:', error);
      setMessage({ type: 'error', text: t('userTypes.errorSaving') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (key: string) => {
    setSelectedKey(key);
    setFormData(userTypes[key]);
    setIsCreating(false);
    setDeleteConfirm(null);
  };

  const handleNew = () => {
    setIsCreating(true);
    setSelectedKey(null);
    setFormData(emptyFormData);
    setDeleteConfirm(null);
  };

  const togglePermission = (permission: string) => {
    const current = formData.permissions || [];
    const newPermissions = current.includes(permission)
      ? current.filter((p) => p !== permission)
      : [...current, permission];
    setFormData({ ...formData, permissions: newPermissions });
  };

  const getIconComponent = (iconId: string) => {
    const found = AVAILABLE_ICONS.find((i) => i.id === iconId);
    return found?.icon || Stethoscope;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasTypes = Object.keys(userTypes).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Link
            href={`/${slug}/profile`}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {t('userTypes.title')}
            </h1>
            <p className="text-on-surface-variant">
              {t('userTypes.subtitle')}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNew}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-semibold shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          {t('userTypes.newType')}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl font-medium flex items-center gap-2 ${
              message.type === 'error' 
                ? 'bg-error-container text-error' 
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {message.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : null}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    {t('userTypes.systemRole')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">
                    {t('userTypes.members')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">
                    {t('userTypes.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {Object.entries(userTypes).map(([key, config]) => {
                  const IconComponent = getIconComponent(config.icon);
                  return (
                    <tr
                      key={key}
                      className={`hover:bg-surface-container transition-colors cursor-pointer ${
                        selectedKey === key ? 'bg-surface-container' : ''
                      }`}
                      onClick={() => handleSelect(key)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-on-primary-fixed-variant" />
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">
                              {lang === 'es' ? config.nameEs || config.name : config.nameEn || config.name}
                            </p>
                            <p className="text-xs text-on-surface-variant">
                              {lang === 'es' ? config.descriptionEs || config.description : config.descriptionEn || config.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                          {t('userTypes.custom')}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(key);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            deleteConfirm === key
                              ? 'bg-error text-white hover:bg-error/80'
                              : 'text-error hover:bg-error-container'
                          }`}
                        >
                          {deleteConfirm === key ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container p-6 rounded-xl relative overflow-hidden group">
              <Shield className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-primary mb-2">
                {t('userTypes.permissionInheritance')}
              </h4>
              <p className="text-sm text-on-surface-variant">
                {t('userTypes.permissionInheritanceDesc')}
              </p>
            </div>
            <div className="bg-surface-container p-6 rounded-xl relative overflow-hidden group">
              <Clock className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-primary mb-2">
                {t('userTypes.auditTrail')}
              </h4>
              <p className="text-sm text-on-surface-variant">
                {t('userTypes.auditTrailDesc')}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-surface-container-lowest rounded-2xl p-8 border-l-4 border-primary shadow-sm sticky top-8">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-on-surface mb-1">
                {isCreating
                  ? t('userTypes.newType')
                  : selectedKey
                    ? t('userTypes.roleDetails')
                    : t('userTypes.newType')}
              </h2>
              <p className="text-sm text-on-surface-variant">
                {isCreating || !selectedKey
                  ? t('userTypes.subtitle')
                  : t('userTypes.roleDetails')}
              </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    {t('userTypes.nameEs')}
                  </label>
                  <input
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-surface font-medium"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('userTypes.placeholderEs')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    {t('userTypes.nameEn')}
                  </label>
                  <input
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-surface font-medium"
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder={t('userTypes.placeholderEn')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    {t('userTypes.uniqueKey')}
                  </label>
                  <input
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-surface font-medium"
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder={t('userTypes.uniqueKeyPlaceholder')}
                    disabled={!isCreating && !!selectedKey}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    {t('userTypes.icon')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_ICONS.map((iconOption) => {
                      const IconComp = iconOption.icon;
                      return (
                        <button
                          key={iconOption.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: iconOption.id })}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                            formData.icon === iconOption.id
                              ? 'bg-primary text-white'
                              : 'bg-surface-container-low hover:bg-surface-container'
                          }`}
                        >
                          <IconComp className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  {t('userTypes.description')}
                </label>
                <textarea
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-surface text-sm"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('userTypes.descriptionPlaceholder')}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="canHaveSpecialties"
                  checked={formData.canHaveSpecialties}
                  onChange={(e) => setFormData({ ...formData, canHaveSpecialties: e.target.checked })}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/20"
                />
                <label htmlFor="canHaveSpecialties" className="text-sm text-on-surface">
                  {t('userTypes.canHaveSpecialties')}
                </label>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {t('userTypes.permissionMatrix')}
                </h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 px-2 py-1 text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant/60">
                    <div className="col-span-1">{t('userTypes.module')}</div>
                    <div className="text-center">{t('userTypes.read')}</div>
                    <div className="text-center">{t('userTypes.write')}</div>
                    <div className="text-center">{t('userTypes.delete')}</div>
                  </div>
                  {PERMISSION_MODULES.map((module) => (
                    <div
                      key={module.key}
                      className="grid grid-cols-4 items-center bg-surface-container-low rounded-lg p-2"
                    >
                      <div className="text-xs font-bold text-on-surface pl-2">
                        {lang === 'es' ? module.labelEs || module.label : module.labelEn || module.label}
                      </div>
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(`${module.key}:read`)}
                          onChange={() => togglePermission(`${module.key}:read`)}
                          className="w-4 h-4 rounded bg-surface-container-high text-primary focus:ring-0"
                        />
                      </div>
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(`${module.key}:write`)}
                          onChange={() => togglePermission(`${module.key}:write`)}
                          className="w-4 h-4 rounded bg-surface-container-high text-primary focus:ring-0"
                        />
                      </div>
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(`${module.key}:delete`)}
                          onChange={() => togglePermission(`${module.key}:delete`)}
                          className="w-4 h-4 rounded bg-surface-container-high text-primary focus:ring-0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {t('userTypes.save')}
                </button>
                {(isCreating || !selectedKey) && hasTypes && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      if (selectedKey) {
                        setFormData(userTypes[selectedKey]);
                      }
                    }}
                    className="px-6 py-3 border border-outline-variant text-on-surface-variant rounded-xl font-bold text-sm hover:bg-surface-container transition-all"
                  >
                    {t('userTypes.cancel')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}