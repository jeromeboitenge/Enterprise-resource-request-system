

export const buildFilter = (params: Record<string, any>): Record<string, any> => {
    const filter: Record<string, any> = {};

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            filter[key] = value;
        }
    });

    return filter;
};

export const buildDateRangeFilter = (
    startDate?: string | Date,
    endDate?: string | Date,
    fieldName: string = 'createdAt'
): Record<string, any> => {
    const filter: Record<string, any> = {};

    if (startDate || endDate) {
        filter[fieldName] = {};
        if (startDate) {
            filter[fieldName].$gte = new Date(startDate);
        }
        if (endDate) {
            filter[fieldName].$lte = new Date(endDate);
        }
    }

    return filter;
};

export const buildSearchFilter = (
    searchTerm: string,
    fields: string[]
): Record<string, any> => {
    if (!searchTerm || fields.length === 0) {
        return {};
    }

    return {
        $or: fields.map(field => ({
            [field]: { $regex: searchTerm, $options: 'i' }
        }))
    };
};

export const buildPaginationOptions = (
    page: number = 1,
    limit: number = 10
): { skip: number; limit: number } => {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100);

    return {
        skip: (validPage - 1) * validLimit,
        limit: validLimit
    };
};

export const buildSortOptions = (
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
): Record<string, 1 | -1> => {
    return {
        [sortBy]: sortOrder === 'asc' ? 1 : -1
    };
};

export const mergeFilters = (...filters: Record<string, any>[]): Record<string, any> => {
    return Object.assign({}, ...filters);
};

export const getAdminFallback = async (prisma: any) => {
    return await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { name: true }
    });
};

export const attachAdminAsManager = (items: any[], admin: { name: string } | null) => {
    if (!admin) return items;

    return items.map(item => {
        if (item.department && (!item.department.managers || item.department.managers.length === 0)) {
            return {
                ...item,
                department: {
                    ...item.department,
                    managers: [{ user: { name: admin.name } }]
                }
            };
        }
        return item;
    });
};

export const getRequestInclude = (includeUser = true, includeDepartment = true) => {
    const include: any = {};

    if (includeUser) {
        include.user = {
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        };
    }

    if (includeDepartment) {
        include.department = {
            select: {
                id: true,
                name: true,
                code: true,
                managers: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        };
    }

    return include;
};

export const getApprovalInclude = () => ({
    approver: {
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    },
    request: {
        select: {
            id: true,
            title: true,
            resourceName: true,
            status: true
        }
    }
});

export const getPaymentInclude = () => ({
    financeOfficer: {
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    },
    request: {
        select: {
            id: true,
            title: true,
            resourceName: true,
            estimatedCost: true,
            status: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    }
});

