const axios = require('axios');

const ABSTRACT_API_KEY = process.env.ABSTRACT_API_KEY; // Add this to your .env file
const API_URL = 'https://emailreputation.abstractapi.com/v1';

class EmailVerificationService {
    async verifyEmail(email) {
        try {
            const response = await axios.get(API_URL, {
                params: {
                    api_key: ABSTRACT_API_KEY,
                    email: email
                }
            });

            const data = response.data;

            // Create a comprehensive verification result
            return {
                isValid: data.email_deliverability.status === 'deliverable',
                details: {
                    deliverability: {
                        status: data.email_deliverability.status,
                        isFormatValid: data.email_deliverability.is_format_valid,
                        isSmtpValid: data.email_deliverability.is_smtp_valid,
                        isMxValid: data.email_deliverability.is_mx_valid
                    },
                    quality: {
                        score: parseFloat(data.email_quality.score),
                        isFreeEmail: data.email_quality.is_free_email,
                        isDisposable: data.email_quality.is_disposable,
                        isCatchall: data.email_quality.is_catchall,
                        isDmarcEnforced: data.email_quality.is_dmarc_enforced
                    },
                    risk: {
                        addressStatus: data.email_risk.address_risk_status,
                        domainStatus: data.email_risk.domain_risk_status
                    },
                    breaches: {
                        total: data.email_breaches.total_breaches,
                        lastBreached: data.email_breaches.date_last_breached
                    }
                },
                rawResponse: data
            };
        } catch (error) {
            console.error('Email verification error:', error.response?.data || error.message);
            throw new Error('Failed to verify email');
        }
    }

    isEmailSafe(verificationResult) {
        // Define safety criteria
        const safetyChecks = {
            isDeliverable: verificationResult.isValid,
            hasGoodQuality: verificationResult.details.quality.score >= 0.7,
            isNotDisposable: !verificationResult.details.quality.isDisposable,
            hasLowRisk: verificationResult.details.risk.addressStatus === 'low' && 
                       verificationResult.details.risk.domainStatus === 'low',
            noBreaches: verificationResult.details.breaches.total === 0
        };

        // Email must pass all safety checks
        return Object.values(safetyChecks).every(check => check);
    }
}

module.exports = new EmailVerificationService();