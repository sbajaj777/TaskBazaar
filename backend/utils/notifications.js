const { sendEmail } = require('./email');

// Firebase admin (placeholder - would need actual Firebase setup)
const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    // This is a placeholder implementation
    // In a real app, you would use Firebase Admin SDK
    console.log('Push notification sent:', {
      userId,
      title,
      body,
      data
    });
    
    // Placeholder for Firebase implementation:
    /*
    const admin = require('firebase-admin');
    
    // Get user's FCM token from database
    const userToken = await getUserFCMToken(userId);
    
    if (userToken) {
      const message = {
        notification: {
          title,
          body
        },
        data,
        token: userToken
      };
      
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
      return true;
    }
    */
    
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

// Send booking notification
const sendBookingNotification = async (type, booking, customer, provider) => {
  try {
    const notifications = {
      'booking_created': {
        customer: {
          email: {
            subject: 'Booking Confirmation',
            body: `
              <h2>Booking Confirmation</h2>
              <p>Your booking request has been submitted successfully:</p>
              <ul>
                <li><strong>Provider:</strong> ${provider.name}</li>
                <li><strong>Service:</strong> ${booking.service}</li>
                <li><strong>Date:</strong> ${booking.bookingDate.toLocaleDateString()}</li>
                <li><strong>Status:</strong> Pending confirmation</li>
              </ul>
              <p>The provider will contact you soon to confirm the booking.</p>
            `
          },
          push: {
            title: 'Booking Submitted',
            body: `Your booking with ${provider.name} has been submitted.`
          }
        },
        provider: {
          email: {
            subject: 'New Booking Request',
            body: `
              <h2>New Booking Request</h2>
              <p>You have received a new booking request:</p>
              <ul>
                <li><strong>Customer:</strong> ${customer.name || customer.email}</li>
                <li><strong>Service:</strong> ${booking.service}</li>
                <li><strong>Date:</strong> ${booking.bookingDate.toLocaleDateString()}</li>
                <li><strong>Price:</strong> ${booking.price ? `₹${booking.price}` : 'To be discussed'}</li>
              </ul>
              <p>Please log in to your account to manage this booking.</p>
            `
          },
          push: {
            title: 'New Booking Request',
            body: `${customer.name || 'A customer'} has requested a booking for ${booking.service}.`
          }
        }
      },
      'booking_confirmed': {
        customer: {
          email: {
            subject: 'Booking Confirmed',
            body: `
              <h2>Booking Confirmed</h2>
              <p>Great news! Your booking has been confirmed:</p>
              <ul>
                <li><strong>Provider:</strong> ${provider.name}</li>
                <li><strong>Service:</strong> ${booking.service}</li>
                <li><strong>Date:</strong> ${booking.bookingDate.toLocaleDateString()}</li>
              </ul>
              <p>The provider will contact you soon with further details.</p>
            `
          },
          push: {
            title: 'Booking Confirmed',
            body: `Your booking with ${provider.name} has been confirmed!`
          }
        }
      },
      'booking_completed': {
        customer: {
          email: {
            subject: 'Service Completed',
            body: `
              <h2>Service Completed</h2>
              <p>Your service has been marked as completed:</p>
              <ul>
                <li><strong>Provider:</strong> ${provider.name}</li>
                <li><strong>Service:</strong> ${booking.service}</li>
                <li><strong>Date:</strong> ${booking.bookingDate.toLocaleDateString()}</li>
              </ul>
              <p>Please consider leaving a review for the provider.</p>
            `
          },
          push: {
            title: 'Service Completed',
            body: `Your service with ${provider.name} has been completed. Please leave a review!`
          }
        }
      }
    };

    const notification = notifications[type];
    if (!notification) {
      console.error('Unknown notification type:', type);
      return false;
    }

    // Send customer notifications
    if (notification.customer) {
      if (notification.customer.email) {
        await sendEmail(
          customer.email,
          notification.customer.email.subject,
          notification.customer.email.body
        );
      }
      if (notification.customer.push) {
        await sendPushNotification(
          customer._id,
          notification.customer.push.title,
          notification.customer.push.body,
          { type, bookingId: booking._id }
        );
      }
    }

    // Send provider notifications
    if (notification.provider) {
      if (notification.provider.email) {
        await sendEmail(
          provider.email,
          notification.provider.email.subject,
          notification.provider.email.body
        );
      }
      if (notification.provider.push) {
        await sendPushNotification(
          provider._id,
          notification.provider.push.title,
          notification.provider.push.body,
          { type, bookingId: booking._id }
        );
      }
    }

    return true;
  } catch (error) {
    console.error('Error sending booking notification:', error);
    return false;
  }
};

// Send review notification
const sendReviewNotification = async (review, customer, provider) => {
  try {
    // Email to provider
    await sendEmail(
      provider.email,
      'New Review Received',
      `
        <h2>New Review Received</h2>
        <p>You have received a new review:</p>
        <ul>
          <li><strong>Customer:</strong> ${customer.name || customer.email}</li>
          <li><strong>Rating:</strong> ${review.rating}/5 stars</li>
          ${review.comment ? `<li><strong>Comment:</strong> ${review.comment}</li>` : ''}
        </ul>
        <p>Thank you for providing excellent service!</p>
      `
    );

    // Push notification to provider
    await sendPushNotification(
      provider._id,
      'New Review',
      `${customer.name || 'A customer'} left you a ${review.rating}-star review!`,
      { type: 'review', reviewId: review._id }
    );

    return true;
  } catch (error) {
    console.error('Error sending review notification:', error);
    return false;
  }
};

// Send chat notification
const sendChatNotification = async (message, sender, recipient) => {
  try {
    // Push notification to recipient
    await sendPushNotification(
      recipient._id,
      `New message from ${sender.name || sender.email}`,
      message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
      { type: 'chat', chatId: message.chatId }
    );

    return true;
  } catch (error) {
    console.error('Error sending chat notification:', error);
    return false;
  }
};

module.exports = {
  sendPushNotification,
  sendBookingNotification,
  sendReviewNotification,
  sendChatNotification
};

