import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'your_service_id';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'your_template_id';
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'your_public_key';

// Initialize EmailJS
export const initEmailJS = () => {
  emailjs.init(EMAILJS_PUBLIC_KEY);
};

// Email template parameters interface
interface BoardInvitationEmailParams {
  to_email: string;
  to_name: string;
  from_name: string;
  from_email: string;
  board_title: string;
  board_role: string;
  invitation_link: string;
  expires_date: string;
  [key: string]: unknown; // Add index signature for EmailJS compatibility
}

// Send board invitation email
export const sendBoardInvitationEmail = async (params: {
  inviteeEmail: string;
  inviteeName: string;
  inviterName: string;
  inviterEmail: string;
  boardTitle: string;
  role: string;
  invitationToken: string;
  expiresAt: Date;
}): Promise<boolean> => {
  try {
    // Check if EmailJS is properly configured
    console.log('🔧 EmailJS Configuration Check:');
    console.log('Service ID:', EMAILJS_SERVICE_ID);
    console.log('Template ID:', EMAILJS_TEMPLATE_ID);
    console.log('Public Key:', EMAILJS_PUBLIC_KEY ? 'Set' : 'Missing');
    
    if (EMAILJS_SERVICE_ID === 'your_service_id' || 
        EMAILJS_TEMPLATE_ID === 'your_template_id' || 
        EMAILJS_PUBLIC_KEY === 'your_public_key') {
      console.warn('⚠️ EmailJS not configured - using default placeholder values');
      console.log('📧 Email would be sent to:', params.inviteeEmail);
      console.log('📧 Board:', params.boardTitle);
      console.log('📧 Role:', params.role);
      return false;
    }

    // Initialize EmailJS if not already done
    initEmailJS();

    // Create invitation link
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const invitationLink = `${baseUrl}/invite/${params.invitationToken}`;

    // Prepare email parameters
    const emailParams: BoardInvitationEmailParams = {
      to_email: params.inviteeEmail,
      to_name: params.inviteeName || params.inviteeEmail.split('@')[0],
      from_name: params.inviterName,
      from_email: params.inviterEmail,
      board_title: params.boardTitle,
      board_role: params.role,
      invitation_link: invitationLink,
      expires_date: params.expiresAt.toLocaleDateString()
    };

    console.log('📧 Sending invitation email with params:', emailParams);

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      emailParams
    );

    console.log('✅ Email sent successfully:', response);
    return true;

  } catch (error) {
    console.error('❌ Failed to send invitation email:');
    console.error('Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Check if it's a specific EmailJS error
    if (error && typeof error === 'object' && 'text' in error) {
      console.error('EmailJS error text:', (error as any).text);
    }
    if (error && typeof error === 'object' && 'status' in error) {
      console.error('EmailJS error status:', (error as any).status);
    }
    
    return false;
  }
};

// Fallback: Generate email content for manual sending
export const generateInvitationEmailContent = (params: {
  inviteeName: string;
  inviterName: string;
  inviterEmail: string;
  boardTitle: string;
  role: string;
  invitationToken: string;
  expiresAt: Date;
}) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const invitationLink = `${baseUrl}/invite/${params.invitationToken}`;

  const subject = `You're invited to join "${params.boardTitle}" on Trello Clone`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Board Invitation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0079bf; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .button { 
          display: inline-block; 
          background: #0079bf; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
        }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Board Invitation</h1>
        </div>
        
        <div class="content">
          <h2>Hi ${params.inviteeName}!</h2>
          
          <p><strong>${params.inviterName}</strong> has invited you to collaborate on the board <strong>"${params.boardTitle}"</strong>.</p>
          
          <p>You've been invited as a <strong>${params.role}</strong>, which means you can:</p>
          
          ${params.role === 'admin' ? `
            <ul>
              <li>✅ View and edit all content</li>
              <li>✅ Manage board members</li>
              <li>✅ Change board settings</li>
              <li>✅ Delete the board</li>
            </ul>
          ` : params.role === 'member' ? `
            <ul>
              <li>✅ View and edit all content</li>
              <li>✅ Create and manage cards</li>
              <li>✅ Comment and collaborate</li>
              <li>❌ Manage board members</li>
            </ul>
          ` : `
            <ul>
              <li>✅ View all content</li>
              <li>✅ Comment on cards</li>
              <li>❌ Edit or create content</li>
              <li>❌ Manage board members</li>
            </ul>
          `}
          
          <div style="text-align: center;">
            <a href="${invitationLink}" class="button">Accept Invitation</a>
          </div>
          
          <p><small>This invitation expires on ${params.expiresAt.toLocaleDateString()}.</small></p>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 3px;">
            ${invitationLink}
          </p>
        </div>
        
        <div class="footer">
          <p>This invitation was sent by ${params.inviterName} (${params.inviterEmail})</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Hi ${params.inviteeName}!

${params.inviterName} has invited you to collaborate on the board "${params.boardTitle}".

You've been invited as a ${params.role}.

To accept this invitation, click the link below:
${invitationLink}

This invitation expires on ${params.expiresAt.toLocaleDateString()}.

If you didn't expect this invitation, you can safely ignore this email.

---
This invitation was sent by ${params.inviterName} (${params.inviterEmail})
  `;

  return {
    subject,
    html: htmlContent,
    text: textContent,
    link: invitationLink
  };
}; 