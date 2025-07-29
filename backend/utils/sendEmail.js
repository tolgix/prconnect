const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

// SendGrid API key ayarla
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// E-posta gönderimi için SendGrid kullan
exports.sendEmail = async (options) => {
  try {
    const msg = {
      to: options.email,
      from: {
        email: process.env.FROM_EMAIL,
        name: process.env.FROM_NAME
      },
      subject: options.subject,
      text: options.message,
      html: options.html || options.message
    };

    const result = await sgMail.send(msg);
    return { success: true, result };
  } catch (error) {
    console.error('SendGrid e-posta gönderim hatası:', error);
    throw new Error('E-posta gönderilemedi');
  }
};

// Toplu e-posta gönderimi
exports.sendBulkEmails = async (emails) => {
  try {
    const messages = emails.map(email => ({
      to: email.to,
      from: {
        email: process.env.FROM_EMAIL,
        name: process.env.FROM_NAME
      },
      subject: email.subject,
      text: email.text,
      html: email.html,
      customArgs: {
        campaignId: email.campaignId,
        contactId: email.contactId
      },
      trackingSettings: {
        clickTracking: {
          enable: true
        },
        openTracking: {
          enable: true
        }
      }
    }));

    const result = await sgMail.send(messages);
    return { success: true, result };
  } catch (error) {
    console.error('Toplu e-posta gönderim hatası:', error);
    throw new Error('Toplu e-posta gönderilemedi');
  }
};

// E-posta şablonu render etme
exports.renderEmailTemplate = (template, variables) => {
  let renderedTemplate = template;
  
  // Değişkenleri replace et
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    renderedTemplate = renderedTemplate.replace(regex, variables[key]);
  });
  
  return renderedTemplate;
};

// Nodemailer alternatifi (geliştirme ortamı için)
exports.sendEmailDev = async (options) => {
  try {
    // Test mail server oluştur
    const transporter = nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });

    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    const info = await transporter.sendMail(message);
    
    console.log('E-posta gönderildi:', info.messageId);
    console.log('Önizleme URL:', nodemailer.getTestMessageUrl(info));
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('E-posta gönderim hatası:', error);
    throw new Error('E-posta gönderilemedi');
  }
};