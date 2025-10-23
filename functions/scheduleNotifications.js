const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();

// Configure email transporter
// For Gmail: Use App Password (not regular password)
// For SendGrid: Use SendGrid API key
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
});

// Alternative: SendGrid configuration
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Trigger: Trade request approved
 * Sends email to both employees involved in the trade
 */
exports.onTradeApproved = functions.firestore
  .document('organizations/{orgId}/tradeRequests/{tradeId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const { orgId } = context.params;

    // Only trigger on status change to 'approved'
    if (before.status === 'pending' && after.status === 'approved') {
      try {
        // Get employee documents
        const requesterDoc = await admin
          .firestore()
          .collection('organizations')
          .doc(orgId)
          .collection('employees')
          .doc(after.requestedBy)
          .get();

        const targetDoc = await admin
          .firestore()
          .collection('organizations')
          .doc(orgId)
          .collection('employees')
          .doc(after.targetEmployeeId)
          .get();

        const requesterData = requesterDoc.data();
        const targetData = targetDoc.data();

        // Get shift details
        const myShiftDoc = await admin
          .firestore()
          .collection('organizations')
          .doc(orgId)
          .collection('shifts')
          .doc(after.myShiftId)
          .get();

        const targetShiftDoc = await admin
          .firestore()
          .collection('organizations')
          .doc(orgId)
          .collection('shifts')
          .doc(after.targetShiftId)
          .get();

        const myShift = myShiftDoc.data();
        const targetShift = targetShiftDoc.data();

        // Email to requester
        await transporter.sendMail({
          to: requesterData.email,
          subject: '✅ Your Shift Trade Has Been Approved!',
          html: `
            <h2>Shift Trade Approved</h2>
            <p>Hi ${requesterData.name},</p>
            <p>Your shift trade request has been approved!</p>
            <h3>Trade Details:</h3>
            <ul>
              <li><strong>You give:</strong> ${new Date(myShift.startTime).toLocaleDateString()} ${new Date(myShift.startTime).toLocaleTimeString()}</li>
              <li><strong>You receive:</strong> ${new Date(targetShift.startTime).toLocaleDateString()} ${new Date(targetShift.startTime).toLocaleTimeString()}</li>
              <li><strong>Trading with:</strong> ${targetData.name}</li>
            </ul>
            <p>The shifts have been updated in your schedule.</p>
            <p>Best regards,<br>DineSync Solutions</p>
          `,
        });

        // Email to target employee
        await transporter.sendMail({
          to: targetData.email,
          subject: '✅ A Shift Trade Involving You Has Been Approved!',
          html: `
            <h2>Shift Trade Approved</h2>
            <p>Hi ${targetData.name},</p>
            <p>A shift trade involving you has been approved!</p>
            <h3>Trade Details:</h3>
            <ul>
              <li><strong>You give:</strong> ${new Date(targetShift.startTime).toLocaleDateString()} ${new Date(targetShift.startTime).toLocaleTimeString()}</li>
              <li><strong>You receive:</strong> ${new Date(myShift.startTime).toLocaleDateString()} ${new Date(myShift.startTime).toLocaleTimeString()}</li>
              <li><strong>Trading with:</strong> ${requesterData.name}</li>
            </ul>
            <p>The shifts have been updated in your schedule.</p>
            <p>Best regards,<br>DineSync Solutions</p>
          `,
        });

        console.log(`Trade ${context.params.tradeId} approved - emails sent`);
      } catch (error) {
        console.error('Error sending trade approval emails:', error);
      }
    }
  });

/**
 * Trigger: Trade request denied
 * Sends email to requester
 */
exports.onTradeDenied = functions.firestore
  .document('organizations/{orgId}/tradeRequests/{tradeId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const { orgId } = context.params;

    if (before.status === 'pending' && after.status === 'denied') {
      try {
        const requesterDoc = await admin
          .firestore()
          .collection('organizations')
          .doc(orgId)
          .collection('employees')
          .doc(after.requestedBy)
          .get();

        const requesterData = requesterDoc.data();

        await transporter.sendMail({
          to: requesterData.email,
          subject: '❌ Your Shift Trade Request Was Denied',
          html: `
            <h2>Shift Trade Denied</h2>
            <p>Hi ${requesterData.name},</p>
            <p>Unfortunately, your shift trade request has been denied.</p>
            <p>Please contact management if you have any questions.</p>
            <p>Best regards,<br>DineSync Solutions</p>
          `,
        });

        console.log(`Trade ${context.params.tradeId} denied - email sent`);
      } catch (error) {
        console.error('Error sending trade denial email:', error);
      }
    }
  });

/**
 * Trigger: Pick request approved
 * Sends email to employee
 */
