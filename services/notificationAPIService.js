const NotificationAPI = require('notificationapi-node-server-sdk');

class NotificationAPIService {
  constructor() {
    // Initialize with API keys from environment variables
    this.clientId = process.env.NOTIFICATIONAPI_CLIENT_ID;
    this.clientSecret = process.env.NOTIFICATIONAPI_CLIENT_SECRET;
    
    if (!this.clientId || !this.clientSecret) {
      console.error('❌ NotificationAPI credentials missing. Set NOTIFICATIONAPI_CLIENT_ID and NOTIFICATIONAPI_CLIENT_SECRET in .env');
      return;
    }
    
    this.notificationapi = NotificationAPI.default;
    this.notificationapi.init(this.clientId, this.clientSecret);
  }

  async sendNotification(type, to, email = {}, inapp = {}, mobile_push = {}) {
    try {
      const payload = {
        type,
        to: {
          id: to.id,
          email: to.email
        },
        email,
        inapp,
        mobile_push
      };

      const response = await this.notificationapi.send(payload);
      console.log('NotificationAPI response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending NotificationAPI notification:', error);
      throw error;
    }
  }

  // Specific methods for different notification types
  async notifyNewJob(job, workerEmails) {
    // Notify multiple workers about new job
    for (const email of workerEmails) {
      await this.sendNotification(
        'hinang',
        { id: email, email },
        {
          subject: `New Job Available: ${job.jobName}`,
          html: `<p>A new job is available: ${job.jobDescription}</p><p>Location: ${job.jobArea}</p>`
        },
        {
          title: 'New Job Available',
          url: `https://yourapp.com/jobs/${job.id}`,
          image: 'https://example.com/job-image.png'
        },
        {
          title: 'New Job Available',
          message: `Check out this new job: ${job.jobName}`
        }
      );
    }
  }

  async notifyJobApplication(job, clientEmail, workerName) {
    await this.sendNotification(
      'hinang',
      { id: clientEmail, email: clientEmail },
      {
        subject: 'New Application for Your Job',
        html: `<p>${workerName} has applied to your job: ${job.jobName}</p>`
      },
      {
        title: 'New Job Application',
        url: `https://yourapp.com/jobs/${job.id}/applications`,
        image: 'https://example.com/application-image.png'
      },
      {
        title: 'New Application',
        message: `${workerName} applied to your job`
      }
    );
  }

  async notifyAssignment(job, workerEmail, clientName) {
    await this.sendNotification(
      'hinang',
      { id: workerEmail, email: workerEmail },
      {
        subject: 'You Got the Job!',
        html: `<p>Congratulations! ${clientName} has assigned you to the job: ${job.jobName}</p>`
      },
      {
        title: 'Job Assigned',
        url: `https://yourapp.com/jobs/${job.id}`,
        image: 'https://example.com/assigned-image.png'
      },
      {
        title: 'Job Assigned',
        message: `You've been assigned to ${job.jobName}`
      }
    );
  }

  async notifyClientAssignment(job, clientEmail, workerName) {
    await this.sendNotification(
      'hinang',
      { id: clientEmail, email: clientEmail },
      {
        subject: 'Worker Assigned to Your Job',
        html: `<p>${workerName} has been assigned to your job: ${job.jobName}</p>`
      },
      {
        title: 'Worker Assigned',
        url: `https://yourapp.com/jobs/${job.id}`,
        image: 'https://example.com/assigned-image.png'
      },
      {
        title: 'Worker Assigned',
        message: `${workerName} assigned to your job`
      }
    );
  }

  async sendReminder(userEmail, message) {
    await this.sendNotification(
      'hinang',
      { id: userEmail, email: userEmail },
      {
        subject: 'Reminder from Hinang',
        html: `<p>${message}</p>`
      },
      {
        title: 'Reminder',
        url: 'https://yourapp.com/dashboard',
        image: 'https://example.com/reminder-image.png'
      },
      {
        title: 'Reminder',
        message
      }
    );
  }
}

module.exports = new NotificationAPIService();
