export const validateRequired = (value: string | null | undefined, fieldName: string): string | null => {
    if (!value || value.trim() === '') {
        return `${fieldName} est requis`;
    }
    return null;
};

export const validateMinLength = (value: string | null | undefined, minLength: number, fieldName: string): string | null => {
    if (!value || value.trim() === '') {
        return `${fieldName} est requis`;
    }
    if (value.length < minLength) {
        return `${fieldName} doit faire au moins ${minLength} caractères`;
    }
    return null;
};

export const validateEmail = (email: string | null | undefined): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.trim() === '') {
        return 'L\'email est requis';
    }
    if (!emailRegex.test(email)) {
        return 'L\'email n\'est pas valide';
    }
    return null;
};

export const validateYear = (year: number | null | undefined): string | null => {
    const currentYear = new Date().getFullYear();
    if (year === null || year === undefined || Number.isNaN(year)) {
        return 'L\'année de formation est requise';
    }
    if (year > currentYear) {
        return 'L\'année de formation ne doit pas être dans le futur';
    }
    return null;
};