exports.onPickApproved = functions.firestore
  .document('organizations/{orgId}/pickRequests/{pickId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const { orgId } = context.params;

    if (before.status === 'pending' && after.status === 'approved') {
      try {
        const employeeDoc = await admin
          .firestore()
          .collection('organizations')
          .doc(orgId)
          .collection('employees')
          .doc(after.requestedBy)
          .get();

        const employeeData = employeeDoc.data();

        const shiftDoc = await admin
          .firestore()
          .collection('organizations')
          .doc(orgId)
          .collection('shifts')
          .doc(after.shiftId)
          .get();

        const shiftData = shiftDoc.data();

        await transporter.sendMail({
          to: employeeData.email,
          subject: '✅ Your Shift Pick Request Has Been Approved!',
          html: `
            <h2>Shift Pick Approved</h2>
            <p>Hi ${employeeData.name},</p>
            <p>Your shift pick request has been approved!</p>
            <h3>Shift Details:</h3>
            <ul>
              <li><strong>Date:</strong> ${new Date(shiftData.startTime).toLocaleDateString()}</li>
              <li><strong>Time:</strong> ${new Date(shiftData.startTime).toLocaleTimeString()} - ${new Date(shiftData.endTime).toLocaleTimeString()}</li>
              <li><strong>Role:</strong> ${shiftData.role || 'Staff'}</li>
            </ul>
            <p>The shift has been added to your schedule.</p>
            <p>Best regards,<br>DineSync Solutions</p>
          `,
        });

        console.log(`Pick ${context.params.pickId} approved - email sent`);
      } catch (error) {
        console.error('Error sending pick approval email:', error);
      }
    }
  });

/**
 * Trigger: Pick request denied
 * Sends email to employee
 */
exports.onPickDenied = functions.firestore
  .document('organizations/{orgId}/pickRequests/{pickId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const { orgId } = context.params;

    if (before.status === 'pending' && after.status === 'denied') {
      try {
        const employeeDoc = await admin
          .firestore()
          .collection('organizations')
          .doc(orgId)
          .collection('employees')
          .doc(after.requestedBy)
          .get();

        const employeeData = employeeDoc.data();

        await transporter.sendMail({
          to: employeeData.email,
          subject: '❌ Your Shift Pick Request Was Denied',
          html: `
            <h2>Shift Pick Denied</h2>
            <p>Hi ${employeeData.name},</p>
            <p>Unfortunately, your shift pick request has been denied.</p>
            <p>Please contact management if you have any questions.</p>
            <p>Best regards,<br>DineSync Solutions</p>
          `,
        });

        console.log(`Pick ${context.params.pickId} denied - email sent`);
      } catch (error) {
        console.error('Error sending pick denial email:', error);
      }
    }
  });

/**
 * Trigger: Schedule posted
 * Sends email to all employees with their shifts
 */
exports.onSchedulePosted = functions.firestore
  .document('organizations/{orgId}/schedules/{scheduleId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const { orgId } = context.params;

    if (before.status === 'draft' && after.status === 'posted') {
      try {
        // Get all employees
        const employeesSnapshot = await admin
          .firestore()
          .collection('organizations')
          .doc(orgId)
          .collection('employees')
          .get();

        const employees = employeesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Send email to each employee with their shifts
        const emailPromises = employees.map(async (employee) => {
          const employeeShifts = after.shifts.filter(s => s.employeeId === employee.id);

          const shiftsHtml = employeeShifts
            .map(
              shift =>
                `<li>${new Date(shift.startTime).toLocaleDateString()} ${new Date(shift.startTime).toLocaleTimeString()} - ${new Date(shift.endTime).toLocaleTimeString()}</li>`
            )
            .join('');

          return transporter.sendMail({
            to: employee.email,
            subject: '📅 Your Schedule Has Been Posted!',
            html: `
              <h2>Schedule Posted</h2>
              <p>Hi ${employee.name},</p>
              <p>Your schedule for the week of ${new Date(after.weekStart).toLocaleDateString()} has been posted!</p>
              <h3>Your Shifts:</h3>
              <ul>${shiftsHtml || '<li>No shifts scheduled</li>'}</ul>
              <p>Log in to DineSync to view more details or request changes.</p>
              <p>Best regards,<br>DineSync Solutions</p>
            `,
          });
        });

        await Promise.all(emailPromises);
        console.log(`Schedule ${context.params.scheduleId} posted - emails sent to ${employees.length} employees`);
      } catch (error) {
        console.error('Error sending schedule posted emails:', error);
      }
    }
  });

module.exports = {
  onTradeApproved: exports.onTradeApproved,
  onTradeDenied: exports.onTradeDenied,
  onPickApproved: exports.onPickApproved,
  onPickDenied: exports.onPickDenied,
  onSchedulePosted: exports.onSchedulePosted,
};

