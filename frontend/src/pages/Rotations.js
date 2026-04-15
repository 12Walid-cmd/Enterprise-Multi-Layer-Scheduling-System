import React, { useState, useEffect } from "react";
import api from "../api/api";
import "../styles/rotations.css";
import { useToastContext } from '../context/ToastContext';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Confirm Dialog Component
function ConfirmDialog({ confirm, onConfirm, onCancel }) {
  if (!confirm) return null;
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <p className="confirm-message">{confirm.message}</p>
        <div className="confirm-actions">
          <button className="confirm-cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="confirm-ok-btn" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// Sortable Member Item Component
function SortableMemberItem({ member, onRemove, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="current-member-item">
      <div className="member-info-wrapper">
        <div
          {...attributes}
          {...listeners}
          className="drag-handle"
          style={{ cursor: 'grab', padding: '0 8px', fontSize: '18px', color: '#6b7280' }}
        >
          ⋮⋮
        </div>
        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#374151', minWidth: '35px', marginRight: '8px' }}>
          {index + 1}.
        </div>
        <div className="member-avatar-circle">{member.initials}</div>
        <div className="member-info-text">
          <div className="member-name-text">
            {member.name}
            {member.type === "team" && (
              <span className="member-team-badge">Team ({member.memberCount})</span>
            )}
          </div>
          {member.email && <div className="member-email-display">{member.email}</div>}
        </div>
      </div>
      <button className="remove-member-btn" onClick={() => onRemove(member.id)}>Remove</button>
    </div>
  );
}

function Rotations() {
  const [activeTab, setActiveTab] = useState('rotations');
  const role = localStorage.getItem('role') || 'Individual';
  const canCreateRotation = role === 'Administrator' || role === 'Rotation Owner';

  // Toast from global context
  const { showToast } = useToastContext();

  // Confirm dialog state
  const [confirm, setConfirm] = useState(null);
  const showConfirm = (message) => new Promise((resolve) => setConfirm({ message, resolve }));
  const handleConfirm = () => { confirm?.resolve(true); setConfirm(null); };
  const handleCancel = () => { confirm?.resolve(false); setConfirm(null); };

  // Rotation state
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRotation, setEditingRotation] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '', rotation_type: '', group_id: '', team_id: '',
    cadence_type: '', cadence_interval: 1, min_assignees: 1
  });
  const [selectedRotation, setSelectedRotation] = useState(null);
  const [detailsRotation, setDetailsRotation] = useState(null);
  const [detailsMembers, setDetailsMembers] = useState([]);
  const [detailsMembersLoading, setDetailsMembersLoading] = useState(false);
  const [rotationMembers, setRotationMembers] = useState([]);
  const [addMemberMode, setAddMemberMode] = useState("individual");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [rotations, setRotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [availableRotationTypes, setAvailableRotationTypes] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamPreviewMembers, setTeamPreviewMembers] = useState([]);
  const [teamPreviewLoading, setTeamPreviewLoading] = useState(false);

  // Template state
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '', rotation_type: '', cadence_type: '',
    cadence_interval: 1, min_assignees: 1, is_private: false
  });

  // Filter state
  const [typeDropOpen, setTypeDropOpen] = useState(false);
  const [teamDropOpen, setTeamDropOpen] = useState(false);
  const [statusDropOpen, setStatusDropOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [filters, setFilters] = useState({ search: '' });

  const [newRotation, setNewRotation] = useState({
    name: '', rotation_type: '', group_id: '', team_id: '',
    cadence_type: '', cadence_interval: 1, min_assignees: 1
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const isFiltersActive = filters.search || selectedTypes.length > 0 || selectedTeams.length > 0 || selectedStatuses.length > 0;

  const cadenceLabel = (type, interval) => {
    if (type === 'DAILY') return interval === 1 ? 'day' : 'days';
    if (type === 'WEEKLY') return interval === 1 ? 'week' : 'weeks';
    if (type === 'BI_WEEKLY') return interval === 1 ? 'bi-week' : 'bi-weeks';
    if (type === 'MONTHLY') return interval === 1 ? 'month' : 'months';
    return type?.toLowerCase();
  };

  const getFilteredRotations = () => {
    return rotations.filter(rotation => {
      if (filters.search &&
        !rotation.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !rotation.rotation_type.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (selectedTypes.length > 0 && !selectedTypes.includes(rotation.rotation_type)) return false;
      if (selectedTeams.length > 0 && !selectedTeams.includes(rotation.team_name)) return false;
      if (selectedStatuses.length > 0) {
        const isActive = rotation.is_active ? 'Active' : 'Inactive';
        if (!selectedStatuses.includes(isActive)) return false;
      }
      return true;
    });
  };

  useEffect(() => {
    fetchRotations();
    fetchUsers();
    fetchTeams();
    fetchGroups();
    fetchRotationTypes();
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedTeam) { setTeamPreviewMembers([]); return; }
    const fetchTeamPreview = async () => {
      setTeamPreviewLoading(true);
      try {
        const response = await api.get(`/teams/${selectedTeam}/members`);
        setTeamPreviewMembers(response.data);
      } catch (error) {
        console.error("Error fetching team preview:", error);
        setTeamPreviewMembers([]);
      } finally {
        setTeamPreviewLoading(false);
      }
    };
    fetchTeamPreview();
  }, [selectedTeam]);

  const fetchRotations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rotations');
      setRotations(response.data);
    } catch (error) {
      console.error("Error fetching rotations:", error);
      showToast("Failed to load rotations", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/members?limit=1000');
      setAvailableUsers(response.data.data.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        initials: `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`,
        jobTitle: user.job_title || 'Staff'
      })));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      setAvailableTeams(response.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setAvailableGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchRotationTypes = async () => {
    try {
      const response = await api.get('/rotations/types');
      setAvailableRotationTypes(response.data);
    } catch (error) {
      console.error("Error fetching rotation types:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const response = await api.get('/rotations/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setTemplatesLoading(false);
    }
  };

  // View Details
  const handleViewDetails = async (rotation) => {
    setDetailsRotation(rotation);
    setShowDetailsModal(true);
    setDetailsMembersLoading(true);
    try {
      const response = await api.get(`/rotations/${rotation.id}/members`);
      setDetailsMembers(response.data);
    } catch (error) {
      console.error("Error fetching rotation details:", error);
      showToast("Failed to load rotation details", "error");
    } finally {
      setDetailsMembersLoading(false);
    }
  };

  // Edit Rotation
  const handleOpenEdit = (rotation) => {
    setEditingRotation(rotation);
    setEditForm({
      name: rotation.name,
      rotation_type: rotation.rotation_type,
      group_id: rotation.group_id || '',
      team_id: rotation.team_id || '',
      cadence_type: rotation.cadence_type,
      cadence_interval: rotation.cadence_interval,
      min_assignees: rotation.min_assignees
    });
    setOpenMenuId(null);
    setShowEditModal(true);
  };

  const handleSubmitEdit = async () => {
    if (!editForm.name || !editForm.rotation_type || !editForm.cadence_type) {
      showToast("Please fill in all required fields (marked with *)", "error");
      return;
    }
    if (editForm.name.trim().length === 0) {
      showToast("Rotation name cannot be empty or just spaces", "error");
      return;
    }
    if (editForm.cadence_interval < 1 || editForm.cadence_interval > 365) {
      showToast("Cadence interval must be between 1 and 365", "error");
      return;
    }
    if (editForm.min_assignees < 1 || editForm.min_assignees > 100) {
      showToast("Minimum assignees must be between 1 and 100", "error");
      return;
    }
    try {
      setIsSubmitting(true);
      await api.patch(`/rotations/${editingRotation.id}`, {
        name: editForm.name.trim(),
        rotation_type: editForm.rotation_type,
        group_id: editForm.group_id || null,
        team_id: editForm.team_id || null,
        cadence_type: editForm.cadence_type,
        cadence_interval: editForm.cadence_interval,
        min_assignees: editForm.min_assignees
      });
      setShowEditModal(false);
      setEditingRotation(null);
      await fetchRotations();
      showToast("Rotation updated successfully!");
    } catch (error) {
      console.error("Error updating rotation:", error);
      showToast(error.response?.data?.error || "Failed to update rotation", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Rotation
  const handleDeleteRotation = async (rotation) => {
    const ok = await showConfirm(
      `Are you sure you want to delete "${rotation.name}"? This action cannot be undone and will remove all members from this rotation.`
    );
    if (!ok) return;
    try {
      await api.delete(`/rotations/${rotation.id}`);
      await fetchRotations();
      setOpenMenuId(null);
      showToast("Rotation deleted successfully!");
    } catch (error) {
      console.error("Error deleting rotation:", error);
      showToast("Failed to delete rotation", "error");
    }
  };

  const handleSaveAsTemplate = (rotation) => {
    setEditingTemplate(null);
    setTemplateForm({
      name: `${rotation.name} Template`,
      rotation_type: rotation.rotation_type,
      cadence_type: rotation.cadence_type,
      cadence_interval: rotation.cadence_interval,
      min_assignees: rotation.min_assignees,
      is_private: false
    });
    setOpenMenuId(null);
    setShowTemplateModal(true);
  };

  const handleOpenEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      rotation_type: template.rotation_type,
      cadence_type: template.cadence_type,
      cadence_interval: template.cadence_interval,
      min_assignees: template.min_assignees,
      is_private: template.is_private
    });
    setShowTemplateModal(true);
  };

  const handleSubmitTemplate = async () => {
    if (!templateForm.name || !templateForm.rotation_type || !templateForm.cadence_type) {
      showToast("Please fill in all required fields (marked with *)", "error");
      return;
    }
    try {
      setIsSubmitting(true);
      if (editingTemplate) {
        await api.patch(`/rotations/templates/${editingTemplate.id}`, templateForm);
        showToast("Template updated successfully!");
      } else {
        await api.post('/rotations/templates', templateForm);
        showToast("Template saved successfully!");
      }
      setShowTemplateModal(false);
      setEditingTemplate(null);
      setTemplateForm({ name: '', rotation_type: '', cadence_type: '', cadence_interval: 1, min_assignees: 1, is_private: false });
      await fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      showToast(error.response?.data?.error || "Failed to save template", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    const ok = await showConfirm("Are you sure you want to delete this template?");
    if (!ok) return;
    try {
      await api.delete(`/rotations/templates/${templateId}`);
      await fetchTemplates();
      showToast("Template deleted successfully!");
    } catch (error) {
      console.error("Error deleting template:", error);
      showToast("Failed to delete template", "error");
    }
  };

  const handleTogglePrivate = async (template) => {
    try {
      await api.patch(`/rotations/templates/${template.id}`, { is_private: !template.is_private });
      await fetchTemplates();
      showToast(`Template is now ${!template.is_private ? 'private' : 'public'}`);
    } catch (error) {
      console.error("Error toggling private:", error);
      showToast("Failed to update template", "error");
    }
  };

  const handleUseTemplate = (template) => {
    if (!canCreateRotation) {
      showToast('Only Administrator and Rotation Owner can create rotations.', 'error');
      return;
    }
    setNewRotation({
      name: template.name,
      rotation_type: template.rotation_type,
      group_id: '',
      team_id: '',
      cadence_type: template.cadence_type,
      cadence_interval: template.cadence_interval,
      min_assignees: template.min_assignees
    });
    setActiveTab('rotations');
    setShowModal(true);
  };

  const handleCreateRotation = async () => {
    if (!canCreateRotation) {
      showToast('Only Administrator and Rotation Owner can create rotations.', 'error');
      return;
    }

    if (!newRotation.name || !newRotation.rotation_type || !newRotation.cadence_type) {
      showToast("Please fill in all required fields (marked with *)", "error");
      return;
    }
    if (newRotation.name.trim().length === 0) {
      showToast("Rotation name cannot be empty or just spaces", "error");
      return;
    }
    if (newRotation.name.length > 255) {
      showToast("Rotation name must be less than 255 characters", "error");
      return;
    }
    const invalidChars = /[<>{}[\]\\/]/;
    if (invalidChars.test(newRotation.name)) {
      showToast("Rotation name contains invalid characters", "error");
      return;
    }
    const duplicateName = rotations.some(r => r.name.toLowerCase().trim() === newRotation.name.toLowerCase().trim());
    if (duplicateName) {
      showToast("A rotation with this name already exists", "error");
      return;
    }
    if (newRotation.cadence_interval < 1 || newRotation.cadence_interval > 365) {
      showToast("Cadence interval must be between 1 and 365", "error");
      return;
    }
    if (newRotation.cadence_type === 'WEEKLY' && newRotation.cadence_interval > 52) {
      showToast("Weekly interval cannot exceed 52. Use MONTHLY for longer intervals.", "error");
      return;
    }
    if (newRotation.cadence_type === 'DAILY' && newRotation.cadence_interval > 30) {
      const ok = await showConfirm("You're creating a rotation that cycles every 30+ days but marked as DAILY. Did you mean MONTHLY instead? Click Cancel to go back.");
      if (!ok) return;
    }
    if (newRotation.min_assignees < 1 || newRotation.min_assignees > 100) {
      showToast("Minimum assignees must be between 1 and 100", "error");
      return;
    }
    if (newRotation.min_assignees > 10) {
      const ok = await showConfirm(`You set minimum assignees to ${newRotation.min_assignees}. This is unusually high. Continue anyway?`);
      if (!ok) return;
    }
    try {
      setIsSubmitting(true);
      await api.post('/rotations', {
        name: newRotation.name.trim(),
        rotation_type: newRotation.rotation_type,
        group_id: newRotation.group_id || null,
        team_id: newRotation.team_id || null,
        cadence_type: newRotation.cadence_type,
        cadence_interval: newRotation.cadence_interval,
        min_assignees: newRotation.min_assignees
      });
      setShowModal(false);
      setNewRotation({ name: '', rotation_type: '', group_id: '', team_id: '', cadence_type: '', cadence_interval: 1, min_assignees: 1 });
      await fetchRotations();
      showToast("Rotation created successfully!");
    } catch (error) {
      console.error("Error creating rotation:", error);
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
        showToast("A rotation with this name already exists in the database.", "error");
      } else {
        showToast(error.response?.data?.error || "Failed to create rotation", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleRotationStatus = async (rotation) => {
    const action = rotation.is_active ? 'deactivate' : 'activate';
    const newStatus = !rotation.is_active;
    const ok = await showConfirm(
      `Are you sure you want to ${action} this rotation?${rotation.is_active ? ' Members will be preserved but the rotation will be marked as inactive.' : ''}`
    );
    if (!ok) return;
    try {
      await api.patch(`/rotations/${rotation.id}`, { is_active: newStatus });
      await fetchRotations();
      setOpenMenuId(null);
      showToast(`Rotation ${action}d successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing rotation:`, error);
      showToast(`Failed to ${action} rotation`, "error");
    }
  };

  const handleManageMembers = async (rotation) => {
    setSelectedRotation(rotation);
    setShowMembersModal(true);
    try {
      const response = await api.get(`/rotations/${rotation.id}/members`);
      setRotationMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
      setRotationMembers([]);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = rotationMembers.findIndex((m) => m.id === active.id);
      const newIndex = rotationMembers.findIndex((m) => m.id === over.id);
      const reorderedMembers = arrayMove(rotationMembers, oldIndex, newIndex);
      setRotationMembers(reorderedMembers);
      try {
        const { data } = await api.patch(`/rotations/${selectedRotation.id}/members/reorder`, {
          memberIds: reorderedMembers.map(m => m.id)
        });

        if (data.existingWindow) {
          await api.post('/schedules/generate', {
            rotationId:  selectedRotation.id,
            windowStart: data.existingWindow.windowStart,
            windowEnd:   data.existingWindow.windowEnd,
          });
          showToast('Rotation order updated — schedule regenerated', 'success');
        } else {
          showToast('Rotation order saved', 'success');
        }
      } catch (error) {
        console.error("Error updating member order:", error);
        showToast("Failed to update member order", "error");
        await handleManageMembers(selectedRotation);
      }
    }
  };

  const handleAddMembers = async () => {
    if (addMemberMode === "individual" && selectedUsers.length === 0) {
      showToast("Please select at least one user", "error");
      return;
    }
    if (addMemberMode === "team" && !selectedTeam) {
      showToast("Please select a team", "error");
      return;
    }
    try {
      await api.post(`/rotations/${selectedRotation.id}/members`, {
        type: addMemberMode,
        userIds: addMemberMode === "individual" ? selectedUsers : undefined,
        teamId: addMemberMode === "team" ? selectedTeam : undefined
      });
      const response = await api.get(`/rotations/${selectedRotation.id}/members`);
      setRotationMembers(response.data);
      setSelectedUsers([]);
      setSelectedTeam("");
      setTeamPreviewMembers([]);
      showToast(`Successfully added ${addMemberMode === "individual" ? selectedUsers.length + " member(s)" : "team members"}!`);
    } catch (error) {
      console.error("Error adding members:", error);
      showToast(error.response?.data?.error || "Failed to add members", "error");
    }
  };

  const handleRemoveMember = async (memberId) => {
    const ok = await showConfirm("Are you sure you want to remove this member?");
    if (!ok) return;
    try {
      const { data } = await api.delete(`/rotations/${selectedRotation.id}/members/${memberId}`);
      setRotationMembers(rotationMembers.filter(m => m.id !== memberId));

      if (data.existingWindow) {
        await api.post('/schedules/generate', {
          rotationId:  selectedRotation.id,
          windowStart: data.existingWindow.windowStart,
          windowEnd:   data.existingWindow.windowEnd,
        });
        showToast("Member removed — schedule regenerated", "success");
      } else {
        showToast("Member removed successfully!");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      showToast("Failed to remove member", "error");
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const filteredUsers = availableUsers.filter(user =>
    !rotationMembers.some(m => m.id === user.id) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTeams = availableTeams.filter(team =>
    !rotationMembers.some(m => m.id === team.id) &&
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="rotations-page">
        <h2 style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}>Loading rotations...</h2>
      </div>
    );
  }

  return (
    <div className="rotations-page" onClick={() => { setTypeDropOpen(false); setTeamDropOpen(false); setStatusDropOpen(false); setOpenMenuId(null); }}>

      {/* ── Page Header ───────────────────────────────────── */}
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Rotation Management</h1>
          <p className="page-subtitle">Create and manage rotation pools for your teams</p>
        </div>
        {activeTab === 'rotations' && canCreateRotation && (
          <button className="primary-button" onClick={(e) => { e.stopPropagation(); setShowModal(true); }}>
            <span className="btn-icon">＋</span>Create Rotation
          </button>
        )}
      </div>

      {/* ── Tab Switcher ──────────────────────────────────── */}
      <div className="tab-switcher">
        <button onClick={() => setActiveTab('rotations')} className={`tab-btn ${activeTab === 'rotations' ? 'active' : ''}`}>Rotations</button>
        <button onClick={() => setActiveTab('templates')} className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}>
          Templates {templates.length > 0 && `(${templates.length})`}
        </button>
      </div>

      {/* ── ROTATIONS TAB ─────────────────────────────────── */}
      {activeTab === 'rotations' && (
        <>
          {/* Filters Bar */}
          <div className="filters-bar" onClick={(e) => e.stopPropagation()}>
            <div className="fb-top-row">
              <div className="fb-search-wrap">
                <input type="text" className="fb-search" placeholder="Search rotations..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
                {filters.search && (<button className="fb-clear-x" onClick={() => setFilters({ ...filters, search: '' })}>×</button>)}
              </div>
              <div className="fb-dropdown-wrap" onClick={(e) => e.stopPropagation()}>
                <div className="fb-drop-label">Rotation Type</div>
                <button className={`fb-drop-btn${selectedTypes.length ? ' active' : ''}`} onClick={() => { setTypeDropOpen(p => !p); setTeamDropOpen(false); setStatusDropOpen(false); }}>
                  {selectedTypes.length ? `Rotation Type (${selectedTypes.length})` : 'All Types'}
                  <span className="fb-chevron">{typeDropOpen ? '▴' : '▾'}</span>
                </button>
                {typeDropOpen && (
                  <div className="fb-drop-panel">
                    <label className="fb-option fb-option-all">
                      <input type="checkbox" checked={selectedTypes.length === availableRotationTypes.length && availableRotationTypes.length > 0} onChange={() => setSelectedTypes(selectedTypes.length === availableRotationTypes.length ? [] : availableRotationTypes.map(t => t.name))} />
                      <span>Select All</span>
                    </label>
                    <div className="fb-divider" />
                    {availableRotationTypes.map(type => (
                      <label key={type.id} className="fb-option">
                        <input type="checkbox" checked={selectedTypes.includes(type.name)} onChange={() => setSelectedTypes(prev => prev.includes(type.name) ? prev.filter(t => t !== type.name) : [...prev, type.name])} />
                        <span>{type.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="fb-dropdown-wrap" onClick={(e) => e.stopPropagation()}>
                <div className="fb-drop-label">Team</div>
                <button className={`fb-drop-btn${selectedTeams.length ? ' active' : ''}`} onClick={() => { setTeamDropOpen(p => !p); setTypeDropOpen(false); setStatusDropOpen(false); }}>
                  {selectedTeams.length ? `Team (${selectedTeams.length})` : 'All Teams'}
                  <span className="fb-chevron">{teamDropOpen ? '▴' : '▾'}</span>
                </button>
                {teamDropOpen && (
                  <div className="fb-drop-panel">
                    <label className="fb-option fb-option-all">
                      <input type="checkbox" checked={selectedTeams.length === availableTeams.length && availableTeams.length > 0} onChange={() => setSelectedTeams(selectedTeams.length === availableTeams.length ? [] : availableTeams.map(t => t.name))} />
                      <span>Select All</span>
                    </label>
                    <div className="fb-divider" />
                    {availableTeams.map(team => (
                      <label key={team.id} className="fb-option">
                        <input type="checkbox" checked={selectedTeams.includes(team.name)} onChange={() => setSelectedTeams(prev => prev.includes(team.name) ? prev.filter(t => t !== team.name) : [...prev, team.name])} />
                        <span>{team.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="fb-dropdown-wrap" onClick={(e) => e.stopPropagation()}>
                <div className="fb-drop-label">Status</div>
                <button className={`fb-drop-btn${selectedStatuses.length ? ' active' : ''}`} onClick={() => { setStatusDropOpen(p => !p); setTypeDropOpen(false); setTeamDropOpen(false); }}>
                  {selectedStatuses.length ? `Status (${selectedStatuses.length})` : 'All Status'}
                  <span className="fb-chevron">{statusDropOpen ? '▴' : '▾'}</span>
                </button>
                {statusDropOpen && (
                  <div className="fb-drop-panel">
                    {[{ val: 'Active', label: 'Active' }, { val: 'Inactive', label: 'Inactive' }].map(s => (
                      <label key={s.val} className="fb-option">
                        <input type="checkbox" checked={selectedStatuses.includes(s.val)} onChange={() => setSelectedStatuses(prev => prev.includes(s.val) ? prev.filter(v => v !== s.val) : [...prev, s.val])} />
                        <span>{s.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {isFiltersActive && (
              <div className="fb-bottom-row">
                <div className="fb-chips">
                  {selectedTypes.map(name => (<span key={name} className="fb-chip"><span className="fb-chip-cat">Type</span>{name}<button onClick={() => setSelectedTypes(prev => prev.filter(t => t !== name))}>×</button></span>))}
                  {selectedTeams.map(name => (<span key={name} className="fb-chip"><span className="fb-chip-cat">Team</span>{name}<button onClick={() => setSelectedTeams(prev => prev.filter(t => t !== name))}>×</button></span>))}
                  {selectedStatuses.map(val => (<span key={val} className="fb-chip"><span className="fb-chip-cat">Status</span>{val}<button onClick={() => setSelectedStatuses(prev => prev.filter(v => v !== val))}>×</button></span>))}
                  {filters.search && (<span className="fb-chip"><span className="fb-chip-cat">Search</span>{filters.search}<button onClick={() => setFilters({ ...filters, search: '' })}>×</button></span>)}
                </div>
                <button className="fb-clear-all" onClick={() => { setSelectedTypes([]); setSelectedTeams([]); setSelectedStatuses([]); setFilters({ search: '' }); }}>✕ Clear All</button>
              </div>
            )}
          </div>

          {/* Rotations Grid */}
          <div className="rotations-grid">
            {getFilteredRotations().length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ color: '#6b7280', marginBottom: '8px', fontSize: '18px' }}>No rotations found</h3>
                <p style={{ color: '#9ca3af' }}>{isFiltersActive ? 'Try adjusting your filters' : 'Create your first rotation to get started'}</p>
              </div>
            ) : (
              getFilteredRotations().map((rotation) => (
                <div key={rotation.id} className={`rotation-card ${rotation.is_active === false ? "inactive" : ""}`} onClick={(e) => e.stopPropagation()}>
                  <div className="rotation-header">
                    <div>
                      <div className="rotation-title">{rotation.name}</div>
                      <div className="rotation-type">{rotation.rotation_type} • {rotation.cadence_type}</div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <div className="rotation-menu" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === rotation.id ? null : rotation.id); }}>⋮</div>
                      {openMenuId === rotation.id && (
                        <div className="rotation-dropdown-menu">
                          <button className="dropdown-menu-item" onClick={(e) => { e.stopPropagation(); handleToggleRotationStatus(rotation); }}>{rotation.is_active ? 'Deactivate Rotation' : 'Activate Rotation'}</button>
                          <button className="dropdown-menu-item" onClick={(e) => { e.stopPropagation(); handleOpenEdit(rotation); }}>Edit Rotation</button>
                          <button className="dropdown-menu-item" onClick={(e) => { e.stopPropagation(); handleSaveAsTemplate(rotation); }}>Save as Template</button>
                          <button className="dropdown-menu-item danger" onClick={(e) => { e.stopPropagation(); handleDeleteRotation(rotation); }}>Delete Rotation</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="rotation-details">
                    {rotation.group_name && (<div className="detail-row"><span className="detail-icon">🏢</span><span>{rotation.group_name}</span></div>)}
                    {rotation.team_name && (<div className="detail-row"><span className="detail-icon">👥</span><span>{rotation.team_name}</span></div>)}
                    <div className="detail-row">
                      <span className="detail-icon">📆</span>
                      <span>Every {rotation.cadence_interval} {cadenceLabel(rotation.cadence_type, rotation.cadence_interval)}</span>
                    </div>
                    <div className="detail-row"><span className="detail-icon">👤</span><span>Min {rotation.min_assignees} assignee(s)</span></div>
                    <div className="detail-row">
                      <span className={`status-badge ${rotation.is_active ? "status-active" : "status-inactive"}`}>{rotation.is_active ? "ACTIVE" : "INACTIVE"}</span>
                    </div>
                  </div>
                  <div className="rotation-actions">
                    <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleViewDetails(rotation); }}>View Details</button>
                    <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleManageMembers(rotation); }}>Manage Members</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ── TEMPLATES TAB ─────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 className="template-library-title" style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Template Library</h2>
              <p className="template-library-subtitle" style={{ fontSize: '14px', margin: '4px 0 0 0' }}>Save rotations and reuse them quickly</p>
            </div>
            <button className="primary-button" onClick={() => { setEditingTemplate(null); setTemplateForm({ name: '', rotation_type: '', cadence_type: '', cadence_interval: 1, min_assignees: 1, is_private: false }); setShowTemplateModal(true); }}>
              <span className="btn-icon">＋</span>New Template
            </button>
          </div>
          {templatesLoading ? (
            <p style={{ color: '#6b7280', textAlign: 'center', paddingTop: '40px' }}>Loading templates...</p>
          ) : templates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h3 style={{ color: '#e4e1e1', marginBottom: '8px', fontSize: '18px' }}>No templates yet</h3>
              <p style={{ color: '#d6d2d2', marginBottom: '20px' }}>Save a rotation as a template from the Rotations tab, or create a new one</p>
            </div>
          ) : (
            <div className="rotations-grid">
              {templates.map(template => (
                <div key={template.id} className="rotation-card">
                  <div className="rotation-header">
                    <div>
                      <div className="rotation-title">{template.name}</div>
                      <div className="rotation-type">{template.rotation_type} • {template.cadence_type}</div>
                    </div>
                    {template.is_private && (<span style={{ fontSize: '11px', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '999px', fontWeight: '500' }}>🔒 Private</span>)}
                  </div>
                  <div className="rotation-details">
                    <div className="detail-row">
                      <span className="detail-icon">📆</span>
                      <span>Every {template.cadence_interval} {cadenceLabel(template.cadence_type, template.cadence_interval)}</span>
                    </div>
                    <div className="detail-row"><span className="detail-icon">👤</span><span>Min {template.min_assignees} assignee(s)</span></div>
                  </div>
                  <div className="rotation-actions">
                    <button className="action-btn" onClick={() => handleUseTemplate(template)}>▶ Use</button>
                    <button className="action-btn" onClick={() => handleOpenEditTemplate(template)}>✏️ Edit</button>
                    <button className="action-btn" onClick={() => handleTogglePrivate(template)}>{template.is_private ? '🌐 Make Public' : '🔒 Make Private'}</button>
                    <button className="action-btn" style={{ color: '#ef4444' }} onClick={() => handleDeleteTemplate(template.id)}>🗑 Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CREATE ROTATION MODAL ─────────────────────────── */}
      {showModal && canCreateRotation && (
        <div className="create-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="create-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="create-modal-header">
              <h2 className="create-modal-title">Create New Rotation</h2>
              <button className="create-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="create-modal-body">
              <div className="form-group">
                <label className="form-label">Rotation Name *</label>
                <input type="text" className="form-input" placeholder="e.g., CDO On-Call Rotation" value={newRotation.name} onChange={(e) => setNewRotation({ ...newRotation, name: e.target.value })} maxLength="255" required />
              </div>
              <div className="form-group">
                <label className="form-label">Rotation Type *</label>
                <select className="form-select" value={newRotation.rotation_type} onChange={(e) => setNewRotation({ ...newRotation, rotation_type: e.target.value })} required>
                  <option value="">Select rotation type</option>
                  {availableRotationTypes.map(type => (<option key={type.id} value={type.name}>{type.name}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Group</label>
                <select className="form-select" value={newRotation.group_id} onChange={(e) => setNewRotation({ ...newRotation, group_id: e.target.value })}>
                  <option value="">Select group...(optional)</option>
                  {availableGroups.map(group => (<option key={group.id} value={group.id}>{group.name}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Team</label>
                <select className="form-select" value={newRotation.team_id} onChange={(e) => setNewRotation({ ...newRotation, team_id: e.target.value })}>
                  <option value="">Select team...(optional)</option>
                  {availableTeams.map(team => (<option key={team.id} value={team.id}>{team.name}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cadence Type *</label>
                <select className="form-select" value={newRotation.cadence_type} onChange={(e) => setNewRotation({ ...newRotation, cadence_type: e.target.value })} required>
                  <option value="">Select cadence</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BI_WEEKLY">Bi-Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cadence Interval *</label>
                <input type="number" className="form-input" placeholder="e.g., 1" min="1" max="365" value={newRotation.cadence_interval} onChange={(e) => setNewRotation({ ...newRotation, cadence_interval: e.target.value === '' ? '' : parseInt(e.target.value) || 1 })} required />
                <small style={{ color: '#6b7280', fontSize: '12px' }}>Every {newRotation.cadence_interval || 1} {newRotation.cadence_type?.toLowerCase() || 'period'}(s)</small>
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Assignees *</label>
                <input type="number" className="form-input" placeholder="e.g., 1" min="1" max="100" value={newRotation.min_assignees} onChange={(e) => setNewRotation({ ...newRotation, min_assignees: e.target.value === '' ? '' : parseInt(e.target.value) || 1 })} required />
              </div>
            </div>
            <div className="create-modal-footer">
              <button className="secondary-button" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancel</button>
              <button className="primary-button" onClick={handleCreateRotation} disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Rotation'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT ROTATION MODAL ───────────────────────────── */}
      {showEditModal && editingRotation && (
        <div className="create-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="create-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="create-modal-header">
              <h2 className="create-modal-title">Edit Rotation</h2>
              <button className="create-modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="create-modal-body">
              <div className="form-group">
                <label className="form-label">Rotation Name *</label>
                <input type="text" className="form-input" placeholder="e.g., CDO On-Call Rotation" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} maxLength="255" />
              </div>
              <div className="form-group">
                <label className="form-label">Rotation Type *</label>
                <select className="form-select" value={editForm.rotation_type} onChange={(e) => setEditForm({ ...editForm, rotation_type: e.target.value })}>
                  <option value="">Select rotation type</option>
                  {availableRotationTypes.map(type => (<option key={type.id} value={type.name}>{type.name}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Group</label>
                <select className="form-select" value={editForm.group_id} onChange={(e) => setEditForm({ ...editForm, group_id: e.target.value })}>
                  <option value="">Select group...(optional)</option>
                  {availableGroups.map(group => (<option key={group.id} value={group.id}>{group.name}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Team</label>
                <select className="form-select" value={editForm.team_id} onChange={(e) => setEditForm({ ...editForm, team_id: e.target.value })}>
                  <option value="">Select team...(optional)</option>
                  {availableTeams.map(team => (<option key={team.id} value={team.id}>{team.name}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cadence Type *</label>
                <select className="form-select" value={editForm.cadence_type} onChange={(e) => setEditForm({ ...editForm, cadence_type: e.target.value })}>
                  <option value="">Select cadence</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BI_WEEKLY">Bi-Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cadence Interval *</label>
                <input type="number" className="form-input" min="1" max="365" value={editForm.cadence_interval} onChange={(e) => setEditForm({ ...editForm, cadence_interval: e.target.value === '' ? '' : parseInt(e.target.value) || 1 })} />
                <small style={{ color: '#6b7280', fontSize: '12px' }}>Every {editForm.cadence_interval || 1} {editForm.cadence_type?.toLowerCase() || 'period'}(s)</small>
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Assignees *</label>
                <input type="number" className="form-input" min="1" max="100" value={editForm.min_assignees} onChange={(e) => setEditForm({ ...editForm, min_assignees: e.target.value === '' ? '' : parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <div className="create-modal-footer">
              <button className="secondary-button" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>Cancel</button>
              <button className="primary-button" onClick={handleSubmitEdit} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TEMPLATE MODAL ────────────────────────────────── */}
      {showTemplateModal && (
        <div className="create-modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="create-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="create-modal-header">
              <h2 className="create-modal-title">{editingTemplate ? 'Edit Template' : 'Save as Template'}</h2>
              <button className="create-modal-close" onClick={() => setShowTemplateModal(false)}>×</button>
            </div>
            <div className="create-modal-body">
              <div className="form-group">
                <label className="form-label">Template Name *</label>
                <input type="text" className="form-input" placeholder="e.g., Weekly On-Call Template" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} maxLength="255" />
              </div>
              <div className="form-group">
                <label className="form-label">Rotation Type *</label>
                <select className="form-select" value={templateForm.rotation_type} onChange={(e) => setTemplateForm({ ...templateForm, rotation_type: e.target.value })}>
                  <option value="">Select rotation type...</option>
                  {availableRotationTypes.map(type => (<option key={type.id} value={type.name}>{type.name}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cadence Type *</label>
                <select className="form-select" value={templateForm.cadence_type} onChange={(e) => setTemplateForm({ ...templateForm, cadence_type: e.target.value })}>
                  <option value="">Select cadence</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BI_WEEKLY">Bi-Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cadence Interval</label>
                <input type="number" className="form-input" min="1" max="365" value={templateForm.cadence_interval} onChange={(e) => setTemplateForm({ ...templateForm, cadence_interval: e.target.value === '' ? '' : parseInt(e.target.value) || 1 })} />
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Assignees</label>
                <input type="number" className="form-input" min="1" max="100" value={templateForm.min_assignees} onChange={(e) => setTemplateForm({ ...templateForm, min_assignees: e.target.value === '' ? '' : parseInt(e.target.value) || 1 })} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                <input type="checkbox" id="is_private" checked={templateForm.is_private} onChange={(e) => setTemplateForm({ ...templateForm, is_private: e.target.checked })} />
                <label htmlFor="is_private" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>🔒 Make this template private</label>
              </div>
            </div>
            <div className="create-modal-footer">
              <button className="secondary-button" onClick={() => setShowTemplateModal(false)} disabled={isSubmitting}>Cancel</button>
              <button className="primary-button" onClick={handleSubmitTemplate} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : editingTemplate ? 'Update Template' : 'Save Template'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MANAGE MEMBERS MODAL ──────────────────────────── */}
      {showMembersModal && (
        <div className="members-modal-overlay" onClick={() => setShowMembersModal(false)}>
          <div className="members-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="members-modal-header">
              <div>
                <h2 className="members-modal-title">Manage Rotation Members</h2>
                <p className="members-modal-subtitle">{selectedRotation?.name}</p>
              </div>
              <button className="members-modal-close" onClick={() => setShowMembersModal(false)}>×</button>
            </div>
            <div className="members-modal-body">
              <div className="current-members-section">
                <h3 className="members-section-title">Current Members ({rotationMembers.length})</h3>
                {rotationMembers.length === 0 ? (
                  <div className="members-empty-state">
                    <div className="members-empty-icon">👥</div>
                    <p className="members-empty-text">No members assigned yet</p>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={rotationMembers.map(m => m.id)} strategy={verticalListSortingStrategy}>
                      <div className="current-members-list">
                        {rotationMembers.map((member, index) => (
                          <SortableMemberItem key={member.id} member={member} index={index} onRemove={handleRemoveMember} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
              <div className="add-members-area" style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="members-section-title">Add Members</h3>
                  <div className="member-mode-toggle">
                    <button className={`mode-toggle-btn ${addMemberMode === "individual" ? "active" : ""}`} onClick={() => { setAddMemberMode("individual"); setSearchQuery(""); setTeamPreviewMembers([]); }}>👤 Add Individuals</button>
                    <button className={`mode-toggle-btn ${addMemberMode === "team" ? "active" : ""}`} onClick={() => { setAddMemberMode("team"); setSearchQuery(""); setTeamPreviewMembers([]); }}>👥 Add Entire Team</button>
                  </div>
                  <div className="member-search-wrapper">
                    <input type="text" placeholder={addMemberMode === "individual" ? "Search users..." : "Search teams..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="member-search-input" />
                  </div>
                  <div className="member-selection-list">
                    {addMemberMode === "individual" ? (
                      filteredUsers.length === 0 ? (<p className="no-members-text">No users available</p>) : (
                        filteredUsers.map(user => (
                          <div key={user.id} className={`member-select-item ${selectedUsers.includes(user.id) ? "selected" : ""}`} onClick={() => toggleUserSelection(user.id)}>
                            <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => {}} className="member-select-checkbox" />
                            <div className="member-select-info">
                              <div className="member-select-name">{user.name}</div>
                              <div className="member-select-detail">{user.email}</div>
                            </div>
                            <span className="member-mode-badge">{user.jobTitle}</span>
                          </div>
                        ))
                      )
                    ) : (
                      filteredTeams.length === 0 ? (<p className="no-members-text">No teams available</p>) : (
                        filteredTeams.map(team => (
                          <div key={team.id} className={`member-select-item ${selectedTeam === team.id ? "selected" : ""}`} onClick={() => setSelectedTeam(selectedTeam === team.id ? "" : team.id)}>
                            <input type="radio" name="team" checked={selectedTeam === team.id} onChange={() => {}} className="member-select-radio" />
                            <div className="member-select-info">
                              <div className="member-select-name">👥 {team.name}</div>
                              <div className="member-select-detail">{team.member_count || 0} members</div>
                            </div>
                          </div>
                        ))
                      )
                    )}
                  </div>
                  <button className="add-members-btn" onClick={handleAddMembers} disabled={(addMemberMode === "individual" && selectedUsers.length === 0) || (addMemberMode === "team" && !selectedTeam)}>
                    {addMemberMode === "individual" ? `Add ${selectedUsers.length} Member${selectedUsers.length !== 1 ? "s" : ""}` : "Add Team"}
                  </button>
                </div>
                {addMemberMode === "team" && (
                  <div style={{ width: '260px', flexShrink: 0, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
                      {selectedTeam ? `${teamPreviewMembers.length} member${teamPreviewMembers.length !== 1 ? 's' : ''} in this team` : 'Select a team to preview members'}
                    </div>
                    {teamPreviewLoading ? (
                      <div style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', paddingTop: '20px' }}>Loading...</div>
                    ) : !selectedTeam ? (
                      <div style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', paddingTop: '20px' }}>👈 Pick a team on the left</div>
                    ) : teamPreviewMembers.length === 0 ? (
                      <div style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', paddingTop: '20px' }}>No members in this team</div>
                    ) : (
                      teamPreviewMembers.map(member => (
                        <div key={member.user_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                          <div className="member-avatar-circle" style={{ flexShrink: 0, fontSize: '12px', width: '32px', height: '32px' }}>{member.first_name?.[0]}{member.last_name?.[0]}</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.first_name} {member.last_name}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.role_name || member.email}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="members-modal-footer">
              <button className="members-close-btn" onClick={() => setShowMembersModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW DETAILS MODAL ────────────────────────────── */}
      {showDetailsModal && detailsRotation && (
        <div className="create-modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="create-modal-content" style={{ width: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="create-modal-header">
              <div>
                <h2 className="create-modal-title">{detailsRotation.name}</h2>
                <p style={{ color: 'rgba(255,255,255,0.72)', margin: '4px 0 0', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>Rotation Details</p>
              </div>
              <button className="create-modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="create-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', padding: '20px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#6b7280', marginBottom: '4px' }}>Rotation Type</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{detailsRotation.rotation_type}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#6b7280', marginBottom: '4px' }}>Status</div>
                  <span className={`status-badge ${detailsRotation.is_active ? 'status-active' : 'status-inactive'}`}>{detailsRotation.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#6b7280', marginBottom: '4px' }}>Cadence</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Every {detailsRotation.cadence_interval} {cadenceLabel(detailsRotation.cadence_type, detailsRotation.cadence_interval)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#6b7280', marginBottom: '4px' }}>Min Assignees</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{detailsRotation.min_assignees}</div>
                </div>
                {detailsRotation.group_name && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#6b7280', marginBottom: '4px' }}>Group</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{detailsRotation.group_name}</div>
                  </div>
                )}
                {detailsRotation.team_name && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#6b7280', marginBottom: '4px' }}>Team</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{detailsRotation.team_name}</div>
                  </div>
                )}
              </div>
              <h3 className="members-section-title">Members ({detailsMembers.length})</h3>
              {detailsMembersLoading ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280', fontSize: '14px' }}>Loading members...</div>
              ) : detailsMembers.length === 0 ? (
                <div className="members-empty-state">
                  <div className="members-empty-icon">👥</div>
                  <p className="members-empty-text">No members assigned yet</p>
                </div>
              ) : (
                <div className="current-members-list">
                  {detailsMembers.map((member, index) => (
                    <div key={member.id} className="current-member-item">
                      <div className="member-info-wrapper">
                        <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#374151', minWidth: '28px' }}>{index + 1}.</div>
                        <div className="member-avatar-circle">{member.initials}</div>
                        <div className="member-info-text">
                          <div className="member-name-text">{member.name}</div>
                          {member.email && <div className="member-email-display">{member.email}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="create-modal-footer">
              <button className="secondary-button" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Dialog ────────────────────────────────── */}
      <ConfirmDialog confirm={confirm} onConfirm={handleConfirm} onCancel={handleCancel} />

    </div>
  );
}

export default Rotations;