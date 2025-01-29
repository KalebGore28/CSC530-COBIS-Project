const express = require('express');
const cors = require('cors');
const departmentRoutes = require('./routes/departmentRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Mount department routes at /department
app.use('/department', departmentRoutes);

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});