const Society = require('../models/Society');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Maintenance = require('../models/Maintenance');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');
const Event = require('../models/Event');
const Poll = require('../models/Poll');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');

const seedData = async () => {
  try {
    console.log('🧹 Purging old records before seed...');
    await Promise.all([
      Society.deleteMany({}),
      User.deleteMany({}),
      Complaint.deleteMany({}),
      Maintenance.deleteMany({}),
      Payment.deleteMany({}),
      Expense.deleteMany({}),
      Notification.deleteMany({}),
      Event.deleteMany({}),
      Poll.deleteMany({}),
      Document.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log('🏛️ Creating Societies...');
    const society1 = await Society.create({
      name: 'Emerald Heights Residency',
      address: '42 Palm Avenue, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      contactEmail: 'contact@emeraldheights.com',
      contactPhone: '+91 98200 12345',
      logo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&auto=format&fit=crop&q=80',
      wings: [
        { name: 'A', totalFlats: 20, floors: 5 },
        { name: 'B', totalFlats: 20, floors: 5 },
        { name: 'C', totalFlats: 20, floors: 5 }
      ],
      settings: {
        maintenanceDeadline: 10,
        defaultMonthlyMaintenance: 3500,
        penaltyRate: 150,
        lateFeeDays: 5,
        currency: 'INR',
        upiId: 'emeraldheights@okhdfcbank',
        bankDetails: {
          accountName: 'Emerald Heights Co-op Housing Society Ltd',
          accountNumber: '50200034981245',
          ifscCode: 'HDFC0000123',
          bankName: 'HDFC Bank, Bandra West'
        }
      }
    });

    const society2 = await Society.create({
      name: 'Grand Orchid Towers',
      address: '108 Green Park Boulevard, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      contactEmail: 'office@grandorchid.com',
      contactPhone: '+91 98800 67890',
      logo: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=200&auto=format&fit=crop&q=80',
      wings: [
        { name: 'A', totalFlats: 30, floors: 8 },
        { name: 'B', totalFlats: 30, floors: 8 }
      ],
      settings: {
        maintenanceDeadline: 15,
        defaultMonthlyMaintenance: 4200,
        penaltyRate: 200,
        lateFeeDays: 5,
        currency: 'INR',
        upiId: 'grandorchid@okaxis'
      }
    });

    console.log('👤 Creating Users & Roles...');
    // Main Admin
    const mainAdmin = await User.create({
      fullName: 'Vikrant Deshmukh (Super Admin)',
      email: 'admin@societyhub.com',
      mobileNumber: '9800000001',
      password: 'password123',
      role: 'main_admin',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    // Society Admin (Emerald Heights)
    const societyAdmin = await User.create({
      societyId: society1._id,
      fullName: 'Col. Rajesh Bakshi (Secretary)',
      email: 'admin@emeraldheights.com',
      mobileNumber: '9800000002',
      password: 'password123',
      role: 'society_admin',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      memberDetails: {
        flatNumber: '101',
        wing: 'A',
        floor: 1,
        occupation: 'Retired Defence Officer',
        emergencyContact: '+91 98200 99999',
        isOwner: true
      }
    });

    // Staff
    const electricianStaff = await User.create({
      societyId: society1._id,
      fullName: 'Suresh Kumar (Electrician/Plumber)',
      email: 'suresh.staff@emeraldheights.com',
      mobileNumber: '9800000011',
      password: 'password123',
      role: 'staff',
      profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      staffDetails: {
        designation: 'Maintenance Specialist & Electrician',
        shift: 'Day Shift (8:00 AM - 6:00 PM)',
        emergencyContact: '+91 98200 44556'
      }
    });

    // Members
    const member1 = await User.create({
      societyId: society1._id,
      fullName: 'Rahul Sharma',
      email: 'rahul.sharma@gmail.com',
      mobileNumber: '9876543210',
      password: 'password123',
      role: 'member',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      memberDetails: {
        flatNumber: '402',
        wing: 'A',
        floor: 4,
        occupation: 'Senior Software Architect',
        emergencyContact: '+91 98765 00001',
        isOwner: true,
        moveInDate: new Date('2022-04-15'),
        familyMembers: [
          { name: 'Pooja Sharma', relationship: 'Spouse', age: 32, contact: '+91 98765 00002' },
          { name: 'Aarav Sharma', relationship: 'Son', age: 7, contact: 'N/A' }
        ],
        vehicleNumbers: [
          { type: '4_wheeler', number: 'MH-02-CB-4492' },
          { type: '2_wheeler', number: 'MH-02-EE-8812' }
        ]
      }
    });

    const member2 = await User.create({
      societyId: society1._id,
      fullName: 'Ananya Verma',
      email: 'ananya.verma@gmail.com',
      mobileNumber: '9876543211',
      password: 'password123',
      role: 'member',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      memberDetails: {
        flatNumber: '204',
        wing: 'B',
        floor: 2,
        occupation: 'Financial Analyst',
        emergencyContact: '+91 98765 00003',
        isOwner: true,
        moveInDate: new Date('2021-08-10'),
        familyMembers: [
          { name: 'Rohan Verma', relationship: 'Spouse', age: 35, contact: '+91 98765 00004' }
        ],
        vehicleNumbers: [
          { type: '4_wheeler', number: 'MH-02-DK-1010' }
        ]
      }
    });

    const member3 = await User.create({
      societyId: society1._id,
      fullName: 'Vikram Patel',
      email: 'vikram.patel@gmail.com',
      mobileNumber: '9876543212',
      password: 'password123',
      role: 'member',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      memberDetails: {
        flatNumber: '301',
        wing: 'C',
        floor: 3,
        occupation: 'Graphic Designer',
        emergencyContact: '+91 98765 00005',
        isOwner: false, // Tenant
        moveInDate: new Date('2023-01-05'),
        familyMembers: [],
        vehicleNumbers: [
          { type: '2_wheeler', number: 'MH-02-ZZ-9900' }
        ]
      }
    });

    const member4 = await User.create({
      societyId: society1._id,
      fullName: 'Dr. Priya Nair',
      email: 'priya.nair@gmail.com',
      mobileNumber: '9876543213',
      password: 'password123',
      role: 'member',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      memberDetails: {
        flatNumber: '102',
        wing: 'A',
        floor: 1,
        occupation: 'Pediatrician',
        emergencyContact: '+91 98765 00006',
        isOwner: true,
        moveInDate: new Date('2020-11-20'),
        familyMembers: [],
        vehicleNumbers: [
          { type: '4_wheeler', number: 'MH-02-PN-5555' }
        ]
      }
    });

    console.log('💳 Creating Maintenance Billings...');
    // Previous Month: July 2026
    const maintenanceJuly = await Maintenance.create({
      societyId: society1._id,
      month: 7,
      year: 2026,
      title: 'July 2026 Maintenance Billing',
      amount: 3500,
      breakdown: [
        { item: 'Security & CCTV Surveillance', amount: 1200 },
        { item: 'Lift & Generator Maintenance', amount: 800 },
        { item: 'Common Area Electricity & Water', amount: 900 },
        { item: 'Sinking & Repair Fund', amount: 600 }
      ],
      dueDate: new Date('2026-07-10'),
      penaltyAmount: 150,
      lateFeeDays: 5,
      description: 'Standard monthly maintenance collection for July 2026.',
      createdBy: societyAdmin._id
    });

    // Current Month: August 2026
    const maintenanceAug = await Maintenance.create({
      societyId: society1._id,
      month: 8,
      year: 2026,
      title: 'August 2026 Maintenance Billing',
      amount: 3500,
      breakdown: [
        { item: 'Security & CCTV Surveillance', amount: 1200 },
        { item: 'Lift & Generator Maintenance', amount: 800 },
        { item: 'Common Area Electricity & Water', amount: 900 },
        { item: 'Sinking & Repair Fund', amount: 600 }
      ],
      dueDate: new Date('2026-08-10'),
      penaltyAmount: 150,
      lateFeeDays: 5,
      description: 'Standard monthly maintenance collection for August 2026.',
      createdBy: societyAdmin._id
    });

    console.log('💰 Creating Payments & Receipts...');
    // Rahul paid July
    await Payment.create({
      societyId: society1._id,
      userId: member1._id,
      maintenanceId: maintenanceJuly._id,
      amount: 3500,
      paidAmount: 3500,
      penaltyAmount: 0,
      paymentDate: new Date('2026-07-06'),
      dueDate: new Date('2026-07-10'),
      paymentMethod: 'upi',
      transactionId: 'UPI-982341-HDFC-991',
      receiptNumber: 'REC-2026-88102',
      status: 'completed',
      notes: 'Paid on time via UPI',
      paymentDetails: {
        gateway: 'razorpay',
        orderId: 'order_Jul_Rahul_991',
        paymentId: 'pay_Jul_Rahul_991',
        signature: 'sig_mock_verified'
      }
    });

    // Ananya paid July & August
    await Payment.create({
      societyId: society1._id,
      userId: member2._id,
      maintenanceId: maintenanceJuly._id,
      amount: 3500,
      paidAmount: 3500,
      paymentDate: new Date('2026-07-08'),
      dueDate: new Date('2026-07-10'),
      paymentMethod: 'online',
      receiptNumber: 'REC-2026-88103',
      status: 'completed'
    });

    await Payment.create({
      societyId: society1._id,
      userId: member2._id,
      maintenanceId: maintenanceAug._id,
      amount: 3500,
      paidAmount: 3500,
      paymentDate: new Date('2026-08-04'),
      dueDate: new Date('2026-08-10'),
      paymentMethod: 'card',
      receiptNumber: 'REC-2026-89240',
      status: 'completed'
    });

    // Priya paid August offline cash recorded by admin
    await Payment.create({
      societyId: society1._id,
      userId: member4._id,
      maintenanceId: maintenanceAug._id,
      amount: 3500,
      paidAmount: 3500,
      paymentDate: new Date('2026-08-07'),
      dueDate: new Date('2026-08-10'),
      paymentMethod: 'cash',
      receiptNumber: 'REC-2026-89241',
      status: 'completed',
      recordedBy: societyAdmin._id,
      notes: 'Cash received at society management office by Col. Bakshi'
    });

    console.log('🛠️ Creating Complaints...');
    await Complaint.create({
      societyId: society1._id,
      userId: member1._id,
      ticketNumber: 'TKT-2026-1044',
      title: 'Main Lift In Wing A Making High Pitched Grinding Noise',
      description: 'The passenger lift in Wing A is producing a loud metal friction noise while passing the 3rd floor. Kindly dispatch Otis technician on priority.',
      category: 'maintenance',
      priority: 'high',
      status: 'in_progress',
      assignedTo: electricianStaff._id,
      images: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80'
      ],
      adminRemarks: 'Otis maintenance crew scheduled for inspection tomorrow 11:00 AM.',
      timeline: [
        {
          status: 'pending',
          changedBy: member1._id,
          note: 'Ticket created by resident Rahul Sharma (A-402)',
          timestamp: new Date('2026-08-14T09:30:00Z')
        },
        {
          status: 'assigned',
          changedBy: societyAdmin._id,
          note: 'Assigned to Suresh Kumar (Maintenance Specialist)',
          timestamp: new Date('2026-08-14T11:15:00Z')
        },
        {
          status: 'in_progress',
          changedBy: electricianStaff._id,
          note: 'Inspected pulleys and motor; ordered replacement ball bearing from vendor.',
          timestamp: new Date('2026-08-15T14:00:00Z')
        }
      ],
      comments: [
        {
          userId: member1._id,
          message: 'It was also jerky around floor 4 this morning.',
          createdAt: new Date('2026-08-14T10:00:00Z')
        },
        {
          userId: societyAdmin._id,
          message: 'Noted Rahul, please use the service lift in Wing B until service is finished.',
          createdAt: new Date('2026-08-14T11:20:00Z')
        },
        {
          userId: electricianStaff._id,
          message: 'Otis engineer Mr. Verma has been notified and spare parts are arriving today.',
          createdAt: new Date('2026-08-15T14:05:00Z')
        }
      ]
    });

    await Complaint.create({
      societyId: society1._id,
      userId: member2._id,
      ticketNumber: 'TKT-2026-1045',
      title: 'Water Pressure Low on 2nd Floor Mornings',
      description: 'Since last Thursday, the morning overhead water supply pressure drops significantly between 7 AM and 8:30 AM.',
      category: 'plumbing',
      priority: 'medium',
      status: 'pending',
      images: [],
      timeline: [
        {
          status: 'pending',
          changedBy: member2._id,
          note: 'Ticket raised by Ananya Verma (B-204)',
          timestamp: new Date('2026-08-16T08:00:00Z')
        }
      ],
      comments: []
    });

    await Complaint.create({
      societyId: society1._id,
      userId: member4._id,
      ticketNumber: 'TKT-2026-1039',
      title: 'Corridor Light Flicker near Flat 102',
      description: 'The tube light in front of flat 102 is flickering constantly.',
      category: 'electrical',
      priority: 'low',
      status: 'resolved',
      assignedTo: electricianStaff._id,
      resolution: 'Replaced LED driver and choke with Philips 18W unit.',
      resolvedAt: new Date('2026-08-12T16:00:00Z'),
      timeline: [
        {
          status: 'resolved',
          changedBy: electricianStaff._id,
          note: 'Replacement installed and tested successfully.',
          timestamp: new Date('2026-08-12T16:00:00Z')
        }
      ]
    });

    console.log('📊 Creating Society Expenses...');
    await Expense.create({
      societyId: society1._id,
      title: 'Security Staff Monthly Payroll (7 Guards + 1 Supervisor)',
      category: 'salaries',
      description: 'Monthly security agency invoice for round-the-clock gate & campus patrol.',
      amount: 48000,
      expenseDate: new Date('2026-08-01'),
      vendorName: 'Apex Security Solutions Pvt Ltd',
      invoiceNumber: 'INV-APX-8821',
      addedBy: societyAdmin._id,
      approvedBy: societyAdmin._id,
      status: 'approved'
    });

    await Expense.create({
      societyId: society1._id,
      title: 'Common Area MSEB Electricity Bill',
      category: 'electricity',
      description: 'Power consumption for corridor lighting, water pump motors, and clubhouse.',
      amount: 14250,
      expenseDate: new Date('2026-08-05'),
      vendorName: 'MSEB Electricity Distribution',
      invoiceNumber: 'EB-2026-AUG-4412',
      addedBy: societyAdmin._id,
      approvedBy: societyAdmin._id,
      status: 'approved'
    });

    await Expense.create({
      societyId: society1._id,
      title: 'Otis Elevator Annual Maintenance Contract (Quarterly Advance)',
      category: 'maintenance',
      description: 'Quarterly maintenance fee for 4 passenger elevators.',
      amount: 22000,
      expenseDate: new Date('2026-07-25'),
      vendorName: 'Otis Elevator Company India Ltd',
      invoiceNumber: 'AMC-OTIS-2026-Q3',
      addedBy: societyAdmin._id,
      approvedBy: societyAdmin._id,
      status: 'approved'
    });

    await Expense.create({
      societyId: society1._id,
      title: 'Monsoon Garden Landscaping & Pest Control Spray',
      category: 'gardening',
      description: 'Trimming overgrown branches near Wing C and anti-mosquito fogging.',
      amount: 6500,
      expenseDate: new Date('2026-08-11'),
      vendorName: 'GreenThumb Landscapers',
      addedBy: societyAdmin._id,
      approvedBy: societyAdmin._id,
      status: 'approved'
    });

    console.log('📢 Creating Notifications / Notices...');
    await Notification.create({
      societyId: society1._id,
      title: 'Annual General Body Meeting (AGM) - August 30',
      message: 'Dear Residents, the 12th Annual General Meeting is scheduled for Sunday, August 30 at 10:30 AM in the Clubhouse. Agenda includes financial audit review and solar rooftop proposal.',
      type: 'event',
      priority: 'high',
      isPinned: true,
      target: 'all',
      createdBy: societyAdmin._id,
      readBy: [
        { userId: member1._id, readAt: new Date() },
        { userId: member2._id, readAt: new Date() }
      ]
    });

    await Notification.create({
      societyId: society1._id,
      title: 'Scheduled Water Tank Cleaning Notice (Wing A & B)',
      message: 'Overhead and underground tanks will be cleaned on Saturday, August 22 from 10:00 AM to 4:00 PM. Water supply will remain paused during this window. Please store necessary water.',
      type: 'maintenance',
      priority: 'urgent',
      isPinned: true,
      target: 'all',
      createdBy: societyAdmin._id,
      readBy: [
        { userId: member1._id, readAt: new Date() }
      ]
    });

    await Notification.create({
      societyId: society1._id,
      title: 'Independence Day Flag Hoisting & High Tea',
      message: 'Join us at 8:45 AM near the flagpole for national anthem and flag hoisting followed by sweets and snacks for children.',
      type: 'general',
      priority: 'medium',
      target: 'all',
      createdBy: societyAdmin._id
    });

    console.log('🎉 Creating Events...');
    await Event.create({
      societyId: society1._id,
      title: 'Grand Monsoon Festival & Cultural Night',
      description: 'An evening of live music, delicious food stalls by residents, cultural dances, and games for kids in the main society lawns.',
      eventDate: new Date('2026-08-29'),
      startTime: '17:30',
      endTime: '22:00',
      venue: 'Clubhouse Central Lawn',
      maxAttendees: 150,
      coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
      organizer: societyAdmin._id,
      registrations: [
        { userId: member1._id, attendees: 3, registeredAt: new Date() },
        { userId: member2._id, attendees: 2, registeredAt: new Date() }
      ]
    });

    await Event.create({
      societyId: society1._id,
      title: 'Annual General Meeting (AGM) 2026',
      description: 'Mandatory annual meeting to discuss budget allocations, lift modernisation, and society audits.',
      eventDate: new Date('2026-08-30'),
      startTime: '10:30',
      endTime: '13:30',
      venue: 'Community Hall (Wing A - 1st Floor)',
      maxAttendees: 100,
      coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      organizer: societyAdmin._id,
      registrations: [
        { userId: member1._id, attendees: 1, registeredAt: new Date() }
      ]
    });

    console.log('🗳️ Creating Polls...');
    await Poll.create({
      societyId: society1._id,
      title: 'Should we install a 25kW Grid-Tied Solar Rooftop System?',
      description: 'Estimated investment: ₹12 Lakhs (Payback in 3.5 years). Reduces common area power bills by 65%.',
      options: [
        { text: 'Yes, fully approve with sinking fund', votesCount: 14 },
        { text: 'Yes, but take bank loan with monthly EMI', votesCount: 8 },
        { text: 'Need a detailed presentation in AGM first', votesCount: 5 },
        { text: 'No, do not approve', votesCount: 2 }
      ],
      votes: [
        { userId: member1._id, optionIndex: 0, votedAt: new Date() },
        { userId: member2._id, optionIndex: 0, votedAt: new Date() }
      ],
      createdBy: societyAdmin._id,
      expiresAt: new Date('2026-08-31'),
      isActive: true
    });

    await Poll.create({
      societyId: society1._id,
      title: 'Clubhouse Gymnasium Timings Extension',
      description: 'Several working residents have requested extending evening gym closing from 9:30 PM to 10:45 PM.',
      options: [
        { text: 'Approve extension to 10:45 PM', votesCount: 18 },
        { text: 'Keep existing timing (9:30 PM)', votesCount: 6 }
      ],
      votes: [
        { userId: member1._id, optionIndex: 0, votedAt: new Date() }
      ],
      createdBy: societyAdmin._id,
      expiresAt: new Date('2026-08-25'),
      isActive: true
    });

    console.log('📄 Creating Society Documents...');
    await Document.create({
      societyId: society1._id,
      title: 'Emerald Heights Society Bylaws & Guidelines 2026',
      description: 'Official model bylaws, resident code of conduct, parking rules, and noise regulations.',
      category: 'bylaws',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '2.4 MB',
      fileType: 'pdf',
      uploadedBy: societyAdmin._id,
      version: 2
    });

    await Document.create({
      societyId: society1._id,
      title: 'Audited Financial Balance Sheet & Income-Expense (FY 2025-26)',
      description: 'Certified financial statement by M/s Joshi & Co. Chartered Accountants.',
      category: 'financial',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '1.8 MB',
      fileType: 'pdf',
      uploadedBy: societyAdmin._id,
      version: 1
    });

    await Document.create({
      societyId: society1._id,
      title: 'Standard Flat Renovation & Interior Work Guidelines',
      description: 'Permitted work hours, debris disposal rules, and security clearance procedure.',
      category: 'guidelines',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '850 KB',
      fileType: 'pdf',
      uploadedBy: societyAdmin._id,
      version: 1
    });

    console.log('✨ Seed completed successfully!');
    console.log('🔑 Credentials Summary:');
    console.log('👑 Super Admin: admin@societyhub.com | password123');
    console.log('🏢 Society Admin: admin@emeraldheights.com | password123');
    console.log('👥 Resident Member: rahul.sharma@gmail.com | password123 (Flat A-402)');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

module.exports = { seedData };

if (require.main === module) {
  const path = require('path');
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
  require('dotenv').config();
  const connectDB = require('./database');
  connectDB().then(() => {
    seedData().then(() => {
      console.log('Done!');
      process.exit(0);
    });
  });
}
