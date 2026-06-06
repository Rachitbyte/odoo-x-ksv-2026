require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./models');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/auth.routes');
const vendorRoutes = require('./routes/vendor.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const rfqRoutes = require('./routes/rfq.routes');
const quotationRoutes = require('./routes/quotation.routes');
const approvalRoutes = require('./routes/approval.routes');
const poRoutes = require('./routes/po.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const activityRoutes = require('./routes/activity.routes');
const reportRoutes = require('./routes/report.routes');
const userRoutes = require('./routes/user.routes');

app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/rfq', rfqRoutes);
app.use('/api', quotationRoutes); // has both /rfq/:rfqId/quotations and /quotations/:id
app.use('/api/approvals', approvalRoutes);
app.use('/api/po', poRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/activity-logs', activityRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'VendorBridge API is running' });
});

// Database sync and server start
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  });
