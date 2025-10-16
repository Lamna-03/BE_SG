import jwt, {Secret, SignOptions} from 'jsonwebtoken';

const JWT_SECRET: Secret =
    typeof process.env.JWT_SECRET === 'string' && process.env.JWT_SECRET.length > 0 ? process.env.JWT_SECRET: 'default_secret';

const JWT_EXPIRES_IN: string | number = 
    typeof process.env.JWT_EXPIRES_IN === 'string' && process.env.JWT_EXPIRES_IN.length > 0 ? process.env.JWT_EXPIRES_IN: '1d';

export const generateJwt = (payload: object,) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        algorithm: 'HS256',
    } as SignOptions);
};

export const verifyJwt = (token: string) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
};
