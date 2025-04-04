import jwt from 'jsonwebtoken'
import Company from '../models/company.model.js'

const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        const company = await Company.findById(decoded.companyId).select("-password");
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }
        
        req.company = company;
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export default verifyToken