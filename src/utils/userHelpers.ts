

const SENSITIVE_USER_FIELDS = [
    'password',
    'loginAttempts',
    'lockUntil',
    'refreshToken',
    '__v'
] as const;

export const sanitizeUserData = (user: any) => {
    if (!user) return null;

    const userObj = user.toObject ? user.toObject() : { ...user };

    SENSITIVE_USER_FIELDS.forEach(field => {
        delete userObj[field];
    });

    return userObj;
};

export const sanitizeUserArray = (users: any[]) => {
    if (!Array.isArray(users)) return [];
    return users.map(sanitizeUserData).filter(Boolean);
};

export const extractUserFields = (user: any, fields: string[]) => {
    if (!user) return null;

    const userObj = user.toObject ? user.toObject() : user;
    const extracted: any = {};

    fields.forEach(field => {
        if (userObj[field] !== undefined) {
            extracted[field] = userObj[field];
        }
    });

    return extracted;
};

export const formatUserForAuth = (user: any) => {
    return extractUserFields(user, [
        '_id',
        'name',
        'email',
        'role',
        'department',
        'isActive',
        'lastLogin',
        'createdAt',
        'updatedAt'
    ]);
};

export const formatUserForPublic = (user: any) => {
    return extractUserFields(user, [
        '_id',
        'name',
        'email',
        'role'
    ]);
};
