import nodemailer from "nodemailer";

const sendOtp = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("✅ SMTP server is ready");

    const info = await transporter.sendMail({
      from: `"ChayanAI Labs" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <div style="font-family:sans-serif; padding:20px">
          <h2>Your OTP Code</h2>
          <h1 style="color:#B1123A; letter-spacing:4px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `,
    });

    console.log("📨 EMAIL SENT TO:", email);
    console.log("📦 MESSAGE ID:", info.messageId);
    console.log("📬 ACCEPTED:", info.accepted);
    console.log("❌ REJECTED:", info.rejected);

    if (info.rejected.length > 0) {
      throw new Error("Email rejected by server");
    }

    return info;

  } catch (error) {
    console.error("❌ EMAIL ERROR:", error.message);
    throw error;
  }
};

const sendMail = async (to, subject, html, replyTo = null) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"ChayanAI Labs" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      replyTo: replyTo || process.env.EMAIL_USER, 
    });

    console.log("📨 SUPPORT MAIL SENT:", info.messageId);
    return info;

  } catch (error) {
    console.error("❌ SUPPORT MAIL ERROR:", error.message);
    throw error;
  }
};


export { sendOtp, sendMail };