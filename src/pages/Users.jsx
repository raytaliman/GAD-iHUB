import { useState, useEffect } from 'react';
import { UserPlus, X, Pencil, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { addLog } from '../lib/systemLogs';

/**
 * Modal component that asks for confirmation before saving changes to a user profile.
 * Displays a list of specific fields that have been changed.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Visibility flag.
 * @param {Object} props.user - The original user data.
 * @param {Object} props.editData - The modified user data.
 * @param {Function} props.onConfirm - Callback to persist changes.
 * @param {Function} props.onCancel - Callback to close the modal.
 */
function ConfirmEditModal({ isOpen, user, editData, onConfirm, onCancel }) {
  if (!isOpen || !user) return null;

  const hasChanges = () => {
    if (!user) return false;
    return (
      editData.username !== user.username ||
      editData.email !== user.email ||
      editData.user_level !== user.user_level ||
      editData.is_active !== user.is_active
    );
  };

  const getChanges = () => {
    const changes = [];
    if (editData.username !== user.username) {
      changes.push(`Username: "${user.username}" → "${editData.username}"`);
    }
    if (editData.email !== user.email) {
      changes.push(`Email: "${user.email}" → "${editData.email}"`);
    }
    if (editData.user_level !== user.user_level) {
      changes.push(`User Level: "${user.user_level}" → "${editData.user_level}"`);
    }
    if (editData.is_active !== user.is_active) {
      changes.push(`Status: "${user.is_active ? 'Active' : 'Inactive'}" → "${editData.is_active ? 'Active' : 'Inactive'}"`);
    }
    return changes;
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label="Confirm edit"
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="font-semibold text-slate-800 text-lg">Confirm Changes</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-700 p-1 rounded transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mb-6">
          <p className="text-slate-600 mb-3">
            Are you sure you want to save the following changes for user{' '}
            <span className="font-semibold text-slate-800">{user.username}</span>?
          </p>
          {hasChanges() && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <ul className="text-sm text-slate-700 space-y-1.5">
                {getChanges().map((change, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-white transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#7030a0' }}
          >
            <Save size={16} />
            Confirm Save
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal component that displays detailed user information and provides inline editing capabilities.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Visibility flag.
 * @param {Object} props.user - The user object to view/edit.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {Function} props.onEdit - Callback to persist edits.
 * @param {boolean} props.saving - API loading state for the save button.
 */
function ViewDetailsModal({ isOpen, user, onClose, onStatusChange, onEdit, saving }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmEdit, setShowConfirmEdit] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    email: '',
    user_level: 'assistant',
    is_active: true,
  });

  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username || '',
        email: user.email || '',
        user_level: user.user_level || 'assistant',
        is_active: user.is_active !== undefined ? user.is_active : true,
      });
      setIsEditing(false);
      setShowConfirmEdit(false);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = () => {
    setShowConfirmEdit(true);
  };

  const handleConfirmSave = () => {
    setShowConfirmEdit(false);
    if (onEdit) {
      onEdit(user.id, editData);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowConfirmEdit(false);
    setEditData({
      username: user.username || '',
      email: user.email || '',
      user_level: user.user_level || 'assistant',
      is_active: user.is_active !== undefined ? user.is_active : true,
    });
  };

  const rowClass = 'flex justify-between items-start gap-4 py-3 border-b border-slate-100 last:border-0';
  const labelClass = 'text-xs font-medium text-slate-500 uppercase tracking-wide shrink-0 w-28';
  const valueClass = 'text-sm text-slate-800 text-right break-all';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="View user details"
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900 text-lg">{isEditing ? 'Edit User' : 'User Details'}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-0 divide-y divide-slate-100">
          <div className={rowClass}>
            <span className={labelClass}>User ID</span>
            <span className="font-mono text-xs text-slate-500 text-right break-all">{user.id}</span>
          </div>
          <div className={rowClass}>
            <span className={labelClass}>User Name</span>
            {isEditing ? (
              <input
                type="text"
                value={editData.username}
                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                className="flex-1 max-w-[200px] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Username"
                required
              />
            ) : (
              <span className={valueClass}>{user.username || '–'}</span>
            )}
          </div>
          <div className={rowClass}>
            <span className={labelClass}>Email</span>
            {isEditing ? (
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="flex-1 max-w-[200px] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Email"
                required
              />
            ) : (
              <span className={valueClass}>{user.email || '–'}</span>
            )}
          </div>
          <div className={rowClass}>
            <span className={labelClass}>Date Created</span>
            <span className={valueClass}>
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : '–'}
            </span>
          </div>
          <div className={rowClass}>
            <span className={labelClass}>User Level</span>
            {isEditing ? (
              <select
                value={editData.user_level}
                onChange={(e) => setEditData({ ...editData, user_level: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="assistant">Assistant</option>
                <option value="admin">Admin</option>
              </select>
            ) : (
              <span className={valueClass + ' capitalize'}>{user.user_level || 'assistant'}</span>
            )}
          </div>
          <div className={rowClass}>
            <span className={labelClass}>Status</span>
            {isEditing ? (
              <select
                value={editData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setEditData({ ...editData, is_active: e.target.value === 'active' })}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            ) : (
              <span
                className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${
                  user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 flex justify-end gap-2 border-t border-slate-100">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !editData.username || !editData.email}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: '#7030a0' }}
              >
                <Save size={14} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2 hover:opacity-90"
                style={{ backgroundColor: '#7030a0' }}
              >
                <Pencil size={14} />
                Edit
              </button>
            </>
          )}
        </div>
      </div>
      <ConfirmEditModal
        isOpen={showConfirmEdit}
        user={user}
        editData={editData}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirmEdit(false)}
      />
    </div>
  );
}

/**
 * Modal component for creating a new user.
 * Performs validation on password strength and confirmation before allowing submission.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Visibility flag.
 * @param {Function} props.onClose - Callback to close the modal and reset state.
 * @param {Function} props.onSubmit - Callback to create the user in the backend.
 * @param {boolean} props.saving - API loading state.
 */
function AddUserModal({ isOpen, onClose, onSubmit, saving }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    user_level: 'assistant',
    is_active: true,
  });
  const [passwordErrors, setPasswordErrors] = useState([]);

  /**
   * Checks password against complexity requirements:
   * 8+ chars, lowercase, uppercase, and a number.
   * @private
   */
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    return errors;
  };

  const handlePasswordChange = (password) => {
    setFormData({ ...formData, password });
    if (password) {
      const errors = validatePassword(password);
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  };

  const handleConfirmPasswordChange = (confirmPassword) => {
    setFormData({ ...formData, confirmPassword });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validatePassword(formData.password);
    
    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
      setPasswordErrors(errors);
      return;
    }

    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }

    if (formData.username && formData.email && formData.password) {
      onSubmit(formData);
      setFormData({ username: '', email: '', password: '', confirmPassword: '', user_level: 'assistant', is_active: true });
      setPasswordErrors([]);
    }
  };

  const handleClose = () => {
    setFormData({ username: '', email: '', password: '', confirmPassword: '', user_level: 'assistant', is_active: true });
    setPasswordErrors([]);
    onClose();
  };

  const isPasswordValid = formData.password && 
    formData.confirmPassword &&
    passwordErrors.length === 0 && 
    formData.password === formData.confirmPassword &&
    formData.password.length >= 8 &&
    /[a-z]/.test(formData.password) &&
    /[A-Z]/.test(formData.password) &&
    /[0-9]/.test(formData.password);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Add user"
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="font-semibold text-slate-800 text-lg">Add User</h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-700 p-1 rounded transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">User Name</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Enter email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className={`w-full border rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                formData.password && passwordErrors.length > 0
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-slate-300'
              }`}
              placeholder="Enter password (min 8 chars, mixed case, number)"
              required
            />
            {formData.password && passwordErrors.length > 0 && (
              <ul className="mt-1.5 text-xs text-red-600 space-y-0.5">
                {passwordErrors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            )}
            {formData.password && passwordErrors.length === 0 && formData.password.length >= 8 && (
              <p className="mt-1.5 text-xs text-emerald-600">✓ Password meets all requirements</p>
            )}
            {!formData.password && (
              <p className="mt-1.5 text-xs text-slate-500">
                Password must be at least 8 characters with uppercase, lowercase, and a number
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              className={`w-full border rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-slate-300'
              }`}
              placeholder="Confirm password"
              required
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-600">• Passwords do not match</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">User Level</label>
            <select
              value={formData.user_level}
              onChange={(e) => setFormData({ ...formData, user_level: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="assistant">Assistant</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={formData.is_active ? 'active' : 'inactive'}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.username || !formData.email || !isPasswordValid}
              className="px-4 py-2 rounded-xl text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#7030a0' }}
            >
              {saving ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Modal component for confirming the toggling of a user's active status.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Visibility flag.
 * @param {Object} props.user - The user being updated.
 * @param {boolean} props.newStatus - The target status (true = active).
 * @param {Function} props.onConfirm - Callback to persist status.
 * @param {Function} props.onCancel - Callback to close the modal.
 */
function ConfirmStatusModal({ isOpen, user, newStatus, onConfirm, onCancel }) {
  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label="Confirm status change"
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="font-semibold text-slate-800 text-lg">
            {newStatus ? 'Activate User' : 'Deactivate User'}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-700 p-1 rounded transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-slate-600 mb-6">
          Are you sure you want to {newStatus ? 'activate' : 'deactivate'} the user{' '}
          <span className="font-semibold text-slate-800">{user.username}</span>?
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-white transition-colors ${
              newStatus
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {newStatus ? 'Activate' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Page component that manages the dashboard's administrative users.
 * Allows admins to view, create, edit, and toggle the status of other users.
 * Automatically polls for updates every 10 seconds.
 */
export default function Users() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [statusChangeModal, setStatusChangeModal] = useState(null);
  const [viewDetailsModal, setViewDetailsModal] = useState(null);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [saving, setSaving] = useState(false);

  /**
   * Loads the current list of users from the 'users' table.
   */
  useEffect(() => {
    loadUsers(false);
  }, []);

  /**
   * Real-time polling to ensure user list is up-to-date.
   */
  useEffect(() => {
    const id = setInterval(() => loadUsers(true), 10000);
    return () => clearInterval(id);
  }, []);

  /**
   * Fetches data from Supabase.
   * @param {boolean} [silent=false] - If true, hides the loading spinner.
   */
  const loadUsers = async (silent = false) => {
    if (!supabase) {
      setError('Supabase is not configured');
      setLoading(false);
      return;
    }

    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      // Fetch users from auth.users table (requires admin access)
      // For now, we'll use a placeholder approach
      // In production, you'd need to create a users table or use Supabase Admin API
      const { data, error: err } = await supabase
        .from('users')
        .select('id, username, email, created_at, is_active, user_level')
        .order('created_at', { ascending: false });

      if (err) {
        if (!silent) {
          console.warn('Users table not found, using placeholder data:', err);
          setUsers([
            {
              id: '1',
              username: 'admin',
              email: 'admin@example.com',
              created_at: new Date().toISOString(),
              is_active: true,
              user_level: 'admin',
            },
          ]);
        }
      } else {
        setUsers(data || []);
      }
    } catch (e) {
      if (!silent) {
        setError(e?.message || 'Failed to load users');
        setUsers([
          {
            id: '1',
            username: 'admin',
            created_at: new Date().toISOString(),
            is_active: true,
            user_level: 'admin',
          },
        ]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  /**
   * Helper to format timestamps for display.
   * @private
   */
  const formatDate = (dateString) => {
    if (!dateString) return '–';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewDetails = (user) => {
    setViewDetailsModal(user);
  };

  const handleStatusChange = (user) => {
    const newStatus = !user.is_active;
    setStatusChangeModal({ user, newStatus });
  };

  /**
   * Saves the updated active status for a specific user.
   */
  const confirmStatusChange = async () => {
    if (!statusChangeModal || !supabase) return;

    const { user, newStatus } = statusChangeModal;
    setUpdating(true);

    try {
      const { error: err } = await supabase
        .from('users')
        .update({ is_active: newStatus })
        .eq('id', user.id);

      if (err) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, is_active: newStatus } : u))
        );
      } else {
        addLog({
          action: 'edit',
          target: 'User',
          details: `User ${user.username} ${newStatus ? 'activated' : 'deactivated'}`,
        });
        await loadUsers();
      }
    } catch (e) {
      // On error, still update local state for placeholder data
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: newStatus } : u))
      );
    } finally {
      setUpdating(false);
      setStatusChangeModal(null);
    }
  };

  /**
   * Persists changes made to a user's profile.
   */
  const handleEditUser = async (userId, editData) => {
    if (!supabase) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                username: editData.username,
                email: editData.email,
                user_level: editData.user_level,
                is_active: editData.is_active,
              }
            : u
        )
      );
      addLog({ action: 'edit', target: 'User', details: `User ${editData.username} (${userId})` });
      setViewDetailsModal(null);
      return;
    }

    setUpdating(true);
    try {
      const { error: err } = await supabase
        .from('users')
        .update({
          username: editData.username,
          email: editData.email,
          user_level: editData.user_level,
          is_active: editData.is_active,
        })
        .eq('id', userId);

      if (err) {
        console.error('Error updating user:', err);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  username: editData.username,
                  email: editData.email,
                  user_level: editData.user_level,
                  is_active: editData.is_active,
                }
              : u
          )
        );
      } else {
        addLog({ action: 'edit', target: 'User', details: `User ${editData.username} (${userId})` });
        await loadUsers();
      }
      setViewDetailsModal(null);
    } catch (e) {
      console.error('Error editing user:', e);
      // On error, still update local state for placeholder data
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                username: editData.username,
                email: editData.email,
                user_level: editData.user_level,
                is_active: editData.is_active,
              }
            : u
        )
      );
      setViewDetailsModal(null);
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Creates a new user in the system.
   */
  const handleAddUser = async (userData) => {
    if (!supabase) {
      const newUser = {
        id: String(Date.now()),
        username: userData.username,
        email: userData.email,
        created_at: new Date().toISOString(),
        is_active: userData.is_active,
        user_level: userData.user_level || 'assistant',
      };
      setUsers((prev) => [newUser, ...prev]);
      addLog({ action: 'add', target: 'User', details: `User ${userData.username} added` });
      setAddUserModalOpen(false);
      return;
    }

    setSaving(true);
    try {
      // Note: In production, passwords should be hashed server-side using bcrypt
      // For now, we're storing a placeholder hash. Implement proper password hashing:
      // - Use Supabase Auth: supabase.auth.admin.createUser()
      // - Or hash on backend before inserting
      // - Or use a library like bcryptjs in a serverless function
      const passwordHash = `$2a$10$placeholder_${userData.password.substring(0, 10)}_hash_needed`;

      // Try to insert into users table
      const { error: insertError } = await supabase.from('users').insert({
        username: userData.username,
        email: userData.email,
        password_hash: passwordHash, // In production, use properly hashed password
        is_active: userData.is_active,
        user_level: userData.user_level || 'assistant',
      });

      if (insertError) {
        console.error('Error inserting user:', insertError);
        const newUser = {
          id: String(Date.now()),
          username: userData.username,
          email: userData.email,
          created_at: new Date().toISOString(),
          is_active: userData.is_active,
          user_level: userData.user_level || 'assistant',
        };
        setUsers((prev) => [newUser, ...prev]);
      } else {
        addLog({ action: 'add', target: 'User', details: `User ${userData.username} added` });
        await loadUsers();
      }
    } catch (e) {
      console.error('Error adding user:', e);
      // On error, add to local state for placeholder
      const newUser = {
        id: String(Date.now()),
        username: userData.username,
        email: userData.email,
        created_at: new Date().toISOString(),
        is_active: userData.is_active,
        user_level: userData.user_level || 'assistant',
      };
      setUsers((prev) => [newUser, ...prev]);
    } finally {
      setSaving(false);
      setAddUserModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-800 text-lg">Users</h2>
            <p className="text-slate-500 text-sm mt-1">Manage user accounts and permissions</p>
          </div>
          <button
            type="button"
            onClick={() => setAddUserModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#7030a0' }}
          >
            <UserPlus size={18} />
            Add User
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            {error}. Note: You may need to create a users table in Supabase or use the Admin API to fetch users.
          </div>
        )}

        {loading ? (
          <div className="h-48 flex items-center justify-center text-slate-400">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
            No users found. Click &quot;Add User&quot; to create a new account.
          </div>
        ) : (
          <div className="rounded-xl border border-slate-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-slate-50/80 text-slate-600 border-b-2 border-slate-200">
                  <th className="py-3.5 px-3 font-semibold">User ID</th>
                  <th className="py-3.5 px-3 font-semibold">User Name</th>
                  <th className="py-3.5 px-3 font-semibold">Email</th>
                  <th className="py-3.5 px-3 font-semibold">Date Created</th>
                  <th className="py-3.5 px-3 font-semibold">User Level</th>
                  <th className="py-3.5 px-3 font-semibold">Status</th>
                  <th className="py-3.5 px-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both',
                    }}
                  >
                    <td className="py-3 px-3 font-mono text-slate-600 text-xs">{user.id}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{user.username || '–'}</td>
                    <td className="py-3 px-3 text-slate-600">{user.email || '–'}</td>
                    <td className="py-3 px-3 text-slate-600">{formatDate(user.created_at)}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          user.user_level === 'admin'
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {user.user_level || 'assistant'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(user)}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 hover:shadow-sm transition-all duration-200"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddUserModal
        isOpen={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        onSubmit={handleAddUser}
        saving={saving}
      />
      <ViewDetailsModal
        isOpen={!!viewDetailsModal}
        user={viewDetailsModal}
        onClose={() => setViewDetailsModal(null)}
        onStatusChange={handleStatusChange}
        onEdit={handleEditUser}
        saving={updating}
      />
      <ConfirmStatusModal
        isOpen={!!statusChangeModal}
        user={statusChangeModal?.user}
        newStatus={statusChangeModal?.newStatus}
        onConfirm={confirmStatusChange}
        onCancel={() => setStatusChangeModal(null)}
      />
    </div>
  );
}
