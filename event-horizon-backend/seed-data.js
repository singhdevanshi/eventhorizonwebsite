const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

const Activity = mongoose.model('activity', new mongoose.Schema({
  title: String,
  date: String,
  location: String,
  price: String,
}, { timestamps: true }));

const activityData = [
  { title: "Food Photography Workshop", date: "Sun, 24 Nov", location: "Sumit Photo World, Studio Setup", price: "INR 5.0k" },
  { title: "Palette Knife & Brush Painting Workshop", date: "Sat, 09 Nov", location: "Doolally Taproom - Koregaon Park", price: "INR 1.6k" },
  { title: "Sitare Showtime - Qulling Workshop", date: "Sun, 17 Nov", location: "Cohive Studio, Bund Garden Road", price: "INR 499" },
  { title: "Startup Mixer (Pune)", date: "Sat, 23 Nov", location: "Baner" },
  { title: "WORLD OF STREE", date: "Sun, 10 Nov", location: "Near Shivaji Maharaj Statue, Karve Road" },
  { title: "Radhe Radhe - Stand Up Solo by Rahul Robin", date: "Sun, 01 Dec", location: "Saloni, Fergusson College Road" },
  { title: "Canvas Painting", date: "Sat, 09 Nov", location: "1201-A/4, Shivajinagar, Pune" },
  { title: "Bottle Painting", date: "Sat, 09 Nov", location: "1201-A/4, Shivajinagar, Pune" },
  { title: "Pune City Cyclothon 2024", date: "Sun, 01 Dec", location: "Royal Heritage Mall", price: "INR 799" },
  { title: "Experiential Workshop 2024", date: "Sat, 30 Nov", location: "Bougainvillea Farms", price: "Free" },
  { title: "Dixit Lifestyle® Half Marathon", date: "Sun, 17 Nov", location: "Nehru Stadium, Pune" },
  { title: "Yoga With Fur-babies", date: "Sun, 10 Nov", location: "Nyati Empress, Viman Nagar" },
  { title: "Nature Photography Workshop", date: "Sun, 10 Nov", location: "Vetal Tekdi", price: "INR 300" },
  { title: "Birds Photography Workshop", date: "Sun, 15 Dec", location: "Sinhagad Valley", price: "INR 1.2k" },
  { title: "Street Photography Workshop", date: "Sun, 17 Nov", location: "Mandai Market" },
  { title: "SCC Picnic Cinema - Yeh Jawaani Hai Deewani", date: "Sun, 10 Nov", location: "Republic Restaurant, Koregaon Park" },
  { title: "Shivaji Nagar Food Walk by PFW", date: "Sun, 10 Nov", location: "Joshi Wadewale", price: "INR 200" }
];

async function seedActivityData() {
  try {
    await Activity.insertMany(activityData);
    console.log("Activity data seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.log("Error seeding activity data:", error);
    mongoose.connection.close();
  }
}

seedActivityData();
