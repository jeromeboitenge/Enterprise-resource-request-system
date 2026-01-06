import prisma from '../lib/prisma';
import { RequestStatus } from '../types/request.interface';

async function verifyFlow() {
    console.log('--- Verifying Approval Flow ---');

    console.log('1. User creates request (Status: Submitted)');
    // Initial state simulation
    const request = {
        id: 'mock-req-1',
        status: RequestStatus.Submitted
    };
    console.log('Current Status:', request.status);

    console.log('2. Manager Approved');
    // Manager action simulation
    if (request.status === RequestStatus.Submitted) {
        request.status = RequestStatus.ManagerApproved;
    }
    console.log('Current Status:', request.status);

    console.log('3. Boss/Admin Approved');
    // Boss action simulation
    if (request.status === RequestStatus.ManagerApproved) {
        request.status = RequestStatus.Approved;
    }
    console.log('Current Status:', request.status);

    console.log('4. Finance Checks for Payment');
    // Finance action simulation
    if (request.status === RequestStatus.Approved) {
        console.log('Finance sees request available for payment.');
        request.status = RequestStatus.Funded;
        console.log('Payment Processed. Final Status:', request.status);
    } else {
        console.error('Finance CANNOT see request.');
    }

    console.log('--- Flow Verified ---');
}

verifyFlow().catch(console.error);
