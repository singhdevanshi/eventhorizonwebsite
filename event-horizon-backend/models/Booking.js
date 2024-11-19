const bookingSchema = mongoose.Schema({
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    seats: {
      type: Number,
      required: true
    },
    name: String,
    email: String,
    tickets: Number,
    // Other fields as needed
  });
  