import Company from './../models/company.model.js'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import generateToken from '../utils/generateToken.js';

export const checkCompany = async (req, res) => {
    try {
        const company = req.company;
        res.status(200).json(company);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All Fields Required' })
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid Email' })
        }

        const isCompany = await Company.findOne({ email })
        if (isCompany) {
            return res.status(400).json({ success: false, message: 'Company already exists' })
        }

        if (password.length < 5) {
            return res.status(400).json({ success: false, message: 'Weak Password' })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const company = new Company({
            name,
            email,
            password: hashedPassword
        })
        await company.save();

        company.password = undefined;
        generateToken(company._id, res);
        res.status(200).json({ success: true, company, message: 'Welcome to Campagin' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'All Fields Required' })
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({success: false, message: 'Invalid Email'})
        }

        const company = await Company.findOne({ email });
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not Found' })
        }

        const isPassword = await bcrypt.compare(password, company.password);
        if (!isPassword) {
            return res.status(400).json({ success: false, message: 'Incorrect Password' })
        }

        company.password = undefined;
        generateToken(company._id, res);
        res.status(200).json({ success: true, company, message: 'Welcome Back' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('jwt', { maxAge: 0 });
        res.status(200).json({ success: true, message: 'Logged Out' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const dashboard = async (req, res) => {
    try {
        
    } catch (error) {

    }
}