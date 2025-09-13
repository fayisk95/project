const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'smartdocs-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'backend/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Database setup (SQLite for development)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'backend/database.sqlite',
  logging: false
});

// Models
const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'sales'), defaultValue: 'sales' }
});

const Quotation = sequelize.define('Quotation', {
  projectTitle: { type: DataTypes.STRING, allowNull: false },
  clientCompany: { type: DataTypes.STRING, allowNull: false },
  clientName: { type: DataTypes.STRING, allowNull: false },
  clientEmail: { type: DataTypes.STRING, allowNull: false },
  clientPhone: { type: DataTypes.STRING, allowNull: false },
  clientAddress: { type: DataTypes.TEXT, allowNull: false },
  executiveSummary: { type: DataTypes.TEXT, allowNull: false },
  technologyStack: { type: DataTypes.TEXT, allowNull: false },
  timeline: { type: DataTypes.TEXT, allowNull: false },
  paymentTerms: { type: DataTypes.TEXT },
  assumptions: { type: DataTypes.TEXT },
  termsConditions: { type: DataTypes.TEXT },
  discountType: { type: DataTypes.ENUM('percentage', 'flat'), defaultValue: 'percentage' },
  discountValue: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  taxPercent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 5 },
  status: { type: DataTypes.ENUM('draft', 'approved'), defaultValue: 'draft' },
  grandTotal: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }
});

const QuotationModule = sequelize.define('QuotationModule', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  hours: { type: DataTypes.INTEGER, allowNull: false },
  cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
});

const QuotationAdditionalCharge = sequelize.define('QuotationAdditionalCharge', {
  name: { type: DataTypes.STRING, allowNull: false },
  unitCost: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
});

const Customer = sequelize.define('Customer', {
  companyName: { type: DataTypes.STRING, allowNull: false },
  contactName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT, allowNull: false }
});

const BRD = sequelize.define('BRD', {
  content: { type: DataTypes.TEXT, allowNull: false }
});

const CompanySettings = sequelize.define('CompanySettings', {
  companyName: { type: DataTypes.STRING, defaultValue: 'brandnbytes' },
  logoUrl: { type: DataTypes.STRING, defaultValue: '' },
  address: { type: DataTypes.TEXT, defaultValue: '' },
  taxPercent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 5 },
  termsConditions: { type: DataTypes.TEXT, defaultValue: '' }
});

// Associations
Quotation.hasMany(QuotationModule, { foreignKey: 'quotationId', as: 'modules' });
QuotationModule.belongsTo(Quotation, { foreignKey: 'quotationId' });

Quotation.hasMany(QuotationAdditionalCharge, { foreignKey: 'quotationId', as: 'additionalCharges' });
QuotationAdditionalCharge.belongsTo(Quotation, { foreignKey: 'quotationId' });

