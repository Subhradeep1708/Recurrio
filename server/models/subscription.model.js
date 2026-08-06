import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subscription Name is required'],
        trim: true,
        minLength: 2,
        maxLength: 100
    },
    price: {
        type: Number,
        required: [true, 'Subscription Price is required'],
        min: [0, 'Price must be greater than 0']
    },
    currency: {
        type: String,
        enum: ['INR', 'USD', 'EUR', 'GBP'],
        default: 'USD'
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: [true, "Frequency is required"]
    },
    category: {
        type: String,
        enum: ['sports', 'news', 'entertainment', 'lifestyle', 'technology', 'finance', 'politics', 'other'],
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'expired'],
        default: 'active'
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: (value) => value <= new Date(),
            message: 'Start date must be in the past'
        }
    },
    renewalDate: {
        type: Date,
        validate: {
            validator: function (value) {
                if (!value) return true;
                return value > this.startDate;
            },
            message: 'Renewal date must be after the start date.'
        }

    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

}, { timestamps: true })


// auto calculate the renewal date if not provided
subscriptionSchema.pre('save', function (next) {
    if (this.isNew || this.isModified("startDate") || this.isModified("frequency")) {
        const renewalDate = new Date(this.startDate);

        switch (this.frequency) {
            case "daily":
                renewalDate.setDate(renewalDate.getDate() + 1);
                break;

            case "weekly":
                renewalDate.setDate(renewalDate.getDate() + 7);
                break;

            case "monthly":
                renewalDate.setMonth(renewalDate.getMonth() + 1);
                break;

            case "yearly":
                renewalDate.setFullYear(renewalDate.getFullYear() + 1);
                break;
        }

        this.renewalDate = renewalDate;
    }

    //  auto-update the status if renewal date has passed
    const today = new Date();

    if (
        this.status !== "cancelled" &&
        this.renewalDate &&
        this.renewalDate < today
    ) {
        this.status = "expired";
    }

    next()
})



const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription