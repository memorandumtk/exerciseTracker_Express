const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ExerciseSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true, maxLenght: 100 },
    duration: { type: Number, required: true, maxLenght: 100 },
    date: { type: Date, default: Date.now }, //default is gonna be current time
})

ExerciseSchema.virtual("date_string").get(function () {
    return (this.date)
    ? (this.date).toDateString() // format 'Day YYYY MM DD'
    : '';
});


module.exports = mongoose.model("Exercise", ExerciseSchema);
