import mongoose from 'mongoose'

const referralSchema = new mongoose.Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',  
        required: true,
    },
    referredToEmail: {
        type: String,
        required: true, 
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    reward: {
        type: String,
        default: ''
    }
});

const Referral = mongoose.models.Referral || mongoose.model('Referral', referralSchema);
export default Referral
