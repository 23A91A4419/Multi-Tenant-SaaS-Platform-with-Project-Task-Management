const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

const tenantRoutes = require('./routes/tenantRoutes');

app.use('/api/tenants', tenantRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

app.use('/api/projects', require('./routes/projectRoutes'));

app.use('/api', require('./routes/taskRoutes'));