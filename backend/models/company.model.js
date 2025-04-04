import mongoose from 'mongoose'

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    totalCampaigns: {
        type: Number,
        default: 0,
    },
    totalReferrals: {
        type: Number,
        default: 0, 
    },
    newCustomers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer'
        },
    ],
    totalCustomers: {
        type: Number,
        default: 0,
    }
}, { timestamps: true })

const Company = mongoose.models.Company || mongoose.model('Company', companySchema);
export default Company