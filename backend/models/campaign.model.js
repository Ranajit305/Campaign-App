import mongoose from 'mongoose'

const campaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    reward: {
        customerReward: {
            type: String,
            default: ''
        },
        referredReward: {
            type: String,
            default: ''
        }
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active',
    },
    activePeriod: {
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true, 
        },
    },
    newCustomers: {
        type: Number,
        default: 0
    },
    totalReferrals: {
        type: Number,
        default: 0, 
    }
});

const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);
export default Campaign