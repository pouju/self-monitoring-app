import { executeQuery } from "../database/database.js";
import { bcrypt } from '../deps.js';

// service for registration and login

const registerUser = async(email, password) => {

    const existingUsers = await executeQuery("SELECT * FROM users WHERE email = $1", email);
    if (existingUsers?.rows?.length > 0) {
        return [false, 'The email is already reserved.'];
    }

    const hash = await bcrypt.hash(password);
    await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2);", email, hash);
    return [true, 'Registration successful!'];

}

const loginUser = async(email, password, state) => {

    const checkUserExists = await executeQuery("SELECT * FROM users WHERE email = $1;", email);
    if (checkUserExists?.rows?.length === 0) {
        return [false, "Invalid email or password"];
    }

    const userObj = checkUserExists.rows[0];

    const hash = userObj.password;

    const passwordCorrect = await bcrypt.compare(password, hash);
    if (!passwordCorrect) {
        return [false, "Invalid email or password"];
    }

    await state.session.set('authenticated', true);
    await state.session.set('user', {
        id: userObj.id,
        email: userObj.email
    });
    return [true, 'Authentication successful!'];
}

export { registerUser, loginUser };
