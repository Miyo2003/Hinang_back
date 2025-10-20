// middleware/validationMiddleware.js
const Joi = require('joi');
const { ValidationError } = require('../utils/errorTypes');

/**
 * Generic validation middleware using Joi
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const data = req[source];
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    const errors = error.details.map(d => ({ param: d.path.join('.'), message: d.message }));
    return next(new ValidationError('Validation failed', errors));
  }
  next();
};

/**
 * Reusable Joi schemas for common fields/entities
 */
const idSchema = Joi.string().required().messages({
  'string.base': 'ID must be a string',
  'any.required': 'ID cannot be empty'
});

const userIdSchema = Joi.object({ userId: idSchema });

const jobIdSchema = Joi.object({ jobId: idSchema });

const workerIdSchema = Joi.object({ workerId: idSchema });

const applicationIdSchema = Joi.object({ id: idSchema });

const emailSchema = Joi.string().email().required().messages({
  'string.email': 'Invalid email format'
});

const passwordSchema = Joi.string().min(8).required()
  .pattern(/[a-z]/).message('Password must contain at least one lowercase letter')
  .pattern(/[A-Z]/).message('Password must contain at least one uppercase letter')
  .pattern(/\d/).message('Password must contain at least one number');

const roleSchema = Joi.string().valid('worker', 'client', 'admin').required().messages({
  'any.only': 'Invalid role'
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().optional(),
  order: Joi.string().valid('asc', 'desc').optional()
});

const applicationSchema = Joi.object({
  jobId: Joi.string().required().messages({ 'any.required': 'Job ID is required and must be a string' }),
  coverLetter: Joi.string().min(50).max(2000).optional().messages({
    'string.base': 'Cover letter must be a string',
    'string.min': 'Cover letter must be at least 50 characters',
    'string.max': 'Cover letter must not exceed 2000 characters'
  }),
  attachments: Joi.array().items(Joi.string().uri()).optional().messages({
    'array.base': 'Attachments must be an array',
    'string.uri': 'All attachments must be valid URLs'
  }),
  proposedRate: Joi.object({
    amount: Joi.number().min(0).optional().messages({ 'number.min': 'Proposed rate amount must be a positive number' }),
    currency: Joi.string().length(3).optional().messages({
      'string.base': 'Currency must be a string',
      'string.length': 'Currency must be a 3-letter code'
    }),
    period: Joi.string().valid('hourly', 'daily', 'weekly', 'monthly', 'yearly').optional().messages({
      'any.only': 'Invalid rate period'
    })
  }).optional()
});

const applicationStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'accepted', 'rejected', 'withdrawn').required().messages({
    'any.only': 'Invalid application status'
  })
});

const jobSchema = Joi.object({
  jobName: Joi.string().min(5).max(100).required().messages({
    'string.base': 'Job name must be a string',
    'string.min': 'Job name must be at least 5 characters',
    'string.max': 'Job name must not exceed 100 characters',
    'any.required': 'Job name is required'
  }),
  jobDescription: Joi.string().min(50).max(5000).required().messages({
    'string.base': 'Job description must be a string',
    'string.min': 'Job description must be at least 50 characters',
    'string.max': 'Job description must not exceed 5000 characters',
    'any.required': 'Job description is required'
  }),
  jobType: Joi.string().valid('full-time', 'part-time', 'contract', 'freelance', 'internship').required().messages({
    'any.only': 'Invalid job type',
    'any.required': 'Job type is required'
  }),
  jobArea: Joi.string().required().messages({
    'string.base': 'Job area must be a string',
    'any.required': 'Job area is required'
  }),
  jobMedia: Joi.array().items(Joi.string().uri()).optional().messages({
    'array.base': 'Job media must be an array',
    'string.uri': 'All media items must be valid URLs'
  }),
  jobDuration: Joi.string().optional().messages({
    'string.base': 'Job duration must be a string'
  }),
  salary: Joi.object({
    min: Joi.number().min(0).optional().messages({ 'number.min': 'Minimum salary must be a positive number' }),
    max: Joi.number().min(0).optional().custom((value, helpers) => {
      if (value < helpers.state.ancestors[0].min) {
        return helpers.error('any.invalid');
      }
      return value;
    }).messages({
      'number.min': 'Maximum salary must be a positive number',
      'any.invalid': 'Maximum salary must be greater than minimum salary'
    }),
    currency: Joi.string().length(3).optional().messages({
      'string.base': 'Salary currency must be a string',
      'string.length': 'Currency must be a 3-letter code'
    }),
    period: Joi.string().valid('hourly', 'daily', 'weekly', 'monthly', 'yearly').optional().messages({
      'any.only': 'Invalid salary period'
    })
  }).optional(),
  requirements: Joi.array().items(Joi.string().trim().min(1)).optional().messages({
    'array.base': 'Requirements must be an array',
    'string.base': 'All requirements must be strings',
    'string.empty': 'Requirements cannot be empty strings'
  }),
  benefits: Joi.array().items(Joi.string().trim().min(1)).optional().messages({
    'array.base': 'Benefits must be an array',
    'string.base': 'All benefits must be strings',
    'string.empty': 'Benefits cannot be empty strings'
  }),
  status: Joi.string().valid('draft', 'open', 'closed', 'cancelled').optional().messages({
    'any.only': 'Invalid job status'
  })
});

