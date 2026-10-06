import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export default function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showNewProj, setShowNewProj] = useState(false);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [teamInput, setTeamInput] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [newTeammate, setNewTeammate] = useState('');
  const [commentInputs, setCommentInputs] = useState({});

  const loadProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (e) { console.error(e); }
  };

  const loadTasks = async (pId) => {
    try {
      const res = await api.get(`/tasks/project/${pId}`);
      setTasks(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { if (selectedProject) loadTasks(selectedProject.id); }, [selectedProject]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projName) return;
    const team = teamInput.split(',').map(m => m.trim()).filter(Boolean);
    const res = await api.post('/projects', { name: projName, description: projDesc, teamMembers: team.length ? team : ['Student'] });
    setProjects([...projects, res.data]);
    setProjName(''); setProjDesc(''); setTeamInput(''); setShowNewProj(false);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newTeammate) return;
    const res = await api.post(`/projects/${selectedProject.id}/team`, { memberName: newTeammate });
    setSelectedProject(res.data);
    setProjects(projects.map(p => p.id === res.data.id ? res.data : p));
    setNewTeammate('');
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle) return;
    const res = await api.post('/tasks', {
      projectId: selectedProject.id,
      title: taskTitle,
      assignedTo: taskAssignee || (selectedProject.teamMembers[0] || 'Unassigned'),
      deadline: taskDeadline
    });
    setTasks([...tasks, res.data]);
    setTaskTitle(''); setTaskDeadline('');
  };

  const handleStatusChange = async (taskId, status) => {
    const res = await api.put(`/tasks/${taskId}`, { status });
    setTasks(tasks.map(t => t.id === taskId ? res.data : t));
  };

  const handleAddComment = async (taskId) => {
    const text = commentInputs[taskId];
    if (!text) return;
    const res = await api.post(`/tasks/${taskId}/comments`, { text });
    setTasks(tasks.map(t => t.id === taskId ? res.data : t));
    setCommentInputs({ ...commentInputs, [taskId]: '' });
  };

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ backgroundColor: '#1e293b', color: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setSelectedProject(null)}>🎓 Student Project Tracker</h2>
        {selectedProject && <button onClick={() => setSelectedProject(null)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Dashboard</button>}
      </header>

      <main style={{ maxWidth: '1000px', margin: '20px auto', padding: '0 16px' }}>
        {!selectedProject ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#0f172a' }}>Academic Projects</h2>
                <p style={{ margin: '4px 0 0', color: '#64748b' }}>Track student assignments and milestone progress</p>
              </div>
              <button onClick={() => setShowNewProj(!showNewProj)} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                + New Project
              </button>
            </div>

            {showNewProj && (
              <form onSubmit={handleCreateProject} style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px' }}>Create Project</h4>
                <input required placeholder="Project Name *" value={projName} onChange={e => setProjName(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                <textarea placeholder="Description" value={projDesc} onChange={e => setProjDesc(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                <input placeholder="Team Members (comma separated, e.g. Arun, Bala)" value={teamInput} onChange={e => setTeamInput(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Save Project</button>
              </form>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {projects.map(p => (
                <div key={p.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                  <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>{p.name}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', minHeight: '38px' }}>{p.description}</p>
                  <div style={{ margin: '10px 0' }}>
                    <small style={{ fontWeight: 'bold', color: '#334155' }}>Team:</small>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {p.teamMembers.map((m, idx) => (
                        <span key={idx} style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px' }}>{m}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setSelectedProject(p)} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <button onClick={() => setSelectedProject(null)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '14px', fontWeight: 'bold' }}>← Back to Projects</button>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h2 style={{ margin: '0 0 6px' }}>{selectedProject.name}</h2>
              <p style={{ color: '#64748b', margin: '0 0 16px' }}>{selectedProject.description}</p>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span><b>Progress:</b> {completedCount} of {tasks.length} completed</span>
                  <b>{progressPercent}%</b>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', background: progressPercent === 100 ? '#10b981' : '#3b82f6', transition: 'width 0.3s' }} />
                </div>
              </div>

              <div>
                <small style={{ fontWeight: 'bold' }}>Team Members:</small>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '6px 0 10px' }}>
                  {selectedProject.teamMembers.map((m, idx) => (
                    <span key={idx} style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem' }}>👤 {m}</span>
                  ))}
                </div>
                <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '8px', maxWidth: '300px' }}>
                  <input placeholder="New teammate name" value={newTeammate} onChange={e => setNewTeammate(e.target.value)} style={{ flex: 1, padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Add</button>
                </form>
              </div>
            </div>

            <form onSubmit={handleAddTask} style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <input required placeholder="Task Title *" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} style={{ padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <select value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)} style={{ padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                {selectedProject.teamMembers.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
              </select>
              <input type="date" value={taskDeadline} onChange={e => setTaskDeadline(e.target.value)} style={{ padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Task</button>
            </form>

            <h3 style={{ color: '#1e293b' }}>Tasks ({tasks.length})</h3>
            {tasks.map(t => (
              <div key={t.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h4 style={{ margin: 0 }}>{t.title}</h4>
                  <select value={t.status} onChange={e => handleStatusChange(t.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', background: t.status === 'Completed' ? '#dcfce7' : t.status === 'In Progress' ? '#fef3c7' : '#fee2e2', color: t.status === 'Completed' ? '#15803d' : t.status === 'In Progress' ? '#b45309' : '#b91c1c' }}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed ✓</option>
                  </select>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', margin: '8px 0' }}>
                  <span>Assigned: <b>{t.assignedTo}</b></span> | <span>Deadline: <b>{t.deadline || 'None'}</b></span>
                </div>
                <div style={{ marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                  <small style={{ fontWeight: 'bold' }}>Comments:</small>
                  <ul style={{ margin: '4px 0 8px 18px', fontSize: '0.82rem' }}>
                    {t.comments.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input placeholder="Add comment..." value={commentInputs[t.id] || ''} onChange={e => setCommentInputs({ ...commentInputs, [t.id]: e.target.value })} style={{ flex: 1, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.82rem' }} />
                    <button type="button" onClick={() => handleAddComment(t.id)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem' }}>Post</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
