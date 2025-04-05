import Customer from '../models/customer.model.js';
import Company from '../models/company.model.js';
import nodemailer from 'nodemailer';
import 'dotenv/config'

export const addCustomers = async (req, res) => {
    try {
        const { customers } = req.body;
        const company = req.company;

        // 1. Validate and normalize input data
        const validatedCustomers = customers.map(customer => ({
            name: customer.name,
            email: customer.email.toLowerCase().trim(),
            totalReferrals: Number(customer.totalReferrals) || 0,
            company: company._id,
            status: 'old',
        }));

        // // 2. Find existing emails for this company
        const existingEmails = await Customer.find({
            company: company._id,
            email: { $in: validatedCustomers.map(c => c.email) }
        }).distinct('email');

        // // 3. Filter out duplicates
        const customersToAdd = validatedCustomers.filter(
            c => !existingEmails.includes(c.email)
        );

        if (customersToAdd.length === 0) {
            return res.status(400).json({
                success: true,
                message: 'Customers already exists'
            });
        }

        const totalReferralsAdded = customersToAdd.reduce(
            (sum, c) => sum + c.totalReferrals, 0
        );

        await Promise.all([
            Customer.insertMany(customersToAdd),
            Company.findByIdAndUpdate(
                company._id,
                {
                    $inc: {
                        totalCustomers: customersToAdd.length,
                        totalReferrals: totalReferralsAdded
                    }
                },
                { new: true }
            )
        ]);

        const finalCustomers = customersToAdd.map(customer => ({
            ...customer,
            createdAt: new Date().toISOString()
        }));
        res.status(200).json({ success: true, finalCustomers });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllCustomers = async (req, res) => {
    try {
        const companyId = req.company._id;
        const customers = await Customer.find({ company: companyId });

        res.status(200).json({ success: true, customers });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch customers', error: error.message });
    }
};

export const sendMail = async (req, res) => {
    try {
        const { title, type, email, msg } = req.body;
        let recipients = [];

        if (type === 'single' && email === '') {
            return res.status(400).json({ success: false, message: 'Email not Found' })
        }

        // Case 1: Single recipient
        if (type === 'single') {
            recipients = [email];
        }
        // Case 2: All customers
        else if (type === "all") {
            const allCustomers = await Customer.find({}, "email");
            recipients = allCustomers.map(cust => cust.email);
        }
        // Case 3: Only loyal customers
        else if (type === "loyal") {
            const loyalCustomers = await Customer.find({ totalReferrals: { $gte: 10 } }, "email");
            recipients = loyalCustomers.map(cust => cust.email);
        }
        sendCustomerEmails(recipients, title, msg);
        res.status(200).json({ success: true, message: 'Emails Sent' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const sendCustomerEmails = async (recipients, title, msg) => {
    try {
        // Set up Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const emailPromises = recipients.map((email) => {
            return transporter.sendMail({
                from: `"Company" <${process.env.EMAIL}>`,
                to: email,
                subject: title,
                html: `
            <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9; border-radius: 10px; border: 1px solid #e0e0e0;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #4F46E5;">${title}</h2>
                </div>
                <div style="font-size: 16px; color: #333;">
                    <p>Hi there,</p>
                    <p>${msg}</p>
                    <p style="margin-top: 20px;">Best regards,<br><strong>Company Team</strong></p>
                </div>
                <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #888;">
                    <p>You're receiving this email because you're a valued customer of our service.</p>
                    <p>If you have any questions, feel free to contact us at <a href="mailto:support@company.com" style="color: #4F46E5;">support@company.com</a></p>
                </div>
            </div>
        `,
            });
        });


        await Promise.all(emailPromises);
        console.log('Emails sent successfully!');
    } catch (error) {
        console.error('Failed to send emails:', error);
    }
};

