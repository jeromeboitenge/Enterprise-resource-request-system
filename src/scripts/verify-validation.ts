
import Joi from 'joi';
import { updateRequestSchema, createRequestSchema } from '../schema/request.validation';

const validate = (schema: Joi.ObjectSchema, payload: any, name: string) => {
    const { error } = schema.validate(payload);
    if (error) {
        console.log(`❌ ${name} FAILED:`, error.message);
        return false;
    } else {
        console.log(`✅ ${name} PASSED`);
        return true;
    }
};

async function main() {
    console.log('--- Verifying Validation Schemas ---');

    const partialUpdatePayload = {
        description: "Just updating the description"
    };

    console.log('\n[Test 1] Testing Partial Update with CreatedRequestSchema (EXPECT FAIL)');
    // This represents the BUG we are fixing
    const r1 = validate(createRequestSchema, partialUpdatePayload, 'CreateSchema');

    console.log('\n[Test 2] Testing Partial Update with UpdateRequestSchema (EXPECT PASS)');
    // This represents the FIX
    const r2 = validate(updateRequestSchema, partialUpdatePayload, 'UpdateSchema');

    if (!r1 && r2) {
        console.log('\n✅ SUCCESS: UpdateSchema accepts partial updates while CreateSchema (correctly) rejected them.');
    } else {
        console.error('\n❌ FAILURE: Validation behavior is not as expected.');
        process.exit(1);
    }
}

main().catch(console.error);
