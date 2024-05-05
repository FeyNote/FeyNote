# Blocknote

This library should remain as one of the lowest (if not the lowest) libraries in our dependency chain. It should not import any other lib, since it's required from the Prisma lib.

We should also avoid storing React, or much here at all -- The hope is to have this lib serve as only the custom schema/type source since both the frontend and the backend need those.
