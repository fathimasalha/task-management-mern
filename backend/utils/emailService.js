const nodemailer = require('nodemailer');

const createTransporter = () => {
  const isConfigured = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

  if (isConfigured) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Return mock logger transporter if credentials not configured
  return {
    sendMail: async (options) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`[EmailService (Simulation Mode)] To: ${options.to}`);
      console.log(`[Subject]: ${options.subject}`);
      console.log(`[Preview]: Email successfully triggered for event.`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return { messageId: 'simulated-' + Date.now() };
    },
  };
};

const transporter = createTransporter();

/**
 * Sends a welcome email upon user registration
 */
const sendWelcomeEmail = async (user) => {
  try {
    const fromAddress = process.env.EMAIL_FROM || '"TaskFlow App" <no-reply@taskflow.app>';
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 24px; border-radius: 8px; text-align: center; color: white; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Welcome to TaskFlow!</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 15px;">Your productivity workspace is ready</p>
        </div>
        <p style="font-size: 16px; color: #334155;">Hello <strong>${user.name}</strong>,</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Thank you for registering on TaskFlow. You can now create, prioritize, attach documents to your tasks, track deadlines, and monitor real-time weather at your task locations.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background-color: #4f46e5; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">Open Dashboard</a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">TaskFlow Productivity App &bull; Powered by MERN Stack</p>
      </div>
    `;

    await transporter.sendMail({
      from: fromAddress,
      to: user.email,
      subject: `Welcome to TaskFlow, ${user.name}! 🚀`,
      html: htmlContent,
    });
  } catch (error) {
    console.error('[EmailService] Welcome email error:', error.message);
  }
};

/**
 * Sends a task creation confirmation email
 */
const sendTaskCreatedEmail = async (user, task) => {
  try {
    const fromAddress = process.env.EMAIL_FROM || '"TaskFlow App" <no-reply@taskflow.app>';
    const dueDateFormatted = task.dueDate
      ? new Date(task.dueDate).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'No due date set';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #1e293b; font-size: 20px;">📝 Task Created: ${task.title}</h2>
        </div>
        <p style="font-size: 15px; color: #334155;">Hello <strong>${user.name}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.5;">Your new task has been recorded in your task dashboard:</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #0f172a;">${task.title}</p>
          ${task.description ? `<p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b;">${task.description}</p>` : ''}
          <div style="font-size: 13px; color: #475569; display: grid; gap: 6px;">
            <div><strong>Priority:</strong> <span style="color: ${task.priority === 'HIGH' || task.priority === 'URGENT' ? '#ef4444' : '#3b82f6'}; font-weight: 600;">${task.priority}</span></div>
            <div><strong>Status:</strong> ${task.status}</div>
            <div><strong>Due Date:</strong> ${dueDateFormatted}</div>
            ${task.location ? `<div><strong>Location:</strong> 📍 ${task.location}</div>` : ''}
            ${task.fileUrl ? `<div><strong>Attachment:</strong> <a href="${task.fileUrl}" style="color: #4f46e5;">View Attached File</a></div>` : ''}
          </div>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background-color: #4f46e5; color: white; padding: 10px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">View Task on Dashboard</a>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: fromAddress,
      to: user.email,
      subject: `[TaskFlow] Task Created: ${task.title}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error('[EmailService] Task created email error:', error.message);
  }
};

/**
 * Sends a task completion notification email
 */
const sendTaskCompletedEmail = async (user, task) => {
  try {
    const fromAddress = process.env.EMAIL_FROM || '"TaskFlow App" <no-reply@taskflow.app>';
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="background-color: #ecfdf5; border: 1px solid #10b981; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px;">🎉</span>
          <h2 style="margin: 8px 0 0 0; color: #065f46; font-size: 20px;">Task Marked as Completed!</h2>
        </div>
        <p style="font-size: 15px; color: #334155;">Awesome job, <strong>${user.name}</strong>!</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.5;">You've successfully completed the following task:</p>

        <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #0f172a; text-decoration: line-through;">${task.title}</p>
          <p style="margin: 0; font-size: 13px; color: #64748b;">Completed on: ${new Date().toLocaleString()}</p>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background-color: #10b981; color: white; padding: 10px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Go to Dashboard</a>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: fromAddress,
      to: user.email,
      subject: `✅ Task Completed: ${task.title}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error('[EmailService] Task completed email error:', error.message);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendTaskCreatedEmail,
  sendTaskCompletedEmail,
};