Quotation.hasOne(BRD, { foreignKey: 'quotationId', as: 'brd' });
BRD.belongsTo(Quotation, { foreignKey: 'quotationId', as: 'quotation' });

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Quotation routes
app.get('/api/quotations', authenticateToken, async (req, res) => {
  try {
    const quotations = await Quotation.findAll({
      include: [
        { model: QuotationModule, as: 'modules' },
        { model: QuotationAdditionalCharge, as: 'additionalCharges' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Customer routes
app.get('/api/customers', authenticateToken, async (req, res) => {
  try {
    const customers = await Customer.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/customers/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/customers', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/customers/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    await customer.update(req.body);
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/customers/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    await customer.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/quotations/:id', authenticateToken, async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id, {
      include: [
        { model: QuotationModule, as: 'modules' },
        { model: QuotationAdditionalCharge, as: 'additionalCharges' }
      ]
    });
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    res.json(quotation);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/quotations', authenticateToken, async (req, res) => {
  try {
    const quotationData = req.body;
    
    const quotation = await Quotation.create(quotationData);
    
    // Create modules
    if (quotationData.modules && quotationData.modules.length > 0) {
      const modules = quotationData.modules.map(module => ({
        ...module,
        quotationId: quotation.id
      }));
      await QuotationModule.bulkCreate(modules);
    }
    
    // Create additional charges
    if (quotationData.additionalCharges && quotationData.additionalCharges.length > 0) {
      const charges = quotationData.additionalCharges.map(charge => ({
        ...charge,
        quotationId: quotation.id
      }));
      await QuotationAdditionalCharge.bulkCreate(charges);
    }
    
    // Fetch complete quotation with associations
    const completeQuotation = await Quotation.findByPk(quotation.id, {
      include: [
        { model: QuotationModule, as: 'modules' },
        { model: QuotationAdditionalCharge, as: 'additionalCharges' }
      ]
    });
    
    res.status(201).json(completeQuotation);
  } catch (error) {
    console.error('Error creating quotation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/quotations/:id', authenticateToken, async (req, res) => {
  try {
    const quotationData = req.body;
    const quotation = await Quotation.findByPk(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    await quotation.update(quotationData);
    
    // Update modules
    await QuotationModule.destroy({ where: { quotationId: quotation.id } });
    if (quotationData.modules && quotationData.modules.length > 0) {
      const modules = quotationData.modules.map(module => ({
        ...module,
        quotationId: quotation.id
      }));
      await QuotationModule.bulkCreate(modules);
    }
    
    // Update additional charges
    await QuotationAdditionalCharge.destroy({ where: { quotationId: quotation.id } });
    if (quotationData.additionalCharges && quotationData.additionalCharges.length > 0) {
      const charges = quotationData.additionalCharges.map(charge => ({
        ...charge,
        quotationId: quotation.id
      }));
      await QuotationAdditionalCharge.bulkCreate(charges);
    }
    
    // Fetch updated quotation with associations
    const updatedQuotation = await Quotation.findByPk(quotation.id, {
      include: [
        { model: QuotationModule, as: 'modules' },
        { model: QuotationAdditionalCharge, as: 'additionalCharges' }
      ]
    });
    
    res.json(updatedQuotation);
  } catch (error) {
    console.error('Error updating quotation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/api/quotations/:id/approve', authenticateToken, async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id, {
      include: [
        { model: QuotationModule, as: 'modules' },
        { model: QuotationAdditionalCharge, as: 'additionalCharges' }
      ]
    });
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    await quotation.update({ status: 'approved' });
    
    // Generate BRD
    const brdContent = await generateBRDContent(quotation);
    await BRD.create({
      quotationId: quotation.id,
      content: brdContent
    });
    
    res.json(quotation);
  } catch (error) {
    console.error('Error approving quotation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/quotations/:id', authenticateToken, async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    await QuotationModule.destroy({ where: { quotationId: quotation.id } });
    await QuotationAdditionalCharge.destroy({ where: { quotationId: quotation.id } });
    await BRD.destroy({ where: { quotationId: quotation.id } });
    await quotation.destroy();
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting quotation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// BRD routes
app.get('/api/brds', authenticateToken, async (req, res) => {
  try {
    const brds = await BRD.findAll({
      include: [
        { 
          model: Quotation, 
          as: 'quotation',
          attributes: ['projectTitle', 'clientCompany']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(brds);
  } catch (error) {
    console.error('Error fetching BRDs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/brds/:id', authenticateToken, async (req, res) => {
  try {
    const brd = await BRD.findByPk(req.params.id, {
      include: [
        { 
          model: Quotation, 
          as: 'quotation',
          include: [
            { model: QuotationModule, as: 'modules' },
            { model: QuotationAdditionalCharge, as: 'additionalCharges' }
          ]
        }
      ]
    });
    
    if (!brd) {
      return res.status(404).json({ message: 'BRD not found' });
    }
    
    res.json(brd);
  } catch (error) {
    console.error('Error fetching BRD:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes
app.get('/api/admin/company-settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create({
        companyName: 'brandnbytes',
        address: 'Dubai, UAE',
        taxPercent: 5,
        termsConditions: 'Standard terms and conditions apply.'
      });
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching company settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/admin/company-settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create(req.body);
    } else {
      await settings.update(req.body);
    }
    res.json(settings);
  } catch (error) {
    console.error('Error updating company settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/admin/upload-logo', authenticateToken, requireAdmin, upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const logoUrl = `/uploads/${req.file.filename}`;
    res.json({ logoUrl });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PDF Export routes (placeholder - would use a PDF generation library in production)
app.get('/api/quotations/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id, {
      include: [
        { model: QuotationModule, as: 'modules' },
        { model: QuotationAdditionalCharge, as: 'additionalCharges' }
      ]
    });
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    // Generate PDF content (placeholder)
    const pdfContent = generateQuotationPDF(quotation);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="quotation-${quotation.projectTitle}.pdf"`);
    res.send(Buffer.from(pdfContent, 'base64'));
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/brds/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const brd = await BRD.findByPk(req.params.id, {
      include: [
        { 
          model: Quotation, 
          as: 'quotation',
          include: [
            { model: QuotationModule, as: 'modules' },
            { model: QuotationAdditionalCharge, as: 'additionalCharges' }
          ]
        }
      ]
    });
    
    if (!brd) {
      return res.status(404).json({ message: 'BRD not found' });
    }
    
    // Generate PDF content (placeholder)
    const pdfContent = generateBRDPDF(brd);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="brd-${brd.quotation?.projectTitle || 'document'}.pdf"`);
    res.send(Buffer.from(pdfContent, 'base64'));
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper functions
async function generateBRDContent(quotation) {
  const modulesContent = quotation.modules.map(module => 
    `<h4>${module.name}</h4><p>${module.description}</p><p>Estimated Hours: ${module.hours}</p>`
  ).join('');

  const chargesContent = quotation.additionalCharges.map(charge =>
    `<tr><td>${charge.name}</td><td>$${charge.unitCost}</td><td>${charge.quantity}</td><td>$${charge.total}</td></tr>`
  ).join('');

  return `
    <h1>Business Requirements Document</h1>
    <h2>Project: ${quotation.projectTitle}</h2>
    <h3>Client: ${quotation.clientCompany}</h3>
    
    <h2>1. Introduction</h2>
    <p>This Business Requirements Document (BRD) outlines the functional and technical requirements for the ${quotation.projectTitle} project.</p>
    
    <h2>2. Executive Summary</h2>
    <p>${quotation.executiveSummary}</p>
    
    <h2>3. Technology Stack</h2>
    <p>${quotation.technologyStack}</p>
    
    <h2>4. Scope of Work</h2>
    ${modulesContent}
    
    <h2>5. Timeline & Deliverables</h2>
    <p>${quotation.timeline}</p>
    
    <h2>6. Cost Breakdown</h2>
    <table border="1" style="width:100%; border-collapse:collapse;">
      <tr><th>Item</th><th>Unit Cost</th><th>Quantity</th><th>Total</th></tr>
      ${chargesContent}
      <tr><td colspan="3"><strong>Grand Total</strong></td><td><strong>$${quotation.grandTotal}</strong></td></tr>
    </table>
    
    <h2>7. Assumptions & Dependencies</h2>
    <p>${quotation.assumptions}</p>
    
    <h2>8. Terms & Conditions</h2>
    <p>${quotation.termsConditions}</p>
  `;
}

function generateQuotationPDF(quotation) {
  // Placeholder PDF generation - in production, use a proper PDF library
  return Buffer.from(`Quotation PDF for ${quotation.projectTitle}`).toString('base64');
}

function generateBRDPDF(brd) {
  // Placeholder PDF generation - in production, use a proper PDF library
  return Buffer.from(`BRD PDF for ${brd.quotation?.projectTitle || 'Project'}`).toString('base64');
}

// Initialize database and create default users
async function initializeDatabase() {
  try {
    await sequelize.sync({ force: false });
    
    // Create default users if they don't exist
    const adminExists = await User.findOne({ where: { email: 'admin@brandnbytes.com' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@brandnbytes.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Default admin user created');
    }

    const salesExists = await User.findOne({ where: { email: 'sales@brandnbytes.com' } });
    if (!salesExists) {
      const hashedPassword = await bcrypt.hash('sales123', 10);
      await User.create({
        name: 'Sales User',
        email: 'sales@brandnbytes.com',
        password: hashedPassword,
        role: 'sales'
      });
      console.log('Default sales user created');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`SmartDocs server running on http://localhost:${PORT}`);
    console.log('Default credentials:');
    console.log('Admin: admin@brandnbytes.com / admin123');
    console.log('Sales: sales@brandnbytes.com / sales123');
  });
});