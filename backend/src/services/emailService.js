const nodemailer = require('nodemailer');

let transporter;

const initializeEmailService = () => {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async (to, subject, htmlContent) => {
  try {
    if (!transporter) {
      initializeEmailService();
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: htmlContent,
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

const sendShiftNotification = async (email, employeeName, shiftDetails) => {
  const htmlContent = `
    <h2>Shift Assignment</h2>
    <p>Hi ${employeeName},</p>
    <p>You have been assigned a new shift:</p>
    <ul>
      <li><strong>Date:</strong> ${new Date(shiftDetails.startTime).toLocaleDateString()}</li>
      <li><strong>Start Time:</strong> ${new Date(shiftDetails.startTime).toLocaleTimeString()}</li>
      <li><strong>End Time:</strong> ${new Date(shiftDetails.endTime).toLocaleTimeString()}</li>
      <li><strong>Role:</strong> ${shiftDetails.role}</li>
    </ul>
    <p>Please confirm your availability.</p>
  `;

  return sendEmail(email, 'New Shift Assignment', htmlContent);
};

const sendTradeRequest = async (email, employeeName, tradeDetails) => {
  const htmlContent = `
    <h2>Shift Trade Request</h2>
    <p>Hi ${employeeName},</p>
    <p>An employee has requested to trade a shift with you.</p>
    <p><a href="${process.env.WEB_URL}/trades/${tradeDetails.tradeId}">View Trade Request</a></p>
  `;

  return sendEmail(email, 'Shift Trade Request', htmlContent);
};

const sendApprovalNotification = async (email, employeeName, approved, reason) => {
  const status = approved ? 'Approved' : 'Denied';
  const htmlContent = `
    <h2>Trade Request ${status}</h2>
    <p>Hi ${employeeName},</p>
    <p>Your shift trade request has been <strong>${status.toLowerCase()}</strong>.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
  `;

  return sendEmail(email, `Trade Request ${status}`, htmlContent);
};

const sendDailyManagerSummary = async (email, managerName, summary) => {
  const htmlContent = `
    <h2>Daily Manager Summary</h2>
    <p>Hi ${managerName},</p>
    <h3>Pending Requests</h3>
    <p>${summary.pendingRequests} pending shift trades</p>
    <h3>Upcoming Shifts</h3>
    <p>${summary.upcomingShifts} shifts scheduled for today</p>
    <h3>Order Statistics</h3>
    <ul>
      <li>Total Orders: ${summary.totalOrders}</li>
      <li>Revenue: $${summary.totalRevenue.toFixed(2)}</li>
    </ul>
  `;

  return sendEmail(email, 'Daily Manager Summary', htmlContent);
};

const sendInviteEmail = async (email, inviteLink, organizationName) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to ${organizationName}!</h2>
      <p style="color: #666; font-size: 16px;">
        You've been invited to join our restaurant management system.
      </p>
      <p style="color: #666; font-size: 16px;">
        Click the button below to accept the invite and create your account:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Accept Invite
        </a>
      </div>
      <p style="color: #999; font-size: 12px;">
        Or copy and paste this link: ${inviteLink}
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        This invite will expire in 7 days.
      </p>
    </div>
  `;

  return sendEmail(email, `Invitation to join ${organizationName}`, htmlContent);
};

const sendMenuItemNotificationEmail = async (employeeEmail, employeeName, menuItem, organizationName) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Menu Item Added!</h2>
      <p style="color: #666; font-size: 16px;">
        Hi ${employeeName},
      </p>
      <p style="color: #666; font-size: 16px;">
        A new menu item has been added to ${organizationName}:
      </p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">${menuItem.name}</h3>
        <p style="color: #666; margin: 10px 0;">
          <strong>Price:</strong> $${menuItem.price.toFixed(2)}
        </p>
        <p style="color: #666; margin: 10px 0;">
          <strong>Category:</strong> ${menuItem.category}
        </p>
        ${menuItem.description ? `<p style="color: #666; margin: 10px 0;"><strong>Description:</strong> ${menuItem.description}</p>` : ''}
        ${menuItem.components && menuItem.components.length > 0 ? `
          <p style="color: #666; margin: 10px 0;">
            <strong>Components:</strong>
            <ul style="margin: 5px 0; padding-left: 20px;">
              ${menuItem.components.map(c => `<li>${c.name} (${c.station})</li>`).join('')}
            </ul>
          </p>
        ` : ''}
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Log in to Easy One to see all menu items.
      </p>
    </div>
  `;

  return sendEmail(employeeEmail, `New Menu Item: ${menuItem.name}`, htmlContent);
};

module.exports = {
  initializeEmailService,
  sendEmail,
  sendShiftNotification,
  sendTradeRequest,
  sendApprovalNotification,
  sendDailyManagerSummary,
  sendInviteEmail,
  sendMenuItemNotificationEmail,
};

