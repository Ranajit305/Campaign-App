import jwt from 'jsonwebtoken'

const generateToken = (companyId, res) => {
    try {
        const token = jwt.sign({ companyId }, process.env.JWT_SECRET);

        res.cookie('jwt', token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict'
        })
    } catch (error) {
        console.log("JWT Error: ", error.message);
    }
}

export default generateToken