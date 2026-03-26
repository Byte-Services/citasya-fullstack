import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { AppDataSource } from '../../data-source.js';
import { User } from '../users/user.model.js';

const opts: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'supersecret',
};

export const jwtStrategy = new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: jwt_payload.sub } });

        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
});
