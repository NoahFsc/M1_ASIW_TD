// Utilitaire pour extraire des messages d'erreur des réponses API
// Ils sont présents dans différents formats selon le type d'erreur (chaîne, objet avec "errors"...)
export function getErrorMessage(error: unknown, defaultMessage: string): string {
    const data = (error as any)?.response?.data;
    if (!data) return defaultMessage;
    
    if (typeof data === 'string') return data;
    if (data.errors) {
        const firstKey = Object.keys(data.errors)[0];
        if (firstKey) return data.errors[firstKey][0];
    }
    return data.message || data.title || defaultMessage;
}
