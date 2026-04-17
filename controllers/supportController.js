import supportModel from "../models/supportModel.js";
import userModel from "../models/userModels.js";
import { sendMail } from "../utils/sendOtp.js";

export const createTicketController = async (req, res) => {
    try {
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).send({
                success: false,
                message: "All fields required",
            });
        }

        console.log("REQ USER:", req.user);

        const dbUser = await userModel.findById(req.user.id || req.user._id);

        if (!dbUser) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        const ticket = await supportModel.create({
            user: dbUser._id,
            email: dbUser.email,
            subject,
            message,
        });

        await sendMail(
            process.env.EMAIL_USER,
            `Support Ticket: ${subject}`,
            `
  <div style="font-family: Inter, Arial, sans-serif; background:#f6f7fb; padding:30px;">
    
    <div style="max-width:600px; margin:auto; background:white; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">
      
      <!-- HEADER -->
      <div style="background:linear-gradient(90deg,#8F0D2F,#B1123A,#D61F4A); padding:20px; color:white;">
        <h2 style="margin:0; font-size:20px;">📩 New Support Ticket</h2>
        <p style="margin:4px 0 0; font-size:12px; opacity:0.9;">
          ChayanAI Support System
        </p>
      </div>

      <!-- BODY -->
      <div style="padding:24px; color:#111827;">
        
        <p style="font-size:14px; color:#6b7280;">
          A user has submitted a support request.
        </p>

        <div style="margin-top:20px; line-height:1.6;">
          <p><strong>👤 User:</strong> ${dbUser.username}</p>
          <p><strong>📧 Email:</strong> ${dbUser.email}</p>
          <p><strong>📝 Subject:</strong> ${subject}</p>
        </div>

        <!-- MESSAGE BOX -->
        <div style="margin-top:20px;">
          <p style="font-weight:600; margin-bottom:8px;">💬 Message</p>
          <div style="background:#f3f4f6; padding:14px; border-radius:10px; color:#374151; font-size:14px;">
            ${message}
          </div>
        </div>

      </div>

      <!-- FOOTER -->
      <div style="padding:16px; text-align:center; font-size:12px; color:#9ca3af; border-top:1px solid #eee;">
        Sent from ChayanAI • Internal Support System
      </div>

    </div>
  </div>
  `,
            dbUser.email
        );
        res.send({
            success: true,
            message: "Support request submitted",
            ticket,
        });

    } catch (error) {
        console.log("SUPPORT ERROR FULL:", error);
        res.status(500).send({ success: false });
    }
};

export const getAllTicketsController = async (req, res) => {
  try {
    const tickets = await supportModel
      .find()
      .sort({ createdAt: -1 })
      .populate("user", "username email");

    res.send({
      success: true,
      tickets,
    });

  } catch (error) {
    console.log("GET TICKETS ERROR:", error);
    res.status(500).send({ success: false });
  }
};