// Form validation utilities
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password) => {
    if (password.length < 6) {
        return { valid: false, error: 'Password must be at least 6 characters' };
    }
    return { valid: true, error: '' };
};

export const validateName = (name) => {
    if (name.trim().length < 2) {
        return { valid: false, error: 'Name must be at least 2 characters' };
    }
    return { valid: true, error: '' };
};

export const validateLoginForm = (email, password) => {
    const errors = {};

    if (!email) {
        errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
        errors.email = 'Invalid email format';
    }

    if (!password) {
        errors.password = 'Password is required';
    }

    return { valid: Object.keys(errors).length === 0, errors };
};

export const validateSignupForm = (name, email, password) => {
    const errors = {};

    if (!name) {
        errors.name = 'Name is required';
    } else {
        const nameCheck = validateName(name);
        if (!nameCheck.valid) {
            errors.name = nameCheck.error;
        }
    }

    if (!email) {
        errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
        errors.email = 'Invalid email format';
    }

    if (!password) {
        errors.password = 'Password is required';
    } else {
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.valid) {
            errors.password = passwordCheck.error;
        }
    }

    return { valid: Object.keys(errors).length === 0, errors };
};
