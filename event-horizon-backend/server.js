require('dotenv').config();
console.log('Environment check:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('Email:', process.env.EMAIL_USER);
console.log('Password:', process.env.EMAIL_PASS);


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 10000,  // Timeout to establish initial connection
  socketTimeoutMS: 45000    // Socket timeout to prevent abrupt disconnection
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Root route for testing
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  interests: { type: [String], default: [] }, // New field for interests
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Using Gmail service
  auth: {
    user: process.env.EMAIL_USER,  // Make sure you have this in your .env file
    pass: process.env.EMAIL_PASS,  // Make sure you have this in your .env file
  },
});

// Define your email sending route
app.post('/send-email', async (req, res) => {
  // Email details
  const mailOptions = {
    from: process.env.EMAIL_USER,  // Sender email from your .env file
    to: 'devanshi075@gmail.com',  // Replace with the actual destination email
    subject: 'Booking Confirmation',
    text: 'Your booking is confirmed!',  // Customize your email content here
  };

  // Try to send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    res.send('Booking confirmation email sent!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Failed to send email.');
  }
});


// Helper Functions
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const sendVerificationEmail = async (email, token) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h2>Email Verification</h2>
        <p>Click the link below to verify your email:</p>
        <a href="http://localhost:5000/verify-email?token=${token}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send verification email');
  }
};

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    req.user = decoded;
    next();
  });
};

// Event Schemas
const movieSchema = new mongoose.Schema({}, { strict: false });
const Movie = mongoose.model('movies', movieSchema);

const musicSchema = new mongoose.Schema({}, { strict: false });
const Music = mongoose.model('music', musicSchema);

const sportsSchema = new mongoose.Schema({
  title: String,
  date: String,
  location: String,
  price: String,
}, { timestamps: true });
const Sports = mongoose.model('sports', sportsSchema);

const comedySchema = new mongoose.Schema({
  title: String,
  date: String,
  location: String,
  price: String,
}, { timestamps: true });
const Comedy = mongoose.model('comedy', comedySchema);

const theatreSchema = new mongoose.Schema({
  title: String,
  date: String,
  location: String,
  price: String,
}, { timestamps: true });
const Theatre = mongoose.model('theatre', theatreSchema);

const activitySchema = new mongoose.Schema({
  title: String,
  date: String,
  location: String,
  price: String,
}, { timestamps: true });
const Activity = mongoose.model('activity', activitySchema);

// Booking Schema
const BookingSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['movie', 'music', 'sports', 'comedy', 'theatre', 'activity']
  },
  name: String,
  email: String,
  phone: String,
  seats: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Booking = mongoose.model('Booking', BookingSchema);

// Authentication Routes
app.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword
    });

    await user.save();
    const token = generateToken(user._id);
    await sendVerificationEmail(email, token);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification.'
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

app.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before signing in',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      success: true,
      message: 'Sign in successful',
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Sign in failed. Please try again.',
    });
  }
});

app.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token'
    });
  }
});

// Event Routes
app.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.find();
    console.log("Movies fetched from DB:", movies);  // Check if movies are being fetched
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Error fetching movies' });
  }
});

app.get('/music', async (req, res) => {
  try {
    const musicEvents = await Music.find();
    res.json(musicEvents);
  } catch (error) {
    console.error('Error fetching music events:', error);
    res.status(500).json({ message: 'Error fetching music events' });
  }
});

app.get('/sports', async (req, res) => {
  try {
    const sportsEvents = await Sports.find();
    res.json(sportsEvents);
  } catch (error) {
    console.error('Error fetching sports events:', error);
    res.status(500).json({ message: 'Error fetching sports events' });
  }
});

app.get('/comedy', async (req, res) => {
  try {
    const comedyEvents = await Comedy.find();
    res.json(comedyEvents);
  } catch (error) {
    console.error('Error fetching comedy events:', error);
    res.status(500).json({ message: 'Error fetching comedy events' });
  }
});

app.get('/theatre', async (req, res) => {
  try {
    const theatreEvents = await Theatre.find();
    res.json(theatreEvents);
  } catch (error) {
    console.error('Error fetching theatre events:', error);
    res.status(500).json({ message: 'Error fetching theatre events' });
  }
});

app.get('/activities', async (req, res) => {
  try {
    const activities = await Activity.find();
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Error fetching activities' });
  }
});

// Email confirmation for booking
const sendConfirmationEmail = async (email, eventDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Booking Confirmation for ${eventDetails.title}`,
    html: `
      <h2>Booking Confirmation</h2>
      <p>Thank you for booking with us! Here are your booking details:</p>
      <ul>
        <li>Event: ${eventDetails.title}</li>
        <li>Date: ${eventDetails.date}</li>
        <li>Location: ${eventDetails.location}</li>
        <li>Seats: ${eventDetails.seats}</li>
      </ul>
      <p>We look forward to seeing you there!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};

// Booking Routes
app.post('/book-event', async (req, res) => {
  try {
    const { eventId, eventType, name, email, phone, seats } = req.body;

    // Validate the event exists based on type
    let EventModel;
    switch(eventType) {
      case 'movie':
        EventModel = Movie;
        break;
      case 'music':
        EventModel = Music;
        break;
      case 'sports':
        EventModel = Sports;
        break;
      case 'comedy':
        EventModel = Comedy;
        break;
      case 'theatre':
        EventModel = Theatre;
        break;
      case 'activity':
        EventModel = Activity;
        break;
      default:
        return res.status(400).json({ message: 'Invalid event type' });
    }

    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Create booking
    const booking = new Booking({
      eventId,
      eventType,
      name,
      email,
      phone,
      seats
    });

    await booking.save();

    // Send confirmation email
    await sendConfirmationEmail(email, {
      title: event.title || event.mainMovie,
      date: event.date,
      location: event.location,
      seats,
    });

    res.status(200).json({
      success: true,
      message: 'Booking successful!',
      booking
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process booking. Please try again.'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
