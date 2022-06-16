import bcrypt from 'bcrypt'

export const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt);
}


export const comparePasswords = async (savedPassword, receivedPassword) => {
    return await bcrypt.compare(savedPassword, receivedPassword)
}