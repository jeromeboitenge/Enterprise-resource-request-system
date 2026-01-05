import { Request, Response, NextFunction } from 'express';
import ResourceRequest from '../model/request';

/**
 * ============================================
 * CREATE NEW REQUEST
 * ============================================
 * 
 * This function creates a new resource request.
 * User must be authenticated.
 * 
 * Steps:
 * 1. Get request data from request body
 * 2. Create request in database
 * 3. Load related data (user and department info)
 * 4. Send response with created request
 */
export const createRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Get request data from body
        const {
            title,
            resourceName,
            resourceType,
            description,
            quantity,
            estimatedCost,
            priority,
            departmentId
        } = req.body;

        // Step 2: Create request in database
        const request = await ResourceRequest.create({
            userId: req.user._id, // Get user ID from authenticated user
            departmentId,
            title,
            resourceName,
            resourceType,
            description,
            quantity,
            estimatedCost,
            priority,
            status: 'draft' // New requests start as draft
        });

        // Step 3: Load related data (populate user and department)
        await request.populate('userId', 'name email role');
        await request.populate('departmentId', 'name code');

        // Step 4: Send success response
        res.status(201).json({
            success: true,
            message: 'Request created successfully',
            data: { request }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * GET MY REQUESTS
 * ============================================
 * 
 * This function gets all requests created by the current user.
 * User can optionally filter by status.
 * 
 * Steps:
 * 1. Build filter based on user ID and optional status
 * 2. Find requests in database
 * 3. Send response with requests
 */
export const getMyRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Build filter object
        const filter: any = { userId: req.user._id };

        // Add status filter if provided in query
        if (req.query.status) {
            filter.status = req.query.status;
        }

        // Step 2: Find requests and populate related data
        const requests = await ResourceRequest.find(filter)
            .populate('userId', 'name email role')
            .populate('departmentId', 'name code')
            .sort({ createdAt: -1 }); // Newest first

        // Step 3: Send response
        res.status(200).json({
            success: true,
            message: 'Requests retrieved successfully',
            data: {
                count: requests.length,
                requests
            }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * GET ALL REQUESTS
 * ============================================
 * 
 * This function gets all requests (for managers, finance, and admin).
 * Can filter by status and department.
 * 
 * Steps:
 * 1. Build filter based on query parameters
 * 2. Find requests in database
 * 3. Send response with requests
 */
export const getAllRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Build filter object
        const filter: any = {};

        // Add status filter if provided
        if (req.query.status) {
            filter.status = req.query.status;
        }

        // Add department filter if provided
        if (req.query.departmentId) {
            filter.departmentId = req.query.departmentId;
        }

        // Step 2: Find requests and populate related data
        const requests = await ResourceRequest.find(filter)
            .populate('userId', 'name email role department')
            .populate('departmentId', 'name code')
            .sort({ createdAt: -1 }); // Newest first

        // Step 3: Send response
        res.status(200).json({
            success: true,
            message: 'Requests retrieved successfully',
            data: {
                count: requests.length,
                requests
            }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * GET SINGLE REQUEST
 * ============================================
 * 
 * This function gets a single request by ID.
 * User must be the owner or have manager/finance/admin role.
 * 
 * Steps:
 * 1. Find request by ID
 * 2. Check if user has permission to view
 * 3. Send response with request
 */
export const getRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Find request by ID and populate related data
        const request = await ResourceRequest.findById(req.params.id)
            .populate('userId', 'name email role department')
            .populate('departmentId', 'name code');

        // Check if request exists
        if (!request) {
            return res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
        }

        // Step 2: Check if user has permission to view this request
        const requestUserId = typeof request.userId === 'object'
            ? (request.userId as any)._id
            : request.userId;

        const isOwner = requestUserId.toString() === req.user._id.toString();
        const isAuthorized = ['manager', 'departmenthead', 'finance', 'admin'].includes(req.user.role);

        if (!isOwner && !isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this request'
            });
        }

        // Step 3: Send response
        res.status(200).json({
            success: true,
            message: 'Request retrieved successfully',
            data: { request }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * UPDATE REQUEST
 * ============================================
 * 
 * This function updates a request.
 * Only the request owner can update.
 * Can only update if status is 'draft' or 'submitted'.
 * 
 * Steps:
 * 1. Find request by ID
 * 2. Check ownership
 * 3. Check if status allows updates
 * 4. Update request fields
 * 5. Send response with updated request
 */
export const updateRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Get update data from body
        const {
            title,
            resourceName,
            resourceType,
            description,
            quantity,
            estimatedCost,
            priority
        } = req.body;

        // Step 2: Find request by ID
        const request = await ResourceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
        }

        // Step 3: Check if user owns this request
        if (request.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own requests'
            });
        }

        // Step 4: Check if request status allows updates
        const allowedStatuses = ['draft', 'submitted'];
        if (!allowedStatuses.includes(request.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot update request with status: ${request.status}. Only draft or submitted requests can be updated.`
            });
        }

        // Step 5: Update fields if provided
        if (title) request.title = title;
        if (resourceName) request.resourceName = resourceName;
        if (resourceType) request.resourceType = resourceType;
        if (description !== undefined) request.description = description;
        if (quantity) request.quantity = quantity;
        if (estimatedCost) request.estimatedCost = estimatedCost;
        if (priority) request.priority = priority;

        // Save updated request
        await request.save();

        // Populate related data
        await request.populate('userId', 'name email role');
        await request.populate('departmentId', 'name code');

        // Step 6: Send response
        res.status(200).json({
            success: true,
            message: 'Request updated successfully',
            data: { request }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

/**
 * ============================================
 * DELETE REQUEST
 * ============================================
 * 
 * This function deletes a request.
 * Only the request owner can delete.
 * Can only delete if status is 'draft' or 'submitted'.
 * 
 * Steps:
 * 1. Find request by ID
 * 2. Check ownership
 * 3. Check if status allows deletion
 * 4. Delete request
 * 5. Send success response
 */
export const deleteRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Find request by ID
        const request = await ResourceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: `Request not found with ID: ${req.params.id}`
            });
        }

        // Step 2: Check if user owns this request
        if (request.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own requests'
            });
        }

        // Step 3: Check if request status allows deletion
        const allowedStatuses = ['draft', 'submitted'];
        if (!allowedStatuses.includes(request.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete request with status: ${request.status}. Only draft or submitted requests can be deleted.`
            });
        }

        // Step 4: Delete request
        await request.deleteOne();

        // Step 5: Send success response
        res.status(200).json({
            success: true,
            message: 'Request deleted successfully',
            data: { request }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};
