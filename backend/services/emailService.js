const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const logger = require('../utils/logger');

/**
 * Email service for sending various types of emails
 */
class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Load email templates
        this.templates = {
            welcome: this.loadTemplate('welcome'),
            passwordReset: this.loadTemplate('passwordReset'),
            alert: this.loadTemplate('alert'),
            threatZone: this.loadTemplate('threatZone')
        };
    }

    /**
     * Load email template from file
     * @param {string} templateName - Name of the template file without extension
     * @returns {function} - Compiled Handlebars template function
     */
    loadTemplate(templateName) {
        try {
            const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${templateName}.html`);
            const templateSource = fs.readFileSync(templatePath, 'utf8');
            return handlebars.compile(templateSource);
        } catch (err) {
            logger.error(`Error loading email template '${templateName}': ${err.message}`);
            // Return a simple template as fallback
            return handlebars.compile('<h1>{{title}}</h1><p>{{message}}</p>');
        }
    }

    /**
     * Send email
     * @param {Object} options - Email options
     * @param {string} options.email - Recipient email address
     * @param {string} options.subject - Email subject
     * @param {string} options.template - Template name
     * @param {Object} options.data - Data for the template
     * @returns {Promise} - Email sending result
     */
    async sendEmail(options) {
        try {
            // Get template function
            const template = this.templates[options.template] || this.templates.default;

            // Generate HTML content
            const htmlContent = template(options.data || {});

            // Set up email options
            const mailOptions = {
                from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
                to: options.email,
                subject: options.subject,
                html: htmlContent
            };

            // Send email
            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent: ${info.messageId}`);
            return info;
        } catch (err) {
            logger.error(`Error sending email: ${err.message}`);
            throw err;
        }
    }

    /**
     * Send alert notification email
     * @param {Object} user - User to send email to
     * @param {Object} alert - Alert data
     * @returns {Promise} - Email sending result
     */
    async sendAlertEmail(user, alert) {
        try {
            return await this.sendEmail({
                email: user.email,
                subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
                template: 'alert',
                data: {
                    name: user.name,
                    alert: {
                        title: alert.title,
                        message: alert.message,
                        severity: alert.severity,
                        timestamp: alert.createdAt,
                        location: alert.location?.name || 'Unknown location',
                        actions: alert.actions || []
                    }
                }
            });
        } catch (err) {
            logger.error(`Error sending alert email: ${err.message}`);
        }
    }

    /**
     * Send threat zone notification email
     * @param {Object} user - User to send email to
     * @param {Object} threatZone - Threat zone data
     * @param {Object} location - Location data
     * @returns {Promise} - Email sending result
     */
    async sendThreatZoneEmail(user, threatZone, location) {
        try {
            return await this.sendEmail({
                email: user.email,
                subject: `Threat Zone Update: ${threatZone.prediction.level.toUpperCase()} level at ${location.name}`,
                template: 'threatZone',
                data: {
                    name: user.name,
                    threatZone: {
                        level: threatZone.prediction.level,
                        location: location.name,
                        timestamp: threatZone.timestamp
                    }
                }
            });
        } catch (err) {
            logger.error(`Error sending threat zone email: ${err.message}`);
        }
    }
}

module.exports = new EmailService();
