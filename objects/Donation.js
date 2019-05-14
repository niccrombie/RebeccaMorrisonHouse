//Requires
var mongoose = require('mongoose');
var moment = require('moment')

//Schema
var Schema = mongoose.Schema;

//Object
var DonationSchema = new Schema({
    guest: {type: Schema.Types.ObjectId, ref: 'Person'},
    donationType: {type: String, max: 10},
    donationDate: {type: Date, },
    donationAmount: {type: Number, },
    adoptionDate: {type: Date, },
    adoptionMessage: {type: String, },    
});

//Virtuals

DonationSchema
.virtual('url')
.get(function(){
    return '/users/Donation/' + this._id;
});

DonationSchema
.virtual('name')
.get(function(){
    return this.guest.name;
});

DonationSchema
.virtual('donationDate1')
.get(function(){
    return moment(this.donationDate).format('ll')
});

//Export for mongoose
module.exports = mongoose.model('Donation', DonationSchema);