#!/bin/bash

# Script to add non-null assertions after null checks in TypeScript files

# For request.controller.ts - fix 'request' and 'existingRequest' null issues
sed -i 's/\(const isOwner = \)\(request\|existingRequest\)\.\(userId\)/\1\2!.\3/g' src/controllers/request.controller.ts
sed -i 's/\(\s\+\)\(request\|existingRequest\)\.\(departmentId\)/\1\2!.\3/g' src/controllers/request.controller.ts
sed -i 's/\(allowedStatuses\.includes(\)\(existingRequest\)\.\(status\)/\1\2!.\3/g' src/controllers/request.controller.ts
sed -i 's/\(status: \${existingRequest\)\.\(status\)/\1!.\2/g' src/controllers/request.controller.ts
sed -i 's/\(if (existingRequest\)\.\(status\)/\1!.\2/g' src/controllers/request.controller.ts
sed -i 's/\(if (existingRequest\)\.\(userId\)/\1!.\2/g' src/controllers/request.controller.ts

# For approval.controller.ts - fix 'request' null issues
sed -i 's/\(request\)\.\(status\) === RequestStatus/\1!.\2 === RequestStatus/g' src/controllers/approval.controller.ts
sed -i 's/\(\${request\)\.\(status\)/\1!.\2/g' src/controllers/approval.controller.ts
sed -i 's/\(\${request\)\.\(title\)/\1!.\2/g' src/controllers/approval.controller.ts
sed -i 's/\(if (request\)\.\(user\)/\1!.\2/g' src/controllers/approval.controller.ts
sed -i 's/\(sendEmail(request\)\.\(user\.email\)/\1!.\2/g' src/controllers/approval.controller.ts
sed -i 's/\(allowedStatuses\.includes(request\)\.\(status\)/\1!.\2/g' src/controllers/approval.controller.ts

# For payment.controller.ts - fix 'request' null issues  
sed -i 's/\(if (request\)\.\(status\)/\1!.\2/g' src/controllers/payment.controller.ts
sed -i 's/\(Number(request\)\.\(estimatedCost\)/\1!.\2/g' src/controllers/payment.controller.ts

# For auth.controller.ts - fix various null issues
sed -i 's/\(if (user\)\.\(otpHash\)/\1!.\2/g' src/controllers/auth.controller.ts
sed -i 's/\(user\)\.\(otpExpiresAt\) </\1!.\2 </g' src/controllers/auth.controller.ts

echo "Done! Added non-null assertions after null checks."
