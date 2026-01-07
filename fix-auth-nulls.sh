#!/bin/bash

# Fix auth.controller.ts null assertions
sed -i 's/\(if (user\)\.\(otpHash\)/\1!.\2/g' src/auth/auth.controller.ts
sed -i 's/\(user\)\.\(otpExpiresAt\) </\1!.\2 </g' src/auth/auth.controller.ts
sed -i 's/\(user\)\.\(otpVerified\)/\1!.\2/g' src/auth/auth.controller.ts
sed -i 's/\(where: { id: user\)\.\(id\)/\1!.\2/g' src/auth/auth.controller.ts
sed -i 's/\(user\)\.\(email\),/\1!.\2,/g' src/auth/auth.controller.ts
sed -i 's/\(compare([^,]*, user\)\.\(password\)/\1!.\2/g' src/auth/auth.controller.ts
sed -i 's/\(otpVerified,\)/otpHash,/g' src/auth/auth.controller.ts

# Fix auth.middleware.ts - add Promise<void> return type
sed -i 's/async (\s*$/async (/' src/auth/auth.middleware.ts
sed -i 's/) =>/): Promise<void> =>/' src/auth/auth.middleware.ts

echo "Done! Fixed null assertions in auth.controller.ts and return type in auth.middleware.ts"