const budgetSchema = Joi.number().min(0).optional().messages({
  'number.min': 'Budget must be a positive number'
});

const statusSchema = Joi.string().valid('pending', 'accepted', 'rejected').required().messages({
  'any.only': 'Invalid application status'
});

const reviewSchema = Joi.object({
  reviewerId: Joi.string().required().messages({
    'string.base': 'Reviewer ID must be a string',
    'any.required': 'Reviewer ID is required'
  }),
  userId: Joi.string().required().messages({
    'string.base': 'User ID must be a string',
    'any.required': 'User ID is required'
  }),
  jobId: Joi.string().required().messages({
    'string.base': 'Job ID must be a string',
    'any.required': 'Job ID is required'
  }),
  rating: Joi.number().min(1).max(5).required().messages({
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating must be at most 5'
  }),
  comment: Joi.string().max(1000).optional().messages({
    'string.base': 'Comment must be a string',
    'string.max': 'Comment must not exceed 1000 characters'
  })
});

const amountSchema = Joi.number().min(0.01).required().messages({
  'number.min': 'Amount must be greater than 0'
});

const transactionTypeSchema = Joi.string().valid('deposit', 'withdrawal', 'transfer').required().messages({
  'any.only': 'Invalid transaction type'
});

const paymentStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'completed', 'failed', 'refunded').required().messages({
    'any.only': 'Invalid payment status'
  })
});

const paymentSchema = Joi.object({
  jobId: Joi.string().required().messages({
    'string.base': 'Job ID must be a string',
    'any.required': 'Job ID is required'
  }),
  clientId: Joi.string().required().messages({
    'string.base': 'Client ID must be a string',
    'any.required': 'Client ID is required'
  }),
  workerId: Joi.string().required().messages({
    'string.base': 'Worker ID must be a string',
    'any.required': 'Worker ID is required'
  }),
  amount: Joi.number().min(0.01).required().messages({
    'number.min': 'Amount must be greater than 0',
    'any.required': 'Amount is required'
  }),
  method: Joi.string().valid('credit_card', 'bank_transfer', 'paypal', 'wallet').required().messages({
    'any.only': 'Invalid payment method'
  }),
  status: Joi.string().valid('pending', 'processing', 'completed', 'failed', 'refunded').default('pending').messages({
    'any.only': 'Invalid payment status'
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Description must not exceed 500 characters'
  })
});

const escrowPaymentSchema = Joi.object({
  jobId: Joi.string().required().messages({
    'string.base': 'Job ID must be a string',
    'any.required': 'Job ID is required'
  }),
  amount: Joi.number().min(0.01).required().messages({
    'number.min': 'Amount must be greater than 0'
  }),
  currency: Joi.string().length(3).required().messages({
    'string.length': 'Currency must be a 3-letter code'
  })
});

// Custom validators as Joi custom functions
const customValidators = {
  isDate: (value, helpers) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return helpers.error('any.invalid');
    }
    return value;
  },
  isPositiveNumber: (value, helpers) => {
    if (value <= 0) {
      return helpers.error('any.invalid');
    }
    return value;
  },
  isValidFileType: (value, helpers) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }
};

// Export validation middleware
const validateRequest = validate; // Alias for backward compatibility if needed

module.exports = {
  validate,
  validateRequest,
  jobSchema,
  applicationSchema,
  paymentSchema,
  escrowPaymentSchema,
  reviewSchema,
  // Export individual field schemas if needed
  idSchema,
  userIdSchema,
  jobIdSchema,
  workerIdSchema,
  applicationIdSchema,
  emailSchema,
  passwordSchema,
  roleSchema,
  paginationSchema,
  applicationStatusSchema,
  budgetSchema,
  statusSchema,
  amountSchema,
  transactionTypeSchema,
  paymentStatusSchema,
  customValidators
};