const express = require('express');
const ExcelJS = require('exceljs');
const User = require('../models/User');
const { protect, adminOnly } = require('../utils/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Export all users (participants and hosts) to Excel
 * @route GET /api/export/users
 * @access Private - Admin only
 */
router.get('/users', protect, adminOnly, async (req, res, next) => {
  try {
    // Fetch all users
    const users = await User.find().select('name email role createdAt xp level').lean();

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found to export',
      });
    }

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // Add worksheet for all users
    const allUsersSheet = workbook.addWorksheet('All Users');
    
    // Set up columns
    allUsersSheet.columns = [
      { header: 'S.No', key: 'sno', width: 8, alignment: { horizontal: 'center' } },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Role', key: 'role', width: 15, alignment: { horizontal: 'center' } },
      { header: 'XP', key: 'xp', width: 10, alignment: { horizontal: 'center' } },
      { header: 'Level', key: 'level', width: 10, alignment: { horizontal: 'center' } },
      { header: 'Joined Date', key: 'createdAt', width: 18 },
    ];

    // Style header row
    allUsersSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    allUsersSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' },
    };

    // Add data rows
    users.forEach((user, index) => {
      allUsersSheet.addRow({
        sno: index + 1,
        name: user.name || 'N/A',
        email: user.email || 'N/A',
        role: user.role || 'participant',
        xp: user.xp || 0,
        level: user.level || 1,
        createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
      });
    });

    // Add sheets for specific roles
    const participants = users.filter(u => u.role === 'participant');
    const hosts = users.filter(u => u.role === 'host');

    if (participants.length > 0) {
      const participantsSheet = workbook.addWorksheet('Participants');
      participantsSheet.columns = [
        { header: 'S.No', key: 'sno', width: 8, alignment: { horizontal: 'center' } },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'XP', key: 'xp', width: 10, alignment: { horizontal: 'center' } },
        { header: 'Level', key: 'level', width: 10, alignment: { horizontal: 'center' } },
        { header: 'Joined Date', key: 'createdAt', width: 18 },
      ];

      participantsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      participantsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF667EEA' },
      };

      participants.forEach((user, index) => {
        participantsSheet.addRow({
          sno: index + 1,
          name: user.name || 'N/A',
          email: user.email || 'N/A',
          xp: user.xp || 0,
          level: user.level || 1,
          createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
        });
      });
    }

    if (hosts.length > 0) {
      const hostsSheet = workbook.addWorksheet('Hosts');
      hostsSheet.columns = [
        { header: 'S.No', key: 'sno', width: 8, alignment: { horizontal: 'center' } },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Joined Date', key: 'createdAt', width: 18 },
      ];

      hostsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      hostsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF667EEA' },
      };

      hosts.forEach((user, index) => {
        hostsSheet.addRow({
          sno: index + 1,
          name: user.name || 'N/A',
          email: user.email || 'N/A',
          createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
        });
      });
    }

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Send response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="FestifyXR-Users-${new Date().toLocaleDateString()}.xlsx"`);
    
    logger.info('Users exported to Excel', { 
      totalUsers: users.length,
      participants: participants.length,
      hosts: hosts.length,
      userId: req.user.id 
    });

    res.send(buffer);
  } catch (error) {
    logger.error('Error exporting users', { error: error.message, stack: error.stack });
    next(error);
  }
});

/**
 * Export participants only to Excel
 * @route GET /api/export/participants
 * @access Private - Admin/Host
 */
router.get('/participants', protect, async (req, res, next) => {
  try {
    const participants = await User.find({ role: 'participant' })
      .select('name email xp level createdAt')
      .lean();

    if (!participants || participants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No participants found to export',
      });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Participants');

    sheet.columns = [
      { header: 'S.No', key: 'sno', width: 8, alignment: { horizontal: 'center' } },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'XP', key: 'xp', width: 10, alignment: { horizontal: 'center' } },
      { header: 'Level', key: 'level', width: 10, alignment: { horizontal: 'center' } },
      { header: 'Joined Date', key: 'createdAt', width: 18 },
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' },
    };

    participants.forEach((user, index) => {
      sheet.addRow({
        sno: index + 1,
        name: user.name || 'N/A',
        email: user.email || 'N/A',
        xp: user.xp || 0,
        level: user.level || 1,
        createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="FestifyXR-Participants-${new Date().toLocaleDateString()}.xlsx"`);

    logger.info('Participants exported to Excel', { 
      totalParticipants: participants.length,
      userId: req.user.id 
    });

    res.send(buffer);
  } catch (error) {
    logger.error('Error exporting participants', { error: error.message, stack: error.stack });
    next(error);
  }
});

/**
 * Export hosts only to Excel
 * @route GET /api/export/hosts
 * @access Private - Admin only
 */
router.get('/hosts', protect, adminOnly, async (req, res, next) => {
  try {
    const hosts = await User.find({ role: 'host' })
      .select('name email createdAt')
      .lean();

    if (!hosts || hosts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hosts found to export',
      });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Hosts');

    sheet.columns = [
      { header: 'S.No', key: 'sno', width: 8, alignment: { horizontal: 'center' } },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Joined Date', key: 'createdAt', width: 18 },
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' },
    };

    hosts.forEach((user, index) => {
      sheet.addRow({
        sno: index + 1,
        name: user.name || 'N/A',
        email: user.email || 'N/A',
        createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="FestifyXR-Hosts-${new Date().toLocaleDateString()}.xlsx"`);

    logger.info('Hosts exported to Excel', { 
      totalHosts: hosts.length,
      userId: req.user.id 
    });

    res.send(buffer);
  } catch (error) {
    logger.error('Error exporting hosts', { error: error.message, stack: error.stack });
    next(error);
  }
});

module.exports = router;
