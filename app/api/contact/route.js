import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    // Create a transporter with your SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email, // Send to the email provided in the form
      subject: `Confirmation de votre message - Cassiopée`,
      text: `Bonjour ${name},\n\nNous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.\n\nVotre message:\n${message}\n\nCordialement,\nL'équipe Cassiopée`,
      html: `
        <div>
          <h2>Confirmation de réception</h2>
          <p>Bonjour ${name},</p>
          <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
          <h3>Votre message:</h3>
          <p>${message}</p>
          <p>Cordialement,<br/>L'équipe Cassiopée</p>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Email envoyé avec succès' 
    });
  } catch (error) {
    console.error('Erreur d\'envoi d\'email:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
}