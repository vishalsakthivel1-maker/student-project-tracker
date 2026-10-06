const express = require('express');
const router = express.Router();

let projects = [
  {
    id: "proj-1",
    name: "Smart Attendance System",
    description: "Academic project tracking attendance using smart detection.",
    teamMembers: ["Arun", "Bala", "Karthik", "Priya"]
  }
];

let tasks = [
  { id: "task-1", projectId: "proj-1", title: "Database", assignedTo: "Arun", status: "Completed", deadline: "2026-10-10", comments: ["MongoDB collections designed successfully."] },
  { id: "task-2", projectId: "proj-1", title: "Backend API", assignedTo: "Bala", status: "Completed", deadline: "2026-10-15", comments: ["Express endpoints created and tested."] },
  { id: "task-3", projectId: "proj-1", title: "React UI", assignedTo: "Karthik", status: "In Progress", deadline: "2026-10-20", comments: ["Working on Dashboard and Project detail pages."] },
  { id: "task-4", projectId: "proj-1", title: "Testing", assignedTo: "Priya", status: "Pending", deadline: "2026-10-25", comments: [] },
  { id: "task-5", projectId: "proj-1", title: "Documentation", assignedTo: "Arun", status: "Pending", deadline: "2026-10-30", comments: [] }
];

router.get('/projects', (req, res) => res.json(projects));
router.get('/projects/:id', (req, res) => {
  const p = projects.find(item => item.id === req.params.id);
  p ? res.json(p) : res.status(404).json({ message: "Not found" });
});
router.post('/projects', (req, res) => {
  const newProj = { id: "proj-" + Date.now(), name: req.body.name, description: req.body.description || "", teamMembers: req.body.teamMembers || [] };
  projects.push(newProj);
  res.status(201).json(newProj);
});
router.post('/projects/:id/team', (req, res) => {
  const p = projects.find(item => item.id === req.params.id);
  if (p && req.body.memberName) p.teamMembers.push(req.body.memberName);
  res.json(p);
});
router.delete('/projects/:id', (req, res) => {
  projects = projects.filter(p => p.id !== req.params.id);
  res.json({ message: "Deleted" });
});

router.get('/tasks/project/:projectId', (req, res) => {
  res.json(tasks.filter(t => t.projectId === req.params.projectId));
});
router.post('/tasks', (req, res) => {
  const newTask = { id: "task-" + Date.now(), projectId: req.body.projectId, title: req.body.title, assignedTo: req.body.assignedTo || "Unassigned", status: "Pending", deadline: req.body.deadline || "", comments: [] };
  tasks.push(newTask);
  res.status(201).json(newTask);
});
router.put('/tasks/:id', (req, res) => {
  const t = tasks.find(item => item.id === req.params.id);
  if (t) {
    if (req.body.status) t.status = req.body.status;
    if (req.body.assignedTo) t.assignedTo = req.body.assignedTo;
  }
  res.json(t);
});
router.post('/tasks/:id/comments', (req, res) => {
  const t = tasks.find(item => item.id === req.params.id);
  if (t && req.body.text) t.comments.push(req.body.text);
  res.json(t);
});
router.delete('/tasks/:id', (req, res) => {
  tasks = tasks.filter(t => t.id !== req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
