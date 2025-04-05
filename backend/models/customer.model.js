import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: false,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',  
        required: true,
    },
    status: {
        type: String,
        enum: ['new', 'old'],
        required: true
    },
    totalReferrals: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
export default Customer
