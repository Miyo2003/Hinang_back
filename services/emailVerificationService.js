const axios = require('axios');

const ZEROBOUNCE_API_KEY = process.env.ZEROBOUNCE_API_KEY; // Add this to your .env file
const API_URL = 'https://api.zerobounce.net/v2/validate';

class EmailVerificationService {
    async verifyEmail(email) {
        try {
            const response = await axios.get(API_URL, {
                params: {
                    api_key: ZEROBOUNCE_API_KEY,
                    email: email
                }
            });

            const data = response.data;

            // Create a comprehensive verification result based on ZeroBounce response
            return {
                isValid: data.status === 'valid',
                details: {
                    deliverability: {
                        status: data.status, // valid, invalid, catch-all, unknown, spamtrap, abuse, do_not_mail
                        isFormatValid: data.status !== 'invalid',
                        isSmtpValid: data.status === 'valid',
                        isMxValid: data.mx_found === 'true'
                    },
                    quality: {
                        score: this._calculateQualityScore(data),
                        isFreeEmail: data.free_email === 'true',
                        isDisposable: data.disposable === 'true',
                        isCatchall: data.status === 'catch-all',
                        isDmarcEnforced: data.dmarc === 'pass'
                    },
                    risk: {
                        addressStatus: this._mapRiskStatus(data.status),
                        domainStatus: this._mapRiskStatus(data.status)
                    },
                    breaches: {
                        total: 0, // ZeroBounce doesn't provide breach data
                        lastBreached: null
                    }
                },
                rawResponse: data
            };
        } catch (error) {
            console.error('Email verification error:', error.response?.data || error.message);
            throw new Error('Failed to verify email');
        }
    }

    _calculateQualityScore(data) {
        // Calculate a quality score based on ZeroBounce data
        let score = 0;
        if (data.status === 'valid') score += 0.8;
        if (data.mx_found === 'true') score += 0.1;
        if (data.smtp_provider) score += 0.1;
        if (data.dmarc === 'pass') score += 0.1;
        if (data.free_email === 'false') score += 0.1;
        if (data.disposable === 'false') score += 0.1;
        return Math.min(score, 1.0);
    }

    _mapRiskStatus(status) {
        switch (status) {
            case 'valid':
                return 'low';
            case 'invalid':
            case 'spamtrap':
            case 'abuse':
            case 'do_not_mail':
                return 'high';
            case 'catch-all':
            case 'unknown':
            default:
                return 'medium';
        }
    }

    isEmailSafe(verificationResult) {
        // Define safety criteria based on ZeroBounce data
        const safetyChecks = {
            isDeliverable: verificationResult.isValid,
            hasGoodQuality: verificationResult.details.quality.score >= 0.7,
            isNotDisposable: !verificationResult.details.quality.isDisposable,
            hasLowRisk: verificationResult.details.risk.addressStatus === 'low' &&
                       verificationResult.details.risk.domainStatus === 'low',
            noBreaches: true // ZeroBounce doesn't check breaches, assume safe
        };

        // Email must pass all safety checks
        return Object.values(safetyChecks).every(check => check);
    }
}

module.exports = new EmailVerificationService();