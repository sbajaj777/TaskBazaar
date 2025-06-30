


## Customer Schema

```javascript
const customerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  role: { type: String, default: 'Customer' },
  name: { type: String },
  contactInfo: { type: String },
  location: {
    city: { type: String },
    area: { type: String }
  },
  favoriteProviders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }]
});
```




## Provider Schema

```javascript
const providerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  role: { type: String, default: 'Provider' },
  name: { type: String, required: true },
  contactInfo: { type: String },
  location: {
    city: { type: String, required: true },
    area: { type: String, required: true }
  },
  servicesOffered: [{ type: String }], // e.g., ['plumber', 'electrician']
  pricing: [{
    service: { type: String },
    price: { type: Number },
    description: { type: String }
  }],
  profilePicture: { type: String },
  sampleWorkPhotos: [{ type: String }],
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isSubscribed: { type: Boolean, default: false },
  subscriptionEndDate: { type: Date }
});
```




## Service Schema

```javascript
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }
});
```




## Booking Schema

```javascript
const bookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  service: { type: String, required: true },
  bookingDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  price: { type: Number },
  description: { type: String }
});
```




## Review Schema

```javascript
const reviewSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  reviewDate: { type: Date, default: Date.now }
});
```




## Chat Schema

```javascript
const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, refPath: 'onModel' }],
  onModel: { type: String, required: true, enum: ['Customer', 'Provider'] },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'onModel' },
    onModel: { type: String, required: true, enum: ['Customer', 'Provider'] },
    content: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
});
```



