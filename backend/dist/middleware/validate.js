"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
function validate(schemas) {
    return (req, res, next) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            if (schemas.query) {
                req.query = schemas.query.parse(req.query);
            }
            if (schemas.params) {
                req.params = schemas.params.parse(req.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
                return res.status(400).json({ message: messages.join('; ') });
            }
            return res.status(400).json({ message: 'Validation failed' });
        }
    };
}
//# sourceMappingURL=validate.js.map